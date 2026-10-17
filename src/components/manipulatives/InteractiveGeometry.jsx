import React, { useState, useEffect } from 'react';

/**
 * Interactive Geometry, Protractor, Polygon & 3D Volume Manipulative Suite
 * Supports:
 * 1. 'interactive-geometry' / 'geometry': Perimeter side tracing & Area unit grid tiles (3.MD.C.7, 3.MD.D.8, 4.MD.A.3)
 * 2. 'protractor': Interactive 180° Protractor & Angle ray explorer (4.MD.C.6, 4.G.A.1)
 * 3. 'volume-prism': Interactive 3D Rectangular Prism layer explorer (5.MD.C.5)
 * 4. 'polygon-inspector': Interactive 2D Polygon side & vertex counter (K.G.A.2, 2.G.A.1, 3.G.A.1)
 */
export default function InteractiveGeometry({ data }) {
  const type = data?.type || 'interactive-geometry';

  if (type === 'protractor') {
    return <ProtractorExplorer data={data} />;
  }
  if (type === 'volume-prism') {
    return <VolumePrismExplorer data={data} />;
  }
  if (type === 'polygon-inspector') {
    return <PolygonInspector data={data} />;
  }

  return <RectanglePerimeterAreaExplorer data={data} />;
}

function RectanglePerimeterAreaExplorer({ data }) {
  const {
    width = 6,
    height = 4,
    unit = 'ft',
    showAreaGrid: initialShowGrid = false,
  } = data || {};

  const [activeSides, setActiveSides] = useState(new Set());
  const [showGrid, setShowGrid] = useState(initialShowGrid);

  useEffect(() => {
    setActiveSides(new Set());
    setShowGrid(Boolean(initialShowGrid));
  }, [width, height, initialShowGrid]);

  const scale = 24;
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

  const totalArea = width * height;

  return (
    <div className="manipulative-container interactive-geometry-card" style={{ background: 'var(--card-bg, #fbfbfb)', border: '1px solid #e0e0e0', borderRadius: '10px', padding: '12px', marginTop: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
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

          <rect
            x={offsetX}
            y={offsetY}
            width={width * scale}
            height={height * scale}
            fill={showGrid ? 'none' : 'rgba(99, 102, 241, 0.08)'}
            stroke="#cbd5e1"
            strokeWidth="2"
          />

          {sides.map((s) => {
            const isTraced = activeSides.has(s.id);
            return (
              <g key={s.id} onClick={() => toggleSide(s.id)} style={{ cursor: 'pointer' }}>
                <line x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} stroke="transparent" strokeWidth="16" />
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

          <text x={offsetX + (width * scale) / 2} y={offsetY - 10} textAnchor="middle" fontSize="12" fontWeight="bold" fill={activeSides.has('top') ? '#10b981' : '#1e293b'}>
            {width} {unit}
          </text>
          <text x={offsetX + (width * scale) / 2} y={offsetY + height * scale + 18} textAnchor="middle" fontSize="12" fontWeight="bold" fill={activeSides.has('bottom') ? '#10b981' : '#1e293b'}>
            {width} {unit}
          </text>
          <text x={offsetX - 12} y={offsetY + (height * scale) / 2 + 4} textAnchor="end" fontSize="12" fontWeight="bold" fill={activeSides.has('left') ? '#10b981' : '#1e293b'}>
            {height} {unit}
          </text>
          <text x={offsetX + width * scale + 12} y={offsetY + (height * scale) / 2 + 4} textAnchor="start" fontSize="12" fontWeight="bold" fill={activeSides.has('right') ? '#10b981' : '#1e293b'}>
            {height} {unit}
          </text>
        </svg>
      </div>

      <div style={{ marginTop: '8px', padding: '8px 12px', background: 'rgba(0,0,0,0.03)', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', flexWrap: 'wrap', gap: '8px' }}>
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

function ProtractorExplorer({ data }) {
  const { angle = 60 } = data || {};
  const [showProtractor, setShowProtractor] = useState(true);
  const [showClassification, setShowClassification] = useState(false);

  const cx = 160;
  const cy = 150;
  const radius = 110;
  const rad = (angle * Math.PI) / 180;
  const rayX = cx + radius * Math.cos(rad);
  const rayY = cy - radius * Math.sin(rad);

  const arcR = 38;
  const arcX = cx + arcR * Math.cos(rad);
  const arcY = cy - arcR * Math.sin(rad);

  const classification = angle < 90 ? 'Acute Angle (< 90°)' : angle === 90 ? 'Right Angle (90°)' : 'Obtuse Angle (> 90°)';

  return (
    <div className="manipulative-container interactive-geometry-card" style={{ background: 'var(--card-bg, #fbfbfb)', border: '1px solid #e0e0e0', borderRadius: '10px', padding: '12px', marginTop: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#1a73e8' }}>
          🧭 Interactive 180° Protractor & Angle Explorer
        </span>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setShowProtractor((v) => !v)}
            style={{ fontSize: '11px', padding: '3px 8px' }}
          >
            {showProtractor ? 'Hide Protractor Scale' : 'Show Protractor Scale'}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setShowClassification((v) => !v)}
            style={{ fontSize: '11px', padding: '3px 8px' }}
          >
            {showClassification ? 'Hide Angle Type' : 'Classify Angle'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <svg viewBox="0 0 320 180" style={{ width: '100%', maxWidth: '320px', height: 'auto' }}>
          {/* Protractor Semicircle Overlay */}
          {showProtractor && (
            <g>
              <path
                d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy} Z`}
                fill="rgba(232, 240, 254, 0.55)"
                stroke="#93c5fd"
                strokeWidth="2"
              />
              {Array.from({ length: 19 }).map((_, idx) => {
                const deg = idx * 10;
                const aRad = (deg * Math.PI) / 180;
                const x1 = cx + (radius - 10) * Math.cos(aRad);
                const y1 = cy - (radius - 10) * Math.sin(aRad);
                const x2 = cx + radius * Math.cos(aRad);
                const y2 = cy - radius * Math.sin(aRad);
                const tx = cx + (radius - 22) * Math.cos(aRad);
                const ty = cy - (radius - 22) * Math.sin(aRad);
                return (
                  <g key={deg}>
                    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#64748b" strokeWidth={deg % 30 === 0 ? '2' : '1'} />
                    {deg % 30 === 0 && (
                      <text x={tx} y={ty + 3} textAnchor="middle" fontSize="9" fontWeight="bold" fill="#334155">
                        {deg}°
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          )}

          {/* Angle Arc */}
          <path
            d={`M ${cx + arcR} ${cy} A ${arcR} ${arcR} 0 0 0 ${arcX} ${arcY}`}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="3"
          />

          {/* Base Ray (0 degrees) */}
          <line x1={cx} y1={cy} x2={cx + radius + 8} y2={cy} stroke="#4f46e5" strokeWidth="3.5" strokeLinecap="round" />
          {/* Target Ray */}
          <line x1={cx} y1={cy} x2={rayX} y2={rayY} stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" />
          {/* Vertex dot */}
          <circle cx={cx} cy={cy} r="5" fill="#1e293b" />
        </svg>
      </div>

      {showClassification && (
        <div style={{ marginTop: '6px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#0f766e' }}>
          Angle Classification: {classification}
        </div>
      )}
    </div>
  );
}

function VolumePrismExplorer({ data }) {
  const { length = 4, width = 3, height = 3, unit = 'ft' } = data || {};
  const [activeLayers, setActiveLayers] = useState(height);

  useEffect(() => {
    setActiveLayers(height);
  }, [length, width, height]);

  const baseArea = length * width;
  const currentVolume = baseArea * activeLayers;

  return (
    <div className="manipulative-container interactive-geometry-card" style={{ background: 'var(--card-bg, #fbfbfb)', border: '1px solid #e0e0e0', borderRadius: '10px', padding: '12px', marginTop: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#1a73e8' }}>
          🧊 Interactive 3D Rectangular Prism Explorer ({length} × {width} × {height} {unit})
        </span>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <button
            type="button"
            className="btn btn-secondary"
            disabled={activeLayers <= 1}
            onClick={() => setActiveLayers((l) => Math.max(1, l - 1))}
            style={{ fontSize: '11px', padding: '3px 8px' }}
          >
            − Peel 1 Layer
          </button>
          <span style={{ fontSize: '12px', fontWeight: 700 }}>
            Layers: {activeLayers} / {height}
          </span>
          <button
            type="button"
            className="btn btn-secondary"
            disabled={activeLayers >= height}
            onClick={() => setActiveLayers((l) => Math.min(height, l + 1))}
            style={{ fontSize: '11px', padding: '3px 8px' }}
          >
            + Stack 1 Layer
          </button>
        </div>
      </div>

      {/* Isometric / Layered Cube Visualization */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', alignItems: 'center', flexWrap: 'wrap', padding: '6px 0' }}>
        {Array.from({ length: activeLayers }).map((_, layerIdx) => (
          <div key={layerIdx} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, marginBottom: '4px', color: '#475569' }}>
              Layer {layerIdx + 1} ({baseArea} cubes)
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${length}, 22px)`,
                gap: '2px',
                padding: '4px',
                background: '#e0e7ff',
                border: '2px solid #6366f1',
                borderRadius: '6px',
              }}
            >
              {Array.from({ length: length * width }).map((__, tileIdx) => (
                <div
                  key={tileIdx}
                  style={{
                    width: '22px',
                    height: '22px',
                    background: '#818cf8',
                    borderRadius: '3px',
                    border: '1px solid #4f46e5',
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '8px', padding: '8px 12px', background: 'rgba(0,0,0,0.03)', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <strong>Base Layer Area (L × W):</strong> {length} × {width} = <strong>{baseArea} sq {unit}</strong>
        </div>
        <div>
          <strong>Active Volume ({activeLayers} {activeLayers === 1 ? 'layer' : 'layers'}):</strong> {baseArea} × {activeLayers} = <strong style={{ color: '#10b981' }}>{currentVolume} cu {unit}</strong>
        </div>
      </div>
    </div>
  );
}

function PolygonInspector({ data }) {
  const { sides = 4, shapeName = 'Polygon' } = data || {};
  const [clickedVertices, setClickedVertices] = useState(new Set());

  useEffect(() => {
    setClickedVertices(new Set());
  }, [sides, shapeName]);

  const cx = 120;
  const cy = 95;
  const r = 65;

  const vertices = Array.from({ length: sides }).map((_, i) => {
    const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  });

  const pointsStr = vertices.map((v) => `${v.x},${v.y}`).join(' ');

  const toggleVertex = (idx) => {
    setClickedVertices((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  return (
    <div className="manipulative-container interactive-geometry-card" style={{ background: 'var(--card-bg, #fbfbfb)', border: '1px solid #e0e0e0', borderRadius: '10px', padding: '12px', marginTop: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#1a73e8' }}>
          🔷 Interactive Polygon Inspector (Tap corners to count!)
        </span>
        <span style={{ fontSize: '12px', fontWeight: 700, color: '#10b981' }}>
          Counted Corners: {clickedVertices.size} / {sides}
        </span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <svg viewBox="0 0 240 190" style={{ width: '100%', maxWidth: '240px', height: 'auto' }}>
          <polygon
            points={pointsStr}
            fill="rgba(99, 102, 241, 0.12)"
            stroke="#4f46e5"
            strokeWidth="3"
          />
          {vertices.map((v, idx) => {
            const isSelected = clickedVertices.has(idx);
            return (
              <g key={idx} onClick={() => toggleVertex(idx)} style={{ cursor: 'pointer' }}>
                <circle
                  cx={v.x}
                  cy={v.y}
                  r={isSelected ? 10 : 7}
                  fill={isSelected ? '#10b981' : '#f59e0b'}
                  stroke="#fff"
                  strokeWidth="2"
                />
                {isSelected && (
                  <text x={v.x} y={v.y + 4} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#fff">
                    {idx + 1}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
