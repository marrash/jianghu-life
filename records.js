(function(root){
  'use strict';
  const keys=['skill','inner','body','agility','insight'],copy=x=>JSON.parse(JSON.stringify(x)),MAX=50;
  function hash(text){let a=2166136261,b=5381;for(const c of text){a=Math.imul(a^c.codePointAt(0),16777619)>>>0;b=(Math.imul(b,33)^c.codePointAt(0))>>>0;}return a.toString(36)+b.toString(36);}
  function committed(state){const s=copy(state);if(s.phase==='action'&&s.training?.rolled&&s.training.base)Object.assign(s,s.training.base.stats);return s;}
  function frame(s,G){return{year:s.year,age:G.age(s),stats:Object.fromEntries(keys.map(k=>[k,s[k]]))};}
  function begin(state,G,id){const s=copy(state),f=frame(committed(s),G);s.chronicle={version:1,id:String(id),complete:true,since:f.age,initial:f,frames:[],peaks:copy(f.stats)};return s;}
  function observe(state,G){const s=copy(state),f=frame(committed(s),G);
    if(!s.chronicle)s.chronicle={version:1,id:'continued-'+hash(JSON.stringify([s.name,s.seed,s.version,s.history])),complete:false,since:f.age,initial:null,frames:[],peaks:copy(f.stats)};
    const c=s.chronicle;for(const k of keys)c.peaks[k]=Math.max(c.peaks[k],f.stats[k]);
    const i=c.frames.findIndex(x=>x.year===f.year);if(i<0)c.frames.push(f);else c.frames[i]=f;return s;
  }
  function restore(input,G){const s=G.restore(input),c=s.chronicle;if(c===undefined)return s;const fail=()=>{throw Error('生涯快照不完整或已損壞，原資料未變更');};
    const stats=v=>v&&keys.every(k=>Number.isInteger(v[k])&&v[k]>=0&&v[k]<=150);
    const validFrame=f=>f&&Number.isInteger(f.year)&&f.year>=1&&f.year<=s.year&&Number.isInteger(f.age)&&f.age>=15&&f.age<=G.age(s)&&stats(f.stats);
    if(!c||c.version!==1||typeof c.id!=='string'||!c.id.length||c.id.length>128||typeof c.complete!=='boolean'||!Number.isInteger(c.since)||c.since<15||c.since>G.age(s)||!stats(c.peaks)||!Array.isArray(c.frames)||c.frames.length>21)fail();
    if(c.initial!==null&&!validFrame(c.initial)||c.complete&&(!c.initial||c.initial.year!==1||c.initial.age!==15||c.since!==15)||!c.complete&&c.initial!==null)fail();
    if(c.frames.some((f,i)=>!validFrame(f)||f.age<c.since||i>0&&(f.year<=c.frames[i-1].year||f.age<c.frames[i-1].age)))fail();
    if([...c.frames,...(c.initial?[c.initial]:[])].some(f=>keys.some(k=>f.stats[k]>c.peaks[k])))fail();return s;
  }
  const trialResult=h=>h.type==='trial'?h.text.match(/骰出\s*(\d+)，門檻\s*\d+，(成功|失敗)/):null;
  function report(state,G){const s=committed(state),c=s.chronicle,ended=s.phase==='ending',e=ended?G.ending(s):{title:`行至 ${G.age(s)} 歲，故事未完`,tag:'此生仍在途中',body:'這一卷記下已經發生的事，往後的選擇仍由你決定。'},l=G.lifeInfo?.(s),duels=s.duels||[],trials=s.history.filter(h=>h.type==='trial');
    const won=trials.filter(h=>trialResult(h)?.[2]==='成功'),lost=trials.filter(h=>trialResult(h)?.[2]==='失敗');
    const summary={years:G.age(s)-15,chapters:s.year,duelsWon:duels.filter(d=>d.won).length,duelsLost:duels.filter(d=>!d.won).length,roundsWon:duels.reduce((n,d)=>n+d.wins,0),roundsLost:duels.reduce((n,d)=>n+3-d.wins,0),trialsWon:won.length,trialsLost:lost.length,trialsSkipped:trials.length-won.length-lost.length,diceCount:s.version>=3?s.history.filter(h=>h.type==='training').reduce((n,h)=>n+(h.text.match(/擲出 ([\d、]+)；/)?.[1].split('、').length||0),0):null,fame:s.fame,virtue:s.virtue,legacy:s.legacy,money:s.money,realm:l?.realm||G.mastery(s),fate:l?.fate||'舊版未記錄命格',scars:l?.scars||0};
    const honors=[];const honor=(condition,title,detail)=>{if(condition)honors.push({title,detail});};
    honor(duels.length===5&&summary.duelsWon===5,'五戰皆捷','五場重要比武全部勝出。');
    honor(s.flags.duel11,'群峰留名','在四十歲的群峰論武勝出。');
    honor(s.flags.savedFriend,'以命護友','施展禁術救回陸長風，付出自身修為與壽元。');
    honor(s.flags.disciple&&s.legacy>=55,'薪火不滅','收下弟子，並將傳承累積至 55 以上。');
    honor(s.flags.head&&s.contribution>=65,'山門有繼','接掌山門，師門貢獻累積至 65 以上。');
    honor(s.flags.shadow&&s.flags.atoned,'回頭有路','沒有抹去過錯，而是留下後來的補償。');
    honor(s.flags.reconcile,'一笑泯恩仇','與顧寒重坐茶席，留下半生故人的情誼。');
    const failAt=s.history.findIndex(h=>trialResult(h)?.[2]==='失敗');
    honor(failAt>=0&&s.history.slice(failAt+1).some(h=>trialResult(h)?.[2]==='成功'),'一敗再起','重大關口受挫後，仍在後來的挑戰中成功。');
    honor(s.saga?.extended,'仙凡一渡','成功渡過首次天劫，走入凡人壽數之外。');
    honor(e.id==='celestial','九霄登仙','在兩百歲通過最終天劫，將此生寫到登仙。');
    if(!honors.length)honors.push({title:ended?'自有一生':'江湖初行',detail:ended?'走完自己的路，勝負與人情都已留在卷中。':'每一次已作出的選擇，都會成為往後的故事。'});
    const relationships=[
      {name:'沈照雪',role:'授業恩師',value:s.master,text:s.flags.masterBook?'你將師父的心得整理成書。':s.flags.head?'你接過了山門的責任。':'從初入山門開始，師父看著你的功夫與選擇。'},
      {name:'陸長風',role:'同門師兄',value:s.brother,text:s.flags.friendLost?'禁術未能挽回他的舊傷。這道遺憾，仍留在你的人生裡。':s.flags.savedFriend?'你以修為與壽元救回了他。':s.flags.treated?'你曾陪他求醫，沒有迴避故人的傷痛。':s.flags.helped?'他記得你接過山階上的那一擔水。':'你們的情誼，留在同行與各自作出的選擇之間。'},
      {name:'顧寒',role:s.flags.reconcile?'半生故人':'同屆勁敵',value:s.rival,text:s.flags.reconcile?'風雪中的那盞茶，讓你們放下了只談勝負的日子。':s.flags.honor?'你拒絕暗中探查他的弱點，選擇堂堂正正較量。':'這一路的交鋒，留下了敬意與未完的話。'}
    ];
    if(s.flags.disciple)relationships.push({name:'林溪',role:'門下弟子',value:s.legacy,text:s.flags.successor?'你把最後一式傳給他，讓所學有了後來的路。':'你替那個提木劍的孩子打開了山門。'});
    if(G.age(s)>75)for(const r of relationships)r.text+=' 故人的音容，留在舊信與後人的轉述裡。';
    let judgement={title:'走自己的路，留下自己的回聲',text:`${G.age(s)-15} 載歲月，${summary.duelsWon} 場比武勝出、${summary.duelsLost} 場落敗。這一生的分量，也在你留下的情誼與傳承之中。`};
    if(e.id==='celestial')judgement={title:'踏過九霄，也曾走過人間',text:`從十五歲的山門走到兩百歲的天劫，${won.length} 次關口成功${lost.length?`、${lost.length} 次受挫`:''}，才構成了這一卷登仙之路。`};
    else if(e.id==='fallen')judgement={title:'未能歸來，也不抹去來路',text:'最終天劫收束了此生，但最後一次失敗並不能抹去你曾經修成的境界、守護的人與留下的功夫。'};
    else if(honors.some(h=>h.title==='一敗再起'))judgement={title:'不是一路順遂，仍然向前',text:`${lost.length} 次重大關口失敗曾改變你的路。後來的成功，也確實寫在卷裡；傷勢與成果都值得被看見。`};
    else if(s.flags.disciple&&s.legacy>=55)judgement={title:'招式會老，薪火仍在',text:'你把所學交給後來的人。除了最後的境界，這份傳承也是你留下的成績。'};
    const coverage={since:c?.since??null,complete:c?.complete===true,note:!c?'舊存檔未留存能力快照；僅顯示現有能力與原始紀事，不推算初始值或歷史巔峰。':c.complete?'能力巔峰統計已確認的修行與抉擇；尚未確認的骰子分配不計入。':`能力快照從 ${c.since} 歲起留存；以下巔峰僅指已記錄期間，先前數據未留存。`};
    const years=[...new Set(s.history.map(h=>h.year))].map(year=>({year,age:s.history.find(h=>h.year===year)?.age??G.chapters[year-1].age,title:G.chapters[year-1].title,records:copy(s.history.filter(h=>h.year===year))}));
    const important=new Set(['山門以外','名聲的價錢','一個提木劍的孩子','山門的下一盞燈','後來的江湖','風雪中的茶','一生的去處']);
    const turningPoints=s.history.filter(h=>['battle','trial','ending'].includes(h.type)||h.type==='event'&&important.has(h.title)).map(h=>({age:h.age??G.chapters[h.year-1].age,title:h.title,text:h.text,type:h.type,outcome:h.type==='ending'?'ending':trialResult(h)?trialResult(h)[2]==='成功'?'win':'loss':h.type==='battle'?(duels.find(d=>d.year===h.year)?.won?'win':'loss'):'choice'}));
    return{identity:{name:s.name,age:G.age(s),sect:G.sects[s.sect].name,origin:G.origins[s.origin].name,route:G.routes[s.route].name,seed:s.seed,secret:!!s.cheat,ended},ending:e,judgement,summary,coverage,stats:keys.map(key=>({key,label:G.labels[key],initial:c?.initial?.stats[key]??null,final:s[key],peak:c?.peaks[key]??null})),growth:c?[...(c.initial?[c.initial]:[]),...c.frames]:[],honors,relationships,turningPoints,years};
  }
  function text(r){const i=r.identity,v=r.summary;return[
    `江湖生涯卷 · ${i.name}`,`${r.ending.tag}｜${r.ending.title}`,`${i.age} 歲成卷｜${i.sect}｜${i.origin}｜${i.route}`,`種子：${i.seed}${i.secret?'｜別卷人生（祕碼）':''}`,r.ending.body,'',r.judgement.title,r.judgement.text,
    '',`比武 ${v.duelsWon} 勝 ${v.duelsLost} 負｜交鋒 ${v.roundsWon} 合得勢 ${v.roundsLost} 合失勢`,`關口 ${v.trialsWon} 成 ${v.trialsLost} 敗 ${v.trialsSkipped} 次退讓｜境界 ${v.realm}｜命格 ${v.fate}`,`聲望 ${v.fame}｜俠義 ${v.virtue}｜傳承 ${v.legacy}｜餘財 ${v.money} 兩`,
    '',r.coverage.note,...r.stats.map(s=>`${s.label}：初始 ${s.initial??'未留存'}／已記錄巔峰 ${s.peak??'未留存'}／目前 ${s.final}`),
    '', '此生留下的成就',...r.honors.map(h=>`${h.title}：${h.detail}`),'','故人與傳承',...r.relationships.map(p=>`${p.name}｜${p.role} ${p.value}/100：${p.text}`),'','完整人生紀事',
    ...r.years.flatMap(y=>[`第 ${y.year} 章 · ${y.title}`,...y.records.map(h=>`${h.age??y.age} 歲｜${h.title}\n${h.text}\n${Object.entries(h.effect||{}).filter(([,v])=>v).map(([k,v])=>`${({skill:'武學',inner:'內功',body:'體魄',agility:'身法',insight:'悟性',money:'盤纏',health:'健康',energy:'內力',fame:'聲望',virtue:'俠義',legacy:'傳承',contribution:'貢獻',master:'師父信任',brother:'師兄情誼',rival:'宿敵敬意'})[k]||k} ${v>0?'+':''}${v}`).join('、')}`)])
  ].join('\n');}
  function recordKey(s){return(s.chronicle?.id||'old')+'-'+hash(JSON.stringify([s.version,s.name,s.seed,s.history,keys.map(k=>s[k]),s.saga?.endKind]));}
  function add(entries,state,G,when=new Date().toISOString()){if(state.phase!=='ending')return entries;const s=restore(state,G),id=recordKey(s);if(entries.some(e=>e.id===id))return entries;if(entries.length>=MAX)throw Error('藏卷已達 50 段上限；請先匯出備份並移除不需保留的人生。');return[...entries,{id,savedAt:when,state:copy(s)}];}
  function pack(entries){return{format:'jianghu-life-archive',version:1,entries:copy(entries)};}
  function merge(existing,data,G){if(!data||data.format!=='jianghu-life-archive'||data.version!==1||!Array.isArray(data.entries)||data.entries.length>MAX)throw Error('不是有效的江湖藏卷備份');const incoming=data.entries.map(e=>{if(!e||typeof e.id!=='string'||typeof e.savedAt!=='string'||!Number.isFinite(Date.parse(e.savedAt)))throw Error('藏卷索引損壞');const s=restore(e.state,G);if(s.phase!=='ending'||e.id!==recordKey(s))throw Error('藏卷內容與索引不符');return{id:e.id,savedAt:e.savedAt,state:s};});
    const result=[...existing];for(const e of incoming)if(!result.some(x=>x.id===e.id))result.push(e);if(result.length>MAX)throw Error('合併後超過 50 段上限，原本藏卷未變更');return result;
  }
  function persist(storage,changes){const previous=changes.map(([key])=>[key,storage.getItem(key)]);try{for(const [key,value] of changes)storage.setItem(key,value);}catch(error){try{for(const [key] of changes)storage.removeItem(key);for(const [key,value] of previous)if(value!==null)storage.setItem(key,value);}catch{throw Error('保存與還原失敗，請保留目前頁面並下載原有存檔備份');}throw Error('瀏覽器無法保存匯入內容，原有進度與藏卷已還原；請先備份並釋放空間');}}
  const api={begin,observe,restore,report,text,recordKey,add,pack,merge,persist,MAX};if(typeof module!=='undefined')module.exports=api;else root.JianghuRecords=api;
})(typeof window!=='undefined'?window:this);
