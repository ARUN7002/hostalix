import React, { useState } from 'react';
import {
  Building2,
  Stethoscope,
  Bed,
  Plus,
  Clock,
  DollarSign,
  MapPin,
  Award,
  CheckCircle2,
  X
} from 'lucide-react';
import { Department, Doctor, Appointment, User } from '../types/hms';
import { toYuan, formatDualCurrency, formatDoctorName } from '../utils/currency';

interface DoctorDepartmentManagerProps {
  departments: Department[];
  doctors: Doctor[];
  appointments: Appointment[];
  currentUser: User;
  onAddDoctor: (doctor: Doctor) => void;
  onAddDepartment: (department: Department) => void;
}

export const DoctorDepartmentManager: React.FC<DoctorDepartmentManagerProps> = ({
  departments,
  doctors,
  appointments,
  currentUser,
  onAddDoctor,
  onAddDepartment,
}) => {
  const [selectedDeptId, setSelectedDeptId] = useState<number | 'ALL'>('ALL');
  const [isAddDoctorOpen, setIsAddDoctorOpen] = useState(false);
  const [isAddDeptOpen, setIsAddDeptOpen] = useState(false);

  // New Doctor Form State with English & Chinese Doctor Names and Dual Currency
  const [newDocData, setNewDocData] = useState({
    firstName: '',
    lastName: '',
    chineseName: '',
    email: '',
    phone: '+1-555-0199',
    departmentId: departments[0]?.id || 1,
    specialization: '',
    qualification: 'MD, Board Certified',
    consultationFee: 150,
    roomNumber: 'Room 201, Clinical Wing',
  });

  // New Department Form State
  const [newDeptData, setNewDeptData] = useState({
    code: '',
    name: '',
    description: '',
    headDoctorName: '',
    totalBeds: 20,
  });

  const filteredDoctors = doctors.filter(
    (d) => selectedDeptId === 'ALL' || d.departmentId === selectedDeptId
  );

  const handleCreateDoctor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocData.firstName || !newDocData.lastName) return;

    const doc: Doctor = {
      id: Date.now(),
      employeeCode: `DOC-${(doctors.length + 101).toString()}`,
      firstName: newDocData.firstName.trim(),
      lastName: newDocData.lastName.trim(),
      chineseName: newDocData.chineseName.trim() || undefined,
      email: newDocData.email.trim() || `${newDocData.firstName.toLowerCase()}@hospital-central.org`,
      phoneNumber: newDocData.phone.trim(),
      departmentId: Number(newDocData.departmentId),
      specialization: newDocData.specialization.trim() || 'General Consultant',
      qualification: newDocData.qualification.trim(),
      consultationFee: Number(newDocData.consultationFee),
      roomNumber: newDocData.roomNumber.trim(),
      availableDays: ['MON', 'TUE', 'WED', 'THU', 'FRI'],
      timeSlots: ['09:00', '09:30', '10:00', '10:30', '11:00', '14:00', '14:30', '15:00'],
      active: true,
    };

    onAddDoctor(doc);
    setIsAddDoctorOpen(false);
  };

  const handleCreateDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptData.name || !newDeptData.code) return;

    const dept: Department = {
      id: Date.now(),
      code: newDeptData.code.trim().toUpperCase(),
      name: newDeptData.name.trim(),
      description: newDeptData.description.trim(),
      headDoctorName: newDeptData.headDoctorName.trim() || 'To be nominated',
      totalBeds: Number(newDeptData.totalBeds),
      occupiedBeds: 0,
      active: true,
    };

    onAddDepartment(dept);
    setIsAddDeptOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header & Department Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <Building2 className="h-5 w-5 text-teal-600" />
            <span>Clinical Departments &amp; Medical Staff Directory</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Bi-lingual medical staff directory with consultation fees in Dollar ($) and Yuan (¥).
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsAddDeptOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Department</span>
          </button>
          <button
            onClick={() => setIsAddDoctorOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-teal-600 hover:bg-teal-700 text-white shadow-xs cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Appoint Physician</span>
          </button>
        </div>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div
          onClick={() => setSelectedDeptId('ALL')}
          className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
            selectedDeptId === 'ALL'
              ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
              : 'bg-white text-slate-700 border-slate-200 hover:border-teal-500'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm">All Clinical Wings</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-white/20">
              {doctors.length} Docs
            </span>
          </div>
          <p className={`text-[11px] mt-1 ${selectedDeptId === 'ALL' ? 'text-slate-300' : 'text-slate-500'}`}>
            Cross-departmental hospital directory
          </p>
        </div>

        {departments.map((dept) => {
          const isSelected = selectedDeptId === dept.id;
          const percent = Math.round((dept.occupiedBeds / dept.totalBeds) * 100);

          return (
            <div
              key={dept.id}
              onClick={() => setSelectedDeptId(dept.id)}
              className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                isSelected
                  ? 'bg-teal-800 text-white border-teal-800 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-teal-500'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm line-clamp-1">{dept.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-black/10">
                  {dept.code}
                </span>
              </div>
              <p className={`text-[11px] mt-1 ${isSelected ? 'text-teal-100' : 'text-slate-500'} line-clamp-1`}>
                Head: {dept.headDoctorName}
              </p>
              <div className="mt-2 pt-2 border-t border-black/10 flex items-center justify-between text-[11px]">
                <span className="flex items-center">
                  <Bed className="h-3 w-3 mr-1" /> {dept.occupiedBeds}/{dept.totalBeds} beds
                </span>
                <span className="font-bold font-mono">{percent}%</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Physicians Directory Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            Attending Physicians ({filteredDoctors.length})
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            Dual Tariff: Dollar ($ USD) &amp; Yuan (¥ CNY)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDoctors.map((doc) => {
            const dept = departments.find((d) => d.id === doc.departmentId);
            const activeDocAppts = appointments.filter(
              (a) => a.doctorId === doc.id && a.appointmentDate === '2026-10-21'
            );

            return (
              <div
                key={doc.id}
                className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col justify-between space-y-3 hover:border-teal-400 transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                          {doc.employeeCode}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
                          {dept?.code}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 mt-1 flex items-center gap-1.5 flex-wrap">
                        <span>Dr. {doc.firstName} {doc.lastName}</span>
                        {doc.chineseName && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                            {doc.chineseName}
                          </span>
                        )}
                      </h4>
                      <p className="text-xs font-semibold text-teal-800">{doc.specialization}</p>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-bold text-slate-900 font-mono">
                        ${doc.consultationFee.toFixed(2)}
                      </div>
                      <div className="text-xs font-bold text-teal-700 font-mono">
                        ¥{toYuan(doc.consultationFee).toFixed(2)}
                      </div>
                      <p className="text-[9px] text-slate-400 uppercase font-semibold mt-0.5">Dual Tariff</p>
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2.5 border-t border-slate-100 space-y-1 text-xs text-slate-600">
                    <p className="flex items-center text-[11px]">
                      <Award className="h-3 w-3 mr-1.5 text-slate-400" />
                      {doc.qualification}
                    </p>
                    <p className="flex items-center text-[11px]">
                      <MapPin className="h-3 w-3 mr-1.5 text-slate-400" />
                      {doc.roomNumber}
                    </p>
                    <p className="flex items-center text-[11px]">
                      <Clock className="h-3 w-3 mr-1.5 text-slate-400" />
                      Duty Days: {doc.availableDays.join(', ')}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500 font-medium">
                    Today: <strong className="text-slate-800">{activeDocAppts.length} appointments</strong>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-slate-100 text-slate-700">
                    {doc.timeSlots.length} daily slots
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Physician Modal */}
      {isAddDoctorOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="bg-teal-700 text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">Appoint New Attending Physician</h3>
                <p className="text-xs text-teal-100">Doctor Entity &amp; Department Mapping</p>
              </div>
              <button
                onClick={() => setIsAddDoctorOpen(false)}
                className="p-1 rounded bg-teal-800 hover:bg-teal-900 text-teal-100 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDoctor} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={newDocData.firstName}
                    onChange={(e) => setNewDocData({ ...newDocData, firstName: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-800"
                    placeholder="e.g. Gabriel"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={newDocData.lastName}
                    onChange={(e) => setNewDocData({ ...newDocData, lastName: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-800"
                    placeholder="e.g. Martinez"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Chinese Doctor Name (e.g. 马丁内斯医生, 陈医生)
                </label>
                <input
                  type="text"
                  value={newDocData.chineseName}
                  onChange={(e) => setNewDocData({ ...newDocData, chineseName: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-800"
                  placeholder="e.g. 陈伟医生"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department *</label>
                  <select
                    value={newDocData.departmentId}
                    onChange={(e) => setNewDocData({ ...newDocData, departmentId: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-800"
                  >
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name} ({dept.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Consultation Fee ($ USD) *</label>
                  <input
                    type="number"
                    required
                    value={newDocData.consultationFee}
                    onChange={(e) => setNewDocData({ ...newDocData, consultationFee: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-800 font-mono"
                  />
                  <span className="text-[10px] text-teal-700 font-bold block mt-0.5">
                    ≈ ¥{toYuan(newDocData.consultationFee || 0).toFixed(2)} CNY (Dual Tariff)
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Specialization *</label>
                <input
                  type="text"
                  required
                  value={newDocData.specialization}
                  onChange={(e) => setNewDocData({ ...newDocData, specialization: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-800"
                  placeholder="e.g. Pediatric Cardiology, Spine Surgery..."
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned Clinic / Room *</label>
                <input
                  type="text"
                  required
                  value={newDocData.roomNumber}
                  onChange={(e) => setNewDocData({ ...newDocData, roomNumber: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-800"
                  placeholder="e.g. Room 410, West Outpatient Wing"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddDoctorOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold cursor-pointer"
                >
                  Save Physician
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Department Modal */}
      {isAddDeptOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">Create New Clinical Department</h3>
                <p className="text-xs text-slate-400">Department Entity &amp; Ward Capacity</p>
              </div>
              <button
                onClick={() => setIsAddDeptOpen(false)}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDepartment} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Code *</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={newDeptData.code}
                    onChange={(e) => setNewDeptData({ ...newDeptData, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-800 uppercase font-mono font-bold"
                    placeholder="e.g. DERM"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Department Name *</label>
                  <input
                    type="text"
                    required
                    value={newDeptData.name}
                    onChange={(e) => setNewDeptData({ ...newDeptData, name: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-800"
                    placeholder="e.g. Dermatology &amp; Laser Clinic"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department Head</label>
                  <input
                    type="text"
                    value={newDeptData.headDoctorName}
                    onChange={(e) => setNewDeptData({ ...newDeptData, headDoctorName: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-800"
                    placeholder="e.g. Dr. Arthur Miller, MD"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Total Ward Beds</label>
                  <input
                    type="number"
                    min={0}
                    value={newDeptData.totalBeds}
                    onChange={(e) => setNewDeptData({ ...newDeptData, totalBeds: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-800 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Clinical Scope</label>
                <textarea
                  rows={2}
                  value={newDeptData.description}
                  onChange={(e) => setNewDeptData({ ...newDeptData, description: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-800"
                  placeholder="Primary services, specialties, inpatient coverage..."
                ></textarea>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddDeptOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold cursor-pointer"
                >
                  Create Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
