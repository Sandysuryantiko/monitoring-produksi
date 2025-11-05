import React from 'react'

function DashboardAdmin() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <header className="flex justify-between items-center bg-white shadow-md p-4 rounded-lg mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Admin</h1>
        <button
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
          onClick={() => {
            localStorage.clear()
            window.location.href = '/'
          }}
        >
          Logout
        </button>
      </header>

      <main className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Monitoring Produksi</h2>

        <p className="text-gray-700 mb-4">
          Selamat datang, Admin! Di sini kamu bisa mengatur data mesin,
          operator, target produksi, serta memantau hasil produksi tiap shift.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-100 p-4 rounded-lg text-center">
            <h3 className="font-semibold text-lg text-blue-800">Mesin Aktif</h3>
            <p className="text-3xl font-bold text-blue-900 mt-2">8</p>
          </div>

          <div className="bg-green-100 p-4 rounded-lg text-center">
            <h3 className="font-semibold text-lg text-green-800">
              Produksi Hari Ini
            </h3>
            <p className="text-3xl font-bold text-green-900 mt-2">1,240 pcs</p>
          </div>

          <div className="bg-yellow-100 p-4 rounded-lg text-center">
            <h3 className="font-semibold text-lg text-yellow-800">
              Shift Berjalan
            </h3>
            <p className="text-3xl font-bold text-yellow-900 mt-2">Shift 2</p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default DashboardAdmin
