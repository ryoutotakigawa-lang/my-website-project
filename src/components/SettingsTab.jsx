import React, { useState } from 'react';

export default function SettingsTab({ region, setRegion, geminiKey, setGeminiKey, onClearAll }) {
  const [showKey, setShowKey] = useState(false);

  return (
    <div>
      <div className="card">
        <div className="card-title">⚙️ 設定</div>
        <div className="form-group">
          <label className="form-label">ターゲット地域</label>
          <p className="text-xs text-muted mb-8">投稿時間の推奨やコンテンツの最適化に影響します。</p>
          <div className="region-toggle">
            <button className={`region-btn ${region==='japan'?'active':''}`} onClick={() => setRegion('japan')}>🇯🇵 日本向け</button>
            <button className={`region-btn ${region==='english'?'active':''}`} onClick={() => setRegion('english')}>🌎 英語圏向け</button>
          </div>
        </div>

        <hr style={{border:'none',borderTop:'1px solid var(--border-color)',margin:'20px 0'}} />

        <div className="form-group">
          <label className="form-label">Gemini APIキー</label>
          <p className="text-xs text-muted mb-8">
            AIローカライズ機能に必要です。
            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer"
              style={{color:'var(--accent-blue)',marginLeft:4}}>無料で取得 →</a>
          </p>
          <div style={{display:'flex',gap:8}}>
            <input type={showKey?'text':'password'} className="input" value={geminiKey}
              onChange={e => setGeminiKey(e.target.value)} placeholder="AIza..." style={{flex:1}} />
            <button className="btn btn-sm btn-secondary" onClick={() => setShowKey(!showKey)}>
              {showKey ? '🙈' : '👁'}
            </button>
          </div>
          {geminiKey && <div className="alert alert-success mt-8" style={{margin:'8px 0 0'}}>✅ APIキーが設定されています</div>}
        </div>

        <hr style={{border:'none',borderTop:'1px solid var(--border-color)',margin:'20px 0'}} />

        <div className="form-group">
          <label className="form-label">データ管理</label>
          <div className="alert alert-info" style={{margin:'8px 0 16px'}}>
            💡 すべてのデータはこのブラウザ内にのみ保存されています。
          </div>
          <button className="btn btn-danger" onClick={onClearAll}>🗑️ すべてのデータを削除</button>
        </div>
      </div>

      <div className="card" style={{background:'rgba(139,92,246,0.03)'}}>
        <div className="card-title" style={{fontSize:'0.9rem'}}>ℹ️ アプリについて</div>
        <div style={{fontSize:'0.78rem',color:'var(--text-secondary)',lineHeight:1.8}}>
          <p><strong>SNSマーケスケジューラー</strong></p>
          <p>Music Release Planner</p>
          <p style={{marginTop:8}}>
            完全フロントエンド完結のスタンドアローンWebアプリ。<br />
            サーバー代・API利用料は一切かかりません（維持費0円）。<br />
            データは各端末のブラウザ内にのみ保存されます。
          </p>
        </div>
      </div>
    </div>
  );
}
