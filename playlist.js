/* ══════════════════════════════════════════════════════════════
   歌单数据（独立维护）
   ──────────────────────────────────────────────────────────────
   · 只需编辑下方 SONGS 数组即可更新滚动歌单，保存后刷新即可生效
   · 顺序即显示顺序，数量不限（滚动速度会按数量自动调整）
   · 展示时自动按字数排序：字少的行多列，字多的行少列，歌名不截断
   ══════════════════════════════════════════════════════════════ */
const SONGS = [
  '形容', '消愁', '幻听', '认错', '演员', '十年',
  '戒烟', '轨迹', '晴天', '雾里', '退后', '终于',
  '拾忆', '搁浅', '医生', '江南', '浪费', '指纹',
  '偏爱', '城府', '是你', '可乐', '稻香', '说谎',
  '后来', '当你', '男孩',

  '空白格', '还有我', '我可以', '逍遥叹',
  '东风破', '七里香', '他不懂', '南山忆',
  '水星记', '我不配', '下雨天', '燕归巢',
  '庐州月', '小幸运', '时光机', '老男孩',
  '刚刚好', '丑八怪',

  '宇宙之大', '年少有为', '山水之间',
  '最佳歌手', '明天过后', '漠河舞厅',
  '半城烟沙', '今夜有雨', '等你下课',
  '趁着不深', '失落沙洲', '告白气球',
  '还在流浪', '海绵宝宝', '有何不可',
  '残酷月光', '灰色头像', '全球变冷',
  '雅俗共赏', '想象之中', '请告诉他',
  '最后一页', '暗示分离', '半岛铁盒',
  '第三人称', '公主殿下',

  '其实都没有', '闹够了没有',
  '手写的从前',

  '多余的解释', '你给我听好',
  '蒲公英的约定', '给未来的自己',

  '魔鬼中的天使', '样(Young)',

  '像我这样的人', '化身孤岛的鲸',

  '玫瑰花的葬礼', '耿', '谁',

  '我落泪情绪零碎', '这世界那么多人',

  '多想在平庸的生活拥抱你',

  '刻在我心底的名字',

  'My Sunshine', 'Always Online',

  '芊芊', '干物女', '长安忆', '浮生未歇',
  '倾尽天下', '霜雪千年', '烟雨行舟',
  '第三十八年夏至',

  '失控', '庆功酒', 'Battle', '发光弹',

  '小丑女', '飞行随笔', '星球坠落',

  '晚安 Good Nite',
];

/* ───────────────────────── 渲染逻辑 ───────────────────────── */

/* 低饱和柔和色板：按序号轮转给歌名上色（浅色底上保持协调） */
const PALETTE = ['#5f6fd2', '#3d9bd1', '#2fa89a', '#cf6f8f', '#8b6fd6', '#c98a3d'];

/* 歌名显示宽度估算：CJK 字符 ≈ 字号宽，其余字符 ≈ 0.55 字号宽 */
const NAME_SIZE = 22; // 与歌名字号保持一致
function textWidth(str) {
  let w = 0;
  for (const ch of str) {
    w += /[\u2E80-\u9FFF\uF900-\uFAFF\uFF01-\uFF5E]/.test(ch) ? NAME_SIZE : NAME_SIZE * 0.55;
  }
  return w;
}

/* 列数自适应：轨道内宽 289px，序号+间距约 28px，保证该列最长歌名完整显示 */
const TRACK_W = 289, IDX_GAP = 28, COL_GAP = 12;
function colsFor(nameW) {
  for (const c of [4, 3, 2]) {
    if (nameW <= (TRACK_W - (c - 1) * COL_GAP) / c - IDX_GAP) return c;
  }
  return 1; // 超长歌名单列独占一行
}

/* 按字数升序排列（同字数保持原顺序），相邻歌名列数相同则合并为同一网格段 */
function renderPlaylist() {
  const list = document.getElementById('song-list');
  const track = document.getElementById('song-track');
  if (!list || !track) return;

  const sorted = SONGS.map((name, i) => ({ name, i }))
    .sort((a, b) => textWidth(a.name) - textWidth(b.name) || a.i - b.i);

  const blocks = [];
  for (const { name } of sorted) {
    const cols = colsFor(textWidth(name));
    const last = blocks[blocks.length - 1];
    if (last && last.cols === cols) last.items.push(name);
    else blocks.push({ cols, items: [name] });
  }

  let songNo = 0;
  const html = blocks.map(({ cols, items }) => `
    <ul class="grid gap-x-3" style="grid-template-columns: repeat(${cols}, minmax(0, 1fr));">
      ${items.map(name => `
      <li class="song" style="--song-color: ${PALETTE[songNo++ % PALETTE.length]}">
        <span class="s-idx shrink-0 w-5 text-right text-[12px]">${String(songNo).padStart(2, '0')}</span>
        <p class="flex-1 min-w-0 text-[22px] leading-snug truncate">${name}</p>
      </li>`).join('')}
    </ul>`).join('');

  list.innerHTML = html;
  /* 复制一份歌单，配合 translateY(-50%) 实现无缝向上循环 */
  document.querySelector('#song-track [aria-hidden]').innerHTML = html;

  /* 歌单越多滚动越慢，避免快速掠过看不清（下限 16s） */
  track.style.setProperty('--roll-duration', `${Math.max(16, Math.round(SONGS.length * 1.6))}s`);

  document.getElementById('song-meta').textContent = `共 ${SONGS.length} 首`;
}

renderPlaylist();
