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
    <div className="py-4">
      {/* 1. HERO SECTION */}
      <section className="text-center py-5">
        <div className="mb-3">
          <span className="hero-pill-badge">
            <span className="hero-pill-dot"></span>
            Modern Work Management Platform v2.0
          </span>
        </div>

        <h1 className="hero-headline mx-auto" style={{ maxWidth: '880px' }}>
          Turn scattered work into <span className="hero-headline-gradient">clear execution</span>.
        </h1>

        <p className="hero-subhead">
          TaskFlow gives engineering and product teams one connected workspace to plan projects, prioritize what matters, collaborate in context, and understand what happens next.
        </p>

        <div className="d-flex justify-content-center align-items-center gap-3 flex-wrap mb-4">
          {isAuthenticated ? (
            <Link to="/app/home" className="btn btn-primary btn-lg px-4 fw-semibold shadow-sm">
              <i className="bi bi-grid-fill me-2"></i> Enter Workspace
            </Link>
          ) : (
            <>
              <button
                className="btn btn-primary btn-lg px-4 fw-semibold shadow-sm"
                onClick={() => handleQuickLogin('demo@taskflow.dev', 'Password123!', 'Lead Engineer')}
                disabled={loginLoading}
              >
                {loginLoading ? 'Entering...' : 'Explore Live Demo'}
                <i className="bi bi-arrow-right ms-2"></i>
              </button>
              <Link to="/login" className="btn btn-outline-secondary btn-lg px-4 fw-medium">
                Sign In
              </Link>
            </>
          )}
          <Link to="/product" className="btn btn-link text-decoration-none text-muted fw-medium">
            See how it works <i className="bi bi-chevron-right small"></i>
          </Link>
        </div>

        <div className="d-flex justify-content-center align-items-center gap-4 text-muted small flex-wrap pt-2">
          <span><i className="bi bi-check-circle-fill text-success me-1"></i> Built for modern teams</span>
          <span><i className="bi bi-shield-check text-primary me-1"></i> Secure by architecture</span>
          <span><i className="bi bi-stars text-info me-1"></i> Grounded AI assistance</span>
        </div>
      </section>

      {/* 2. REAL INTERACTIVE PRODUCT SHOWCASE WINDOW */}
      <section className="my-5">
        <div className="hero-product-frame mx-auto" style={{ maxWidth: '1080px' }}>
          {/* Browser Chrome Header */}
          <div className="browser-header-bar">
            <div className="window-dots">
              <span className="window-dot dot-red"></span>
              <span className="window-dot dot-yellow"></span>
              <span className="window-dot dot-green"></span>
            </div>

            <div className="browser-url-pill d-none d-sm-flex">
              <i className="bi bi-lock-fill text-success"></i>
              <span>https://app.taskflow.dev/northstar-engineering/projects</span>
            </div>

            {/* Interactive View Switcher Tabs */}
            <div className="d-flex align-items-center gap-1">
              <button
                className={`showcase-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <i className="bi bi-speedometer2 me-1"></i> Overview
              </button>
              <button
                className={`showcase-tab-btn ${activeTab === 'board' ? 'active' : ''}`}
                onClick={() => setActiveTab('board')}
              >
                <i className="bi bi-kanban me-1"></i> Kanban
              </button>
              <button
                className={`showcase-tab-btn ${activeTab === 'timeline' ? 'active' : ''}`}
                onClick={() => setActiveTab('timeline')}
              >
                <i className="bi bi-bar-chart-steps me-1"></i> Timeline
              </button>
            </div>
          </div>

          {/* Rendered Interactive View Showcase */}
          <div className="p-3 p-md-4" style={{ backgroundColor: 'var(--tf-bg-main)', minHeight: '380px' }}>
            {/* VIEW 1: OVERVIEW COCKPIT */}
            {activeTab === 'overview' && (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                  <div>
                    <h5 className="fw-bold mb-0 text-body">Northstar Engineering • Executive Cockpit</h5>
                    <span className="text-muted small">Sprint 24 • Target Delivery: Friday, Nov 14</span>
                  </div>
                  <div className="d-flex gap-2">
                    <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-1">
                      <i className="bi bi-heart-pulse-fill me-1"></i> Overall Health: 94%
                    </span>
                    <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-2 py-1">
                      Velocity: +18 Tasks Net
                    </span>
                  </div>
                </div>

                <div className="row g-3 mb-4">
                  <div className="col-6 col-md-3">
                    <div className="tf-card p-3">
                      <div className="text-muted small">Active Work Items</div>
                      <div className="fs-3 fw-bold text-body">24</div>
                      <span className="text-success small fw-medium">↑ 4 completed today</span>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="tf-card p-3">
                      <div className="text-muted small">In Progress</div>
                      <div className="fs-3 fw-bold text-primary">8</div>
                      <span className="text-muted small">Across 4 projects</span>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="tf-card p-3">
                      <div className="text-muted small">High Priority</div>
                      <div className="fs-3 fw-bold text-warning">5</div>
                      <span className="text-muted small">Under active triage</span>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="tf-card p-3">
                      <div className="text-muted small">Blocked Items</div>
                      <div className="fs-3 fw-bold text-danger">1</div>
                      <span className="text-danger small fw-medium">Waiting on AWS IAM</span>
                    </div>
                  </div>
                </div>

                <div className="tf-card p-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-semibold text-body small">Active Delivery Streams</span>
                    <span className="text-muted small">4 Projects</span>
                  </div>
                  <div className="d-flex flex-column gap-2">
                    <div>
                      <div className="d-flex justify-content-between small mb-1">
                        <span className="fw-medium text-body">Customer Portal v2 (PORT)</span>
                        <span className="text-muted">75% Complete</span>
                      </div>
                      <div className="progress" style={{ height: '6px' }}>
                        <div className="progress-bar bg-primary" style={{ width: '75%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="d-flex justify-content-between small mb-1">
                        <span className="fw-medium text-body">Platform Reliability & Scaling (REL)</span>
                        <span className="text-muted">83% Complete</span>
                      </div>
                      <div className="progress" style={{ height: '6px' }}>
                        <div className="progress-bar bg-success" style={{ width: '83%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 2: KANBAN BOARD */}
            {activeTab === 'board' && (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="d-flex align-items-center gap-2">
                    <span className="badge bg-primary text-white">Project: PORT</span>
                    <h6 className="fw-bold mb-0 text-body">Customer Portal Board</h6>
                  </div>
                  <span className="text-muted small">Drag and drop cards between swimlanes</span>
                </div>

                <div className="d-flex gap-3 overflow-x-auto pb-2">
                  {/* Todo Column */}
                  <div className="flex-fill" style={{ minWidth: '220px' }}>
                    <div className="d-flex justify-content-between align-items-center mb-2 px-1">
                      <span className="small fw-bold text-muted text-uppercase">To Do</span>
                      <span className="badge bg-secondary bg-opacity-10 text-muted rounded-pill">2</span>
                    </div>
                    <div className="d-flex flex-column gap-2">
                      <div className="kanban-card">
                        <div className="d-flex justify-content-between small text-muted mb-1">
                          <span className="font-monospace fw-bold text-primary">PORT-104</span>
                          <span className="badge bg-warning bg-opacity-10 text-warning">Medium</span>
                        </div>
                        <div className="fw-medium text-body small mb-2">Automate PDF invoice export generation</div>
                        <div className="d-flex justify-content-between align-items-center text-muted small">
                          <span><i className="bi bi-calendar2 me-1"></i> Nov 18</span>
                          <div className="avatar-circle" style={{ width: 22, height: 22, fontSize: 10 }}>SK</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* In Progress Column */}
                  <div className="flex-fill" style={{ minWidth: '220px' }}>
                    <div className="d-flex justify-content-between align-items-center mb-2 px-1">
                      <span className="small fw-bold text-primary text-uppercase">In Progress</span>
                      <span className="badge bg-primary text-white rounded-pill">2</span>
                    </div>
                    <div className="d-flex flex-column gap-2">
                      <div className="kanban-card" style={{ borderLeft: '3px solid var(--tf-primary)' }}>
                        <div className="d-flex justify-content-between small text-muted mb-1">
                          <span className="font-monospace fw-bold text-primary">PORT-101</span>
                          <span className="badge bg-danger bg-opacity-10 text-danger">High</span>
                        </div>
                        <div className="fw-medium text-body small mb-2">Implement OAuth2 Google authentication flow</div>
                        <div className="d-flex justify-content-between align-items-center text-muted small">
                          <span><i className="bi bi-check2-square text-success me-1"></i> 3/4 subtasks</span>
                          <div className="avatar-circle bg-primary" style={{ width: 22, height: 22, fontSize: 10 }}>AP</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Review Column */}
                  <div className="flex-fill" style={{ minWidth: '220px' }}>
                    <div className="d-flex justify-content-between align-items-center mb-2 px-1">
                      <span className="small fw-bold text-info text-uppercase">Review</span>
                      <span className="badge bg-info bg-opacity-10 text-info rounded-pill">1</span>
                    </div>
                    <div className="d-flex flex-column gap-2">
                      <div className="kanban-card">
                        <div className="d-flex justify-content-between small text-muted mb-1">
                          <span className="font-monospace fw-bold text-primary">PORT-103</span>
                          <span className="badge bg-warning bg-opacity-10 text-warning">Medium</span>
                        </div>
                        <div className="fw-medium text-body small mb-2">Design system tokens and responsive audit</div>
                        <div className="d-flex justify-content-between align-items-center text-muted small">
                          <span className="text-info"><i className="bi bi-chat-text me-1"></i> PR #42</span>
                          <div className="avatar-circle bg-info" style={{ width: 22, height: 22, fontSize: 10 }}>SR</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Done Column */}
                  <div className="flex-fill" style={{ minWidth: '220px' }}>
                    <div className="d-flex justify-content-between align-items-center mb-2 px-1">
                      <span className="small fw-bold text-success text-uppercase">Done</span>
                      <span className="badge bg-success bg-opacity-10 text-success rounded-pill">3</span>
                    </div>
                    <div className="d-flex flex-column gap-2">
                      <div className="kanban-card opacity-75">
                        <div className="d-flex justify-content-between small text-muted mb-1">
                          <span className="font-monospace fw-bold text-muted">PORT-100</span>
                          <span className="badge bg-success bg-opacity-10 text-success">Verified</span>
                        </div>
                        <div className="fw-medium text-decoration-line-through text-muted small mb-2">Database schema migration and indexes</div>
                        <div className="d-flex justify-content-between align-items-center text-muted small">
                          <span className="text-success"><i className="bi bi-check-all me-1"></i> Merged</span>
                          <div className="avatar-circle bg-success" style={{ width: 22, height: 22, fontSize: 10 }}>ML</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 3: TIMELINE SCHEDULE */}
            {activeTab === 'timeline' && (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold mb-0 text-body">Gantt Delivery Schedule • Q4 Roadmap</h6>
                  <span className="text-muted small">Delivery Windows & Dependencies</span>
                </div>

                <div className="tf-card p-3">
                  <div className="d-flex flex-column gap-3">
                    <div>
                      <div className="d-flex justify-content-between small mb-1">
                        <span className="fw-semibold text-body">Customer Portal v2 — MVP Release</span>
                        <span className="text-muted">Oct 20 → Nov 15</span>
                      </div>
                      <div className="position-relative" style={{ height: '24px', backgroundColor: 'var(--tf-bg-subtle)', borderRadius: '4px' }}>
                        <div
                          className="position-absolute top-0 bottom-0 bg-primary rounded d-flex align-items-center px-2 text-white small"
                          style={{ left: '10%', width: '65%' }}
                        >
                          <span className="text-truncate" style={{ fontSize: 11 }}>Active Development (75%)</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="d-flex justify-content-between small mb-1">
                        <span className="fw-semibold text-body">Platform Reliability & Database Indexing</span>
                        <span className="text-muted">Oct 15 → Nov 05</span>
                      </div>
                      <div className="position-relative" style={{ height: '24px', backgroundColor: 'var(--tf-bg-subtle)', borderRadius: '4px' }}>
                        <div
                          className="position-absolute top-0 bottom-0 bg-success rounded d-flex align-items-center px-2 text-white small"
                          style={{ left: '5%', width: '80%' }}
                        >
                          <span className="text-truncate" style={{ fontSize: 11 }}>Complete & Benchmarked (100%)</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="d-flex justify-content-between small mb-1">
                        <span className="fw-semibold text-body">Security Hardening & RBAC Audit</span>
                        <span className="text-muted">Nov 01 → Dec 10</span>
                      </div>
                      <div className="position-relative" style={{ height: '24px', backgroundColor: 'var(--tf-bg-subtle)', borderRadius: '4px' }}>
                        <div
                          className="position-absolute top-0 bottom-0 bg-warning rounded d-flex align-items-center px-2 text-dark small"
                          style={{ left: '40%', width: '50%' }}
                        >
                          <span className="text-truncate" style={{ fontSize: 11 }}>In Planning & Staging</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3. TRUST & ARCHITECTURE STRIP */}
      <section className="py-4 my-4 border-top border-bottom" style={{ borderColor: 'var(--tf-border)' }}>
        <div className="container-xl text-center">
          <div className="text-muted small text-uppercase tracking-wider fw-bold mb-3">
            Engineered for Modern Software Teams
          </div>
          <div className="d-flex justify-content-center align-items-center gap-4 gap-md-5 flex-wrap">
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-layers-fill text-primary fs-5"></i>
              <span className="fw-semibold text-body small">4-Tier Hierarchy</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-lightning-charge-fill text-warning fs-5"></i>
              <span className="fw-semibold text-body small">MySQL B-Tree (0.07ms)</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-shield-lock-fill text-success fs-5"></i>
              <span className="fw-semibold text-body small">Policy-Enforced RBAC</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-stars text-info fs-5"></i>
              <span className="fw-semibold text-body small">Grounded AI Guardrails</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-file-earmark-code-fill text-primary fs-5"></i>
              <span className="fw-semibold text-body small">RESTful JSON API</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PROBLEM → SOLUTION STORYTELLING */}
      <section className="py-5">
        <div className="text-center mb-5">
          <h2 className="fw-bold tracking-tight text-body">Work is fragmented. TaskFlow brings clarity.</h2>
          <p className="text-muted mx-auto" style={{ maxWidth: '600px' }}>
            When projects rely on scattered spreadsheets and disconnected Slack threads, delivery dates slip and ownership dissolves.
          </p>
        </div>

        <div className="row g-4 mx-auto" style={{ maxWidth: '960px' }}>
          <div className="col-12 col-md-6">
            <div className="story-compare-box story-box-problem">
              <div className="d-flex align-items-center gap-2 mb-3">
                <i className="bi bi-x-circle-fill text-danger fs-5"></i>
                <h5 className="fw-bold text-danger mb-0">The Fragmented Workflow</h5>
              </div>
              <ul className="list-unstyled d-flex flex-column gap-3 text-muted small mb-0">
                <li className="d-flex align-items-start gap-2">
                  <i className="bi bi-dash text-danger mt-1"></i>
                  <span>Updates live in 10 different Slack channels where context gets buried.</span>
                </li>
                <li className="d-flex align-items-start gap-2">
                  <i className="bi bi-dash text-danger mt-1"></i>
                  <span>Tasks live in spreadsheets with broken formulas and stale deadlines.</span>
                </li>
                <li className="d-flex align-items-start gap-2">
                  <i className="bi bi-dash text-danger mt-1"></i>
                  <span>Blocked deliverables are discovered on release day instead of sprint planning.</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="col-12 col-md-6">
            <div className="story-compare-box story-box-solution">
              <div className="d-flex align-items-center gap-2 mb-3">
                <i className="bi bi-check-circle-fill text-success fs-5"></i>
                <h5 className="fw-bold text-success mb-0">The TaskFlow Experience</h5>
              </div>
              <ul className="list-unstyled d-flex flex-column gap-3 text-body small mb-0">
                <li className="d-flex align-items-start gap-2">
                  <i className="bi bi-check-lg text-success mt-1"></i>
                  <span>One connected workspace mapping projects, milestones, tasks, and subtasks.</span>
                </li>
                <li className="d-flex align-items-start gap-2">
                  <i className="bi bi-check-lg text-success mt-1"></i>
                  <span>Explicit ownership, start dates, and visual blocker alerts with reasons.</span>
                </li>
                <li className="d-flex align-items-start gap-2">
                  <i className="bi bi-check-lg text-success mt-1"></i>
                  <span>Audited activity trail and instant multi-view switcher (Table, Board, Calendar, Timeline).</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 5. 5-TIER WORK MANAGEMENT DOMAIN HIERARCHY */}
      <section className="py-5 my-3">
        <div className="text-center mb-4">
          <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-3 py-1 mb-2">
            Structured Domain Model
          </span>
          <h2 className="fw-bold tracking-tight text-body">Built to model real engineering delivery</h2>
          <p className="text-muted mx-auto" style={{ maxWidth: '640px' }}>
            Not just a flat todo checklist. TaskFlow models how high-performing teams organize and execute complex technical initiatives.
          </p>
        </div>

        <div className="hierarchy-flow-container mx-auto" style={{ maxWidth: '1000px' }}>
          <div className="hierarchy-node">
            <div className="text-muted small text-uppercase fw-bold mb-1">01. Organization</div>
            <div className="fw-bold text-body">Northstar Labs</div>
            <span className="text-muted small">Tenant boundary</span>
          </div>

          <i className="bi bi-arrow-right hierarchy-arrow"></i>

          <div className="hierarchy-node">
            <div className="text-muted small text-uppercase fw-bold mb-1">02. Workspace</div>
            <div className="fw-bold text-primary">Engineering</div>
            <span className="text-muted small">Collaborative space</span>
          </div>

          <i className="bi bi-arrow-right hierarchy-arrow"></i>

          <div className="hierarchy-node">
            <div className="text-muted small text-uppercase fw-bold mb-1">03. Project</div>
            <div className="fw-bold text-body">Customer Portal</div>
            <span className="text-muted small">Key: PORT</span>
          </div>

          <i className="bi bi-arrow-right hierarchy-arrow"></i>

          <div className="hierarchy-node">
            <div className="text-muted small text-uppercase fw-bold mb-1">04. Work Item</div>
            <div className="fw-bold text-body">PORT-101</div>
            <span className="text-muted small">OAuth Integration</span>
          </div>

          <i className="bi bi-arrow-right hierarchy-arrow"></i>

          <div className="hierarchy-node">
            <div className="text-muted small text-uppercase fw-bold mb-1">05. Subtasks & Trail</div>
            <div className="fw-bold text-success">Checklist + Logs</div>
            <span className="text-muted small">Verified progress</span>
          </div>
        </div>
      </section>

      {/* 6. GROUNDED AI SECTION */}
      <section className="py-5 my-3">
        <div className="ai-grounded-frame mx-auto" style={{ maxWidth: '1000px' }}>
          <div className="row align-items-center g-4">
            <div className="col-12 col-lg-6">
              <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-3 py-1 mb-2">
                <i className="bi bi-stars me-1"></i> Grounded AI Assistant
              </span>
              <h3 className="fw-bold text-body mb-3">AI suggests. Your team decides.</h3>
              <p className="text-muted mb-4" style={{ lineHeight: 1.6 }}>
                TaskFlow’s AI assistant accelerates daily work without taking unpredictable control. Convert natural language into structured work items, decompose complex tasks into actionable checklists, and polish acceptance criteria—always with human preview and confirmation before anything writes to the database.
              </p>
              <div className="d-flex flex-column gap-2 small text-muted">
                <div><i className="bi bi-shield-check text-success me-2"></i> Never executes blind database mutations</div>
                <div><i className="bi bi-shield-check text-success me-2"></i> Deterministic heuristic engine fallback if AI service times out</div>
                <div><i className="bi bi-shield-check text-success me-2"></i> No sensitive credentials or secrets transmitted</div>
              </div>
            </div>

            <div className="col-12 col-lg-6">
              <div className="tf-card p-3 border shadow-sm">
                <div className="d-flex align-items-center gap-2 pb-2 mb-2 border-bottom">
                  <i className="bi bi-chat-left-quote text-primary"></i>
                  <span className="small text-muted">Natural Language Prompt</span>
                </div>
                <div className="p-2 rounded bg-subtle small font-monospace mb-3 text-body">
                  "Deploy Nginx security patches by Friday, high priority, assign to Daniel"
                </div>

                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="small fw-bold text-success"><i className="bi bi-magic me-1"></i> AI Structured Draft Preview</span>
                  <span className="badge bg-success bg-opacity-10 text-success">Confidence: 94%</span>
                </div>

                <div className="border rounded p-2 small bg-surface">
                  <div className="d-flex justify-content-between mb-1">
                    <span className="text-muted">Title:</span>
                    <span className="fw-bold text-body">Deploy Nginx security patches</span>
                  </div>
                  <div className="d-flex justify-content-between mb-1">
                    <span className="text-muted">Priority:</span>
                    <span className="badge bg-danger bg-opacity-10 text-danger">High</span>
                  </div>
                  <div className="d-flex justify-content-between mb-1">
                    <span className="text-muted">Due Date:</span>
                    <span className="text-body fw-medium">Friday (End of sprint)</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Assignee:</span>
                    <span className="text-body fw-medium">Daniel Kim (DevOps Lead)</span>
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

      {/* 7. RECRUITER & INTERVIEWER 1-CLICK PERSONA LAUNCHER */}
      <section className="my-5">
        <div className="tf-card p-4 mx-auto border shadow-sm" style={{ maxWidth: '900px' }}>
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
            <div>
              <h5 className="fw-bold text-body mb-0">
                <i className="bi bi-box-arrow-in-right text-primary me-2"></i> Instant Persona Exploration
              </h5>
              <span className="text-muted small">Select a realistic role in Northstar Engineering to explore the live application:</span>
            </div>
            <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-2 py-1">
              One-Click Demo Access
            </span>
          </div>

          <div className="row g-3">
            <div className="col-12 col-md-4">
              <div className="p-3 border rounded h-100 d-flex flex-column justify-content-between" style={{ backgroundColor: 'var(--tf-bg-subtle)' }}>
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="fw-bold text-body">Maya Lin</span>
                    <span className="badge bg-danger bg-opacity-10 text-danger">Admin</span>
                  </div>
                  <div className="small text-muted mb-3">
                    Workspace Administrator with access to user roster, immutable audit logs, and live system diagnostics.
                  </div>
                </div>
                <button
                  className="btn btn-outline-primary btn-sm w-100 fw-medium"
                  onClick={() => handleQuickLogin('admin@taskflow.dev', 'Password123!', 'Workspace Administrator')}
                  disabled={loginLoading}
                >
                  Sign in as Maya (Admin)
                </button>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div className="p-3 border rounded h-100 d-flex flex-column justify-content-between" style={{ backgroundColor: 'var(--tf-bg-subtle)' }}>
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="fw-bold text-body">Arjun Patel</span>
                    <span className="badge bg-primary bg-opacity-10 text-primary">Lead Engineer</span>
                  </div>
                  <div className="small text-muted mb-3">
                    Engineering lead managing Customer Portal (PORT) and Platform Reliability (REL) tasks and subtasks.
                  </div>
                </div>
                <button
                  className="btn btn-primary btn-sm w-100 fw-medium"
                  onClick={() => handleQuickLogin('demo@taskflow.dev', 'Password123!', 'Lead Engineer')}
                  disabled={loginLoading}
                >
                  Sign in as Arjun (Engineer)
                </button>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div className="p-3 border rounded h-100 d-flex flex-column justify-content-between" style={{ backgroundColor: 'var(--tf-bg-subtle)' }}>
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="fw-bold text-body">Sofia Rossi</span>
                    <span className="badge bg-info bg-opacity-10 text-info">Designer</span>
                  </div>
                  <div className="small text-muted mb-3">
                    Staff product designer demonstrating strict tenant isolation and server-side IDOR policy enforcement.
                  </div>
                </div>
                <button
                  className="btn btn-outline-primary btn-sm w-100 fw-medium"
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

      {/* 8. FINAL CALL TO ACTION */}
      <section className="text-center py-5 my-4 border-top" style={{ borderColor: 'var(--tf-border)' }}>
        <h2 className="fw-bold text-body mb-2 tracking-tight">Make work visible. Make progress predictable.</h2>
        <p className="text-muted mx-auto mb-4" style={{ maxWidth: '520px' }}>
          Explore TaskFlow’s multi-view engine, grounded AI, and role-based workspace today.
        </p>
        <div className="d-flex justify-content-center gap-3 flex-wrap">
          <Link to="/login" className="btn btn-primary btn-lg px-4 fw-semibold shadow-sm">
            Launch Live Demo <i className="bi bi-arrow-right ms-1"></i>
          </Link>
          <a href="/openapi.yaml" target="_blank" rel="noreferrer" className="btn btn-outline-secondary btn-lg px-4 fw-medium">
            <i className="bi bi-file-earmark-code me-2"></i> View OpenAPI Spec
          </a>
        </div>
      </section>
    </div>
  );
}
