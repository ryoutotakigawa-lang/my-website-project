import React, { useState } from 'react';
import { CONTENT_TYPES, PLATFORMS } from '../constants';

export default function BufferTab({ posts, bufferCounts, setBufferCounts }) {
  const [toast, setToast] = useState('');
  const [selectedPosts, setSelectedPosts] = useState([]);
  const MAX_BUFFER = 10;
  const WARNING_THRESHOLD = 7;
  const platformCounts = bufferCounts || { instagram: 0, tiktok: 0, x: 0, youtube: 0 };

  const upcomingPosts = posts
    .filter(p => { const d = new Date(p.date + 'T00:00:00'); return d >= new Date(new Date().toDateString()); })
    .sort((a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time));

  const togglePost = (postId) => {
    setSelectedPosts(prev => prev.includes(postId) ? prev.filter(id => id !== postId) : [...prev, postId]);
  };

  const handleExport = () => {
    if (selectedPosts.length === 0) { showToast('⚠️ エクスポートする投稿を選択してください'); return; }
    const exportPosts = posts.filter(p => selectedPosts.includes(p.id));
    const newCounts = { ...platformCounts };
    const platformToExport = {};
    exportPosts.forEach(p => { platformToExport[p.platform] = (platformToExport[p.platform] || 0) + 1; });
    for (const [platform, count] of Object.entries(platformToExport)) {
      if ((newCounts[platform] || 0) + count > MAX_BUFFER) {
        const pl = PLATFORMS.find(plt => plt.id === platform);
        showToast(`❌ ${pl?.label || platform} の上限（${MAX_BUFFER}件）を超えます`); return;
      }
      newCounts[platform] = (newCounts[platform] || 0) + count;
    }
    const exportText = exportPosts.map(p => {
      const ct = CONTENT_TYPES.find(c => c.id === p.contentType);
      const pl = PLATFORMS.find(plt => plt.id === p.platform);
      return `[${p.date} ${p.time}] ${pl?.label || p.platform} | ${ct?.label || ''}\n${p.caption || '(キャプションなし)'}\n`;
    }).join('\n---\n\n');
    navigator.clipboard.writeText(exportText).then(() => {
      setBufferCounts(newCounts); setSelectedPosts([]);
      showToast(`✅ ${exportPosts.length}件をコピーしました`);
    }).catch(() => showToast('⚠️ コピーに失敗しました'));
  };

  const handleReset = (platformId) => {
    if (platformId) { setBufferCounts({ ...platformCounts, [platformId]: 0 }); }
    else { setBufferCounts({ instagram: 0, tiktok: 0, x: 0, youtube: 0 }); }
    showToast('🔄 カウントをリセットしました');
  };

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  return (
    <div>
      <div className="card">
        <div className="card-title" style={{justifyContent:'space-between'}}>
          <span>🚀 Buffer連携 ＆ 枠数管理</span>
          <button className="btn btn-sm btn-secondary" onClick={() => handleReset(null)}>全リセット</button>
        </div>
        <p className="text-xs text-muted mb-16">Buffer無料プラン（最大3アカウント、各10件）の予約状況を管理します。</p>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:20}}>
          {PLATFORMS.map(pl => {
            const count = platformCounts[pl.id] || 0;
            const remaining = MAX_BUFFER - count;
            const percent = Math.min((count / MAX_BUFFER) * 100, 100);
            const color = count >= MAX_BUFFER ? '#ef4444' : count >= WARNING_THRESHOLD ? '#f59e0b' : '#10b981';
            return (
              <div key={pl.id} style={{background:'rgba(255,255,255,0.02)',padding:12,borderRadius:'var(--radius-sm)',border:'1px solid var(--border-color)'}}>
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-6">
                    <span className={`platform-icon ${pl.className}`} style={{width:20,height:20,fontSize:'0.6rem'}}>{pl.icon}</span>
                    <span style={{fontSize:'0.8rem',fontWeight:600}}>{pl.label}</span>
                  </div>
                  <span style={{fontSize:'0.75rem',fontWeight:700,color}}>{count} / {MAX_BUFFER}</span>
                </div>
                <div className="buffer-gauge" style={{height:6,marginBottom:8}}>
                  <div className="buffer-gauge-fill" style={{width:`${percent}%`,background:color}} />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted">残り {remaining}</span>
                  <button className="text-xs" style={{background:'none',border:'none',color:'var(--accent-purple)',cursor:'pointer',padding:0}}
                    onClick={() => handleReset(pl.id)}>リセット</button>
                </div>
              </div>
            );
          })}
        </div>

        <hr style={{border:'none',borderTop:'1px solid var(--border-color)',margin:'20px 0'}} />
        <div className="card-title" style={{fontSize:'0.9rem',marginBottom:12}}>📤 エクスポートする投稿を選択</div>

        {upcomingPosts.length === 0 ? (
          <div className="empty-state" style={{padding:24}}>
            <div className="empty-icon">📭</div>
            <p>今後の投稿がありません。スケジュールから追加してください。</p>
          </div>
        ) : (
          <div style={{maxHeight:400,overflowY:'auto',paddingRight:8}}>
            {upcomingPosts.map(post => {
              const ct = CONTENT_TYPES.find(c => c.id === post.contentType);
              const pl = PLATFORMS.find(p => p.id === post.platform);
              const isSelected = selectedPosts.includes(post.id);
              return (
                <div key={post.id} onClick={() => togglePost(post.id)} style={{
                  padding:'12px 16px',margin:'6px 0',
                  background: isSelected ? 'rgba(139,92,246,0.12)' : 'rgba(255,255,255,0.02)',
                  border:`1px solid ${isSelected ? 'var(--accent-purple)' : 'var(--border-color)'}`,
                  borderRadius:'var(--radius-sm)',cursor:'pointer',transition:'var(--transition)',
                  display:'flex',alignItems:'center',gap:12}}>
                  <div style={{width:22,height:22,borderRadius:6,
                    border:`2px solid ${isSelected ? 'var(--accent-purple)' : 'var(--border-color)'}`,
                    background:isSelected?'var(--accent-purple)':'transparent',
                    display:'flex',alignItems:'center',justifyContent:'center',
                    fontSize:'0.7rem',color:'white',flexShrink:0}}>{isSelected && '✓'}</div>
                  <span className={`platform-icon ${pl?.className}`} style={{width:26,height:26,fontSize:'0.65rem',flexShrink:0}}>{pl?.icon}</span>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:'0.78rem',fontWeight:600}}>
                      {post.date} {post.time}
                      <span className={`badge ${ct?.badgeClass}`} style={{marginLeft:8}}>{ct?.emoji} {ct?.label}</span>
                    </div>
                    {post.caption && <div className="text-xs text-muted" style={{marginTop:4,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{post.caption}</div>}
                  </div>
                </div>
              );
            })}
            <div style={{marginTop:16,display:'flex',gap:8,alignItems:'center'}}>
              <button className="btn btn-primary" onClick={handleExport} disabled={selectedPosts.length===0}
                style={{opacity:selectedPosts.length===0?0.5:1}}>
                📋 選択した{selectedPosts.length}件をコピー
              </button>
              <span className="text-xs text-muted">→ Bufferに貼り付けて予約投稿</span>
            </div>
          </div>
        )}
      </div>
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
