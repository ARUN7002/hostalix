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
  Trash2
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

interface BillingManagerProps {
  invoices: Invoice[];
  patients: Patient[];
  appointments: Appointment[];
  currentUser: User;
  onAddInvoice: (invoice: Invoice) => void;
  onProcessPayment: (invoiceId: number, method: any, txnRef: string, notes: string) => void;
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

  // Payment form state
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CREDIT_CARD' | 'INSURANCE' | 'BANK_TRANSFER'>('CREDIT_CARD');
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
    onProcessPayment(paymentTargetInvoice.id, paymentMethod, txnRef, receiptNotes);

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
      paymentMethod,
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
            Itemized invoices, automatic 5% healthcare levy computation, discount bounds, and transaction reconciliation.
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

      {/* Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Gross Settled Revenue</p>
            <h3 className="text-2xl font-bold text-emerald-700 mt-1">
              ${totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
              {invoices.filter((i) => i.status === 'PAID').length} invoices cleared
            </p>
          </div>
          <div className="h-12 w-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Outstanding Receivables</p>
            <h3 className="text-2xl font-bold text-amber-600 mt-1">
              ${totalPending.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-[11px] text-amber-600 font-medium mt-0.5">
              {invoices.filter((i) => i.status === 'PENDING').length} invoices awaiting payment
            </p>
          </div>
          <div className="h-12 w-12 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Total Billed Volume</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{invoices.length}</h3>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              Levy rate: 5.0% standard healthcare tax
            </p>
          </div>
          <div className="h-12 w-12 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Receipt className="h-6 w-6" />
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

      {/* Invoices Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3">Invoice #</th>
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">Issue / Due Date</th>
                <th className="px-4 py-3">Items Count</th>
                <th className="px-4 py-3">Subtotal</th>
                <th className="px-4 py-3">Tax (5%)</th>
                <th className="px-4 py-3">Net Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredInvoices.map((inv) => {
                const patient = patients.find((p) => p.id === inv.patientId);

                return (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">
                      {inv.invoiceNumber}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">
                        {patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient'}
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
                    <td className="px-4 py-3 font-mono text-slate-700">
                      ${inv.subtotal.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-500">
                      ${inv.taxAmount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-slate-900 text-sm">
                      ${inv.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
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

      {/* Settle / Process Payment Modal */}
      {isPaymentModalOpen && paymentTargetInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
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
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-center">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Amount Due</span>
                <div className="text-3xl font-extrabold text-slate-900 font-mono mt-0.5">
                  ${paymentTargetInvoice.totalAmount.toFixed(2)}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-800 font-semibold"
                >
                  <option value="CREDIT_CARD">Credit / Debit Card (Chip &amp; PIN)</option>
                  <option value="CASH">Cash Counter Payment</option>
                  <option value="INSURANCE">Third-Party Health Insurance Pre-Auth</option>
                  <option value="BANK_TRANSFER">Electronic Bank Transfer / Wire</option>
                </select>
              </div>

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
                  Authorize &amp; Issue Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Official Hospital Receipt Modal */}
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

              {/* Items Breakdown */}
              <div className="space-y-1.5 border-t border-slate-200 pt-3">
                <div className="flex justify-between font-bold text-slate-600 text-[11px] border-b border-slate-100 pb-1">
                  <span>Clinical Item Description</span>
                  <span>Total</span>
                </div>
                {activeReceiptInvoice.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-slate-700 py-0.5">
                    <div>
                      <span className="font-semibold">{item.description}</span>
                      <span className="text-[10px] text-slate-400 ml-1.5 font-mono">
                        ({item.quantity} × ${item.unitPrice.toFixed(2)})
                      </span>
                    </div>
                    <span className="font-mono font-semibold">${item.total.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Math Summary */}
              <div className="border-t border-slate-200 pt-2 space-y-1 text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-mono">${activeReceiptInvoice.subtotal.toFixed(2)}</span>
                </div>
                {activeReceiptInvoice.discountAmount > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>Discount applied:</span>
                    <span className="font-mono">-${activeReceiptInvoice.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Healthcare Levy (5%):</span>
                  <span className="font-mono">${activeReceiptInvoice.taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 border-t border-slate-200 pt-1.5">
                  <span>Final Cleared Total:</span>
                  <span className="font-mono text-teal-700">
                    ${activeReceiptInvoice.totalAmount.toFixed(2)}
                  </span>
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
                  Spring Data JPA Invoice &amp; InvoiceItem Cascading Persistence
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
                  <label className="block font-semibold text-slate-700 mb-1">Discount Amount ($)</label>
                  <input
                    type="number"
                    min={0}
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono text-slate-800"
                  />
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
                          ({item.quantity} × ${item.unitPrice.toFixed(2)})
                        </span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ml-2 bg-slate-100 text-slate-600">
                          {item.itemType}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-slate-900">${item.total.toFixed(2)}</span>
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
                        placeholder="Unit Price"
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

              {/* Calculations summary */}
              <div className="bg-slate-100 p-3 rounded-lg flex justify-between items-center text-xs">
                <div>
                  <span className="text-slate-500">Subtotal: ${subtotal.toFixed(2)}</span> ·{' '}
                  <span className="text-slate-500">5% Tax: ${tax.toFixed(2)}</span>
                </div>
                <div className="text-sm font-bold text-slate-900">
                  Total Due: <span className="font-mono text-teal-800">${finalTotal.toFixed(2)}</span>
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
