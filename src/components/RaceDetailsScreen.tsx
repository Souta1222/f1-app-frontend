import React, { useState, useEffect } from 'react';

// 🟢 INTERNAL CONFIG
const API_BASE = 'https://isreal-falconiform-seasonedly.ngrok-free.dev';

export function RaceDetailsScreen({ raceId, onBack }: { raceId: string, onBack: () => void }) {
  // 1. Logic Validation
  const safeId = String(raceId || 'UNDEFINED');
  const parts = safeId.split('-');
  const year = parts[0] || 'N/A';
  const mode = safeId === '2025-summary' ? '2025' : (year === '2026' ? '2026' : 'FETCH');

  const [debugLog, setDebugLog] = useState<string[]>(['Component Mounted']);
  const [dataCount, setDataCount] = useState(0);

  const addLog = (msg: string) => setDebugLog(prev => [...prev, msg]);

  useEffect(() => {
    addLog(`Effect Triggered. Mode: ${mode}`);
    
    if (mode === 'FETCH') {
        addLog(`Fetching: ${API_BASE}/race_results?year=${year}`);
        fetch(`${API_BASE}/race_results?year=${year}&round=${parts[2] || '1'}`, {
            headers: { "ngrok-skip-browser-warning": "true" }
        })
        .then(res => res.json())
        .then(data => {
            addLog(`Fetch Success. Items: ${Array.isArray(data) ? data.length : 'Not Array'}`);
            setDataCount(Array.isArray(data) ? data.length : 0);
        })
        .catch(err => addLog(`Fetch Error: ${err.message}`));
    } else {
        addLog("Using Static Data (No Fetch)");
        setDataCount(mode === '2025' ? 9 : 0);
    }
  }, [mode, year]);

  // 🟢 RENDER - No fancy UI, just raw data to prove it works
  return (
    <div style={{ 
        position: 'fixed', inset: 0, zIndex: 9999, 
        backgroundColor: 'white', color: 'black', 
        padding: '20px', overflowY: 'auto' 
    }}>
      <button 
        onClick={onBack} 
        style={{ 
            padding: '10px 20px', backgroundColor: 'red', color: 'white', 
            fontWeight: 'bold', border: 'none', borderRadius: '5px', marginBottom: '20px'
        }}
      >
        ⬅️ BACK (Click to Exit)
      </button>

      <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>DEBUG DASHBOARD</h1>
      <hr style={{ margin: '10px 0' }} />

      <div style={{ backgroundColor: '#f0f0f0', padding: '10px', borderRadius: '5px' }}>
        <p><strong>Race ID:</strong> {safeId}</p>
        <p><strong>Detected Year:</strong> {year}</p>
        <p><strong>Detected Mode:</strong> {mode}</p>
        <p><strong>Data Count:</strong> {dataCount}</p>
      </div>

      <h3 style={{ marginTop: '20px', fontWeight: 'bold' }}>Logs:</h3>
      <div style={{ fontFamily: 'monospace', fontSize: '12px', border: '1px solid #ccc', padding: '10px' }}>
        {debugLog.map((log, i) => (
            <div key={i} style={{ marginBottom: '4px' }}>{i + 1}. {log}</div>
        ))}
      </div>

      {mode === '2026' && (
          <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#e0f2fe', borderRadius: '10px', textAlign: 'center' }}>
              <h2>📅 2026 PREVIEW MODE</h2>
              <p>If you can read this, 2026 is working.</p>
          </div>
      )}

      {mode === '2025' && (
          <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#dcfce7', borderRadius: '10px' }}>
              <h2>🏆 2025 SUMMARY MODE</h2>
              <p>Lando Norris (Example Data)</p>
              <p>Max Verstappen (Example Data)</p>
          </div>
      )}

    </div>
  );
}