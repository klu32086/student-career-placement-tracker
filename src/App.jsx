import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Applications from './pages/Applications'
import Interviews from './pages/Interviews'
import DSA from './pages/DSA'
import Skills from './pages/Skills'
import Goals from './pages/Goals'
import Tasks from './pages/Tasks'
import Resumes from './pages/Resumes'
import Profile from './pages/Profile'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="applications" element={<Applications />} />
        <Route path="interviews" element={<Interviews />} />
        <Route path="dsa" element={<DSA />} />
        <Route path="skills" element={<Skills />} />
        <Route path="goals" element={<Goals />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="resumes" element={<Resumes />} />
        <Route path="profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
