import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import DashboardAdmin from './pages/DashboardAdmin'
import DashboardLeader from './pages/DashboardLeader'
// ➡️ Impor Komponen Dashboard Engineering yang baru
import DashboardEngineering from './pages/DashboardEngineering'
import ProtectedRoute from './components/ProtectedRoutes'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />

        {/* Rute untuk Admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <DashboardAdmin />
            </ProtectedRoute>
          }
        />

        {/* Rute untuk Leader/Produksi */}
        <Route
          path="/leader"
          element={
            <ProtectedRoute>
              <DashboardLeader />
            </ProtectedRoute>
          }
        />

        {/* 🚀 Rute Baru untuk Engineering */}
        <Route
          path="/engineering" // Anda dapat mengaksesnya di http://localhost:PORT/engineering
          element={
            <ProtectedRoute>
              <DashboardEngineering />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  )
}

export default App
