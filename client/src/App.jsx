
import './App.css'
import { Routes, Route, Navigate, Link } from 'react-router-dom'
import Dashboard from './components/dashboard'
import LoginPage from './components/signin'
import SignupPage from './components/signup'
import VerifyKeyPage from './components/verify'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/signin" replace />} />
        <Route path="/signin" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/verify" element={<VerifyKeyPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<div style={{padding:16}}>Not found. <Link to="/signin">Go to Sign in</Link></div>} />
      </Routes>
    </>
  )
}

export default App
