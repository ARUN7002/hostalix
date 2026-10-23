import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Sparkles,
  X,
  Send,
  Minimize2,
  Maximize2,
  Stethoscope,
  Bot,
  User as UserIcon,
  RotateCcw,
  Pill,
  Search,
  Bed,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { Patient, Doctor, Department, Appointment, Invoice } from '../types/hms';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

interface MiniAIChatbotProps {
  patients: Patient[];
  doctors: Doctor[];
  departments: Department[];
  appointments: Appointment[];
  invoices: Invoice[];
}

export const MiniAIChatbot: React.FC<MiniAIChatbotProps> = ({
  patients,
  doctors,
  departments,
  appointments,
  invoices,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: 'Hello! I am **Hostalix MedBot**, your clinical AI assistant. You can ask me to look up patients, check bed occupancy, verify drug interactions, check doctor schedules, or explain clinical triage protocols.',
      timestamp: 'Just now',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Client-side clinical reasoning engine for instant and resilient responses
  const generateLocalResponse = (query: string): string => {
    const q = query.toLowerCase();

    // 1. Patient Lookup
    for (const pat of patients) {
      if (
        q.includes(pat.firstName.toLowerCase()) ||
        q.includes(pat.lastName.toLowerCase()) ||
        q.includes(pat.mrn.toLowerCase())
      ) {
        return `📋 **Patient Record Found**:
- **Name**: ${pat.firstName} ${pat.lastName} (${pat.mrn})
- **DOB / Age**: ${pat.dateOfBirth} (${new Date().getFullYear() - new Date(pat.dateOfBirth).getFullYear()} yrs), Blood Type: **${pat.bloodGroup}**
- **Triage Level**: ${pat.triageLevel}
- **Known Allergies**: ${pat.allergies.length > 0 ? pat.allergies.join(', ') : 'None documented (NKDA)'}
- **Ward Assignment**: ${pat.assignedWard ? `${pat.assignedWard} - ${pat.bedNumber || 'Bed Assigned'}` : 'Outpatient (Not Admitted)'}
- **Emergency Contact**: ${pat.emergencyContact.name} (${pat.emergencyContact.relationship}) - ${pat.emergencyContact.phone}`;
      }
    }

    // 2. Bed Occupancy
    if (q.includes('bed') || q.includes('occupancy') || q.includes('ward') || q.includes('capacity')) {
      const totalBeds = departments.reduce((acc, d) => acc + d.totalBeds, 0);
      const occupiedBeds = departments.reduce((acc, d) => acc + d.occupiedBeds, 0);
      const rate = Math.round((occupiedBeds / totalBeds) * 100);
      const breakdown = departments
        .map((d) => `  • **${d.name}**: ${d.occupiedBeds}/${d.totalBeds} beds (${Math.round((d.occupiedBeds / d.totalBeds) * 100)}%)`)
        .join('\n');

      return `🏥 **Hostalix Inpatient Bed Census**:
- **Total Hospital Capacity**: ${occupiedBeds} occupied of ${totalBeds} licensed beds (**${rate}% overall capacity**).
- **Available Beds**: ${totalBeds - occupiedBeds} beds open for admissions.

**Departmental Distribution**:
${breakdown}

${rate > 80 ? '⚠️ *Alert: Hospital census is above 80%. Triage divert protocols should be reviewed for Emergency admissions.*' : '✅ *Bed census remains within optimal operational limits.*'}`;
    }

    // 3. Drug Interaction checks
    if (
      (q.includes('nitroglycerin') && q.includes('metoprolol')) ||
      (q.includes('drug') && q.includes('interaction'))
    ) {
      return `💊 **Clinical Drug Interaction Alert**:
- **Drugs**: Nitroglycerin (Vasodilator) + Metoprolol (Beta-Blocker).
- **Severity**: Moderate interaction.
- **Mechanism**: Concomitant administration may produce additive hypotensive effects and bradycardia.
- **Clinical Recommendation**: Monitor patient blood pressure and heart rate closely after dose titration. Advise patient regarding orthostatic dizziness when standing up.`;
    }

    if (q.includes('penicillin') || (q.includes('allergy') && q.includes('antibiotic'))) {
      return `⚠️ **Penicillin Allergy Protocol**:
- Patients with documented Penicillin hypersensitivity (e.g. Arthur Pendleton, MRN-2026-001) must **NOT** receive amoxicillin, ampicillin, piperacillin, or first-generation cephalosporins without allergist clearance.
- **Recommended Alternatives**: Macrolides (Azithromycin/Clarithromycin), Fluoroquinolones, or Doxycycline depending on culture indications.`;
    }

    // 4. Doctor fee / Schedule lookup
    if (q.includes('doctor') || q.includes('physician') || q.includes('vance') || q.includes('fee') || q.includes('cost') || q.includes('rate')) {
      const docsSummary = doctors
        .map((d) => {
          const yuanFee = (d.consultationFee * 7.25).toFixed(2);
          const docName = `Dr. ${d.firstName} ${d.lastName}${d.chineseName ? ` · ${d.chineseName}` : ''}`;
          return `• **${docName}** (${d.specialization}) — Fee: **$${d.consultationFee.toFixed(2)} (¥${yuanFee})** | Room: ${d.roomNumber} | Duty: ${d.availableDays.join(', ')}`;
        })
        .join('\n');

      return `🩺 **Hostalix Attending Medical Staff Directory & Dual Tariffs**:
${docsSummary}

All consultation slots are 30 minutes with collision-prevention scheduling.
Two types of payment accepted: **Type 1: Dollar ($ USD)** and **Type 2: Yuan (¥ CNY)**.`;
    }

    // 5. Triage protocol for chest pain / emergency
    if (q.includes('chest pain') || q.includes('triage') || q.includes('emergency') || q.includes('heart attack')) {
      return `🚨 **Acute Chest Pain Emergency Triage Protocol**:
1. **Immediate ECG**: Obtain and interpret 12-lead standard ECG within 10 minutes of arrival.
2. **Vitals & Oxygenation**: Continuous pulse oximetry ($\text{SpO}_2 > 94\%$), blood pressure, and telemetry monitor.
3. **Biomarkers**: Draw High-Sensitivity Cardiac Troponin-I and basic metabolic panel.
4. **Initial Pharmacotherapy**: Aspirin 300mg chewed (if no active gastrointestinal bleed/allergy), sublingual Nitroglycerin 0.4mg PRN (unless systolic BP < 90 mmHg).
5. **Disposition**: Alert on-duty cardiologist (Dr. Elena Vance · 万斯医生) if ST-elevation is identified.`;
    }

    // 6. Billing / revenue query
    if (q.includes('bill') || q.includes('revenue') || q.includes('finance') || q.includes('tax') || q.includes('payment') || q.includes('yuan') || q.includes('dollar')) {
      const totalPaid = invoices
        .filter((i) => i.status === 'PAID')
        .reduce((acc, i) => acc + i.totalAmount, 0);
      const totalPending = invoices
        .filter((i) => i.status === 'PENDING')
        .reduce((acc, i) => acc + i.totalAmount, 0);

      const paidYuan = (totalPaid * 7.25).toFixed(2);
      const pendingYuan = (totalPending * 7.25).toFixed(2);

      return `💳 **Hostalix Dual-Currency Financial Ledger & Payment Types**:
- **Gross Settled Revenue**: $${totalPaid.toFixed(2)} / ¥${paidYuan}
- **Outstanding Receivables**: $${totalPending.toFixed(2)} / ¥${pendingYuan}
- **Healthcare Levy Rate**: 5.0% standard clinical tax applied to net taxable service items.
- **Two Accepted Payment Types**:
  1. **Type 1: Dollar ($ USD)** — Credit/Debit Cards (Visa/Mastercard Chip & PIN), Cash Counter, Direct Health Insurance Pre-Auth, and Bank Wire.
  2. **Type 2: Yuan (¥ CNY)** — UnionPay Debit Cards, Cash Counter, Digital Clearing (Mobile Barcode / QR Pay), and Medical Pre-Auth Clearing.
- **Fixed Clearing Exchange Rate**: 1.00 USD = 7.25 CNY.`;
    }

    // Default general response
    return `I understand your clinical query regarding "${query}".
As **Hostalix MedBot**, I am connected to the hospital EMR, doctor schedules, bed occupancy counters, and financial ledgers.
- You can ask to look up any patient (e.g. *"Look up patient Beatrix Hawthorne"*).
- Check current ward bed capacity (e.g. *"Show ICU & Cardiology beds"*).
- Review drug interactions or emergency triage guidance.`;
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    // Build hospital snapshot context to feed the AI
    const hospitalContext = `
Hospital: Hostalix Hospital Management System
Total Patients in EMR: ${patients.length} (Sample: ${patients.slice(0, 3).map((p) => `${p.firstName} ${p.lastName} [${p.mrn}, Blood: ${p.bloodGroup}]`).join(', ')})
Doctors on Duty: ${doctors.map((d) => `Dr. ${d.lastName} (${d.specialization}, Room ${d.roomNumber})`).join('; ')}
Departments: ${departments.map((d) => `${d.name}: ${d.occupiedBeds}/${d.totalBeds} beds`).join('; ')}
Today's Scheduled Appointments: ${appointments.length}
`;

    try {
      // Attempt backend Gemini call
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          systemContext: hospitalContext,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.reply) {
          const aiMsg: ChatMessage = {
            id: 'ai-' + Date.now(),
            sender: 'assistant',
            text: data.reply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          setMessages((prev) => [...prev, aiMsg]);
          setIsLoading(false);
          return;
        }
      }
    } catch {
      // Server error or offline -> proceed to local clinical reasoning
    }

    // Fallback to local clinical engine
    setTimeout(() => {
      const reply = generateLocalResponse(text);
      const aiMsg: ChatMessage = {
        id: 'ai-' + Date.now(),
        sender: 'assistant',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsLoading(false);
    }, 450);
  };

  const quickChips = [
    { label: 'Doctor Tariffs ($ / ¥)', query: 'Show doctor consultation fees and room numbers' },
    { label: 'Two Payment Types', query: 'Explain Dollar and Yuan payment types and clearing' },
    { label: 'Bed Capacity', query: 'What is our current bed occupancy?' },
    { label: 'Patient: Arthur Pendleton', query: 'Find patient Arthur Pendleton' },
    { label: 'Drug Interaction Check', query: 'Check interaction between Nitroglycerin and Metoprolol' },
    { label: 'Chest Pain Triage', query: 'Protocol for acute chest pain triage' },
  ];

  return (
    <div className="fixed bottom-5 right-5 z-40 font-sans">
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center space-x-2.5 bg-gradient-to-r from-teal-600 to-slate-900 text-white px-4 py-3 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200 cursor-pointer border border-teal-400/30"
          title="Open Hostalix Clinical AI Assistant"
        >
          <div className="relative">
            <div className="h-7 w-7 rounded-full bg-teal-400/20 flex items-center justify-center text-teal-300">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-slate-900 animate-pulse"></span>
          </div>
          <div className="text-left pr-1">
            <span className="block text-xs font-bold leading-tight tracking-wide">
              Hostalix MedBot
            </span>
            <span className="block text-[10px] text-teal-200/80 leading-tight">
              Clinical AI Assistant
            </span>
          </div>
        </button>
      )}

      {/* Floating Chat Modal */}
      {isOpen && (
        <div
          className={`bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden transition-all duration-200 ${
            isExpanded
              ? 'w-[95vw] sm:w-[680px] h-[80vh] fixed bottom-6 right-6 z-50'
              : 'w-[92vw] sm:w-[410px] h-[520px]'
          }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white px-4 py-3.5 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center space-x-2.5">
              <div className="h-8 w-8 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center border border-teal-400/30">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <h3 className="text-xs font-bold text-white">Hostalix MedBot</h3>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                  <span className="text-[10px] font-mono text-teal-300 bg-teal-900/60 px-1 rounded">
                    AI Active
                  </span>
                </div>
                <p className="text-[10px] text-slate-300">
                  Hospital EMR &amp; Clinical Knowledge Engine
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={() =>
                  setMessages([
                    {
                      id: 'welcome-reset',
                      sender: 'assistant',
                      text: 'Chat history cleared. How can I assist you in the hospital workstation?',
                      timestamp: 'Just now',
                    },
                  ])
                }
                title="Clear Conversation"
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? 'Minimize' : 'Expand'}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                {isExpanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close Assistant"
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-3.5 space-y-3 overflow-y-auto bg-slate-50/70 text-xs">
            {messages.map((msg) => {
              const isAssistant = msg.sender === 'assistant';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start space-x-2 ${
                    isAssistant ? 'justify-start' : 'justify-end'
                  }`}
                >
                  {isAssistant && (
                    <div className="h-6 w-6 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0 text-[10px] mt-0.5">
                      <Bot className="h-3.5 w-3.5" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs shadow-xs ${
                      isAssistant
                        ? 'bg-white text-slate-800 border border-slate-200'
                        : 'bg-teal-600 text-white font-medium'
                    }`}
                  >
                    <div className="whitespace-pre-line leading-relaxed">{msg.text}</div>
                    <div
                      className={`text-[9px] mt-1 text-right ${
                        isAssistant ? 'text-slate-400' : 'text-teal-100'
                      }`}
                    >
                      {msg.timestamp}
                    </div>
                  </div>

                  {!isAssistant && (
                    <div className="h-6 w-6 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0 text-[10px] mt-0.5">
                      <UserIcon className="h-3.5 w-3.5" />
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center space-x-2 text-slate-400 text-xs pl-8">
                <div className="h-2 w-2 rounded-full bg-teal-500 animate-bounce"></div>
                <div className="h-2 w-2 rounded-full bg-teal-500 animate-bounce [animation-delay:0.2s]"></div>
                <div className="h-2 w-2 rounded-full bg-teal-500 animate-bounce [animation-delay:0.4s]"></div>
                <span className="text-[11px] text-slate-500 font-medium">
                  Hostalix AI analyzing medical context...
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Query Chips */}
          <div className="p-2 bg-white border-t border-slate-100 overflow-x-auto whitespace-nowrap flex space-x-1.5">
            {quickChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(chip.query)}
                disabled={isLoading}
                className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-800 border border-slate-200 transition-colors cursor-pointer shrink-0"
              >
                <span>{chip.label}</span>
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-2.5 bg-white border-t border-slate-200 flex items-center space-x-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask Hostalix AI about patients, beds, meds..."
              disabled={isLoading}
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 text-slate-800"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="p-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-xs"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
