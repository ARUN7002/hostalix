import React from 'react';
import {
  Activity,
  Shield,
  Stethoscope,
  Building2,
  Calendar,
  Users,
  CreditCard,
  BarChart3,
  Code2,
  LogOut,
  UserCheck
} from 'lucide-react';
import { User, UserRole } from '../types/hms';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User;
  allUsers: User[];
  onSwitchUser: (user: User) => void;
  onSignOut: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  allUsers,
  onSwitchUser,
  onSignOut,
}) => {
  const roleDisplay = (role: UserRole) => {
    switch (role) {
      case 'ROLE_ADMIN':
        return { label: 'Admin', badge: 'bg-rose-50 text-rose-700 border-rose-200' };
      case 'ROLE_DOCTOR':
        return { label: 'Doctor', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'ROLE_NURSE':
        return { label: 'Nurse', badge: 'bg-sky-50 text-sky-700 border-sky-200' };
      case 'ROLE_RECEPTIONIST':
        return { label: 'Reception', badge: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'ROLE_CASHIER':
        return { label: 'Cashier', badge: 'bg-purple-50 text-purple-700 border-purple-200' };
      default:
        return { label: 'Staff', badge: 'bg-slate-50 text-slate-700 border-slate-200' };
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard & Charts', icon: Activity },
    { id: 'patients', label: 'Patients (EMR)', icon: Users },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'doctors', label: 'Doctors & Wards', icon: Building2 },
    { id: 'billing', label: 'Billing & Cashier', icon: CreditCard },
    { id: 'reports', label: 'Operational Reports', icon: BarChart3 },
    { id: 'java-core', label: 'Architecture & Core', icon: Code2, highlight: true },
  ];

  const currentRoleInfo = roleDisplay(currentUser.role);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Top Bar: Brand, Active Profile, Role Switcher & Sign Out */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Hospital Identity */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-teal-700 to-teal-500 flex items-center justify-center text-white shadow-sm ring-2 ring-teal-400/20">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-extrabold tracking-tight text-slate-900">
                  Hostalix
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-teal-50 text-teal-700 border border-teal-200">
                  Clinical Suite
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Hospital Management &amp; Medical Operations System
              </p>
            </div>
          </div>

          {/* Right side controls: Role Switcher & Sign Out */}
          <div className="flex items-center space-x-2.5">
            {/* Quick Staff Switcher */}
            <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs">
              <Shield className="h-3.5 w-3.5 text-slate-500" />
              <span className="text-slate-500 font-medium hidden md:inline">Active Staff:</span>
              <select
                aria-label="Switch User Profile"
                value={currentUser.id}
                onChange={(e) => {
                  const target = allUsers.find((u) => u.id === Number(e.target.value));
                  if (target) onSwitchUser(target);
                }}
                className="bg-transparent font-semibold text-slate-800 border-none focus:outline-none cursor-pointer pr-1"
              >
                {allUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName} ({u.role.replace('ROLE_', '')})
                  </option>
                ))}
              </select>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${currentRoleInfo.badge}`}>
                {currentRoleInfo.label}
              </span>
            </div>

            {/* Clean Sign Out Button */}
            <button
              onClick={onSignOut}
              title="Sign out of Hostalix workstation"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-rose-700 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-100 overflow-x-auto">
        <nav className="flex space-x-1 py-1" aria-label="Tabs">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? item.highlight
                      ? 'bg-slate-900 text-teal-300'
                      : 'bg-teal-50 text-teal-800 border border-teal-200 font-bold'
                    : item.highlight
                    ? 'text-slate-700 bg-slate-100 hover:bg-slate-200 font-medium'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? (item.highlight ? 'text-teal-300' : 'text-teal-700') : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.highlight && (
                  <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded bg-teal-500/20 text-teal-300 uppercase tracking-wider font-mono">
                    Java 21
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
