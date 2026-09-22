(function(root){
  const C=typeof module!=='undefined'?require('./content.js'):root.JianghuContent;
  const clone=s=>JSON.parse(JSON.stringify(s));
  const clamp=(v,min=0,max=100)=>Math.min(max,Math.max(min,v));
  const cheatCodes={'天生奇才':'talent','逍遙一生':'free','醉顛狂':'drunk',Marrash:'marrash'};
  const cheatInfo={talent:{power:80,money:200,hidden:false,text:'祕笈已啟用 · 天生奇才'},free:{power:80,money:200,hidden:false,text:'祕笈已啟用 · 逍遙一生'},drunk:{power:95,money:9999,hidden:true,text:'你身上有酒氣，卻沒有人看清你腰間的劍。'},marrash:{power:100,money:99999,hidden:true,text:'命簿翻到這一頁，竟是一片空白。'}};
  const unlimited=s=>s.cheat==='free'||s.cheat==='marrash';
  const freeSpecial=s=>unlimited(s)||s.cheat==='drunk';
  const moneyLimit=s=>s.cheat==='marrash'?99999:9999;
  function recover(s,chapter=false){if(s.cheat==='marrash'||(chapter&&s.cheat==='drunk')){s.health=100;s.energy=100;}}
  function roll(s){s.rng=(Math.imul(s.rng,1664525)+1013904223)>>>0;return s.cheat==='drunk'?6:1+s.rng%6;}
  const routes={swift:{name:'流雲快劍',tag:'以快制敵',desc:'搶攻獲額外加成，招牌三疊劍。',special:'流雲三疊'},heavy:{name:'藏鋒重劍',tag:'以守破勢',desc:'守勢獲額外加成，招牌山河劍。',special:'山河一劍'},palm:{name:'回瀾掌法',tag:'以柔化剛',desc:'試探獲額外加成，招牌回瀾掌。',special:'回瀾九轉'}};
  const actions={practice:{name:'精研武學',icon:'武',desc:'武學 +4～6、體魄 +1、健康 −3'},meditate:{name:'靜坐調息',icon:'氣',desc:'內功 +4、悟性 +1、內力 +12'},travel:{name:'行走江湖',icon:'行',desc:'身法 +3、聲望 +3、俠義 +2、健康 −4～9'},duty:{name:'師門差事',icon:'門',desc:'信任 +5、貢獻 +5、體魄 +2、盤纏 +12'},visit:{name:'拜訪師兄',icon:'友',desc:'情誼 +6、武學 +2、身法 +1'},rest:{name:'休養身心',icon:'息',desc:'健康 +18、內力 +10'},medicine:{name:'購藥調養',icon:'藥',desc:'花 12 兩：健康 +28、內力 +15'},work:{name:'護鏢謀生',icon:'鏢',desc:'盤纏 +20～25、體魄 +2、健康 −5'},teach:{name:'傳授所學',icon:'傳',desc:'36 歲解鎖：傳承 +9、悟性 +2、貢獻 +2'}};
  const choice=(label,hint,effect,result,flag)=>({label,hint,effect,result,flag});
  const stories=[
    [
      {title:'山門外的一擔水',who:'陸長風 · 同門師兄',body:'入門的第一日，陸師兄的舊傷忽然發作。兩桶山泉翻在石階上，遠處已響起晨練的鐘聲。他笑著說沒事，卻遲遲站不起來。',choices:[choice('接過扁擔，陪他慢慢上山','情誼 +12，健康 −4',{brother:12,health:-4},'你錯過了第一場晨練。陸長風記住的，卻是你扶住他的那隻手。','helped'),choice('留下傷藥，先去赴晨練','武學 +4，盤纏 −3',{skill:4,money:-3},'他收下傷藥，讓你別誤了時辰。你在晨練中學會了第一式劍招。'),choice('請師父下山查看','信任 +8，情誼 −2',{master:8,brother:-2},'師父替他封住穴道，命他休養。陸長風有些難堪，卻沒再硬撐。')]},
      {title:'第一道劍痕',who:'沈照雪 · 授業恩師',body:'沈照雪將一截竹枝遞給你：「先別急著問何時能贏。告訴我，你為什麼學劍？」風停了，演武場上只剩你的回答。',choices:[choice('為了護住身邊的人','體魄 +3，信任 +4',{body:3,master:4},'「那就先學會站穩。」她教你如何接住別人的第一劍。','protect'),choice('為了見一見最高處','武學 +4，宿敵敬意 +2',{skill:4,rival:2},'牆外的顧寒聽見了這句話，留下戰帖：「山頂見。」','ambition'),choice('為了弄懂自己的路','悟性 +4，內功 +2',{insight:4,inner:2},'師父沒有替你回答，只在心法的空白處留下一個「問」字。','seeker')]}
    ],
    [
      {title:'渡口有風',who:'山下 · 白蘆渡',body:'一位擺渡老人被地痞扣住了船。你尚未領到佩劍，手中只有一把練習木劍。遠處有人認出了青嵐門的衣袖。',choices:[choice('挺身而出，護住渡船','聲望 +6，健康 −8',{fame:6,health:-8,skill:2},'木劍斷成兩截，船卻回到了老人手裡。他說，來日過河不收你的錢。','ferry'),choice('找準空隙，帶老人離開','身法 +4，悟性 +2',{agility:4,insight:2},'你帶他穿過蘆葦。他沒取回船，卻保住了今天的平安。'),choice('回門中請師長主持公道','信任 +5，盤纏 +4',{master:5,money:4},'門中派人討回渡船。你明白，有時借力也能把事情做好。')]},
      {title:'顧寒的戰帖',who:'顧寒 · 同屆勁敵',body:'顧寒把戰帖壓在你的飯碗下：「後山，日落。輸的人替對方磨一個月的劍。」他的指節上也滿是新繭。',choices:[choice('赴約，痛快切磋','武學 +4，敬意 +7，健康 −5',{skill:4,rival:7,health:-5},'夕陽落下時，你們都沒力氣再說狠話。顧寒第一次直呼你的名字。','sparred'),choice('邀他先一起拆解劍譜','悟性 +4，敬意 +3',{insight:4,rival:3},'你指出劍譜中的破綻。他嘴上不服，第二日卻又帶著書來了。'),choice('專心自己的功課','內功 +4',{inner:4},'你沒有赴約。顧寒獨自練到深夜，你也終於穩住了吐納。')]}
    ],
    [
      {title:'半卷舊心法',who:'藏書閣 · 雨夜',body:'整理書閣時，你找到半卷殘缺的吐納法。它能讓內息運轉更快，但最後一頁已被火燒去。',choices:[choice('請師父共同補全','內功 +4，信任 +4',{inner:4,master:4},'師父刪去了最危險的一段。你們直到雨停才合上書。'),choice('以身試法，求一次突破','內功 +8，健康 −12',{inner:8,health:-12},'內息終於衝開關竅，胸口卻留下一陣隱痛。這條捷徑有它的價錢。','risk'),choice('只記下可確定的部分','悟性 +5',{insight:5},'你抄錄了前半卷，將猜測留在頁邊。練武也需要承認不知道。')]},
      {title:'一封未寄的家書',who:'陸長風 · 燈下',body:'陸長風已經三年沒有回家。他托你捎封信下山，恰巧也是師父開小灶授課的日子。',choices:[choice('替他跑這一趟','情誼 +8，聲望 +2',{brother:8,fame:2},'他母親塞給你一包桂花糕。回山時，陸長風在山門等到燈油燃盡。','letter'),choice('留下聽課，託車夫送信','武學 +5，盤纏 −5',{skill:5,money:-5},'信送到了，你也記住了劍法最關鍵的轉折。'),choice('勸他親自請假回家','情誼 +4，悟性 +3',{brother:4,insight:3},'他終於向師父開了口。原來那句「不准回家」，從未有人說過。')]},
      {title:'有人記得那一擔水',who:'往事回響 · 第一年',body:s=>s.flags.helped?'你困在劍招的最後一轉。陸長風提著兩壺茶坐到身邊：「第一年你替我挑水，今晚我替你守燈。」他把珍藏的筆記攤在膝上。':'你困在劍招的最後一轉。陸長風仍在照顧舊傷，無暇陪你拆招。山舍裡只有一本劍譜與你自己的影子。',choices:[choice('把這一式練到天亮','依往事獲得不同幫助',s=>s.flags.helped?{skill:7,brother:4}:{skill:3,health:-3},s=>s.flags.helped?'在他的指點下，你終於理解了那道劍意。當年的善意回到了自己身上。':'你獨自練成了半式。路慢一些，腳步仍然是自己的。'),choice('放下劍，先好好睡一晚','健康 +10，悟性 +2',{health:10,insight:2},'天亮時，昨夜糾結的那一轉忽然不再艱難。')]}
    ],
    [
      {title:'山雨欲來',who:'青嵐門 · 演武場',body:'大比名額將定，門中弟子開始私下較勁。有人提議把顧寒閉關的破綻告訴你，只求你日後照拂。',choices:[choice('拒絕，堂堂正正地比','敬意 +8，信任 +3',{rival:8,master:3},'消息傳到顧寒耳中。他沒有道謝，卻將你的名字寫在最想交手的人之首。','honor'),choice('研究破綻，提前準備','悟性 +4，敬意 −5',{insight:4,rival:-5},'你記下他起手的習慣。這會讓第一回合更容易，但你們之間多了一層隔閡。','scout'),choice('替兩人約一次公開試招','武學 +3，情誼 +4',{skill:3,brother:4},'演武場多了幾位觀眾。那場比試沒分勝負，卻少了許多流言。')]},
      {title:'斷橋另一端',who:'山道 · 暴雨',body:'山洪沖毀了木橋，一位採藥人困在對岸。門派考核明早開始，繞路救人就趕不上最後一場特訓。',choices:[choice('繞山救人','聲望 +8，健康 −6',{fame:8,health:-6},'你背他走過整夜山路。錯過的是一堂課，留下的是一條命。','rescue'),choice('結繩搭索，請同門協力','體魄 +3，情誼 +4',{body:3,brother:4},'眾人合力把人拉過溪谷。你第一次覺得，門派的力量並不只在劍上。'),choice('通知附近村民，趕回特訓','武學 +5，盤纏 −4',{skill:5,money:-4},'你付錢請熟悉山路的人救援。回山時，演武場的燈還亮著。')]}
    ],
    [
      {title:'大比前夜',who:'陸長風 · 山舍',body:'陸長風的舊傷又發了。他仍堅持明日上場，因為這是最後一次爭取下山名額的機會。你知道，勸說未必有用。',choices:[choice('運功替他療傷','情誼 +12，內力 −18',{brother:12,energy:-18},'你替他穩住經脈。自己的丹田空了一截，他卻終於能安穩睡去。','healed'),choice('請師父撤下他的名額','信任 +8，情誼 −6',{master:8,brother:-6},'師父攔住了他。他暫時不願見你，但那道舊傷總算有機會養好。','stopped'),choice('陪他商量退場的時機','情誼 +5，悟性 +3',{brother:5,insight:3},'你們約定，只要手指開始發麻便認輸。有時退一步也需要勇氣。')]},
      {title:'劍穗與遠行',who:'沈照雪 · 山門',body:'沈照雪替你繫好劍穗：「這次大比決定誰代表青嵐門下山。但你要記得，名次只能替你開一扇門。」',choices:[choice('最後再練一次招牌劍式','武學 +4，內力 −6',{skill:4,energy:-6},'你在晨霧中把那一式練了三遍，劍尖終於不再顫抖。'),choice('靜坐，把呼吸留給明天','內力 +16，健康 +6',{energy:16,health:6},'山風吹過竹葉。你睡得很好，醒來時心裡沒有多餘的聲音。'),choice('向師父請教應變','悟性 +4，信任 +3',{insight:4,master:3},'「看對方的肩，不要只看他的劍。」這是她送你的最後一句提醒。')]},
      {title:'走上擂台之前',who:'往事回響 · 五年',body:s=>s.brother>=55?'陸長風把一瓶回氣散塞進你掌心：「這些年欠你的，先還一點。」另一端，顧寒已經拔劍，正等你走完最後幾級台階。':'你獨自走過長廊。這五年的晨霧、傷痕與抉擇，都落在掌中這柄劍上。顧寒已經站在擂台另一端。',choices:[choice('接住這五年，走上擂台','情誼深厚時獲得回氣散',s=>s.brother>=55?{energy:14}:{insight:2},s=>s.brother>=55?'回氣散暖過丹田。你知道，這場比武有人與你一起走到了這裡。':'你把劍握穩。這一路的選擇，會由自己接下。')]}
    ]
  ];
  stories.push(...C.later);
  const labels={body:'體魄',inner:'內功',agility:'身法',insight:'悟性',skill:'武學',health:'健康',energy:'內力',money:'盤纏',fame:'聲望',master:'師父信任',brother:'師兄情誼',rival:'宿敵敬意',virtue:'俠義',contribution:'師門貢獻',legacy:'傳承'};
  const stats=Object.keys(labels),trained=['body','inner','agility','insight','skill'];
  const vocations={wander:'行俠四方',guardian:'守護故人',leader:'振興師門'};
  const age=s=>C.chapters[s.year-1].age;
  const personalize=(s,text)=>String(text).replaceAll('青嵐門',C.sects[s.sect].name).replaceAll('青嵐山',C.sects[s.sect].place);
  function create(name,route,seed,options={}){
    const sect=options.sect||'qinglan',origin=options.origin||'poor';
    if(!routes[route]||!C.sects[sect]||!C.origins[origin])throw Error('未知出身、門派或武學');
    seed=String(seed||'青嵐').slice(0,32);let rng=2166136261;for(const c of seed)rng=Math.imul(rng^c.codePointAt(0),16777619)>>>0;
    const s={version:2,name:String(name||'沈行舟').trim().slice(0,12)||'沈行舟',route,sect,origin,seed,rng,year:1,phase:'action',ap:3,eventIndex:0,body:20,inner:route==='palm'?26:20,agility:route==='swift'?26:18,insight:20,skill:route==='heavy'?26:20,health:90,energy:65,money:20,fame:0,master:25,brother:25,rival:20,virtue:20,contribution:0,legacy:0,vocation:'wander',retire:'duty',flags:{},history:[],duels:[],battle:{round:0,wins:0,pattern:0,logs:[]}};
    apply(s,C.origins[origin].bonus);apply(s,C.sects[sect].bonus);
    if(Object.hasOwn(cheatCodes,seed)){s.cheat=cheatCodes[seed];const c=cheatInfo[s.cheat];for(const k of trained)s[k]=c.power;s.health=100;s.energy=100;s.money=c.money;record(s,'secret','山門初見',c.text);}
    return s;
  }
  function adjusted(s,e){const out={};for(const[k,v]of Object.entries(e)){let n=v;if(v<0&&unlimited(s)&&['money','energy'].includes(k))n=0;if(v>0&&trained.includes(k)&&s[k]>=60)n=Math.max(1,Math.floor(v*(s[k]>=85?.35:.65)));out[k]=clamp(s[k]+n,0,k==='money'?moneyLimit(s):100)-s[k];}if(s.cheat==='marrash'){out.health=100-s.health;out.energy=100-s.energy;}return out;}
  function apply(s,e){const actual=adjusted(s,e);for(const[k,v]of Object.entries(actual))s[k]+=v;const before={health:s.health,energy:s.energy};recover(s);for(const k of Object.keys(before))if(s[k]!==before[k])actual[k]=(actual[k]||0)+s[k]-before[k];return actual;}
  function record(s,type,title,text,e={}){s.history.push({year:s.year,age:age(s),type,title:personalize(s,title),text:personalize(s,text),effect:e});}
  function canAct(s,id){return s.phase==='action'&&Object.hasOwn(actions,id)&&s.ap>0&&(id!=='medicine'||unlimited(s)||s.money>=12)&&(id!=='teach'||s.year>=10);}
  function act(state,id){
    if(!canAct(state,id))throw Error('現在不能進行此行動，請檢查盤纏或年齡');
    const s=clone(state),d=roll(s);let e;
    switch(id){case'practice':e={skill:4+Math.floor((d-1)/2),body:1,health:-3};break;case'meditate':e={inner:4,insight:1,energy:12};break;case'travel':e={agility:3,fame:3,virtue:2,health:-(3+d)};break;case'duty':e={master:5,contribution:5,body:2,money:12};break;case'visit':e={brother:6,skill:2,agility:1};break;case'medicine':e={money:-12,health:28,energy:15};break;case'work':e={money:19+d,body:2,health:-5};break;case'teach':e={legacy:9,insight:2,contribution:2};break;default:e={health:18,energy:10};}
    for(const[k,v]of Object.entries(C.sects[s.sect][id]||{}))e[k]=(e[k]||0)+v;
    if(s.year>=6){if(id==='travel'&&s.vocation==='wander')e.fame+=2;if(id==='visit'&&s.vocation==='guardian')e.health=3;if(id==='duty'&&s.vocation==='leader')e.contribution+=3;}
    const actual=apply(s,e);record(s,'action',actions[id].name,id==='practice'?`你反覆拆解招式，這次練功的手感為 ${d}／6。`:id==='travel'?'你走過一段新的山路，也見到一些需要幫助的人。':id==='teach'?'你把招式背後的道理拆開，讓後輩能自己走下一步。':'日子緩緩流過，功夫與情分都在點滴累積。',actual);
    s.ap--;if(s.ap===0)s.phase='event';return s;
  }
  function rawEvent(s){return stories[s.year-1]?.[s.eventIndex];}
  function canChoose(s,index){const c=rawEvent(s)?.choices[index];if(s.phase!=='event'||!c||(c.require&&!c.require(s)))return false;const e=typeof c.effect==='function'?c.effect(s):c.effect;return unlimited(s)||(s.money+(e.money||0)>=0&&s.energy+(e.energy||0)>=0);}
  function event(s){const x=rawEvent(s);if(!x)throw Error('找不到事件');return {...x,title:personalize(s,x.title),who:personalize(s,x.who),body:personalize(s,typeof x.body==='function'?x.body(s):x.body),choices:x.choices.map((c,i)=>{const e=typeof c.effect==='function'?c.effect(s):c.effect;return {...c,effect:e,preview:adjusted(s,e),enabled:canChoose(s,i),locked:c.require&&!c.require(s)?'需師門貢獻至少 45':!unlimited(s)&&s.money+(e.money||0)<0?'盤纏不足':!unlimited(s)&&s.energy+(e.energy||0)<0?'內力不足':''};})};}
  function choose(state,index){
    if(!canChoose(state,index))throw Error('目前不能選擇此項');
    const c=rawEvent(state).choices[index],s=clone(state),e=typeof c.effect==='function'?c.effect(s):c.effect;
    const result=typeof c.result==='function'?c.result(s):c.result;const actual=apply(s,e);
    if(c.flag){if(c.flag.startsWith('vocation:'))s.vocation=c.flag.split(':')[1];else if(c.flag.startsWith('retire:'))s.retire=c.flag.split(':')[1];else s.flags[c.flag]=true;}
    // The prologue predates virtue; its remembered acts now contribute to a lifelong reputation.
    if(s.year<=5&&['helped','protect','ferry','rescue','honor','healed'].includes(c.flag)){Object.assign(actual,apply(s,{virtue:3}));}
    record(s,'event',rawEvent(state).title,`${c.label}。${result}`,actual);s.eventIndex++;
    if(s.eventIndex>=stories[s.year-1].length){s.phase=C.duels[s.year]?'battle':'review';if(s.phase==='battle')s.battle={round:0,wins:0,pattern:roll(s)%3,logs:[]};}return s;
  }
  function nextYear(state){
    if(state.phase!=='review'||state.year>=15)throw Error('目前不能進入下一章');const s=clone(state);s.year++;s.ap=3;s.eventIndex=0;s.phase='action';
    const e={energy:12,health:age(s)>=50?(s.flags.longevity?-2:-6):4};if(s.flags.business)e.money=18;
    const actual=apply(s,e);const before={health:s.health,energy:s.energy};recover(s,true);for(const k of Object.keys(before))if(s[k]!==before[k])actual[k]=(actual[k]||0)+s[k]-before[k];record(s,'passage',`${age(s)} 歲 · 歲月流轉`,`${C.chapters[s.year-1].desc}${s.flags.business?' 合夥商路送來十八兩分紅。':''}${age(s)>=50?' 年歲漸長，需要更留心養傷與調息。':''}`,actual);return s;
  }
  const stances=[{name:'試探',hint:'對手步伐游移，出招虛實不定。搶攻可以打斷試探。',counter:'attack'},{name:'搶攻',hint:'對手壓低重心，準備搶進。守勢能卸去鋒芒。',counter:'guard'},{name:'守勢',hint:'對手收勢等待，守住中線。試探可以找出空隙。',counter:'probe'}];
  const moves={attack:'搶攻',guard:'守勢',probe:'試探',special:'招牌武學'};
  const stance=s=>stances[(s.battle.pattern+s.battle.round)%3];
  function mastery(s){return s.skill>=85?'登峰造極':s.skill>=65?'融會貫通':s.skill>=40?'登堂入室':'初窺門徑';}
  function fight(state,move){
    if(state.phase!=='battle'||!Object.hasOwn(moves,move))throw Error('目前不能出招');
    if(move==='special'&&!freeSpecial(state)&&state.energy<18)throw Error('內力不足');
    const s=clone(state),r=s.battle.round,st=stance(s),duel=C.duels[s.year];
    const base=Math.round(s.skill*.48+s.inner*.22+s.body*.12+s.agility*.10+s.insight*.08);
    let tactic=move===st.counter?10:move==='special'?13:0;
    if((s.route==='swift'&&move==='attack')||(s.route==='heavy'&&move==='guard')||(s.route==='palm'&&move==='probe'))tactic+=5;
    if(move==='probe')tactic+=Math.floor(s.insight/15);
    if(s.year===5&&r===0&&s.flags.scout)tactic+=6;
    if(s.year===8&&s.flags.riverIntel)tactic+=4;
    if(s.year===11&&s.flags.rigged)tactic+=3;
    const health=-Math.floor((100-s.health)/7),die=roll(s),target=duel.target+r*3;
    const total=base+tactic+health+die,won=unlimited(s)||total>=target;
    if(move==='special'&&!freeSpecial(s))s.energy-=18;
    s.battle.round++;if(won)s.battle.wins++;apply(s,{health:won?-2:-5});
    s.battle.logs.push({round:r+1,move:moves[move],stance:st.name,won,base,tactic,health,die,total,target});
    record(s,'battle',`${duel.name} · 第 ${r+1} 合 · ${won?'得勢':'失勢'}`,`你以${moves[move]}迎上${st.name}。實力 ${base} ＋ 策略 ${tactic} ＋ 狀態 ${health} ＋ 命運 ${die} ＝ ${total}；對手門檻 ${target}。${unlimited(s)&&total<target?'一股奇異的力量替你定下勝局。':''}`);
    if(s.battle.round===3){
      const victory=s.battle.wins>=2;s.flags['duel'+s.year]=victory;s.duels.push({year:s.year,name:duel.name,opponent:duel.opponent,wins:s.battle.wins,won:victory});
      const effect=apply(s,{fame:victory?10:3,contribution:victory?5:2});record(s,'duel',`${duel.name} · ${victory?'勝出':'落敗'}`,victory?duel.win:duel.lose,effect);
      s.phase=s.year===15?'ending':'review';if(s.phase==='ending')record(s,'ending',ending(s).title,ending(s).body);
    }return s;
  }
  const endings={
    guardian:{title:'有燈可歸，有人相候',tag:'故人長伴',hint:'選擇回到故人身邊，並累積深厚情誼。',body:'六十五歲那年，你把遠行的行囊收進櫃子。陸長風把茶壺放到桌上，沒有問何時再走。少年時想過許多偉業，如今一盞有人等的燈，已足以安放一生。'},
    mentor:{title:'你的招式，後來的江湖',tag:'一代宗師',hint:'選擇授業，並累積足夠傳承。',body:'六十五歲，你仍會在清晨推開學堂的門。林溪帶來新的弟子，孩子們用木劍比出你熟悉的起手。你的名字未必總在榜首，武學卻已走進許多人的一生。'},
    hermit:{title:'拂衣歸山，不問姓名',tag:'山河隱客',hint:'晚年選擇卸下職責，獨自看山河。',body:'你走到地圖之外的小山村，沒有人問你的名次。六十五歲的春天，你替屋前的樹修了枝，午後仍練一遍基本功。江湖偶爾傳來消息，你笑著聽完，繼續煮茶。'},
    leader:{title:'一門燈火，長明不息',tag:'開明掌門',hint:'接掌門派，維持貢獻與俠義，妥善交代責任。',body:'六十五歲，你把印信交給經眾人推選的後輩。門規能被討論，年輕人敢說不同意見。你留下的不是一張永遠屬於自己的椅子，而是一座你離開後仍能好好運轉的山門。'},
    champion:{title:'山河識我，俠名長存',tag:'武林名宿',hint:'群峰論武勝出，兼具聲望、俠義，並選擇交代責任。',body:'你的名字成了年輕人口中的一段故事。有人記得群峰台上的勝招，更多人記得危難時站出來的身影。六十五歲再過白蘆渡，船夫仍不肯收你的錢。'},
    atonement:{title:'回頭有路，餘生無愧',tag:'洗心歸正',hint:'曾收封口銀，後來主動補償並重新累積俠義。',body:'你沒有抹去那些不光彩的記錄，而是把歸還與道歉一筆筆寫在後面。六十五歲時，有人仍不原諒你，也有人肯再與你坐下喝茶。這一次，你不再急著替自己辯白。'},
    merchant:{title:'四海通途，知己滿座',tag:'江湖行商',hint:'累積商路與財力，選擇交代手上的責任。',body:'你把護送與商路交給可信的後輩，留下一本從不做假帳的規矩。六十五歲的生日，幾條商路都送來了信。你沒有贏遍天下，卻替許多人打通了可以平安回家的路。'},
    wanderer:{title:'一生走過，自有回聲',tag:'江湖故人',hint:'走完一生；沒有名號，也有自己的故事。',body:'六十五歲，你整理這一生的舊信。有勝有敗，有走散的人，也有終於說出口的話。你的名字沒有成為每個茶館裡的傳奇，但這些年認真走過的路，沒有人能替你重走。'}
  };
  function ending(s){let id='wanderer';if(s.retire==='roam')id='hermit';else if(s.retire==='home'&&s.brother>=65)id='guardian';else if(s.retire==='teach'&&s.legacy>=55)id='mentor';else if(s.flags.shadow&&s.flags.atoned&&s.virtue>=45)id='atonement';else if(s.retire==='duty'&&s.flags.head&&s.contribution>=65&&s.virtue>=45)id='leader';else if(s.retire==='duty'&&s.flags.duel11&&s.fame>=50&&s.virtue>=50)id='champion';else if(s.retire==='duty'&&s.flags.business&&s.money>=100)id='merchant';return {id,...endings[id]};}
  function restore(input){
    if(!input||typeof input!=='object'||![1,2].includes(input.version))throw Error('不支援的存檔版本');
    let s=clone(input);
    if(s.version===1){const base=create(s.name,s.route,s.seed);s={...base,...s,version:2,sect:'qinglan',origin:'poor',vocation:'wander',retire:'duty',virtue:30,contribution:0,legacy:0,duels:[]};delete s.cheat;s.battle={pattern:0,...s.battle};if(s.phase==='ending'&&s.year===5){s.phase='review';s.duels=[{year:5,name:'門派大比',opponent:'顧寒',wins:s.battle.wins,won:s.battle.wins>=2}];s.flags.duel5=s.battle.wins>=2;}}
    const fail=()=>{throw Error('存檔內容不完整或已損壞，原本進度未變更');};
    if(!Object.hasOwn(routes,s.route)||!Object.hasOwn(C.sects,s.sect)||!Object.hasOwn(C.origins,s.origin)||!Object.hasOwn(vocations,s.vocation)||!['home','teach','roam','duty'].includes(s.retire))fail();
    if(s.cheat!==undefined&&(!Object.hasOwn(cheatInfo,s.cheat)||cheatCodes[s.seed]!==s.cheat))fail();
    if(typeof s.name!=='string'||s.name.length>12||typeof s.seed!=='string'||s.seed.length>32||!Number.isInteger(s.rng)||s.rng<0||s.rng>4294967295)fail();
    if(!Number.isInteger(s.year)||s.year<1||s.year>15||!['action','event','review','battle','ending'].includes(s.phase))fail();
    for(const k of stats)if(!Number.isFinite(s[k])||s[k]<0||s[k]>(k==='money'?moneyLimit(s):100))fail();
    if(!s.flags||typeof s.flags!=='object'||Array.isArray(s.flags)||Object.values(s.flags).some(v=>typeof v!=='boolean'))fail();
    if(!Array.isArray(s.history)||s.history.length>300||s.history.some(h=>!h||!Number.isInteger(h.year)||h.year<1||h.year>15||typeof h.title!=='string'||typeof h.text!=='string'||typeof h.type!=='string'||!h.effect||typeof h.effect!=='object'||Object.entries(h.effect).some(([k,v])=>!stats.includes(k)||!Number.isFinite(v))))fail();
    if(s.history.some(h=>h.age!==undefined&&(!Number.isInteger(h.age)||h.age<15||h.age>65)))fail();
    if(!Number.isInteger(s.ap)||s.ap<0||s.ap>3||!Number.isInteger(s.eventIndex)||s.eventIndex<0||s.eventIndex>stories[s.year-1].length)fail();
    if((s.phase==='action'&&(s.ap===0||s.eventIndex!==0))||(s.phase==='event'&&(s.ap!==0||!rawEvent(s))))fail();
    if(!s.battle||!Number.isInteger(s.battle.round)||s.battle.round<0||s.battle.round>3||!Number.isInteger(s.battle.wins)||s.battle.wins<0||s.battle.wins>s.battle.round||!Number.isInteger(s.battle.pattern)||s.battle.pattern<0||s.battle.pattern>2||!Array.isArray(s.battle.logs)||s.battle.logs.length>3)fail();
    if(!Array.isArray(s.duels)||s.duels.length>5||s.duels.some(d=>!d||!Number.isInteger(d.year)||!Object.hasOwn(C.duels,d.year)||typeof d.name!=='string'||typeof d.opponent!=='string'||!Number.isInteger(d.wins)||d.wins<0||d.wins>3||typeof d.won!=='boolean'))fail();
    if(['review','battle','ending'].includes(s.phase)&&(s.ap!==0||s.eventIndex!==stories[s.year-1].length))fail();
    if(s.phase==='review'&&(s.year===15||(C.duels[s.year]&&s.battle.round!==3)))fail();
    if(s.phase==='battle'&&(!C.duels[s.year]||s.battle.round>=3))fail();
    if(s.phase==='ending'&&(s.year!==15||s.battle.round!==3))fail();return s;
  }
  const api={cheatInfo,unlimited,freeSpecial,create,act,event,choose,nextYear,fight,ending,restore,age,mastery,canAct,canChoose,stance,personalize,routes,actions,stances,moves,labels,vocations,endings,chapters:C.chapters,sects:C.sects,origins:C.origins,duelInfo:C.duels};
  if(typeof module !== 'undefined') module.exports = api;
  else root.Jianghu = api;
})(typeof window !== 'undefined' ? window : this);
