import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function LandingPage() {
  const { isAuthenticated, login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('board');
  const [loginLoading, setLoginLoading] = useState(false);

  const handleQuickLogin = async (email, password, roleName) => {
    try {
      setLoginLoading(true);
      await login(email, password);
      addToast(`Logged in as ${roleName}. Welcome to Northstar Engineering!`, 'success');
      navigate('/app/home');
    } catch (err) {
      addToast('Failed to log in with demo credentials. Please try again.', 'danger');
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div className="tf-page-container py-5">
      {/* ── 1. HERO SECTION (POCHYAA PARADIGM) ── */}
      <section className="text-center pt-4 pb-5">
        {/* Eyebrow Pill with Animated Ping Beacon */}
        <div className="d-flex justify-content-center mb-4">
          <div className="pochyaa-eyebrow">
            <span className="ping-beacon">
              <span className="ping-beacon-wave"></span>
              <span className="ping-beacon-dot"></span>
            </span>
            <span>CONTINUOUS WORKSPACE DISPATCH ENGINE</span>
            <span style={{ color: '#64748b' }}>•</span>
            <span style={{ color: '#38bdf8' }}>Sub-0.09ms Precision</span>
          </div>
        </div>

        {/* Hero Headline */}
        <h1 className="hero-headline mx-auto" style={{ maxWidth: '940px' }}>
          Stop running engineering projects on spreadsheets <span className="text-gradient-blue">before release deadlines</span> slip.
        </h1>

        {/* Hero Subhead */}
        <p className="hero-subhead">
          Commercial engineering teams lose <strong className="text-body fw-bold">18% to 28%</strong> of sprint velocity to untracked blockers, context switching, and phantom dependencies. TaskFlow unifies milestone roadmaps, fluid Kanban swimlanes, and forensic audit logs in under <strong className="text-body fw-bold">12ms</strong>.
        </p>

        {/* Hero Action Buttons */}
        <div className="d-flex justify-content-center align-items-center gap-3 flex-wrap mt-4 mb-4">
          {isAuthenticated ? (
            <Link to="/app/home" className="btn-pochyaa-primary">
              <i className="bi bi-grid-fill me-1"></i>
              <span>Enter Workspace</span>
              <i className="bi bi-arrow-right ms-1"></i>
            </Link>
          ) : (
            <>
              <button
                className="btn-pochyaa-primary"
                onClick={() => handleQuickLogin('demo@taskflow.dev', 'Password123!', 'Lead Engineer')}
                disabled={loginLoading}
              >
                <span>{loginLoading ? 'Entering Workspace...' : 'Deploy Work Management Engine'}</span>
                <i className="bi bi-arrow-right ms-1"></i>
              </button>
              <a href="#console-preview" className="btn-pochyaa-secondary">
                <i className="bi bi-eye text-primary me-1"></i>
                <span>Inspect Workspace Console</span>
              </a>
            </>
          )}
        </div>

        {/* Guarantee Ribbon */}
        <div className="d-flex flex-wrap align-items-center justify-content-center gap-4 text-xs font-monospace mt-3 text-secondary" style={{ fontSize: '0.8rem' }}>
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-check2 text-success fw-bold"></i>
            <span>Deterministic REST & MySQL • Sub-0.09ms B-Tree Queries</span>
          </div>
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-check2 text-success fw-bold"></i>
            <span>Strict Role-Based Access Isolation (RBAC)</span>
          </div>
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-check2 text-success fw-bold"></i>
            <span>Append-Only Forensic Activity Trail</span>
          </div>
        </div>
      </section>

      {/* ── 2. HERO INTERACTIVE CONSOLE WINDOW (POCHYAA CONSOLE SURFACE) ── */}
      <section id="console-preview" className="my-5">
        <div className="console-window-frame mx-auto" style={{ maxWidth: '1120px' }}>
          {/* Top Window Chrome */}
          <div className="console-window-chrome">
            <div className="d-flex align-items-center gap-2">
              <span className="traffic-dot" style={{ backgroundColor: '#f43f5e' }}></span>
              <span className="traffic-dot" style={{ backgroundColor: '#f59e0b' }}></span>
              <span className="traffic-dot" style={{ backgroundColor: '#10b981' }}></span>
              <span className="ms-2 font-monospace small" style={{ color: '#94a3b8', fontSize: '0.78rem' }}>
                taskflow_engine :: run_execution_dispatch (sync)
              </span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <span
                className="font-monospace small px-2 py-0.5 rounded fw-semibold"
                style={{
                  fontSize: '0.72rem',
                  background: 'rgba(16, 185, 129, 0.12)',
                  color: '#34d399',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                }}
              >
                ENGINE ONLINE • 0.08ms
              </span>
            </div>
          </div>

          {/* Console Surface Content */}
          <div className="console-window-surface">
            {/* KPI Status Row */}
            <div className="row g-3 mb-4">
              <div className="col-12 col-md-4">
                <div className="p-3 rounded-3" style={{ background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(51, 65, 85, 0.7)' }}>
                  <div className="text-muted small font-monospace">Active Sprint Scope</div>
                  <div className="text-white fw-bold fs-5 mt-1 font-monospace">SPRINT-2026-Q4</div>
                  <div className="small text-muted font-monospace mt-1">Initiative: Customer Portal v2 (PORT)</div>
                </div>
              </div>

              <div className="col-12 col-md-4">
                <div className="p-3 rounded-3" style={{ background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(51, 65, 85, 0.7)' }}>
                  <div className="text-muted small font-monospace">Milestone Delivery Window</div>
                  <div className="text-white fw-bold fs-5 mt-1 font-monospace">Nov 15, 2026</div>
                  <div className="small text-muted font-monospace mt-1">Velocity: 88% Target Reached • 0 Delayed</div>
                </div>
              </div>

              <div className="col-12 col-md-4">
                <div
                  className="p-3 rounded-3 d-flex flex-column justify-content-between"
                  style={{
                    background: 'rgba(59, 130, 246, 0.08)',
                    border: '1px solid rgba(59, 130, 246, 0.4)',
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="small font-monospace fw-semibold" style={{ color: '#93c5fd' }}>Blocker Sentinel</span>
                    <span className="badge font-monospace" style={{ background: '#2563eb', color: '#fff', fontSize: '9px' }}>ACTIVE GATE</span>
                  </div>
                  <div className="fs-4 fw-bold font-monospace mt-1" style={{ color: '#38bdf8' }}>0 Critical Drift</div>
                  <div className="small font-monospace" style={{ color: '#94a3b8' }}>Execution state synced via REST</div>
                </div>
              </div>
            </div>

            {/* Interactive View Selector Tabs */}
            <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom flex-wrap gap-2" style={{ borderColor: 'rgba(51, 65, 85, 0.6)' }}>
              <div className="d-flex align-items-center gap-1">
                <button
                  className={`btn btn-sm ${activeTab === 'board' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  style={{ borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 }}
                  onClick={() => setActiveTab('board')}
                >
                  <i className="bi bi-kanban me-1"></i> Kanban Swimlanes
                </button>
                <button
                  className={`btn btn-sm ${activeTab === 'overview' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  style={{ borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 }}
                  onClick={() => setActiveTab('overview')}
                >
                  <i className="bi bi-speedometer2 me-1"></i> Executive Cockpit
                </button>
                <button
                  className={`btn btn-sm ${activeTab === 'timeline' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  style={{ borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 }}
                  onClick={() => setActiveTab('timeline')}
                >
                  <i className="bi bi-bar-chart-steps me-1"></i> Gantt Timeline
                </button>
              </div>

              <div className="d-none d-sm-flex align-items-center gap-2 text-muted small font-monospace" style={{ fontSize: '0.75rem' }}>
                <i className="bi bi-shield-check text-success"></i>
                <span>Tenant: northstar-engineering (Org #1)</span>
              </div>
            </div>

            {/* TAB CONTENT: KANBAN BOARD */}
            {activeTab === 'board' && (
              <div className="pt-2">
                <div className="d-flex gap-3 overflow-x-auto pb-2">
                  {/* Column 1: Todo */}
                  <div className="flex-fill" style={{ minWidth: '230px' }}>
                    <div className="d-flex justify-content-between align-items-center mb-2 px-1">
                      <span className="small fw-semibold text-muted font-monospace">TO DO</span>
                      <span className="badge rounded-pill font-monospace" style={{ background: 'rgba(51, 65, 85, 0.8)', color: '#94a3b8' }}>2</span>
                    </div>
                    <div className="d-flex flex-column gap-2">
                      <div className="p-3 rounded-3" style={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(51, 65, 85, 0.7)' }}>
                        <div className="d-flex justify-content-between small mb-1">
                          <span className="fw-bold font-monospace" style={{ color: '#38bdf8', fontSize: '0.75rem' }}>PORT-104</span>
                          <span className="badge font-monospace" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>Medium</span>
                        </div>
                        <div className="text-white small fw-medium mb-2">Automate PDF invoice audit export generation</div>
                        <div className="d-flex justify-content-between align-items-center text-muted small font-monospace" style={{ fontSize: '0.75rem' }}>
                          <span><i className="bi bi-calendar2 me-1"></i> Nov 18</span>
                          <span className="badge rounded-circle p-1" style={{ background: '#3b82f6', color: '#fff', width: 22, height: 22 }}>SK</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Column 2: In Progress */}
                  <div className="flex-fill" style={{ minWidth: '230px' }}>
                    <div className="d-flex justify-content-between align-items-center mb-2 px-1">
                      <span className="small fw-semibold font-monospace" style={{ color: '#38bdf8' }}>IN PROGRESS</span>
                      <span className="badge rounded-pill font-monospace" style={{ background: '#2563eb', color: '#fff' }}>2</span>
                    </div>
                    <div className="d-flex flex-column gap-2">
                      <div className="p-3 rounded-3" style={{ background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(59, 130, 246, 0.45)', borderLeft: '3px solid #3b82f6' }}>
                        <div className="d-flex justify-content-between small mb-1">
                          <span className="fw-bold font-monospace" style={{ color: '#38bdf8', fontSize: '0.75rem' }}>PORT-101</span>
                          <span className="badge font-monospace" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>High</span>
                        </div>
                        <div className="text-white small fw-medium mb-2">Implement OAuth2 Google authentication flow</div>
                        <div className="d-flex justify-content-between align-items-center text-muted small font-monospace" style={{ fontSize: '0.75rem' }}>
                          <span className="text-success"><i className="bi bi-check2-square me-1"></i> 3/4 subtasks</span>
                          <span className="badge rounded-circle p-1" style={{ background: '#6366f1', color: '#fff', width: 22, height: 22 }}>AP</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Column 3: Review */}
                  <div className="flex-fill" style={{ minWidth: '230px' }}>
                    <div className="d-flex justify-content-between align-items-center mb-2 px-1">
                      <span className="small fw-semibold font-monospace" style={{ color: '#06b6d4' }}>REVIEW</span>
                      <span className="badge rounded-pill font-monospace" style={{ background: 'rgba(6, 182, 212, 0.2)', color: '#22d3ee' }}>1</span>
                    </div>
                    <div className="d-flex flex-column gap-2">
                      <div className="p-3 rounded-3" style={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(51, 65, 85, 0.7)' }}>
                        <div className="d-flex justify-content-between small mb-1">
                          <span className="fw-bold font-monospace" style={{ color: '#38bdf8', fontSize: '0.75rem' }}>PORT-103</span>
                          <span className="badge font-monospace" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>Medium</span>
                        </div>
                        <div className="text-white small fw-medium mb-2">Design system tokens and responsive audit</div>
                        <div className="d-flex justify-content-between align-items-center text-muted small font-monospace" style={{ fontSize: '0.75rem' }}>
                          <span style={{ color: '#22d3ee' }}><i className="bi bi-git me-1"></i> PR #42</span>
                          <span className="badge rounded-circle p-1" style={{ background: '#06b6d4', color: '#fff', width: 22, height: 22 }}>SR</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Column 4: Done */}
                  <div className="flex-fill" style={{ minWidth: '230px' }}>
                    <div className="d-flex justify-content-between align-items-center mb-2 px-1">
                      <span className="small fw-semibold text-success font-monospace">DONE</span>
                      <span className="badge rounded-pill font-monospace" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399' }}>3</span>
                    </div>
                    <div className="d-flex flex-column gap-2">
                      <div className="p-3 rounded-3 opacity-75" style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(51, 65, 85, 0.5)' }}>
                        <div className="d-flex justify-content-between small mb-1">
                          <span className="fw-bold font-monospace text-muted" style={{ fontSize: '0.75rem' }}>PORT-100</span>
                          <span className="badge font-monospace" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>Verified</span>
                        </div>
                        <div className="text-muted text-decoration-line-through small fw-medium mb-2">Database schema migration and B-Tree indexes</div>
                        <div className="d-flex justify-content-between align-items-center text-muted small font-monospace" style={{ fontSize: '0.75rem' }}>
                          <span className="text-success"><i className="bi bi-check-all me-1"></i> Merged</span>
                          <span className="badge rounded-circle p-1" style={{ background: '#10b981', color: '#fff', width: 22, height: 22 }}>ML</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: EXECUTIVE COCKPIT */}
            {activeTab === 'overview' && (
              <div className="pt-2">
                <div className="row g-3 mb-3">
                  <div className="col-6 col-md-3">
                    <div className="p-3 rounded-3" style={{ background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(51, 65, 85, 0.7)' }}>
                      <div className="text-muted small font-monospace">Active Work Items</div>
                      <div className="fs-3 fw-bold text-white font-monospace">24</div>
                      <span className="text-success small fw-medium">↑ 4 completed today</span>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="p-3 rounded-3" style={{ background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(51, 65, 85, 0.7)' }}>
                      <div className="text-muted small font-monospace">In Progress</div>
                      <div className="fs-3 fw-bold font-monospace" style={{ color: '#38bdf8' }}>8</div>
                      <span className="text-muted small font-monospace">Across 4 projects</span>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="p-3 rounded-3" style={{ background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(51, 65, 85, 0.7)' }}>
                      <div className="text-muted small font-monospace">High Priority</div>
                      <div className="fs-3 fw-bold font-monospace" style={{ color: '#fbbf24' }}>5</div>
                      <span className="text-muted small font-monospace">Under active triage</span>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="p-3 rounded-3" style={{ background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(51, 65, 85, 0.7)' }}>
                      <div className="text-muted small font-monospace">Blocked Items</div>
                      <div className="fs-3 fw-bold font-monospace text-danger">0</div>
                      <span className="text-success small fw-medium font-monospace">All clear</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-3" style={{ background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(51, 65, 85, 0.7)' }}>
                  <div className="d-flex justify-content-between align-items-center mb-2 font-monospace small">
                    <span className="text-white fw-bold">Active Delivery Streams</span>
                    <span className="text-muted">4 Initiatives</span>
                  </div>
                  <div className="d-flex flex-column gap-3">
                    <div>
                      <div className="d-flex justify-content-between small mb-1 font-monospace">
                        <span className="text-white">Customer Portal v2 (PORT)</span>
                        <span className="text-muted">75% Complete</span>
                      </div>
                      <div className="progress" style={{ height: '7px', background: 'rgba(51, 65, 85, 0.6)' }}>
                        <div className="progress-bar bg-primary" style={{ width: '75%', borderRadius: '4px' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="d-flex justify-content-between small mb-1 font-monospace">
                        <span className="text-white">Platform Reliability & Database Indexing (REL)</span>
                        <span className="text-muted">83% Complete</span>
                      </div>
                      <div className="progress" style={{ height: '7px', background: 'rgba(51, 65, 85, 0.6)' }}>
                        <div className="progress-bar bg-success" style={{ width: '83%', borderRadius: '4px' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: GANTT TIMELINE */}
            {activeTab === 'timeline' && (
              <div className="pt-2">
                <div className="p-3 rounded-3" style={{ background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(51, 65, 85, 0.7)' }}>
                  <div className="d-flex flex-column gap-3">
                    <div>
                      <div className="d-flex justify-content-between small mb-1 font-monospace">
                        <span className="text-white fw-bold">Customer Portal v2 — Production Release</span>
                        <span className="text-muted">Oct 20 → Nov 15</span>
                      </div>
                      <div className="position-relative" style={{ height: '26px', backgroundColor: 'rgba(51, 65, 85, 0.4)', borderRadius: '6px' }}>
                        <div
                          className="position-absolute top-0 bottom-0 bg-primary rounded d-flex align-items-center px-2 text-white font-monospace small"
                          style={{ left: '10%', width: '65%' }}
                        >
                          <span className="text-truncate" style={{ fontSize: 11 }}>Active Development (75%)</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="d-flex justify-content-between small mb-1 font-monospace">
                        <span className="text-white fw-bold">Platform Reliability & MySQL B-Tree Indexing</span>
                        <span className="text-muted">Oct 15 → Nov 05</span>
                      </div>
                      <div className="position-relative" style={{ height: '26px', backgroundColor: 'rgba(51, 65, 85, 0.4)', borderRadius: '6px' }}>
                        <div
                          className="position-absolute top-0 bottom-0 bg-success rounded d-flex align-items-center px-2 text-white font-monospace small"
                          style={{ left: '5%', width: '80%' }}
                        >
                          <span className="text-truncate" style={{ fontSize: 11 }}>Complete & Verified (100%)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Floating Assurance Badge */}
            <div className="mt-4 pt-3 border-top d-flex justify-content-between align-items-center flex-wrap gap-2" style={{ borderColor: 'rgba(51, 65, 85, 0.6)' }}>
              <div className="d-flex align-items-center gap-2 font-monospace small text-muted" style={{ fontSize: '0.75rem' }}>
                <i className="bi bi-cpu text-primary"></i>
                <span>Deterministic REST Dispatch • Zero LLM Hallucinations on State</span>
              </div>
              <div
                className="px-2 py-1 rounded font-monospace small d-inline-flex align-items-center gap-2"
                style={{
                  background: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  color: '#93c5fd',
                  fontSize: '0.75rem',
                }}
              >
                <i className="bi bi-lock-fill text-primary"></i>
                <span>Deterministic MySQL B-Tree • Zero Sync Drift</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. ENTERPRISE SECTOR TICKER (POCHYAA PARADIGM) ── */}
      <section className="py-4 my-5 text-center">
        <div className="text-uppercase font-mono small fw-bold tracking-wider mb-4" style={{ fontSize: '0.75rem', color: 'var(--tf-text-muted)', letterSpacing: '0.08em' }}>
          ENGINEERED FOR HIGH-VELOCITY ENGINEERING & PRODUCT TEAMS ACROSS SECTORS
        </div>
        <div className="d-flex justify-content-center align-items-center gap-3 gap-md-4 flex-wrap font-monospace text-muted small">
          <div className="sector-ticker-chip">
            <i className="bi bi-wallet2 text-primary"></i>
            <span className="text-slate-300">FinTech & Core Banking</span>
          </div>
          <div className="sector-ticker-chip">
            <i className="bi bi-cloud-check text-info"></i>
            <span className="text-slate-300">Distributed Cloud SaaS</span>
          </div>
          <div className="sector-ticker-chip">
            <i className="bi bi-heart-pulse text-danger"></i>
            <span className="text-slate-300">Healthcare Systems</span>
          </div>
          <div className="sector-ticker-chip">
            <i className="bi bi-cart3 text-warning"></i>
            <span className="text-slate-300">High-Volume E-Commerce</span>
          </div>
          <div className="sector-ticker-chip">
            <i className="bi bi-truck text-success"></i>
            <span className="text-slate-300">Logistics & Infrastructure</span>
          </div>
        </div>
      </section>

      {/* ── 4. PARADIGMS OF ASSURANCE (POCHYAA COMPARISON SECTION) ── */}
      <section className="py-5 my-4">
        <div className="text-center mb-5">
          <div className="font-monospace text-uppercase fw-bold text-primary small mb-2" style={{ letterSpacing: '0.08em', fontSize: '0.78rem' }}>
            PARADIGMS OF WORK ASSURANCE
          </div>
          <h2 className="fw-extrabold text-body tracking-tight" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
            Why Disconnected Task Trackers Are Costing Your Team Weeks
          </h2>
          <p className="text-secondary mx-auto mt-3" style={{ maxWidth: '680px', fontSize: '1.05rem', lineHeight: 1.6 }}>
            Traditional disconnected tools leave tasks buried in chat threads and static spreadsheets. By release week, context has dissolved, blockers are caught late, and triage turns adversarial.
          </p>
        </div>

        <div className="row g-4 mx-auto" style={{ maxWidth: '1080px' }}>
          {/* Problem Card (The Drift Bucket) */}
          <div className="col-12 col-md-6">
            <div className="compare-bucket-problem">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex align-items-center gap-2">
                  <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: 32, height: 32, background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}>
                    <i className="bi bi-x-lg"></i>
                  </div>
                  <h5 className="fw-bold text-body mb-0">Legacy Disconnected Tooling</h5>
                </div>
                <span className="badge font-monospace" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', fontSize: '10px' }}>
                  THE DRIFT BUCKET
                </span>
              </div>

              <ul className="list-unstyled d-flex flex-column gap-3 mb-0 small">
                <li className="d-flex align-items-start gap-2">
                  <i className="bi bi-x-circle text-danger mt-1"></i>
                  <div>
                    <strong className="text-body fw-bold">Delayed Discovery:</strong> Blockers surface on release eve instead of sprint day one when they could be resolved.
                  </div>
                </li>
                <li className="d-flex align-items-start gap-2">
                  <i className="bi bi-x-circle text-danger mt-1"></i>
                  <div>
                    <strong className="text-body fw-bold">Lost Architectural Context:</strong> Critical design decisions vanish into 10 disconnected Slack threads.
                  </div>
                </li>
                <li className="d-flex align-items-start gap-2">
                  <i className="bi bi-x-circle text-danger mt-1"></i>
                  <div>
                    <strong className="text-body fw-bold">Phantom Dependencies:</strong> Upstream blockers remain untracked until pull request reviews stall out.
                  </div>
                </li>
                <li className="d-flex align-items-start gap-2">
                  <i className="bi bi-x-circle text-danger mt-1"></i>
                  <div>
                    <strong className="text-body fw-bold">Zero Audit Trail:</strong> No deterministic log of who changed status, estimate, milestone, or assignee.
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Solution Card (TaskFlow Pre-Emptive Gate) */}
          <div className="col-12 col-md-6">
            <div className="compare-bucket-solution">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex align-items-center gap-2">
                  <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: 32, height: 32, background: '#2563eb', color: '#ffffff' }}>
                    <i className="bi bi-check-lg"></i>
                  </div>
                  <h5 className="fw-bold text-body mb-0">TaskFlow Unified Work Engine</h5>
                </div>
                <span className="badge font-monospace" style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#2563eb', border: '1px solid rgba(59, 130, 246, 0.4)', fontSize: '10px' }}>
                  ZERO DRIFT
                </span>
              </div>

              <ul className="list-unstyled d-flex flex-column gap-3 mb-0 small">
                <li className="d-flex align-items-start gap-2">
                  <i className="bi bi-check2-circle text-success mt-1"></i>
                  <div>
                    <strong className="text-body fw-bold">Zero-Second Lag:</strong> Real-time Kanban sync and instantaneous state transitions via REST and optimistic UI.
                  </div>
                </li>
                <li className="d-flex align-items-start gap-2">
                  <i className="bi bi-check2-circle text-success mt-1"></i>
                  <div>
                    <strong className="text-body fw-bold">Explicit Blocker Escalation:</strong> Mandatory reason flag prevents stealth delays and highlights risks across swimlanes.
                  </div>
                </li>
                <li className="d-flex align-items-start gap-2">
                  <i className="bi bi-check2-circle text-success mt-1"></i>
                  <div>
                    <strong className="text-body fw-bold">Deterministic Subtask Checklists:</strong> Itemized execution state with verified progress counts per work item.
                  </div>
                </li>
                <li className="d-flex align-items-start gap-2">
                  <i className="bi bi-check2-circle text-success mt-1"></i>
                  <div>
                    <strong className="text-body fw-bold">Append-Only Forensic Audit Trail:</strong> Cryptographic-style event log records every status, user, and priority modification.
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. THREE-TIER ARCHITECTURAL FEATURE PILLARS (POCHYAA RULE TIERS) ── */}
      <section className="py-5 my-4">
        <div className="text-center mb-5">
          <div className="font-monospace text-uppercase fw-bold text-primary small mb-2" style={{ letterSpacing: '0.08em', fontSize: '0.78rem' }}>
            THREE-TIER WORKSPACE ARCHITECTURE
          </div>
          <h2 className="fw-extrabold text-body tracking-tight" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
            Engineered For Deterministic Delivery
          </h2>
          <p className="text-secondary mx-auto mt-2" style={{ maxWidth: '640px' }}>
            Every work item flows through three rigorous layers of planning, execution, and forensic governance.
          </p>
        </div>

        <div className="row g-4 mx-auto" style={{ maxWidth: '1120px' }}>
          {/* Tier 1 */}
          <div className="col-12 col-md-4">
            <div className="pochyaa-card p-4 h-100 d-flex flex-column justify-content-between">
              <div>
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div className="rounded-3 p-2 d-inline-flex" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
                    <i className="bi bi-kanban fs-5"></i>
                  </div>
                  <span className="font-monospace small text-primary fw-bold">TIER 1 • L1 PLANNING</span>
                </div>
                <h5 className="fw-bold text-body mb-2">Roadmaps & Delivery Windows</h5>
                <p className="text-muted small mb-4" style={{ lineHeight: 1.6 }}>
                  Organize complex engineering initiatives into high-level milestones and visual Gantt-style timeline schedules. View delivery dependencies before release week.
                </p>

                <div className="d-flex flex-column gap-2 font-monospace small">
                  <div className="tier-rule-row">
                    <span className="text-slate-300">PL-101 Milestone Delivery Windows</span>
                    <span className="badge bg-danger bg-opacity-10 text-danger" style={{ fontSize: '10px' }}>Critical</span>
                  </div>
                  <div className="tier-rule-row">
                    <span className="text-slate-300">PL-102 Multi-Project Portfolios</span>
                    <span className="badge bg-warning bg-opacity-10 text-warning" style={{ fontSize: '10px' }}>High</span>
                  </div>
                  <div className="tier-rule-row">
                    <span className="text-slate-300">PL-104 Health Scoring (0-100%)</span>
                    <span className="badge bg-success bg-opacity-10 text-success" style={{ fontSize: '10px' }}>Enforced</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-top text-muted small font-monospace" style={{ fontSize: '0.75rem' }}>
                Automated milestone progress and due date boundaries
              </div>
            </div>
          </div>

          {/* Tier 2 */}
          <div className="col-12 col-md-4">
            <div className="pochyaa-card p-4 h-100 d-flex flex-column justify-content-between">
              <div>
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div className="rounded-3 p-2 d-inline-flex" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4' }}>
                    <i className="bi bi-layout-three-columns fs-5"></i>
                  </div>
                  <span className="font-monospace small fw-bold" style={{ color: '#0891b2' }}>TIER 2 • L2 EXECUTION</span>
                </div>
                <h5 className="fw-bold text-body mb-2">Fluid Kanban & Multi-Views</h5>
                <p className="text-muted small mb-4" style={{ lineHeight: 1.6 }}>
                  Whether you prefer dense, spreadsheet-style tables or visual drag-and-drop Kanban swimlanes, status updates persist instantly with optimistic UI rollback.
                </p>

                <div className="d-flex flex-column gap-2 font-monospace small">
                  <div className="tier-rule-row">
                    <span className="text-slate-300">EX-201 5 Kanban Status Swimlanes</span>
                    <span className="badge bg-primary bg-opacity-10 text-primary" style={{ fontSize: '10px' }}>Active</span>
                  </div>
                  <div className="tier-rule-row">
                    <span className="text-slate-300">EX-202 Checklist Subtask Tally</span>
                    <span className="badge bg-success bg-opacity-10 text-success" style={{ fontSize: '10px' }}>Verified</span>
                  </div>
                  <div className="tier-rule-row">
                    <span className="text-slate-300">EX-204 Blocker Reason Sentinel</span>
                    <span className="badge bg-danger bg-opacity-10 text-danger" style={{ fontSize: '10px' }}>High</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-top text-muted small font-monospace" style={{ fontSize: '0.75rem' }}>
                Sub-0.09ms MySQL B-Tree indexing on status & priority
              </div>
            </div>
          </div>

          {/* Tier 3 */}
          <div className="col-12 col-md-4">
            <div className="pochyaa-card p-4 h-100 d-flex flex-column justify-content-between">
              <div>
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div className="rounded-3 p-2 d-inline-flex" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                    <i className="bi bi-shield-check fs-5"></i>
                  </div>
                  <span className="font-monospace small text-success fw-bold">TIER 3 • L3 GOVERNANCE</span>
                </div>
                <h5 className="fw-bold text-body mb-2">Forensic Audit & RBAC</h5>
                <p className="text-muted small mb-4" style={{ lineHeight: 1.6 }}>
                  Strict server-side policy enforcement prevents unauthorized mutations. An append-only audit trail captures every action for full enterprise compliance.
                </p>

                <div className="d-flex flex-column gap-2 font-monospace small">
                  <div className="tier-rule-row">
                    <span className="text-slate-300">GV-301 Role-Based Access (Admin/Member)</span>
                    <span className="badge bg-success bg-opacity-10 text-success" style={{ fontSize: '10px' }}>Enforced</span>
                  </div>
                  <div className="tier-rule-row">
                    <span className="text-slate-300">GV-302 Append-Only Audit Trail</span>
                    <span className="badge bg-primary bg-opacity-10 text-primary" style={{ fontSize: '10px' }}>Immutable</span>
                  </div>
                  <div className="tier-rule-row">
                    <span className="text-slate-300">GV-303 Grounded AI Task Decomposition</span>
                    <span className="badge bg-info bg-opacity-10 text-info" style={{ fontSize: '10px' }}>Grounded</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-top text-muted small font-monospace" style={{ fontSize: '0.75rem' }}>
                Full security perimeter with CSRF, CORS & IDOR policies
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. GROUNDED AI ASSISTANT SHOWCASE ── */}
      <section className="py-5 my-4">
        <div className="pochyaa-card p-4 p-md-5 mx-auto" style={{ maxWidth: '1080px' }}>
          <div className="row g-5 align-items-center">
            <div className="col-12 col-lg-6">
              <div className="d-flex align-items-center gap-2 mb-2 font-monospace text-primary small fw-semibold">
                <i className="bi bi-stars"></i>
                <span>GROUNDED AI ACCELERATOR</span>
              </div>
              <h3 className="fw-bold text-body mb-3">AI assistance that never hallucinates state.</h3>
              <p className="text-secondary mb-4" style={{ lineHeight: 1.65 }}>
                TaskFlow’s AI assistant accelerates daily work without taking unpredictable control. Convert natural language into structured work items, decompose complex initiatives into actionable checklists, and polish acceptance criteria—always with human preview and confirmation before anything writes to the database.
              </p>
              <div className="d-flex flex-column gap-2 small text-secondary font-monospace">
                <div><i className="bi bi-check2 text-success me-2"></i> Never executes blind database mutations</div>
                <div><i className="bi bi-check2 text-success me-2"></i> Deterministic heuristic engine fallback if AI service times out</div>
                <div><i className="bi bi-check2 text-success me-2"></i> Strict tenant isolation with zero data leakage</div>
              </div>
            </div>

            <div className="col-12 col-lg-6">
              <div className="ai-console-pane">
                <div className="d-flex align-items-center gap-2 pb-2 mb-2 border-bottom font-monospace small text-muted">
                  <i className="bi bi-terminal text-primary"></i>
                  <span>Natural Language Prompt</span>
                </div>
                <div className="ai-inner-box mb-3">
                  "Deploy Nginx security patches by Friday, high priority, assign to Daniel"
                </div>

                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="small fw-bold text-success font-monospace"><i className="bi bi-magic me-1"></i> AI Structured Draft Preview</span>
                  <span className="badge font-monospace" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)' }}>Confidence: 94%</span>
                </div>

                <div className="ai-inner-box">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Title:</span>
                    <span className="text-body fw-bold">Deploy Nginx security patches</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Priority:</span>
                    <span className="badge bg-danger bg-opacity-20 text-danger">High</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Due Date:</span>
                    <span className="text-body">Friday (End of sprint)</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Assignee:</span>
                    <span className="text-body">Daniel Kim (DevOps Lead)</span>
                  </div>
                </div>

                <div className="mt-3 d-flex justify-content-end gap-2">
                  <button className="btn btn-sm btn-outline-secondary" disabled>Review & Edit</button>
                  <button className="btn btn-sm btn-primary" disabled>Confirm & Create</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. ONE-CLICK PERSONA LAUNCHER (INTERVIEW READY) ── */}
      <section className="my-5">
        <div className="pochyaa-card p-4 p-md-5 mx-auto" style={{ maxWidth: '980px' }}>
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-4">
            <div>
              <h4 className="fw-bold text-body mb-1">
                <i className="bi bi-box-arrow-in-right text-primary me-2"></i> Instant Persona Exploration
              </h4>
              <span className="text-secondary small">Select a realistic role in Northstar Engineering to explore the live application:</span>
            </div>
            <span
              className="badge font-monospace"
              style={{
                background: 'rgba(59, 130, 246, 0.15)',
                color: '#2563eb',
                border: '1px solid rgba(59, 130, 246, 0.35)',
                padding: '0.4rem 0.8rem',
              }}
            >
              One-Click Demo Access
            </span>
          </div>

          <div className="row g-3">
            <div className="col-12 col-md-4">
              <div className="persona-card-item">
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="fw-bold text-body">Maya Lin</span>
                    <span className="badge bg-danger bg-opacity-20 text-danger font-monospace">Admin</span>
                  </div>
                  <div className="small text-muted mb-3" style={{ lineHeight: 1.5 }}>
                    Workspace Administrator with access to user roster, immutable audit logs, and live system diagnostics.
                  </div>
                </div>
                <button
                  className="btn btn-outline-primary btn-sm w-100 fw-medium font-monospace"
                  onClick={() => handleQuickLogin('admin@taskflow.dev', 'Password123!', 'Workspace Administrator')}
                  disabled={loginLoading}
                >
                  Sign in as Maya (Admin)
                </button>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div className="persona-card-item">
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="fw-bold text-body">Arjun Patel</span>
                    <span className="badge bg-primary bg-opacity-20 text-primary font-monospace">Lead Engineer</span>
                  </div>
                  <div className="small text-muted mb-3" style={{ lineHeight: 1.5 }}>
                    Engineering lead managing Customer Portal (PORT) and Platform Reliability (REL) tasks and subtasks.
                  </div>
                </div>
                <button
                  className="btn btn-primary btn-sm w-100 fw-medium font-monospace"
                  onClick={() => handleQuickLogin('demo@taskflow.dev', 'Password123!', 'Lead Engineer')}
                  disabled={loginLoading}
                >
                  Sign in as Arjun (Engineer)
                </button>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div className="persona-card-item">
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="fw-bold text-body">Sofia Rossi</span>
                    <span className="badge bg-info bg-opacity-20 text-info font-monospace">Designer</span>
                  </div>
                  <div className="small text-muted mb-3" style={{ lineHeight: 1.5 }}>
                    Staff product designer demonstrating strict tenant isolation and server-side IDOR policy enforcement.
                  </div>
                </div>
                <button
                  className="btn btn-outline-primary btn-sm w-100 fw-medium font-monospace"
                  onClick={() => handleQuickLogin('sarah@taskflow.dev', 'Password123!', 'Staff Designer')}
                  disabled={loginLoading}
                >
                  Sign in as Sofia (Designer)
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. BOTTOM CALL TO ACTION (POCHYAA PARADIGM) ── */}
      <section className="text-center py-5 my-5 border-top">
        <h2 className="fw-extrabold text-body mb-2 tracking-tight" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
          Make work visible. Make progress predictable.
        </h2>
        <p className="text-secondary mx-auto mb-4" style={{ maxWidth: '580px', fontSize: '1.05rem', lineHeight: 1.6 }}>
          Explore TaskFlow’s multi-view engine, grounded AI, and role-based workspace today.
        </p>
        <div className="d-flex justify-content-center gap-3 flex-wrap">
          <button
            className="btn-pochyaa-primary"
            onClick={() => handleQuickLogin('demo@taskflow.dev', 'Password123!', 'Lead Engineer')}
            disabled={loginLoading}
          >
            <span>{loginLoading ? 'Entering...' : 'Launch Interactive Demo'}</span>
            <i className="bi bi-arrow-right ms-1"></i>
          </button>
          <a href="/openapi.yaml" target="_blank" rel="noreferrer" className="btn-pochyaa-secondary">
            <i className="bi bi-file-earmark-code text-primary me-2"></i>
            <span>View OpenAPI Spec</span>
          </a>
        </div>
      </section>
    </div>
  );
}
