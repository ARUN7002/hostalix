import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  AlertTriangle,
  FileText,
  Phone,
  Mail,
  MapPin,
  Heart,
  Calendar,
  ShieldAlert,
  Printer,
  X,
  CheckCircle2,
  Clock,
  UserCheck
} from 'lucide-react';
import { Patient, BloodGroup, TriageLevel, User, Appointment, Invoice } from '../types/hms';

interface PatientManagerProps {
  patients: Patient[];
  appointments: Appointment[];
  invoices: Invoice[];
  currentUser: User;
  onAddPatient: (patient: Patient) => void;
  selectedPatientId?: number | null;
  onCloseSelectedPatient?: () => void;
}

export const PatientManager: React.FC<PatientManagerProps> = ({
  patients,
  appointments,
  invoices,
  currentUser,
  onAddPatient,
  selectedPatientId,
  onCloseSelectedPatient,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [bloodFilter, setBloodFilter] = useState<string>('ALL');
  const [triageFilter, setTriageFilter] = useState<string>('ALL');
  const [activeDossierPatient, setActiveDossierPatient] = useState<Patient | null>(
    selectedPatientId ? patients.find((p) => p.id === selectedPatientId) || null : null
  );
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  // New Patient Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '1995-05-15',
    gender: 'MALE' as 'MALE' | 'FEMALE' | 'OTHER',
    bloodGroup: 'O+' as BloodGroup,
    phoneNumber: '+1-555-0188',
    email: '',
    emergencyName: '',
    emergencyRelation: 'Spouse',
    emergencyPhone: '+1-555-0189',
    address: '',
    allergies: '',
    chronicConditions: '',
    triageLevel: 'STANDARD' as TriageLevel,
    assignedWard: '',
    bedNumber: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Filter patients
  const filteredPatients = patients.filter((p) => {
    const matchSearch =
      searchTerm === '' ||
      p.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.mrn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phoneNumber.includes(searchTerm);

    const matchBlood = bloodFilter === 'ALL' || p.bloodGroup === bloodFilter;
    const matchTriage = triageFilter === 'ALL' || p.triageLevel === triageFilter;

    return matchSearch && matchBlood && matchTriage;
  });

  // Bean Validation Simulation
  const handleValidateAndSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!formData.firstName.trim()) errors.firstName = '@NotBlank: First name is required (min 2 chars)';
    if (!formData.lastName.trim()) errors.lastName = '@NotBlank: Last name is required (min 2 chars)';
    if (!formData.dateOfBirth) errors.dateOfBirth = '@Past: Date of birth is required';
    if (!formData.phoneNumber.trim()) errors.phoneNumber = '@Pattern: Valid phone format required';
    if (!formData.emergencyName.trim()) errors.emergencyName = '@NotBlank: Emergency contact name required';
    if (!formData.emergencyPhone.trim()) errors.emergencyPhone = '@NotBlank: Emergency contact phone required';
    if (!formData.address.trim()) errors.address = '@NotBlank: Residential address is mandatory';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});

    const newMrnNumber = 100 + patients.length + 1;
    const newPatient: Patient = {
      id: Date.now(),
      mrn: `MRN-2026-${newMrnNumber.toString().padStart(3, '0')}`,
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender,
      bloodGroup: formData.bloodGroup,
      phoneNumber: formData.phoneNumber.trim(),
      email: formData.email.trim() || `${formData.firstName.toLowerCase()}@hospital-patient.org`,
      emergencyContact: {
        name: formData.emergencyName.trim(),
        relationship: formData.emergencyRelation,
        phone: formData.emergencyPhone.trim(),
      },
      address: formData.address.trim(),
      allergies: formData.allergies ? formData.allergies.split(',').map((s) => s.trim()) : [],
      chronicConditions: formData.chronicConditions ? formData.chronicConditions.split(',').map((s) => s.trim()) : [],
      triageLevel: formData.triageLevel,
      registeredDate: new Date().toISOString().split('T')[0],
      assignedWard: formData.assignedWard.trim() || undefined,
      bedNumber: formData.bedNumber.trim() || undefined,
    };

    onAddPatient(newPatient);
    setIsRegisterModalOpen(false);
    setActiveDossierPatient(newPatient);
  };

  const getTriageBadge = (triage: TriageLevel) => {
    switch (triage) {
      case 'IMMEDIATE':
        return 'bg-rose-600 text-white font-bold';
      case 'VERY_URGENT':
        return 'bg-rose-100 text-rose-800 border-rose-300 font-bold';
      case 'URGENT':
        return 'bg-amber-100 text-amber-800 border-amber-300 font-bold';
      case 'STANDARD':
        return 'bg-teal-50 text-teal-800 border-teal-200';
      case 'NON_URGENT':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <Users className="h-5 w-5 text-teal-600" />
            <span>Patient Electronic Medical Records (EMR)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            JPA Patient entity persistence, clinical demographics, allergy tagging, and triage classification.
          </p>
        </div>

        <button
          onClick={() => setIsRegisterModalOpen(true)}
          className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-teal-600 hover:bg-teal-700 text-white shadow-xs cursor-pointer transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Register New Patient</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by MRN, Name, Phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-teal-500 text-slate-800"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Blood Group Filter */}
          <div className="flex items-center space-x-1 text-xs">
            <span className="text-slate-500 font-medium">Blood:</span>
            <select
              aria-label="Filter by Blood Group"
              value={bloodFilter}
              onChange={(e) => setBloodFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold text-slate-700"
            >
              <option value="ALL">All Types</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>

          {/* Triage Filter */}
          <div className="flex items-center space-x-1 text-xs">
            <span className="text-slate-500 font-medium">Triage:</span>
            <select
              aria-label="Filter by Triage Priority"
              value={triageFilter}
              onChange={(e) => setTriageFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold text-slate-700"
            >
              <option value="ALL">All Priorities</option>
              <option value="IMMEDIATE">Immediate</option>
              <option value="VERY_URGENT">Very Urgent</option>
              <option value="URGENT">Urgent</option>
              <option value="STANDARD">Standard</option>
              <option value="NON_URGENT">Non-Urgent</option>
            </select>
          </div>

          <span className="text-xs text-slate-400 font-mono">
            Showing {filteredPatients.length} of {patients.length} records
          </span>
        </div>
      </div>

      {/* Patients Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3">MRN #</th>
                <th className="px-4 py-3">Patient Name</th>
                <th className="px-4 py-3">DOB / Age</th>
                <th className="px-4 py-3">Blood Type</th>
                <th className="px-4 py-3">Triage Priority</th>
                <th className="px-4 py-3">Allergies</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredPatients.map((patient) => {
                const birthYear = new Date(patient.dateOfBirth).getFullYear();
                const age = new Date().getFullYear() - birthYear;

                return (
                  <tr
                    key={patient.id}
                    className="hover:bg-teal-50/40 transition-colors cursor-pointer"
                    onClick={() => setActiveDossierPatient(patient)}
                  >
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">
                      {patient.mrn}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">
                        {patient.firstName} {patient.lastName}
                      </div>
                      <div className="text-[11px] text-slate-400 capitalize">{patient.gender.toLowerCase()}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div>{patient.dateOfBirth}</div>
                      <div className="text-[11px] text-slate-400">{age} yrs</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-0.5 rounded font-mono font-bold bg-slate-100 text-slate-800 border border-slate-200 text-[11px]">
                        {patient.bloodGroup}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] uppercase tracking-wider border ${getTriageBadge(
                          patient.triageLevel
                        )}`}
                      >
                        {patient.triageLevel.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {patient.allergies.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {patient.allergies.map((alg, i) => (
                            <span
                              key={i}
                              className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200"
                            >
                              {alg}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">NKDA (None)</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600 font-mono text-[11px]">
                      {patient.phoneNumber}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveDossierPatient(patient);
                        }}
                        className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-700 border border-slate-200 cursor-pointer"
                      >
                        Open Dossier
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Patient Dossier Modal */}
      {activeDossierPatient && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 font-bold border border-teal-400/30">
                    {activeDossierPatient.mrn}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${getTriageBadge(activeDossierPatient.triageLevel)}`}>
                    {activeDossierPatient.triageLevel}
                  </span>
                </div>
                <h3 className="text-xl font-bold mt-1">
                  {activeDossierPatient.firstName} {activeDossierPatient.lastName}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  DOB: {activeDossierPatient.dateOfBirth} · Gender: {activeDossierPatient.gender} · Blood Group: {activeDossierPatient.bloodGroup}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 text-xs flex items-center space-x-1 cursor-pointer"
                  title="Print Clinical Summary"
                >
                  <Printer className="h-4 w-4" />
                  <span className="hidden sm:inline">Print Dossier</span>
                </button>
                <button
                  onClick={() => {
                    setActiveDossierPatient(null);
                    if (onCloseSelectedPatient) onCloseSelectedPatient();
                  }}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Dossier Body */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Critical Alert Bar: Allergies */}
              {activeDossierPatient.allergies.length > 0 && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-start space-x-3">
                  <ShieldAlert className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wider">
                      Critical Drug &amp; Environmental Allergies
                    </h4>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {activeDossierPatient.allergies.map((alg, i) => (
                        <span key={i} className="px-2 py-0.5 rounded font-bold text-xs bg-rose-200 text-rose-900">
                          ⚠ {alg}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Grid Demographics & Contact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] text-teal-800">
                    Contact &amp; Demographics
                  </h4>
                  <p className="flex items-center text-slate-700">
                    <Phone className="h-3.5 w-3.5 mr-2 text-slate-400" />
                    {activeDossierPatient.phoneNumber}
                  </p>
                  <p className="flex items-center text-slate-700">
                    <Mail className="h-3.5 w-3.5 mr-2 text-slate-400" />
                    {activeDossierPatient.email}
                  </p>
                  <p className="flex items-start text-slate-700">
                    <MapPin className="h-3.5 w-3.5 mr-2 text-slate-400 shrink-0 mt-0.5" />
                    {activeDossierPatient.address}
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] text-teal-800">
                    Emergency Contact &amp; Ward
                  </h4>
                  <p className="text-slate-800 font-semibold">
                    {activeDossierPatient.emergencyContact.name} ({activeDossierPatient.emergencyContact.relationship})
                  </p>
                  <p className="text-slate-600 font-mono text-[11px]">
                    {activeDossierPatient.emergencyContact.phone}
                  </p>
                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-slate-500">Inpatient Ward Assignment:</span>{' '}
                    <strong className="text-slate-800 font-medium">
                      {activeDossierPatient.assignedWard
                        ? `${activeDossierPatient.assignedWard} (${activeDossierPatient.bedNumber || 'Bed Assigned'})`
                        : 'Outpatient / Not Admitted'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Chronic Conditions */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Chronic Diagnoses &amp; Pre-existing History
                </h4>
                {activeDossierPatient.chronicConditions.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {activeDossierPatient.chronicConditions.map((cond, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200"
                      >
                        {cond}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No chronic medical conditions recorded.</p>
                )}
              </div>

              {/* Patient's Consultation & Clinical Timeline */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                  <Clock className="h-3.5 w-3.5 text-teal-600" />
                  <span>Clinical Consultations History</span>
                </h4>
                {appointments.filter((a) => a.patientId === activeDossierPatient.id).length > 0 ? (
                  <div className="space-y-2">
                    {appointments
                      .filter((a) => a.patientId === activeDossierPatient.id)
                      .map((appt) => (
                        <div
                          key={appt.id}
                          className="p-3 rounded-lg border border-slate-200 bg-white text-xs space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-slate-800">{appt.appointmentCode}</span>
                            <span className="font-semibold text-slate-600">
                              {appt.appointmentDate} at {appt.timeSlot}
                            </span>
                          </div>
                          <p className="text-slate-700">
                            <strong>Complaint:</strong> {appt.chiefComplaint}
                          </p>
                          {appt.diagnosis && (
                            <p className="text-emerald-800 font-medium">
                              <strong>Diagnosis:</strong> {appt.diagnosis}
                            </p>
                          )}
                          {appt.prescriptions && appt.prescriptions.length > 0 && (
                            <div className="bg-slate-50 p-2 rounded border border-slate-100 text-[11px]">
                              <strong>Prescriptions:</strong>{' '}
                              {appt.prescriptions.map((rx) => `${rx.medication} (${rx.dosage})`).join('; ')}
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No previous appointments found for this patient.</p>
                )}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => {
                  setActiveDossierPatient(null);
                  if (onCloseSelectedPatient) onCloseSelectedPatient();
                }}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 cursor-pointer"
              >
                Close Medical Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Register Patient Modal (Simulates Bean Validation Form) */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="bg-teal-700 text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">Patient Admission &amp; Intake Registration</h3>
                <p className="text-xs text-teal-100">
                  Enforces Spring Data JPA Bean Validation constraints: @NotBlank, @Past, @Pattern
                </p>
              </div>
              <button
                onClick={() => setIsRegisterModalOpen(false)}
                className="p-1 rounded bg-teal-800 hover:bg-teal-900 text-teal-100 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleValidateAndSubmit} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-teal-500"
                    placeholder="e.g. Samuel"
                  />
                  {formErrors.firstName && <p className="text-[10px] text-rose-600 mt-0.5">{formErrors.firstName}</p>}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-teal-500"
                    placeholder="e.g. Vance"
                  />
                  {formErrors.lastName && <p className="text-[10px] text-rose-600 mt-0.5">{formErrors.lastName}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date of Birth (@Past) *</label>
                  <input
                    type="date"
                    required
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Gender *</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-teal-500"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Blood Group *</label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value as BloodGroup })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-teal-500 font-bold"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number (@Pattern) *</label>
                  <input
                    type="text"
                    required
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-teal-500 font-mono"
                    placeholder="+1-555-0188"
                  />
                  {formErrors.phoneNumber && <p className="text-[10px] text-rose-600 mt-0.5">{formErrors.phoneNumber}</p>}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Triage Priority *</label>
                  <select
                    value={formData.triageLevel}
                    onChange={(e) => setFormData({ ...formData, triageLevel: e.target.value as TriageLevel })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-teal-500 font-semibold"
                  >
                    <option value="STANDARD">Standard</option>
                    <option value="URGENT">Urgent</option>
                    <option value="VERY_URGENT">Very Urgent</option>
                    <option value="IMMEDIATE">Immediate (Resuscitation)</option>
                    <option value="NON_URGENT">Non-Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Residential Address (@NotBlank) *</label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-teal-500"
                  placeholder="e.g. 520 University Avenue, Suite 300, Metro City"
                />
                {formErrors.address && <p className="text-[10px] text-rose-600 mt-0.5">{formErrors.address}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Emergency Contact Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.emergencyName}
                    onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-teal-500"
                    placeholder="e.g. Brenda Vance"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Relationship</label>
                  <input
                    type="text"
                    value={formData.emergencyRelation}
                    onChange={(e) => setFormData({ ...formData, emergencyRelation: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-teal-500"
                    placeholder="e.g. Spouse"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Emergency Phone *</label>
                  <input
                    type="text"
                    required
                    value={formData.emergencyPhone}
                    onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-teal-500 font-mono"
                    placeholder="+1-555-0189"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Known Allergies (comma separated)
                  </label>
                  <input
                    type="text"
                    value={formData.allergies}
                    onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-teal-500"
                    placeholder="e.g. Penicillin, Codeine, Peanuts"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Chronic Conditions (comma separated)
                  </label>
                  <input
                    type="text"
                    value={formData.chronicConditions}
                    onChange={(e) => setFormData({ ...formData, chronicConditions: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-teal-500"
                    placeholder="e.g. Hypertension, Asthma"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-xs cursor-pointer"
                >
                  Confirm &amp; Persist Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
