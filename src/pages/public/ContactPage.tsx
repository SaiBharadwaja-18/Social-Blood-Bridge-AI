import { useState } from 'react';
import { Mail, Phone, MapPin, CheckCircle2 } from 'lucide-react';

export function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setFormData({ name: '', email: '', subject: '', message: '' });
      setSubmitted(false);
    }, 3000);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    borderRadius: '10px',
    border: '1.5px solid #ffe4e6',
    backgroundColor: '#ffffff',
    padding: '10px 14px',
    fontSize: '14px',
    color: '#111827',
    outline: 'none',
    marginTop: '6px',
    transition: 'border-color 0.2s',
    fontFamily: 'inherit',
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fff1f2' }}>
      <div className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">

          {/* Header */}
          <div className="text-center mb-12">
            <span
              className="inline-flex rounded-full px-5 py-2 text-sm font-semibold mb-5"
              style={{ backgroundColor: '#ffe4e6', color: '#be123c' }}
            >
              Get In Touch
            </span>
            <h1 className="text-4xl font-bold mt-4" style={{ color: '#111827' }}>Contact Us</h1>
            <p className="mt-3 text-base" style={{ color: '#6b7280' }}>
              Get in touch with the Social Blood Bridge AI team
            </p>
          </div>

          {/* Grid — equal height columns */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 items-stretch">

            {/* Left — stacked cards filling full height */}
            <div className="flex flex-col gap-4 h-full">

              {[
                { icon: Mail,   title: 'Email',  content: 'contact@bloodbridge.in', desc: 'We respond within 24 hours' },
                { icon: Phone,  title: 'Phone',  content: '+91-98765-43210',        desc: 'Monday to Friday, 9 AM – 5 PM' },
                { icon: MapPin, title: 'Office', content: 'Hyderabad, India',       desc: 'Social Blood Bridge AI HQ' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 rounded-2xl p-5"
                  style={{ backgroundColor: '#ffffff', border: '1px solid #ffe4e6' }}
                >
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                    style={{ backgroundColor: '#fff1f2' }}
                  >
                    <item.icon className="h-5 w-5" style={{ color: '#e11d48' }} />
                  </div>
                  <div>
                    <p className="text-xs font-bold tracking-widest uppercase" style={{ color: '#fda4af' }}>
                      {item.title}
                    </p>
                    <p className="mt-0.5 text-sm font-semibold" style={{ color: '#111827' }}>{item.content}</p>
                    <p className="mt-0.5 text-xs" style={{ color: '#9ca3af' }}>{item.desc}</p>
                  </div>
                </div>
              ))}

              {/* Note card — grows to fill remaining space */}
              <div
                className="flex-1 rounded-2xl p-6 flex flex-col justify-center"
                style={{ backgroundColor: '#ffe4e6', border: '1px solid #fecdd3' }}
              >
                <p className="text-sm font-bold" style={{ color: '#be123c' }}>🩸 Every message matters</p>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: '#e11d48' }}>
                  Whether you're a donor, patient, or coordinator — we're here to help you navigate the platform and support the mission.
                </p>
              </div>

            </div>

            {/* Right — Form */}
            <div
              className="rounded-2xl p-8 flex flex-col"
              style={{ backgroundColor: '#ffffff', border: '1px solid #ffe4e6' }}
            >
              {submitted ? (
                <div className="flex flex-col items-center justify-center flex-1 py-12 gap-4">
                  <div
                    className="flex h-16 w-16 items-center justify-center rounded-full"
                    style={{ backgroundColor: '#fff1f2' }}
                  >
                    <CheckCircle2 className="h-8 w-8" style={{ color: '#e11d48' }} />
                  </div>
                  <h3 className="text-lg font-semibold" style={{ color: '#111827' }}>Message Sent!</h3>
                  <p className="text-sm text-center" style={{ color: '#9ca3af' }}>
                    Thank you for reaching out. We'll get back to you within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-5 h-full">

                  <div>
                    <h2 className="text-lg font-bold" style={{ color: '#111827' }}>Send us a message</h2>
                    <p className="text-xs mt-1" style={{ color: '#9ca3af' }}>
                      Fill in the details below and we'll be in touch.
                    </p>
                  </div>

                  {/* Name & Email */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold tracking-widest uppercase" style={{ color: '#6b7280' }}>Name</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Your name"
                        style={inputStyle}
                        onFocus={e => (e.currentTarget.style.borderColor = '#fda4af')}
                        onBlur={e => (e.currentTarget.style.borderColor = '#ffe4e6')}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold tracking-widest uppercase" style={{ color: '#6b7280' }}>Email</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        placeholder="your@email.com"
                        style={inputStyle}
                        onFocus={e => (e.currentTarget.style.borderColor = '#fda4af')}
                        onBlur={e => (e.currentTarget.style.borderColor = '#ffe4e6')}
                      />
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="text-xs font-bold tracking-widest uppercase" style={{ color: '#6b7280' }}>Subject</label>
                    <input
                      type="text"
                      required
                      value={formData.subject}
                      onChange={e => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="How can we help?"
                      style={inputStyle}
                      onFocus={e => (e.currentTarget.style.borderColor = '#fda4af')}
                      onBlur={e => (e.currentTarget.style.borderColor = '#ffe4e6')}
                    />
                  </div>

                  {/* Message — flex-1 so it fills remaining space */}
                  <div className="flex flex-col flex-1">
                    <label className="text-xs font-bold tracking-widest uppercase" style={{ color: '#6b7280' }}>Message</label>
                    <textarea
                      required
                      value={formData.message}
                      onChange={e => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Write your message here..."
                      style={{ ...inputStyle, resize: 'none', flex: 1, minHeight: '120px' }}
                      onFocus={e => (e.currentTarget.style.borderColor = '#fda4af')}
                      onBlur={e => (e.currentTarget.style.borderColor = '#ffe4e6')}
                    />
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    className="w-full rounded-xl py-3 text-sm font-semibold text-white transition-colors mt-auto"
                    style={{ backgroundColor: '#e11d48' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#be123c')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#e11d48')}
                  >
                    Send Message →
                  </button>

                </form>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}