import React, { useState } from 'react';
import { PLATFORMS } from '../constants';
import { formatDate, generateId } from '../utils';

export default function AnalyticsTab({ engageMemos, setEngageMemos }) {
  const [showForm, setShowForm] = useState(false);
  const [editingMemo, setEditingMemo] = useState(null);

  const emptyMemo = { id:'', date:formatDate(new Date()), platform:'instagram', postTitle:'', likes:'', views:'', comments:'', shares:'', insight:'' };

  const handleNew = () => { setEditingMemo({ ...emptyMemo, id: generateId() }); setShowForm(true); };
  const handleEdit = (memo) => { setEditingMemo({ ...memo }); setShowForm(true); };
  const handleSave = () => {
    if (!editingMemo) return;
    const exists = engageMemos.find(m => m.id === editingMemo.id);
    if (exists) setEngageMemos(engageMemos.map(m => m.id === editingMemo.id ? editingMemo : m));
    else setEngageMemos([...engageMemos, editingMemo]);
    setShowForm(false); setEditingMemo(null);
  };
  const handleDelete = (id) => { setEngageMemos(engageMemos.filter(m => m.id !== id)); };

  const platformStats = {};
  PLATFORMS.forEach(pl => {
    const plMemos = engageMemos.filter(m => m.platform === pl.id);
    if (plMemos.length === 0) return;
    const avg = (field) => {
      const vals = plMemos.map(m => Number(m[field]) || 0).filter(v => v > 0);
      return vals.length > 0 ? Math.round(vals.reduce((a,b) => a+b, 0) / vals.length) : 0;
    };
    platformStats[pl.id] = { count: plMemos.length, avgLikes: avg('likes'), avgViews: avg('views'), avgComments: avg('comments'), avgShares: avg('shares') };
  });

  return (
    <div>
      <div className="card">
        <div className="card-title" style={{justifyContent:'space-between'}}>
          <span>📊 分析メモ</span>
          <button className="btn btn-sm btn-primary" onClick={handleNew}>＋ 新規メモ</button>
        </div>
        <p className="text-xs text-muted mb-16">投稿後の反応を記録し、プラットフォームごとの平均値を自動集計します。</p>

        {Object.keys(platformStats).length > 0 && (
          <div style={{marginBottom:20}}>
            <div className="text-xs text-muted mb-8" style={{fontWeight:600}}>📈 プラットフォーム別平均値</div>
            <div className="stats-grid">
              {PLATFORMS.map(pl => {
                const stats = platformStats[pl.id];
                if (!stats) return null;
                return (
                  <div key={pl.id} className="stat-card" style={{textAlign:'left',padding:14}}>
                    <div className="flex items-center gap-8 mb-8">
                      <span className={`platform-icon ${pl.className}`} style={{width:24,height:24,fontSize:'0.6rem'}}>{pl.icon}</span>
                      <span style={{fontSize:'0.78rem',fontWeight:600}}>{pl.label}</span>
                      <span className="text-xs text-muted">({stats.count}件)</span>
                    </div>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6}}>
                      <div><div className="text-xs text-muted">♥ いいね</div><div style={{fontSize:'0.9rem',fontWeight:700,color:'var(--accent-pink)'}}>{stats.avgLikes.toLocaleString()}</div></div>
                      <div><div className="text-xs text-muted">👁 再生数</div><div style={{fontSize:'0.9rem',fontWeight:700,color:'var(--accent-blue)'}}>{stats.avgViews.toLocaleString()}</div></div>
                      <div><div className="text-xs text-muted">💬 コメント</div><div style={{fontSize:'0.9rem',fontWeight:700,color:'var(--accent-green)'}}>{stats.avgComments.toLocaleString()}</div></div>
                      <div><div className="text-xs text-muted">🔄 シェア</div><div style={{fontSize:'0.9rem',fontWeight:700,color:'var(--accent-orange)'}}>{stats.avgShares.toLocaleString()}</div></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {engageMemos.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">📝</div><p>まだ分析メモがありません。<br />投稿後の反応を記録して改善に活かしましょう。</p></div>
        ) : (
          <div>
            {engageMemos.slice().reverse().map(memo => {
              const pl = PLATFORMS.find(p => p.id === memo.platform);
              return (
                <div key={memo.id} style={{padding:16,margin:'8px 0',background:'rgba(255,255,255,0.02)',border:'1px solid var(--border-color)',borderRadius:'var(--radius-sm)'}}>
                  <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-8">
                      <span className={`platform-icon ${pl?.className}`} style={{width:24,height:24,fontSize:'0.6rem'}}>{pl?.icon}</span>
                      <span style={{fontWeight:600,fontSize:'0.85rem'}}>{memo.postTitle || '無題'}</span>
                      <span className="text-xs text-muted">{memo.date}</span>
                    </div>
                    <div style={{display:'flex',gap:6}}>
                      <button className="btn btn-sm btn-secondary" onClick={() => handleEdit(memo)}>✏️</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(memo.id)}>🗑️</button>
                    </div>
                  </div>
                  <div style={{display:'flex',gap:16,flexWrap:'wrap',fontSize:'0.75rem',marginBottom:8}}>
                    {memo.likes && <span>♥ {Number(memo.likes).toLocaleString()}</span>}
                    {memo.views && <span>👁 {Number(memo.views).toLocaleString()}</span>}
                    {memo.comments && <span>💬 {Number(memo.comments).toLocaleString()}</span>}
                    {memo.shares && <span>🔄 {Number(memo.shares).toLocaleString()}</span>}
                  </div>
                  {memo.insight && (
                    <div style={{fontSize:'0.78rem',color:'var(--text-secondary)',padding:'8px 12px',background:'rgba(139,92,246,0.05)',borderRadius:6,borderLeft:'3px solid var(--accent-purple)'}}>
                      💡 {memo.insight}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showForm && editingMemo && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowForm(false)}>✕</button>
            <h3 style={{fontSize:'1.1rem',fontWeight:700,marginBottom:20}}>📊 分析メモ</h3>
            <div className="form-group"><label className="form-label">日付</label>
              <input type="date" className="input" value={editingMemo.date} onChange={e => setEditingMemo({...editingMemo,date:e.target.value})} /></div>
            <div className="form-group"><label className="form-label">プラットフォーム</label>
              <div style={{display:'flex',gap:8}}>
                {PLATFORMS.map(pl => (
                  <button key={pl.id} className={`platform-icon ${pl.className}`}
                    style={{width:40,height:40,fontSize:'0.85rem',cursor:'pointer',opacity:editingMemo.platform===pl.id?1:0.3,
                      transform:editingMemo.platform===pl.id?'scale(1.1)':'scale(1)',transition:'var(--transition)'}}
                    onClick={() => setEditingMemo({...editingMemo,platform:pl.id})}>{pl.icon}</button>
                ))}
              </div>
            </div>
            <div className="form-group"><label className="form-label">投稿タイトル</label>
              <input className="input" value={editingMemo.postTitle} onChange={e => setEditingMemo({...editingMemo,postTitle:e.target.value})} placeholder="例：サビ15秒ティーザー" /></div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              <div className="form-group"><label className="form-label">♥ いいね数</label><input type="number" className="input" value={editingMemo.likes} onChange={e => setEditingMemo({...editingMemo,likes:e.target.value})} placeholder="0" /></div>
              <div className="form-group"><label className="form-label">👁 再生数</label><input type="number" className="input" value={editingMemo.views} onChange={e => setEditingMemo({...editingMemo,views:e.target.value})} placeholder="0" /></div>
              <div className="form-group"><label className="form-label">💬 コメント</label><input type="number" className="input" value={editingMemo.comments} onChange={e => setEditingMemo({...editingMemo,comments:e.target.value})} placeholder="0" /></div>
              <div className="form-group"><label className="form-label">🔄 シェア</label><input type="number" className="input" value={editingMemo.shares} onChange={e => setEditingMemo({...editingMemo,shares:e.target.value})} placeholder="0" /></div>
            </div>
            <div className="form-group"><label className="form-label">💡 インサイト</label>
              <textarea className="textarea" value={editingMemo.insight} onChange={e => setEditingMemo({...editingMemo,insight:e.target.value})}
                placeholder="例：サビのフック部分が Reels のアルゴリズムにマッチ" rows={3} /></div>
            <button className="btn btn-primary w-full" onClick={handleSave} style={{marginTop:12}}>💾 保存</button>
          </div>
        </div>
      )}
    </div>
  );
}
