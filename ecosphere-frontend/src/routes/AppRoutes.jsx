import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import Layout from '../components/layout/Layout'
import LoginPage from '../pages/LoginPage'
import DashboardPage from '../pages/DashboardPage'
import EnvironmentalPage from '../pages/EnvironmentalPage'
import SocialPage from '../pages/SocialPage'
import GovernancePage from '../pages/GovernancePage'
import GamificationPage from '../pages/GamificationPage'
import AIAdvisorPage from '../pages/AIAdvisorPage'
import SimulatorPage from '../pages/SimulatorPage'
import ReportsPage from '../pages/ReportsPage'

export default function AppRoutes() {
  return (
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
  )
}
