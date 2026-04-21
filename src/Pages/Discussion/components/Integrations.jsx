import React, { useState, useEffect ,useRef} from 'react';
import { Bot, Box } from 'lucide-react';

import './Integrations.scss';

// ─── Brand icons as inline SVG paths ───────────────────────────────────────
const BrandIcons = {
  Gmail: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
      <path d="M20 4H4C2.9 4 2 4.9 2 6v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z" fill="#f0f4ff"/>
      <path d="M20 4H4L12 13l8-9z" fill="#EA4335"/>
      <path d="M4 4L2 6v12l6-6L4 4z" fill="#34A853"/>
      <path d="M20 4l2 2v12l-6-6 4-8z" fill="#FBBC05"/>
      <path d="M8 12l-6 6h20l-6-6-4 4-4-4z" fill="#4285F4"/>
    </svg>
  ),
  Outlook: (
    <svg viewBox="0 0 24 24" width="22" height="22">
      <rect x="2" y="3" width="13" height="18" rx="2" fill="#0078d4"/>
      <rect x="9" y="7" width="13" height="13" rx="2" fill="#28a8e8"/>
      <rect x="9" y="7" width="13" height="7" rx="2" fill="#0078d4"/>
      <path d="M9 14h13v6H9z" fill="#005a9e"/>
      <circle cx="8" cy="12" r="4" fill="white"/>
      <circle cx="8" cy="12" r="2.5" fill="#0078d4"/>
    </svg>
  ),
  Slack: (
    <svg viewBox="0 0 24 24" width="22" height="22">
      <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z" fill="#E01E5A"/>
      <path d="M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z" fill="#36C5F0"/>
      <path d="M18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zm-1.27 0a2.528 2.528 0 0 1-2.522 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.164 0a2.528 2.528 0 0 1 2.522 2.522v6.312z" fill="#2EB67D"/>
      <path d="M15.164 18.956a2.528 2.528 0 0 1 2.522 2.522A2.528 2.528 0 0 1 15.164 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zm0-1.27a2.527 2.527 0 0 1-2.52-2.521 2.526 2.526 0 0 1 2.52-2.521h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.523 2.521h-6.313z" fill="#ECB22E"/>
    </svg>
  ),
  Zoom: (
    <svg viewBox="0 0 24 24" width="22" height="22">
      <rect width="24" height="24" rx="5" fill="#2D8CFF"/>
      <path d="M4 8.5h9.5c1.1 0 2 .9 2 2v4.5H6c-1.1 0-2-.9-2-2V8.5z" fill="white"/>
      <path d="M16.5 10l3.5-2.5v9L16.5 14v-4z" fill="white"/>
    </svg>
  ),
  Ionos: (
    <svg viewBox="0 0 24 24" width="22" height="22">
      <rect width="24" height="24" rx="4" fill="#003d8f"/>
      <text x="4" y="17" fontFamily="Arial Black" fontWeight="900" fontSize="11" fill="white">IO</text>
    </svg>
  ),
};

const defaultApps = [
  { name: 'Gmail',   color: '#EA4335', bg: '#FEF2F2', label: 'Email Sync' },
  { name: 'Outlook', color: '#0078d4', bg: '#EFF6FF', label: 'Calendar & Mail' },
  { name: 'Ionos',   color: '#003d8f', bg: '#EEF2FF', label: 'Web Hosting' },
  { name: 'Slack',   color: '#4A154B', bg: '#FDF4FF', label: 'Team Messaging' },
  { name: 'Zoom',    color: '#2D8CFF', bg: '#EFF6FF', label: 'Video Calls' },
];

// Animated particle dot
function Particle({ x1, y1, x2, y2, delay, duration }) {
  const [pos, setPos] = useState(0);
  useEffect(() => {
    let start = null;
    let raf;
    const tick = (ts) => {
      if (!start) start = ts - delay * 1000;
      const elapsed = (ts - start) / 1000;
      setPos((elapsed % duration) / duration);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [delay, duration]);

  const cx = x1 + (x2 - x1) * pos;
  const cy = y1 + (y2 - y1) * pos;
  return <circle cx={cx} cy={cy} r="3" fill="#6366f1" opacity={0.7 - pos * 0.5} />;
}

export default function Integrations({ data }) {
  const canvasRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(null);
  const sectionRef = useRef(null);

  // Prepare dynamic apps list
  const integrationsInput = (data?.integrations_list?.filter(item => item && item.trim().length > 0)) || [];
  
  const apps = integrationsInput.length > 0
    ? integrationsInput.map((name, index) => {
        // Case-insensitive match for existing brand config
        const defaults = defaultApps.find(a => a.name.toLowerCase() === name.toLowerCase());
        if (defaults) return defaults;

        // Fallback for custom text
        const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'];
        const color = colors[index % colors.length];
        return {
          name: name,
          color: color,
          bg: `${color}10`, // 10% opacity
        //   label: 'Integration', // Generic label
        };
    })
    : defaultApps;

  // Intersection observer for entrance animation
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.2 }
    );
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const SIZE = 560;
  const CX = SIZE / 2;
  const CY = SIZE / 2;
  const RADIUS = 210;
  const total = apps.length;

  const getPos = (i) => {
    const angle = (i * (360 / total) - 90) * (Math.PI / 180);
    return {
      x: CX + RADIUS * Math.cos(angle),
      y: CY + RADIUS * Math.sin(angle),
    };
  };

  return (
    <section
      ref={sectionRef}
      style={{
        padding: '80px 0 100px',
        background: 'linear-gradient(160deg, #fafafa 0%, #f4f6ff 50%, #fafafa 100%)',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
      }}
      className="integration-section-landing"
    >
      {/* Background grid texture */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: `radial-gradient(circle, #c7d2fe 1px, transparent 1px)`,
        backgroundSize: '32px 32px',
        opacity: 0.35,
      }} />
      {/* Soft glow blob */}
      <div style={{
        position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)',
        width: '700px', height: '700px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 2 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: isMobile ? '40px' : '64px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'white', border: '1px solid #e0e4ff',
            borderRadius: '100px', padding: '6px 16px',
            fontSize: '12px', fontWeight: '600', color: '#6366f1',
            letterSpacing: '0.08em', textTransform: 'uppercase',
            marginBottom: '20px',
            boxShadow: '0 2px 8px rgba(99,102,241,0.12)',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(12px)',
            transition: 'opacity 0.6s ease, transform 0.6s ease',
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#6366f1', display: 'inline-block' }} />
            {data?.integrations_badge || 'Seamless Integrations'}
          </div>

          <h2 style={{
            fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: '800', lineHeight: '1.1',
            color: '#0f0f1a', margin: '0 0 16px',
            letterSpacing: '-0.03em',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(16px)',
            transition: 'opacity 0.6s 0.1s ease, transform 0.6s 0.1s ease',
          }}>
            {data?.integrations_title || (
              <>
                Connect everything<br />
                <span style={{ color: '#6366f1' }}>you already use</span>
              </>
            )}
          </h2>

          <p style={{
            fontSize: '17px', color: '#64748b', maxWidth: '480px',
            margin: '0 auto', lineHeight: '1.65', fontWeight: '400',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(16px)',
            transition: 'opacity 0.6s 0.2s ease, transform 0.6s 0.2s ease',
          }}>
            {data?.integrations_subtitle || 'Your AI assistant works natively with your existing tools — no setup, no friction.'}
          </p>
        </div>

        {/* --- DESKTOP CIRCULAR HUB --- */}
        {!isMobile ? (
          <div style={{
            display: 'flex', justifyContent: 'center',
            opacity: visible ? 1 : 0,
            transform: visible ? 'scale(1)' : 'scale(0.92)',
            transition: 'opacity 0.8s 0.3s ease, transform 0.8s 0.3s ease',
          }}>
            <div style={{ position: 'relative', width: `${SIZE}px`, height: `${SIZE}px` }}>
              {/* SVG layer: lines + particles */}
              <svg viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}>
                <defs>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                  </filter>
                </defs>
                {apps.map((app, i) => {
                  const { x, y } = getPos(i);
                  return (
                    <g key={i}>
                      <line x1={CX} y1={CY} x2={x} y2={y} stroke="#e0e4ff" strokeWidth={hovered === i ? 2 : 1} strokeDasharray="4 4" />
                      {hovered === i && (
                        <line x1={CX} y1={CY} x2={x} y2={y} stroke="#6366f1" strokeWidth="1.5" strokeOpacity="0.6" filter="url(#glow)" strokeDasharray="4 4" />
                      )}
                      <Particle x1={CX} y1={CY} x2={x} y2={y} delay={i * 0.8} duration={2.5} />
                    </g>
                  );
                })}
                <circle cx={CX} cy={CY} r={RADIUS + 48} fill="none" stroke="#e0e4ff" strokeWidth="1" strokeDasharray="6 6" opacity="0.6" />
              </svg>

              {/* Central hub */}
              <div style={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10,
              }}>
                <div style={{
                  position: 'absolute', inset: '-24px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', animation: 'pulse 3s ease-in-out infinite',
                }} />
                <div style={{
                  width: '96px', height: '96px', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 0 0 1px rgba(99,102,241,0.15), 0 20px 50px -10px rgba(99,102,241,0.3)', position: 'relative',
                }}>
                  <div style={{
                    width: '68px', height: '68px', background: 'linear-gradient(135deg, #4f46e5 0%, #818cf8 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(99,102,241,0.45)',
                  }}>
                    <Bot color="white" size={32} />
                  </div>
                </div>
              </div>

              {/* Satellite nodes */}
              {apps.map((app, i) => {
                const { x, y } = getPos(i);
                const isHov = hovered === i;
                return (
                  <div
                    key={i}
                    onMouseEnter={() => setHovered(i)}
                    onMouseLeave={() => setHovered(null)}
                    style={{
                      position: 'absolute', left: `${x}px`, top: `${y}px`, transform: 'translate(-50%, -50%)', zIndex: isHov ? 20 : 5,
                      transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1)', cursor: 'pointer',
                    }}
                  >
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 18px 10px 12px', background: isHov ? 'white' : 'rgba(255,255,255,0.92)',
                      borderRadius: '16px', border: `1px solid ${isHov ? app.color + '55' : '#e8ecf5'}`,
                      boxShadow: isHov ? `0 12px 32px -4px ${app.color}30, 0 4px 12px rgba(0,0,0,0.06)` : '0 4px 16px -2px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04)',
                      backdropFilter: 'blur(12px)', transition: 'all 0.25s ease', whiteSpace: 'nowrap', transform: isHov ? 'scale(1.06)' : 'scale(1)',
                    }}>
                      <div style={{
                        width: '38px', height: '38px', background: isHov ? app.bg : '#f8faff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, border: `1px solid ${isHov ? app.color + '30' : '#eef1f8'}`, transition: 'all 0.25s ease',
                      }}>
                        {BrandIcons[app.name] || <Box size={22} color={app.color} />}
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f0f1a', lineHeight: '1.2', letterSpacing: '-0.01em' }}>{app.name}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* --- MOBILE VERTICAL LIST --- */
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
            marginTop: '20px',
            opacity: visible ? 1 : 0, translateY: visible ? 0 : 20, transition: 'all 0.6s 0.3s ease'
          }}>
            {/* Central Mobile Hub */}
            <div style={{
              width: '80px', height: '80px', background: 'white', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 10px 30px -5px rgba(99, 102, 241, 0.4)',
              border: '1px solid #eef2ff',
              marginBottom: '32px', position: 'relative'
            }}>
              <div style={{
                position: 'absolute', inset: '-12px', borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
                animation: 'pulse 3s ease-in-out infinite',
              }} />
              <div style={{
                width: '56px', height: '56px', background: 'linear-gradient(135deg, #4f46e5 0%, #818cf8 100%)',
                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Bot color="white" size={28} />
              </div>
              <div style={{
                position: 'absolute', height: '40px', width: '2px', background: '#e0e4ff',
                bottom: '-40px', left: '50%', transform: 'translateX(-50%)',
                borderLeft: '2px dashed #cbd5e1'
              }}></div>
            </div>

            {/* List items */}
            {apps.map((app, i) => (
              <React.Fragment key={i}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '16px',
                  width: '100%', maxWidth: '340px',
                  padding: '12px 16px',
                  background: 'white',
                  borderRadius: '16px',
                  border: '1px solid #e8ecf5',
                  boxShadow: '0 4px 12px -2px rgba(0,0,0,0.05)',
                  position: 'relative', zIndex: 5
                }}>
                  <div style={{
                    width: '40px', height: '40px',
                    background: app.bg,
                    borderRadius: '10px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                    border: `1px solid ${app.color}20`
                  }}>
                    {BrandIcons[app.name] || <Box size={20} color={app.color} />}
                  </div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b' }}>{app.name}</div>
                    {/* <div style={{ fontSize: '12px', color: '#64748b' }}>Integration</div> */}
                  </div>
                </div>
                {i < apps.length - 1 && (
                  <div style={{ width: '2px', height: '16px', borderLeft: '2px dashed #cbd5e1' }}></div>
                )}
              </React.Fragment>
            ))}
          </div>
        )}


        {/* CTA */}
        {/* <div style={{
          textAlign: 'center', marginTop: '48px',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(12px)',
          transition: 'opacity 0.6s 0.6s ease, transform 0.6s 0.6s ease',
        }}>
          <button
            onClick={() => {
              const el = document.getElementById('pricing');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '14px 32px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
              color: 'white', border: 'none', borderRadius: '14px',
              fontSize: '15px', fontWeight: '700', cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(99,102,241,0.35)',
              letterSpacing: '-0.01em',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 12px 32px rgba(99,102,241,0.45)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(99,102,241,0.35)';
            }}
          >
            {data?.hero_cta_primary || 'Start for free'}
            <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          <div style={{ marginTop: '14px' }}>
            <a
              href={data?.hero_cta_secondary_link || '#'}
              style={{
                color: '#94a3b8', textDecoration: 'none',
                fontSize: '14px', fontWeight: '500',
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#6366f1'}
              onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
              target="_blank" rel="noreferrer"
            >
              {data?.hero_cta_secondary || 'Watch a 2-min demo →'}
            </a>
          </div>
        </div> */}
      </div>

      {/* Keyframe injection */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.08); opacity: 1; }
        }
      `}</style>
    </section>
  );
}