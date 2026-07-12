import { Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import ProtectedRoute from './ProtectedRoute'
import Layout from '../components/layout/Layout'
import Spinner from '../components/ui/Spinner'

const LoginPage = lazy(() => import('../pages/LoginPage'))
const DashboardPage = lazy(() => import('../pages/DashboardPage'))
const EnvironmentalPage = lazy(() => import('../pages/EnvironmentalPage'))
const SocialPage = lazy(() => import('../pages/SocialPage'))
const GovernancePage = lazy(() => import('../pages/GovernancePage'))
const GamificationPage = lazy(() => import('../pages/GamificationPage'))
const AIAdvisorPage = lazy(() => import('../pages/AIAdvisorPage'))
const SimulatorPage = lazy(() => import('../pages/SimulatorPage'))
const ReportsPage = lazy(() => import('../pages/ReportsPage'))

const SuspenseFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw' }}>
    <Spinner size={32} />
  </div>
)

export default function AppRoutes() {
  return (
    <Suspense fallback={<SuspenseFallback />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard"   element={<DashboardPage />} />
          <Route path="environment" element={<EnvironmentalPage />} />
          <Route path="social"      element={<SocialPage />} />
          <Route path="governance"  element={<GovernancePage />} />
          <Route path="gamification"element={<GamificationPage />} />
          <Route path="ai-advisor"  element={<AIAdvisorPage />} />
          <Route path="simulator"   element={<SimulatorPage />} />
          <Route path="reports"     element={<ReportsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  )
}
