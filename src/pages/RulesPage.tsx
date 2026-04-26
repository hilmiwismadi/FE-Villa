import React from 'react';
import { Link } from 'react-router-dom';

const rules = [
  {
    number: '01',
    title: 'Waktu Check-In & Check-Out',
    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    items: [
      { label: 'Check-In', value: 'Mulai pukul 14.00 WIB' },
      { label: 'Check-Out', value: 'Maksimal pukul 12.00 WIB' },
      { label: 'Denda Keterlambatan', value: 'Hingga 50% dari harga sewa jika melebihi jam yang ditentukan' },
    ],
  },
  {
    number: '02',
    title: 'Aturan Perilaku & Larangan Utama',
    icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z',
    subtitle: 'Villa di area ini mayoritas adalah "Villa Keluarga" yang menerapkan aturan ketat.',
    items: [
      { label: 'Dilarang Keras', value: 'Membawa atau mengonsumsi minuman keras (alkohol) dan narkoba', highlight: true },
      { label: 'Larangan Asusila', value: 'Dilarang membawa pasangan yang bukan muhrim (no pacaran/mesum)', highlight: true },
      { label: 'Dilarang Merokok di Dalam', value: 'Merokok hanya diperbolehkan di area luar atau teras villa; pelanggaran dikenakan denda' },
    ],
  },
  {
    number: '03',
    title: 'Penggunaan Fasilitas Hiburan',
    icon: 'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3',
    items: [
      { label: 'Jam Malam', value: 'Berlaku pukul 24.00 WIB untuk menjaga ketenangan lingkungan sekitar' },
      { label: 'Karaoke', value: 'Penggunaan karaoke keluarga dibatasi hingga pukul 23.30 WIB' },
      { label: 'Larangan Sound Besar', value: 'Dilarang mengadakan acara dengan live music, DJ, organ tunggal, atau alat musik big sound tanpa izin khusus', highlight: true },
    ],
  },
  {
    number: '04',
    title: 'Kapasitas & Identitas',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
    items: [
      { label: 'Identitas', value: 'Tamu wajib menunjukkan kartu identitas (KTP) saat proses registrasi/check-in' },
      { label: 'Batas Kapasitas', value: 'Jumlah tamu tidak boleh melebihi kapasitas maksimal yang disepakati' },
      { label: 'Biaya Tambahan', value: 'Kelebihan tamu dikenakan charge mulai Rp25.000/orang atau extra bed sebesar Rp100.000' },
    ],
  },
];

const RulesPage: React.FC = () => {
  return (
    <div>
      {/* Header */}
      <section className="section-padding bg-white">
        <div className="container-custom max-w-3xl text-center">
          <span className="text-xs font-mono text-gold-600 uppercase tracking-widest">Tahun 2026</span>
          <h1 className="text-5xl md:text-6xl font-serif text-primary-900 mt-2 mb-4">Aturan Villa</h1>
          <p className="text-lg text-primary-700 leading-relaxed">
            Aturan menginap di villa kawasan Sekipan, Tawangmangu, secara umum mengikuti norma masyarakat setempat dan kebijakan pengelola untuk menjaga kenyamanan serta keamanan.
          </p>
        </div>
      </section>

      {/* Rules Sections */}
      <section className="section-padding bg-primary-50">
        <div className="container-custom max-w-4xl space-y-12">
          {rules.map((rule) => (
            <div key={rule.number} className="bg-white border border-primary-200 rounded-lg overflow-hidden">
              {/* Rule Header */}
              <div className="flex items-center gap-4 p-6 border-b border-primary-100 bg-white">
                <div className="w-14 h-14 bg-primary-900 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={rule.icon} />
                  </svg>
                </div>
                <div>
                  <span className="text-xs font-mono text-gold-600 uppercase tracking-widest">Rule {rule.number}</span>
                  <h2 className="text-2xl font-serif text-primary-900">{rule.title}</h2>
                </div>
              </div>

              {/* Rule Body */}
              <div className="p-6">
                {rule.subtitle && (
                  <p className="text-sm text-primary-500 mb-4 italic">{rule.subtitle}</p>
                )}
                <div className="space-y-4">
                  {rule.items.map((item, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${item.highlight ? 'bg-red-500' : 'bg-gold-600'}`} />
                      <div>
                        <span className="text-sm font-semibold uppercase tracking-wide text-primary-900">{item.label}</span>
                        <p className="text-primary-700 mt-0.5">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Summary Box */}
      <section className="section-padding bg-white">
        <div className="container-custom max-w-4xl">
          <div className="bg-primary-900 text-white p-8 md:p-12 rounded-lg text-center">
            <h2 className="text-3xl font-serif mb-4">Mari Patuhi Aturan Bersama</h2>
            <p className="text-primary-200 text-lg mb-8 max-w-2xl mx-auto">
              Demi kenyamanan semua tamu dan menjaga hubungan baik dengan masyarakat sekitar, kami mengharapkan kerjasama Anda dalam mematuhi seluruh aturan di atas.
            </p>
            <Link
              to="/book"
              className="btn-gold inline-block"
            >
              Pesan Sekarang
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RulesPage;
