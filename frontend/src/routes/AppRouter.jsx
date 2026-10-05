import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import PublicLayout from '../layouts/PublicLayout';

// Public Marketing & Commercial Pages
import LandingPage from '../pages/LandingPage';
import ProductPage from '../pages/ProductPage';
import SolutionsPage from '../pages/SolutionsPage';
import SecurityPage from '../pages/SecurityPage';
import PricingPage from '../pages/PricingPage';
import ContactPage from '../pages/ContactPage';
import StatusPage from '../pages/StatusPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';

// Authenticated Application Workspace Pages
import DashboardPage from '../pages/DashboardPage';
import MyWorkPage from '../pages/MyWorkPage';
import ProjectsPage from '../pages/ProjectsPage';
import ProjectDetailPage from '../pages/ProjectDetailPage';
import TasksPage from '../pages/TasksPage';
import ReportsPage from '../pages/ReportsPage';
import AdminCenterPage from '../pages/AdminCenterPage';

// Custom Error Pages
import NotFoundPage from '../pages/NotFoundPage';
import ForbiddenPage from '../pages/ForbiddenPage';

import { ProtectedRoute, AdminRoute, PublicRoute } from './ProtectedRoute';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Commercial Marketing Website */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/product" element={<ProductPage />} />
          <Route path="/solutions" element={<SolutionsPage />} />
          <Route path="/security" element={<SecurityPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/status" element={<StatusPage />} />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />
        </Route>

        {/* Authenticated Workspace Application (/app/*) */}
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/app/home" replace />} />
          <Route path="home" element={<DashboardPage />} />
          <Route path="my-work" element={<MyWorkPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="projects/:id" element={<ProjectDetailPage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="reports" element={<ReportsPage />} />

          {/* Admin Center */}
          <Route
            path="admin/users"
            element={
              <AdminRoute>
                <AdminCenterPage />
              </AdminRoute>
            }
          />
          <Route
            path="admin/audit-logs"
            element={
              <AdminRoute>
                <AdminCenterPage />
              </AdminRoute>
            }
          />
          <Route
            path="admin/system-health"
            element={
              <AdminRoute>
                <AdminCenterPage />
              </AdminRoute>
            }
          />
        </Route>

        {/* Backward Compatibility Aliases for direct bookmarks & links */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Navigate to="/app/home" replace />} />
          <Route path="/my-work" element={<Navigate to="/app/my-work" replace />} />
          <Route path="/projects" element={<Navigate to="/app/projects" replace />} />
          <Route path="/projects/:id" element={<ProjectDetailPage />} />
          <Route path="/tasks" element={<Navigate to="/app/tasks" replace />} />
          <Route path="/reports" element={<Navigate to="/app/reports" replace />} />
          <Route
            path="/admin/*"
            element={
              <AdminRoute>
                <AdminCenterPage />
              </AdminRoute>
            }
          />
        </Route>

        {/* Custom Error Pages */}
        <Route path="/forbidden" element={<ForbiddenPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
