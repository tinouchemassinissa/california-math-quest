import React, { useState } from 'react';

/**
 * Interactive Geometry & Perimeter/Area Manipulative
 * Allows students to:
 * 1. Click and trace individual perimeter sides to measure and add them.
 * 2. Toggle square unit tiles to visually count and calculate Area.
 * 3. Inspect vertices, angles, and side lengths dynamically.
 */
export default function InteractiveGeometry({ data }) {
  const {
    shape = 'rectangle',
    width = 6,
    height = 4,
    sideA = 6,
    sideB = 4,
    sideC = 6,
    sideD = 4,
    unit = 'ft',
    showAreaGrid: initialShowGrid = false,
  } = data || {};

  const [activeSides, setActiveSides] = useState(new Set());
  const [showGrid, setShowGrid] = useState(initialShowGrid);
  const [highlightPerimeter, setHighlightPerimeter] = useState(false);

  // SVG dimensions
  const scale = 24; // pixels per unit
  const svgWidth = Math.max(260, width * scale + 100);
  const svgHeight = Math.max(200, height * scale + 80);
  const offsetX = (svgWidth - width * scale) / 2;
  const offsetY = (svgHeight - height * scale) / 2;

  const sides = [
    { id: 'top', label: `Top: ${width} ${unit}`, length: width, x1: offsetX, y1: offsetY, x2: offsetX + width * scale, y2: offsetY },
    { id: 'right', label: `Right: ${height} ${unit}`, length: height, x1: offsetX + width * scale, y1: offsetY, x2: offsetX + width * scale, y2: offsetY + height * scale },
    { id: 'bottom', label: `Bottom: ${width} ${unit}`, length: width, x1: offsetX + width * scale, y1: offsetY + height * scale, x2: offsetX, y2: offsetY + height * scale },
    { id: 'left', label: `Left: ${height} ${unit}`, length: height, x1: offsetX, y1: offsetY + height * scale, x2: offsetX, y2: offsetY },
  ];

  const toggleSide = (sideId) => {
    setActiveSides((prev) => {
      const next = new Set(prev);
      if (next.has(sideId)) next.delete(sideId);
      else next.add(sideId);
      return next;
    });
  };

  const tracedPerimeter = sides
    .filter((s) => activeSides.has(s.id))
    .reduce((sum, s) => sum + s.length, 0);

  const totalPerimeter = (width + height) * 2;
  const totalArea = width * height;

  return (
    <div className="manipulative-container interactive-geometry-card" style={{ background: 'var(--card-bg, #fbfbfb)', border: '1px solid #e0e0e0', borderRadius: '10px', padding: '12px', marginTop: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#1a73e8' }}>
          📐 Interactive Geometry Explorer ({width} × {height} {unit})
        </span>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setShowGrid((v) => !v)}
            style={{ fontSize: '11px', padding: '3px 8px' }}
          >
            {showGrid ? '🔲 Hide Area Grid' : '🔲 Show Area Grid Tiles'}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              if (activeSides.size === 4) setActiveSides(new Set());
              else setActiveSides(new Set(['top', 'right', 'bottom', 'left']));
            }}
            style={{ fontSize: '11px', padding: '3px 8px' }}
          >
            {activeSides.size === 4 ? 'Reset Perimeter' : '📏 Trace All Sides'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ width: '100%', maxWidth: `${svgWidth}px`, height: 'auto', maxHeight: '210px' }}>
          {/* Background Area Grid Tiles */}
          {showGrid && (
            <g opacity="0.85">
              {Array.from({ length: height }).map((_, r) =>
                Array.from({ length: width }).map((_, c) => (
                  <rect
                    key={`tile-${r}-${c}`}
                    x={offsetX + c * scale}
                    y={offsetY + r * scale}
                    width={scale}
                    height={scale}
                    fill={(r + c) % 2 === 0 ? '#e8f0fe' : '#d2e3fc'}
                    stroke="#a8c7fa"
                    strokeWidth="1"
                  />
                ))
              )}
            </g>
          )}

          {/* Main Shape Polygon */}
          <rect
            x={offsetX}
            y={offsetY}
            width={width * scale}
            height={height * scale}
            fill={showGrid ? 'none' : 'rgba(99, 102, 241, 0.08)'}
            stroke="#cbd5e1"
            strokeWidth="2"
          />

          {/* Interactive Sides (Clickable to trace perimeter) */}
          {sides.map((s) => {
            const isTraced = activeSides.has(s.id);
            return (
              <g key={s.id} onClick={() => toggleSide(s.id)} style={{ cursor: 'pointer' }}>
                {/* Fat invisible line for easy clicking */}
                <line
                  x1={s.x1}
                  y1={s.y1}
                  x2={s.x2}
                  y2={s.y2}
                  stroke="transparent"
                  strokeWidth="16"
                />
                {/* Visible side border */}
                <line
                  x1={s.x1}
                  y1={s.y1}
                  x2={s.x2}
                  y2={s.y2}
                  stroke={isTraced ? '#10b981' : '#6366f1'}
                  strokeWidth={isTraced ? '4.5' : '2.5'}
                  strokeLinecap="round"
                />
              </g>
            );
          })}

          {/* Dimension Labels */}
          {/* Top Label */}
          <text
            x={offsetX + (width * scale) / 2}
            y={offsetY - 10}
            textAnchor="middle"
            fontSize="12"
            fontWeight="bold"
            fill={activeSides.has('top') ? '#10b981' : '#1e293b'}
          >
            {width} {unit}
          </text>
          {/* Bottom Label */}
          <text
            x={offsetX + (width * scale) / 2}
            y={offsetY + height * scale + 18}
            textAnchor="middle"
            fontSize="12"
            fontWeight="bold"
            fill={activeSides.has('bottom') ? '#10b981' : '#1e293b'}
          >
            {width} {unit}
          </text>
          {/* Left Label */}
          <text
            x={offsetX - 12}
            y={offsetY + (height * scale) / 2 + 4}
            textAnchor="end"
            fontSize="12"
            fontWeight="bold"
            fill={activeSides.has('left') ? '#10b981' : '#1e293b'}
          >
            {height} {unit}
          </text>
          {/* Right Label */}
          <text
            x={offsetX + width * scale + 12}
            y={offsetY + (height * scale) / 2 + 4}
            textAnchor="start"
            fontSize="12"
            fontWeight="bold"
            fill={activeSides.has('right') ? '#10b981' : '#1e293b'}
          >
            {height} {unit}
          </text>
        </svg>
      </div>

      {/* Interactive Measurement Tally */}
      <div
        style={{
          marginTop: '8px',
          padding: '8px 12px',
          background: 'rgba(0,0,0,0.03)',
          borderRadius: '6px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '12px',
        }}
      >
        <div>
          <span style={{ fontWeight: 600 }}>📏 Traced Perimeter: </span>
          <span style={{ color: activeSides.size === 4 ? '#10b981' : '#f59e0b', fontWeight: 'bold' }}>
            {tracedPerimeter} {unit}
          </span>
          <span style={{ color: '#666', marginLeft: '6px' }}>
            ({activeSides.size}/4 sides traced)
          </span>
        </div>
        <div>
          <span style={{ fontWeight: 600 }}>🔲 Total Area: </span>
          <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>
            {totalArea} sq {unit}
          </span>
          <span style={{ color: '#666', marginLeft: '6px' }}>
            ({width} × {height})
          </span>
        </div>
      </div>
    </div>
  );
}
