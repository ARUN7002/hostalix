import React, { useState } from 'react';
import {
  Stethoscope,
  Shield,
  KeyRound,
  User,
  ArrowRight,
  CheckCircle2,
  Lock,
  Building2,
  Users,
  CreditCard,
  AlertCircle
} from 'lucide-react';
import { User as AppUser } from '../types/hms';

interface LoginPageProps {
  allUsers: AppUser[];
  onLoginSuccess: (user: AppUser) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ allUsers, onLoginSuccess }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('hostalix2026');
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedRoleCode, setSelectedRoleCode] = useState<string>('admin');

  const defaultAccounts = [
    {
      roleName: 'System Administrator',
      username: 'admin',
      password: 'hostalix2026',
      icon: Shield,
      color: 'border-rose-200 bg-rose-50/50 hover:bg-rose-50 text-rose-800',
      badge: 'Admin Access',
      desc: 'Full administrative privileges, security logs, and department setup.',
    },
    {
      roleName: 'Attending Physician',
      username: 'doc_elena',
      password: 'hostalix2026',
      icon: Stethoscope,
      color: 'border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-800',
      badge: 'Doctor Station',
      desc: 'EMR access, diagnosis notes, clinical vitals, and e-prescriptions.',
    },
    {
      roleName: 'Head Charge Nurse',
      username: 'nurse_marcus',
      password: 'hostalix2026',
      icon: Building2,
      color: 'border-sky-200 bg-sky-50/50 hover:bg-sky-50 text-sky-800',
      badge: 'Ward & Triage',
      desc: 'Inpatient ward occupancy, bed management, and emergency triage priority.',
    },
    {
      roleName: 'Front Desk Registrar',
      username: 'reception_anna',
      password: 'hostalix2026',
      icon: Users,
      color: 'border-amber-200 bg-amber-50/50 hover:bg-amber-50 text-amber-800',
      badge: 'Patient Intake',
      desc: 'Patient admission, unique MRN generation, and slot booking.',
    },
    {
      roleName: 'Billing & Cashier',
      username: 'cashier_david',
      password: 'hostalix2026',
      icon: CreditCard,
      color: 'border-purple-200 bg-purple-50/50 hover:bg-purple-50 text-purple-800',
      badge: 'Finance Clearing',
      desc: 'Itemized invoices, insurance pre-auth, and payment receipting.',
    },
  ];

  const handleQuickLogin = (uname: string, pwd: string) => {
    setUsername(uname);
    setPassword(pwd);
    setSelectedRoleCode(uname);
    setErrorMsg('');

    const targetUser = allUsers.find((u) => u.username === uname);
    if (targetUser) {
      onLoginSuccess(targetUser);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const targetUser = allUsers.find((u) => u.username.toLowerCase() === username.trim().toLowerCase());
    if (!targetUser) {
      setErrorMsg('Invalid username. Please select one of the default accounts below.');
      return;
    }

    if (password.trim() === '') {
      setErrorMsg('Password cannot be empty.');
      return;
    }

    onLoginSuccess(targetUser);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 px-4">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand Logo */}
        <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/20 mb-3 ring-4 ring-teal-400/20">
          <Stethoscope className="h-8 w-8 stroke-[2.2]" />
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Hostalix</h1>
        <p className="text-xs uppercase tracking-widest text-teal-300 font-semibold mt-1">
          Hospital Management &amp; Clinical Operations System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-2xl rounded-2xl border border-slate-200">
          <div className="border-b border-slate-100 pb-4 mb-6">
            <h2 className="text-lg font-bold text-slate-900">Workstation Sign In</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter your clinical credentials or select a default hospital staff role below for instant access.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Username / Staff ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="e.g. admin or doc_elena"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Security Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-3.5 w-3.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                />
                <span className="ml-2 text-[11px]">Remember workstation session</span>
              </label>
              <span className="text-[11px] text-teal-600 font-medium">Spring Security 6 Active</span>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center items-center space-x-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 cursor-pointer transition-colors"
              >
                <span>Authenticate &amp; Open Hostalix</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>

          {/* Default Login Accounts Picker */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center">
                <Lock className="h-3.5 w-3.5 mr-1.5 text-teal-600" />
                Default Staff Accounts (1-Click Login)
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Password: hostalix2026</span>
            </div>

            <p className="text-[11px] text-slate-500 mb-3">
              Click any profile below to instantly populate credentials and launch that role:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {defaultAccounts.map((account) => {
                const Icon = account.icon;
                const isSelected = selectedRoleCode === account.username;
                return (
                  <button
                    key={account.username}
                    type="button"
                    onClick={() => handleQuickLogin(account.username, account.password)}
                    className={`text-left p-3 rounded-xl border text-xs transition-all cursor-pointer flex items-start space-x-2.5 ${account.color} ${
                      isSelected ? 'ring-2 ring-teal-500 shadow-xs' : ''
                    }`}
                  >
                    <div className="p-1.5 rounded-lg bg-white shadow-xs shrink-0 mt-0.5">
                      <Icon className="h-4 w-4 text-slate-800" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-xs truncate">
                          {account.roleName}
                        </span>
                        <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-white text-slate-600 border border-slate-200">
                          {account.username}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-600 line-clamp-1 mt-0.5">
                        {account.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="text-center mt-6 text-xs text-slate-400">
          <span>Hostalix Clinical System · Enterprise Workstation Portal</span>
        </div>
      </div>
    </div>
  );
};
