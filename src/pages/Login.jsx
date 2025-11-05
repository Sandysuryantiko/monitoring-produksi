import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginUser } from '../utils/auth'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const user = await loginUser(email, password)
      if (user.role === 'admin') navigate('/admin')
      else if (user.role === 'leader') navigate('/leader')
      else setError('Role tidak valid')
    } catch (err) {
      setError('Email atau password salah.')
      console.error(err)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      {/* Header Web - Tetap di Atas */}
      <header className="w-full py-4 mb-8 bg-blue-700 shadow-lg fixed top-0 left-0 z-10">
        <h1 className="text-3xl font-extrabold text-white text-center tracking-wider">
          Monitoring Produksi
        </h1>
      </header>

      {/* Main Content Container (Dibagi 2 Kolom) */}
      <div className="flex items-center justify-center w-full max-w-5xl mx-auto min-h-screen pt-16">
        {/* Kolom 1: Copywriting dan Animasi */}
        <div className="hidden lg:flex flex-col justify-center p-12 w-1/2 h-full bg-blue-600 rounded-l-2xl shadow-xl transform transition duration-500 ease-in-out hover:shadow-2xl">
          <h2 className="text-4xl font-black text-white mb-4 animate-fade-in-down">
            Kendalikan Operasi Anda
          </h2>
          <p className="text-white text-lg leading-relaxed mb-6 opacity-90 animate-fade-in-down delay-100">
            Sistem Monitoring Produksi terpadu untuk visibilitas real-time,
            analisis performa, dan pengambilan keputusan yang cepat di lantai
            produksi.
          </p>
          <ul className="text-white space-y-3 opacity-95 animate-fade-in-down delay-200">
            <li className="flex items-center">
              <span className="text-yellow-300 mr-2 text-xl">✓</span> Pantau
              efisiensi mesin secara langsung.
            </li>
            <li className="flex items-center">
              <span className="text-yellow-300 mr-2 text-xl">✓</span> Analisis
              data historis untuk peningkatan berkelanjutan.
            </li>
            <li className="flex items-center">
              <span className="text-yellow-300 mr-2 text-xl">✓</span> Akses
              laporan spesifik peran (Admin & Leader).
            </li>
          </ul>
        </div>

        {/* Kolom 2: Form Login */}
        <form
          onSubmit={handleLogin}
          className="bg-white p-10 rounded-xl lg:rounded-l-none shadow-2xl w-full max-w-sm lg:w-1/2 lg:max-w-none transform transition duration-300 ease-in-out border border-gray-200 animate-slide-in-right"
        >
          {/* Judul Form */}
          <h2 className="text-3xl font-extrabold mb-2 text-center text-blue-800">
            Masuk Akun
          </h2>
          <p className="text-center text-gray-500 mb-8">
            Akses dashboard monitoring produksi.
          </p>

          {/* Input Email */}
          <div className="mb-5">
            <label
              className="block text-gray-700 text-sm font-semibold mb-2"
              htmlFor="email"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Masukkan email Anda"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Input Password */}
          <div className="mb-6">
            <label
              className="block text-gray-700 text-sm font-semibold mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Masukkan password Anda"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Pesan Error */}
          {error && (
            <p className="text-red-600 text-sm mb-5 p-2 bg-red-50 rounded-lg border border-red-200 text-center font-medium">
              {error}
            </p>
          )}

          {/* Tombol Login */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-blue-700 active:bg-blue-800 transition duration-150 shadow-md hover:shadow-lg"
          >
            Login
          </button>
        </form>
      </div>

      {/* ⚠️ PENTING: Anda perlu menambahkan styling animasi berikut ke file CSS global/indeks Anda jika tidak menggunakan Tailwind JIT/Custom Config */}
      {/* Ini adalah animasi keyframe dasar untuk interaktivitas */}
      {/*
      <style>
        .animate-fade-in-down {
          animation: fadeInDown 0.5s ease-out forwards;
          opacity: 0;
        }
        .delay-100 {
            animation-delay: 0.1s;
        }
        .delay-200 {
            animation-delay: 0.2s;
        }
        .animate-slide-in-right {
          animation: slideInRight 0.6s ease-out forwards;
        }
        
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      </style>
      */}
    </div>
  )
}

export default Login
