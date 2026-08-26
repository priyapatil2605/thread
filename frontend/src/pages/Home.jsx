import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import GarmentStage from '../components/GarmentStage';
import Curtain from '../components/Curtain';
import Marquee from '../components/Marquee';
import Reveal from '../components/Reveal';
import './Home.css';

const TITLE_LINE_1 = 'Wear it';
const TITLE_LINE_2 = 'before you own it.';

function SplitWords({ text, baseDelay = 0, italicLast = false }) {
  const words = text.split(' ');
  return words.map((w, i) => (
    <span
      key={i}
      className="word"
      style={{
        animationDelay: `${baseDelay + i * 0.09}s`,
        fontStyle: italicLast && i === 0 ? 'italic' : 'normal',
        fontWeight: italicLast && i === 0 ? 300 : 'inherit',
        color: italicLast && i === 0 ? 'var(--thread)' : 'inherit',
        marginRight: '0.28em',
      }}
    >
      {w}
    </span>
  ));
}

const STEPS = [
  {
    n: '01',
    label: 'CATALOGUE // SCAN',
    title: 'Wear the rack, one item at a time.',
    body: 'Move through the catalogue rendered on your own build before anything hits the bag. No guessing how it drapes.',
  },
  {
    n: '02',
    label: 'AI // STYLIST',
    title: 'Full outfits, built around your build.',
    body: 'Skin tone, undertone, and height-to-frame ratio feed a transparent scoring engine that assembles complete, occasion-matched outfit sets.',
  },
  {
    n: '03',
    label: 'CLOSET // MEMORY',
    title: 'Everything you own, remembered.',
    body: 'Log what is already hanging in your wardrobe and THREAD pairs new pieces against it, so you shop for what you are missing, not what you already have.',
  },
];

function ProcessSection() {
  const stepRefs = useRef([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.dataset.step);
            setActive(idx);
          }
        });
      },
      { threshold: 0.5, rootMargin: '-20% 0px -20% 0px' }
    );
    stepRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section className="process">
      <div className="process-sticky">
        <div className="process-visual">
          {STEPS.map((s, i) => (
            <div key={i} className={`process-visual-number ${active === i ? 'active' : ''}`} style={{ opacity: active === i ? 1 : 0 }}>
              {s.n}
            </div>
          ))}
          <div className="process-visual-label mono">{STEPS[active].label}</div>
        </div>
      </div>
      <div className="process-steps">
        {STEPS.map((s, i) => (
          <div
            key={i}
            ref={(el) => (stepRefs.current[i] = el)}
            data-step={i}
            className={`process-step ${active === i ? 'active' : ''}`}
          >
            <div className="mono">{s.n} / {s.label.split(' // ')[1]}</div>
            <h3>{s.title}</h3>
            <p>{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <Curtain />

      <section className="hero container">
        <div className="hero-bg-glow" />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.1fr 1fr',
            alignItems: 'center',
            gap: 24,
          }}
          className="hero-grid"
        >
          <div>
            <div className="mono hero-eyebrow">— AI FITTING ROOM, LIVE SCAN</div>
            <h1 className="hero-title">
              <div><SplitWords text={TITLE_LINE_1} baseDelay={2.0} /></div>
              <div><SplitWords text={TITLE_LINE_2} baseDelay={2.2} italicLast /></div>
            </h1>
            <p className="hero-sub">
              Upload your build, your undertone, the occasion. THREAD dresses your actual body in
              the actual garment — then remembers everything already hanging in your closet.
            </p>
            <div className="hero-ctas">
              <Link to="/catalog" className="btn primary">Start Your Fitting</Link>
              <Link to="/register" className="btn">Create an Account</Link>
            </div>
          </div>

          <GarmentStage />
        </div>

        <div className="scroll-cue">
          <span className="mono">SCROLL</span>
          <span className="chevron" />
        </div>
      </section>

      <Marquee text="TRY IT ON — STYLED BY AI — YOUR WARDROBE, REMEMBERED —" />

      <div className="container">
        <ProcessSection />

        <Reveal>
          <div className="page-head" style={{ marginTop: 140, border: 'none', paddingBottom: 0 }}>
            <div className="mono" style={{ color: 'var(--thread)', fontSize: 12 }}>WHY THREAD</div>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: 'clamp(28px, 3.5vw, 44px)', marginTop: 10 }}>
              Built for fit, not just for browsing.
            </h2>
          </div>
        </Reveal>

        <div className="grid-3" style={{ marginTop: 40, marginBottom: 140 }}>
          <Reveal delay={0}>
            <div className="card">
              <div className="mono" style={{ color: 'var(--thread)', fontSize: 12 }}>01 / TRY ON</div>
              <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 22, margin: '16px 0 10px' }}>
                Wear the rack, one item at a time.
              </h3>
              <p style={{ color: 'var(--bone-dim)', fontSize: 14, lineHeight: 1.6 }}>
                Move through the catalogue on your own rendered body before anything hits the bag.
              </p>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="card">
              <div className="mono" style={{ color: 'var(--thread)', fontSize: 12 }}>02 / STYLED BY AI</div>
              <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 22, margin: '16px 0 10px' }}>
                Full outfits, built around your build.
              </h3>
              <p style={{ color: 'var(--bone-dim)', fontSize: 14, lineHeight: 1.6 }}>
                Skin tone, height-to-frame ratio, and occasion shape complete outfit sets.
              </p>
            </div>
          </Reveal>
          <Reveal delay={240}>
            <div className="card">
              <div className="mono" style={{ color: 'var(--thread)', fontSize: 12 }}>03 / YOUR WARDROBE</div>
              <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 22, margin: '16px 0 10px' }}>
                Everything you own, remembered.
              </h3>
              <p style={{ color: 'var(--bone-dim)', fontSize: 14, lineHeight: 1.6 }}>
                THREAD pairs new pieces against what's already in your closet.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </>
  );
}
