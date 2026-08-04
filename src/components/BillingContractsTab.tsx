import React, { useMemo } from 'react';
import { Account, BillingContract } from '../types';
import { FieldConfig, RecordBoard, SummaryMetric } from './RecordBoard';

interface BillingContractsTabProps {
  billingContracts: BillingContract[];
  accounts: Account[];
  onAddBillingContract: (contract: Omit<BillingContract, 'id' | 'createdAt'>) => Promise<void>;
  onUpdateBillingContract: (id: string, updates: Partial<Omit<BillingContract, 'id' | 'createdAt'>>) => Promise<void>;
}

export const BillingContractsTab: React.FC<BillingContractsTabProps> = ({
  billingContracts,
  accounts,
  onAddBillingContract,
  onUpdateBillingContract
}) => {
  const fields = useMemo<FieldConfig<BillingContract>[]>(() => [
    { key: 'accountId', label: 'Account', type: 'select', required: true, section: 'Core Details', options: accounts.map(account => ({ value: account.id, label: account.name })) },
    { key: 'servicePackage', label: 'Service Package', required: true, section: 'Core Details', placeholder: 'Starter, Growth, Operations, Custom' },
    { key: 'contractStatus', label: 'Contract Status', type: 'select', required: true, section: 'Core Details', options: ['Draft', 'Sent', 'Signed', 'Active', 'Expiring Soon', 'Expired', 'Cancelled'] },
    { key: 'paymentStatus', label: 'Payment Status', type: 'select', required: true, section: 'Core Details', options: ['Current', 'Due Soon', 'Past Due', 'Cancelled', 'Trial'] },
    { key: 'setupFee', label: 'Setup Fee', type: 'number', section: 'Fees' },
    { key: 'monthlyRecurringFee', label: 'Monthly Recurring Fee', type: 'number', section: 'Fees' },
    { key: 'billingFrequency', label: 'Billing Frequency', type: 'select', required: true, section: 'Fees', options: ['Monthly', 'Quarterly', 'Annually'] },
    { key: 'paymentMethod', label: 'Payment Method', section: 'Fees' },
    { key: 'lastInvoiceDate', label: 'Last Invoice Date', type: 'date', section: 'Dates' },
    { key: 'nextInvoiceDate', label: 'Next Invoice Date', type: 'date', section: 'Dates' },
    { key: 'contractStartDate', label: 'Contract Start Date', type: 'date', section: 'Dates' },
    { key: 'contractEndDate', label: 'Contract End Date', type: 'date', section: 'Dates' },
    { key: 'renewalDate', label: 'Renewal Date', type: 'date', section: 'Dates' },
    { key: 'cancellationTerms', label: 'Cancellation Terms', type: 'textarea', section: 'Contract Terms' },
    { key: 'includedSupportHours', label: 'Included Support Hours', type: 'number', section: 'Contract Terms' },
    { key: 'extraHourlyRate', label: 'Extra Hourly Rate', type: 'number', section: 'Contract Terms' },
    { key: 'extraChargesThisMonth', label: 'Extra Charges This Month', type: 'number', section: 'Contract Terms' },
    { key: 'proposalLink', label: 'Proposal Link', type: 'url', section: 'Links' },
    { key: 'contractLink', label: 'Contract Link', type: 'url', section: 'Links' },
    { key: 'scopeSummary', label: 'Scope Summary', type: 'textarea', section: 'Notes' },
    { key: 'billingNotes', label: 'Billing Notes', type: 'textarea', section: 'Notes' }
  ], [accounts]);

  const mrr = billingContracts
    .filter(contract => !['Cancelled', 'Expired'].includes(contract.contractStatus))
    .reduce((sum, contract) => sum + (Number(contract.monthlyRecurringFee) || 0), 0);

  const today = new Date().toISOString().slice(0, 10);
  const metrics = useMemo<SummaryMetric[]>(() => [
    { label: 'Monthly Recurring Revenue', value: `$${mrr.toLocaleString()}`, tone: 'green' },
    { label: 'Past Due', value: billingContracts.filter(item => item.paymentStatus === 'Past Due').length, tone: 'red' },
    { label: 'Due Soon', value: billingContracts.filter(item => item.paymentStatus === 'Due Soon').length, tone: 'cyan' },
    { label: 'Renewals Scheduled', value: billingContracts.filter(item => item.renewalDate && item.renewalDate >= today).length, tone: 'blue' }
  ], [billingContracts, mrr, today]);

  return (
    <RecordBoard<BillingContract>
      title="Billing / Contracts"
      subtitle="Setup fees, recurring management revenue, renewals, support hours, and contract links."
      addLabel="Add Billing Record"
      records={billingContracts}
      fields={fields}
      defaultRecord={{
        accountId: '',
        servicePackage: '',
        setupFee: 0,
        monthlyRecurringFee: 0,
        billingFrequency: 'Monthly',
        paymentMethod: '',
        paymentStatus: 'Current',
        lastInvoiceDate: '',
        nextInvoiceDate: '',
        contractStartDate: '',
        contractEndDate: '',
        renewalDate: '',
        cancellationTerms: '',
        includedSupportHours: 0,
        extraHourlyRate: 0,
        extraChargesThisMonth: 0,
        contractStatus: 'Draft',
        proposalLink: '',
        contractLink: '',
        scopeSummary: '',
        billingNotes: ''
      }}
      primaryField="servicePackage"
      secondaryFields={['accountId', 'monthlyRecurringFee', 'nextInvoiceDate', 'renewalDate']}
      badgeField="paymentStatus"
      filterField="paymentStatus"
      filterLabel="Payment States"
      metrics={metrics}
      getRelatedLabel={(field, value) => field === 'accountId' ? accounts.find(account => account.id === value)?.name || '' : ''}
      onAdd={onAddBillingContract}
      onUpdate={onUpdateBillingContract}
    />
  );
};
