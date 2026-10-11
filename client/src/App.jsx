import { useEffect, useState } from 'react'
import './App.css'

const API_URL = 'http://localhost:5000/api'

function App() {
  const [doctors, setDoctors] = useState([])
  const [services, setServices] = useState([])
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [selectedDoctor, setSelectedDoctor] = useState('')
  const [selectedService, setSelectedService] = useState('')
  const [patientName, setPatientName] = useState('')
  const [appointmentDate, setAppointmentDate] = useState('')
  const [appointmentTime, setAppointmentTime] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [doctorsRes, servicesRes, appointmentsRes] = await Promise.all([
        fetch(`${API_URL}/doctors`),
        fetch(`${API_URL}/services`),
        fetch(`${API_URL}/appointments`),
      ])

      const doctorsData = await doctorsRes.json()
      const servicesData = await servicesRes.json()
      const appointmentsData = await appointmentsRes.json()

      setDoctors(doctorsData)
      setServices(servicesData)
      setAppointments(appointmentsData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = (e) => {
    e.preventDefault()
    if (loginForm.email && loginForm.password) {
      setIsLoggedIn(true)
    } else {
      alert('يرجى إدخال البريد الإلكتروني وكلمة المرور')
    }
  }

  const handleBookingSubmit = async (e) => {
    e.preventDefault()

    if (!patientName || !selectedDoctor || !selectedService || !appointmentDate || !appointmentTime) {
      alert('يرجى ملء جميع الحقول')
      return
    }

    const newAppointment = {
      patientName,
      doctorId: Number(selectedDoctor),
      serviceId: Number(selectedService),
      date: appointmentDate,
      time: appointmentTime,
      status: 'Confirmed',
    }

    try {
      const response = await fetch(`${API_URL}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAppointment),
      })

      const saved = await response.json()
      setAppointments((prev) => [saved, ...prev])
      setPatientName('')
      setSelectedDoctor('')
      setSelectedService('')
      setAppointmentDate('')
      setAppointmentTime('')
      setActiveTab('appointments')
      alert('تم حجز الموعد بنجاح!')
    } catch (error) {
      console.error('Error booking appointment:', error)
      alert('حدث خطأ في حجز الموعد')
    }
  }

  if (loading) {
    return (
      <div className="loader-container">
        <div className="spinner"></div>
        <p>جاري تحميل النظام...</p>
      </div>
    )
  }

  if (!isLoggedIn) {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="brand-block">
            <div className="brand-icon">🦷</div>
            <h1>SmileCare</h1>
            <p>نظام حجوزات عيادة الأسنان</p>
          </div>

          <form className="login-form" onSubmit={handleLogin}>
            <h2>تسجيل الدخول</h2>

            <label>
              البريد الإلكتروني
              <input
                type="email"
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                placeholder="admin@smilecare.com"
              />
            </label>

            <label>
              كلمة المرور
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                placeholder="••••••••"
              />
            </label>

            <button type="submit" className="primary-btn">دخول النظام</button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-shell">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="brand-icon small">🦷</div>
          <div>
            <h3>SmileCare</h3>
            <span>Clinic Admin</span>
          </div>
        </div>

        <nav className="nav-menu">
          <button className={activeTab === 'overview' ? 'nav-item active' : 'nav-item'} onClick={() => setActiveTab('overview')}>
            الرئيسية
          </button>
          <button className={activeTab === 'appointments' ? 'nav-item active' : 'nav-item'} onClick={() => setActiveTab('appointments')}>
            الحجوزات
          </button>
          <button className={activeTab === 'doctors' ? 'nav-item active' : 'nav-item'} onClick={() => setActiveTab('doctors')}>
            الأطباء
          </button>
          <button className={activeTab === 'services' ? 'nav-item active' : 'nav-item'} onClick={() => setActiveTab('services')}>
            الخدمات
          </button>
          <button className="nav-item danger" onClick={() => setIsLoggedIn(false)}>
            تسجيل الخروج
          </button>
        </nav>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div>
            <p className="eyebrow">لوحة التحكم</p>
            <h1>نظام حجوزات طب الأسنان</h1>
          </div>
          <button className="primary-btn" onClick={() => setActiveTab('appointments')}>
            + حجز جديد
          </button>
        </header>

        {activeTab === 'overview' && (
          <>
            <section className="stats-grid">
              <div className="stat-box">
                <span>👨‍⚕️</span>
                <div>
                  <small>الأطباء</small>
                  <strong>{doctors.length}</strong>
                </div>
              </div>
              <div className="stat-box">
                <span>🛠️</span>
                <div>
                  <small>الخدمات</small>
                  <strong>{services.length}</strong>
                </div>
              </div>
              <div className="stat-box">
                <span>📅</span>
                <div>
                  <small>المواعيد</small>
                  <strong>{appointments.length}</strong>
                </div>
              </div>
            </section>

            <section className="panel-grid">
              <div className="panel">
                <h3>أطباء العيادة</h3>
                <div className="list-box">
                  {doctors.map((doctor) => (
                    <div key={doctor.id} className="row-item">
                      <strong>{doctor.name}</strong>
                      <span>{doctor.specialty}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="panel">
                <h3>الآخرون</h3>
                <div className="list-box">
                  <div className="row-item">
                    <strong>الإشعارات</strong>
                    <span>4 جديدة</span>
                  </div>
                  <div className="row-item">
                    <strong>الفواتير</strong>
                    <span>12 عملية</span>
                  </div>
                  <div className="row-item">
                    <strong>المرضى</strong>
                    <span>254 مريض</span>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {activeTab === 'appointments' && (
          <section className="panel large-panel">
            <h3>حجز موعد جديد</h3>

            <form className="booking-form" onSubmit={handleBookingSubmit}>
              <div className="form-row">
                <label>
                  اسم المريض
                  <input type="text" value={patientName} onChange={(e) => setPatientName(e.target.value)} placeholder="أدخل الاسم" />
                </label>

                <label>
                  الطبيب
                  <select value={selectedDoctor} onChange={(e) => setSelectedDoctor(e.target.value)}>
                    <option value="">اختر الطبيب</option>
                    {doctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>{doctor.name}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="form-row">
                <label>
                  الخدمة
                  <select value={selectedService} onChange={(e) => setSelectedService(e.target.value)}>
                    <option value="">اختر الخدمة</option>
                    {services.map((service) => (
                      <option key={service.id} value={service.id}>{service.name}</option>
                    ))}
                  </select>
                </label>

                <label>
                  التاريخ
                  <input type="date" value={appointmentDate} onChange={(e) => setAppointmentDate(e.target.value)} />
                </label>
              </div>

              <div className="form-row single">
                <label>
                  الوقت
                  <input type="time" value={appointmentTime} onChange={(e) => setAppointmentTime(e.target.value)} />
                </label>
              </div>

              <button type="submit" className="primary-btn full-width">تأكيد الحجز</button>
            </form>

            <div className="appointment-list">
              {appointments.map((appointment) => (
                <div key={appointment.id} className="appointment-item">
                  <div>
                    <strong>{appointment.patientName}</strong>
                    <p>{appointment.doctorName}</p>
                  </div>
                  <div>
                    <p>{appointment.date}</p>
                    <p>{appointment.time}</p>
                  </div>
                  <span className={appointment.status === 'Confirmed' ? 'badge success' : 'badge pending'}>
                    {appointment.status === 'Confirmed' ? 'مؤكد' : 'قيد الانتظار'}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'doctors' && (
          <section className="panel large-panel">
            <h3>قائمة الأطباء</h3>
            <div className="doctor-grid">
              {doctors.map((doctor) => (
                <div key={doctor.id} className="doctor-card">
                  <div className="doctor-avatar">👨‍⚕️</div>
                  <h4>{doctor.name}</h4>
                  <p>{doctor.specialty}</p>
                  <small>{doctor.shift}</small>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'services' && (
          <section className="panel large-panel">
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
          </section>
        )}
      </main>
    </div>
  )
}

export default App
