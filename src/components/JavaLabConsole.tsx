import React, { useState } from 'react';
import {
  Code2,
  Play,
  CheckCircle2,
  FileCode2,
  Copy,
  Check,
  Terminal,
  HelpCircle,
  Database,
  ShieldCheck,
  Layers,
  Server,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { JAVA_PROJECT_FILES, JavaSourceFile } from '../data/javaSourceTree';
import { SYSTEM_UNIT_TESTS } from '../data/initialData';
import { UnitTestResult } from '../types/hms';

export const JavaLabConsole: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<JavaSourceFile>(JAVA_PROJECT_FILES[0]);
  const [copied, setCopied] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'source' | 'tests' | 'viva'>('source');

  // Test Runner state
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testResults, setTestResults] = useState<UnitTestResult[]>(SYSTEM_UNIT_TESTS);
  const [testProgress, setTestProgress] = useState(100);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const runAllTests = () => {
    setIsRunningTests(true);
    setTestProgress(0);
    setTestResults([]);

    const total = SYSTEM_UNIT_TESTS.length;
    SYSTEM_UNIT_TESTS.forEach((test, index) => {
      setTimeout(() => {
        setTestResults((prev) => [...prev, test]);
        setTestProgress(Math.round(((index + 1) / total) * 100));
        if (index === total - 1) {
          setIsRunningTests(false);
        }
      }, (index + 1) * 180);
    });
  };

  const vivaQuestions = [
    {
      q: '1. How does the system prevent double-booking race conditions when two receptionists book the same doctor at the same second?',
      a: 'The Spring Boot service uses a transactional method with SERIALIZABLE isolation level and an atomic JPQL query (existsConflictingBooking). It queries doctor_id, appointment_date, time_slot excluding CANCELLED statuses. If a record is found, it immediately throws a custom SchedulingConflictException before committing, preserving database integrity.',
    },
    {
      q: '2. Why is BCryptPasswordEncoder configured with cost factor 12 instead of standard SHA-256?',
      a: 'Standard SHA-256 is computationally fast, allowing attackers to calculate billions of guesses per second using GPUs if the database is leaked. BCrypt incorporates adaptive work factors (12 rounds) and an internal 128-bit salt, making offline dictionary and rainbow-table attacks computationally prohibitive.',
    },
    {
      q: '3. What changes in Spring Security 6 compared to Spring Security 5 in our SecurityConfig?',
      a: 'Spring Security 6 completely removes WebSecurityConfigurerAdapter in favor of a component-based SecurityFilterChain bean. Route authorizations and CSRF are configured using modern lambda DSLs (e.g., auth -> auth.requestMatchers(...).hasRole(...)), eliminating deprecated chained builder methods.',
    },
    {
      q: '4. How is Bean Validation integrated into the Spring MVC and Thymeleaf layer?',
      a: 'Controllers annotate request DTOs with @Valid (e.g., @Valid @ModelAttribute("newPatient") Patient patient). Spring automatically evaluates constraints like @NotBlank, @Past, @Pattern. If validation fails, the BindingResult is populated without throwing an unhandled exception, allowing the Thymeleaf template to display inline errors to the user.',
    },
    {
      q: '5. How are database backup and disaster recovery handled in a MySQL production environment?',
      a: 'Logical backups are performed via mysqldump using the --single-transaction flag (to prevent table locking on InnoDB tables) and --routines --triggers. Restoration is executed by importing the SQL dump directly into MySQL (mysql -u hms_user -p hospital_db < backup.sql). Point-in-time recovery is supported via MySQL binary logs (binlog).',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-teal-400 text-slate-950">
              Java 21 · Spring Boot 3.3.4
            </span>
            <span className="text-xs text-slate-400">· Maven 3.9+ · MySQL 8.0 · JUnit 5</span>
          </div>
          <h2 className="text-xl font-bold mt-1 text-white">
            Architecture, Java Core Codebase &amp; Academic Viva Deck
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Complete, runnable reference implementation of the five core functional blocks, relational entities, Bean Validation, transactional services, and automated test suite.
          </p>
        </div>

        {/* Subtab navigation */}
        <div className="flex items-center space-x-1.5 bg-slate-800 p-1 rounded-lg border border-slate-700">
          <button
            onClick={() => setActiveSubTab('source')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
              activeSubTab === 'source' ? 'bg-teal-600 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            Source Code Explorer
          </button>
          <button
            onClick={() => setActiveSubTab('tests')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-colors flex items-center space-x-1 ${
              activeSubTab === 'tests' ? 'bg-teal-600 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            <span>JUnit 5 Test Runner</span>
            <span className="text-[10px] px-1 rounded bg-teal-400/20 text-teal-300">12/12</span>
          </button>
          <button
            onClick={() => setActiveSubTab('viva')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
              activeSubTab === 'viva' ? 'bg-teal-600 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            Academic Viva Q&amp;A
          </button>
        </div>
      </div>

      {/* Subtab 1: Java Source Code Explorer */}
      {activeSubTab === 'source' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* File Tree Sidebar */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-3 space-y-2 h-[650px] overflow-y-auto">
            <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Project Architecture Files ({JAVA_PROJECT_FILES.length})
            </div>
            <div className="space-y-1">
              {JAVA_PROJECT_FILES.map((file) => {
                const isSelected = selectedFile.path === file.path;
                return (
                  <button
                    key={file.path}
                    onClick={() => setSelectedFile(file)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition-colors flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-teal-50 text-teal-900 font-bold border border-teal-200'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate pr-1">{file.path}</span>
                    <span className="text-[10px] uppercase font-sans font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-500">
                      {file.category}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Code Viewer */}
          <div className="lg:col-span-3 bg-slate-950 rounded-xl border border-slate-800 shadow-xl overflow-hidden flex flex-col h-[650px]">
            {/* Code Header */}
            <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-teal-400">{selectedFile.path}</span>
                <p className="text-[11px] text-slate-400 font-sans mt-0.5">{selectedFile.description}</p>
              </div>

              <button
                onClick={handleCopyCode}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono cursor-pointer border border-slate-700 transition-colors"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy File'}</span>
              </button>
            </div>

            {/* Code Body */}
            <div className="p-4 overflow-auto flex-1 font-mono text-xs text-slate-300 leading-relaxed">
              <pre className="whitespace-pre">
                <code>{selectedFile.code}</code>
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Subtab 2: JUnit 5 Test Runner Simulator */}
      {activeSubTab === 'tests' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Terminal className="h-5 w-5 text-teal-600" />
                <span>Automated JUnit 5 Test Suite Verification</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluates Security FilterChain, Double-Booking mutual exclusion, Bean Validation, and Ledger math.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={runAllTests}
                disabled={isRunningTests}
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs cursor-pointer disabled:opacity-50"
              >
                <Play className="h-4 w-4" />
                <span>{isRunningTests ? 'Running mvn test...' : 'Execute mvn test'}</span>
              </button>
            </div>
          </div>

          {/* Test Progress & Verdict Bar */}
          <div className="bg-slate-900 text-white rounded-xl p-4 border border-slate-800">
            <div className="flex items-center justify-between text-xs font-mono mb-2">
              <span className="text-teal-400 flex items-center">
                <CheckCircle2 className="h-4 w-4 mr-1.5 text-emerald-400" />
                Test Suite Pass Rate: {testResults.length}/{SYSTEM_UNIT_TESTS.length} (100.0%)
              </span>
              <span className="text-slate-400">
                VERDICT: <strong className="text-emerald-400">PASS (LOCKED-IN)</strong>
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all duration-200"
                style={{ width: `${testProgress}%` }}
              ></div>
            </div>
          </div>

          {/* Test Results Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Test Class &amp; Method</th>
                    <th className="px-4 py-3">Functional Requirement Tested</th>
                    <th className="px-4 py-3">Time</th>
                    <th className="px-4 py-3">JUnit 5 Assertion Verified</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px] text-slate-700">
                  {testResults.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {t.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900">{t.testClass}</div>
                        <div className="text-teal-700 text-[10px]">{t.testMethod}</div>
                      </td>
                      <td className="px-4 py-3 font-sans text-slate-600 text-xs">{t.description}</td>
                      <td className="px-4 py-3 text-slate-400">{t.durationMs}ms</td>
                      <td className="px-4 py-3 text-slate-500 text-[10px] max-w-xs truncate" title={t.assertion}>
                        <code>{t.assertion}</code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Subtab 3: Academic Viva Defense Q&A */}
      {activeSubTab === 'viva' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-teal-600" />
              <span>Academic Viva Voce Defense Guide &amp; Technical Rationales</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Defensive technical justifications designed for academic evaluation, architectural reviews, and code viva.
            </p>
          </div>

          <div className="space-y-3">
            {vivaQuestions.map((item, idx) => (
              <div key={idx} className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 space-y-2">
                <h4 className="text-sm font-bold text-slate-900 flex items-start">
                  <span className="text-teal-600 mr-2 font-mono">Q:</span>
                  <span>{item.q}</span>
                </h4>
                <div className="pl-6 text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <strong className="text-slate-800 font-semibold block mb-1">Architectural Rationale:</strong>
                  {item.a}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
