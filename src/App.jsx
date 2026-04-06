import React, { useState, useEffect } from 'react';
import { STORAGE_KEYS } from './constants';
import { loadData, saveData } from './utils';
import ScheduleTab from './components/ScheduleTab';
import CountdownTab from './components/CountdownTab';
import LocalizeTab from './components/LocalizeTab';
import BufferTab from './components/BufferTab';
import HashtagsTab from './components/HashtagsTab';
import AnalyticsTab from './components/AnalyticsTab';
import SettingsTab from './components/SettingsTab';

export default function App() {
  const [activeTab, setActiveTab] = useState('schedule');
  const [posts, setPosts] = useState(() => loadData(STORAGE_KEYS.posts, []));
  const [engageMemos, setEngageMemos] = useState(() => loadData(STORAGE_KEYS.engageMemos, []));
  const [customTags, setCustomTags] = useState(() => loadData(STORAGE_KEYS.customTags, []));
  const [releaseDate, setReleaseDate] = useState(() => loadData(STORAGE_KEYS.releaseDate, ''));
  const [region, setRegion] = useState(() => loadData(STORAGE_KEYS.region, 'japan'));
  const [geminiKey, setGeminiKey] = useState(() => loadData(STORAGE_KEYS.geminiKey, ''));
  const [bufferCounts, setBufferCounts] = useState(() => {
    const data = loadData(STORAGE_KEYS.bufferCounts, null);
    return data || { instagram: 0, tiktok: 0, x: 0, youtube: 0 };
  });

  useEffect(() => { saveData(STORAGE_KEYS.posts, posts); }, [posts]);
  useEffect(() => { saveData(STORAGE_KEYS.engageMemos, engageMemos); }, [engageMemos]);
  useEffect(() => { saveData(STORAGE_KEYS.customTags, customTags); }, [customTags]);
  useEffect(() => { saveData(STORAGE_KEYS.releaseDate, releaseDate); }, [releaseDate]);
  useEffect(() => { saveData(STORAGE_KEYS.region, region); }, [region]);
  useEffect(() => { saveData(STORAGE_KEYS.geminiKey, geminiKey); }, [geminiKey]);
  useEffect(() => { saveData(STORAGE_KEYS.bufferCounts, bufferCounts); }, [bufferCounts]);

  const handleClearAll = () => {
    if (window.confirm('すべてのデータを削除しますか？\nこの操作は取り消せません。')) {
      setPosts([]); setEngageMemos([]); setCustomTags([]); setReleaseDate('');
      setBufferCounts({ instagram: 0, tiktok: 0, x: 0, youtube: 0 });
      Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
    }
  };

  const tabs = [
    { id: 'schedule', icon: '📅', label: 'スケジュール' },
    { id: 'countdown', icon: '⏳', label: 'カウントダウン' },
    { id: 'localize', icon: '🌎', label: 'AI翻訳' },
    { id: 'buffer', icon: '🚀', label: 'Buffer' },
    { id: 'hashtags', icon: '#️⃣', label: 'タグ' },
    { id: 'analytics', icon: '📊', label: '分析' },
    { id: 'settings', icon: '⚙️', label: '設定' },
  ];

  const renderTab = () => {
    switch (activeTab) {
      case 'schedule': return <ScheduleTab posts={posts} setPosts={setPosts} region={region} />;
      case 'countdown': return <CountdownTab releaseDate={releaseDate} setReleaseDate={setReleaseDate} />;
      case 'localize': return <LocalizeTab geminiKey={geminiKey} setGeminiKey={setGeminiKey} />;
      case 'buffer': return <BufferTab posts={posts} bufferCounts={bufferCounts} setBufferCounts={setBufferCounts} />;
      case 'hashtags': return <HashtagsTab customTags={customTags} setCustomTags={setCustomTags} />;
      case 'analytics': return <AnalyticsTab engageMemos={engageMemos} setEngageMemos={setEngageMemos} />;
      case 'settings': return <SettingsTab region={region} setRegion={setRegion} geminiKey={geminiKey} setGeminiKey={setGeminiKey} onClearAll={handleClearAll} />;
      default: return null;
    }
  };

  const anyBufferWarning = Object.values(bufferCounts).some(v => v >= 7);

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>SNSマーケスケジューラー</h1>
        <div className="subtitle">Music Release Planner</div>
      </header>

      <nav className="nav-tabs">
        {tabs.map(tab => (
          <button key={tab.id} id={`tab-${tab.id}`}
            className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}>
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
            {tab.id === 'buffer' && anyBufferWarning && (
              <span style={{width:8,height:8,borderRadius:'50%',
                background: Object.values(bufferCounts).some(v => v >= 10) ? 'var(--accent-red)' : 'var(--accent-orange)',
                animation:'pulse 1.5s infinite'}} />
            )}
          </button>
        ))}
      </nav>

      <main>{renderTab()}</main>

      <footer style={{textAlign:'center',padding:'40px 20px',fontSize:'0.7rem',color:'var(--text-muted)'}}>
        <p>SNS Marketing Scheduler</p>
        <p style={{marginTop:4}}>完全無料 • サーバーレス • データはブラウザ内に保存</p>
      </footer>
    </div>
  );
}
