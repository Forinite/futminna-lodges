import { useEffect, useRef } from "react";

// Muted looping video, no controls, plays only while visible.
export default function AutoVideo({ src, className }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.play().catch(() => {});
        else el.pause();
      },
      { threshold: 0.5 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [src]);

  if (!src) return <div className={`video-empty ${className ?? ""}`}>No footage yet</div>;

  return (
    <video
      ref={ref}
      className={className}
      src={src}
      muted
      loop
      playsInline
      preload="metadata"
      disablePictureInPicture
    />
  );
}
