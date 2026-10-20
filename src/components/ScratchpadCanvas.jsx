import React, { useRef, useState, useEffect, useCallback } from 'react';

import { scratchpadPrompt } from '../game/guidedLesson.js';

const PEN_COLORS = [
  { id: 'blue', color: '#38bdf8', label: 'Sky Blue' },
  { id: 'green', color: '#10b981', label: 'Emerald Green' },
  { id: 'gold', color: '#f59e0b', label: 'Golden Yellow' },
  { id: 'pink', color: '#ec4899', label: 'Berry Pink' },
  { id: 'purple', color: '#a855f7', label: 'Cosmic Purple' },
];

export default function ScratchpadCanvas({ questionId, question, practiceOnly=false }) {
  const canvasRef = useRef(null);
  const [workStep,setWorkStep]=useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState(PEN_COLORS[0].color);
  const [penSize, setPenSize] = useState(4);
  const [isEraser, setIsEraser] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [strokes, setStrokes] = useState([]);
  const [redoStrokes,setRedoStrokes]=useState([]);
  const [notes,setNotes]=useState('');
  const currentStrokeRef = useRef(null);

  const redrawCanvas = useCallback(
    (strokeList) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const stroke of strokeList) {
        if (!stroke.points || stroke.points.length === 0) continue;
        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = stroke.size;
        if (stroke.eraser) {
          ctx.globalCompositeOperation = 'destination-out';
          ctx.strokeStyle = 'rgba(0,0,0,1)';
        } else {
          ctx.globalCompositeOperation = 'source-over';
          ctx.strokeStyle = stroke.color;
        }

        ctx.beginPath();
        const [first, ...rest] = stroke.points;
        ctx.moveTo(first.x, first.y);
        if (rest.length === 0) {
          ctx.lineTo(first.x + 0.1, first.y + 0.1);
        } else {
          for (const pt of rest) {
            ctx.lineTo(pt.x, pt.y);
          }
        }
        ctx.stroke();
        ctx.restore();
      }
    },
    []
  );

  // Clear scratchpad automatically when moving to a new question
  useEffect(() => {
    setStrokes([]);setRedoStrokes([]);setNotes('');setWorkStep(0);currentStrokeRef.current=null;setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, [questionId]);

  useEffect(() => {
    redrawCanvas(strokes);
  }, [strokes, redrawCanvas]);

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handlePointerDown = (e) => {
    e.preventDefault();
    if (e.target.setPointerCapture) {
      try {
        e.target.setPointerCapture(e.pointerId);
      } catch {
        // Ignore pointer capture errors
      }
    }
    if(currentStrokeRef.current)return;
    setRedoStrokes([]);
    const pt = getCoordinates(e);
    const newStroke = {
      color: penColor,
      size: isEraser ? 22 : penSize,
      eraser: isEraser,
      points: [pt],
    };
    currentStrokeRef.current = newStroke;
    setIsDrawing(true);
    setStrokes((prev) => [...prev, newStroke]);
  };

  const handlePointerMove = (e) => {
    if (!currentStrokeRef.current) return;
    e.preventDefault();
    const pt = getCoordinates(e);
    currentStrokeRef.current.points.push(pt);
    setStrokes((prev) => [...prev.slice(0, -1), { ...currentStrokeRef.current }]);
  };

  const handlePointerUp = () => {
    setIsDrawing(false);
    currentStrokeRef.current = null;
  };

  const handleUndo = () => {
    setRedoStrokes(prev=>[...prev,strokes[strokes.length-1]]);
    setStrokes((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    if(window.confirm('Clear your drawing?')){setStrokes([]);setRedoStrokes([]);}
  };

  return (
    <div className="kid-scratchpad-box animated-pop">
      <div className="scratchpad-toolbar">
        <div className="scratchpad-title-group">
          <span className="scratchpad-badge">✏️ My math paper</span>
          <span className="scratchpad-sub">Draw or type your thinking. This is not graded.</span>
        </div>

        <div className="scratchpad-tools">
          <div className="scratchpad-colors">
            {PEN_COLORS.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`color-swatch-btn ${!isEraser && penColor === c.color ? 'active' : ''}`}
                style={{ '--swatch-color': c.color }}
                onClick={() => {
                  setIsEraser(false);
                  setPenColor(c.color);
                }}
                title={c.label}
                aria-label={c.label}
              />
            ))}
          </div>

          <button
            type="button"
            className={`scratch-tool-btn ${penSize === 7 && !isEraser ? 'active' : ''}`}
            onClick={() => {
              setIsEraser(false);
              setPenSize((s) => (s === 4 ? 7 : 4));
            }}
            title="Toggle marker thickness"
          >
            🖊️ {penSize === 4 ? 'Fine' : 'Bold'}
          </button>

          <button
            type="button"
            className={`scratch-tool-btn ${isEraser ? 'active' : ''}`}
            onClick={() => setIsEraser((v) => !v)}
            title="Eraser"
          >
            🧽 Eraser
          </button>

          <button
            type="button"
            className={`scratch-tool-btn ${showGrid ? 'active' : ''}`}
            onClick={() => setShowGrid((v) => !v)}
            title="Toggle math grid paper"
          >
            📏 Grid
          </button>

          <button
            type="button"
            className="scratch-tool-btn"
            onClick={handleUndo}
            disabled={strokes.length === 0}
            title="Undo last line"
          >
            ↩️ Undo
          </button>

          <button
            type="button"
            className="scratch-tool-btn clear-btn"
            onClick={handleClear}
            disabled={strokes.length === 0}
            title="Clear all drawings"
          >
            🗑️ Clear
          </button>
        </div>
      </div>

      {!practiceOnly&&<>
        <ol className="drawing-step-list">{['Understand: what do I know and need to find?','Make a model: draw or write one small step.','Check: does my answer fit the question?'].map((text,i)=><li key={text} aria-current={workStep===i?'step':undefined} className={workStep===i?'current':''}><button type="button" onClick={()=>setWorkStep(i)}>{text}</button></li>)}</ol>
        <p className="scratchpad-prompt">{workStep===0?'Read the question. Write the important numbers and their units.':workStep===1?scratchpadPrompt(question):'Count again or use the opposite operation. Explain why your answer makes sense.'}</p>
        <div className="drawing-step-actions"><button type="button" className="btn btn-secondary" disabled={workStep===0} onClick={()=>setWorkStep(s=>s-1)}>Back</button><button type="button" className="btn btn-primary" disabled={workStep===2} onClick={()=>setWorkStep(s=>s+1)}>Next small step →</button></div>
      </>}
      <label className="scratchpad-notes">My thinking <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="I know… I need to find…" maxLength={2000} /></label>
      <p className="scratchpad-sub">Your paper clears when you close it or move on. Bip cannot read your drawing.</p>
      <button type="button" className="scratch-tool-btn" disabled={!redoStrokes.length} onClick={()=>{setStrokes(prev=>[...prev,redoStrokes[redoStrokes.length-1]]);setRedoStrokes(prev=>prev.slice(0,-1));}}>↪️ Redo</button>
      <div className={`scratchpad-canvas-wrap ${showGrid ? 'grid-bg' : ''}`}>
        <canvas
          ref={canvasRef}
          width={760}
          height={260}
          className="scratchpad-canvas" aria-label="Math drawing paper" role="img"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        />
        {strokes.length === 0 && (
          <div className="scratchpad-watermark" aria-hidden="true">
            ✏️ Draw here with your mouse, finger, or stylus to work out the math!
          </div>
        )}
      </div>
    </div>
  );
}
