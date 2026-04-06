import React, { useState } from 'react';
import { CONTENT_TYPES, PLATFORMS, OPTIMAL_TIMES, DAY_NAMES_JA, TIME_SLOTS } from '../constants';
import { getWeekDates, formatDate, isSameDay, generateId } from '../utils';

export default function ScheduleTab({ posts, setPosts, region }) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [toast, setToast] = useState('');

  const today = new Date();
  const baseDate = new Date(today);
  baseDate.setDate(today.getDate() + weekOffset * 7);
  const weekDates = getWeekDates(baseDate);

  const getPostsForCell = (date, time) => {
    const dateStr = formatDate(date);
    return posts.filter(p => p.date === dateStr && p.time === time);
  };

  const handleCellClick = (date, time) => {
    setEditingPost({
      id: generateId(), date: formatDate(date), time, platform: 'instagram',
      contentType: 'announce', caption: '', region
    });
    setShowModal(true);
  };

  const handleEventClick = (e, post) => {
    e.stopPropagation();
    setEditingPost({ ...post });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!editingPost) return;
    const exists = posts.find(p => p.id === editingPost.id);
    if (exists) {
      setPosts(posts.map(p => p.id === editingPost.id ? editingPost : p));
    } else {
      setPosts([...posts, editingPost]);
    }
    setShowModal(false);
    setEditingPost(null);
    showToastMsg('✅ 保存しました');
  };

  const handleDelete = () => {
    if (!editingPost) return;
    setPosts(posts.filter(p => p.id !== editingPost.id));
    setShowModal(false);
    setEditingPost(null);
    showToastMsg('🗑️ 削除しました');
  };

  const showToastMsg = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2000); };
  const optTimes = OPTIMAL_TIMES[region] || OPTIMAL_TIMES.japan;

  const getEventColor = (post) => {
    const ct = CONTENT_TYPES.find(c => c.id === post.contentType);
    const colors = {
      'badge-mv': 'rgba(139, 92, 246, 0.35)', 'badge-teaser': 'rgba(236, 72, 153, 0.35)',
      'badge-making': 'rgba(6, 182, 212, 0.35)', 'badge-behind': 'rgba(245, 158, 11, 0.35)',
      'badge-interview': 'rgba(16, 185, 129, 0.35)', 'badge-live': 'rgba(239, 68, 68, 0.35)',
      'badge-collab': 'rgba(59, 130, 246, 0.35)', 'badge-announce': 'rgba(168, 85, 247, 0.35)',
    };
    return colors[ct?.badgeClass] || 'rgba(139, 92, 246, 0.25)';
  };

  return (
    <div>
      <div className="card">
        <div className="card-title">📅 週間スケジュール</div>
        <div className="flex items-center justify-between mb-16">
          <div className="region-toggle">
            <span style={{padding:'6px 12px',fontSize:'0.75rem',color:'var(--text-secondary)'}}>推奨時間:</span>
            <span style={{padding:'6px 12px',fontSize:'0.75rem',color:'var(--accent-purple)'}}>
              {region === 'japan' ? '🇯🇵 日本' : '🌎 英語圏'}
            </span>
          </div>
        </div>

        <div className="week-nav">
          <button onClick={() => setWeekOffset(weekOffset - 1)}>◀</button>
          <span className="week-label">
            {weekDates[0].getMonth()+1}/{weekDates[0].getDate()} 〜 {weekDates[6].getMonth()+1}/{weekDates[6].getDate()}
          </span>
          <button onClick={() => setWeekOffset(0)} style={{fontSize:'0.7rem',width:'auto',padding:'0 12px',borderRadius:18}}>今週</button>
          <button onClick={() => setWeekOffset(weekOffset + 1)}>▶</button>
        </div>

        <div className="calendar-grid">
          <div className="calendar-header-cell"></div>
          {weekDates.map((d, i) => (
            <div key={i} className={`calendar-header-cell ${isSameDay(d, today) ? 'today' : ''}`}>
              <div>{DAY_NAMES_JA[d.getDay()]}</div>
              <div style={{fontSize:'1rem',fontWeight:700}}>{d.getDate()}</div>
            </div>
          ))}
          {TIME_SLOTS.map(time => (
            <React.Fragment key={time}>
              <div className="calendar-time-label">{time}</div>
              {weekDates.map((date, di) => {
                const cellPosts = getPostsForCell(date, time);
                const isOptimal = Object.values(optTimes).some(times => times.some(t => t.startsWith(time)));
                return (
                  <div key={di} className="calendar-cell" onClick={() => handleCellClick(date, time)}
                    style={isOptimal ? {background:'rgba(139,92,246,0.04)',borderLeft:'2px solid rgba(139,92,246,0.2)'} : {}}>
                    {cellPosts.map(post => {
                      const ct = CONTENT_TYPES.find(c => c.id === post.contentType);
                      const pl = PLATFORMS.find(p => p.id === post.platform);
                      return (
                        <div key={post.id} className="calendar-event" onClick={(e) => handleEventClick(e, post)}
                          style={{background: getEventColor(post)}}>
                          <span style={{marginRight:3}}>{pl?.icon}</span>
                          {ct?.emoji} {ct?.label?.slice(0,4)}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>

        <div className="mt-16" style={{display:'flex',flexWrap:'wrap',gap:8}}>
          <span className="text-xs text-muted" style={{marginRight:8}}>凡例:</span>
          {CONTENT_TYPES.map(ct => (
            <span key={ct.id} className={`badge ${ct.badgeClass}`}>{ct.emoji} {ct.label}</span>
          ))}
        </div>

        <div className="mt-16 card" style={{padding:16,background:'rgba(139,92,246,0.05)'}}>
          <div className="text-xs text-muted mb-8">💡 推奨投稿時間（{region === 'japan' ? '日本' : '英語圏'}）</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))',gap:8}}>
            {PLATFORMS.map(pl => (
              <div key={pl.id} style={{fontSize:'0.72rem'}}>
                <span className={`platform-icon ${pl.className}`} style={{width:20,height:20,fontSize:'0.6rem',marginRight:6}}>{pl.icon}</span>
                <span style={{color:'var(--text-secondary)'}}>{optTimes[pl.id]?.join(' / ')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showModal && editingPost && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            <h3 style={{fontSize:'1.1rem',fontWeight:700,marginBottom:20}}>
              {posts.find(p => p.id === editingPost.id) ? '📝 投稿を編集' : '➕ 新しい投稿'}
            </h3>
            <div className="form-group">
              <label className="form-label">日付</label>
              <input type="date" className="input" value={editingPost.date}
                onChange={e => setEditingPost({...editingPost, date: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">時間</label>
              <select className="select" value={editingPost.time}
                onChange={e => setEditingPost({...editingPost, time: e.target.value})}>
                {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">プラットフォーム</label>
              <div style={{display:'flex',gap:8}}>
                {PLATFORMS.map(pl => (
                  <button key={pl.id} className={`platform-icon ${pl.className}`}
                    style={{width:40,height:40,fontSize:'0.85rem',cursor:'pointer',
                      opacity: editingPost.platform === pl.id ? 1 : 0.3,
                      transform: editingPost.platform === pl.id ? 'scale(1.1)' : 'scale(1)',
                      transition:'var(--transition)'}}
                    onClick={() => setEditingPost({...editingPost, platform: pl.id})}>{pl.icon}</button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">コンテンツタイプ</label>
              <select className="select" value={editingPost.contentType}
                onChange={e => setEditingPost({...editingPost, contentType: e.target.value})}>
                {CONTENT_TYPES.map(ct => <option key={ct.id} value={ct.id}>{ct.emoji} {ct.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">キャプション / メモ</label>
              <textarea className="textarea" value={editingPost.caption || ''}
                onChange={e => setEditingPost({...editingPost, caption: e.target.value})}
                placeholder="投稿内容やメモを入力..." rows={3} />
            </div>
            <div style={{display:'flex',gap:8,marginTop:20}}>
              <button className="btn btn-primary" style={{flex:1}} onClick={handleSave}>💾 保存</button>
              {posts.find(p => p.id === editingPost.id) && (
                <button className="btn btn-danger" onClick={handleDelete}>🗑️ 削除</button>
              )}
            </div>
          </div>
        </div>
      )}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
