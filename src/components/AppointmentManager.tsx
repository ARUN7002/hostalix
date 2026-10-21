import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  Plus,
  AlertCircle,
  CheckCircle2,
  XCircle,
  FileText,
  HeartPulse,
  Pill,
  Send,
  X,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import {
  Appointment,
  Patient,
  Doctor,
  Department,
  AppointmentStatus,
  PrescriptionItem,
  User as AppUser
} from '../types/hms';

interface AppointmentManagerProps {
  appointments: Appointment[];
  patients: Patient[];
  doctors: Doctor[];
  departments: Department[];
  currentUser: AppUser;
  onBookAppointment: (appointment: Appointment) => void;
  onUpdateAppointment: (appointment: Appointment) => void;
  onGenerateInvoiceFromAppointment: (appointment: Appointment) => void;
  selectedAppointment?: Appointment | null;
  onCloseSelectedAppointment?: () => void;
}

export const AppointmentManager: React.FC<AppointmentManagerProps> = ({
  appointments,
  patients,
  doctors,
  departments,
  currentUser,
  onBookAppointment,
  onUpdateAppointment,
  onGenerateInvoiceFromAppointment,
  selectedAppointment,
  onCloseSelectedAppointment,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-21');
  const [doctorFilter, setDoctorFilter] = useState<string>('ALL');
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [activeConsultationAppt, setActiveConsultationAppt] = useState<Appointment | null>(
    selectedAppointment || null
  );

  // Booking Form State
  const [patientId, setPatientId] = useState<number>(patients[0]?.id || 1);
  const [doctorId, setDoctorId] = useState<number>(doctors[0]?.id || 1);
  const [bookingDate, setBookingDate] = useState<string>('2026-10-21');
  const [timeSlot, setTimeSlot] = useState<string>('10:00');
  const [chiefComplaint, setChiefComplaint] = useState<string>('Routine health screening & cardiology consult');

  // Consultation drawer editing state
  const [editDiagnosis, setEditDiagnosis] = useState('');
  const [editBp, setEditBp] = useState('120/80');
  const [editHr, setEditHr] = useState<number>(75);
  const [editTemp, setEditTemp] = useState<number>(36.8);
  const [editSpo2, setEditSpo2] = useState<number>(98);
  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([]);
  const [newMedName, setNewMedName] = useState('');
  const [newMedDosage, setNewMedDosage] = useState('');
  const [newMedFreq, setNewMedFreq] = useState('');

  // Check double-booking conflict in real time
  const hasConflict = appointments.some(
    (a) =>
      a.doctorId === doctorId &&
      a.appointmentDate === bookingDate &&
      a.timeSlot === timeSlot &&
      a.status !== 'CANCELLED'
  );

  const selectedDoctorObj = doctors.find((d) => d.id === doctorId);

  const filteredAppointments = appointments.filter((a) => {
    const matchDate = selectedDate === 'ALL' || a.appointmentDate === selectedDate;
    const matchDoctor = doctorFilter === 'ALL' || a.doctorId === Number(doctorFilter);
    return matchDate && matchDoctor;
  });

  const handleBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hasConflict) return;

    const patient = patients.find((p) => p.id === patientId);
    const doctor = doctors.find((d) => d.id === doctorId);
    if (!patient || !doctor) return;

    const newCode = `APT-2026-${(appointments.length + 101).toString().padStart(3, '0')}`;
    const newAppt: Appointment = {
      id: Date.now(),
      appointmentCode: newCode,
      patientId,
      doctorId,
      departmentId: doctor.departmentId,
      appointmentDate: bookingDate,
      timeSlot,
      status: 'SCHEDULED',
      chiefComplaint,
      invoiceGenerated: false,
      createdAt: new Date().toISOString(),
    };

    onBookAppointment(newAppt);
    setIsBookModalOpen(false);
  };

  const openConsultation = (appt: Appointment) => {
    setActiveConsultationAppt(appt);
    setEditDiagnosis(appt.diagnosis || '');
    setEditBp(appt.vitals?.bloodPressure || '120/80');
    setEditHr(appt.vitals?.heartRate || 75);
    setEditTemp(appt.vitals?.temperature || 36.8);
    setEditSpo2(appt.vitals?.spO2 || 98);
    setPrescriptions(appt.prescriptions || []);
  };

  const handleSaveConsultation = (newStatus?: AppointmentStatus) => {
    if (!activeConsultationAppt) return;

    const updated: Appointment = {
      ...activeConsultationAppt,
      status: newStatus || activeConsultationAppt.status,
      diagnosis: editDiagnosis,
      vitals: {
        bloodPressure: editBp,
        heartRate: editHr,
        temperature: editTemp,
        spO2: editSpo2,
      },
      prescriptions,
    };

    onUpdateAppointment(updated);
    setActiveConsultationAppt(updated);
  };

  const handleAddPrescription = () => {
    if (!newMedName.trim()) return;
    const item: PrescriptionItem = {
      id: 'rx-' + Date.now().toString(36),
      medication: newMedName.trim(),
      dosage: newMedDosage.trim() || '1 tablet',
      frequency: newMedFreq.trim() || 'Twice daily after meals',
      duration: '7 days',
      instructions: 'Take with full glass of water.',
    };
    setPrescriptions([...prescriptions, item]);
    setNewMedName('');
    setNewMedDosage('');
    setNewMedFreq('');
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-teal-600" />
            <span>Outpatient Scheduling &amp; Consultation Engine</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Atomic slot allocation with real-time double-booking conflict detection and clinical workflow transition.
          </p>
        </div>

        <button
          onClick={() => setIsBookModalOpen(true)}
          className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-teal-600 hover:bg-teal-700 text-white shadow-xs cursor-pointer transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Book Appointment</span>
        </button>
      </div>

      {/* Date & Doctor Filter Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-1 text-xs">
            <span className="text-slate-500 font-medium">Date:</span>
            <input
              type="date"
              value={selectedDate === 'ALL' ? '2026-10-21' : selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-700 cursor-pointer"
            />
            <button
              onClick={() => setSelectedDate('ALL')}
              className={`px-2 py-1 text-[11px] font-semibold rounded ${
                selectedDate === 'ALL' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All Dates
            </button>
          </div>

          <div className="flex items-center space-x-1 text-xs">
            <span className="text-slate-500 font-medium">Physician:</span>
            <select
              aria-label="Filter by Physician"
              value={doctorFilter}
              onChange={(e) => setDoctorFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-700"
            >
              <option value="ALL">All Attending Physicians</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  Dr. {d.firstName} {d.lastName} ({d.specialization})
                </option>
              ))}
            </select>
          </div>
        </div>

        <span className="text-xs text-slate-400 font-mono">
          {filteredAppointments.length} slot(s) displayed
        </span>
      </div>

      {/* Appointments Grid / List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAppointments.map((appt) => {
          const patient = patients.find((p) => p.id === appt.patientId);
          const doctor = doctors.find((d) => d.id === appt.doctorId);
          const department = departments.find((d) => d.id === appt.departmentId);

          const statusBadge = () => {
            switch (appt.status) {
              case 'IN_CONSULTATION':
                return 'bg-amber-100 text-amber-800 border-amber-300 font-bold animate-pulse';
              case 'COMPLETED':
                return 'bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold';
              case 'CANCELLED':
                return 'bg-rose-100 text-rose-700 border-rose-200 line-through';
              case 'SCHEDULED':
                return 'bg-sky-100 text-sky-800 border-sky-300 font-semibold';
              default:
                return 'bg-slate-100 text-slate-700';
            }
          };

          return (
            <div
              key={appt.id}
              onClick={() => openConsultation(appt)}
              className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 hover:border-teal-500/80 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-3.5 w-3.5 text-teal-600" />
                    <span className="font-mono text-xs font-bold text-slate-800">
                      {appt.appointmentDate} · {appt.timeSlot}
                    </span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded border ${statusBadge()}`}>
                    {appt.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        {patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient'}
                      </h4>
                      <p className="font-mono text-[11px] text-slate-400">{patient?.mrn}</p>
                    </div>
                    {patient && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {patient.bloodGroup}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2">
                    <span className="font-semibold text-slate-700">Chief Complaint:</span> {appt.chiefComplaint}
                  </p>

                  <div className="pt-2 text-xs text-slate-500 space-y-0.5">
                    <p className="flex items-center">
                      <Stethoscope className="h-3 w-3 mr-1.5 text-slate-400" />
                      Dr. {doctor?.firstName} {doctor?.lastName} ({doctor?.specialization})
                    </p>
                    <p className="text-[11px] text-slate-400 pl-4.5">{doctor?.roomNumber}</p>
                  </div>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-mono text-[11px] text-slate-400">{appt.appointmentCode}</span>
                <span className="font-semibold text-teal-700 hover:text-teal-900 flex items-center">
                  Consultation Drawer <ArrowRight className="h-3 w-3 ml-1" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Consultation Drawer / Modal */}
      {activeConsultationAppt && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
            {/* Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 font-bold border border-teal-400/30">
                    {activeConsultationAppt.appointmentCode}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-white/10 text-slate-200">
                    {activeConsultationAppt.appointmentDate} at {activeConsultationAppt.timeSlot}
                  </span>
                </div>
                <h3 className="text-lg font-bold mt-1">Clinical Consultation &amp; EMR Recording</h3>
              </div>
              <button
                onClick={() => {
                  setActiveConsultationAppt(null);
                  if (onCloseSelectedAppointment) onCloseSelectedAppointment();
                }}
                className="p-1 rounded bg-white/10 hover:bg-white/20 text-slate-300 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5 text-xs max-h-[75vh] overflow-y-auto">
              {/* Patient and Doctor Snapshot */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Patient</span>
                  <p className="font-bold text-slate-900 text-sm">
                    {patients.find((p) => p.id === activeConsultationAppt.patientId)?.firstName}{' '}
                    {patients.find((p) => p.id === activeConsultationAppt.patientId)?.lastName}
                  </p>
                  <p className="font-mono text-slate-500 text-[11px]">
                    {patients.find((p) => p.id === activeConsultationAppt.patientId)?.mrn} · Blood:{' '}
                    {patients.find((p) => p.id === activeConsultationAppt.patientId)?.bloodGroup}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Physician</span>
                  <p className="font-bold text-slate-900 text-sm">
                    Dr. {doctors.find((d) => d.id === activeConsultationAppt.doctorId)?.firstName}{' '}
                    {doctors.find((d) => d.id === activeConsultationAppt.doctorId)?.lastName}
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    {doctors.find((d) => d.id === activeConsultationAppt.doctorId)?.specialization}
                  </p>
                </div>
              </div>

              {/* Status Transition Control Bar */}
              <div className="p-3 bg-teal-50/60 border border-teal-200 rounded-xl flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold text-teal-900">Current Status: {activeConsultationAppt.status}</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleSaveConsultation('IN_CONSULTATION')}
                    className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-600 text-white font-bold cursor-pointer"
                  >
                    Set In-Consultation
                  </button>
                  <button
                    onClick={() => handleSaveConsultation('COMPLETED')}
                    className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                  >
                    Set Completed
                  </button>
                  <button
                    onClick={() => handleSaveConsultation('CANCELLED')}
                    className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>

              {/* Chief Complaint */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">Chief Clinical Complaint</label>
                <div className="p-2.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
                  {activeConsultationAppt.chiefComplaint}
                </div>
              </div>

              {/* Vitals Recording Grid */}
              <div>
                <label className="block font-bold text-slate-800 mb-1.5 flex items-center">
                  <HeartPulse className="h-4 w-4 mr-1 text-rose-500" /> Clinical Vitals
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div>
                    <span className="text-[10px] text-slate-500">Blood Pressure</span>
                    <input
                      type="text"
                      value={editBp}
                      onChange={(e) => setEditBp(e.target.value)}
                      placeholder="120/80"
                      className="w-full px-2.5 py-1 rounded border border-slate-300 font-mono font-semibold"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500">Heart Rate (bpm)</span>
                    <input
                      type="number"
                      value={editHr}
                      onChange={(e) => setEditHr(Number(e.target.value))}
                      className="w-full px-2.5 py-1 rounded border border-slate-300 font-mono font-semibold"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500">Temp (°C)</span>
                    <input
                      type="number"
                      step="0.1"
                      value={editTemp}
                      onChange={(e) => setEditTemp(Number(e.target.value))}
                      className="w-full px-2.5 py-1 rounded border border-slate-300 font-mono font-semibold"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500">SpO2 (%)</span>
                    <input
                      type="number"
                      value={editSpo2}
                      onChange={(e) => setEditSpo2(Number(e.target.value))}
                      className="w-full px-2.5 py-1 rounded border border-slate-300 font-mono font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Doctor Diagnosis */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">Physician Diagnosis &amp; Clinical Assessment</label>
                <textarea
                  rows={2}
                  value={editDiagnosis}
                  onChange={(e) => setEditDiagnosis(e.target.value)}
                  placeholder="Document clinical diagnosis, ICD categorization, differential conclusions..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-teal-500"
                ></textarea>
              </div>

              {/* Prescription Items */}
              <div>
                <label className="block font-bold text-slate-800 mb-1 flex items-center justify-between">
                  <span className="flex items-center">
                    <Pill className="h-4 w-4 mr-1 text-teal-600" /> Prescriptions &amp; Medication
                  </span>
                  <span className="text-[11px] text-slate-500 font-normal">
                    {prescriptions.length} medication(s) prescribed
                  </span>
                </label>

                {prescriptions.length > 0 && (
                  <div className="space-y-1.5 mb-2">
                    {prescriptions.map((rx) => (
                      <div
                        key={rx.id}
                        className="p-2 rounded bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                      >
                        <div>
                          <strong className="text-slate-900">{rx.medication}</strong> · {rx.dosage} · {rx.frequency}
                        </div>
                        <button
                          type="button"
                          onClick={() => setPrescriptions(prescriptions.filter((p) => p.id !== rx.id))}
                          className="text-rose-600 hover:text-rose-800 cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <input
                    type="text"
                    value={newMedName}
                    onChange={(e) => setNewMedName(e.target.value)}
                    placeholder="Medication name (e.g. Amoxicillin)"
                    className="px-2 py-1 rounded border border-slate-300"
                  />
                  <input
                    type="text"
                    value={newMedDosage}
                    onChange={(e) => setNewMedDosage(e.target.value)}
                    placeholder="Dosage (e.g. 500mg)"
                    className="px-2 py-1 rounded border border-slate-300"
                  />
                  <div className="flex space-x-1">
                    <input
                      type="text"
                      value={newMedFreq}
                      onChange={(e) => setNewMedFreq(e.target.value)}
                      placeholder="Frequency (e.g. TID)"
                      className="px-2 py-1 rounded border border-slate-300 w-full"
                    />
                    <button
                      type="button"
                      onClick={handleAddPrescription}
                      className="px-3 py-1 rounded bg-teal-600 text-white font-bold cursor-pointer whitespace-nowrap"
                    >
                      Add Rx
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <div>
                {!activeConsultationAppt.invoiceGenerated ? (
                  <button
                    onClick={() => {
                      onGenerateInvoiceFromAppointment(activeConsultationAppt);
                      setActiveConsultationAppt(null);
                    }}
                    className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 font-semibold cursor-pointer text-xs"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Dispatch to Billing Ledger</span>
                  </button>
                ) : (
                  <span className="text-xs text-emerald-700 font-semibold flex items-center">
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Invoice Already Dispatched
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setActiveConsultationAppt(null);
                    if (onCloseSelectedAppointment) onCloseSelectedAppointment();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold cursor-pointer text-xs"
                >
                  Close
                </button>
                <button
                  onClick={() => handleSaveConsultation()}
                  className="px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold cursor-pointer text-xs"
                >
                  Save Consultation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Book Appointment Modal with Live Double-Booking Prevention */}
      {isBookModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="bg-teal-700 text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">Book Outpatient Consultation</h3>
                <p className="text-xs text-teal-100">
                  Spring Data JPA existsConflictingBooking Query Validation
                </p>
              </div>
              <button
                onClick={() => setIsBookModalOpen(false)}
                className="p-1 rounded bg-teal-800 hover:bg-teal-900 text-teal-100 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleBookSubmit} className="p-5 space-y-4 text-xs">
              {/* Conflict Alert Banner */}
              {hasConflict && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-300 text-rose-800 flex items-start space-x-2">
                  <ShieldAlert className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-rose-900">SchedulingConflictException</h5>
                    <p className="text-[11px] text-rose-700 mt-0.5">
                      Dr. {selectedDoctorObj?.firstName} {selectedDoctorObj?.lastName} is already scheduled for
                      slot <strong>{timeSlot}</strong> on <strong>{bookingDate}</strong>. Choose another time slot or
                      different physician.
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Patient *</label>
                <select
                  value={patientId}
                  onChange={(e) => setPatientId(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-teal-500 font-medium"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.firstName} {p.lastName} ({p.mrn}) · Blood: {p.bloodGroup}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Attending Physician *</label>
                <select
                  value={doctorId}
                  onChange={(e) => setDoctorId(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-teal-500 font-medium"
                >
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      Dr. {d.firstName} {d.lastName} - {d.specialization} (${d.consultationFee})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Appointment Date *</label>
                  <input
                    type="date"
                    required
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-teal-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Time Slot *</label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-teal-500 font-mono font-bold"
                  >
                    {selectedDoctorObj?.timeSlots.map((slot) => {
                      const isOccupied = appointments.some(
                        (a) =>
                          a.doctorId === doctorId &&
                          a.appointmentDate === bookingDate &&
                          a.timeSlot === slot &&
                          a.status !== 'CANCELLED'
                      );
                      return (
                        <option key={slot} value={slot}>
                          {slot} {isOccupied ? '❌ [OCCUPIED]' : '✅ [AVAILABLE]'}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Chief Clinical Complaint *</label>
                <textarea
                  rows={2}
                  required
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-teal-500"
                  placeholder="Primary symptoms, duration, triage observations..."
                ></textarea>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsBookModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={hasConflict}
                  className={`px-5 py-2 rounded-lg text-white font-bold shadow-xs cursor-pointer ${
                    hasConflict
                      ? 'bg-slate-400 cursor-not-allowed opacity-60'
                      : 'bg-teal-600 hover:bg-teal-700'
                  }`}
                >
                  Confirm Slot Reservation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
