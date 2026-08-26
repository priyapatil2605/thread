import './Marquee.css';

export default function Marquee({ text }) {
  // Duplicate the content so the CSS animation can loop seamlessly.
  const item = (
    <span className="marquee-item">
      {text}
      <span className="marquee-dot">●</span>
    </span>
  );

  return (
    <div className="marquee">
      <div className="marquee-track">
        {item}{item}{item}{item}
        {item}{item}{item}{item}
      </div>
    </div>
  );
}
