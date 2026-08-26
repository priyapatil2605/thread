import useScrollReveal from '../hooks/useScrollReveal';

// Wrap any block in <Reveal> to have it fade + rise into place the first
// time it scrolls into view. `delay` is in ms, `y` is the starting offset.
export default function Reveal({ children, delay = 0, y = 28, className = '', style = {} }) {
  const [ref, visible] = useScrollReveal(0.15);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : `translateY(${y}px)`,
        transition: `opacity 0.8s cubic-bezier(.16,.8,.24,1) ${delay}ms, transform 0.8s cubic-bezier(.16,.8,.24,1) ${delay}ms`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
