import React, { useEffect, useState, useMemo } from 'react'
import { Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

// --- Helper Global ---
const generateUniqueId = () => Math.random().toString(36).substr(2, 9)
const pipelineStages = ['Triage', 'Repairing', 'Testing', 'Resolved']

// --- Data Dummy Baru ---
const machineList = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  name: `M-${String.fromCharCode(65 + i)}0${i + 1}`,
  product: `Model ${100 + i} V${(i % 3) + 1}`,
}))

// Helper warna status
const getStatusColor = (status) => {
  switch (status) {
    case 'Running':
    case 'Achieved':
      return 'bg-green-500 text-white'
    case 'Idle':
    case 'Standby':
      return 'bg-yellow-500 text-white'
    case 'Down':
      return 'bg-red-500 text-white'
    case 'Requested':
      return 'bg-yellow-500 text-white'
    case 'In Progress':
      return 'bg-green-500 text-white'
    case 'Resolved':
      return 'bg-navy-500 text-white'
    default:
      return 'bg-gray-300 text-gray-800'
  }
}

// --- Komponen Pembantu untuk Kartu Statistik ---
const StatCard = ({ label, value, color }) => (
  <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100">
    <p className="text-sm font-medium text-gray-500">{label}</p>
    <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
  </div>
)

// --- Komponen Riwayat Card ---
const HistoryMachineCard = ({ machine }) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow border border-gray-100">
      <h3 className="text-md font-bold text-blue-700 mb-2">{machine.name}</h3>
      <div className="text-sm space-y-0.5">
        <p className="flex justify-between text-gray-700">
          <span className="font-medium text-gray-500">Produk:</span>
          <span>{machine.product}</span>
        </p>
        <p className="flex justify-between">
          <span className="font-medium text-gray-500">Target:</span>
          <span className="font-bold text-blue-500">
            {machine.target.toLocaleString()}
          </span>
        </p>
        <p className="flex justify-between">
          <span className="font-medium text-gray-500">Pencapaian Akhir:</span>
          <span className="font-bold text-green-600">
            {machine.achievement.toLocaleString()}
          </span>
        </p>
        <p className="flex justify-between">
          <span className="font-medium text-gray-500">Efisiensi Akhir:</span>
          <span
            className={`font-bold ${
              machine.efficiency >= 100
                ? 'text-purple-600'
                : machine.efficiency > 90
                  ? 'text-green-500'
                  : machine.efficiency > 70
                    ? 'text-yellow-500'
                    : 'text-red-500'
            }`}
          >
            {machine.efficiency}%
          </span>
        </p>
        <p className="text-xs pt-1 border-t mt-1 text-gray-400">
          Problem Terakhir: {machine.problem}
        </p>
      </div>
    </div>
  )
}

// --- Komponen Visualisasi Shift Comparison ---
const ShiftComparisonChart = ({ currentData, historyData }) => {
  const currentAvg =
    currentData.length > 0
      ? Math.round(
          currentData.reduce((sum, m) => sum + m.efficiency, 0) /
            currentData.length,
        )
      : 0

  const historyAvg =
    historyData && historyData.data.length > 0
      ? Math.round(
          historyData.data.reduce((sum, m) => sum + m.efficiency, 0) /
            historyData.data.length,
        )
      : 0

  const data = {
    labels: ['Shift Saat Ini', historyData ? historyData.shift : 'N/A'],
    datasets: [
      {
        label: 'Efisiensi Rata-Rata (%)',
        data: [currentAvg, historyAvg],
        backgroundColor: ['rgba(59, 130, 246, 0.8)', 'rgba(249, 115, 22, 0.8)'],
        borderColor: ['rgba(59, 130, 246, 1)', 'rgba(249, 115, 22, 1)'],
        borderWidth: 1,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl border-l-4 border-orange-500 h-full">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
        Perbandingan Efisiensi Rata-Rata
      </h3>
      <div className="h-64">
        <Doughnut data={data} options={options} />
      </div>
      <div className="mt-4 text-center">
        <p className="text-lg font-bold text-blue-600">
          Shift Saat Ini: {currentAvg}%
        </p>
        <p className="text-lg font-bold text-orange-600">
          Shift Sebelumnya: {historyAvg}%
        </p>
      </div>
    </div>
  )
}

// --- Komponen Tombol Request Perbaikan Baru ---
const RepairRequestButton = ({ machine, onRequest }) => {
  const isDown = machine.status === 'Down'
  const hasRequested = machine.repairRequested

  const handleClick = () => {
    if (isDown && !hasRequested) {
      onRequest(machine.id)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={!isDown || hasRequested}
      className={`mt-4 w-full text-xs font-semibold px-3 py-2 rounded-lg transition-colors shadow-md 
                ${
                  isDown && !hasRequested
                    ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-300'
                    : hasRequested
                      ? 'bg-orange-300 text-orange-900 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
    >
      {hasRequested
        ? 'Permintaan Terkirim (Menunggu Engineering.)'
        : isDown
          ? 'Request Perbaikan Engineering'
          : 'Mesin Sudah Normal'}
    </button>
  )
}

// --- Dashboard Leader (Modifikasi dari input user) ---
const LeaderDashboard = ({ navigateToDashboard }) => {
  const [machines, setMachines] = useState([])
  const [currentShift, setCurrentShift] = useState('')
  const [time, setTime] = useState(new Date())
  const [lastShiftData, setLastShiftData] = useState(null)
  const [selectedProblem, setSelectedProblem] = useState(null)
  const [repairLog, setRepairLog] = useState([])

  // --- Fungsi-fungsi shift ---
  const getCurrentShift = () => {
    const minute = new Date().getMinutes() % 15
    if (minute < 5) return 'Shift 1'
    if (minute < 10) return 'Shift 2'
    return 'Shift 3'
  }

  const getShiftRemainingTime = () => {
    const minute = new Date().getMinutes() % 15
    const sec = new Date().getSeconds()
    const remainingSeconds = (5 - (minute % 5) - 1) * 60 + (60 - sec)
    const m = Math.floor(remainingSeconds / 60)
    const s = remainingSeconds % 60
    const formattedMinutes = String(m).padStart(2, '0')
    const formattedSeconds = String(s).padStart(2, '0')
    return `${formattedMinutes}:${formattedSeconds}`
  }

  // --- Fungsi Aksi Baru: Request Perbaikan (Menyimpan ke localStorage) ---
  const handleRequestRepair = (id) => {
    const now = new Date()
    const uniqueLogId = generateUniqueId()

    // 1. Update state machines (untuk tampilan request pending)
    setMachines((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          return {
            ...m,
            repairRequested: true,
          }
        }
        return m
      }),
    )

    // 2. Persiapkan Log entry baru
    const newLogEntry = {
      id: uniqueLogId,
      machineId: id,
      machineName: machines.find((m) => m.id === id)?.name || `M-${id}`,
      time: now.toLocaleTimeString('id-ID'),
      timestamp: now.toISOString(),
      problem: machines.find((m) => m.id === id)?.problem,
      status: 'Requested',
      pipelineStage: 0, // Mulai dari Triage
    }

    // 3. Update localStorage (agar dapat diakses oleh Dashboard Engineering)
    const existingLog = JSON.parse(localStorage.getItem('repair_log') || '[]')
    const updatedLog = [
      ...existingLog.filter((l) => l.status !== 'Resolved'),
      newLogEntry,
    ]

    localStorage.setItem('repair_log', JSON.stringify(updatedLog))

    // 4. Update state local repairLog
    setRepairLog(updatedLog.filter((l) => l.status !== 'Resolved'))
  }

  // --- Efek Inisialisasi dan Shift Change ---
  useEffect(() => {
    const shift = getCurrentShift()
    setCurrentShift(shift)

    const savedData = JSON.parse(localStorage.getItem('hasil_shift'))
    if (savedData && savedData.shift === shift) {
      setMachines(savedData.data)
    } else {
      if (savedData) setLastShiftData(savedData)
      const newMachines = machineList.map((m) => ({
        ...m,
        target: Math.floor(Math.random() * 150) + 50,
        achievement: 0,
        problem: 'N/A',
        status: 'Running',
        efficiency: 100,
        lastUpdate: Date.now(),
        repairRequested: false,
      }))
      setMachines(newMachines)
      localStorage.setItem(
        'hasil_shift',
        JSON.stringify({ shift, data: newMachines }),
      )
    }
  }, [])

  // Efek Jam Realtime
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Efek Sinkronisasi Log Perbaikan dari LocalStorage (Agar Leader tahu statusnya)
  useEffect(() => {
    const syncLog = () => {
      const existingLog = JSON.parse(localStorage.getItem('repair_log') || '[]')
      // Leader hanya peduli pada log yang Requested atau In Progress
      setRepairLog(
        existingLog.filter(
          (l) => l.status === 'Requested' || l.status === 'In Progress',
        ),
      )
    }
    syncLog()
    const interval = setInterval(syncLog, 2000)
    return () => clearInterval(interval)
  }, [])

  // --- Efek Simulasi Mesin ---
  useEffect(() => {
    const interval = setInterval(() => {
      const shift = getCurrentShift()

      if (shift !== currentShift) {
        setLastShiftData({ shift: currentShift, data: machines })
        setRepairLog([])
        localStorage.setItem('repair_log', '[]')

        const newMachines = machineList.map((m) => ({
          ...m,
          target: Math.floor(Math.random() * 150) + 50,
          achievement: 0,
          problem: 'N/A',
          status: 'Running',
          efficiency: 100,
          lastUpdate: Date.now(),
          repairRequested: false,
        }))
        setMachines(newMachines)
        setCurrentShift(shift)
        localStorage.setItem(
          'hasil_shift',
          JSON.stringify({ shift, data: newMachines }),
        )
        return
      }

      // Ambil data mesin yang mungkin diperbaiki oleh Engineering dari localStorage
      const savedData = JSON.parse(localStorage.getItem('hasil_shift'))
      const latestMachines = savedData?.data || machines

      setMachines((prev) =>
        latestMachines.map((m) => {
          let {
            achievement,
            target,
            status,
            problem,
            efficiency,
            lastUpdate,
            repairRequested,
          } = m
          const now = Date.now()

          // Mesin yang statusnya sudah Resolved oleh Engineering, kembali Running
          if (status === 'Resolved') {
            status = 'Running'
            problem = 'N/A'
            repairRequested = false
          }

          if (status === 'Running' || status === 'Idle') {
            const maxProduce = 10
            const produce =
              (status === 'Running' || status === 'Idle') &&
              achievement < target &&
              Math.random() > 0.4
                ? Math.floor(Math.random() * maxProduce) + 1
                : 0

            const newAch = Math.min(achievement + produce, target)
            const idleTime = (now - lastUpdate) / 1000

            if (newAch >= target && status !== 'Down') {
              status = 'Achieved'
              problem = 'Target shift tercapai.'
            } else if (produce > 0) {
              status = 'Running'
              problem = 'N/A'
              lastUpdate = now
            } else if (status === 'Running' && idleTime > 15) {
              status = 'Idle'
              problem = 'Menunggu material masuk ke line produksi.'
            }

            achievement = newAch
          }

          // Random Down hanya jika tidak sedang Down, Achieved, atau sedang dalam request (dikerjakan)
          if (
            status !== 'Down' &&
            status !== 'Achieved' &&
            !repairRequested &&
            Math.random() > 0.99
          ) {
            status = 'Down'
            problem = [
              'Sensor gagal membaca bahan.',
              'Motor conveyor overheating.',
              'Tekanan udara rendah di pneumatic system.',
              'Masalah pada PLC controller.',
            ][Math.floor(Math.random() * 4)]
          }

          // Jika status Down dan ada request, pertahankan status dan request-nya
          if (status === 'Down' && repairRequested) {
            // Biarkan status Down sampai Engineering menyelesaikannya
          }

          efficiency = Math.round((achievement / target) * 100)

          return {
            ...m,
            achievement,
            status,
            problem,
            efficiency,
            lastUpdate,
            repairRequested,
          }
        }),
      )
    }, 1000)

    return () => clearInterval(interval)
  }, [currentShift, machines])

  // Simpan data shift ke localStorage
  useEffect(() => {
    if (machines.length > 0)
      localStorage.setItem(
        'hasil_shift',
        JSON.stringify({ shift: currentShift, data: machines }),
      )
  }, [machines])

  // --- Render Komponen Leader ---
  return (
    // Background Biru Soft Gradasi
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-200 text-gray-800 p-4 sm:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 p-4 bg-white rounded-2xl shadow-xl border-t-4 border-blue-500">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
            Dashboard Leader Produksi {currentShift}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {' '}
            {time.toLocaleDateString('id-ID', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
        <div className="mt-4 md:mt-0 text-right flex flex-col items-end">
          <p className="text-xl font-bold text-blue-600">
            {time.toLocaleTimeString()}
          </p>
          <p className="text-sm text-gray-600 flex items-center justify-end">
            <span className="mr-1">Shift berakhir dalam:</span>
            <span className="font-extrabold text-lg text-red-500 tracking-wider">
              {getShiftRemainingTime()}
            </span>
          </p>
          <button
            onClick={() => navigateToDashboard('Engineering')}
            className="mt-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold py-1 px-3 rounded-lg transition-colors shadow"
          >
            Ke Dashboard Engineering
          </button>
        </div>
      </div>

      <hr className="my-6 border-gray-300" />

      {/* Area Statistik Kunci, Perbandingan Shift, dan Log Perbaikan */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Card Ringkasan Cepat */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-xl border-l-4 border-blue-500 h-full">
            <h3 className="text-xl font-bold text-blue-600 mb-4">
              Ringkasan Operasi Shift
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <StatCard
                label="Total Mesin"
                value={machines.length}
                color="text-blue-500"
              />
              <StatCard
                label="Mesin Achieved"
                value={machines.filter((m) => m.status === 'Achieved').length}
                color="text-purple-500"
              />
              <StatCard
                label="Mesin Down"
                value={machines.filter((m) => m.status === 'Down').length}
                color="text-red-500"
              />
              <StatCard
                label="Request Pending"
                value={machines.filter((m) => m.repairRequested).length}
                color="text-orange-500"
              />
            </div>
          </div>
        </div>

        {/* Visualisasi Perbandingan Shift */}
        <div className="lg:col-span-1">
          <ShiftComparisonChart
            currentData={machines}
            historyData={lastShiftData}
          />
        </div>

        {/* Log Permintaan Perbaikan */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-xl border-l-4 border-red-500 h-full max-h-96 overflow-y-auto">
            <h3 className="text-xl font-bold text-red-600 mb-4">
              Log Permintaan Perbaikan
            </h3>
            <div className="space-y-2">
              {repairLog.length === 0 ? (
                <p className="text-gray-500 italic text-sm">
                  Tidak ada permintaan perbaikan aktif.
                </p>
              ) : (
                repairLog
                  .slice(-5)
                  .reverse()
                  .map((log, index) => (
                    <div key={index} className="border-b pb-2 text-sm">
                      <span className="font-semibold text-gray-800">
                        {log.machineName}
                      </span>
                      <span className="text-xs text-gray-500 ml-2">
                        ({log.time})
                      </span>
                      <p className="text-red-700 text-xs mt-0.5">
                        Masalah: {log.problem || 'N/A'}
                      </p>
                      <p
                        className={`text-xs font-bold mt-1 
                                                ${log.status === 'Requested' ? 'text-orange-600' : 'text-blue-600'}`}
                      >
                        Status Engineering: {log.status}
                      </p>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      </div>

      <hr className="my-6 border-gray-300" />

      {/* Machine Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {machines.map((m) => (
          <div
            key={m.id}
            className={`bg-white p-5 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border-b-4 ${m.status === 'Achieved' ? 'border-purple-500' : 'hover:border-blue-400 border-transparent'} cursor-pointer`}
          >
            <div className="flex justify-between items-start mb-3">
              <h2 className="text-xl font-bold text-gray-900">{m.name}</h2>
              <span
                className={`px-3 py-1 text-xs font-semibold rounded-full shadow-md ${getStatusColor(m.status)}`}
              >
                {m.status === 'Achieved' ? 'Achieved' : m.status}
              </span>
            </div>

            <div className="mb-4 space-y-1 text-sm">
              <p className="flex justify-between">
                <span className="text-gray-500">Produk:</span>{' '}
                <span className="font-medium text-gray-800">{m.product}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-500">Target:</span>{' '}
                <span className="font-bold text-blue-600">
                  {m.target.toLocaleString()}
                </span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-500">Pencapaian:</span>{' '}
                <span className="font-bold text-green-600">
                  {m.achievement.toLocaleString()}
                </span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-500">Efisiensi:</span>{' '}
                <span
                  className={`font-extrabold ${
                    m.efficiency >= 100
                      ? 'text-purple-600'
                      : m.efficiency > 90
                        ? 'text-green-500'
                        : m.efficiency > 70
                          ? 'text-yellow-500'
                          : 'text-red-500'
                  }`}
                >
                  {m.efficiency}%
                </span>
              </p>
            </div>

            {/* Tombol Request Perbaikan */}
            <RepairRequestButton machine={m} onRequest={handleRequestRepair} />

            {/* Tombol Detail/Masalah (tetap ada) */}
            {(m.status === 'Down' || m.status === 'Idle') && (
              <button
                onClick={() => setSelectedProblem(m)}
                className="mt-2 w-full text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1 rounded-lg font-semibold transition-colors"
              >
                Lihat Status/Problem
              </button>
            )}

            {/* Progress Bar */}
            <div className="mt-4">
              <p className="text-xs text-gray-400 mb-1">Progress Pencapaian</p>
              <div className="h-2.5 rounded-full bg-gray-200 overflow-hidden">
                <div
                  className={`h-full rounded-full ${m.status === 'Achieved' ? 'bg-purple-500' : 'bg-gradient-to-r from-blue-400 to-cyan-400'}`}
                  style={{
                    width: `${Math.min((m.achievement / m.target) * 100, 100)}%`,
                    transition: 'width 0.5s ease-out',
                  }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Detail Problem */}
      {selectedProblem && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-2xl w-full max-w-lg shadow-2xl border-t-8 border-red-500">
            <h3 className="text-2xl font-bold text-red-600 mb-4 flex items-center">
              <span className="mr-2 text-3xl"></span>Status Mesin{' '}
              {selectedProblem.name}
            </h3>
            <p className="text-lg font-medium text-red-700">
              <span className="font-semibold text-gray-500 block text-sm">
                Status Saat Ini:
              </span>{' '}
              <span
                className={`${getStatusColor(selectedProblem.status)} px-2 py-1 rounded-md text-base`}
              >
                {selectedProblem.status}
              </span>
            </p>
            <p className="text-lg font-medium text-gray-700 mt-2">
              <span className="font-semibold text-gray-500 block text-sm">
                Masalah Terdeteksi:
              </span>{' '}
              {selectedProblem.problem}
            </p>
            <div className="flex justify-between mt-6">
              <button
                onClick={() => setSelectedProblem(null)}
                className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-3 rounded-xl font-bold transition-colors"
              >
                Tutup
              </button>
              {selectedProblem.status === 'Down' && (
                <button
                  onClick={() => handleRequestRepair(selectedProblem.id)}
                  disabled={selectedProblem.repairRequested}
                  className={`px-4 py-3 rounded-xl font-bold transition-colors shadow-lg ${
                    selectedProblem.repairRequested
                      ? 'bg-orange-300 text-orange-900 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-300'
                  }`}
                >
                  {selectedProblem.repairRequested
                    ? 'Request Sudah Terkirim'
                    : 'Kirim Request Perbaikan'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Riwayat Shift Sebelumnya */}
      {lastShiftData && (
        <div className="mt-10">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 mb-4 flex items-center">
            Hasil Shift Sebelumnya ({lastShiftData.shift})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-h-[30rem] overflow-y-auto p-2">
            {lastShiftData.data.map((m) => (
              <HistoryMachineCard key={m.id} machine={m} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// --- Komponen Pipeline Visualisasi Status Masalah ---
const PipelineProgress = ({ log, onNextStage }) => {
  const currentStageIndex = log.pipelineStage
  const isResolved = log.status === 'Resolved'
  const totalStages = pipelineStages.length

  // Hitung persentase progress
  const progressPercent = isResolved
    ? 100
    : (currentStageIndex / (totalStages - 1)) * 100

  const currentStageName = pipelineStages[currentStageIndex] || 'N/A'

  const getStageClass = (index) => {
    if (isResolved) return 'bg-green-500 border-green-300'
    if (index < currentStageIndex) return 'bg-green-500 border-green-300'
    if (index === currentStageIndex)
      return 'bg-blue-500 border-blue-300 scale-110'
    return 'bg-gray-300 border-gray-100'
  }

  const handleStageClick = () => {
    if (!isResolved) {
      onNextStage(log)
    }
  }

  return (
    <div className="p-4 bg-gray-50 rounded-lg shadow-inner mt-4">
      <h4 className="text-sm font-semibold text-gray-700 mb-2">
        Status Pipeline:{' '}
        <span
          className={`font-extrabold ${isResolved ? 'text-green-600' : 'text-blue-600'}`}
        >
          {isResolved ? 'SELESAI' : currentStageName.toUpperCase()}
        </span>
      </h4>

      <div className="relative h-2 bg-gray-200 rounded-full mb-2">
        <div
          className={`h-2 rounded-full transition-all duration-700 ${isResolved ? 'bg-green-500' : 'bg-blue-500'}`}
          style={{ width: `${progressPercent}%` }}
        ></div>

        {/* Stage Dots */}
        {pipelineStages.map((stage, index) => (
          <div
            key={index}
            className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 transition-all duration-500 ${getStageClass(index)}`}
            style={{ left: `${(index / (totalStages - 1)) * 100}%` }}
            title={stage}
          ></div>
        ))}
      </div>

      <div className="flex justify-between text-xs font-medium text-gray-500">
        {pipelineStages.map((stage, index) => (
          <span
            key={index}
            className={`w-1/4 text-center ${index === currentStageIndex ? 'text-blue-600 font-bold' : ''} ${isResolved && index === totalStages - 1 ? 'text-green-600 font-bold' : ''}`}
          >
            {stage}
          </span>
        ))}
      </div>

      <button
        onClick={handleStageClick}
        disabled={isResolved}
        className={`mt-4 w-full py-2 rounded-lg font-bold transition-all duration-300 shadow-md ${
          isResolved
            ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-300'
        }`}
      >
        {isResolved
          ? 'Masalah Sudah Selesai'
          : `Lanjut ke Tahap: ${pipelineStages[currentStageIndex + 1] || 'Selesai'}`}
      </button>
    </div>
  )
}

// --- Dashboard Engineering (Komponen Baru) ---
const EngineeringDashboard = ({ navigateToDashboard }) => {
  const [repairLog, setRepairLog] = useState([])

  // Fungsi untuk mensinkronkan log perbaikan dari localStorage
  const syncRepairLog = () => {
    const existingLog = JSON.parse(localStorage.getItem('repair_log') || '[]')
    // Tampilkan semua log kecuali yang sudah di-resolve
    setRepairLog(
      existingLog
        .filter((l) => l.status !== 'Resolved')
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)),
    )
  }

  // Efek untuk memuat dan mendengarkan perubahan pada repair_log
  useEffect(() => {
    syncRepairLog()
    const interval = setInterval(syncRepairLog, 2000) // Sinkronisasi setiap 2 detik
    return () => clearInterval(interval)
  }, [])

  // Fungsi untuk memindahkan log ke tahap berikutnya atau menyelesaikannya
  const handleNextStage = (logEntry) => {
    const nextStageIndex = logEntry.pipelineStage + 1
    const totalStages = pipelineStages.length

    if (nextStageIndex < totalStages) {
      // Belum selesai, pindah ke tahap berikutnya
      const newStatus = nextStageIndex === 1 ? 'In Progress' : 'In Progress' // Status tetap In Progress

      const updatedLog = repairLog.map((log) =>
        log.id === logEntry.id
          ? { ...log, status: newStatus, pipelineStage: nextStageIndex }
          : log,
      )

      setRepairLog(updatedLog)
      localStorage.setItem('repair_log', JSON.stringify(updatedLog))
    } else if (nextStageIndex === totalStages) {
      // Tahap akhir: Resolved

      // 1. Update Log Repair
      const updatedLog = repairLog.map((log) =>
        log.id === logEntry.id
          ? { ...log, status: 'Resolved', pipelineStage: totalStages }
          : log,
      )
      setRepairLog(updatedLog.filter((l) => l.status !== 'Resolved')) // Hapus dari tampilan Engineering
      localStorage.setItem('repair_log', JSON.stringify(updatedLog))

      // 2. Update status Mesin di Dashboard Leader (hasil_shift)
      const savedShiftData = JSON.parse(localStorage.getItem('hasil_shift'))
      if (savedShiftData) {
        const updatedMachines = savedShiftData.data.map((m) => {
          if (m.id === logEntry.machineId) {
            return {
              ...m,
              status: 'Running', // Mesin kembali Running!
              problem: 'Perbaikan selesai oleh Engineering.',
              repairRequested: false,
              efficiency: 100, // Reset efisiensi saat mesin hidup
            }
          }
          return m
        })

        localStorage.setItem(
          'hasil_shift',
          JSON.stringify({ ...savedShiftData, data: updatedMachines }),
        )
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white-200 text-gray-800 p-4 sm:p-8">
      {/* Header Engineering */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 p-4 bg-white rounded-2xl shadow-xl border-t-4 border-red-500">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500">
            Dashboard ENGINEERING
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Pelacakan dan Eksekusi Permintaan Perbaikan dari Leader
          </p>
        </div>
        <button
          onClick={() => navigateToDashboard('Leader')}
          className="mt-4 md:mt-0 bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-1 px-3 rounded-lg transition-colors shadow"
        >
          Pindah ke Dashboard Leader
        </button>
      </div>

      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Daftar Masalah Aktif ({repairLog.length})
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {repairLog.length === 0 ? (
          <div className="lg:col-span-3 bg-white p-10 rounded-2xl text-center shadow-lg border-l-4 border-green-500">
            <p className="text-xl font-bold text-green-600">
              Semua Mesin Sehat! Tidak Ada Permintaan Perbaikan Aktif.
            </p>
            <p className="text-gray-500 mt-2">
              Nantikan permintaan dari Leader.
            </p>
          </div>
        ) : (
          repairLog.map((log) => (
            <div
              key={log.id}
              className={`bg-white p-5 rounded-2xl shadow-xl border-t-4 border-red-500`}
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xl font-bold text-red-600">
                  {log.machineName}
                </h3>
                <span
                  className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor('In Progress')} shadow-md`}
                >
                  {log.status.toUpperCase()}
                </span>
              </div>

              <p className="text-sm text-gray-500 mb-2">
                <span className="font-bold">ID Tiket:</span> {log.id}
              </p>
              <p className="text-md font-medium text-gray-800 border-l-4 border-red-200 pl-2">
                <span className="font-bold text-red-700 block text-sm">
                  Masalah:
                </span>
                {log.problem}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Requested: {log.time}
              </p>

              {/* Pipeline Interkoneksi (Triage -> Repair -> Test -> Deploy/Resolve) */}
              <PipelineProgress log={log} onNextStage={handleNextStage} />
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// --- Komponen Utama (Menangani Navigasi) ---
const App = () => {
  // State untuk menentukan dashboard mana yang aktif (Leader atau Engineering)
  const [currentDashboard, setCurrentDashboard] = useState('Leader')

  const navigateToDashboard = (dashboardName) => {
    setCurrentDashboard(dashboardName)
  }

  return (
    // Menggunakan fragmen untuk membungkus
    <>
      {currentDashboard === 'Leader' && (
        <LeaderDashboard navigateToDashboard={navigateToDashboard} />
      )}
      {currentDashboard === 'Engineering' && (
        <EngineeringDashboard navigateToDashboard={navigateToDashboard} />
      )}
    </>
  )
}

export default App
