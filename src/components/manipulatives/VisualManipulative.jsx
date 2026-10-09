import React from 'react';
import InteractiveGeometry from './InteractiveGeometry.jsx';

export default function VisualManipulative({ manipulative }) {
  if (!manipulative) return null;

  switch (manipulative.type) {
    case 'ten-frame': {
      const { count = 0, groups = null, removeCount = 0 } = manipulative;
      const dots = Array.from({ length: 10 }, (_, i) => i < count);
      return (
        <div className="manipulative-container">
          <div className="manipulative-label">Visual Ten-Frame Model</div>
          <div className="ten-frame-grid">
            {dots.map((filled, idx) => {
              const isFirstGroup = groups && idx < groups[0];
              const isSecondGroup = groups && idx >= groups[0] && idx < (groups[0] + groups[1]);
              const isRemoved = removeCount > 0 && idx >= (count - removeCount);

              let dotClass = 'ten-dot empty';
              if (filled) {
                if (isRemoved) dotClass = 'ten-dot removed';
                else if (isFirstGroup) dotClass = 'ten-dot group-a';
                else if (isSecondGroup) dotClass = 'ten-dot group-b';
                else dotClass = 'ten-dot filled';
              }

              return (
                <div key={idx} className="ten-frame-cell">
                  {filled && <div className={dotClass}>{isRemoved ? '✕' : ''}</div>}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    case 'double-ten-frame': {
      const { firstFull = 10, secondCount = 0 } = manipulative;
      return (
        <div className="manipulative-container">
          <div className="manipulative-label">Double Ten-Frame (Ten + Ones)</div>
          <div className="double-frame-row">
            <div className="ten-frame-grid mini">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="ten-frame-cell">
                  <div className="ten-dot filled" />
                </div>
              ))}
            </div>
            <div className="plus-sign">+</div>
            <div className="ten-frame-grid mini">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="ten-frame-cell">
                  {i < secondCount && <div className="ten-dot group-b" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    case 'number-line': {
      const { min = 0, max = 20, start = 0, hop = 0, target = 0 } = manipulative;
      const range = max - min;
      const startPct = ((start - min) / range) * 100;
      const targetPct = ((target - min) / range) * 100;

      return (
        <div className="manipulative-container">
          <div className="manipulative-label">Number Line Model</div>
          <div className="number-line-wrapper">
            <svg viewBox="0 0 400 90" className="number-line-svg">
              {/* Main Line */}
              <line x1="20" y1="60" x2="380" y2="60" stroke="currentColor" strokeWidth="3" markerEnd="url(#arrow)" />
              {/* Ticks */}
              {Array.from({ length: 11 }).map((_, i) => {
                const val = Math.round(min + (i * range) / 10);
                const x = 20 + (i * 360) / 10;
                return (
                  <g key={i}>
                    <line x1={x} y1="52" x2={x} y2="68" stroke="currentColor" strokeWidth="2" />
                    <text x={x} y="82" textAnchor="middle" fontSize="11" fill="currentColor">
                      {val}
                    </text>
                  </g>
                );
              })}
              {/* Hop arc if hop > 0 */}
              {hop > 0 && (
                <g>
                  <path
                    d={`M ${20 + (startPct * 3.6)} 55 Q ${20 + ((startPct + targetPct) * 1.8)} 18 ${20 + (targetPct * 3.6)} 55`}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="3"
                    strokeDasharray="4 2"
                  />
                  <circle cx={20 + (startPct * 3.6)} cy="60" r="5" fill="#3b82f6" />
                  <circle cx={20 + (targetPct * 3.6)} cy="60" r="6" fill="#10b981" />
                  <text
                    x={20 + ((startPct + targetPct) * 1.8)}
                    y="22"
                    textAnchor="middle"
                    fontSize="13"
                    fontWeight="bold"
                    fill="#f59e0b"
                  >
                    +{hop}
                  </text>
                </g>
              )}
            </svg>
          </div>
        </div>
      );
    }

    case 'fraction': {
      const { numerator = 1, denominator = 4 } = manipulative;
      return (
        <div className="manipulative-container">
          <div className="manipulative-label">Fraction Strip Model ({numerator}/{denominator})</div>
          <div className="fraction-strip">
            {Array.from({ length: denominator }).map((_, i) => (
              <div
                key={i}
                className={`fraction-part ${i < numerator ? 'shaded' : ''}`}
                style={{ width: `${100 / denominator}%` }}
              >
                1/{denominator}
              </div>
            ))}
          </div>
        </div>
      );
    }

    case 'clock': {
      const { hour = 12, minute = 0 } = manipulative;
      const minuteAngle = minute * 6;
      const hourAngle = ((hour % 12) + minute / 60) * 30;

      return (
        <div className="manipulative-container">
          <div className="manipulative-label">Analog Clock Face</div>
          <svg viewBox="0 0 160 160" className="clock-svg">
            {/* Clock Face Circle */}
            <circle cx="80" cy="80" r="72" fill="var(--card-bg, #ffffff)" stroke="#6366f1" strokeWidth="4" />
            <circle cx="80" cy="80" r="4" fill="#4338ca" />

            {/* Hour Markers */}
            {Array.from({ length: 12 }).map((_, i) => {
              const h = i + 1;
              const angle = (h * 30 * Math.PI) / 180;
              const x = 80 + 55 * Math.sin(angle);
              const y = 80 - 55 * Math.cos(angle);
              return (
                <text
                  key={h}
                  x={x}
                  y={y + 4}
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="bold"
                  fill="currentColor"
                >
                  {h}
                </text>
              );
            })}

            {/* Hour Hand */}
            <line
              x1="80"
              y1="80"
              x2={80 + 35 * Math.sin((hourAngle * Math.PI) / 180)}
              y2={80 - 35 * Math.cos((hourAngle * Math.PI) / 180)}
              stroke="#4338ca"
              strokeWidth="5"
              strokeLinecap="round"
            />

            {/* Minute Hand */}
            <line
              x1="80"
              y1="80"
              x2={80 + 50 * Math.sin((minuteAngle * Math.PI) / 180)}
              y2={80 - 50 * Math.cos((minuteAngle * Math.PI) / 180)}
              stroke="#06b6d4"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      );
    }

    case 'money': {
      const { coins = {} } = manipulative;
      const { quarters = 0, dimes = 0, nickels = 0, pennies = 0 } = coins;
      return (
        <div className="manipulative-container">
          <div className="manipulative-label">Coin Tray</div>
          <div className="coins-tray">
            {Array.from({ length: quarters }).map((_, i) => (
              <div key={`q-${i}`} className="coin quarter" title="Quarter 25¢">
                25¢
              </div>
            ))}
            {Array.from({ length: dimes }).map((_, i) => (
              <div key={`d-${i}`} className="coin dime" title="Dime 10¢">
                10¢
              </div>
            ))}
            {Array.from({ length: nickels }).map((_, i) => (
              <div key={`n-${i}`} className="coin nickel" title="Nickel 5¢">
                5¢
              </div>
            ))}
            {Array.from({ length: pennies }).map((_, i) => (
              <div key={`p-${i}`} className="coin penny" title="Penny 1¢">
                1¢
              </div>
            ))}
          </div>
        </div>
      );
    }

    case 'array': {
      const { rows = 3, cols = 4 } = manipulative;
      return (
        <div className="manipulative-container">
          <div className="manipulative-label">Array Model ({rows} rows × {cols} columns)</div>
          <div className="array-grid" style={{ gridTemplateColumns: `repeat(${cols}, 28px)` }}>
            {Array.from({ length: rows * cols }).map((_, i) => (
              <div key={i} className="array-cell">
                <span className="array-dot">●</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case 'coordinate': {
      const { x = 3, y = 4, max = 10 } = manipulative;
      const step = 20; // 20px per unit, 200x200
      return (
        <div className="manipulative-container">
          <div className="manipulative-label">Coordinate Plane (Quadrant 1)</div>
          <svg viewBox="0 0 240 240" className="coord-svg">
            {/* Grid lines */}
            {Array.from({ length: max + 1 }).map((_, i) => {
              const pos = 20 + i * step;
              return (
                <g key={i}>
                  <line x1="20" y1={pos} x2="220" y2={pos} stroke="rgba(150, 150, 150, 0.25)" strokeWidth="1" />
                  <line x1={pos} y1="20" x2={pos} y2="220" stroke="rgba(150, 150, 150, 0.25)" strokeWidth="1" />
                  {/* labels on axes */}
                  <text x={pos} y="235" fontSize="9" textAnchor="middle" fill="currentColor">
                    {i}
                  </text>
                  <text x="12" y={224 - i * step} fontSize="9" textAnchor="end" fill="currentColor">
                    {i}
                  </text>
                </g>
              );
            })}
            {/* Main Axes */}
            <line x1="20" y1="220" x2="230" y2="220" stroke="currentColor" strokeWidth="2.5" />
            <line x1="20" y1="220" x2="20" y2="10" stroke="currentColor" strokeWidth="2.5" />

            {/* Target Star Point */}
            <g transform={`translate(${20 + x * step}, ${220 - y * step})`}>
              <circle r="7" fill="#ef4444" />
              <text y="3.5" textAnchor="middle" fontSize="10" fill="#fff" fontWeight="bold">★</text>
            </g>
          </svg>
        </div>
      );
    }

    case 'interactive-geometry':
    case 'geometry': {
      return <InteractiveGeometry data={manipulative} />;
    }

    default:
      return null;
  }
}
