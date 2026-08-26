import { useEffect, useRef } from 'react';
import './GarmentStage.css';

export default function GarmentStage() {
  const wrapRef = useRef(null);
  const stageRef = useRef(null);
  const rot = useRef({ x: 6, y: -18 });
  const dragging = useRef(false);
  const autoSpin = useRef(true);
  const last = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const wrap = wrapRef.current;
    const stage = stageRef.current;

    function render() {
      wrap.style.transform = `rotateX(${rot.current.x}deg) rotateY(${rot.current.y}deg)`;
    }
    render();

    function onDown(e) {
      dragging.current = true;
      autoSpin.current = false;
      last.current = { x: e.clientX, y: e.clientY };
    }
    function onMove(e) {
      if (!dragging.current) return;
      const dx = e.clientX - last.current.x;
      const dy = e.clientY - last.current.y;
      rot.current.y += dx * 0.4;
      rot.current.x = Math.max(-20, Math.min(20, rot.current.x - dy * 0.2));
      last.current = { x: e.clientX, y: e.clientY };
      render();
    }
    function onUp() {
      dragging.current = false;
    }

    let raf;
    function loop() {
      if (autoSpin.current) {
        rot.current.y += 0.08;
        render();
      }
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);

    stage.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);

    return () => {
      cancelAnimationFrame(raf);
      stage.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, []);

  return (
    <div className="stage" ref={stageRef}>
      <div className="stage-floor" />
      <div className="stage-ring" />
      <div className="stage-ring r2" />
      <div className="stage-ring r3" />

      <div className="garment-wrap" ref={wrapRef}>
        <div className="cover" />
        <svg viewBox="0 0 300 420" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="jacketGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#C81E4A" />
              <stop offset="100%" stopColor="#7d1230" />
            </linearGradient>
          </defs>
          <path
            d="M150 20 L110 55 L60 75 L40 190 L65 200 L75 130 L80 400 L135 400 L138 210 L150 230 L162 210 L165 400 L220 400 L225 130 L235 200 L260 190 L240 75 L190 55 Z"
            fill="url(#jacketGrad)"
            stroke="#EDE7DA"
            strokeOpacity="0.15"
            strokeWidth="1.5"
          />
          <path d="M150 20 L110 55 L150 90 L190 55 Z" fill="#0B0B10" fillOpacity="0.25" />
          <line x1="150" y1="90" x2="150" y2="395" stroke="#EDE7DA" strokeOpacity="0.15" strokeWidth="1" />
        </svg>

        <div className="hud hud-1">
          SKIN&nbsp;TONE <span className="line">//</span> WARM&nbsp;OLIVE
        </div>
        <div className="hud hud-2">
          FIT&nbsp;RATIO <span className="line">//</span> 1:1.62
        </div>
        <div className="hud hud-3">
          OCCASION <span className="line">//</span> EVENING
        </div>
      </div>

      <div className="drag-hint">← drag to rotate →</div>
    </div>
  );
}
