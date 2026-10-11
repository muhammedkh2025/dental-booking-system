import { useState } from 'react'

const API_URL = 'http://localhost:5000/api'

export default function PatientDashboard({
  doctors,
  services,
  appointments,
  setAppointments,
  onLogout,
}) {
  const [activeTab, setActiveTab] = useState('overview')
  const [showBookingModal, setShowBookingModal] = useState(false)

  const [patientName, setPatientName] = useState('أحمد علي')
  const [selectedDoctor, setSelectedDoctor] = useState('')
  const [selectedService, setSelectedService] = useState('')
  const [appointmentDate, setAppointmentDate] = useState('')
  const [appointmentTime, setAppointmentTime] = useState('')

  // Filter appointments for this patient
  const myAppointments = appointments.filter(apt => apt.patientName === patientName)

  const handleBookingSubmit = async (e) => {
    e.preventDefault()

    if (!selectedDoctor || !selectedService || !appointmentDate || !appointmentTime) {
      alert('يرجى ملء جميع الحقول')
      return
    }

    const newAppointment = {
      patientName,
      doctorId: Number(selectedDoctor),
      serviceId: Number(selectedService),
      date: appointmentDate,
      time: appointmentTime,
      status: 'Pending',
    }

    try {
      const response = await fetch(`${API_URL}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAppointment),
      })

      const saved = await response.json()
      setAppointments((prev) => [saved, ...prev])
      setSelectedDoctor('')
      setSelectedService('')
      setAppointmentDate('')
      setAppointmentTime('')
      setShowBookingModal(false)
      alert('تم إرسال طلب الحجز بنجاح! سيتم تأكيده قريباً')
    } catch (error) {
      console.error('Error booking appointment:', error)
      alert('حدث خطأ في حجز الموعد')
    }
  }

  return (
    <div className="dashboard-shell">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="brand-icon small">🦷</div>
          <div>
            <h3>SmileCare</h3>
            <span>بوابة المريض</span>
          </div>
        </div>

        <nav className="nav-menu">
          <button
            className={activeTab === 'overview' ? 'nav-item active' : 'nav-item'}
            onClick={() => setActiveTab('overview')}
          >
            📊 الرئيسية
          </button>
          <button
            className={activeTab === 'myappointments' ? 'nav-item active' : 'nav-item'}
            onClick={() => setActiveTab('myappointments')}
          >
            📅 مواعيدي
          </button>
          <button
            className={activeTab === 'doctors' ? 'nav-item active' : 'nav-item'}
            onClick={() => setActiveTab('doctors')}
          >
            👨‍⚕️ الأطباء
          </button>
          <button
            className={activeTab === 'services' ? 'nav-item active' : 'nav-item'}
            onClick={() => setActiveTab('services')}
          >
            🛠️ الخدمات
          </button>
          <button className="nav-item danger" onClick={onLogout}>
            🚪 تسجيل الخروج
          </button>
        </nav>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div>
            <p className="eyebrow">مرحباً بك</p>
            <h1>{patientName}</h1>
          </div>
          <button className="primary-btn" onClick={() => setShowBookingModal(true)}>
            📅 حجز موعد جديد
          </button>
        </header>

        {/* Modal */}
        {showBookingModal && (
          <div className="modal-overlay" onClick={() => setShowBookingModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>حجز موعد جديد</h2>
                <button className="close-btn" onClick={() => setShowBookingModal(false)}>✕</button>
              </div>
              <form className="booking-form" onSubmit={handleBookingSubmit}>
                <div className="form-row">
                  <label>
                    الطبيب
                    <select value={selectedDoctor} onChange={(e) => setSelectedDoctor(e.target.value)}>
                      <option value="">اختر الطبيب</option>
                      {doctors.map((doc) => (
                        <option key={doc.id} value={doc.id}>
                          {doc.name} - {doc.specialty}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    الخدمة
                    <select value={selectedService} onChange={(e) => setSelectedService(e.target.value)}>
                      <option value="">اختر الخدمة</option>
                      {services.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="form-row">
                  <label>
                    التاريخ
                    <input type="date" value={appointmentDate} onChange={(e) => setAppointmentDate(e.target.value)} />
                  </label>
                  <label>
                    الوقت
                    <input type="time" value={appointmentTime} onChange={(e) => setAppointmentTime(e.target.value)} />
                  </label>
                </div>
                <button type="submit" className="primary-btn full-width">تأكيد الحجز</button>
              </form>
            </div>
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            <section className="stats-grid">
              <div className="stat-box">
                <span>📅</span>
                <div>
                  <small>مواعيدي</small>
                  <strong>{myAppointments.length}</strong>
                </div>
              </div>
              <div className="stat-box">
                <span>✅</span>
                <div>
                  <small>المؤكدة</small>
                  <strong>{myAppointments.filter(a => a.status === 'Confirmed').length}</strong>
                </div>
              </div>
              <div className="stat-box">
                <span>⏳</span>
                <div>
                  <small>قيد الانتظار</small>
                  <strong>{myAppointments.filter(a => a.status === 'Pending').length}</strong>
                </div>
              </div>
              <div className="stat-box">
                <span>👨‍⚕️</span>
                <div>
                  <small>الأطباء المتاحين</small>
                  <strong>{doctors.length}</strong>
                </div>
              </div>
            </section>

            <section className="panel-grid">
              <div className="panel">
                <h3>آخر مواعيدك</h3>
                <div className="list-box">
                  {myAppointments.length > 0 ? (
                    myAppointments.slice(0, 5).map((apt) => (
                      <div key={apt.id} className="row-item">
                        <div>
                          <strong>{apt.doctorName}</strong>
                          <p>{apt.date} - {apt.time}</p>
                        </div>
                        <span className={apt.status === 'Confirmed' ? 'badge success' : 'badge pending'}>
                          {apt.status === 'Confirmed' ? '✓' : '⏳'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p style={{ padding: '20px', textAlign: 'center', color: '#57708d' }}>
                      لا توجد مواعيد محجوزة بعد
                    </p>
                  )}
                </div>
              </div>

              <div className="panel">
                <h3>نصائح مهمة</h3>
                <div className="list-box">
                  <div className="row-item">
                    <strong>💡 نصيحة 1</strong>
                    <p>احجز الموعد قبل 24 ساعة</p>
                  </div>
                  <div className="row-item">
                    <strong>💡 نصيحة 2</strong>
                    <p>لا تنسَ إحضار بطاقتك الصحية</p>
                  </div>
                  <div className="row-item">
                    <strong>💡 نصيحة 3</strong>
                    <p>تنظيف الأسنان قبل الموعد</p>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {/* My Appointments Tab */}
        {activeTab === 'myappointments' && (
          <div className="panel large-panel">
            <h3>مواعيدي المحجوزة</h3>
            <div className="appointment-list">
              {myAppointments.length > 0 ? (
                myAppointments.map((apt) => (
                  <div key={apt.id} className="appointment-item">
                    <div>
                      <strong>{apt.doctorName}</strong>
                      <p>{apt.serviceName || 'خدمة طب أسنان'}</p>
                    </div>
                    <div>
                      <p>📅 {apt.date}</p>
                      <p>⏰ {apt.time}</p>
                    </div>
                    <span className={apt.status === 'Confirmed' ? 'badge success' : 'badge pending'}>
                      {apt.status === 'Confirmed' ? '✓ مؤكد' : '⏳ قيد الانتظار'}
                    </span>
                  </div>
                ))
              ) : (
                <div style={{ padding: '40px', textAlign: 'center', color: '#57708d' }}>
                  <p>لم تقم بحجز أي مواعيد بعد</p>
                  <button
                    className="primary-btn"
                    onClick={() => setShowBookingModal(true)}
                    style={{ marginTop: '20px' }}
                  >
                    احجز موعداً الآن
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Doctors Tab */}
        {activeTab === 'doctors' && (
          <div className="panel large-panel">
            <h3>فريق أطبائنا</h3>
            <div className="doctor-grid">
              {doctors.map((doctor) => (
                <div key={doctor.id} className="doctor-card">
                  <div className="doctor-avatar">👨‍⚕️</div>
                  <h4>{doctor.name}</h4>
                  <p>{doctor.specialty}</p>
                  <small>{doctor.shift}</small>
                  <button className="primary-btn" style={{ marginTop: '12px', width: '100%' }}>
                    احجز معه
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Services Tab */}
        {activeTab === 'services' && (
          <div className="panel large-panel">
            <h3>الخدمات المتاحة</h3>
            <div className="service-grid">
              {services.map((service) => (
                <div key={service.id} className="service-card">
                  <h4>{service.name}</h4>
                  <p>{service.description}</p>
                  <strong>{service.price} ر.س</strong>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
