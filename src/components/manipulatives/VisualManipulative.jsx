import React from 'react';
import InteractiveGeometry from './InteractiveGeometry.jsx';

export default function VisualManipulative({ manipulative }) {
  if (!manipulative) return null;

  switch (manipulative.type) {
    case 'shape-outline': {
      const { kind, rotation = 0 } = manipulative;
      const sides = { Triangle: 3, Square: 4, Hexagon: 6 }[kind];
      const points = sides ? Array.from({ length: sides }, (_, i) => {
        const a = (i * 360 / sides - 90) * Math.PI / 180;
        return `${100 + 65 * Math.cos(a)},${100 + 65 * Math.sin(a)}`;
      }).join(' ') : '';
      return <div className="manipulative-container"><div className="manipulative-label">Name this shape</div>
        <svg viewBox="0 0 200 200" role="img" aria-label="Shape to identify" style={{ width: 'min(220px, 100%)' }}>
          <g transform={`rotate(${rotation},100,100)`} fill="#60a5fa" stroke="#1d4ed8" strokeWidth="4">
            {kind === 'Circle' ? <circle cx="100" cy="100" r="65" /> : <polygon points={points} />}
          </g>
        </svg><p>Turning a shape keeps its name.</p></div>;
    }
    case 'length-comparison': {
      const { a, b } = manipulative;
      return <div className="manipulative-container"><div className="manipulative-label">Compare the ribbon lengths</div>
        <svg viewBox="0 0 340 115" role="img" aria-label={`Ribbon A spans ${a} equal units; ribbon B spans ${b} equal units`} style={{ width: '100%', maxWidth: 440 }}>
          <line x1="75" y1="10" x2="75" y2="100" stroke="currentColor" />
          <text x="0" y="38" fill="currentColor">Ribbon A</text><rect x="75" y="18" width={a*20} height="28" fill="#60a5fa" />
          <text x="0" y="83" fill="currentColor">Ribbon B</text><rect x="75" y="63" width={b*20} height="28" fill="#a78bfa" />
        </svg></div>;
    }
    case 'unit-length': {
      const { count } = manipulative;
      return <div className="manipulative-container"><div className="manipulative-label">Measure using equal units</div>
        <svg viewBox={`0 0 ${count*30+10} 85`} role="img" aria-label={`Ribbon aligned with ${count} adjacent equal one-centimeter blocks`} style={{ width:'100%', maxWidth: 480 }}>
          <rect x="5" y="5" width={count*30} height="20" fill="#a78bfa" />
          {Array.from({length:count}, (_, i) => <g key={i}><rect x={5+i*30} y="35" width="30" height="26" fill="#60a5fa" stroke="#1e3a8a" /><text x={20+i*30} y="51" textAnchor="middle" fontSize="9">1 cm</text></g>)}
        </svg><p>Equal units, no gaps, no overlaps.</p></div>;
    }
    case 'fraction-number-line': {
      const { numerator, denominator } = manipulative;
      return <div className="manipulative-container"><div className="manipulative-label">Fraction number line</div>
        <svg viewBox="0 0 440 100" role="img" aria-label={`Line from zero to one with ${denominator} equal intervals; marked point is ${numerator} intervals from zero`} style={{ width:'100%', maxWidth:520 }}>
          <line x1="30" y1="45" x2="410" y2="45" stroke="currentColor" strokeWidth="3" />
          {Array.from({length:denominator+1},(_,i)=><line key={i} x1={30+380*i/denominator} x2={30+380*i/denominator} y1="37" y2="53" stroke="currentColor" />)}
          <circle cx={30+380*numerator/denominator} cy="45" r="7" fill="#f59e0b" />
          <text x="30" y="79" fill="currentColor" textAnchor="middle">0</text><text x="410" y="79" fill="currentColor" textAnchor="middle">1</text>
        </svg></div>;
    }
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

    case 'tape-diagram': {
      const { parts = [12, 8], total = 20, unknownPartIndex = -1, unknownTotal = false, unit = '' } = manipulative;
      const sumParts = parts.reduce((a, b) => a + b, 0) || 1;
      return (
        <div className="manipulative-container" style={{ padding: '12px' }}>
          <div className="manipulative-label">Eureka Math Tape Diagram (Part–Part–Whole Model)</div>
          <div style={{ maxWidth: '420px', margin: '8px auto' }}>
            {/* Total Brace */}
            <div style={{ textAlign: 'center', fontWeight: 700, fontSize: '13px', marginBottom: '4px', color: '#4f46e5' }}>
              Total Whole: {unknownTotal ? '❓' : `${total}${unit ? ' ' + unit : ''}`}
            </div>
            <div style={{ display: 'flex', width: '100%', height: '42px', border: '2px solid #4f46e5', borderRadius: '6px', overflow: 'hidden' }}>
              {parts.map((p, idx) => {
                const widthPct = (p / sumParts) * 100;
                const isUnknown = idx === unknownPartIndex;
                const colors = ['rgba(99, 102, 241, 0.18)', 'rgba(16, 185, 129, 0.18)', 'rgba(245, 158, 11, 0.18)', 'rgba(14, 165, 233, 0.18)'];
                return (
                  <div
                    key={idx}
                    style={{
                      width: `${widthPct}%`,
                      flexShrink: 0,
                      boxSizing: 'border-box',
                      background: colors[idx % colors.length],
                      borderRight: idx < parts.length - 1 ? '2px solid #4f46e5' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '14px',
                    }}
                  >
                    {isUnknown ? '❓' : `${p}${unit ? ' ' + unit : ''}`}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    case 'place-value': {
      const { hundreds = 0, tens = 0, ones = 0 } = manipulative;
      return (
        <div className="manipulative-container" style={{ padding: '12px' }}>
          <div className="manipulative-label">California Place Value Disks Chart</div>
          <div style={{ display: 'grid', gridTemplateColumns: hundreds > 0 ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)', gap: '8px', maxWidth: '420px', margin: '8px auto' }}>
            {hundreds > 0 && (
              <div style={{ border: '1px solid rgba(99, 102, 241, 0.35)', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, marginBottom: '6px', color: '#4f46e5' }}>HUNDREDS (100)</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'center' }}>
                  {Array.from({ length: hundreds }).map((_, i) => (
                    <span key={i} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px', borderRadius: '50%', background: '#4f46e5', color: '#fff', fontSize: '10px', fontWeight: 700 }}>
                      100
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div style={{ border: '1px solid rgba(16, 185, 129, 0.35)', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, marginBottom: '6px', color: '#10b981' }}>TENS (10)</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'center' }}>
                {Array.from({ length: tens }).map((_, i) => (
                  <span key={i} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '50%', background: '#10b981', color: '#fff', fontSize: '10px', fontWeight: 700 }}>
                    10
                  </span>
                ))}
              </div>
            </div>
            <div style={{ border: '1px solid rgba(245, 158, 11, 0.35)', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, marginBottom: '6px', color: '#f59e0b' }}>ONES (1)</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'center' }}>
                {Array.from({ length: ones }).map((_, i) => (
                  <span key={i} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '50%', background: '#f59e0b', color: '#fff', fontSize: '10px', fontWeight: 700 }}>
                    1
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    case 'bar-graph': {
      const { categories = [], maxVal = 15 } = manipulative;
      return (
        <div className="manipulative-container" style={{ padding: '12px' }}>
          <div className="manipulative-label">California Data Bar Graph</div>
          <div style={{ maxWidth: '380px', margin: '8px auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {categories.map((cat, idx) => {
              const pct = Math.min(100, Math.round((cat.value / maxVal) * 100));
              const colors = ['#4f46e5', '#10b981', '#f59e0b', '#0284c7'];
              return (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                  <div style={{ width: '95px', textAlign: 'right', fontWeight: 600 }}>{cat.label}:</div>
                  <div style={{ flex: 1, background: 'rgba(150,150,150,0.15)', height: '20px', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: colors[idx % colors.length], display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '6px', color: '#fff', fontSize: '11px', fontWeight: 700 }}>
                      {cat.value}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    case 'interactive-geometry':
    case 'geometry':
    case 'protractor':
    case 'volume-prism':
    case 'polygon-inspector': {
      return <InteractiveGeometry data={manipulative} />;
    }

    default:
      return null;
  }
}
