import React, { useEffect, useRef } from 'react';
import { Factory, ShieldCheck, Radio, Sparkles } from 'lucide-react';

interface GlobeFallbackProps {
  onSelectFactory?: (name: string) => void;
  selectedFactory?: string | null;
  selectedDestination?: string | null;
  onSelectDestination?: (name: string | null) => void;
  shipModeFilter?: string;
}

const FACTORY_NODES = [
  { name: "Lot's O' Nuts", city: "Casa Grande, AZ", x: 26, y: 56, type: 'factory', desc: 'Nut & Marshmallow Chocolate Bars' },
  { name: "Sugar Shack", city: "Thief River Falls, MN", x: 44, y: 25, type: 'factory', desc: 'Sugar Candies & Specialty Beverages' },
  { name: "Secret Factory", city: "Rock Island, IL", x: 53, y: 40, type: 'factory', desc: 'Experimental Confections & Novelties' },
  { name: "The Other Factory", city: "Memphis, TN", x: 54, y: 53, type: 'factory', desc: 'Chewy Candies & Specialty Toffee' },
  { name: "Wicked Choccy's", city: "Savannah, GA", x: 67, y: 60, type: 'factory', desc: 'Premium Milk & Caramel Chocolate' },
];

const DESTINATIONS = [
  { name: "Los Angeles, CA", x: 18, y: 52 },
  { name: "Seattle, WA", x: 20, y: 20 },
  { name: "Dallas, TX", x: 46, y: 64 },
  { name: "New York, NY", x: 74, y: 35 },
  { name: "Miami, FL", x: 71, y: 76 },
  { name: "Denver, CO", x: 36, y: 45 },
];

export const GlobeFallback: React.FC<GlobeFallbackProps> = ({ onSelectFactory, selectedFactory }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const render = () => {
      t += 0.015;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Radial globe background gradient
      const grad = ctx.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, w / 2);
      grad.addColorStop(0, 'rgba(14, 165, 233, 0.12)');
      grad.addColorStop(0.6, 'rgba(8, 47, 73, 0.08)');
      grad.addColorStop(1, 'rgba(2, 6, 23, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, w / 2 - 10, 0, Math.PI * 2);
      ctx.fill();

      // Atmospheric outer glow
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, w / 2 - 14, 0, Math.PI * 2);
      ctx.stroke();

      // Latitude and Longitude holographic grid lines
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
      ctx.lineWidth = 1;
      for (let i = 1; i < 6; i++) {
        ctx.beginPath();
        ctx.ellipse(w / 2, h / 2, (w / 2 - 20), (h / 2 - 20) * (i / 6), 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      for (let i = 1; i < 6; i++) {
        ctx.beginPath();
        ctx.ellipse(w / 2, h / 2, (w / 2 - 20) * (i / 6), (h / 2 - 20), 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw curved shipping routes with traveling pulses
      FACTORY_NODES.forEach((fac, facIdx) => {
        const dest = DESTINATIONS[(facIdx * 2) % DESTINATIONS.length];
        const x1 = (fac.x / 100) * w;
        const y1 = (fac.y / 100) * h;
        const x2 = (dest.x / 100) * w;
        const y2 = (dest.y / 100) * h;

        // Quadratic arc midpoint elevation
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2 - 35;

        // Base route path
        ctx.strokeStyle = 'rgba(14, 165, 233, 0.35)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.quadraticCurveTo(midX, midY, x2, y2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Animated packet along curve
        const progress = (t * 0.4 + facIdx * 0.22) % 1;
        const inv = 1 - progress;
        const px = inv * inv * x1 + 2 * inv * progress * midX + progress * progress * x2;
        const py = inv * inv * y1 + 2 * inv * progress * midY + progress * progress * y2;

        // Glow behind particle
        const pGrad = ctx.createRadialGradient(px, py, 1, px, py, 8);
        pGrad.addColorStop(0, 'rgba(56, 189, 248, 1)');
        pGrad.addColorStop(0.5, 'rgba(14, 165, 233, 0.5)');
        pGrad.addColorStop(1, 'rgba(14, 165, 233, 0)');
        ctx.fillStyle = pGrad;
        ctx.beginPath();
        ctx.arc(px, py, 8, 0, Math.PI * 2);
        ctx.fill();

        // Core particle
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw destination points
      DESTINATIONS.forEach((dest) => {
        const dx = (dest.x / 100) * w;
        const dy = (dest.y / 100) * h;
        ctx.fillStyle = 'rgba(148, 163, 184, 0.7)';
        ctx.beginPath();
        ctx.arc(dx, dy, 3, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw factory nodes with radar pulses
      FACTORY_NODES.forEach((fac, i) => {
        const fx = (fac.x / 100) * w;
        const fy = (fac.y / 100) * h;
        const isSel = selectedFactory === fac.name;

        // Radar pulse ring
        const ringRad = 6 + ((t * 12 + i * 8) % 24);
        const ringAlpha = Math.max(0, 1 - (ringRad - 6) / 24);
        ctx.strokeStyle = isSel ? `rgba(244, 63, 94, ${ringAlpha})` : `rgba(56, 189, 248, ${ringAlpha})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(fx, fy, ringRad, 0, Math.PI * 2);
        ctx.stroke();

        // Outer glow
        ctx.fillStyle = isSel ? 'rgba(244, 63, 94, 0.4)' : 'rgba(14, 165, 233, 0.3)';
        ctx.beginPath();
        ctx.arc(fx, fy, 7, 0, Math.PI * 2);
        ctx.fill();

        // Node center
        ctx.fillStyle = isSel ? '#f43f5e' : '#38bdf8';
        ctx.beginPath();
        ctx.arc(fx, fy, 3.5, 0, Math.PI * 2);
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [selectedFactory]);

  return (
    <div className="relative w-full aspect-square max-w-[560px] mx-auto flex items-center justify-center">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-radial from-sky-500/10 via-slate-900/40 to-transparent blur-2xl -z-10" />

      {/* 2D Holographic Canvas */}
      <canvas
        ref={canvasRef}
        width={560}
        height={560}
        className="w-full h-full object-contain cursor-crosshair"
      />

      {/* Interactive Factory Overlay Nodes */}
      <div className="absolute inset-0 pointer-events-none">
        {FACTORY_NODES.map((fac) => {
          const isSel = selectedFactory === fac.name;
          return (
            <div
              key={fac.name}
              style={{ left: `${fac.x}%`, top: `${fac.y}%` }}
              onClick={(e) => {
                e.stopPropagation();
                if (onSelectFactory) onSelectFactory(fac.name);
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto group cursor-pointer"
            >
              {/* Tooltip on hover */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900/95 border border-sky-500/40 rounded-lg p-2.5 shadow-xl text-left pointer-events-none z-20 w-44 backdrop-blur-md">
                <div className="flex items-center gap-1.5 text-sky-400 font-bold text-xs mb-0.5">
                  <Factory className="w-3.5 h-3.5" />
                  <span>{fac.name}</span>
                </div>
                <div className="text-[10px] text-slate-300 font-medium">{fac.city}</div>
                <div className="text-[9px] text-slate-400 mt-1 leading-snug">{fac.desc}</div>
              </div>

              {/* Ping badge */}
              <div className={`px-1.5 py-0.5 rounded text-[9px] font-mono tracking-tight transition-colors border ${
                isSel
                  ? 'bg-rose-500 text-white border-rose-400'
                  : 'bg-slate-900/90 text-sky-300 border-sky-500/40 group-hover:border-sky-400'
              }`}>
                {fac.name.split(" ")[0]}
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Status Pill */}
      <div className="absolute bottom-4 left-4 bg-slate-900/90 border border-slate-800 rounded-full px-3 py-1.5 flex items-center gap-2 text-[11px] text-slate-300 backdrop-blur-sm shadow-lg">
        <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
        <span>Holographic 2D Fallback Active</span>
      </div>
    </div>
  );
};
