import React, { useState } from 'react';
import {
  BarChart3,
  Shield,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Download,
  Filter,
  UserCheck
} from 'lucide-react';
import { Department, Doctor, Patient, Appointment, Invoice, AuditLog } from '../types/hms';

interface ReportsAnalyticsProps {
  departments: Department[];
  doctors: Doctor[];
  patients: Patient[];
  appointments: Appointment[];
  invoices: Invoice[];
  auditLogs: AuditLog[];
}

export const ReportsAnalytics: React.FC<ReportsAnalyticsProps> = ({
  departments,
  doctors,
  patients,
  appointments,
  invoices,
  auditLogs,
}) => {
  const [auditFilter, setAuditFilter] = useState<string>('ALL');

  const filteredLogs = auditLogs.filter(
    (log) => auditFilter === 'ALL' || log.status === auditFilter || log.actorRole === auditFilter
  );

  const totalRevenue = invoices
    .filter((i) => i.status === 'PAID')
    .reduce((acc, i) => acc + i.totalAmount, 0);

  const completedAppts = appointments.filter((a) => a.status === 'COMPLETED').length;
  const inConsultAppts = appointments.filter((a) => a.status === 'IN_CONSULTATION').length;
  const scheduledAppts = appointments.filter((a) => a.status === 'SCHEDULED').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
          <BarChart3 className="h-5 w-5 text-teal-600" />
          <span>Operational Reports &amp; Immutable Security Audit Log</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Real-time aggregation across departmental utilization, clinical throughput, and Spring Security audit trail.
        </p>
      </div>

      {/* Analytics Summary Panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Department Volume Card */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Department Inpatient Census
          </h3>
          <div className="space-y-2.5">
            {departments.map((dept) => {
              const ratio = Math.round((dept.occupiedBeds / dept.totalBeds) * 100);
              return (
                <div key={dept.id} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-800">{dept.name}</span>
                    <span className="font-mono text-slate-500">
                      {dept.occupiedBeds} / {dept.totalBeds} beds
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full ${
                        ratio >= 85 ? 'bg-rose-500' : ratio >= 70 ? 'bg-amber-500' : 'bg-teal-600'
                      }`}
                      style={{ width: `${ratio}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Clinical Throughput */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Consultation Flow Dynamics
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between p-2.5 rounded-lg bg-emerald-50 text-emerald-900 font-semibold">
              <span>Completed Consultations</span>
              <span className="font-mono">{completedAppts}</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-lg bg-amber-50 text-amber-900 font-semibold">
              <span>Currently In Consultation</span>
              <span className="font-mono">{inConsultAppts}</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-lg bg-sky-50 text-sky-900 font-semibold">
              <span>Awaiting Doctor Examination</span>
              <span className="font-mono">{scheduledAppts}</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-lg bg-slate-50 text-slate-900 font-semibold">
              <span>Total Scheduled Workload</span>
              <span className="font-mono">{appointments.length}</span>
            </div>
          </div>
        </div>

        {/* Doctor Workload */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Physician Caseload Roster
          </h3>
          <div className="space-y-2">
            {doctors.slice(0, 4).map((doc) => {
              const docAppts = appointments.filter((a) => a.doctorId === doc.id);
              return (
                <div
                  key={doc.id}
                  className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                >
                  <div>
                    <strong className="text-slate-900">Dr. {doc.firstName} {doc.lastName}</strong>
                    <div className="text-[11px] text-slate-500">{doc.specialization}</div>
                  </div>
                  <span className="font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    {docAppts.length} cases
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Immutable Security Audit Trail */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Lock className="h-4 w-4 text-slate-700" />
            <h3 className="text-sm font-bold text-slate-900">
              System Audit Ledger (Spring Security &amp; JPA Transactions)
            </h3>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-500 font-medium">Filter:</span>
            <select
              aria-label="Filter Audit Logs"
              value={auditFilter}
              onChange={(e) => setAuditFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-700"
            >
              <option value="ALL">All Events</option>
              <option value="SUCCESS">Success Only</option>
              <option value="ROLE_ADMIN">Admin Actions</option>
              <option value="ROLE_DOCTOR">Doctor Actions</option>
              <option value="ROLE_RECEPTIONIST">Reception Actions</option>
              <option value="ROLE_CASHIER">Cashier Actions</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-2.5">Timestamp</th>
                <th className="px-4 py-2.5">Actor</th>
                <th className="px-4 py-2.5">Role</th>
                <th className="px-4 py-2.5">Action</th>
                <th className="px-4 py-2.5">Target Entity</th>
                <th className="px-4 py-2.5">Details</th>
                <th className="px-4 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-mono text-[11px]">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80">
                  <td className="px-4 py-2.5 text-slate-500 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="px-4 py-2.5 font-bold text-slate-900">
                    {log.actorUsername}
                  </td>
                  <td className="px-4 py-2.5 text-slate-600 font-sans">
                    {log.actorRole.replace('ROLE_', '')}
                  </td>
                  <td className="px-4 py-2.5 font-bold text-teal-800 font-sans">
                    {log.action}
                  </td>
                  <td className="px-4 py-2.5 text-slate-700">
                    {log.entityType} ({log.entityId})
                  </td>
                  <td className="px-4 py-2.5 text-slate-600 font-sans max-w-xs truncate" title={log.details}>
                    {log.details}
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-bold ${
                        log.status === 'SUCCESS'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
