import React, { useState, useEffect } from 'react';
import {
  syncAndLearnFromFeed,
  getLearnedStats,
  resetKnowledgeVault,
} from '../game/api/curriculumFeed.js';
import { getLearnedTemplates } from '../game/learning/curriculumVault.js';

export default function KnowledgeVaultModal({ isOpen, onClose }) {
  const [stats, setStats] = useState(getLearnedStats());
  const [templates, setTemplates] = useState([]);
  const [customUrl, setCustomUrl] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState(null);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      refreshData();
    }
  }, [isOpen]);

  const refreshData = () => {
    setStats(getLearnedStats());
    setTemplates(getLearnedTemplates());
  };

  const handleSyncDefault = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    try {
      const res = await syncAndLearnFromFeed('/curriculum_supplement.json');
      if (res.success) {
        setSyncMessage({
          type: 'success',
          text: `✓ Ingested ${res.ingested} official CA CCSS-M problems and synthesized ${res.templatesLearned} algorithmic templates!`,
        });
      } else {
        setSyncMessage({ type: 'error', text: res.error || 'Sync failed.' });
      }
    } catch (err) {
      setSyncMessage({ type: 'error', text: err.message || 'Error syncing feed.' });
    } finally {
      setIsSyncing(false);
      refreshData();
    }
  };

  const handleSyncCustom = async () => {
    if (!customUrl.trim()) return;
    setIsSyncing(true);
    setSyncMessage(null);
    try {
      const res = await syncAndLearnFromFeed(customUrl.trim());
      if (res.success) {
        setSyncMessage({
          type: 'success',
          text: `✓ Successfully learned from API: Ingested ${res.ingested} items and synthesized ${res.templatesLearned} templates!`,
        });
      } else {
        setSyncMessage({ type: 'error', text: res.error || 'Failed to ingest from custom endpoint.' });
      }
    } catch (err) {
      setSyncMessage({ type: 'error', text: err.message || 'Network error fetching custom API.' });
    } finally {
      setIsSyncing(false);
      refreshData();
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset the offline knowledge vault and clear all learned templates?')) {
      resetKnowledgeVault();
      refreshData();
      setSyncMessage({ type: 'info', text: 'Knowledge vault reset to default state.' });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content knowledge-vault-modal" style={{ maxWidth: '640px', width: '92%' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '24px' }}>🧠</span>
            <h2 style={{ margin: 0 }}>Curriculum Knowledge Vault & AI Learner</h2>
          </div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {/* Status banner */}
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              background: isOnline ? '#e6f4ea' : '#fce8e6',
              color: isOnline ? '#137333' : '#c5221f',
              fontWeight: 600,
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
            }}
          >
            <span>
              {isOnline ? '🌐 Connected to Internet (Live API Sync Active)' : '📴 Offline Mode (Generating via Invariant Algorithm & Learned Vault)'}
            </span>
            <span style={{ fontSize: '11px', padding: '2px 8px', background: 'rgba(0,0,0,0.06)', borderRadius: '12px' }}>
              {isOnline ? 'Online' : 'PWA Offline'}
            </span>
          </div>

          <p style={{ fontSize: '13px', color: '#555', marginTop: 0 }}>
            When connected online, the application pulls questions from educational feeds and APIs, validates them through the 
            <strong> Formal Mathematical Invariant Gate</strong>, extracts sentence schemas, and learns to generate brand-new variations offline.
          </p>

          {/* Vault metrics */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '10px',
              marginBottom: '16px',
            }}
          >
            <div style={{ background: '#f8f9fa', padding: '12px', borderRadius: '8px', textAlign: 'center', border: '1px solid #e0e0e0' }}>
              <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#1a73e8' }}>{stats.questionsCount}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>Questions Ingested</div>
            </div>
            <div style={{ background: '#f8f9fa', padding: '12px', borderRadius: '8px', textAlign: 'center', border: '1px solid #e0e0e0' }}>
              <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#188038' }}>{stats.templatesCount}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>Learned Templates</div>
            </div>
            <div style={{ background: '#f8f9fa', padding: '12px', borderRadius: '8px', textAlign: 'center', border: '1px solid #e0e0e0' }}>
              <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#e37400' }}>{stats.standardsCovered}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>Standards Covered</div>
            </div>
          </div>

          {syncMessage && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '6px',
                fontSize: '13px',
                marginBottom: '14px',
                background:
                  syncMessage.type === 'success'
                    ? '#e6f4ea'
                    : syncMessage.type === 'error'
                    ? '#fce8e6'
                    : '#e8f0fe',
                color:
                  syncMessage.type === 'success'
                    ? '#137333'
                    : syncMessage.type === 'error'
                    ? '#c5221f'
                    : '#1a73e8',
              }}
            >
              {syncMessage.text}
            </div>
          )}

          {/* Sync actions */}
          <div style={{ background: '#fafafa', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '14px', marginBottom: '16px' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>📡 Sync with California CCSS-M OER Feed</h4>
            <p style={{ fontSize: '12px', color: '#666', margin: '0 0 10px 0' }}>
              Download and verify benchmark problems from the California Elementary Math repository. All items are verified before storage.
            </p>
            <button
              className="btn btn-primary"
              onClick={handleSyncDefault}
              disabled={isSyncing || !isOnline}
              style={{ width: '100%', padding: '8px 12px', fontSize: '13px' }}
            >
              {isSyncing ? '⏳ Syncing and Extracting Templates...' : '⬇️ Ingest & Learn from California OER Feed'}
            </button>
          </div>

          {/* Custom API endpoint */}
          <div style={{ background: '#fafafa', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '14px', marginBottom: '16px' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>🔗 Ingest Custom API / JSON Feed</h4>
            <p style={{ fontSize: '12px', color: '#666', margin: '0 0 8px 0' }}>
              Connect to any classroom JSON feed or educational API. The engine will inspect and learn from valid problems.
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="url"
                placeholder="https://example.com/math-curriculum-feed.json"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                style={{ flex: 1, padding: '8px 10px', fontSize: '12px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
              <button
                className="btn btn-secondary"
                onClick={handleSyncCustom}
                disabled={isSyncing || !isOnline || !customUrl.trim()}
                style={{ padding: '8px 14px', fontSize: '12px', whiteSpace: 'nowrap' }}
              >
                Learn from URL
              </button>
            </div>
          </div>

          {/* Inspect learned templates */}
          <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '14px' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>🔬 Inspect Learned Problem Patterns ({templates.length})</h4>
            <p style={{ fontSize: '12px', color: '#666', margin: '0 0 10px 0' }}>
              These generalized algorithmic patterns were extracted from ingested questions and are synthesized into infinite randomized problems:
            </p>
            {templates.length === 0 ? (
              <div style={{ fontStyle: 'italic', fontSize: '12px', color: '#888', padding: '12px', textAlign: 'center' }}>
                No templates learned yet. Click "Ingest & Learn" above while online to populate!
              </div>
            ) : (
              <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {templates.slice(0, 10).map((t, idx) => (
                  <div key={idx} style={{ background: '#f5f5f5', padding: '8px 10px', borderRadius: '6px', fontSize: '12px' }}>
                    <div style={{ fontWeight: 600, color: '#1a73e8', marginBottom: '2px' }}>
                      Grade {t.grade} • Standard {t.standard} ({t.operation ? `Operation: ${t.operation}` : t.type})
                    </div>
                    <div style={{ color: '#333', fontStyle: 'italic' }}>
                      "{t.templateString || t.prompt}"
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderTop: '1px solid #e0e0e0' }}>
          <button
            onClick={handleReset}
            style={{
              background: 'transparent',
              color: '#d93025',
              border: 'none',
              cursor: 'pointer',
              fontSize: '12px',
              textDecoration: 'underline',
            }}
          >
            Clear Learned Vault
          </button>
          <button className="btn btn-primary" onClick={onClose} style={{ padding: '6px 18px' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
