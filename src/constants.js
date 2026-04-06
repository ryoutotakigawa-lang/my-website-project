export const CONTENT_TYPES = [
  { id: 'mv', label: 'MV公開', emoji: '🎬', badgeClass: 'badge-mv' },
  { id: 'teaser', label: 'ティーザー', emoji: '⏳', badgeClass: 'badge-teaser' },
  { id: 'making', label: 'メイキング', emoji: '🎥', badgeClass: 'badge-making' },
  { id: 'behind', label: '裏側', emoji: '👀', badgeClass: 'badge-behind' },
  { id: 'interview', label: 'インタビュー', emoji: '🎤', badgeClass: 'badge-interview' },
  { id: 'live', label: 'ライブ情報', emoji: '🔴', badgeClass: 'badge-live' },
  { id: 'collab', label: 'コラボ', emoji: '🤝', badgeClass: 'badge-collab' },
  { id: 'announce', label: '告知', emoji: '📣', badgeClass: 'badge-announce' },
];

export const PLATFORMS = [
  { id: 'instagram', label: 'IG', icon: 'IG', className: 'platform-ig' },
  { id: 'tiktok', label: 'TikTok', icon: 'TT', className: 'platform-tt' },
  { id: 'x', label: 'X', icon: '𝕏', className: 'platform-x' },
  { id: 'youtube', label: 'YouTube', icon: 'YT', className: 'platform-yt' },
];

export const OPTIMAL_TIMES = {
  japan: {
    instagram: ['12:00', '18:00', '21:00'],
    tiktok: ['7:00', '12:00', '19:00', '22:00'],
    x: ['7:00', '12:00', '17:00', '20:00'],
    youtube: ['17:00', '19:00', '21:00'],
  },
  english: {
    instagram: ['11:00 EST', '14:00 EST', '19:00 EST'],
    tiktok: ['9:00 EST', '12:00 EST', '19:00 EST'],
    x: ['8:00 EST', '12:00 EST', '17:00 EST'],
    youtube: ['14:00 EST', '16:00 EST', '20:00 EST'],
  }
};

export const DAY_NAMES_JA = ['日', '月', '火', '水', '木', '金', '土'];

export const STORAGE_KEYS = {
  posts: 'sns_posts',
  engageMemos: 'sns_engageMemos',
  customTags: 'sns_customTags',
  releaseDate: 'sns_releaseDate',
  region: 'sns_region',
  geminiKey: 'sns_geminiKey',
  bufferCounts: 'sns_bufferCounts',
};

export const COUNTDOWN_TASKS = [
  { day: -14, label: '2週間前', tasks: [
    { platform: 'instagram', text: 'ストーリーでカウントダウン開始。制作中の写真を投稿' },
    { platform: 'x', text: 'MV制作の進捗をツイート。ティーザー画像シェア' },
  ]},
  { day: -10, label: '10日前', tasks: [
    { platform: 'tiktok', text: 'スタジオの裏側15秒動画を投稿' },
    { platform: 'instagram', text: 'リール：メイキング映像30秒ダイジェスト' },
  ]},
  { day: -7, label: '1週間前', tasks: [
    { platform: 'tiktok', text: 'サビ15秒のティーザー動画を投稿' },
    { platform: 'youtube', text: 'ティーザー映像（30秒）をプレミア公開設定' },
    { platform: 'x', text: '「あと7日」カウントダウンツイート' },
    { platform: 'instagram', text: 'フィード：アートワーク公開＋カウントダウン' },
  ]},
  { day: -5, label: '5日前', tasks: [
    { platform: 'tiktok', text: '楽曲に合わせたダンス/リアクション動画の素材準備' },
    { platform: 'instagram', text: 'ストーリー：Q&Aステッカーで期待度調査' },
  ]},
  { day: -3, label: '3日前', tasks: [
    { platform: 'x', text: 'MV出演者やコラボアーティストの情報解禁' },
    { platform: 'instagram', text: 'カルーセル投稿：楽曲のストーリーを3枚で紹介' },
    { platform: 'tiktok', text: 'サウンドをプレビューする「歌ってみた」系動画' },
  ]},
  { day: -1, label: '前日', tasks: [
    { platform: 'instagram', text: 'ストーリー：「明日リリース」リマインダー＋リンクステッカー' },
    { platform: 'x', text: 'リリース日時の最終告知ツイート＋ピン留め' },
    { platform: 'youtube', text: 'プレミア公開のウェイティングルームを開放' },
    { platform: 'tiktok', text: '「明日解禁」ティーザー動画' },
  ]},
  { day: 0, label: '🎉 リリース日', tasks: [
    { platform: 'youtube', text: 'MV本編をプレミア公開 / 通常公開' },
    { platform: 'instagram', text: 'フィード＆リール＆ストーリーで一斉告知' },
    { platform: 'x', text: 'リリース告知ツイート＋MV URL＋関連ハッシュタグ' },
    { platform: 'tiktok', text: 'サビ部分のTikTok動画＋公式サウンド設定' },
  ]},
  { day: 1, label: '翌日', tasks: [
    { platform: 'instagram', text: 'ストーリー：MVの反応シェア＆感謝メッセージ' },
    { platform: 'x', text: 'ファンのリアクションをRT＆引用ツイート' },
  ]},
  { day: 3, label: '3日後', tasks: [
    { platform: 'tiktok', text: 'MVのワンシーンを使ったリアクション動画' },
    { platform: 'youtube', text: 'メイキング映像やビハインドストーリー公開' },
  ]},
  { day: 7, label: '1週間後', tasks: [
    { platform: 'instagram', text: '振り返り投稿：再生数・反響のまとめ' },
    { platform: 'x', text: '感謝ツイート＋次のプロジェクトのヒント' },
    { platform: 'tiktok', text: 'ファンが作った動画のデュエット・リアクション' },
  ]},
];

export const TIME_SLOTS = ['7:00','9:00','12:00','14:00','17:00','19:00','21:00','22:00'];
