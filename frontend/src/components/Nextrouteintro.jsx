import { useEffect, useRef, useState } from "react";
import "../styles/nextrouteintro.css";

// NextRoute Logo PNG
const LOGO = "/logo (1).png";
function Particles({ canvasRef }) {
  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext("2d");
    let W, H, pts = [], raf;
    function resize() {
      W = cvs.width  = cvs.offsetWidth  || 800;
      H = cvs.height = cvs.offsetHeight || 600;
    }
    resize();
    function mk() {
      return {
        x: Math.random() * W, y: H + 4,
        r: 0.5 + Math.random() * 1.4,
        vx: (Math.random() - 0.5) * 0.28,
        vy: -(0.22 + Math.random() * 0.48),
        alpha: 0.1 + Math.random() * 0.45,
        life: 120 + Math.random() * 140,
        age: 0, hue: 260 + Math.random() * 50,
      };
    }
    for (let i = 0; i < 85; i++) {
      const p = mk(); p.y = Math.random() * H; p.age = Math.random() * p.life; pts.push(p);
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      pts.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy; p.age++;
        const t = p.age / p.life;
        const fade = t < 0.15 ? t / 0.15 : t > 0.85 ? (1 - t) / 0.15 : 1;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue},80%,75%,${p.alpha * fade})`; ctx.fill();
        if (p.age >= p.life) pts[i] = mk();
      });
      raf = requestAnimationFrame(draw);
    }
    draw();
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return null;
}

export default function NextRouteIntro({ onDone }) {
  const canvasRef = useRef(null);
  const [phase, setPhase] = useState("intro"); // "intro" | "out"

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("out"), 4600);
    const t2 = setTimeout(() => { if (onDone) onDone(); }, 6000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <div className="nr-overlay">
      <div className={"nr-intro" + (phase === "out" ? " nr-out" : "")}>
        <canvas className="nr-ptc" ref={canvasRef} />
        <Particles canvasRef={canvasRef} />
        <div className="nr-bloom" />
        <div className="nr-scan" />

        <div className="nr-stage">
          <div className="nr-logo-wrap">
            <div className="nr-node nr-na">
              <svg viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2"/>
                <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
                <path d="M2 12a18 18 0 0 0 20 0"/>
              </svg>
            </div>
            <div className="nr-node nr-nb">
              <svg viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 21h18M3 10h18M5 6l7-3 7 3"/>
                <line x1="4" y1="10" x2="4" y2="21"/><line x1="20" y1="10" x2="20" y2="21"/>
                <line x1="8" y1="14" x2="8" y2="17"/><line x1="12" y1="14" x2="12" y2="17"/><line x1="16" y1="14" x2="16" y2="17"/>
              </svg>
            </div>
            <div className="nr-node nr-nc">
              <svg viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="6"/>
                <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
              </svg>
            </div>
            <div className="nr-conn nr-ca" />
            <div className="nr-conn nr-cb" />
            <div className="nr-conn nr-cc" />
            <div className="nr-arc2" />
            <div className="nr-arc1" />
            <img className="nr-logo-img" src={LOGO} alt="NextRoute" />
          </div>

          <div className="nr-brand">
            <div className="nr-brand-name">NEXTROUTE</div>
            <div className="nr-brand-tag">NextRoute</div>
          </div>

          <div className="nr-sep">
            <div className="nr-sline" /><div className="nr-sdot" /><div className="nr-sline" />
          </div>

          <div className="nr-words">
            <span className="nr-word">Discover</span>
            <span className="nr-word">Connect</span>
            <span className="nr-word">Succeed</span>
          </div>
        </div>
      </div>
    </div>
  );
}