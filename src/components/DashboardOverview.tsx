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
  UserPlus,
  BarChart2,
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';
import { Patient, Appointment, Department, Doctor, Invoice, User } from '../types/hms';
import { toYuan, formatUSD, formatYuan, formatDoctorName } from '../utils/currency';

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
  // Total bed metrics
  const totalBeds = departments.reduce((acc, d) => acc + d.totalBeds, 0);
  const occupiedBeds = departments.reduce((acc, d) => acc + d.occupiedBeds, 0);
  const bedOccupancyRate = Math.round((occupiedBeds / totalBeds) * 100);

  // Revenue metrics
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
      {/* Top Welcome & Quick Actions Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white rounded-2xl p-6 shadow-sm border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-bold tracking-widest uppercase text-teal-300">
                Hostalix Healthcare Intelligence
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold mt-1 tracking-tight text-white">
              Hospital Operations Overview
            </h1>
            <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-xl">
              Live census tracking, outpatient consultation timeline, and clinical analytics for medical staff.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenQuickRegister}
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 text-xs font-bold rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 transition-colors shadow-sm cursor-pointer"
            >
              <UserPlus className="h-4 w-4" />
              <span>Admit Patient</span>
            </button>
            <button
              onClick={() => onNavigateTab('appointments')}
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 text-xs font-bold rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors cursor-pointer"
            >
              <CalendarCheck2 className="h-4 w-4" />
              <span>Doctor Roster</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Patients */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-xs font-medium text-slate-500">Active Patient Records</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{patients.length}</h3>
            <p className="text-[11px] text-teal-600 mt-1 font-semibold flex items-center">
              <CheckCircle2 className="h-3 w-3 mr-1" /> All MRNs Active
            </p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="h-6 w-6" />
          </div>
        </div>

        {/* Inpatient Bed Occupancy */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Bed Occupancy</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
                {occupiedBeds} <span className="text-sm font-normal text-slate-500">/ {totalBeds} beds</span>
              </h3>
            </div>
            <div className="h-12 w-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Bed className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
              <span>Overall Utilization</span>
              <span className="font-bold text-teal-700">{bedOccupancyRate}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className={`h-2 rounded-full ${
                  bedOccupancyRate > 85 ? 'bg-rose-500' : bedOccupancyRate > 70 ? 'bg-amber-500' : 'bg-teal-600'
                }`}
                style={{ width: `${bedOccupancyRate}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Today's Consultations */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-xs font-medium text-slate-500">Today's Appointments</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{todayAppointments.length}</h3>
            <div className="flex items-center space-x-2 mt-1 text-[11px] font-semibold">
              <span className="text-amber-600">{scheduledCount} pending</span>
              <span className="text-slate-300">•</span>
              <span className="text-emerald-600">{completedCount} seen</span>
            </div>
          </div>
          <div className="h-12 w-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <CalendarCheck2 className="h-6 w-6" />
          </div>
        </div>

        {/* Settled Revenue */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-xs font-medium text-slate-500">Settled Revenue ($ / ¥)</p>
            <div className="mt-1">
              <h3 className="text-2xl font-extrabold text-slate-900 font-mono">
                {formatUSD(totalSettledRevenue)}
              </h3>
              <p className="text-xs font-bold text-teal-700 font-mono">
                {formatYuan(toYuan(totalSettledRevenue))}
              </p>
            </div>
            <p className="text-[11px] text-amber-600 mt-1 font-semibold font-mono">
              {formatUSD(pendingReceivables)} ({formatYuan(toYuan(pendingReceivables))}) pending
            </p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Visual Charts Section: Explanation, Chart, and Chart Marks Below */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CHART 1: Inpatient Ward Bed Capacity */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-teal-50 text-teal-700">
                  <BarChart2 className="h-4 w-4" />
                </div>
                <h2 className="text-sm font-bold text-slate-900">
                  Inpatient Bed Occupancy &amp; Ward Capacity
                </h2>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                Live Census
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Tracking occupied versus licensed beds across all clinical wards. Wards nearing 85% capacity trigger triage rerouting.
            </p>
          </div>

          {/* Visual SVG Bar Chart */}
          <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100 space-y-3">
            {departments.map((dept) => {
              const percent = Math.round((dept.occupiedBeds / dept.totalBeds) * 100);
              const isHigh = percent >= 80;
              return (
                <div key={dept.id} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-800">{dept.name}</span>
                    <span className="font-mono text-slate-600 font-bold">
                      {dept.occupiedBeds} / {dept.totalBeds} beds ({percent}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200/70 rounded-full h-3 overflow-hidden p-0.5">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        isHigh ? 'bg-rose-500' : percent >= 70 ? 'bg-amber-500' : 'bg-teal-600'
                      }`}
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Chart Marks Below */}
          <div className="border-t border-slate-100 pt-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Chart Marks &amp; Ward Status
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <div className="flex items-center space-x-1.5 p-2 rounded-lg bg-slate-50 border border-slate-200/60">
                <span className="h-2.5 w-2.5 rounded-full bg-teal-600 shrink-0"></span>
                <span className="truncate text-slate-700">Cardiology: <strong>79%</strong></span>
              </div>
              <div className="flex items-center space-x-1.5 p-2 rounded-lg bg-rose-50 border border-rose-200/60">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-600 shrink-0"></span>
                <span className="truncate text-rose-800">Emergency: <strong>86% (Alert)</strong></span>
              </div>
              <div className="flex items-center space-x-1.5 p-2 rounded-lg bg-slate-50 border border-slate-200/60">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500 shrink-0"></span>
                <span className="truncate text-slate-700">Orthopedics: <strong>70%</strong></span>
              </div>
              <div className="flex items-center space-x-1.5 p-2 rounded-lg bg-slate-50 border border-slate-200/60">
                <span className="h-2.5 w-2.5 rounded-full bg-teal-600 shrink-0"></span>
                <span className="truncate text-slate-700">Neurology: <strong>69%</strong></span>
              </div>
              <div className="flex items-center space-x-1.5 p-2 rounded-lg bg-slate-50 border border-slate-200/60">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                <span className="truncate text-slate-700">Pediatrics: <strong>50%</strong></span>
              </div>
              <div className="flex items-center space-x-1.5 p-2 rounded-lg bg-slate-100 border border-slate-200/60">
                <span className="h-2.5 w-2.5 rounded-full bg-slate-400 shrink-0"></span>
                <span className="truncate text-slate-700">Total: <strong>{totalBeds} Beds</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* CHART 2: Daily Consultation Flow & Outpatient Timeline */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-purple-50 text-purple-700">
                  <Activity className="h-4 w-4" />
                </div>
                <h2 className="text-sm font-bold text-slate-900">
                  Daily Consultation Flow &amp; Triage Volume
                </h2>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700">
                Hourly Flow
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Hourly patient density throughout clinical shifts, indicating peak doctor demand and patient clearance times.
            </p>
          </div>

          {/* Visual SVG Timeline Curve */}
          <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100">
            <svg viewBox="0 0 400 120" className="w-full h-28 overflow-visible">
              <defs>
                <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0d9488" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#0d9488" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Background grid lines */}
              <line x1="0" y1="30" x2="400" y2="30" stroke="#e2e8f0" strokeDasharray="3 3" />
              <line x1="0" y1="70" x2="400" y2="70" stroke="#e2e8f0" strokeDasharray="3 3" />
              <line x1="0" y1="110" x2="400" y2="110" stroke="#cbd5e1" />

              {/* Area fill under curve */}
              <path
                d="M 10 110 L 10 90 Q 60 40, 120 20 T 220 50 T 320 30 L 390 95 L 390 110 Z"
                fill="url(#curveGradient)"
              />
              {/* Smooth line curve */}
              <path
                d="M 10 90 Q 60 40, 120 20 T 220 50 T 320 30 L 390 95"
                fill="none"
                stroke="#0d9488"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Data points */}
              <circle cx="10" cy="90" r="4" fill="#0d9488" stroke="#fff" strokeWidth="2" />
              <circle cx="120" cy="20" r="5" fill="#0f766e" stroke="#fff" strokeWidth="2" />
              <circle cx="220" cy="50" r="4" fill="#0d9488" stroke="#fff" strokeWidth="2" />
              <circle cx="320" cy="30" r="4" fill="#0d9488" stroke="#fff" strokeWidth="2" />
              <circle cx="390" cy="95" r="4" fill="#0d9488" stroke="#fff" strokeWidth="2" />

              {/* Peak annotation label */}
              <text x="120" y="12" fill="#0f766e" fontSize="9" fontWeight="bold" textAnchor="middle">
                Peak: 10:30 AM (14 pts)
              </text>
            </svg>
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1 px-1">
              <span>08:00</span>
              <span>10:00 (Peak)</span>
              <span>12:00</span>
              <span>14:00</span>
              <span>16:00 (Shift End)</span>
            </div>
          </div>

          {/* Chart Marks Below */}
          <div className="border-t border-slate-100 pt-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Chart Marks &amp; Shift Metrics
            </span>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200/60 text-emerald-800">
                <span className="block font-bold">44% Completed</span>
                <span className="text-[11px] text-emerald-600">{completedCount} seen today</span>
              </div>
              <div className="p-2 rounded-lg bg-amber-50 border border-amber-200/60 text-amber-800">
                <span className="block font-bold">17% Active</span>
                <span className="text-[11px] text-amber-600">{inConsultCount} in consult</span>
              </div>
              <div className="p-2 rounded-lg bg-sky-50 border border-sky-200/60 text-sky-800">
                <span className="block font-bold">39% Scheduled</span>
                <span className="text-[11px] text-sky-600">{scheduledCount} pending</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Second Row of Charts: Financial Clearing by Specialty & Triage Severity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CHART 3: Financial Clearing by Specialty */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
                  <DollarSign className="h-4 w-4" />
                </div>
                <h2 className="text-sm font-bold text-slate-900">
                  Financial Revenue Distribution by Specialty
                </h2>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                Ledger
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Proportion of total clinical billing generated by specialized medical departments and procedures.
            </p>
          </div>

          {/* Segmented Stacked Bar Chart */}
          <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100 space-y-2">
            <div className="h-5 rounded-lg overflow-hidden flex shadow-inner">
              <div style={{ width: '38%' }} className="bg-teal-600" title="Cardiology: 38%"></div>
              <div style={{ width: '28%' }} className="bg-emerald-500" title="Emergency: 28%"></div>
              <div style={{ width: '20%' }} className="bg-indigo-500" title="Orthopedics: 20%"></div>
              <div style={{ width: '9%' }} className="bg-amber-500" title="Pediatrics: 9%"></div>
              <div style={{ width: '5%' }} className="bg-purple-500" title="Neurology: 5%"></div>
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>0%</span>
              <span>50%</span>
              <span>100% Total Billed Volume</span>
            </div>
          </div>

          {/* Chart Marks Below */}
          <div className="border-t border-slate-100 pt-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Chart Marks &amp; Revenue Share
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <div className="flex items-center space-x-1.5 p-1.5 rounded-lg bg-slate-50">
                <span className="h-2 w-2 rounded-full bg-teal-600"></span>
                <span className="text-slate-700">Cardiology: <strong>38% ($5.2k / ¥37.7k)</strong></span>
              </div>
              <div className="flex items-center space-x-1.5 p-1.5 rounded-lg bg-slate-50">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                <span className="text-slate-700">Emergency: <strong>28% ($3.8k / ¥27.5k)</strong></span>
              </div>
              <div className="flex items-center space-x-1.5 p-1.5 rounded-lg bg-slate-50">
                <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
                <span className="text-slate-700">Orthopedics: <strong>20% ($2.7k / ¥19.6k)</strong></span>
              </div>
              <div className="flex items-center space-x-1.5 p-1.5 rounded-lg bg-slate-50">
                <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                <span className="text-slate-700">Pediatrics: <strong>9% ($1.2k / ¥8.7k)</strong></span>
              </div>
              <div className="flex items-center space-x-1.5 p-1.5 rounded-lg bg-slate-50">
                <span className="h-2 w-2 rounded-full bg-purple-500"></span>
                <span className="text-slate-700">Neurology: <strong>5% ($0.7k / ¥5.1k)</strong></span>
              </div>
              <div className="flex items-center space-x-1.5 p-1.5 rounded-lg bg-slate-100 font-bold col-span-2 sm:col-span-1">
                <span className="text-teal-800 text-[11px] font-mono">
                  Total: {formatUSD(totalSettledRevenue + pendingReceivables)} ({formatYuan(toYuan(totalSettledRevenue + pendingReceivables))})
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* CHART 4: Triage Priority Severity Spectrum */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-rose-50 text-rose-700">
                  <HeartPulse className="h-4 w-4" />
                </div>
                <h2 className="text-sm font-bold text-slate-900">
                  Clinical Triage Severity Classification
                </h2>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700">
                Acuity Scale
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Patient distribution categorized by emergency clinical severity: Immediate, Very Urgent, Urgent, Standard, and Non-Urgent.
            </p>
          </div>

          {/* Acuity Scale Spectrum Visual Bar */}
          <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100 space-y-2">
            <div className="h-5 rounded-lg overflow-hidden flex shadow-inner">
              <div style={{ width: '15%' }} className="bg-rose-600" title="Immediate: 15%"></div>
              <div style={{ width: '25%' }} className="bg-rose-400" title="Very Urgent: 25%"></div>
              <div style={{ width: '30%' }} className="bg-amber-400" title="Urgent: 30%"></div>
              <div style={{ width: '20%' }} className="bg-teal-500" title="Standard: 20%"></div>
              <div style={{ width: '10%' }} className="bg-slate-400" title="Non-Urgent: 10%"></div>
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span className="text-rose-600 font-bold">Immediate (Acuity 1)</span>
              <span className="text-slate-500">Standard / Routine (Acuity 5)</span>
            </div>
          </div>

          {/* Chart Marks Below */}
          <div className="border-t border-slate-100 pt-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Chart Marks &amp; Severity Breakdown
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <div className="flex items-center space-x-1.5 p-1.5 rounded-lg bg-rose-50 text-rose-900">
                <span className="h-2 w-2 rounded-full bg-rose-600"></span>
                <span>Immediate: <strong>15%</strong></span>
              </div>
              <div className="flex items-center space-x-1.5 p-1.5 rounded-lg bg-rose-50/70 text-rose-800">
                <span className="h-2 w-2 rounded-full bg-rose-400"></span>
                <span>Very Urgent: <strong>25%</strong></span>
              </div>
              <div className="flex items-center space-x-1.5 p-1.5 rounded-lg bg-amber-50 text-amber-900">
                <span className="h-2 w-2 rounded-full bg-amber-400"></span>
                <span>Urgent: <strong>30%</strong></span>
              </div>
              <div className="flex items-center space-x-1.5 p-1.5 rounded-lg bg-teal-50 text-teal-900">
                <span className="h-2 w-2 rounded-full bg-teal-500"></span>
                <span>Standard: <strong>20%</strong></span>
              </div>
              <div className="flex items-center space-x-1.5 p-1.5 rounded-lg bg-slate-100 text-slate-700">
                <span className="h-2 w-2 rounded-full bg-slate-400"></span>
                <span>Non-Urgent: <strong>10%</strong></span>
              </div>
              <div className="flex items-center space-x-1.5 p-1.5 rounded-lg bg-slate-50 text-slate-700">
                <span className="font-bold">{patients.length} Total Patients</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Consultations Quick Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-teal-600" />
            <h2 className="text-sm font-bold text-slate-900">Today's Active Patient Schedule</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 font-mono text-slate-600">
              {todayStr}
            </span>
          </div>
          <button
            onClick={() => onNavigateTab('appointments')}
            className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center cursor-pointer"
          >
            Manage All Slots <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {todayAppointments.map((appt) => {
            const patient = patients.find((p) => p.id === appt.patientId);
            const doctor = doctors.find((d) => d.id === appt.doctorId);

            return (
              <div
                key={appt.id}
                onClick={() => onSelectAppointment(appt)}
                className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer"
              >
                <div className="flex items-start space-x-3">
                  <div className="font-mono text-xs font-bold px-2 py-1.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 text-center min-w-16">
                    {appt.timeSlot}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-slate-900">
                        {patient ? `${patient.firstName} ${patient.lastName}` : 'Walk-in Patient'}
                      </span>
                      {patient && (
                        <span className="text-[11px] font-mono font-medium px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                          {patient.mrn}
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          appt.status === 'IN_CONSULTATION'
                            ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                            : appt.status === 'COMPLETED'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-sky-50 text-sky-700 border-sky-200'
                        }`}
                      >
                        {appt.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-1">
                      <strong className="text-slate-700">Complaint:</strong> {appt.chiefComplaint}
                    </p>
                    <div className="flex items-center space-x-3 mt-1 text-[11px] text-slate-500">
                      <span className="flex items-center">
                        <Stethoscope className="h-3 w-3 mr-1 text-teal-600" />
                        {doctor ? formatDoctorName(doctor.firstName, doctor.lastName, doctor.chineseName) : 'Attending Physician'} ({doctor?.specialization})
                      </span>
                      <span>•</span>
                      <span>{doctor?.roomNumber}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 self-end sm:self-center">
                  <span className="text-xs font-bold text-teal-700 hover:text-teal-900 inline-flex items-center">
                    Open Consultation <ArrowRight className="h-3 w-3 ml-1" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
