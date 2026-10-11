import { useEffect, useState } from 'react'
import './App.css'

const API_URL = 'http://localhost:5000/api'

function App() {
  const [doctors, setDoctors] = useState([])
  const [services, setServices] = useState([])
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDoctor, setSelectedDoctor] = useState('')
  const [selectedService, setSelectedService] = useState('')
  const [patientName, setPatientName] = useState('')
  const [appointmentDate, setAppointmentDate] = useState('')
  const [appointmentTime, setAppointmentTime] = useState('')
  const [showBookingForm, setShowBookingForm] = useState(false)

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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAppointment),
      })

      const saved = await response.json()
      setAppointments((prev) => [saved, ...prev])
      
      // Reset form
      setPatientName('')
      setSelectedDoctor('')
      setSelectedService('')
      setAppointmentDate('')
      setAppointmentTime('')
      setShowBookingForm(false)
      
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
        <p>جاري تحميل البيانات...</p>
      </div>
    )
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo">🦷</div>
            <div>
              <h1>SmileCare</h1>
              <p>عيادة طب الأسنان المتقدمة</p>
            </div>
          </div>
          <button 
            className="btn-book-appointment"
            onClick={() => setShowBookingForm(!showBookingForm)}
          >
            {showBookingForm ? 'إغلاق' : '📅 حجز موعد'}
          </button>
        </div>
      </header>

      {/* Booking Form */}
      {showBookingForm && (
        <section className="booking-form-section">
          <form className="booking-form" onSubmit={handleBookingSubmit}>
            <h2>حجز موعد جديد</h2>
            
            <div className="form-group">
              <label>اسم المريض</label>
              <input
                type="text"
                placeholder="أدخل اسمك الكامل"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>اختر الطبيب</label>
                <select
                  value={selectedDoctor}
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                  required
                >
                  <option value="">-- اختر طبيب --</option>
                  {doctors.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.name} - {doc.specialty}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>اختر الخدمة</label>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  required
                >
                  <option value="">-- اختر خدمة --</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>التاريخ</label>
                <input
                  type="date"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>الوقت</label>
                <input
                  type="time"
                  value={appointmentTime}
                  onChange={(e) => setAppointmentTime(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-submit">تأكيد الحجز</button>
          </form>
        </section>
      )}

      {/* Stats */}
      <section className="stats-section">
        <div className="stat-card">
          <span className="icon">👨‍⚕️</span>
          <div>
            <p>عدد الأطباء</p>
            <h3>{doctors.length}</h3>
          </div>
        </div>
        <div className="stat-card">
          <span className="icon">🛠️</span>
          <div>
            <p>الخدمات المتاحة</p>
            <h3>{services.length}</h3>
          </div>
        </div>
        <div className="stat-card">
          <span className="icon">📅</span>
          <div>
            <p>إجمالي المواعيد</p>
            <h3>{appointments.length}</h3>
          </div>
        </div>
      </section>

      {/* Doctors Section */}
      <section className="section">
        <h2>فريق أطبائنا</h2>
        <div className="cards-grid">
          {doctors.map((doctor) => (
            <div key={doctor.id} className="card doctor-card">
              <div className="card-avatar">👨‍⚕️</div>
              <h3>{doctor.name}</h3>
              <p className="specialty">{doctor.specialty}</p>
              <p className="shift">⏰ {doctor.shift}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Services Section */}
      <section className="section">
        <h2>خدماتنا الطبية</h2>
        <div className="cards-grid">
          {services.map((service) => (
            <div key={service.id} className="card service-card">
              <h3>{service.name}</h3>
              <p className="description">{service.description}</p>
              <div className="price-tag">{service.price} ر.س</div>
            </div>
          ))}
        </div>
      </section>

      {/* Appointments Section */}
      <section className="section">
        <h2>المواعيد المحجوزة</h2>
        <div className="appointments-list">
          {appointments.length === 0 ? (
            <p className="no-appointments">لا توجد مواعيد محجوزة حالياً</p>
          ) : (
            appointments.map((appointment) => (
              <div key={appointment.id} className="appointment-item">
                <div className="appointment-info">
                  <div>
                    <h4>{appointment.patientName}</h4>
                    <p>الطبيب: {appointment.doctorName}</p>
                  </div>
                  <div>
                    <p>📅 {appointment.date}</p>
                    <p>⏰ {appointment.time}</p>
                  </div>
                </div>
                <span className={`status status-${appointment.status.toLowerCase()}`}>
                  {appointment.status === 'Confirmed' ? '✓ مؤكد' : '⏳ قيد الانتظار'}
                </span>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>&copy; 2026 SmileCare - عيادة طب الأسنان. جميع الحقوق محفوظة</p>
      </footer>
    </div>
  )
}

export default App
