import React, { useState } from 'react';

export default function HashtagsTab({ customTags, setCustomTags }) {
  const [copied, setCopied] = useState(false);
  const [copiedGroup, setCopiedGroup] = useState('');
  const [newTag, setNewTag] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);

  const tagGroups = {
    japanese: { title: '🇯🇵 日本語タグ', color: 'var(--accent-purple)',
      tags: ['#邦楽','#新曲','#MV公開','#音楽好きと繋がりたい','#邦ロック','#日本の音楽',
             '#アーティスト','#楽曲公開','#新曲リリース','#インディーズ','#音楽のある生活','#歌ってみた','#弾いてみた'] },
    trending: { title: '🔥 トレンドタグ', color: 'var(--accent-pink)',
      tags: ['#fyp','#viral','#newmusic','#musicvideo','#newrelease','#trending',
             '#explorepage','#foryou','#reels','#shorts','#musicislife','#nowplaying','#musicdiscovery'] },
    niche: { title: '🎯 ニッチタグ', color: 'var(--accent-cyan)',
      tags: ['#japanesemusic','#jmusic','#jpop','#jrock','#tokyomusic','#asianmusic',
             '#undergroundmusic','#indieartist','#musiccommunity','#supportindiemusic','#unsignedartist'] },
    release: { title: '🎵 リリースタグ', color: 'var(--accent-green)',
      tags: ['#outnow','#newsingle','#newalbum','#musicpremiere','#firstlisten',
             '#debut','#exclusive','#officialvideo','#linkinbio','#streaminglink','#presave'] },
  };

  const handleCopyGroup = (groupKey) => {
    navigator.clipboard.writeText(tagGroups[groupKey]?.tags.join(' ')).then(() => {
      setCopiedGroup(groupKey); setTimeout(() => setCopiedGroup(''), 2000);
    });
  };

  const handleCopySelected = () => {
    if (selectedTags.length === 0) return;
    navigator.clipboard.writeText(selectedTags.join(' ')).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    });
  };

  const toggleTag = (tag) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const handleAddCustomTag = () => {
    let tag = newTag.trim();
    if (!tag) return;
    if (!tag.startsWith('#')) tag = '#' + tag;
    if (!customTags.includes(tag)) setCustomTags([...customTags, tag]);
    setNewTag('');
  };

  const handleRemoveCustomTag = (tag) => {
    setCustomTags(customTags.filter(t => t !== tag));
    setSelectedTags(selectedTags.filter(t => t !== tag));
  };

  return (
    <div>
      <div className="card">
        <div className="card-title">#️⃣ ハッシュタグ管理</div>
        <p className="text-xs text-muted mb-16">カテゴリごとにワンクリックでコピー、または個別に選択してまとめてコピーできます。</p>

        {selectedTags.length > 0 && (
          <div style={{padding:12,background:'rgba(139,92,246,0.08)',borderRadius:'var(--radius-sm)',
            border:'1px solid rgba(139,92,246,0.2)',marginBottom:16}}>
            <div className="flex justify-between items-center mb-8">
              <span className="text-xs" style={{color:'var(--accent-purple)',fontWeight:600}}>選択中: {selectedTags.length}件</span>
              <div style={{display:'flex',gap:8}}>
                <button className="btn btn-sm btn-primary" onClick={handleCopySelected}>📋 まとめてコピー</button>
                <button className="btn btn-sm btn-secondary" onClick={() => setSelectedTags([])}>クリア</button>
              </div>
            </div>
            <div style={{fontSize:'0.75rem',color:'var(--text-secondary)',lineHeight:1.6,wordBreak:'break-all'}}>
              {selectedTags.join(' ')}
            </div>
          </div>
        )}

        {Object.entries(tagGroups).map(([key, group]) => (
          <div key={key} className="tag-group">
            <div className="flex justify-between items-center">
              <div className="tag-group-title" style={{color:group.color}}>{group.title}</div>
              <button className="btn btn-sm btn-secondary" onClick={() => handleCopyGroup(key)} style={{fontSize:'0.65rem'}}>
                {copiedGroup === key ? '✅ コピー済' : '📋 全コピー'}
              </button>
            </div>
            <div className="tag-list">
              {group.tags.map(tag => (
                <span key={tag} className={`tag ${selectedTags.includes(tag)?'selected':''}`} onClick={() => toggleTag(tag)}>{tag}</span>
              ))}
            </div>
          </div>
        ))}

        <div className="tag-group" style={{marginTop:20}}>
          <div className="tag-group-title" style={{color:'var(--accent-orange)'}}>⭐ カスタムタグ</div>
          <div className="tag-list">
            {customTags.map(tag => (
              <span key={tag} className={`tag ${selectedTags.includes(tag)?'selected':''}`}
                onClick={() => toggleTag(tag)} style={{position:'relative',paddingRight:24}}>
                {tag}
                <span onClick={(e) => { e.stopPropagation(); handleRemoveCustomTag(tag); }}
                  style={{position:'absolute',right:6,top:'50%',transform:'translateY(-50%)',
                    fontSize:'0.6rem',color:'var(--accent-red)',cursor:'pointer',
                    width:14,height:14,display:'flex',alignItems:'center',justifyContent:'center'}}>✕</span>
              </span>
            ))}
            {customTags.length === 0 && <span className="text-xs text-muted">カスタムタグはまだありません</span>}
          </div>
          <div style={{display:'flex',gap:8,marginTop:10}}>
            <input className="input" value={newTag} onChange={e => setNewTag(e.target.value)}
              placeholder="#カスタムタグ" onKeyDown={e => e.key==='Enter' && handleAddCustomTag()}
              style={{flex:1,maxWidth:250}} />
            <button className="btn btn-sm btn-secondary" onClick={handleAddCustomTag}>＋ 追加</button>
          </div>
        </div>
      </div>
      {copied && <div className="copy-indicator">📋 クリップボードにコピーしました</div>}
    </div>
  );
}
