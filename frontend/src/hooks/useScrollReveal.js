import { useEffect, useRef, useState } from 'react';

// Returns a ref to attach to any element + a boolean that flips to true
// the first time that element crosses into the viewport. Used to drive
// fade/translate-in animations as the user scrolls down the page.
export default function useScrollReveal(threshold = 0.2) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.unobserve(el);
        }
      },
      { threshold }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return [ref, visible];
}
