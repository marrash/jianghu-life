(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.JianghuRecordsView = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const escape = value => String(value == null ? '' : value).replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
  const list = value => Array.isArray(value) ? value : [];
  const numeric = value => typeof value === 'number' && Number.isFinite(value);
  const number = value => numeric(value) ? escape(value) : '未留存';
  const words = value => value == null || value === '' ? '未留存' : escape(value);
  const series = [ ['skill','武學','#2e5144',''], ['inner','內功','#a44732','8 4'], ['body','體魄','#80612b','2 4'], ['agility','身法','#416c85','12 4 2 4'], ['insight','悟性','#786082','5 3'] ];
  function metric(label, value, unit) {
    return `<div class="record-metric"><dt>${escape(label)}</dt><dd>${number(value)}${numeric(value) && unit ? `<small>${escape(unit)}</small>` : ''}</dd></div>`;
  }
  function effects(effect) {
    if (effect == null || effect === '') return '';
    const text = typeof effect === 'object' ? Object.entries(effect).map(([key, value]) => `${({skill:'武學',inner:'內功',body:'體魄',agility:'身法',insight:'悟性',money:'盤纏',health:'健康',energy:'內力',fame:'聲望',virtue:'俠義',legacy:'傳承',contribution:'貢獻',master:'師父信任',brother:'師兄情誼',rival:'宿敵敬意'})[key] || key} ${value > 0 ? '+' : ''}${value}`).join(' · ') : effect;
    return `<small class="record-effect">${escape(text)}</small>`;
  }
  function growthChart(report) {
    const frames = list(report.growth).filter(f => numeric(f.age)).slice().sort((a,b) => a.age - b.age);
    if (frames.length < 2 || frames[0].age === frames[frames.length - 1].age) return '<p class="record-empty">可比較的成長快照不足，尚無成長曲線。現有數值仍列於下表。</p>';
    const values = frames.flatMap(f => series.map(s => f.stats && f.stats[s[0]]).filter(numeric));
    if (!values.length) return '<p class="record-empty">尚無可繪製的能力快照。</p>';
    const low = Math.min(0, ...values), high = Math.max(10, ...values), span = high - low;
    const x = age => 56 + (age - frames[0].age) / (frames[frames.length-1].age - frames[0].age) * 640;
    const y = value => 218 - (value - low) / span * 180;
    const grid = Array.from({length:5}, (_,i) => {
      const value = low + span * i / 4, py = y(value);
      return `<line x1="56" x2="696" y1="${py}" y2="${py}" stroke="#d6d9cb"/><text x="45" y="${py+4}" text-anchor="end">${Math.round(value)}</text>`;
    }).join('');
    const paths = series.map(([key,label,color,dash]) => {
      let pen = false;
      const path = frames.map(f => {
        const value = f.stats && f.stats[key];
        if (!numeric(value)) { pen = false; return ''; }
        const command = `${pen ? 'L' : 'M'}${x(f.age).toFixed(2)},${y(value).toFixed(2)}`;
        pen = true;
        return command;
      }).join(' ');
      const points = frames.filter(f => numeric(f.stats && f.stats[key])).map(f => `<circle cx="${x(f.age).toFixed(2)}" cy="${y(f.stats[key]).toFixed(2)}" r="2.5" fill="${color}"><title>${number(f.age)} 歲 · ${label} ${number(f.stats[key])}</title></circle>`).join('');
      return `<g><path d="${path}" fill="none" stroke="${color}" stroke-width="2.5" stroke-dasharray="${dash}"/>${points}</g>`;
    }).join('');
    const ticks = Array.from({length:5}, (_,i) => frames[0].age + (frames[frames.length-1].age-frames[0].age) * i / 4).map(age => `<text x="${x(age)}" y="245" text-anchor="middle">${Number(age.toFixed(1))} 歲</text>`).join('');
    return `<figure class="record-growth"><svg viewBox="0 0 740 265" role="img" aria-label="五項能力隨年齡的成長曲線；橫軸依實際年齡間距排列，詳細數值見下方成長快照。"><title>江湖成長曲線</title>${grid}${paths}${ticks}</svg><figcaption class="record-legend">${series.map(([,label,color,dash]) => `<span><svg width="26" height="12" aria-hidden="true"><line x1="0" x2="26" y1="6" y2="6" stroke="${color}" stroke-width="3" stroke-dasharray="${dash}"/></svg>${label}</span>`).join('')}</figcaption></figure><details class="record-snapshots"><summary>查看成長快照數值</summary><div class="record-table-scroll"><table><caption>各年齡留存的能力</caption><thead><tr><th scope="col">年齡</th>${series.map(s => `<th scope="col">${s[1]}</th>`).join('')}</tr></thead><tbody>${frames.map(f => `<tr><th scope="row">${number(f.age)} 歲</th>${series.map(s => `<td>${number(f.stats && f.stats[s[0]])}</td>`).join('')}</tr>`).join('')}</tbody></table></div></details>`;
  }
  function renderReport(report) {
    report = report || {};
    const id = report.identity || {}, ending = report.ending || {}, judgement = report.judgement || {}, s = report.summary || {}, coverage = report.coverage || {};
    const honors = list(report.honors), relations = list(report.relationships), turns = list(report.turningPoints), years = list(report.years);
    return `<article class="life-records">
      <header class="record-hero"><div class="record-hero-copy"><p class="eyebrow">江湖一生錄 · ${id.ended ? '此生定卷' : '行旅未竟'}</p><h1>${words(id.name)}<span>的一生</span></h1><p class="record-identity">${words(id.origin)} · ${words(id.sect)} · ${words(id.route)} · ${number(id.age)} 歲</p><h2>${words(ending.title)}</h2><p class="record-ending">${escape(ending.body)}</p></div><aside class="record-verdict"><p class="record-seal">${words(ending.tag)}</p><p class="eyebrow">此生評語</p><h3>${words(judgement.title)}</h3><p>${escape(judgement.text)}</p>${id.secret ? '<span class="record-secret">別卷人生 · 祕碼</span>' : ''}</aside></header>
      <section class="record-section" aria-label="生涯總覽"><div class="record-section-heading"><h2>一生，落在這些數字裡</h2><span>人生種子 ${words(id.seed)}</span></div><dl class="record-metrics">${metric('走過歲月',s.years,'年')}${metric('歷經篇章',s.chapters,'章')}${metric('江湖名望',s.fame)}${metric('俠義',s.virtue)}${metric('傳承',s.legacy)}${metric('盤纏',s.money)}${metric('修行骰總數',s.diceCount)}${metric('留下傷痕',s.scars)}</dl><div class="record-state"><p><small>武學境界</small><strong>${words(s.realm)}</strong></p><p><small>命格</small><strong>${words(s.fate)}</strong></p></div><div class="record-battles"><p><strong>決鬥</strong><span>${number(s.duelsWon)} 勝 / ${number(s.duelsLost)} 負</span></p><p><strong>交鋒回合</strong><span>${number(s.roundsWon)} 勝 / ${number(s.roundsLost)} 負</span></p><p><strong>險關</strong><span>${number(s.trialsWon)} 成 / ${number(s.trialsLost)} 敗 / ${number(s.trialsSkipped)} 避</span></p></div></section>
      <section class="record-section"><div class="record-section-heading"><h2>從初入江湖，到今日</h2><span>五維修為</span></div><p class="record-coverage">${escape(coverage.note || (coverage.complete ? '記錄涵蓋此生起點。' : '部分早期紀錄未留存；以下只呈現已知資料。'))}</p>${growthChart(report)}<div class="record-table-scroll"><table><caption>修為對照 · 高點依留存快照計算</caption><thead><tr><th scope="col">能力</th><th scope="col">初始</th><th scope="col">${id.ended ? '最終' : '目前'}</th><th scope="col">紀錄內高點</th></tr></thead><tbody>${list(report.stats).map(stat => `<tr><th scope="row">${words(stat.label)}</th><td>${number(stat.initial)}</td><td><b>${number(stat.final)}</b></td><td>${number(stat.peak)}</td></tr>`).join('')}</tbody></table></div></section>
      <div class="record-columns"><section class="record-section"><div class="record-section-heading"><h2>江湖留名</h2><span>此生榮譽</span></div>${honors.length ? `<ul class="record-honors">${honors.map(h => `<li><h3>${words(h.title)}</h3><p>${escape(h.detail)}</p></li>`).join('')}</ul>` : '<p class="record-empty">這一頁尚未留下榮譽。</p>'}</section><section class="record-section"><div class="record-section-heading"><h2>與你同行的人</h2><span>關係定格</span></div>${relations.length ? `<ul class="record-relations">${relations.map(r => `<li><div><h3>${words(r.name)}</h3><span>${words(r.role)}</span></div><b>羈絆 ${number(r.value)}</b><p>${escape(r.text)}</p></li>`).join('')}</ul>` : '<p class="record-empty">尚無留存的人物關係。</p>'}</section></div>
      <section class="record-section"><div class="record-section-heading"><h2>改變一生的幾步</h2><span>重要轉折</span></div>${turns.length ? `<ol class="record-turns">${turns.map(t => `<li><span class="record-age">${number(t.age)} 歲</span><div><span class="record-outcome">${({win:'勝',loss:'敗',choice:'抉擇',ending:'終章'})[t.outcome] || '紀事'}</span><h3>${words(t.title)}</h3><p>${escape(t.text)}</p></div></li>`).join('')}</ol>` : '<p class="record-empty">尚無已留存的重要轉折。</p>'}</section>
      <section class="record-section"><div class="record-section-heading"><h2>逐章翻閱</h2><span>完整留存紀事</span></div><p class="record-intro">展開篇章，重看當時的選擇與結果。</p><div class="record-years">${years.length ? years.map(year => `<details><summary><span>${number(year.age)} 歲</span><strong>${words(year.title)}</strong><small>${list(year.records).length} 則紀事</small></summary><ol>${list(year.records).map(r => `<li><h3>${words(r.title)}</h3><p>${escape(r.text)}</p>${effects(r.effect)}</li>`).join('') || '<li>本章尚無紀事。</li>'}</ol></details>`).join('') : '<p class="record-empty">尚無留存的篇章。</p>'}</div></section>
    </article>`;
  }
  function shareSVG(report) {
    report = report || {};
    const id = report.identity || {}, ending = report.ending || {}, s = report.summary || {}, j = report.judgement || {};
    const wrap = (value, length, maximum) => {
      const chars = Array.from(String(value == null ? '' : value));
      const lines = [];
      for (let start=0;start<chars.length && lines.length<maximum;start+=length) lines.push(chars.slice(start,start+length).join(''));
      if (chars.length > length*maximum) lines[maximum-1] = Array.from(lines[maximum-1]).slice(0,-1).join('') + '…';
      return lines;
    };
    const lineText = (value, x, y, size, length, maximum, color) => wrap(value,length,maximum).map((line,i) => `<text x="${x}" y="${y+i*(size+14)}" font-size="${size}" fill="${color || '#253b34'}">${escape(line)}</text>`).join('');
    const honors = list(report.honors).slice(0,3);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1320" viewBox="0 0 1000 1320" role="img" aria-labelledby="card-title"><title id="card-title">${escape(id.name)}的江湖一生錄 · ${escape(ending.title)}</title><rect width="1000" height="1320" fill="#f5f3ea"/><path d="M0 340L160 190 280 290 460 120 650 295 800 170 1000 320V0H0Z" fill="#e4e8dd"/><path d="M0 1210L180 1050 325 1160 490 980 660 1120 820 1000 1000 1140V1320H0Z" fill="#e1e6d9"/><rect x="34" y="34" width="932" height="1252" fill="none" stroke="#9da98d"/><rect x="48" y="48" width="904" height="1224" fill="none" stroke="#d0d5c5"/><g font-family="Microsoft JhengHei, Noto Serif TC, sans-serif"><text x="90" y="116" font-size="22" letter-spacing="7" fill="#a44732">江湖一生錄 · ${id.ended ? '此生定卷' : '行旅未竟'}</text>${lineText(id.name,90,214,58,13,2)}${lineText(`${id.sect == null ? '未留存' : id.sect} · ${id.age == null ? '未留存' : id.age} 歲`,90,354,25,27,1,'#64735c')}<line x1="90" x2="910" y1="392" y2="392" stroke="#b8c2aa"/>${lineText(ending.title,90,456,40,19,1)}${lineText(j.title,90,510,23,32,1,'#a44732')}${lineText(j.text,90,566,24,31,3,'#53634e')}<g font-size="21" fill="#65755e"><text x="90" y="744">歲月 / 篇章</text><text x="375" y="744">決鬥勝負</text><text x="650" y="744">名望 / 傳承</text></g><g font-size="34"><text x="90" y="794">${number(s.years)} / ${number(s.chapters)}</text><text x="375" y="794">${number(s.duelsWon)} / ${number(s.duelsLost)}</text><text x="650" y="794">${number(s.fame)} / ${number(s.legacy)}</text></g><line x1="90" x2="910" y1="840" y2="840" stroke="#b8c2aa"/><text x="90" y="890" font-size="20" fill="#a44732" letter-spacing="5">江湖留名</text>${honors.length ? honors.map((h,i) => lineText(`◆ ${h.title}`,90,942+i*52,25,29,1)).join('') : lineText('平凡行路，亦是一生。',90,942,25,29,1)}${lineText(`人生種子 ${id.seed == null ? '未留存' : id.seed}`,90,1172,19,43,1,'#65755e')}<text x="90" y="1220" font-size="18" letter-spacing="4" fill="#65755e">一念起，一生江湖。</text></g></svg>`;
  }
  return { renderReport, shareSVG };
});
