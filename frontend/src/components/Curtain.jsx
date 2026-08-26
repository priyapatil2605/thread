import { useEffect, useState } from 'react';
import './Curtain.css';

// Full-screen pair of doors that slide apart once on first load, like a
// product-reveal / car-launch site. Purely presentational — unmounts
// itself from view (pointer-events off) once the animation finishes.
export default function Curtain() {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setOpen(true), 250);
    const t2 = setTimeout(() => setDone(true), 1900);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (done) return null;

  return (
    <div className={`curtain ${open ? 'is-open' : ''}`} aria-hidden="true">
      <div className="curtain-panel left">
        <span className="curtain-mark">TH</span>
      </div>
      <div className="curtain-panel right">
        <span className="curtain-mark">EAD</span>
      </div>
      <div className="curtain-line" />
    </div>
  );
}
