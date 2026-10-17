import React from 'react';

export default function NumberPad({ onDigit, onBackspace, onSubmit, onClear, disabled = false }) {
  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '.', '/'];

  return (
    <div className="virtual-keypad" style={{ marginTop: '10px' }}>
      <div className="keypad-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', maxWidth: '320px', margin: '0 auto' }}>
        {digits.map((d) => (
          <button
            key={d}
            type="button"
            className="btn btn-secondary key-btn"
            disabled={disabled}
            onClick={() => onDigit(d)}
            style={{ fontSize: '16px', fontWeight: 700, padding: '10px' }}
          >
            {d}
          </button>
        ))}
      </div>
      <div className="keypad-actions" style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '8px', maxWidth: '320px', margin: '8px auto 0' }}>
        <button
          type="button"
          className="btn btn-secondary action-btn"
          disabled={disabled}
          onClick={onBackspace}
          title="Backspace"
          style={{ flex: 1 }}
        >
          ⌫ Back
        </button>
        <button
          type="button"
          className="btn btn-secondary action-btn"
          disabled={disabled}
          onClick={onClear}
          style={{ flex: 1 }}
        >
          Clear
        </button>
        <button
          type="button"
          className="btn btn-primary action-btn"
          disabled={disabled}
          onClick={onSubmit}
          style={{ flex: 1.5 }}
        >
          Submit ↵
        </button>
      </div>
    </div>
  );
}
