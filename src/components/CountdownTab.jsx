import React from 'react';
import { COUNTDOWN_TASKS, PLATFORMS, DAY_NAMES_JA } from '../constants';
import { isSameDay } from '../utils';

export default function CountdownTab({ releaseDate, setReleaseDate }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const relDate = releaseDate ? new Date(releaseDate + 'T00:00:00') : null;
  const daysUntil = relDate ? Math.ceil((relDate - today) / (1000 * 60 * 60 * 24)) : null;

  return (
    <div>
      <div className="card">
        <div className="card-title">⏳ カウントダウン計画</div>
        <div className="form-group">
          <label className="form-label">リリース日を設定</label>
          <input type="date" className="input" value={releaseDate || ''}
            onChange={e => setReleaseDate(e.target.value)} style={{maxWidth:250}} />
        </div>
        {relDate && (
          <div className="stats-grid" style={{marginTop:16}}>
            <div className="stat-card">
              <div className="stat-value">
                {daysUntil > 0 ? daysUntil : daysUntil === 0 ? '🎉' : Math.abs(daysUntil)}
              </div>
              <div className="stat-label">
                {daysUntil > 0 ? '日後にリリース' : daysUntil === 0 ? '今日がリリース日！' : '日前にリリース済み'}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{fontSize:'1rem'}}>
                {relDate.getFullYear()}/{relDate.getMonth()+1}/{relDate.getDate()}
              </div>
              <div className="stat-label">リリース日</div>
            </div>
          </div>
        )}
      </div>

      {relDate ? (
        <div className="card">
          <div className="card-title">🗺️ 戦略タイムライン</div>
          <p className="text-xs text-muted mb-16">
            リリース日を基準に、2週間前〜1週間後の推奨アクションを自動生成しています。
          </p>
          <div className="timeline">
            {COUNTDOWN_TASKS.map((phase, idx) => {
              const phaseDate = new Date(relDate);
              phaseDate.setDate(relDate.getDate() + phase.day);
              const isPast = phaseDate < today;
              const isToday = isSameDay(phaseDate, today);
              return (
                <div key={idx} className={`timeline-item ${isPast ? 'past' : ''} ${isToday ? 'today-item' : ''}`}>
                  <div className="timeline-day-label">
                    {phase.label}
                    <span style={{marginLeft:8,fontSize:'0.65rem',color:'var(--text-muted)',fontWeight:400}}>
                      {phaseDate.getMonth()+1}/{phaseDate.getDate()}({DAY_NAMES_JA[phaseDate.getDay()]})
                    </span>
                    {isToday && (
                      <span style={{marginLeft:8,padding:'2px 8px',background:'rgba(16,185,129,0.2)',
                        color:'#34d399',borderRadius:12,fontSize:'0.62rem',fontWeight:600}}>TODAY</span>
                    )}
                  </div>
                  {phase.tasks.map((task, ti) => {
                    const pl = PLATFORMS.find(p => p.id === task.platform);
                    return (
                      <div key={ti} style={{display:'flex',alignItems:'flex-start',gap:8,marginBottom:6,opacity:isPast?0.5:1}}>
                        <span className={`platform-icon ${pl?.className}`}
                          style={{width:22,height:22,fontSize:'0.55rem',flexShrink:0,marginTop:1}}>{pl?.icon}</span>
                        <span style={{lineHeight:1.4}}>{task.text}</span>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <p>リリース日を設定すると、<br />戦略タイムラインが自動生成されます</p>
          </div>
        </div>
      )}
    </div>
  );
}
