import React from 'react';
import {
  Users,
  Bed,
  CalendarCheck2,
  DollarSign,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Stethoscope,
  ArrowRight,
  TrendingUp,
  HeartPulse,
  UserPlus
} from 'lucide-react';
import { Patient, Appointment, Department, Doctor, Invoice, User } from '../types/hms';

interface DashboardOverviewProps {
  patients: Patient[];
  appointments: Appointment[];
  departments: Department[];
  doctors: Doctor[];
  invoices: Invoice[];
  currentUser: User;
  onNavigateTab: (tab: string) => void;
  onOpenQuickRegister: () => void;
  onSelectAppointment: (appointment: Appointment) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  patients,
  appointments,
  departments,
  doctors,
  invoices,
  currentUser,
  onNavigateTab,
  onOpenQuickRegister,
  onSelectAppointment,
}) => {
  // Compute bed metrics
  const totalBeds = departments.reduce((acc, d) => acc + d.totalBeds, 0);
  const occupiedBeds = departments.reduce((acc, d) => acc + d.occupiedBeds, 0);
  const bedOccupancyRate = Math.round((occupiedBeds / totalBeds) * 100);

  // Compute revenue metrics
  const totalSettledRevenue = invoices
    .filter((inv) => inv.status === 'PAID')
    .reduce((acc, inv) => acc + inv.totalAmount, 0);

  const pendingReceivables = invoices
    .filter((inv) => inv.status === 'PENDING')
    .reduce((acc, inv) => acc + inv.totalAmount, 0);

  // Appointments today
  const todayStr = '2026-10-21';
  const todayAppointments = appointments.filter((a) => a.appointmentDate === todayStr);
  const inConsultCount = todayAppointments.filter((a) => a.status === 'IN_CONSULTATION').length;
  const completedCount = todayAppointments.filter((a) => a.status === 'COMPLETED').length;
  const scheduledCount = todayAppointments.filter((a) => a.status === 'SCHEDULED').length;

  // Urgent triage patients
  const urgentPatients = patients.filter(
    (p) => p.triageLevel === 'IMMEDIATE' || p.triageLevel === 'VERY_URGENT' || p.triageLevel === 'URGENT'
  );

  return (
    <div className="space-y-6">
      {/* Banner / Clinical Notification Bar */}
      <div className="bg-gradient-to-r from-teal-800 to-slate-900 text-white rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-semibold tracking-wider uppercase text-teal-200">
                Central Clinical Workstation Online
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold mt-1 text-white">
              Hospital Operations Command Center
            </h1>
            <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-2xl">
              Real-time synchronization active for Emergency Triage, Outpatient Consultations, Inpatient Bed Logistics, and Financial Clearing.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenQuickRegister}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 transition-colors shadow-xs cursor-pointer"
            >
              <UserPlus className="h-4 w-4" />
              <span>Rapid Patient Intake</span>
            </button>
            <button
              onClick={() => onNavigateTab('appointments')}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors cursor-pointer"
            >
              <CalendarCheck2 className="h-4 w-4" />
              <span>Slot Roster</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Patients */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Active EMR Records</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{patients.length}</h3>
            <p className="text-[11px] text-teal-600 mt-1 font-medium flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" /> All MRNs validated
            </p>
          </div>
          <div className="h-12 w-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="h-6 w-6" />
          </div>
        </div>

        {/* Inpatient Bed Occupancy */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Ward Bed Occupancy</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {occupiedBeds} <span className="text-sm font-normal text-slate-500">/ {totalBeds} beds</span>
              </h3>
            </div>
            <div className="h-12 w-12 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Bed className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-[11px] font-medium text-slate-600 mb-1">
              <span>Capacity Utilized</span>
              <span className="font-semibold">{bedOccupancyRate}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className={`h-2 rounded-full ${
                  bedOccupancyRate > 85 ? 'bg-rose-500' : bedOccupancyRate > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${bedOccupancyRate}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Today's Appointments */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Today's Schedule</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{todayAppointments.length}</h3>
            <div className="flex items-center space-x-2 mt-1 text-[11px] font-medium">
              <span className="text-amber-600 font-semibold">{scheduledCount} pending</span>
              <span className="text-slate-300">•</span>
              <span className="text-emerald-600 font-semibold">{completedCount} seen</span>
            </div>
          </div>
          <div className="h-12 w-12 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
            <CalendarCheck2 className="h-6 w-6" />
          </div>
        </div>

        {/* Settled Billing */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Settled Revenue</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
              ${totalSettledRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-[11px] text-amber-600 mt-1 font-medium">
              ${pendingReceivables.toFixed(2)} pending collection
            </p>
          </div>
          <div className="h-12 w-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Main Operational Split: Today's Appointments & Ward Logistics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Today's Clinical Schedule */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-slate-600" />
              <h2 className="text-sm font-bold text-slate-900">Today's Active Consultations</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 font-mono text-slate-600">
                {todayStr}
              </span>
            </div>
            <button
              onClick={() => onNavigateTab('appointments')}
              className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center cursor-pointer"
            >
              Full Calendar <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {todayAppointments.map((appt) => {
              const patient = patients.find((p) => p.id === appt.patientId);
              const doctor = doctors.find((d) => d.id === appt.doctorId);
              const department = departments.find((d) => d.id === appt.departmentId);

              const statusBadge = () => {
                switch (appt.status) {
                  case 'IN_CONSULTATION':
                    return 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse';
                  case 'COMPLETED':
                    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
                  case 'SCHEDULED':
                    return 'bg-sky-50 text-sky-700 border-sky-200';
                  default:
                    return 'bg-slate-50 text-slate-700 border-slate-200';
                }
              };

              return (
                <div
                  key={appt.id}
                  onClick={() => onSelectAppointment(appt)}
                  className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer"
                >
                  <div className="flex items-start space-x-3">
                    <div className="font-mono text-xs font-bold px-2 py-1.5 rounded bg-slate-100 text-slate-700 border border-slate-200 text-center min-w-16">
                      {appt.timeSlot}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-slate-900">
                          {patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient'}
                        </span>
                        {patient && (
                          <span className="text-[11px] font-mono font-medium px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                            {patient.mrn}
                          </span>
                        )}
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${statusBadge()}`}>
                          {appt.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-1">
                        <span className="font-semibold text-slate-700">Complaint:</span> {appt.chiefComplaint}
                      </p>
                      <div className="flex items-center space-x-3 mt-1 text-[11px] text-slate-500">
                        <span className="flex items-center">
                          <Stethoscope className="h-3 w-3 mr-1 text-teal-600" />
                          Dr. {doctor?.lastName} ({department?.code})
                        </span>
                        <span>•</span>
                        <span>{doctor?.roomNumber}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 self-end sm:self-center">
                    <span className="text-xs font-semibold text-teal-700 hover:text-teal-900 inline-flex items-center">
                      Open EMR <ArrowRight className="h-3 w-3 ml-1" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Ward Occupancy by Department & Triage Alert */}
        <div className="space-y-4">
          {/* Ward Bed Capacities */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4">
            <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center justify-between">
              <span>Department Bed Logistics</span>
              <span className="text-xs text-slate-500 font-normal">{departments.length} Wards</span>
            </h2>
            <div className="space-y-3">
              {departments.map((dept) => {
                const percent = Math.round((dept.occupiedBeds / dept.totalBeds) * 100);
                return (
                  <div key={dept.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800">{dept.name}</span>
                      <span className="font-mono text-slate-500 text-[11px]">
                        {dept.occupiedBeds}/{dept.totalBeds} ({percent}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full ${
                          percent >= 90 ? 'bg-rose-500' : percent >= 75 ? 'bg-amber-500' : 'bg-teal-600'
                        }`}
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* High Priority Triage Warnings */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4">
            <div className="flex items-center space-x-2 text-rose-600 mb-3">
              <AlertTriangle className="h-4 w-4" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Critical Triage Watchlist ({urgentPatients.length})
              </h3>
            </div>
            <div className="space-y-2.5">
              {urgentPatients.slice(0, 3).map((pat) => (
                <div
                  key={pat.id}
                  className="p-2.5 rounded-lg border border-rose-100 bg-rose-50/40 text-xs flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="font-bold text-slate-900">
                        {pat.firstName} {pat.lastName}
                      </span>
                      <span className="px-1.5 py-0.2 rounded font-mono text-[10px] bg-rose-200/80 text-rose-800 font-bold">
                        {pat.triageLevel}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Blood Group: <strong className="text-slate-800">{pat.bloodGroup}</strong> · Ward:{' '}
                      {pat.assignedWard || 'Unassigned'}
                    </p>
                  </div>
                  <button
                    onClick={() => onNavigateTab('patients')}
                    className="text-[11px] font-semibold text-rose-700 hover:text-rose-900 underline cursor-pointer"
                  >
                    Review
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
