import React, { useEffect, useState } from 'react'

// Fungsi untuk mendapatkan status log dan mesin dari localStorage
const getDashboardData = () => {
  const shiftData = JSON.parse(
    localStorage.getItem('hasil_shift') || '{"data": []}',
  )
  const repairLog = JSON.parse(localStorage.getItem('repair_log') || '[]')
  return {
    machines: shiftData.data || [],
    currentShift: shiftData.shift || 'N/A',
    log: repairLog,
  }
}

// Fungsi untuk menyimpan kembali data mesin dan log setelah perbaikan
const saveDashboardData = (machines, log) => {
  const currentShiftData = JSON.parse(
    localStorage.getItem('hasil_shift') || '{}',
  )
  currentShiftData.data = machines
  localStorage.setItem('hasil_shift', JSON.stringify(currentShiftData))
  localStorage.setItem('repair_log', JSON.stringify(log))
}

export default function DashboardEngineering() {
  const [logData, setLogData] = useState([])
  const [currentShift, setCurrentShift] = useState('N/A')
  const [machines, setMachines] = useState([])

  // Muat data saat komponen di-mount dan setiap 2 detik (simulasi polling)
  useEffect(() => {
    const loadData = () => {
      const data = getDashboardData()
      // Hanya tampilkan log yang statusnya 'Requested' atau 'In Progress'
      const pendingLog = data.log.filter(
        (l) => l.status === 'Requested' || l.status === 'In Progress',
      )
      setLogData(
        pendingLog.sort(
          (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
        ),
      )
      setCurrentShift(data.currentShift)
      setMachines(data.machines)
    }

    loadData()
    const interval = setInterval(loadData, 2000) // Poll setiap 2 detik
    return () => clearInterval(interval)
  }, [])

  // --- Fungsi Aksi Engineering: Selesaikan Perbaikan ---
  const handleResolveRequest = (logId, machineId) => {
    // 1. Ubah status mesin menjadi 'Running' dan reset 'repairRequested'
    const updatedMachines = machines.map((m) => {
      if (m.id === machineId) {
        return {
          ...m,
          status: 'Running',
          problem: 'Perbaikan Selesai (Eng.)',
          repairRequested: false,
          lastUpdate: Date.now(),
        }
      }
      return m
    })

    // 2. Ubah status log menjadi 'Resolved'
    const updatedLog = logData
      .map((log) => {
        if (log.id === logId) {
          return {
            ...log,
            status: 'Resolved',
            resolvedTime: new Date().toLocaleTimeString('id-ID'),
          }
        }
        return log
      })
      .filter((l) => l.status !== 'Resolved') // Hapus log yang sudah diselesaikan dari tampilan Engineering

    // 3. Simpan data ke localStorage
    saveDashboardData(updatedMachines, updatedLog)

    // 4. Update state lokal
    setMachines(updatedMachines)
    setLogData(updatedLog)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 text-gray-800 p-4 sm:p-8">
      <div className="p-5 bg-white rounded-2xl shadow-xl border-t-4 border-red-600 mb-8">
        <h1 className="text-3xl font-extrabold text-red-600 flex items-center">
          🔧 Dashboard Engineering - Permintaan Perbaikan
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Shift Aktif: **{currentShift}** | Total Permintaan Pending: **
          {logData.length}**
        </p>
      </div>

      <hr className="my-6 border-gray-300" />

      <h2 className="text-2xl font-bold text-gray-700 mb-4">
        Daftar Permintaan Aktif
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {logData.length === 0 ? (
          <div className="lg:col-span-3 p-10 bg-white rounded-xl shadow-inner text-center">
            <p className="text-xl text-green-500 font-semibold">
              🎉 Semua mesin berjalan lancar! Tidak ada permintaan perbaikan
              pending.
            </p>
          </div>
        ) : (
          logData.map((log) => {
            const machine = machines.find((m) => m.id === log.machineId)

            return (
              <div
                key={log.id}
                className="bg-white p-6 rounded-xl shadow-lg border-l-8 border-red-500 hover:shadow-xl transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-bold text-red-700">
                    {log.machineName}
                  </h3>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-red-100 text-red-700">
                    {log.status === 'Requested' ? 'New Request' : 'In Progress'}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Diajukan: **{log.time}**
                </p>
                <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-200">
                  <p className="text-sm font-medium text-gray-700">
                    Masalah Dilaporkan:
                  </p>
                  <p className="font-bold text-base text-gray-900">
                    {log.problem}
                  </p>
                </div>

                <button
                  onClick={() => handleResolveRequest(log.id, log.machineId)}
                  className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg transition-colors shadow-md shadow-green-300"
                >
                  ✅ Selesaikan Perbaikan (Set Mesin RUNNING)
                </button>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

// Catatan: Anda perlu mengatur routing (misalnya di App.jsx) agar '/engineering' mengarah ke komponen ini.
