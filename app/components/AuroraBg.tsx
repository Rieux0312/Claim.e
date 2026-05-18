"use client";
import { useEffect } from "react";

const PARTICLES = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  left: (i * 7.3 + 3) % 100,
  top: (i * 11.7 + 5) % 100,
  size: 2 + (i % 3),
  delay: (i * 0.6) % 8,
  dur: 10 + (i % 5) * 2.8,
  dx: -30 + (i * 4.7) % 60,
  dy: -30 + (i * 3.1) % 60,
}));

const STREAMS = Array.from({ length: 6 }, (_, i) => ({
  id: i,
  left: 6 + i * 16 + (i * 2.3) % 6,
  delay: (i * 0.8) % 6,
  dur: 4 + (i % 3) * 1.5,
}));

export default function AuroraBg() {
  useEffect(() => {
    document.body.classList.add("has-aurora", "grain");
    return () => document.body.classList.remove("has-aurora", "grain");
  }, []);

  return (
    <div className="aurora" aria-hidden="true">
      <span className="aurora-blob ab-1" />
      <span className="aurora-blob ab-2" />
      <span className="aurora-blob ab-3" />
      <span className="aurora-blob ab-4" />
      <span className="aurora-scan" />
      {STREAMS.map((s) => (
        <span
          key={s.id}
          className="aurora-stream"
          style={{ left: `${s.left}%`, animationDelay: `${s.delay}s`, animationDuration: `${s.dur}s` }}
        />
      ))}
      {PARTICLES.map((p) => (
        <span
          key={p.id}
          className="aurora-particle"
          style={{
            left: `${p.left}%`, top: `${p.top}%`,
            width: `${p.size}px`, height: `${p.size}px`,
            animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s`,
            ["--dx" as string]: `${p.dx}vw`, ["--dy" as string]: `${p.dy}vh`,
          }}
        />
      ))}
    </div>
  );
}
