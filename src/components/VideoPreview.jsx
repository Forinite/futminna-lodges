import { useEffect, useRef, useState } from "react";

export default function VideoPreview({ src, className = "", poster }) {
  const videoRef = useRef(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.45 }
    );

    observer.observe(video);

    return () => observer.disconnect();
  }, [src]);

  if (!src || failed) {
    return (
      <div className={`video-placeholder ${className}`}>
        <span>Lodge footage unavailable</span>
      </div>
    );
  }

  return (
    <div className={`video-frame ${className}`}>
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        preload="metadata"
        onError={() => setFailed(true)}
        aria-label="Lodge video preview"
      />
      <div className="video-overlay">
        <span>Preview</span>
      </div>
    </div>
  );
}
