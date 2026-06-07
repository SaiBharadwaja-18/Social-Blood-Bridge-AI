import { Heart, TrendingUp, Users, Zap, Leaf, Lightbulb, ChevronDown } from 'lucide-react';

export function AboutPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* Hero Section — full viewport */}
      <div className="flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#fff1f2' }}>
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-flex rounded-full px-5 py-2 text-sm font-semibold mb-6"
            style={{ backgroundColor: '#ffe4e6', color: '#be123c' }}>
            Our Story
          </span>
          <h1 className="text-5xl font-bold mb-8" style={{ color: '#111827' }}>About Us</h1>
          <p className="text-lg leading-relaxed mb-6 text-justify" style={{ color: '#4b5563' }}>
            Social Blood Bridge AI is dedicated to transforming blood coordination for patients with Thalassemia and other blood disorders who depend on regular transfusions. We recognize that Blood Warriors face unique challenges in securing reliable blood supplies.
          </p>
          <p className="text-lg leading-relaxed text-justify"  style={{ color: '#4b5563' }}>
            Our mission is to leverage artificial intelligence and community engagement to create a seamless, reliable blood coordination system that ensures no patient waits in fear. We empower donors with recognition and reliability scoring, while providing coordinators with intelligent tools to match the right donor to each request.
          </p>
        </div>

        {/* Animated scroll indicator */}
        <div className="mt-16 flex flex-col items-center gap-2">
          <span className="text-xs font-medium tracking-widest uppercase" style={{ color: '#fda4af' }}>Scroll</span>
          <div className="flex flex-col items-center" style={{ animation: 'bounce 2s infinite' }}>
            <ChevronDown className="h-6 w-6" style={{ color: '#e11d48' }} />
            <ChevronDown className="h-6 w-6 -mt-3 opacity-50" style={{ color: '#e11d48' }} />
          </div>
        </div>

        <style>{`
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(8px); }
          }
        `}</style>
      </div>

      {/* Values Section */}
      <div className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold" style={{ color: '#111827' }}>Our Values</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Heart,      title: 'Life-Saving Mission', desc: 'Every decision is driven by the goal to save lives' },
              { icon: Lightbulb,  title: 'AI-First',            desc: 'Intelligent algorithms power every coordination decision' },
              { icon: TrendingUp, title: 'Reliability',         desc: 'Donors are scored and matched based on proven track record' },
              { icon: Users,      title: 'Community',           desc: 'Strong partnerships with donors, hospitals, and coordinators' },
              { icon: Leaf,       title: 'Zero Waste',          desc: 'Minimize expired blood through smart prediction and matching' },
              { icon: Zap,        title: 'Innovation',          desc: 'Continuous improvement through feedback and data analysis' },
            ].map((value, idx) => (
              <div key={idx} className="rounded-2xl p-6 transition-transform duration-200 hover:-translate-y-1"
                style={{ backgroundColor: '#ffffff', border: '1px solid #ffe4e6' }}>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl"
                  style={{ backgroundColor: '#fff1f2' }}>
                  <value.icon className="h-6 w-6" style={{ color: '#e11d48' }} />
                </div>
                <h3 className="mt-4 font-semibold" style={{ color: '#111827' }}>{value.title}</h3>
                <p className="mt-2 text-sm" style={{ color: '#6b7280' }}>{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}