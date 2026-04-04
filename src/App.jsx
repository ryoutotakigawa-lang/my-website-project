/**
 * SNSマーケスケジューラー — コる九音楽祭 完全版
 * 6SNS対応: Instagram / TikTok / X / YouTube / Threads / Facebook
 * React 18 + Vite + localStorage + Gemini API + Buffer枠管理
 *
 * 【Vercelデプロイ手順】
 * 1. このファイルを src/App.jsx として保存
 * 2. index.html の <head> に追加:
 *    <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
 *    <meta name="apple-mobile-web-app-capable" content="yes">
 *    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
 *    <meta name="theme-color" content="#090910">
 * 3. GitHub push → Vercel 自動デプロイ → URL をパートナーに共有
 */

import { useState, useEffect } from "react";

// ══════════════════════════════════════════════════════════
// 定数
// ══════════════════════════════════════════════════════════

const PLATFORMS = [
  { id:"instagram", name:"Instagram",   short:"IG", color:"#E1306C", icon:"📸" },
  { id:"tiktok",    name:"TikTok",      short:"TT", color:"#69C9D0", icon:"🎵" },
  { id:"twitter",   name:"X (Twitter)", short:"X",  color:"#1DA1F2", icon:"✦"  },
  { id:"youtube",   name:"YouTube",     short:"YT", color:"#FF0000", icon:"▶"  },
  { id:"threads",   name:"Threads",     short:"TH", color:"#AAAAAA", icon:"🧵" },
  { id:"facebook",  name:"Facebook",    short:"FB", color:"#1877F2", icon:"👥" },
];

const BEST_TIMES = {
  jp: {
    instagram:["18:00","21:00","12:00"], tiktok:["19:00","23:00","15:00"],
    twitter:  ["12:00","18:00","22:00"], youtube:["20:00","14:00","17:00"],
    threads:  ["19:00","12:00","21:00"], facebook:["19:00","13:00","20:00"],
  },
  en: {
    instagram:["11:00","14:00","17:00"], tiktok:["07:00","20:00","18:00"],
    twitter:  ["09:00","12:00","17:00"], youtube:["15:00","20:00","12:00"],
    threads:  ["10:00","14:00","18:00"], facebook:["13:00","19:00","10:00"],
  },
};

const POST_TYPES = [
  { id:"mv",     label:"MV公開",     emoji:"🎬", color:"#ff6b6b" },
  { id:"teaser", label:"ティーザー", emoji:"⚡", color:"#ffd93d" },
  { id:"behind", label:"メイキング", emoji:"🎭", color:"#6bcb77" },
  { id:"story",  label:"ストーリー", emoji:"✨", color:"#4d96ff" },
  { id:"collab", label:"コラボ告知", emoji:"🤝", color:"#c77dff" },
  { id:"engage", label:"エンゲージ", emoji:"💬", color:"#ff9a3c" },
  { id:"live",   label:"ライブ告知", emoji:"🔴", color:"#ff4444" },
  { id:"repost", label:"リポスト",   emoji:"🔁", color:"#44ddaa" },
];

const HASHTAG_SETS = {
  jp_music: ["#新曲","#オリジナル曲","#MV公開","#邦楽","#音楽好きと繋がりたい","#歌ってみた","#弾いてみた","#作曲","#lyric"],
  trending: ["#fyp","#foryou","#viral","#music","#newmusic","#indie","#artist","#nowplaying","#spotify"],
  niche:    ["#シンガーソングライター","#インディーズ","#自主制作","#DTM","#宅録","#バンド活動","#音楽制作"],
  release:  ["#リリース","#新曲リリース","#MV","#musicvideo","#debut","#streaming","#AppleMusic"],
  threads:  ["#Threads","#ThreadsMusic","#音楽Threads","#新曲情報","#アーティスト","#musicthread"],
  facebook: ["#Facebook音楽","#新曲公開","#MV公開","#邦楽","#音楽好き","#フォローミー","#musicvideo"],
};

const DAYS = ["日","月","火","水","木","金","土"];

const COUNTDOWN_PLAN = [
  { day:-14, phase:"2週間前",         color:"#6bcb77", tasks:["キービジュアル決定","ティーザー動画撮影","プレスリリース草稿"] },
  { day:-7,  phase:"1週間前",         color:"#4d96ff", tasks:["ティーザー全SNS投稿","TikTokに15秒サビ","予約リンク設置"] },
  { day:-3,  phase:"3日前",           color:"#ffd93d", tasks:["メイキング映像をIG Stories","カウントダウンステッカー","X感謝メッセージ"] },
  { day:-1,  phase:"前日",            color:"#ff9a3c", tasks:["全SNSで明日公開の予告","ファンへのDM/リプ返し","再生回数目標を宣言"] },
  { day: 0,  phase:"リリース当日 🎉", color:"#ff3d6e", tasks:["YouTube MV公開","TikTok歌唱/ダンス動画","全SNS一斉告知","ライブ配信でお礼"] },
  { day: 1,  phase:"翌日",            color:"#c77dff", tasks:["ストリーミング数報告","リアクション動画紹介","コメント返し配信"] },
  { day: 7,  phase:"1週間後",         color:"#ff6b6b", tasks:["チャート結果報告","ファンのリポスト紹介","次回予告をほのめかす"] },
];

const BUFFER_MAX  = 10;
const BUFFER_WARN = 7;

// ══════════════════════════════════════════════════════════
// localStorage
// ══════════════════════════════════════════════════════════
const LS = {
  get: (key, fb) => { try { const v = localStorage.getItem(key); return v !== null ? JSON.parse(v) : fb; } catch { return fb; } },
  set: (key, v)  => { try { localStorage.setItem(key, JSON.stringify(v)); } catch {} },
};
const KEYS = {
  posts:        "kuru_posts",
  memos:        "kuru_memos",
  customTags:   "kuru_customTags",
  releaseDate:  "kuru_releaseDate",
  region:       "kuru_region",
  geminiKey:    "kuru_geminiKey",
  bufferCounts: "kuru_bufferCounts",
};

const INIT_BUFFER = { instagram:0, tiktok:0, twitter:0, youtube:0, threads:0, facebook:0 };

// ══════════════════════════════════════════════════════════
// Gemini API
// ══════════════════════════════════════════════════════════
async function aiLocalize(text, platform, apiKey) {
  if (!apiKey) throw new Error("APIキーを設定してください");
  const prompt = `You are a music marketing expert localizing Japanese artist content for English-speaking audiences (US, UK, Australia, Canada).
Translate and optimize this caption for ${platform}. Make it culturally resonant, natural, platform-optimized. Include 3-5 hashtags.
Japanese: "${text}"
Respond ONLY with valid JSON (no markdown): {"translated":"...","hashtags":["#..."],"tip":"..."}`;
  const res = await fetch(
  `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    { method:"POST", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({ contents:[{parts:[{text:prompt}]}], generationConfig:{response_mime_type:"application/json"} }) }
  );
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return JSON.parse(data.candidates[0].content.parts[0].text.replace(/```json|```/g,"").trim());
}

// ══════════════════════════════════════════════════════════
// ユーティリティ
// ══════════════════════════════════════════════════════════
const fmt     = d => `${d.getMonth()+1}/${d.getDate()}`;
const dateKey = d => d.toISOString().split("T")[0];
const isToday = d => dateKey(d) === dateKey(new Date());

function getWeekDates(offset = 0) {
  const now = new Date();
  const mon = new Date(now);
  mon.setDate(now.getDate() - now.getDay() + 1 + offset * 7);
  return Array.from({length:7}, (_,i) => { const d = new Date(mon); d.setDate(mon.getDate()+i); return d; });
}

// iPhone セーフエリア
const SA = {
  top:    "env(safe-area-inset-top, 0px)",
  bottom: "env(safe-area-inset-bottom, 0px)",
};
// Apple HIG タップ最小44px
const TAP = { minHeight:44, display:"flex", alignItems:"center", justifyContent:"center" };

// ══════════════════════════════════════════════════════════
// Buffer スロットメーター コンポーネント
// ══════════════════════════════════════════════════════════
function BufferSlotMeter({ platform, count, onExport, onReset }) {
  const remaining = BUFFER_MAX - count;
  const pct       = (count / BUFFER_MAX) * 100;
  const isWarn    = count >= BUFFER_WARN;
  const isFull    = count >= BUFFER_MAX;
  const barColor  = isFull ? "#ff3d6e" : isWarn ? "#ffd93d" : "#6bcb77";

  return (
    <div style={{ background:`${platform.color}10`, border:`1px solid ${platform.color}30`, borderRadius:14, padding:"12px 14px", marginBottom:10 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:20 }}>{platform.icon}</span>
          <div>
            <div style={{ fontSize:13, fontWeight:800, color:platform.color }}>{platform.name}</div>
            <div style={{ fontSize:10, color:"#555" }}>Buffer予約枠</div>
          </div>
        </div>
        <div style={{ textAlign:"right" }}>
          <div style={{ fontSize:24, fontWeight:900, color:barColor, lineHeight:1 }}>
            {isFull ? "🚫" : count}
            <span style={{ fontSize:12, color:"#555", fontWeight:400 }}>/{BUFFER_MAX}</span>
          </div>
          <div style={{ fontSize:10, color:isWarn ? "#ffd93d" : "#555" }}>
            {isFull ? "上限到達" : `残り${remaining}件`}
          </div>
        </div>
      </div>

      {/* プログレスバー */}
      <div style={{ height:5, background:"rgba(255,255,255,0.07)", borderRadius:3, marginBottom:10, overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${pct}%`, background:barColor, borderRadius:3, transition:"width 0.4s" }} />
      </div>

      {/* アラートバナー */}
      {isWarn && !isFull && (
        <div style={{ background:"rgba(255,211,61,0.12)", border:"1px solid rgba(255,211,61,0.3)", borderRadius:9, padding:"8px 10px", marginBottom:10 }}>
          <div style={{ fontSize:11, color:"#ffd93d", lineHeight:1.5 }}>
            ⚠️ 残り<strong>{remaining}枠</strong>です。投稿完了後に「リセット」で枠を回収してください。
          </div>
        </div>
      )}
      {isFull && (
        <div style={{ background:"rgba(255,61,110,0.12)", border:"1px solid rgba(255,61,110,0.3)", borderRadius:9, padding:"8px 10px", marginBottom:10 }}>
          <div style={{ fontSize:11, color:"#ff6b6b", lineHeight:1.5 }}>
            🚫 空き枠がありません。投稿完了後にリセットしてから追加予約してください。
          </div>
        </div>
      )}

      <div style={{ display:"flex", gap:8 }}>
        <button disabled={isFull} onClick={onExport}
          style={{ flex:2, ...TAP, background:isFull?"rgba(255,255,255,0.04)":"linear-gradient(135deg,#ff3d6e,#ff6b42)",
            border:"none", color:isFull?"#444":"#fff", borderRadius:10, fontSize:12, fontWeight:800,
            cursor:isFull?"not-allowed":"pointer" }}>
          {isFull ? "🚫 上限到達" : "📋 Bufferへコピー"}
        </button>
        <button onClick={onReset}
          style={{ flex:1, ...TAP, background:"rgba(107,203,119,0.12)", border:"1px solid rgba(107,203,119,0.3)",
            color:"#6bcb77", borderRadius:10, fontSize:12, fontWeight:800, cursor:"pointer" }}>
          ↩️ リセット
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// メイン App
// ══════════════════════════════════════════════════════════
export default function App() {

  // ── State ─────────────────────────────────────────────
  const [tab,           setTab]          = useState("schedule");
  const [region,        setRegion]       = useState(() => LS.get(KEYS.region, "jp"));
  const [weekOffset,    setWeekOffset]   = useState(0);
  const [posts,         setPosts]        = useState(() => LS.get(KEYS.posts, {}));
  const [releaseDate,   setReleaseDate]  = useState(() => LS.get(KEYS.releaseDate, ""));
  const [countdown,     setCountdown]    = useState(null);

  // 投稿フォーム
  const [showForm,      setShowForm]     = useState(null);
  const [form,          setForm]         = useState({ platform:"instagram", type:"mv", time:"18:00", note:"", enCaption:"" });
  const [localizing,    setLocalizing]   = useState(false);
  const [localResult,   setLocalResult]  = useState(null);
  const [localError,    setLocalError]   = useState("");

  // ハッシュタグ
  const [selTags,       setSelTags]      = useState([]);
  const [openSec,       setOpenSec]      = useState(null);
  const [customTag,     setCustomTag]    = useState("");
  const [customTags,    setCustomTags]   = useState(() => LS.get(KEYS.customTags, []));
  const [copied,        setCopied]       = useState(false);

  // 分析メモ
  const [memos,         setMemos]        = useState(() => LS.get(KEYS.memos, []));
  const [showMemoForm,  setShowMemoForm] = useState(false);
  const [memoForm,      setMemoForm]     = useState({ platform:"instagram", date:"", likes:"", comments:"", shares:"", views:"", follows:"", note:"" });

  // Gemini APIキー
  const [geminiKey,     setGeminiKey]    = useState(() => LS.get(KEYS.geminiKey, ""));
  const [geminiInput,   setGeminiInput]  = useState(() => LS.get(KEYS.geminiKey, ""));
  const [showApiModal,  setShowApiModal] = useState(false);

  // Buffer スロット
  const [bufferCounts,  setBufferCounts] = useState(() => LS.get(KEYS.bufferCounts, INIT_BUFFER));
  const [bufferSub,     setBufferSub]    = useState("slots");

  const weekDates = getWeekDates(weekOffset);
  const today     = new Date();

  // ── localStorage 自動保存 ──────────────────────────────
  useEffect(() => { LS.set(KEYS.posts,        posts);        }, [posts]);
  useEffect(() => { LS.set(KEYS.memos,        memos);        }, [memos]);
  useEffect(() => { LS.set(KEYS.customTags,   customTags);   }, [customTags]);
  useEffect(() => { LS.set(KEYS.releaseDate,  releaseDate);  }, [releaseDate]);
  useEffect(() => { LS.set(KEYS.region,       region);       }, [region]);
  useEffect(() => { LS.set(KEYS.bufferCounts, bufferCounts); }, [bufferCounts]);

  // ── カウントダウン ─────────────────────────────────────
  useEffect(() => {
    if (!releaseDate) return setCountdown(null);
    setCountdown(Math.ceil((new Date(releaseDate) - new Date()) / 86400000));
  }, [releaseDate]);

  // ── ヘルパー ──────────────────────────────────────────
  const platInfo   = id => PLATFORMS.find(p => p.id === id);
  const typeInfo   = id => POST_TYPES.find(t => t.id === id);
  const bestTimes  = id => (BEST_TIMES[region] || {})[id] || [];
  const getCDDate  = offset => {
    if (!releaseDate) return null;
    const d = new Date(releaseDate);
    d.setDate(d.getDate() + offset);
    return d;
  };

  // 投稿
  const openAddForm = dateStr => {
    setShowForm(dateStr);
    setForm({ platform:"instagram", type:"mv", time: bestTimes("instagram")[0] || "18:00", note:"", enCaption:"" });
    setLocalResult(null); setLocalError("");
  };
  const savePost = () => {
    if (!showForm) return;
    setPosts(p => ({ ...p, [showForm]: [...(p[showForm]||[]), { ...form, enCaption: localResult?.translated || form.enCaption, id: Date.now() }] }));
    setShowForm(null); setLocalResult(null);
  };
  const deletePost = (dateStr, id) => {
    if (!window.confirm("この投稿を削除しますか？")) return;
    setPosts(p => ({ ...p, [dateStr]: p[dateStr].filter(x => x.id !== id) }));
  };

  // ハッシュタグ
  const toggleTag = tag => setSelTags(p => p.includes(tag) ? p.filter(t => t !== tag) : [...p, tag]);
  const copyTags  = ()  => { navigator.clipboard.writeText(selTags.join(" ")); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const addCustom = ()  => {
    if (!customTag.trim()) return;
    const t = customTag.startsWith("#") ? customTag.trim() : `#${customTag.trim()}`;
    if (!customTags.includes(t)) setCustomTags(p => [...p, t]);
    setCustomTag("");
  };

  // メモ
  const saveMemo = () => {
    setMemos(p => [...p, { ...memoForm, id: Date.now() }]);
    setMemoForm({ platform:"instagram", date:"", likes:"", comments:"", shares:"", views:"", follows:"", note:"" });
    setShowMemoForm(false);
  };

  // Gemini
  const saveGeminiKey = () => { LS.set(KEYS.geminiKey, geminiInput); setGeminiKey(geminiInput); setShowApiModal(false); };
  const handleLocalize = async () => {
    if (!form.note.trim()) return;
    if (!geminiKey) { setShowApiModal(true); return; }
    setLocalizing(true); setLocalError("");
    try { setLocalResult(await aiLocalize(form.note, platInfo(form.platform)?.name || "social media", geminiKey)); }
    catch(e) { setLocalError("エラー: " + e.message); }
    setLocalizing(false);
  };

  // Buffer
  const bufferExport = pid => {
    const cur = bufferCounts[pid] || 0;
    if (cur >= BUFFER_MAX) return;
    const allForPlat = Object.entries(posts)
      .flatMap(([d, ps]) => ps.map(p => ({ ...p, date:d })))
      .filter(p => p.platform === pid)
      .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
    const cap = allForPlat[0]?.enCaption || allForPlat[0]?.note || `${platInfo(pid)?.name} 投稿`;
    navigator.clipboard.writeText(cap);
    setBufferCounts(prev => ({ ...prev, [pid]: Math.min(BUFFER_MAX, (prev[pid]||0) + 1) }));
  };
  const bufferReset = pid => {
    if (!window.confirm(`${platInfo(pid)?.name} のBufferカウントをリセットしますか？\n（実際の投稿が完了した後に行ってください）`)) return;
    setBufferCounts(prev => ({ ...prev, [pid]: 0 }));
  };

  // 統計
  const platCounts = PLATFORMS.map(p => ({ ...p, count: Object.values(posts).flat().filter(x => x.platform === p.id).length }));
  const totalWarn  = PLATFORMS.filter(p => (bufferCounts[p.id]||0) >= BUFFER_WARN).length;
  const totalFull  = PLATFORMS.filter(p => (bufferCounts[p.id]||0) >= BUFFER_MAX).length;

  // ── 共通スタイル ──────────────────────────────────────
  const inp  = { background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:12, padding:"12px 14px", color:"#fff", fontSize:16, outline:"none", WebkitAppearance:"none" };
  const pBtn = (active, color) => ({ ...TAP, background:active ? `${color}25` : "rgba(255,255,255,0.05)", border:`1px solid ${active ? color : "rgba(255,255,255,0.1)"}`, color: active ? color : "#666", borderRadius:10, padding:"9px 13px", cursor:"pointer", fontSize:12, fontWeight:700 });

  // ══════════════════════════════════════════════════════
  return (
    <div style={{ minHeight:"100vh", background:"#090910", color:"#e8e8f0",
      fontFamily:"-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif",
      paddingTop: SA.top, WebkitTextSizeAdjust:"100%", overflowX:"hidden" }}>

      {/* BG */}
      <div style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none",
        backgroundImage:"linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)",
        backgroundSize:"40px 40px" }} />
      <div style={{ position:"fixed", top:"-160px", left:"50%", transform:"translateX(-50%)", width:"600px", height:"360px",
        borderRadius:"50%", background:"radial-gradient(ellipse,rgba(255,61,110,0.1) 0%,transparent 70%)", zIndex:0, pointerEvents:"none" }} />

      {/* ── スクロール本体 ─────────────────────────────── */}
      <div style={{ position:"relative", zIndex:1, paddingBottom:`calc(84px + ${SA.bottom})` }}>

        {/* ── ヘッダー ─────────────────────────────────── */}
        <div style={{ padding:"14px 16px 0", textAlign:"center" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"rgba(255,61,110,0.1)", border:"1px solid rgba(255,61,110,0.25)", borderRadius:20, padding:"4px 14px", marginBottom:8 }}>
            <span style={{ fontSize:10 }}>🎵</span>
            <span style={{ fontSize:9, letterSpacing:3, fontWeight:800, color:"#ff3d6e", textTransform:"uppercase" }}>コる九音楽祭</span>
          </div>
          <h1 style={{ fontSize:22, fontWeight:900, margin:"0 0 2px", letterSpacing:-0.5 }}>
            SNS<span style={{ color:"#ff3d6e" }}>マーケ</span>スケジューラー
          </h1>
          <p style={{ color:"#444", fontSize:11, margin:0 }}>データはこの端末に自動保存 💾</p>
        </div>

        {/* ── グローバルコントロール ────────────────────── */}
        <div style={{ padding:"12px 16px 0" }}>

          {/* 地域トグル + APIキーボタン */}
          <div style={{ display:"flex", gap:8, marginBottom:10 }}>
            <div style={{ display:"flex", flex:1, background:"rgba(255,255,255,0.04)", borderRadius:12, padding:3 }}>
              {["jp","en"].map(r => (
                <button key={r} onClick={() => setRegion(r)}
                  style={{ flex:1, border:"none", borderRadius:9, cursor:"pointer", fontWeight:800, fontSize:13, padding:"9px 4px",
                    background: region===r ? "linear-gradient(135deg,#ff3d6e,#ff6b42)" : "transparent",
                    color: region===r ? "#fff" : "#555" }}>
                  {r==="jp" ? "🇯🇵 日本向け" : "🌎 英語圏"}
                </button>
              ))}
            </div>
            {/* Gemini APIキーボタン */}
            <button onClick={() => setShowApiModal(true)}
              style={{ ...TAP, background: geminiKey ? "rgba(107,203,119,0.15)" : "rgba(255,220,0,0.12)",
                border: `1px solid ${geminiKey ? "rgba(107,203,119,0.3)" : "rgba(255,220,0,0.3)"}`,
                color: geminiKey ? "#6bcb77" : "#ffd93d", borderRadius:12, padding:"0 14px",
                cursor:"pointer", fontSize:11, fontWeight:800, whiteSpace:"nowrap", gap:4 }}>
              {geminiKey ? "🔑 AI設定済" : "🔑 APIキー設定"}
            </button>
          </div>

          {/* Buffer 全体警告バナー */}
          {totalWarn > 0 && (
            <div style={{ background: totalFull > 0 ? "rgba(255,61,110,0.1)" : "rgba(255,211,61,0.1)",
              border: `1px solid ${totalFull > 0 ? "rgba(255,61,110,0.3)" : "rgba(255,211,61,0.3)"}`,
              borderRadius:12, padding:"10px 14px", marginBottom:10, display:"flex", gap:8, alignItems:"center" }}>
              <span style={{ fontSize:18 }}>{totalFull > 0 ? "🚫" : "⚠️"}</span>
              <div style={{ fontSize:12, color: totalFull > 0 ? "#ff6b6b" : "#ffd93d", lineHeight:1.5 }}>
                {totalFull > 0
                  ? <><strong>{totalFull}つのSNS</strong>でBuffer枠が満杯です。Bufferタブでリセットしてください。</>
                  : <><strong>{totalWarn}つのSNS</strong>でBufferの残り枠が少なくなっています。</>}
              </div>
            </div>
          )}

          {/* リリース日カウントダウン */}
          <div style={{ background:"rgba(255,61,110,0.06)", border:"1px solid rgba(255,61,110,0.15)", borderRadius:16, padding:"12px 14px", marginBottom:10 }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:10, color:"#555", marginBottom:4, letterSpacing:1 }}>🗓️ リリース日</div>
                <input type="date" value={releaseDate} onChange={e => setReleaseDate(e.target.value)}
                  style={{ ...inp, padding:"10px 12px", fontSize:15, width:"100%", boxSizing:"border-box" }} />
              </div>
              {countdown !== null && (
                <div style={{ textAlign:"center", minWidth:60 }}>
                  <div style={{ fontSize: countdown<=0 ? 26 : 34, fontWeight:900, lineHeight:1,
                    color: countdown<=0 ? "#ff3d6e" : countdown<=3 ? "#ff9a3c" : countdown<=7 ? "#ffd93d" : "#6bcb77" }}>
                    {countdown<=0 ? "🎉" : countdown}
                  </div>
                  <div style={{ fontSize:10, color:"#555" }}>
                    {countdown<=0 ? "リリース済!" : countdown===1 ? "明日🔥" : "日前"}
                  </div>
                </div>
              )}
            </div>
            {countdown !== null && countdown > 0 && (
              <div style={{ marginTop:8 }}>
                <div style={{ display:"flex", gap:2, height:3, borderRadius:2, overflow:"hidden", background:"rgba(255,255,255,0.05)" }}>
                  {[14,7,3,1,0].map(d => <div key={d} style={{ flex:1, background: countdown<=d+1 ? "rgba(255,61,110,0.8)" : "transparent" }} />)}
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", marginTop:2, fontSize:8, color:"#2a2a3a" }}>
                  <span>2週前</span><span>1週前</span><span>3日前</span><span>前日</span><span>当日</span>
                </div>
              </div>
            )}
          </div>

          {/* ── プラットフォーム統計 (3列 × 2行 = 6SNS) ── */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:6, marginBottom:10 }}>
            {platCounts.map(p => (
              <div key={p.id} style={{ background:"rgba(255,255,255,0.025)", border:`1px solid ${p.color}30`,
                borderRadius:12, padding:"8px 6px", textAlign:"center" }}>
                <div style={{ fontSize:18 }}>{p.icon}</div>
                <div style={{ fontSize:20, fontWeight:900, color:p.color, lineHeight:1.1 }}>{p.count}</div>
                <div style={{ fontSize:9, color:"#555", marginTop:1 }}>{p.short}</div>
                {(bufferCounts[p.id]||0) >= BUFFER_WARN && (
                  <div style={{ fontSize:8, color: (bufferCounts[p.id]||0) >= BUFFER_MAX ? "#ff6b6b" : "#ffd93d", marginTop:2 }}>
                    {(bufferCounts[p.id]||0) >= BUFFER_MAX ? "🚫満杯" : `⚠️残${BUFFER_MAX-(bufferCounts[p.id]||0)}`}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── コンテンツエリア ─────────────────────────── */}
        <div style={{ padding:"0 16px" }}>

          {/* ══ SCHEDULE ══════════════════════════════════ */}
          {tab==="schedule" && (
            <div>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                <button onClick={() => setWeekOffset(w => w-1)}
                  style={{ ...TAP, background:"rgba(255,255,255,0.06)", border:"none", color:"#ccc", borderRadius:10, width:44, fontSize:22, cursor:"pointer" }}>‹</button>
                <div style={{ fontSize:13, fontWeight:700, textAlign:"center" }}>
                  {fmt(weekDates[0])} 〜 {fmt(weekDates[6])}
                  {weekOffset===0 && <div style={{ fontSize:10, color:"#ff3d6e", marginTop:1 }}>今週</div>}
                </div>
                <button onClick={() => setWeekOffset(w => w+1)}
                  style={{ ...TAP, background:"rgba(255,255,255,0.06)", border:"none", color:"#ccc", borderRadius:10, width:44, fontSize:22, cursor:"pointer" }}>›</button>
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:4 }}>
                {weekDates.map((d, i) => {
                  const key      = dateKey(d);
                  const dayPosts = posts[key] || [];
                  const isRel    = releaseDate && dateKey(d) === releaseDate;
                  return (
                    <div key={key} style={{ background: isRel ? "rgba(255,61,110,0.09)" : isToday(d) ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.02)",
                      border: isRel ? "2px solid rgba(255,61,110,0.5)" : isToday(d) ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(255,255,255,0.04)",
                      borderRadius:12, padding:"6px 3px", minHeight:110 }}>
                      <div style={{ textAlign:"center", marginBottom:4 }}>
                        <div style={{ fontSize:9, color: i===0 ? "#ff7777" : i===6 ? "#4d96ff" : "#444" }}>{DAYS[i]}</div>
                        <div style={{ fontSize:15, fontWeight: isToday(d) ? 900 : 600,
                          color: isRel ? "#ff3d6e" : isToday(d) ? "#fff" : "#777" }}>{d.getDate()}</div>
                        {isRel && <div style={{ fontSize:6, color:"#ff3d6e", fontWeight:800 }}>🎵RELEASE</div>}
                      </div>
                      {dayPosts.map(post => {
                        const pl = platInfo(post.platform);
                        const tp = typeInfo(post.type);
                        return (
                          <div key={post.id} onClick={() => deletePost(key, post.id)}
                            style={{ background:`${pl?.color}15`, borderLeft:`2px solid ${pl?.color}`,
                              borderRadius:4, padding:"2px 3px", marginBottom:2, cursor:"pointer", fontSize:8 }}>
                            <div style={{ fontWeight:800, color:pl?.color }}>{pl?.icon}{post.time}</div>
                            <div style={{ color:"#666" }}>{tp?.emoji}</div>
                            {post.enCaption && <div style={{ color:"#4d96ff", fontSize:7 }}>🌎EN</div>}
                          </div>
                        );
                      })}
                      <button onClick={() => openAddForm(key)}
                        style={{ width:"100%", minHeight:28, background:"rgba(255,255,255,0.03)",
                          border:"1px dashed rgba(255,255,255,0.08)", color:"#333",
                          borderRadius:4, cursor:"pointer", fontSize:14, marginTop:2 }}>+</button>
                    </div>
                  );
                })}
              </div>
              <p style={{ textAlign:"center", color:"#2a2a3a", fontSize:10, marginTop:8 }}>タップで削除 / ＋で追加</p>
            </div>
          )}

          {/* ══ COUNTDOWN ════════════════════════════════ */}
          {tab==="countdown" && (
            <div>
              {!releaseDate ? (
                <div style={{ textAlign:"center", padding:"60px 20px", color:"#444" }}>
                  <div style={{ fontSize:48, marginBottom:12 }}>⏳</div>
                  <div style={{ fontSize:14, color:"#555" }}>リリース日を設定してください</div>
                </div>
              ) : COUNTDOWN_PLAN.map((step, i) => {
                const sd   = getCDDate(step.day);
                const sk   = sd ? dateKey(sd) : null;
                const sp   = sk ? (posts[sk]||[]) : [];
                const past = sd && sd < today && step.day !== 0;
                return (
                  <div key={i} style={{ display:"flex", gap:10, marginBottom:8, opacity: past ? 0.4 : 1 }}>
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", width:28, flexShrink:0 }}>
                      <div style={{ width:26, height:26, borderRadius:"50%",
                        background:`${step.color}20`, border:`2px solid ${past ? "rgba(255,255,255,0.1)" : step.color}`,
                        display:"flex", alignItems:"center", justifyContent:"center",
                        fontSize:10, fontWeight:900, color: past ? "#444" : step.color,
                        boxShadow: past ? "none" : `0 0 8px ${step.color}44` }}>
                        {past ? "✓" : i+1}
                      </div>
                      {i < COUNTDOWN_PLAN.length-1 &&
                        <div style={{ width:1, flex:1, background:"rgba(255,255,255,0.05)", margin:"3px 0" }} />}
                    </div>
                    <div style={{ flex:1, background:`${step.color}08`, border:`1px solid ${step.color}28`, borderRadius:13, padding:"11px 13px" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                        <div style={{ fontSize:12, fontWeight:800, color:step.color }}>{step.phase}</div>
                        {sd && <div style={{ fontSize:10, color:"#444" }}>{fmt(sd)}</div>}
                      </div>
                      {step.tasks.map((t, j) => (
                        <div key={j} style={{ display:"flex", gap:5, fontSize:12, color:"#aaa", marginBottom:2 }}>
                          <span style={{ color:step.color, flexShrink:0 }}>▸</span><span>{t}</span>
                        </div>
                      ))}
                      {sp.length > 0 && (
                        <div style={{ marginTop:7, paddingTop:7, borderTop:"1px solid rgba(255,255,255,0.05)" }}>
                          <div style={{ fontSize:10, color:"#444", marginBottom:3 }}>📌 {sp.length}件の予定</div>
                          <div style={{ display:"flex", flexWrap:"wrap", gap:3 }}>
                            {sp.map(p => { const pl = platInfo(p.platform); return (
                              <span key={p.id} style={{ background:`${pl?.color}20`, color:pl?.color, fontSize:10, borderRadius:4, padding:"2px 6px" }}>
                                {pl?.icon}{p.time}{p.enCaption ? " 🌎" : ""}
                              </span>
                            ); })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ══ HASHTAG ══════════════════════════════════ */}
          {tab==="hashtag" && (
            <div>
              <div style={{ marginBottom:12, color:"#555", fontSize:12 }}>タグをタップして選択 → コピー</div>

              {/* カテゴリ一覧 */}
              {Object.entries(HASHTAG_SETS).map(([key, tags]) => {
                const labels = {
                  jp_music:"🇯🇵 日本語タグ", trending:"🔥 トレンド",
                  niche:"🎸 ニッチ",          release:"🚀 リリース",
                  threads:"🧵 Threads専用",   facebook:"👥 Facebook専用",
                };
                const open = openSec === key;
                return (
                  <div key={key} style={{ background:"rgba(255,255,255,0.025)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:14, marginBottom:8, overflow:"hidden" }}>
                    <button onClick={() => setOpenSec(open ? null : key)}
                      style={{ width:"100%", background:"none", border:"none", display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 16px", cursor:"pointer", color:"#fff", ...TAP }}>
                      <span style={{ fontSize:13, fontWeight:700, color:"#ff3d6e" }}>{labels[key]}</span>
                      <span style={{ color:"#444", fontSize:16, display:"inline-block", transform: open ? "rotate(180deg)" : "none", transition:"transform 0.2s" }}>▾</span>
                    </button>
                    {open && (
                      <div style={{ padding:"0 14px 14px", display:"flex", flexWrap:"wrap", gap:8 }}>
                        {tags.map(tag => (
                          <button key={tag} onClick={() => toggleTag(tag)}
                            style={{ background: selTags.includes(tag) ? "linear-gradient(135deg,#ff3d6e,#ff6b42)" : "rgba(255,255,255,0.05)",
                              border: selTags.includes(tag) ? "none" : "1px solid rgba(255,255,255,0.08)",
                              color: selTags.includes(tag) ? "#fff" : "#888",
                              borderRadius:20, padding:"7px 12px", cursor:"pointer", fontSize:12,
                              fontWeight: selTags.includes(tag) ? 700 : 400, minHeight:36 }}>{tag}</button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* カスタムタグ */}
              <div style={{ background:"rgba(255,220,0,0.05)", border:"1px solid rgba(255,220,0,0.15)", borderRadius:14, padding:14, marginBottom:12 }}>
                <div style={{ fontSize:12, fontWeight:700, color:"#ffd93d", marginBottom:10 }}>✏️ カスタムタグ（保存されます）</div>
                <div style={{ display:"flex", gap:8, marginBottom:10 }}>
                  <input value={customTag} onChange={e => setCustomTag(e.target.value)} onKeyDown={e => e.key==="Enter" && addCustom()}
                    placeholder="#あなたのタグ"
                    style={{ flex:1, ...inp, padding:"10px 12px", fontSize:15 }} />
                  <button onClick={addCustom}
                    style={{ ...TAP, background:"rgba(255,220,0,0.15)", border:"1px solid rgba(255,220,0,0.3)",
                      color:"#ffd93d", borderRadius:10, padding:"0 16px", cursor:"pointer", fontSize:13, fontWeight:700 }}>追加</button>
                </div>
                {customTags.length > 0 && (
                  <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
                    {customTags.map(tag => (
                      <button key={tag} onClick={() => toggleTag(tag)}
                        style={{ background: selTags.includes(tag) ? "linear-gradient(135deg,#ffd93d,#ff9a3c)" : "rgba(255,220,0,0.07)",
                          border: selTags.includes(tag) ? "none" : "1px solid rgba(255,220,0,0.18)",
                          color: selTags.includes(tag) ? "#000" : "#ffd93d",
                          borderRadius:20, padding:"7px 12px", cursor:"pointer", fontSize:12, fontWeight:700, minHeight:36 }}>{tag}</button>
                    ))}
                  </div>
                )}
              </div>

              {/* コピーエリア */}
              {selTags.length > 0 && (
                <div style={{ background:"rgba(255,61,110,0.07)", border:"1px solid rgba(255,61,110,0.2)", borderRadius:14, padding:15 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                    <div style={{ fontSize:13, fontWeight:800 }}>✅ {selTags.length}個選択中</div>
                    <div style={{ display:"flex", gap:8 }}>
                      <button onClick={() => setSelTags([])}
                        style={{ ...TAP, background:"rgba(255,255,255,0.06)", border:"none", color:"#666", borderRadius:8, padding:"0 12px", cursor:"pointer", fontSize:12 }}>クリア</button>
                      <button onClick={copyTags}
                        style={{ ...TAP, background: copied ? "#6bcb77" : "linear-gradient(135deg,#ff3d6e,#ff6b42)",
                          border:"none", color:"#fff", borderRadius:10, padding:"0 18px", cursor:"pointer", fontSize:13, fontWeight:700 }}>
                        {copied ? "✓ コピー済" : "コピー"}
                      </button>
                    </div>
                  </div>
                  <div style={{ color:"#bbb", fontSize:13, lineHeight:2.2, wordBreak:"break-all" }}>{selTags.join(" ")}</div>
                </div>
              )}
            </div>
          )}

          {/* ══ MEMO ═════════════════════════════════════ */}
          {tab==="memo" && (
            <div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                <div style={{ color:"#555", fontSize:12 }}>投稿後の反応を記録・分析</div>
                <button onClick={() => setShowMemoForm(true)}
                  style={{ ...TAP, background:"linear-gradient(135deg,#4d96ff,#6bcb77)",
                    border:"none", color:"#fff", borderRadius:12, padding:"0 16px", cursor:"pointer", fontSize:13, fontWeight:800 }}>+ 記録追加</button>
              </div>

              {memos.length === 0 ? (
                <div style={{ textAlign:"center", padding:"60px 20px", color:"#333" }}>
                  <div style={{ fontSize:52, marginBottom:12 }}>📊</div>
                  <div style={{ fontSize:14, color:"#555" }}>まだ記録がありません</div>
                  <div style={{ fontSize:12, color:"#333", marginTop:6 }}>記録はこの端末に自動保存されます</div>
                </div>
              ) : (
                <div>
                  {/* サマリー */}
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:14 }}>
                    {PLATFORMS.map(p => {
                      const pm = memos.filter(m => m.platform === p.id);
                      if (!pm.length) return null;
                      const avgL = Math.round(pm.reduce((a,m) => a+(parseInt(m.likes)||0), 0) / pm.length);
                      const avgV = Math.round(pm.reduce((a,m) => a+(parseInt(m.views)||0), 0) / pm.length);
                      return (
                        <div key={p.id} style={{ background:`${p.color}09`, border:`1px solid ${p.color}28`, borderRadius:13, padding:"12px 14px" }}>
                          <div style={{ fontSize:12, fontWeight:800, color:p.color, marginBottom:6 }}>
                            {p.icon} {p.name} <span style={{ fontSize:10, color:"#444", fontWeight:400 }}>({pm.length}件)</span>
                          </div>
                          <div style={{ display:"flex", gap:14 }}>
                            <div><div style={{ fontSize:9, color:"#444" }}>平均❤️</div><div style={{ fontSize:18, fontWeight:900 }}>{avgL.toLocaleString()}</div></div>
                            {avgV > 0 && <div><div style={{ fontSize:9, color:"#444" }}>平均👁️</div><div style={{ fontSize:18, fontWeight:900 }}>{avgV.toLocaleString()}</div></div>}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* 一覧 */}
                  {[...memos].reverse().map(memo => {
                    const pl = platInfo(memo.platform);
                    const ms = [["likes","❤️"],["comments","💬"],["shares","🔁"],["views","👁️"],["follows","➕"]].filter(([k]) => memo[k]);
                    return (
                      <div key={memo.id} style={{ background:"rgba(255,255,255,0.025)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:14, padding:"13px 14px", marginBottom:9 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:9 }}>
                          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                            <span style={{ fontSize:18 }}>{pl?.icon}</span>
                            <div>
                              <div style={{ fontSize:13, fontWeight:800, color:pl?.color }}>{pl?.name}</div>
                              {memo.date && <div style={{ fontSize:10, color:"#444" }}>{memo.date}</div>}
                            </div>
                          </div>
                          <button onClick={() => setMemos(p => p.filter(m => m.id !== memo.id))}
                            style={{ ...TAP, background:"none", border:"none", color:"#333", cursor:"pointer", fontSize:18, width:36, height:36 }}>✕</button>
                        </div>
                        {ms.length > 0 && (
                          <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom: memo.note ? 9 : 0 }}>
                            {ms.map(([k, icon]) => (
                              <div key={k} style={{ background:"rgba(255,255,255,0.05)", borderRadius:10, padding:"6px 11px", textAlign:"center" }}>
                                <div style={{ fontSize:12 }}>{icon}</div>
                                <div style={{ fontSize:15, fontWeight:800 }}>{parseInt(memo[k]).toLocaleString()}</div>
                              </div>
                            ))}
                          </div>
                        )}
                        {memo.note && <div style={{ fontSize:12, color:"#777", borderTop:"1px solid rgba(255,255,255,0.05)", paddingTop:8 }}>📝 {memo.note}</div>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ══ BUFFER ════════════════════════════════════ */}
          {tab==="buffer" && (
            <div>
              {/* サブタブ */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:4, marginBottom:14, background:"rgba(255,255,255,0.03)", borderRadius:12, padding:4 }}>
                {[{id:"slots",label:"📊 枠数管理"},{id:"setup",label:"⚙️ 設定ガイド"}].map(t => (
                  <button key={t.id} onClick={() => setBufferSub(t.id)}
                    style={{ ...TAP, border:"none", borderRadius:9, cursor:"pointer", fontSize:13, fontWeight:700,
                      background: bufferSub===t.id ? "linear-gradient(135deg,#ff3d6e,#ff6b42)" : "transparent",
                      color: bufferSub===t.id ? "#fff" : "#555" }}>{t.label}</button>
                ))}
              </div>

              {/* 枠数管理 */}
              {bufferSub==="slots" && (
                <div>
                  <div style={{ background:"rgba(77,150,255,0.07)", border:"1px solid rgba(77,150,255,0.2)", borderRadius:13, padding:"11px 13px", marginBottom:14, fontSize:12, color:"#7bb8ff", lineHeight:1.6 }}>
                    ℹ️ Bufferの<strong>無料プランはSNSアカウントごとに最大10件</strong>まで予約投稿できます。投稿が発信されると枠が空き、再利用できます。
                  </div>

                  {PLATFORMS.map(p => (
                    <BufferSlotMeter
                      key={p.id}
                      platform={p}
                      count={bufferCounts[p.id] || 0}
                      onExport={() => bufferExport(p.id)}
                      onReset={() => bufferReset(p.id)}
                    />
                  ))}

                  {/* 全件コピー */}
                  <div style={{ background:"rgba(255,255,255,0.025)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, padding:14, marginTop:8 }}>
                    <div style={{ fontSize:13, fontWeight:800, marginBottom:6 }}>📋 全投稿エクスポート</div>
                    <div style={{ fontSize:12, color:"#555", marginBottom:10 }}>登録済みの全投稿を一括コピーします。</div>
                    <button
                      onClick={() => {
                        const text = Object.entries(posts)
                          .flatMap(([d,ps]) => ps.map(p => ({...p,date:d})))
                          .sort((a,b) => a.date.localeCompare(b.date)||a.time.localeCompare(b.time))
                          .map(p => { const pl=platInfo(p.platform); const tp=typeInfo(p.type); const cap=p.enCaption||p.note||`${tp?.label} ${tp?.emoji}`; return `【${p.date} ${p.time}】${pl?.name}\n${cap}\n`; })
                          .join("\n");
                        navigator.clipboard.writeText(text || "投稿データなし");
                      }}
                      style={{ width:"100%", ...TAP, background:"linear-gradient(135deg,#ff3d6e,#ff6b42)", border:"none", color:"#fff", borderRadius:12, cursor:"pointer", fontSize:14, fontWeight:800 }}>
                      全件コピー
                    </button>
                  </div>
                </div>
              )}

              {/* 設定ガイド */}
              {bufferSub==="setup" && (
                <div>
                  {[
                    {n:1, ic:"📧", title:"Bufferアカウント作成",    desc:"buffer.com でFreeプランに登録（完全無料）。メール認証を完了してください。",                              col:"#6bcb77"},
                    {n:2, ic:"🔗", title:"SNSチャンネルを接続",      desc:"Dashboard → 「+ チャンネル追加」からIG・TikTok・X・Threads・FB等を接続。無料プランで最大3チャンネル。",  col:"#4d96ff"},
                    {n:3, ic:"📱", title:"Buffer公式アプリを導入",    desc:"iPhoneにBuffer公式アプリをインストール → プッシュ通知をオンにしてください。投稿完了・エラーをリアルタイムで検知できます。", col:"#ffd93d"},
                    {n:4, ic:"📤", title:"このアプリからコピー",      desc:"「枠数管理」タブの「Bufferへコピー」で投稿文をクリップボードにコピーします。",                             col:"#ff9a3c"},
                    {n:5, ic:"🚀", title:"Bufferで予約設定",         desc:"Buffer → 「Create Post」→ 貼り付け → 日時設定 → 「Schedule」で完了！",                                  col:"#ff3d6e"},
                    {n:6, ic:"↩️", title:"発信完了後にリセット",      desc:"投稿がBufferから発信されたら、このアプリの各SNSの「↩️ リセット」ボタンで枠を回収します。",                   col:"#c77dff"},
                  ].map(s => (
                    <div key={s.n} style={{ display:"flex", gap:12, marginBottom:10 }}>
                      <div style={{ width:32, height:32, borderRadius:"50%", background:`${s.col}22`, border:`2px solid ${s.col}`,
                        display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, flexShrink:0, marginTop:10 }}>{s.ic}</div>
                      <div style={{ flex:1, background:`${s.col}08`, border:`1px solid ${s.col}28`, borderRadius:14, padding:"12px 14px" }}>
                        <div style={{ fontSize:12, fontWeight:800, color:s.col, marginBottom:4 }}>STEP {s.n}: {s.title}</div>
                        <div style={{ fontSize:12, color:"#bbb", lineHeight:1.7 }}>{s.desc}</div>
                      </div>
                    </div>
                  ))}

                  <div style={{ background:"rgba(107,203,119,0.07)", border:"1px solid rgba(107,203,119,0.22)", borderRadius:14, padding:"13px 15px", marginTop:8 }}>
                    <div style={{ fontSize:13, fontWeight:800, color:"#6bcb77", marginBottom:8 }}>✅ Buffer無料プラン概要</div>
                    {[
                      ["接続SNS数",   "最大3チャンネル（IG・TikTok・X・Threads・FB等から選択）"],
                      ["Threads",    "Bufferが正式対応済み（無料枠で利用可能）"],
                      ["Facebook",   "Bufferでページ投稿の予約に対応"],
                      ["予約投稿数",  "各アカウント最大10件（発信後に枠が空く）"],
                      ["料金",       "完全0円"],
                    ].map(([k, v]) => (
                      <div key={k} style={{ display:"flex", gap:10, fontSize:12, marginBottom:5 }}>
                        <span style={{ color:"#6bcb77", width:100, flexShrink:0 }}>{k}</span>
                        <span style={{ color:"#bbb" }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>{/* /コンテンツエリア */}
      </div>{/* /スクロール本体 */}

      {/* ══ iPhone 底部タブバー（5タブ）══════════════════ */}
      <div style={{ position:"fixed", bottom:0, left:0, right:0, zIndex:100,
        background:"rgba(9,9,16,0.94)", backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)",
        borderTop:"1px solid rgba(255,255,255,0.08)",
        paddingBottom: SA.bottom }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)" }}>
          {[
            { id:"schedule",  icon:"📅", label:"予定"   },
            { id:"countdown", icon:"⏳", label:"計画"   },
            { id:"hashtag",   icon:"#",  label:"タグ"   },
            { id:"memo",      icon:"📊", label:"分析"   },
            { id:"buffer",    icon:"🚀", label:"Buffer" },
          ].map(t => {
            const hasBadge = t.id==="buffer" && totalWarn > 0;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{ position:"relative", border:"none", background:"none", cursor:"pointer",
                  padding:"10px 4px 8px", ...TAP, flexDirection:"column", gap:2 }}>
                <div style={{ position:"relative" }}>
                  <span style={{ fontSize:20 }}>{t.icon}</span>
                  {hasBadge && (
                    <div style={{ position:"absolute", top:-4, right:-8, width:16, height:16,
                      borderRadius:"50%", background: totalFull > 0 ? "#ff3d6e" : "#ffd93d",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:9, fontWeight:900, color: totalFull > 0 ? "#fff" : "#000" }}>
                      {totalWarn}
                    </div>
                  )}
                </div>
                <div style={{ fontSize:9, fontWeight:700, color: tab===t.id ? "#ff3d6e" : "#444" }}>{t.label}</div>
                {tab===t.id && (
                  <div style={{ position:"absolute", bottom:6, width:20, height:2, background:"#ff3d6e", borderRadius:1 }} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ══ 投稿追加モーダル ══════════════════════════════ */}
      {showForm && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", zIndex:200, display:"flex", alignItems:"flex-end" }}
          onClick={() => { setShowForm(null); setLocalResult(null); setLocalError(""); }}>
          <div style={{ background:"#0f0f18", borderRadius:"24px 24px 0 0", padding:"20px 16px",
            width:"100%", borderTop:"1px solid rgba(255,255,255,0.1)",
            maxHeight:"88vh", overflowY:"auto", paddingBottom:`calc(20px + ${SA.bottom})` }}
            onClick={e => e.stopPropagation()}>

            <div style={{ width:36, height:4, background:"rgba(255,255,255,0.2)", borderRadius:2, margin:"0 auto 16px" }} />
            <div style={{ fontSize:15, fontWeight:900, marginBottom:16 }}>📅 {showForm} に投稿追加</div>

            {/* Platform */}
            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:11, color:"#444", marginBottom:8, letterSpacing:1 }}>PLATFORM</div>
              <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
                {PLATFORMS.map(p => (
                  <button key={p.id}
                    onClick={() => { setForm(f => ({...f, platform:p.id, time:bestTimes(p.id)[0]||"18:00"})); setLocalResult(null); }}
                    style={pBtn(form.platform===p.id, p.color)}>{p.icon} {p.name}</button>
                ))}
              </div>
            </div>

            {/* Content Type */}
            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:11, color:"#444", marginBottom:8, letterSpacing:1 }}>CONTENT TYPE</div>
              <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                {POST_TYPES.map(t => (
                  <button key={t.id} onClick={() => setForm(f => ({...f, type:t.id}))} style={pBtn(form.type===t.id, t.color)}>
                    {t.emoji} {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Time */}
            <div style={{ marginBottom:14 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                <div style={{ fontSize:11, color:"#444", letterSpacing:1 }}>TIME</div>
                <div style={{ fontSize:9, color:"#555" }}>{region==="jp" ? "🇯🇵 日本向け推奨" : "🌎 英語圏推奨"}</div>
              </div>
              <input type="time" value={form.time} onChange={e => setForm(f => ({...f, time:e.target.value}))}
                style={{ ...inp, width:"100%", boxSizing:"border-box", fontSize:18 }} />
              <div style={{ marginTop:8, display:"flex", gap:6, flexWrap:"wrap" }}>
                {bestTimes(form.platform).map((t, i) => (
                  <button key={t} onClick={() => setForm(f => ({...f, time:t}))}
                    style={{ ...TAP, background: form.time===t ? "rgba(255,61,110,0.2)" : "rgba(255,61,110,0.08)",
                      border:`1px solid ${form.time===t ? "rgba(255,61,110,0.6)" : "rgba(255,61,110,0.2)"}`,
                      color:"#ff3d6e", borderRadius:8, padding:"0 12px", cursor:"pointer", fontSize:11, fontWeight:700 }}>
                    {["🥇","🥈","🥉"][i]} {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Caption + AI */}
            <div style={{ marginBottom:12 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                <div style={{ fontSize:11, color:"#444", letterSpacing:1 }}>キャプション</div>
                {region==="en" && (
                  <button onClick={handleLocalize} disabled={localizing || !form.note.trim()}
                    style={{ ...TAP, background: localizing ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg,#4d96ff,#c77dff)",
                      border:"none", color: localizing ? "#555" : "#fff", borderRadius:8, padding:"0 12px",
                      cursor: localizing ? "default" : "pointer", fontSize:11, fontWeight:800 }}>
                    {localizing ? "🔄 翻訳中..." : "🌎 Gemini AI最適化"}
                  </button>
                )}
              </div>
              <textarea value={form.note} onChange={e => setForm(f => ({...f, note:e.target.value}))}
                placeholder={region==="en" ? "日本語で入力 → Gemini AIが英語圏向けに最適化します" : "キャプション・メモ（任意）"}
                rows={3} style={{ width:"100%", boxSizing:"border-box", ...inp, resize:"none", lineHeight:1.6, fontSize:15 }} />
              {localError && <div style={{ fontSize:11, color:"#ff6b6b", marginTop:4 }}>{localError}</div>}
            </div>

            {/* AI結果 */}
            {localResult && (
              <div style={{ background:"rgba(77,150,255,0.09)", border:"1px solid rgba(77,150,255,0.28)", borderRadius:14, padding:14, marginBottom:14 }}>
                <div style={{ fontSize:12, fontWeight:800, color:"#4d96ff", marginBottom:10 }}>🌎 Gemini AI — 英語圏向け最適化結果</div>
                <div style={{ background:"rgba(255,255,255,0.05)", borderRadius:10, padding:"10px 12px", marginBottom:10,
                  fontSize:13, color:"#e8e8f0", lineHeight:1.7 }}>{localResult.translated}</div>
                {localResult.hashtags?.length > 0 && (
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:8 }}>
                    {localResult.hashtags.map(h => (
                      <span key={h} style={{ background:"rgba(77,150,255,0.18)", color:"#4d96ff", borderRadius:12, padding:"4px 10px", fontSize:12, fontWeight:700 }}>{h}</span>
                    ))}
                  </div>
                )}
                {localResult.tip && (
                  <div style={{ fontSize:11, color:"#888", background:"rgba(255,255,255,0.04)", borderRadius:8, padding:"7px 10px" }}>💡 {localResult.tip}</div>
                )}
                <button onClick={() => setForm(f => ({...f, enCaption:localResult.translated}))}
                  style={{ marginTop:10, width:"100%", ...TAP, background:"linear-gradient(135deg,#4d96ff,#6bcb77)",
                    border:"none", color:"#fff", borderRadius:10, cursor:"pointer", fontSize:13, fontWeight:800 }}>
                  ✅ この英語版を投稿に設定
                </button>
              </div>
            )}

            {form.enCaption && !localResult && (
              <div style={{ background:"rgba(77,150,255,0.07)", border:"1px solid rgba(77,150,255,0.22)", borderRadius:10, padding:"10px 12px", marginBottom:12, fontSize:12, color:"#4d96ff" }}>
                🌎 英語版キャプション設定済み
              </div>
            )}

            <button onClick={savePost}
              style={{ width:"100%", ...TAP, background:"linear-gradient(135deg,#ff3d6e,#ff6b42)",
                border:"none", color:"#fff", borderRadius:14, cursor:"pointer", fontSize:16, fontWeight:900 }}>
              追加する
            </button>
          </div>
        </div>
      )}

      {/* ══ メモ記録モーダル ══════════════════════════════ */}
      {showMemoForm && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", zIndex:200, display:"flex", alignItems:"flex-end" }}
          onClick={() => setShowMemoForm(false)}>
          <div style={{ background:"#0f0f18", borderRadius:"24px 24px 0 0", padding:"20px 16px",
            width:"100%", borderTop:"1px solid rgba(255,255,255,0.1)",
            maxHeight:"85vh", overflowY:"auto", paddingBottom:`calc(20px + ${SA.bottom})` }}
            onClick={e => e.stopPropagation()}>
            <div style={{ width:36, height:4, background:"rgba(255,255,255,0.2)", borderRadius:2, margin:"0 auto 16px" }} />
            <div style={{ fontSize:15, fontWeight:900, marginBottom:16 }}>📊 エンゲージメント記録</div>

            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:11, color:"#444", marginBottom:8, letterSpacing:1 }}>PLATFORM</div>
              <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
                {PLATFORMS.map(p => (
                  <button key={p.id} onClick={() => setMemoForm(f => ({...f, platform:p.id}))} style={pBtn(memoForm.platform===p.id, p.color)}>
                    {p.icon} {p.name}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:11, color:"#444", marginBottom:8, letterSpacing:1 }}>DATE</div>
              <input type="date" value={memoForm.date} onChange={e => setMemoForm(f => ({...f, date:e.target.value}))}
                style={{ ...inp, width:"100%", boxSizing:"border-box" }} />
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
              {[["likes","❤️ いいね"],["comments","💬 コメント"],["shares","🔁 シェア"],["views","👁️ 再生数"],["follows","➕ フォロー増"]].map(([k, label]) => (
                <div key={k}>
                  <div style={{ fontSize:11, color:"#444", marginBottom:5 }}>{label}</div>
                  <input type="number" inputMode="numeric" value={memoForm[k]}
                    onChange={e => setMemoForm(f => ({...f, [k]:e.target.value}))}
                    placeholder="0" style={{ width:"100%", boxSizing:"border-box", ...inp, fontSize:18 }} />
                </div>
              ))}
            </div>

            <div style={{ marginBottom:18 }}>
              <div style={{ fontSize:11, color:"#444", marginBottom:8, letterSpacing:1 }}>INSIGHT MEMO</div>
              <textarea value={memoForm.note} onChange={e => setMemoForm(f => ({...f, note:e.target.value}))}
                placeholder="気づいたこと、伸びた理由、改善点..." rows={3}
                style={{ width:"100%", boxSizing:"border-box", ...inp, resize:"none", lineHeight:1.6, fontSize:15 }} />
            </div>

            <button onClick={saveMemo}
              style={{ width:"100%", ...TAP, background:"linear-gradient(135deg,#4d96ff,#6bcb77)",
                border:"none", color:"#fff", borderRadius:14, cursor:"pointer", fontSize:16, fontWeight:900 }}>
              記録する
            </button>
          </div>
        </div>
      )}

      {/* ══ Gemini APIキー設定モーダル ════════════════════ */}
      {showApiModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.92)", zIndex:300,
          display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}
          onClick={() => setShowApiModal(false)}>
          <div style={{ background:"#111118", borderRadius:22, padding:24, width:"100%", maxWidth:400,
            border:"1px solid rgba(255,255,255,0.1)" }}
            onClick={e => e.stopPropagation()}>

            <div style={{ fontSize:18, fontWeight:900, marginBottom:6 }}>🔑 Gemini APIキー設定</div>
            <div style={{ fontSize:12, color:"#666", marginBottom:18, lineHeight:1.7 }}>
              日本語 → 英語圏向け自動最適化（AIローカライズ）機能で使用します。<br />
              キーはこの端末のブラウザのみに保存されます。外部に送信されることはありません。
            </div>

            {/* 取得手順 */}
            <div style={{ background:"rgba(255,220,0,0.07)", border:"1px solid rgba(255,220,0,0.2)", borderRadius:12, padding:"12px 14px", marginBottom:18 }}>
              <div style={{ fontSize:12, fontWeight:800, color:"#ffd93d", marginBottom:10 }}>📋 無料取得手順（Google AI Studio）</div>
              {[
                "① aistudio.google.com にアクセス",
                "② Googleアカウントでログイン",
                "③「Get API key」→「Create API key」をタップ",
                "④ 生成されたキーをコピーして下に貼り付け",
                "⑤「保存する」をタップで完了",
              ].map((s, i) => (
                <div key={i} style={{ color:"#bbb", marginBottom:4, fontSize:12 }}>{s}</div>
              ))}
              <div style={{ marginTop:8, padding:"6px 10px", background:"rgba(107,203,119,0.1)", borderRadius:8, fontSize:11, color:"#6bcb77" }}>
                ✅ 無料枠で月150万トークン使用可能。音楽プロモーションには十分です。
              </div>
            </div>

            <input
              value={geminiInput}
              onChange={e => setGeminiInput(e.target.value)}
              placeholder="AIzaSy..."
              style={{ width:"100%", boxSizing:"border-box", ...inp, marginBottom:14, fontSize:15 }}
            />

            <div style={{ display:"flex", gap:10 }}>
              <button onClick={() => setShowApiModal(false)}
                style={{ flex:1, ...TAP, background:"rgba(255,255,255,0.06)", border:"none", color:"#777",
                  borderRadius:12, cursor:"pointer", fontSize:14, fontWeight:700 }}>キャンセル</button>
              <button onClick={saveGeminiKey} disabled={!geminiInput.trim()}
                style={{ flex:2, ...TAP,
                  background: geminiInput.trim() ? "linear-gradient(135deg,#4d96ff,#6bcb77)" : "rgba(255,255,255,0.05)",
                  border:"none", color: geminiInput.trim() ? "#fff" : "#444",
                  borderRadius:12, cursor: geminiInput.trim() ? "pointer" : "default",
                  fontSize:14, fontWeight:900 }}>
                保存する
              </button>
            </div>

            {geminiKey && (
              <div style={{ marginTop:12, textAlign:"center", fontSize:11, color:"#6bcb77" }}>
                ✓ 現在APIキーが設定されています
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
