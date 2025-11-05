// src/utils/seedFirestore.js
import { db } from '../firebaseConfig'
import { collection, doc, setDoc } from 'firebase/firestore'

// Daftar mesin (5 mesin)
const mesinList = [
  { id_mesin: 'M01', nama_mesin: 'Mesin Potong', produk: 'Gear Housing' },
  { id_mesin: 'M02', nama_mesin: 'Mesin Press', produk: 'Bearing Plate' },
  { id_mesin: 'M03', nama_mesin: 'Mesin Bubut', produk: 'Axle Shaft' },
  { id_mesin: 'M04', nama_mesin: 'Mesin Milling', produk: 'Drive Pulley' },
  { id_mesin: 'M05', nama_mesin: 'Mesin Las', produk: 'Frame Support' },
]

// Daftar shift
const shiftList = ['Shift 1', 'Shift 2', 'Shift 3']

// Fungsi untuk menghasilkan angka acak dalam rentang
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// Fungsi untuk menentukan status mesin berdasarkan capaian
function getStatus(target, capaian) {
  const ratio = capaian / target
  if (ratio >= 0.9) return 'Normal'
  if (ratio >= 0.7) return 'Lambat'
  return 'Gangguan'
}

// Fungsi untuk menentukan problem
function getProblem(status) {
  if (status === 'Normal') return 'Tidak ada'
  if (status === 'Lambat') return 'Motor belt longgar'
  if (status === 'Gangguan') return 'Sensor kecepatan error'
}

// Fungsi utama seeding
export async function seedFirestore() {
  try {
    const produksiRef = collection(db, 'produksi_harian')

    // Buat data 7 hari ke belakang
    for (let d = 0; d < 7; d++) {
      const date = new Date()
      date.setDate(date.getDate() - d)
      const tanggal = date.toISOString().split('T')[0] // YYYY-MM-DD

      for (const shift of shiftList) {
        for (const mesin of mesinList) {
          const target = randomInt(450, 550)
          const capaian = randomInt(300, 550)
          const status = getStatus(target, capaian)
          const problem = getProblem(status)

          const docId = `${tanggal}_${shift}_${mesin.id_mesin}`
          await setDoc(doc(produksiRef, docId), {
            tanggal,
            shift,
            id_mesin: mesin.id_mesin,
            nama_mesin: mesin.nama_mesin,
            produk: mesin.produk,
            target,
            capaian,
            status,
            problem,
          })
        }
      }
    }

    console.log('✅ Data dummy produksi_harian berhasil dibuat di Firestore!')
  } catch (error) {
    console.error('❌ Gagal membuat data dummy:', error)
  }
}
