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
      {/* Header Web */}
      <header className="w-full py-4 mb-8 bg-blue-700 shadow-lg fixed top-0 left-0">
        <h1 className="text-3xl font-extrabold text-white text-center tracking-wider">
          Monitoring Produksi
        </h1>
      </header>
      {/* Container Form Login */}
      <div className="flex items-center justify-center min-h-screen">
        <form
          onSubmit={handleLogin}
          className="bg-white p-10 rounded-xl shadow-2xl w-full max-w-sm transform hover:scale-[1.02] transition duration-300 ease-in-out border border-blue-100"
        >
          {/* Judul Form */}
          <h2 className="text-3xl font-extrabold mb-8 text-center text-blue-800">
            Masuk Akun
          </h2>

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
    </div>
  )
}

export default Login
