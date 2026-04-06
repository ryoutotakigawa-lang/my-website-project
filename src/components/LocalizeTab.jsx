import React, { useState } from 'react';
import { PLATFORMS } from '../constants';

export default function LocalizeTab({ geminiKey, setGeminiKey }) {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [targetPlatform, setTargetPlatform] = useState('instagram');

  const handleLocalize = async () => {
    if (!geminiKey) { setError('Gemini APIキーを設定画面で入力してください'); return; }
    if (!input.trim()) { setError('テキストを入力してください'); return; }

    setLoading(true); setError(''); setResult('');

    const prompt = `You are an expert social media marketer for the US/UK music market.

Task: Localize the following Japanese social media caption into natural, engaging English optimized for ${targetPlatform}.

Requirements:
1. Adapt the tone and style for Western ${targetPlatform} audiences
2. Use culturally relevant expressions and trending language
3. Optimize for the ${targetPlatform} algorithm (appropriate length, hooks, etc.)
4. Include 5-8 relevant English hashtags popular in the Western music scene
5. Keep emojis strategic and platform-appropriate
6. Add a compelling hook/first line to stop scrolling

Japanese caption:
${input}

Please provide:
1. **Localized Caption** (ready to post)
2. **Suggested Hashtags** (separated by spaces)
3. **Platform Tips** (1-2 brief optimization notes for ${targetPlatform})`;

    try {
     const res = await fetch(
  `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    })
  }
);

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error?.message || `API Error: ${response.status}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) { setResult(text); } else { throw new Error('レスポンスが空です'); }
    } catch (err) {
      setError(err.message || 'APIリクエストに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div>
      <div className="card">
        <div className="card-title">🌎 AIローカライズ（Gemini連携）</div>
        <p className="text-xs text-muted mb-16">
          日本語のキャプションを、英語圏のSNSアルゴリズムに最適化された英語に自動変換します。
        </p>

        {!geminiKey && (
          <div className="alert alert-warning">
            ⚠️ Gemini APIキーが未設定です。「⚙️ 設定」タブで入力してください。
          </div>
        )}

        <div className="form-group">
          <label className="form-label">対象プラットフォーム</label>
          <div style={{display:'flex',gap:8}}>
            {PLATFORMS.map(pl => (
              <button key={pl.id} className={`platform-icon ${pl.className}`}
                style={{width:40,height:40,fontSize:'0.85rem',cursor:'pointer',
                  opacity:targetPlatform===pl.id?1:0.3,
                  transform:targetPlatform===pl.id?'scale(1.1)':'scale(1)',
                  transition:'var(--transition)'}}
                onClick={() => setTargetPlatform(pl.id)}>{pl.icon}</button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">日本語キャプション</label>
          <textarea className="textarea" value={input} onChange={e => setInput(e.target.value)}
            placeholder="例：新曲「夜明けの歌」のMVが遂に完成！制作秘話はストーリーで公開中 🎬✨" rows={4} />
        </div>

        <button className="btn btn-primary w-full" onClick={handleLocalize} disabled={loading}
          style={{opacity:loading?0.7:1}}>
          {loading ? <span className="animate-pulse">🔄 変換中...</span> : '🚀 英語に最適化'}
        </button>

        {error && <div className="alert alert-danger mt-16">❌ {error}</div>}
      </div>

      {result && (
        <div className="card" style={{background:'rgba(16,185,129,0.03)'}}>
          <div className="card-title" style={{justifyContent:'space-between'}}>
            <span>✨ ローカライズ結果</span>
            <button className="btn btn-sm btn-secondary" onClick={handleCopy}>
              {copied ? '✅ コピー済み' : '📋 コピー'}
            </button>
          </div>
          <div style={{fontSize:'0.85rem',lineHeight:1.7,whiteSpace:'pre-wrap',color:'var(--text-primary)',
            padding:16,background:'rgba(255,255,255,0.03)',borderRadius:'var(--radius-sm)',
            border:'1px solid var(--border-color)'}}>
            {result}
          </div>
        </div>
      )}
      {copied && <div className="copy-indicator">📋 クリップボードにコピーしました</div>}
    </div>
  );
}
