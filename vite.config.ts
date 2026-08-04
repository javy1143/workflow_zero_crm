import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { existsSync, readFileSync } from 'node:fs'

const firebaseEnvPath = 'firebase.env'

if (existsSync(firebaseEnvPath)) {
  const firebaseEnv = readFileSync(firebaseEnvPath, 'utf8')
  for (const line of firebaseEnv.split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=["']?(.*?)["']?$/)
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2]
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})
