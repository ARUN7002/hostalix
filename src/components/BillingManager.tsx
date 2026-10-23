import React, { useState } from 'react';
import {
  CreditCard,
  DollarSign,
  Plus,
  Printer,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck,
  Building,
  Receipt,
  X,
  Send,
  Trash2,
  Coins,
  ArrowRightLeft,
  Wallet
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  Invoice,
  InvoiceItem,
  ItemType,
  InvoiceStatus,
  Patient,
  Appointment,
  User
} from '../types/hms';
import {
  toYuan,
  toUSD,
  formatUSD,
  formatYuan,
  formatDualCurrency,
  CURRENCY_CONFIG
} from '../utils/currency';

interface BillingManagerProps {
  invoices: Invoice[];
  patients: Patient[];
  appointments: Appointment[];
  currentUser: User;
  onAddInvoice: (invoice: Invoice) => void;
  onProcessPayment: (invoiceId: number, method: any, txnRef: string, notes: string, currency?: 'USD' | 'CNY') => void;
}

export const BillingManager: React.FC<BillingManagerProps> = ({
  invoices,
  patients,
  appointments,
  currentUser,
  onAddInvoice,
  onProcessPayment,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeReceiptInvoice, setActiveReceiptInvoice] = useState<Invoice | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentTargetInvoice, setPaymentTargetInvoice] = useState<Invoice | null>(null);

  // Two Types of Payment State
  const [selectedPaymentCurrency, setSelectedPaymentCurrency] = useState<'USD' | 'CNY'>('USD');
  const [paymentMethodUSD, setPaymentMethodUSD] = useState<'CREDIT_CARD' | 'CASH' | 'INSURANCE' | 'BANK_TRANSFER'>('CREDIT_CARD');
  const [paymentMethodCNY, setPaymentMethodCNY] = useState<'UNIONPAY' | 'CASH' | 'DIGITAL_PAY' | 'MED_INSURANCE'>('UNIONPAY');
  const [txnRef, setTxnRef] = useState('TXN-POS-' + Math.floor(100000 + Math.random() * 900000));
  const [receiptNotes, setReceiptNotes] = useState('Front desk cashier terminal settlement.');

  // Create Invoice State
  const [selectedPatientId, setSelectedPatientId] = useState<number>(patients[0]?.id || 1);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [lineItems, setLineItems] = useState<InvoiceItem[]>([
    {
      id: 'it-init-1',
      description: 'Specialist Clinical Consultation',
      itemType: 'CONSULTATION',
      unitPrice: 150.0,
      quantity: 1,
      total: 150.0,
    },
  ]);

  // Line item addition inputs
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemType, setNewItemType] = useState<ItemType>('LAB_TEST');
  const [newItemPrice, setNewItemPrice] = useState<number>(85.0);
  const [newItemQty, setNewItemQty] = useState<number>(1);

  const filteredInvoices = invoices.filter(
    (inv) => statusFilter === 'ALL' || inv.status === statusFilter
  );

  const totalPaid = invoices
    .filter((inv) => inv.status === 'PAID')
    .reduce((acc, inv) => acc + inv.totalAmount, 0);

  const totalPending = invoices
    .filter((inv) => inv.status === 'PENDING')
    .reduce((acc, inv) => acc + inv.totalAmount, 0);

  // Line item math
  const subtotal = lineItems.reduce((acc, item) => acc + item.total, 0);
  const taxable = Math.max(0, subtotal - discountAmount);
  const tax = Number((taxable * 0.05).toFixed(2));
  const finalTotal = Number((taxable + tax).toFixed(2));

  const handleAddLineItem = () => {
    if (!newItemDesc.trim()) return;
    const total = Number((newItemPrice * newItemQty).toFixed(2));
    const item: InvoiceItem = {
      id: 'it-' + Date.now().toString(36),
      description: newItemDesc.trim(),
      itemType: newItemType,
      unitPrice: newItemPrice,
      quantity: newItemQty,
      total,
    };
    setLineItems([...lineItems, item]);
    setNewItemDesc('');
  };

  const handleRemoveLineItem = (id: string) => {
    setLineItems(lineItems.filter((i) => i.id !== id));
  };

  const handleCreateInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (lineItems.length === 0) return;

    const newInvoice: Invoice = {
      id: Date.now(),
      invoiceNumber: `INV-2026-${(invoices.length + 101).toString().padStart(3, '0')}`,
      patientId: selectedPatientId,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: lineItems,
      subtotal,
      taxRate: 0.05,
      taxAmount: tax,
      discountAmount,
      totalAmount: finalTotal,
      status: 'PENDING',
    };

    onAddInvoice(newInvoice);
    setIsCreateModalOpen(false);
  };

  const handleConfirmPayment = () => {
    if (!paymentTargetInvoice) return;
    const finalMethod = selectedPaymentCurrency === 'USD' ? paymentMethodUSD : paymentMethodCNY;
    onProcessPayment(paymentTargetInvoice.id, finalMethod, txnRef, receiptNotes, selectedPaymentCurrency);

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch {
      // safe fallback
    }

    setIsPaymentModalOpen(false);
    setActiveReceiptInvoice({
      ...paymentTargetInvoice,
      status: 'PAID',
      paymentMethod: finalMethod,
      paymentCurrency: selectedPaymentCurrency,
      transactionReference: txnRef,
      receiptNotes,
      paidAt: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <CreditCard className="h-5 w-5 text-teal-600" />
            <span>Clinical Billing &amp; Cashier Financial Ledger</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Itemized invoices, dual currency tariffs ($ USD / ¥ CNY), two payment types, 5% healthcare levy, and cashier audit trail.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-teal-600 hover:bg-teal-700 text-white shadow-xs cursor-pointer transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Generate New Invoice</span>
        </button>
      </div>

      {/* Financial KPI Cards with Dual Currency */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Gross Settled Revenue</p>
            <div className="mt-1">
              <h3 className="text-2xl font-extrabold text-emerald-700 font-mono">
                {formatUSD(totalPaid)}
              </h3>
              <p className="text-sm font-bold text-emerald-600 font-mono">
                {formatYuan(toYuan(totalPaid))}
              </p>
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              {invoices.filter((i) => i.status === 'PAID').length} invoices cleared
            </p>
          </div>
          <div className="h-12 w-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Outstanding Receivables</p>
            <div className="mt-1">
              <h3 className="text-2xl font-extrabold text-amber-600 font-mono">
                {formatUSD(totalPending)}
              </h3>
              <p className="text-sm font-bold text-amber-500 font-mono">
                {formatYuan(toYuan(totalPending))}
              </p>
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              {invoices.filter((i) => i.status === 'PENDING').length} invoices awaiting clearance
            </p>
          </div>
          <div className="h-12 w-12 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Two Types of Payment</p>
            <div className="mt-1.5 flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
                Type 1: Dollar ($ USD)
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                Type 2: Yuan (¥ CNY)
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-1.5">
              Fixed Clearing Exchange Rate: <strong className="text-slate-700">1.00 USD = {CURRENCY_CONFIG.usdToCnyRate} CNY</strong>
            </p>
          </div>
          <div className="h-12 w-12 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Coins className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 text-xs">
        <span className="text-slate-500 font-medium">Filter Status:</span>
        {['ALL', 'PENDING', 'PAID', 'CANCELLED'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1 rounded-lg font-semibold cursor-pointer transition-colors ${
              statusFilter === status
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Invoices Table with Dual Dollar & Yuan Tariffs */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3">Invoice #</th>
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">Issue / Due Date</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Subtotal ($ / ¥)</th>
                <th className="px-4 py-3">Tax 5% ($ / ¥)</th>
                <th className="px-4 py-3">Net Total ($ / ¥)</th>
                <th className="px-4 py-3">Payment Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredInvoices.map((inv) => {
                const patient = patients.find((p) => p.id === inv.patientId);
                const subYuan = toYuan(inv.subtotal);
                const taxYuan = toYuan(inv.taxAmount);
                const totalYuan = toYuan(inv.totalAmount);

                return (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">
                      {inv.invoiceNumber}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">
                        {patient ? `${patient.firstName} ${patient.lastName}` : 'Walk-in Patient'}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400">{patient?.mrn}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <div>Issued: {inv.issueDate}</div>
                      <div className="text-[11px] text-slate-400">Due: {inv.dueDate}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <span className="font-semibold">{inv.items.length} items</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-mono font-semibold text-slate-800">{formatUSD(inv.subtotal)}</div>
                      <div className="font-mono text-[11px] text-slate-400">{formatYuan(subYuan)}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-mono text-slate-600">{formatUSD(inv.taxAmount)}</div>
                      <div className="font-mono text-[11px] text-slate-400">{formatYuan(taxYuan)}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-mono font-bold text-slate-900 text-sm">{formatUSD(inv.totalAmount)}</div>
                      <div className="font-mono text-[11px] font-bold text-teal-700">{formatYuan(totalYuan)}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                            inv.status === 'PAID'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : inv.status === 'PENDING'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          {inv.status}
                        </span>
                        {inv.status === 'PAID' && inv.paymentCurrency && (
                          <div className="text-[10px] font-mono text-slate-500">
                            Cleared in {inv.paymentCurrency === 'CNY' ? 'Yuan (¥)' : 'Dollar ($)'}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right space-x-1.5 whitespace-nowrap">
                      {inv.status === 'PENDING' ? (
                        <button
                          onClick={() => {
                            setPaymentTargetInvoice(inv);
                            setIsPaymentModalOpen(true);
                          }}
                          className="px-2.5 py-1 text-xs font-bold rounded bg-teal-600 hover:bg-teal-700 text-white cursor-pointer"
                        >
                          Settle Invoice
                        </button>
                      ) : (
                        <button
                          onClick={() => setActiveReceiptInvoice(inv)}
                          className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 cursor-pointer"
                        >
                          View Receipt
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Settle / Process Payment Modal with Two Types of Payment */}
      {isPaymentModalOpen && paymentTargetInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="bg-teal-700 text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">Process Billing Clearance</h3>
                <p className="text-xs text-teal-100">
                  Cashier settlement for {paymentTargetInvoice.invoiceNumber}
                </p>
              </div>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="p-1 rounded bg-teal-800 hover:bg-teal-900 text-teal-100 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {/* Payment Type Selector (Two Types of Payment: Dollar vs Yuan) */}
              <div>
                <label className="block font-bold text-slate-800 mb-2">
                  Select Type of Payment (Preferable language: English)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPaymentCurrency('USD');
                      setReceiptNotes('Settled in Dollar ($ USD) via cashier terminal.');
                    }}
                    className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
                      selectedPaymentCurrency === 'USD'
                        ? 'border-blue-600 bg-blue-50/70 shadow-xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-blue-900">Type 1: Dollar ($ USD)</span>
                      <DollarSign className="h-4 w-4 text-blue-600" />
                    </div>
                    <p className="text-[11px] text-slate-500">Pay in Dollar currency</p>
                    <div className="mt-2 font-mono font-extrabold text-blue-900 text-lg">
                      {formatUSD(paymentTargetInvoice.totalAmount)}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPaymentCurrency('CNY');
                      setReceiptNotes('Settled in Yuan (¥ CNY) via cashier terminal.');
                    }}
                    className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
                      selectedPaymentCurrency === 'CNY'
                        ? 'border-emerald-600 bg-emerald-50/70 shadow-xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-emerald-900">Type 2: Yuan (¥ CNY)</span>
                      <Coins className="h-4 w-4 text-emerald-600" />
                    </div>
                    <p className="text-[11px] text-slate-500">Pay in Yuan currency</p>
                    <div className="mt-2 font-mono font-extrabold text-emerald-800 text-lg">
                      {formatYuan(toYuan(paymentTargetInvoice.totalAmount))}
                    </div>
                  </button>
                </div>
              </div>

              {/* Conversion Breakdown Banner */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 block">Total Due Amount</span>
                  <div className="text-base font-bold text-slate-900 font-mono mt-0.5">
                    {formatUSD(paymentTargetInvoice.totalAmount)} = {formatYuan(toYuan(paymentTargetInvoice.totalAmount))}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-mono block">Exchange Rate</span>
                  <span className="text-xs font-semibold text-slate-700 font-mono">1.00 USD = {CURRENCY_CONFIG.usdToCnyRate} CNY</span>
                </div>
              </div>

              {/* Payment Method based on chosen Payment Type */}
              {selectedPaymentCurrency === 'USD' ? (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Dollar ($ USD) Payment Channel
                  </label>
                  <select
                    value={paymentMethodUSD}
                    onChange={(e) => setPaymentMethodUSD(e.target.value as any)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-800 font-semibold"
                  >
                    <option value="CREDIT_CARD">Credit / Debit Card (Visa, Mastercard, Chip &amp; PIN)</option>
                    <option value="CASH">Cash Counter Payment ($ USD)</option>
                    <option value="INSURANCE">Third-Party Health Insurance Direct Pre-Auth</option>
                    <option value="BANK_TRANSFER">Electronic Bank Wire Transfer ($ USD)</option>
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Yuan (¥ CNY) Payment Channel
                  </label>
                  <select
                    value={paymentMethodCNY}
                    onChange={(e) => setPaymentMethodCNY(e.target.value as any)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-800 font-semibold"
                  >
                    <option value="UNIONPAY">UnionPay / Debit Card (Chip &amp; PIN)</option>
                    <option value="CASH">Cash Counter Payment (¥ Yuan)</option>
                    <option value="DIGITAL_PAY">Digital Clearing (Mobile Barcode / QR Pay)</option>
                    <option value="MED_INSURANCE">Medical Pre-Auth Clearing (¥ Yuan)</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Transaction / Authorization Reference
                </label>
                <input
                  type="text"
                  value={txnRef}
                  onChange={(e) => setTxnRef(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Cashier Audit Notes</label>
                <input
                  type="text"
                  value={receiptNotes}
                  onChange={(e) => setReceiptNotes(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPayment}
                  className="px-5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold cursor-pointer"
                >
                  Authorize Payment ({selectedPaymentCurrency === 'CNY' ? formatYuan(toYuan(paymentTargetInvoice.totalAmount)) : formatUSD(paymentTargetInvoice.totalAmount)})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Official Hospital Receipt Modal with Dual Currency Details */}
      {activeReceiptInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Receipt className="h-5 w-5 text-teal-400" />
                <h3 className="text-base font-bold">Official Hospital Billing Statement</h3>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="p-1.5 rounded bg-white/10 hover:bg-white/20 text-slate-200 text-xs flex items-center space-x-1 cursor-pointer"
                >
                  <Printer className="h-4 w-4" />
                  <span>Print</span>
                </button>
                <button
                  onClick={() => setActiveReceiptInvoice(null)}
                  className="p-1 rounded bg-white/10 hover:bg-white/20 text-slate-300 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {/* Header Info */}
              <div className="border-b border-slate-200 pb-3 flex justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Metropolitan Central Hospital</h4>
                  <p className="text-slate-500 text-[11px]">Clinical Services &amp; Financial Accounting</p>
                  <p className="text-slate-400 text-[11px] font-mono mt-1">Invoice: {activeReceiptInvoice.invoiceNumber}</p>
                </div>
                <div className="text-right text-[11px] text-slate-600">
                  <p>Date: {activeReceiptInvoice.issueDate}</p>
                  <p className="font-bold text-emerald-700">STATUS: {activeReceiptInvoice.status}</p>
                  {activeReceiptInvoice.paymentCurrency && (
                    <p className="font-bold text-blue-700">
                      Payment Type: {activeReceiptInvoice.paymentCurrency === 'CNY' ? 'Type 2: Yuan (¥ CNY)' : 'Type 1: Dollar ($ USD)'}
                    </p>
                  )}
                  {activeReceiptInvoice.transactionReference && (
                    <p className="font-mono text-slate-400">{activeReceiptInvoice.transactionReference}</p>
                  )}
                </div>
              </div>

              {/* Patient */}
              {(() => {
                const pat = patients.find((p) => p.id === activeReceiptInvoice.patientId);
                return (
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs flex justify-between">
                    <div>
                      <span className="text-slate-400 text-[10px] font-bold uppercase">Billed Patient</span>
                      <p className="font-bold text-slate-900">
                        {pat ? `${pat.firstName} ${pat.lastName}` : 'Walk-in Patient'}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 text-[10px] font-bold uppercase">Record #</span>
                      <p className="font-mono font-bold text-slate-800">{pat?.mrn}</p>
                    </div>
                  </div>
                );
              })()}

              {/* Items Breakdown in both currencies */}
              <div className="space-y-1.5 border-t border-slate-200 pt-3">
                <div className="flex justify-between font-bold text-slate-600 text-[11px] border-b border-slate-100 pb-1">
                  <span>Clinical Item Description</span>
                  <span>Amount ($ USD / ¥ CNY)</span>
                </div>
                {activeReceiptInvoice.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-slate-700 py-0.5">
                    <div>
                      <span className="font-semibold">{item.description}</span>
                      <span className="text-[10px] text-slate-400 ml-1.5 font-mono">
                        ({item.quantity} × {formatUSD(item.unitPrice)} / {formatYuan(toYuan(item.unitPrice))})
                      </span>
                    </div>
                    <div className="text-right font-mono">
                      <span className="font-semibold text-slate-900">{formatUSD(item.total)}</span>
                      <span className="text-[11px] text-slate-500 ml-1.5">({formatYuan(toYuan(item.total))})</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Math Summary in Dual Currencies */}
              <div className="border-t border-slate-200 pt-2 space-y-1 text-slate-600">
                <div className="flex justify-between font-mono">
                  <span className="font-sans">Subtotal:</span>
                  <span>{formatUSD(activeReceiptInvoice.subtotal)} ({formatYuan(toYuan(activeReceiptInvoice.subtotal))})</span>
                </div>
                {activeReceiptInvoice.discountAmount > 0 && (
                  <div className="flex justify-between text-rose-600 font-mono">
                    <span className="font-sans">Discount applied:</span>
                    <span>-{formatUSD(activeReceiptInvoice.discountAmount)} (-{formatYuan(toYuan(activeReceiptInvoice.discountAmount))})</span>
                  </div>
                )}
                <div className="flex justify-between font-mono">
                  <span className="font-sans">Healthcare Levy (5%):</span>
                  <span>{formatUSD(activeReceiptInvoice.taxAmount)} ({formatYuan(toYuan(activeReceiptInvoice.taxAmount))})</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 border-t border-slate-200 pt-1.5 font-mono">
                  <span className="font-sans">Final Cleared Total:</span>
                  <div className="text-right">
                    <span className="text-teal-800">{formatUSD(activeReceiptInvoice.totalAmount)}</span>
                    <span className="text-emerald-700 ml-2">/ {formatYuan(toYuan(activeReceiptInvoice.totalAmount))}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setActiveReceiptInvoice(null)}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 cursor-pointer"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generate Invoice Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="bg-teal-700 text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">Generate Medical Invoice</h3>
                <p className="text-xs text-teal-100">
                  Itemized Tariff Calculation with Dual Dollar ($ USD) &amp; Yuan (¥ CNY) Support
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded bg-teal-800 hover:bg-teal-900 text-teal-100 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoiceSubmit} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Select Patient *</label>
                  <select
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-800 font-medium"
                  >
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.firstName} {p.lastName} ({p.mrn})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Discount Amount ($ USD)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      value={discountAmount}
                      onChange={(e) => setDiscountAmount(Number(e.target.value))}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono text-slate-800"
                    />
                    {discountAmount > 0 && (
                      <span className="absolute right-3 top-1.5 text-[11px] font-mono text-slate-400">
                        ≈ {formatYuan(toYuan(discountAmount))}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Current Line Items */}
              <div>
                <label className="block font-bold text-slate-800 mb-1.5">Itemized Clinical Services</label>
                <div className="space-y-1.5 border border-slate-200 rounded-lg p-2.5 bg-slate-50">
                  {lineItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-2 rounded bg-white border border-slate-200 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-semibold text-slate-900">{item.description}</span>
                        <span className="text-[10px] text-slate-500 ml-2">
                          ({item.quantity} × {formatUSD(item.unitPrice)} / {formatYuan(toYuan(item.unitPrice))})
                        </span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ml-2 bg-slate-100 text-slate-600">
                          {item.itemType}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-right font-mono">
                          <span className="font-bold text-slate-900">{formatUSD(item.total)}</span>
                          <span className="text-[11px] text-slate-500 ml-1.5">({formatYuan(toYuan(item.total))})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveLineItem(item.id)}
                          className="text-rose-500 hover:text-rose-700 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Add Line Item Input row */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200">
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        placeholder="Service description (e.g. Troponin-I Lab Test)"
                        value={newItemDesc}
                        onChange={(e) => setNewItemDesc(e.target.value)}
                        className="w-full px-2 py-1 border border-slate-300 rounded text-xs bg-white"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        placeholder="Price in $ USD"
                        value={newItemPrice}
                        onChange={(e) => setNewItemPrice(Number(e.target.value))}
                        className="w-full px-2 py-1 border border-slate-300 rounded text-xs bg-white font-mono"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddLineItem}
                      className="px-3 py-1 bg-teal-600 text-white rounded font-bold hover:bg-teal-700 cursor-pointer text-xs"
                    >
                      + Add Item
                    </button>
                  </div>
                </div>
              </div>

              {/* Calculations summary in both currencies */}
              <div className="bg-slate-100 p-3 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
                <div>
                  <span className="text-slate-600 font-medium">Subtotal: {formatUSD(subtotal)} ({formatYuan(toYuan(subtotal))})</span> ·{' '}
                  <span className="text-slate-600 font-medium">5% Tax: {formatUSD(tax)} ({formatYuan(toYuan(tax))})</span>
                </div>
                <div className="text-sm font-bold text-slate-900 font-mono">
                  Total: <span className="text-teal-800">{formatUSD(finalTotal)}</span>{' '}
                  <span className="text-emerald-700">({formatYuan(toYuan(finalTotal))})</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold cursor-pointer"
                >
                  Issue Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
