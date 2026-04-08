import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="min-h-screen bg-gradient-to-br from-emerald-200 via-lime-100 to-cyan-100 text-slate-800"
    >
      {children}
    </motion.div>
  )
}

function FlairDots() {
  return (
    <>
      <div className="absolute left-8 top-28 h-24 w-24 rounded-full bg-emerald-400/50 blur-2xl" />
      <div className="absolute right-10 top-64 h-32 w-32 rounded-full bg-cyan-400/50 blur-3xl" />
    </>
  )
}

function ContactForm() {
  const [submitStatus, setSubmitStatus] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    amount: '',
    goals: '',
  })

  const handleSubmit = async () => {
    const emailRegex = new RegExp('^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$')
    const phoneRegex = new RegExp('^\\d{10}$')

    if (!formData.name.trim()) {
      setSubmitStatus('Incomplete form: please enter a valid full name.')
      return
    }

    if (!emailRegex.test(formData.email.trim())) {
      setSubmitStatus('Incomplete form: please enter a valid email address.')
      return
    }

    if (!phoneRegex.test(formData.phone.trim())) {
      setSubmitStatus('Incomplete form: phone number must be exactly 10 digits.')
      return
    }

    if (!formData.amount.trim()) {
      setSubmitStatus('Incomplete form: investment amount is required.')
      return
    }
    try {
      const payload = new URLSearchParams(formData)
      await fetch('https://script.google.com/macros/s/AKfycbyswXV9eCSIMgvplalTD81RWJaRTOLxiP-IR5hmA2jYD74uG3D35F_jPwVBDJASmYbh/exec', {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: payload.toString(),
      })
      setSubmitStatus('Submitted successfully!')
      setFormData({ name: '', email: '', phone: '', amount: '', goals: '' })
    } catch {
      setSubmitStatus('Submission failed. Please try again.')
    }
  }

  return (
    <div className="mx-auto max-w-3xl rounded-3xl bg-white/90 p-8 shadow-lg">
      <h2 className="mb-6 text-3xl font-semibold">Client Onboarding</h2>
      <p className="mb-4 text-gray-500">Fill in your details and our team will reach out from support@vittavault.in.</p>
      <div className="grid gap-4 md:grid-cols-2">
  <input
    required
    minLength={2}
    pattern="[A-Za-z ]{2,}"
    className="rounded-2xl border p-4"
    placeholder="Full Name"
    value={formData.name}
    onChange={(e) =>
      setFormData({ ...formData, name: e.target.value })
    }
  />

  <input
    required
    type="email"
    className="rounded-2xl border p-4"
    placeholder="Email"
    value={formData.email}
    onChange={(e) =>
      setFormData({ ...formData, email: e.target.value })
    }
  />

  <input
    required
    type="tel"
    inputMode="numeric"
    maxLength={10}
    className="rounded-2xl border p-4"
    placeholder="Phone (10 digits)"
    value={formData.phone}
    onChange={(e) =>
      setFormData({
        ...formData,
        phone: e.target.value.replace(/\D/g, '').slice(0, 10),
      })
    }
  />

  <input
    required
    type="number"
    className="rounded-2xl border p-4"
    placeholder="Investment Amount"
    value={formData.amount}
    onChange={(e) =>
      setFormData({ ...formData, amount: e.target.value })
    }
  />
</div>

<textarea
  className="mt-4 w-full rounded-2xl border p-4"
  rows={4}
  placeholder="Tell us your investment goals"
  value={formData.goals}
  onChange={(e) =>
    setFormData({ ...formData, goals: e.target.value })
  }
/>
      <button onClick={handleSubmit} className="mt-4 rounded-2xl bg-green-600 px-6 py-3 text-white shadow-sm">Submit Enquiry</button>
      <p className={`mt-3 text-sm ${submitStatus.toLowerCase().includes('incomplete') || submitStatus.toLowerCase().includes('failed') ? 'text-red-600' : 'text-green-600'}`}>{submitStatus}</p>
    </div>
  )
}

function SIPCalculator() {
  const [mode, setMode] = useState<'sip' | 'lumpsum'>('sip')
  const [monthly, setMonthly] = useState(25000)
  const [principal, setPrincipal] = useState(500000)
  const [rate, setRate] = useState(12)
  const [years, setYears] = useState(10)

  const months = years * 12
  const monthlyRate = rate / 12 / 100
  const annualRate = rate / 100

  const sipMaturity = useMemo(
    () => Math.round(monthly * (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate))),
    [monthly, monthlyRate, months]
  )

  const lumpsumMaturity = useMemo(
    () => Math.round(principal * Math.pow(1 + annualRate, years)),
    [principal, annualRate, years]
  )

  const currentValue = mode === 'sip' ? sipMaturity : lumpsumMaturity
  const invested = mode === 'sip' ? monthly * months : principal

  const chartPoints = Array.from({ length: years + 1 }, (_, i) => {
    const value =
      mode === 'sip'
        ? i === 0
          ? 0
          : monthly * (((Math.pow(1 + monthlyRate, i * 12) - 1) / monthlyRate) * (1 + monthlyRate))
        : principal * Math.pow(1 + annualRate, i)

    const x = 20 + i * (240 / years)
    const y = 140 - (value / Math.max(currentValue, 1)) * 110
    return { x, y: Math.max(20, y) }
  })

  const path = chartPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="mb-6 flex gap-3">
        <button
          onClick={() => setMode('sip')}
          className={`rounded-2xl px-5 py-2 font-semibold shadow-md ${mode === 'sip' ? 'bg-green-600 text-white' : 'bg-white/90 text-green-700'}`}
        >
          SIP Calculator
        </button>
        <button
          onClick={() => setMode('lumpsum')}
          className={`rounded-2xl px-5 py-2 font-semibold shadow-md ${mode === 'lumpsum' ? 'bg-green-600 text-white' : 'bg-white/90 text-green-700'}`}
        >
          Lumpsum Calculator
        </button>
      </div>

      <div className="grid gap-10 md:grid-cols-2">
        <div className="rounded-[2rem] bg-white/90 p-8 shadow-xl">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-green-600">
            {mode === 'sip' ? 'SIP Calculator' : 'Lumpsum Calculator'}
          </p>
          <h2 className="mb-6 text-4xl font-bold">Plan Your Investments</h2>

          <div className="space-y-6">
            {mode === 'sip' ? (
              <div>
                <label className="mb-2 block font-semibold">Monthly Investment</label>
                <input type="number" min="500" max="100000" step="100" value={monthly} onChange={(e) => setMonthly(Number(e.target.value))} className="w-full rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-lg font-semibold text-green-700 shadow-sm outline-none focus:ring-2 focus:ring-green-400" />
                <p className="mt-2 text-lg font-bold">{monthly ? `₹${monthly.toLocaleString()}` : ''}</p>
              </div>
            ) : (
              <div>
                <label className="mb-2 block font-semibold">Initial Investment</label>
                <input type="number" min="10000" max="5000000" step="1000" value={principal} onChange={(e) => setPrincipal(Number(e.target.value))} className="w-full rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-lg font-semibold text-green-700 shadow-sm outline-none focus:ring-2 focus:ring-green-400" />
                <p className="mt-2 text-lg font-bold">{principal ? `₹${principal.toLocaleString()}` : ''}</p>
              </div>
            )}

            <div>
              <label className="mb-2 block font-semibold">Expected Annual Return</label>
              <input type="number" min="1" max="30" value={rate} onChange={(e) => setRate(Number(e.target.value))} className="w-full rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-lg font-semibold text-green-700 shadow-sm outline-none focus:ring-2 focus:ring-green-400" />
              <p className="mt-2 text-lg font-bold">{rate ? `${rate}%` : ''}</p>
            </div>

            <div>
              <label className="mb-2 block font-semibold">Time Period</label>
              <input type="number" min="1" max="30" value={years} onChange={(e) => setYears(Number(e.target.value))} className="w-full rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-lg font-semibold text-green-700 shadow-sm outline-none focus:ring-2 focus:ring-green-400" />
              <p className="mt-2 text-lg font-bold">{years ? `${years} Years` : ''}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] bg-gradient-to-br from-green-50 to-white p-8 shadow-xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">Projected Value</p>
          <h3 className="mt-4 text-5xl font-bold text-green-600">{currentValue > 0 ? `₹${currentValue.toLocaleString()}` : ''}</h3>
          <div className="mt-6 rounded-3xl bg-white p-4 shadow-sm">
            <svg viewBox="0 0 280 160" className="h-44 w-full">
              <line x1="20" y1="140" x2="260" y2="140" stroke="#d1d5db" strokeWidth="1" />
              <line x1="20" y1="20" x2="20" y2="140" stroke="#d1d5db" strokeWidth="1" />
              <path d={path} fill="none" stroke="currentColor" strokeWidth="4" className="text-green-600" />
            </svg>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-white p-5 shadow-sm"><p className="text-sm text-gray-500">Invested</p><p className="text-2xl font-bold">{invested > 0 ? `₹${invested.toLocaleString()}` : ''}</p></div>
            <div className="rounded-2xl bg-white p-5 shadow-sm"><p className="text-sm text-gray-500">Returns</p><p className="text-2xl font-bold">{currentValue - invested > 0 ? `₹${(currentValue - invested).toLocaleString()}` : ''}</p></div>
          </div>
        </div>
      </div>
    </section>
  )
}

function InfoSections() {
  return (
    <section id="why-us" className="mx-auto max-w-7xl px-6 py-16 space-y-10">
      <div className="rounded-[2.5rem] bg-white/90 p-10 shadow-xl md:p-14">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-green-600">Why Us</p>
        <div className="mt-3 h-1.5 w-32 rounded-full bg-gradient-to-r from-green-500 to-cyan-400" />
        <h2 className="mt-6 text-4xl font-bold leading-tight md:text-6xl">Clarity, confidence, and compounding — all in one place.</h2>
        <p className="mt-5 max-w-5xl text-xl leading-9 text-gray-700">We combine disciplined mutual fund research, goal-based portfolio construction, and premium advisory support to help investors build long-term wealth with confidence.</p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl bg-emerald-100 p-8"><p className="text-lg font-bold">Research Driven</p><p className="mt-3 text-gray-700">Every recommendation is backed by market data, risk alignment, and long-term return strategy.</p></div>
          <div id="about-us" className="rounded-3xl bg-cyan-100 p-8"><p className="text-lg font-bold">Built on Trust</p><p className="mt-3 text-gray-700">Founded in 2024 with ₹500Cr+ guided portfolios and strong client retention.</p></div>
          <div className="rounded-3xl bg-lime-100 p-8"><p className="text-lg font-bold">Investor First</p><p className="mt-3 text-gray-700">Tailored advisory, transparent communication, and smooth onboarding from day one.</p></div>
        </div>
      </div>

      <div className="rounded-[2.5rem] bg-white/90 p-10 shadow-xl md:p-14">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-green-600">About Us</p>
        <div className="mt-3 h-1.5 w-32 rounded-full bg-gradient-to-r from-cyan-400 to-green-500" />
        <h2 className="mt-6 text-4xl font-bold leading-tight md:text-6xl">A modern wealth partner for India’s next generation of investors.</h2>
        <p className="mt-5 max-w-5xl text-xl leading-9 text-gray-700">At VittaVault, we believe investing should feel empowering, not overwhelming. Our platform is designed to make wealth creation elegant, understandable, and deeply aligned with your goals.</p>
      </div>

      <div className="rounded-[2rem] bg-white/90 p-10 shadow-lg">
        <p className="text-sm font-semibold uppercase tracking-wider text-green-600">Why Invest In Mutual Funds</p>
        <h2 className="mt-2 text-4xl font-bold">Built for long-term wealth creation</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-4">
          <div className="rounded-2xl bg-emerald-100 p-6"><p className="font-bold">Diversification</p><p className="mt-2 text-sm text-gray-600">Spread risk across sectors and assets.</p></div>
          <div className="rounded-2xl bg-emerald-100 p-6"><p className="font-bold">Compounding</p><p className="mt-2 text-sm text-gray-600">Let returns grow on returns over time.</p></div>
          <div className="rounded-2xl bg-emerald-100 p-6"><p className="font-bold">Liquidity</p><p className="mt-2 text-sm text-gray-600">Easy access to your capital when needed.</p></div>
          <div className="rounded-2xl bg-emerald-100 p-6"><p className="font-bold">Professional Management</p><p className="mt-2 text-sm text-gray-600">Expert allocation and ongoing monitoring.</p></div>
        </div>
      </div>
    </section>
  )
}

function HomePage() {
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <PageWrapper>
      <div className="relative overflow-hidden">
        <FlairDots />
        <nav className="fixed top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3"><img src="/vittavault-logo.png" alt="VittaVault logo" className="h-14 w-auto object-contain" /></div>
            <div className="flex items-center gap-3 text-sm">
              <button onClick={() => scrollTo('why-us')} className="rounded-2xl border border-white/40 bg-white/30 px-4 py-2 font-semibold text-green-800 shadow-xl backdrop-blur-md ring-1 ring-white/30 transition duration-300 hover:bg-white/40 hover:shadow-2xl hover:-translate-y-0.5">Why Us</button>
              <button onClick={() => scrollTo('about-us')} className="rounded-2xl border border-white/40 bg-white/30 px-4 py-2 font-semibold text-green-800 shadow-xl backdrop-blur-md ring-1 ring-white/30 transition duration-300 hover:bg-white/40 hover:shadow-2xl hover:-translate-y-0.5">About Us</button>
              <button onClick={() => scrollTo('contact-us')} className="rounded-2xl border border-green-500/40 bg-green-600 px-5 py-2 font-bold text-white shadow-2xl ring-1 ring-green-300/50 transition duration-300 hover:bg-green-500 hover:scale-105">Contact</button>
            </div>
          </div>
        </nav>

        <section className="relative mx-auto max-w-6xl overflow-hidden px-6 pb-24 pt-40">
  <div className="absolute inset-0 -z-10 bg-gradient-to-r from-emerald-200/30 via-lime-100/20 to-cyan-200/30 blur-3xl" />

  <div className="text-center">
    <p className="mb-4 inline-block rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
      Trusted by 1000+ investors
    </p>

    <h1 className="bg-gradient-to-r from-green-700 via-emerald-600 to-cyan-600 bg-clip-text text-6xl font-bold leading-tight text-transparent md:text-7xl">
      Invest smarter.
      <br />
      Build wealth with confidence.
    </h1>

    <p className="mx-auto mt-6 max-w-3xl text-lg text-gray-600">
      Premium mutual fund advisory and seamless client onboarding.
    </p>

    <button
      onClick={() =>
        document.getElementById('contact-us')?.scrollIntoView({
          behavior: 'smooth',
        })
      }
      className="mt-8 rounded-2xl bg-green-600 px-8 py-4 font-bold text-white shadow-2xl transition hover:scale-105"
    >
      Start Investing →
    </button>
  </div>
</section>

        <InfoSections />
        <section className="mx-auto max-w-6xl px-6 py-8"><div className="grid gap-6 md:grid-cols-3"><div className="rounded-3xl bg-white/90 p-8 shadow-lg"><p className="text-sm font-semibold uppercase tracking-wider text-green-600">Testimonials</p><p className="mt-4 text-lg font-semibold">“Seamless onboarding and incredibly clear guidance.”</p><p className="mt-3 text-sm text-gray-500">— Investor, Bengaluru</p></div><div className="rounded-3xl bg-white/90 p-8 shadow-lg"><p className="text-sm font-semibold uppercase tracking-wider text-green-600">Testimonials</p><p className="mt-4 text-lg font-semibold">“The SIP planning tools made decisions much easier.”</p><p className="mt-3 text-sm text-gray-500">— HNI Client, Hyderabad</p></div><div className="rounded-3xl bg-white/90 p-8 shadow-lg"><p className="text-sm font-semibold uppercase tracking-wider text-green-600">Testimonials</p><p className="mt-4 text-lg font-semibold">“Premium support with transparent portfolio advice.”</p><p className="mt-3 text-sm text-gray-500">— Investor, Mumbai</p></div></div></section><section className="mx-auto max-w-6xl px-6 py-8"><div className="rounded-[2rem] bg-white/90 p-8 shadow-xl"><p className="text-sm font-semibold uppercase tracking-wider text-green-600">Frequently Asked Questions</p><div className="mt-6 space-y-4"><div className="rounded-2xl bg-emerald-50 p-5"><p className="font-bold">What is SIP?</p><p className="mt-2 text-gray-600">A Systematic Investment Plan lets you invest a fixed amount periodically.</p></div><div className="rounded-2xl bg-emerald-50 p-5"><p className="font-bold">Minimum investment amount?</p><p className="mt-2 text-gray-600">Many funds start from ₹500 SIPs.</p></div><div className="rounded-2xl bg-emerald-50 p-5"><p className="font-bold">How soon will support contact me?</p><p className="mt-2 text-gray-600">Usually shortly after form submission during working hours.</p></div></div></div></section><button onClick={() => document.getElementById('contact-us')?.scrollIntoView({ behavior: 'smooth' })} className="fixed bottom-6 left-6 z-[60] rounded-full border border-green-500/40 bg-green-600 px-5 py-3 font-bold text-white shadow-2xl ring-1 ring-green-300/50 transition duration-300 hover:bg-green-500"><img src="/vittavault-logo.png" alt="arrow logo" className="inline h-4 w-4 object-contain mr-2" /> Start Investing →</button><SIPCalculator />
        <section id="contact-us" className="mx-auto max-w-6xl px-6 py-20"><ContactForm /></section>

        <footer className="mt-10 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
          <div className="mx-auto max-w-6xl px-6 py-12">
            <div className="grid gap-8 md:grid-cols-4">
              <div><h4 className="mb-3 text-xl font-bold">VittaVault</h4><p className="text-sm text-gray-300">Premium mutual fund advisory and investor-first onboarding.</p></div>
              <div><h4 className="mb-3 font-semibold">Quick Links</h4><div className="space-y-1 text-sm text-gray-300"><p>Home</p><p>Calculator</p><p>About Us</p></div></div>
              <div><h4 className="mb-3 font-semibold">Services</h4><div className="space-y-1 text-sm text-gray-300"><p>SIP Planning</p><p>Portfolio Review</p><p>Tax Saving</p></div></div>
              <div><h4 className="mb-3 font-semibold">Legal</h4><div className="space-y-1 text-sm text-gray-300"><p>Disclaimer</p><p>Privacy Policy</p><p>Terms</p></div></div>
            </div>
            <div className="mt-8 rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-gray-200">Mutual fund investments are subject to market risks. Please read all scheme-related documents carefully before investing.</div>
          </div>
        </footer>
      </div>
    </PageWrapper>
  )
}

function FloatingChatbot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([{ role: 'bot', text: 'Hi! Need help with SIPs, lumpsum, or onboarding?' }])
  const [input, setInput] = useState('')

  const handleSend = () => {
  if (!input.trim()) return

  const userText = input.trim()
  const q = userText.toLowerCase()

  let reply = 'Happy to help.'
  let shouldRedirect = false

  if (
    q.includes('invest') ||
    q.includes('start') ||
    q.includes('portfolio') ||
    q.includes('advisor') ||
    q.includes('recommend')
  ) {
    reply =
      'For personalized investment guidance, please get in touch with our team below.'
    shouldRedirect = true
  } else if (q.includes('sip')) {
    reply =
      'A SIP lets you invest a fixed amount regularly and benefit from compounding over time.'
  } else if (q.includes('lumpsum')) {
    reply =
      'A lumpsum is a one-time investment amount that compounds over your selected time period.'
  } else if (q.includes('return') || q.includes('profit')) {
    reply =
      'Returns vary based on market conditions, risk appetite, and investment horizon.'
  } else if (q.includes('mutual fund')) {
    reply =
      'Mutual funds pool money from multiple investors and are professionally managed.'
  } else if (q.includes('minimum')) {
    reply = 'Most SIPs can begin from ₹500 depending on the selected fund.'
  } else if (q.includes('tax')) {
    reply =
      'Certain funds like ELSS may provide tax-saving benefits under Indian tax laws.'
  } else if (q.includes('risk') || q.includes('safe')) {
    reply =
      'All investments carry market risk, but diversification helps reduce exposure.'
  }

  setMessages((prev) => [
    ...prev,
    { role: 'user', text: userText },
    { role: 'bot', text: reply },
  ])

  setInput('')

  if (shouldRedirect) {
    setTimeout(() => {
      setOpen(false)
      document
        .getElementById('contact-us')
        ?.scrollIntoView({ behavior: 'smooth' })
    }, 1000)
  }
}

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-[60] rounded-full border border-green-500/40 bg-green-600 px-5 py-4 font-bold text-white shadow-2xl ring-1 ring-green-300/50 transition duration-300 hover:bg-green-500"
      >
        Chat
      </button>
      {open && (
        <div className="fixed bottom-24 right-6 z-[60] w-80 rounded-3xl bg-white p-4 shadow-2xl border border-green-100">
          <div className="mb-3 text-lg font-bold text-green-700">VittaVault Assistant</div>
          <div className="mb-3 h-64 overflow-y-auto rounded-2xl bg-emerald-50 p-3 space-y-2">
            {messages.map((m, i) => (
              <div key={i} className={`rounded-2xl px-3 py-2 text-sm ${m.role === 'bot' ? 'bg-white text-gray-700' : 'bg-green-600 text-white ml-8'}`}>
                {m.text}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about SIP, returns..."
              className="flex-1 rounded-2xl border p-2 text-sm"
            />
            <button onClick={handleSend} className="rounded-2xl border border-white/30 bg-white/25 px-3 py-2 text-sm font-semibold text-green-900 shadow-lg backdrop-blur-md">Send</button>
          </div>
        </div>
      )}
    </>
  )
}

export default function VittaVaultHome() {
  useEffect(() => {
    document.title = 'VittaVault | Invest Smarter'
  }, [])

  return <><HomePage /><FloatingChatbot /></>
}
