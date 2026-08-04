interface Env {
  DB?: any;
}

interface EventContext {
  request: Request;
  env: Env;
  params: {
    path?: string[];
  };
}

// Simple in-memory fallback for local dev / non-D1 environments
const mockStore: Record<string, any[]> = {};

function jsonResponse(data: any, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      ...headers
    }
  });
}

function parseCookie(cookieHeader: string | null): Record<string, string> {
  const list: Record<string, string> = {};
  if (!cookieHeader) return list;
  cookieHeader.split(';').forEach(cookie => {
    const parts = cookie.split('=');
    list[parts.shift()!.trim()] = decodeURI(parts.join('='));
  });
  return list;
}

export async function onRequest(context: EventContext): Promise<Response> {
  const { request, env, params } = context;
  const url = new URL(request.url);
  const pathParts = params.path || url.pathname.replace(/^\/api\/?/, '').split('/').filter(Boolean);

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
  }

  const section = pathParts[0]; // 'auth' or 'data'
  const action = pathParts[1];  // e.g. 'login', 'session', or collection name like 'accounts'
  const id = pathParts[2];      // record ID if updating or deleting

  // -------------------------------------------------------------
  // Authentication Endpoints (/api/auth/*)
  // -------------------------------------------------------------
  if (section === 'auth') {
    if (action === 'login' && request.method === 'POST') {
      try {
        const body = await request.json() as { email?: string; password?: string };
        const email = body.email || 'admin@workflowzeroit.com';
        const user = {
          uid: 'cf_user_' + btoa(email).substring(0, 10),
          email,
          displayName: email.split('@')[0] || 'User'
        };

        const cookieValue = `wfz_session=${encodeURIComponent(JSON.stringify(user))}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`;
        return jsonResponse({ user }, 200, { 'Set-Cookie': cookieValue });
      } catch (err: any) {
        return jsonResponse({ error: err.message || 'Invalid login request' }, 400);
      }
    }

    if (action === 'logout' && request.method === 'POST') {
      const cookieValue = `wfz_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
      return jsonResponse({ ok: true }, 200, { 'Set-Cookie': cookieValue });
    }

    if (action === 'session' && request.method === 'GET') {
      const cookies = parseCookie(request.headers.get('Cookie'));
      if (cookies['wfz_session']) {
        try {
          const user = JSON.parse(decodeURIComponent(cookies['wfz_session']));
          return jsonResponse({ user });
        } catch {
          // invalid cookie
        }
      }
      // Default initial admin session for demo/dev access
      const defaultUser = {
        uid: 'cf_admin_default',
        email: 'admin@workflowzeroit.com',
        displayName: 'Admin'
      };
      return jsonResponse({ user: defaultUser });
    }

    return jsonResponse({ error: 'Auth endpoint not found' }, 404);
  }

  // -------------------------------------------------------------
  // Data Endpoints (/api/data/:collection)
  // -------------------------------------------------------------
  if (section === 'data') {
    const collection = action;
    if (!collection) {
      return jsonResponse({ error: 'Collection name required' }, 400);
    }

    // Standardize database table name
    const tableName = collection.replace(/([A-Z])/g, '_$1').toLowerCase();

    // 1. Cloudflare D1 Execution path
    if (env && env.DB) {
      try {
        if (request.method === 'GET') {
          const stmt = env.DB.prepare(`SELECT * FROM ${tableName} ORDER BY createdAt DESC`);
          const { results } = await stmt.all();
          const records = (results || []).map((row: any) => {
            try {
              return JSON.parse(row.data);
            } catch {
              return { id: row.id, createdAt: row.createdAt };
            }
          });
          return jsonResponse(records);
        }

        if (request.method === 'POST') {
          const payload = await request.json() as any;
          const recordId = payload.id || 'rec_' + Math.random().toString(36).substring(2, 9);
          const createdAt = payload.createdAt || payload.timestamp || new Date().toISOString();
          const record = { ...payload, id: recordId, createdAt };
          const dataJson = JSON.stringify(record);

          await env.DB.prepare(
            `INSERT INTO ${tableName} (id, data, createdAt) VALUES (?, ?, ?)`
          ).bind(recordId, dataJson, createdAt).run();

          return jsonResponse(record, 201);
        }

        if (request.method === 'PUT' && id) {
          const updates = await request.json() as any;
          // Fetch existing record first
          const existingRow = await env.DB.prepare(`SELECT data FROM ${tableName} WHERE id = ?`).bind(id).first();
          let currentData = {};
          if (existingRow && existingRow.data) {
            try { currentData = JSON.parse(existingRow.data as string); } catch {}
          }
          const updatedRecord = { ...currentData, ...updates, id };
          await env.DB.prepare(
            `UPDATE ${tableName} SET data = ? WHERE id = ?`
          ).bind(JSON.stringify(updatedRecord), id).run();

          return jsonResponse(updatedRecord);
        }

        if (request.method === 'DELETE' && id) {
          await env.DB.prepare(`DELETE FROM ${tableName} WHERE id = ?`).bind(id).run();
          return jsonResponse({ success: true, id });
        }
      } catch (dbErr: any) {
        // Fallback to in-memory if table doesn't exist yet on D1
        console.warn(`D1 query for ${tableName} failed:`, dbErr);
      }
    }

    // 2. In-Memory / Local Dev Fallback path
    if (!mockStore[collection]) {
      mockStore[collection] = [];
    }

    if (request.method === 'GET') {
      return jsonResponse(mockStore[collection]);
    }

    if (request.method === 'POST') {
      const payload = await request.json() as any;
      const recordId = payload.id || 'rec_' + Math.random().toString(36).substring(2, 9);
      const createdAt = payload.createdAt || payload.timestamp || new Date().toISOString();
      const record = { ...payload, id: recordId, createdAt };
      mockStore[collection].push(record);
      return jsonResponse(record, 201);
    }

    if (request.method === 'PUT' && id) {
      const updates = await request.json() as any;
      const index = mockStore[collection].findIndex((item: any) => item.id === id);
      if (index !== -1) {
        mockStore[collection][index] = { ...mockStore[collection][index], ...updates };
        return jsonResponse(mockStore[collection][index]);
      }
      return jsonResponse({ error: 'Record not found' }, 404);
    }

    if (request.method === 'DELETE' && id) {
      mockStore[collection] = mockStore[collection].filter((item: any) => item.id !== id);
      return jsonResponse({ success: true, id });
    }
  }

  return jsonResponse({ error: 'Endpoint not found' }, 404);
}
