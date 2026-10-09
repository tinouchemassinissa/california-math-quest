import React from 'react';

export default function NumberPad({ onDigit, onBackspace, onSubmit, onClear }) {
  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '/', '-'];

  return (
    <div className="virtual-keypad">
      <div className="keypad-grid">
        {digits.map((d) => (
          <button
            key={d}
            type="button"
            className="key-btn"
            onClick={() => onDigit(d)}
          >
            {d}
          </button>
        ))}
        <button
          type="button"
          className="key-btn backspace-btn"
          onClick={onBackspace}
          title="Backspace"
        >
          ⌫
        </button>
      </div>
      <div className="keypad-actions">
        <button
          type="button"
          className="action-btn clear-btn"
          onClick={onClear}
        >
          Clear
        </button>
        <button
          type="button"
          className="action-btn submit-btn"
          onClick={onSubmit}
        >
          Enter ↵
        </button>
      </div>
    </div>
  );
}
