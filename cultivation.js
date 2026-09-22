(function(root){
  function extend(L){
    const copy=s=>JSON.parse(JSON.stringify(s)),keys=['skill','inner','body','agility','insight'];
    const clamp=(v,a=0,b=100)=>Math.max(a,Math.min(b,v));
    const codes={'天生奇才':'talent','逍遙一生':'free','醉顛狂':'drunk',Marrash:'marrash'};
    const traits={steady:'厚積薄發',daring:'逆境逢生',focused:'專精一道'};
    function random(s){s.rng=(Math.imul(s.rng,1664525)+1013904223)>>>0;return s.rng/4294967296;}
    const integer=(s,a,b)=>a+Math.floor(random(s)*(b-a+1));
    function diceChances(s){if(s.cheat)return [0,0,0,0,0,1];const luck=s.version===4?s.saga.luck:0,weights=Array.from({length:6},(_,i)=>(12+luck*(2*(i+1)-7))/72);if(s.traits.steady){weights[1]+=weights[0];weights[0]=0;}return weights;}
    function die(s){if(s.version!==4){const d=integer(s,1,6);return s.cheat?6:s.traits.steady?Math.max(2,d):d;}const n=random(s);let sum=0;for(const [i,p]of diceChances(s).entries()){sum+=p;if(n<sum)return i+1;}return 6;}
    const cap=s=>s.version===4?100+s.saga.realm*10:100;
    const lifeAge=s=>s.year>15?[75,90,110,140,170,200][s.year-16]:L.age(s);
    function log(s,type,title,text,effect={}){s.history.push({year:s.year,age:lifeAge(s),type,title,text,effect});}
    function apply(s,e){const actual={};for(const[k,v]of Object.entries(e)){const n=clamp(s[k]+v,0,k==='money'?9999:keys.includes(k)?cap(s):100);actual[k]=n-s[k];s[k]=n;if(keys.includes(k)&&s.carry)s.carry[k]=Math.min(s.carry[k],cost(s,k)-1);}return actual;}
    function cost(s,k){return (s[k]>=85?3:s[k]>=60?2:1)*(s[k]>=s.potential[k]?3:1);}
    function gain(s,k,points){const old=s[k];s.carry[k]+=points;while(s[k]<cap(s)&&s.carry[k]>=cost(s,k)){s.carry[k]-=cost(s,k);s[k]++;}if(s[k]===cap(s))s.carry[k]=0;return s[k]-old;}
    const freshTraining=()=>({rolled:false,dice:[],index:0,picks:[],base:null});
    const chanceModes=[{label:'穩中求進',target:2,good:2,bad:1},{label:'放手一試',target:3,good:4,bad:3},{label:'全力一搏',target:5,good:8,bad:7}];
    // Original encounters: prerequisites change the pool as the character ages and earns a name.
    const encounters=[
      ['rain','雨中練劍','雨打竹葉，你忽然聽見劍式之間未曾留意的節奏。','skill',1,15,'你在雨聲中接上了那一招。','腳下一滑，你只得帶著瘀傷收劍。'],
      ['breath','逆行的內息','新學的吐納法與原有習慣不同。你打算練到哪一步？','inner',1,15,'內息走過新的路徑，呼吸漸漸綿長。','胸中一陣滯悶，你停下來重新調息。'],
      ['cliff','崖邊採藥','山壁上長著止痛的草藥，腳下的岩層卻並不牢靠。','body',1,15,'你帶回草藥，也在攀爬中摸清身體的極限。','碎石滑落，空手回來的你擦破了手掌。'],
      ['foot','踏水過溪','師兄邀你試過溪流上的浮木。水流比昨日更急。','agility',1,15,'腳尖借到恰好的力量，你落在彼岸。','浮木一沉，你狼狽地游回岸邊。'],
      ['book','缺頁的劍譜','字跡殘缺的劍譜，留下三種可能的解法。','insight',1,15,'你把破綻標在頁邊，終於明白前人的用意。','推演到最後一式，才發現起手就解錯了。'],
      ['spar','同門試招','同門願意陪你拆招，也提醒你別逞強。','skill',1,5,'這次交手讓你看見自己忽略的死角。','急著求勝，反而將破綻全露了出來。'],
      ['night','夜守山門','守夜時遠處傳來異響，你要探得多深？','insight',1,5,'你發現鬆動的山石，提前替門中排除了危險。','追著聲響跑了一夜，回來才知道是山狐。'],
      ['escort','風雪護鏢','鏢隊要穿過積雪的山口，雇你協助開路。','money',6,15,'鏢車平安過關，你領到了酬銀。','風雪逼得眾人折返，路費花去不少。'],
      ['ambush','林間伏影','你察覺林中有人跟隨，還看不出對方的來意。','agility',6,15,'你繞到對方背後，讓這場埋伏無疾而終。','對方搶先出手，你負傷脫身。'],
      ['doctor','遊醫的指點','遊醫教你辨識舊傷，卻要你自己找出疼痛的根源。','health',6,15,'循著指點調養，積年的僵痛減輕了。','手法掌握不當，只好先停止嘗試。'],
      ['inn','客棧論武','陌生旅人談起一門失傳的步法，邀你一同推演。','insight',6,15,'你們各補半句，紙上終於連成完整的招式。','彼此的解法相衝，爭到天亮仍無定論。'],
      ['river','急流救援','行船翻覆，有人抱著木板困在水心。','fame',6,15,'你與岸上人合力拉回落水者。','繩索斷了，你只能退回岸邊另尋援手。'],
      ['duel','陌生人的挑戰','有人聽過你的名字，想用一場切磋印證傳聞。','skill',6,15,'你從對方的招式中悟到自己的新路。','名聲沒替你擋住這一招，傷勢倒很真實。'],
      ['market','真假古卷','攤主拿出一本古卷，你必須判斷它究竟值多少。','money',6,15,'你辨出真偽，轉手換得一筆盤纏。','看走了眼，買回的是一冊巧妙的仿本。'],
      ['pupil','弟子的疑問','後輩問你：為何這一式一定要如此收手？','legacy',10,15,'解釋清楚的那一刻，你也重新學會這一式。','習慣不等於道理，你只好承認還需要想一想。'],
      ['old','舊傷與新法','一套溫和的功法，也許能讓你與舊傷和平共處。','health',12,15,'你調整了發力方式，身體終於鬆快一些。','想走得太快，反倒牽動了舊傷。'],
      ['manuscript','整理畢生所學','散落的筆記堆滿書桌，你要留下多少可供後人驗證的心得？','legacy',10,15,'後輩照著筆記練成了第一式。','缺少關鍵說明，稿子只能重新整理。'],
      ['name','盛名之下','遠方門派邀你講武，期待你回應一個難題。','fame',8,15,'你坦然拆解疑問，贏得了在場人的敬意。','準備不足，這次講武留下不少爭議。']
    ].map(([id,title,body,target,min,max,good,bad])=>({id,title,body,target,min,max,good,bad}));
    const choice=(label,effect,flag)=>({label,effect,flag});
    const milestones=[
      ['山門外的一擔水','陸長風的舊傷發作，兩桶水翻在山階上。',[choice('接過扁擔，陪他上山',{brother:12,virtue:4},'helped'),choice('請師父前來照看',{master:8}),choice('替他留下傷藥',{brother:6,health:-2})]],
      ['白蘆渡的渡船','地痞攔下渡船。你要替誰站出來？',[choice('護住老人與渡船',{virtue:7,fame:5},'ferry'),choice('帶老人離開險地',{brother:3,virtue:3}),choice('請門中主持公道',{master:7,contribution:6})]],
      ['師兄的家書','陸長風三年未曾回家，你讀懂了他的猶豫。',[choice('陪他回鄉一趟',{brother:10},'letter'),choice('替他向師父請假',{master:5,brother:5}),choice('留下替他分擔差事',{contribution:9})]],
      ['顧寒的破綻','有人願意私下告訴你，顧寒練功時的弱點。',[choice('拒絕，堂堂正正較量',{rival:10,virtue:7},'honor'),choice('記下情報，首合實力 +6',{rival:-6,virtue:-4},'scout'),choice('邀他公開切磋',{rival:5,skill:2})]],
      ['大比前夜','師兄的傷又發了，比武即將開始。',[choice('為他運功療傷',{energy:-18,brother:12,virtue:5},'healed'),choice('請師父攔住他',{master:8,brother:-4},'stopped'),choice('陪他約定退場時機',{brother:6,insight:2})]],
      ['山門以外','你第一次能自己決定往後的方向。',[choice('行俠四方',{virtue:6},'vocation:wander'),choice('守護故人',{brother:8},'vocation:guardian'),choice('振興師門',{contribution:10},'vocation:leader')]],
      ['故人的舊傷','陸長風終於肯承認，這道傷不能再拖。',[choice('陪他求醫',{brother:12,virtue:3},'treated'),choice('代他完成門中差事',{contribution:10,brother:5}),choice('向師父學習療傷',{master:8,inner:2})]],
      ['白蘆守擂','渡口需要有人擋住黑石會，你將登台。',[choice('為渡口出戰',{fame:6,virtue:7},'rescue'),choice('先探路數，首合實力 +6',{insight:2},'riverIntel'),choice('邀師門共同守護',{contribution:9,master:5})]],
      ['名聲的價錢','一袋封口銀與一份商路契約，同時放在桌上。',[choice('拒收銀兩，公開帳目',{virtue:10,fame:6}),choice('收下封口銀',{money:40,virtue:-20},'shadow'),choice('投資正當商路',{money:-20},'business')]],
      ['一個提木劍的孩子','孩子想學武，你願意留下什麼？',[choice('收下弟子，細心教導',{legacy:22,virtue:4},'disciple'),choice('把安全的練法寫下',{legacy:14,insight:2},'masterBook'),choice('帶他拜訪更合適的師長',{master:10,virtue:6})]],
      ['群峰論武','山頂到了。這一戰，你想證明什麼？',[choice('以武會友',{fame:8,rival:6}),choice('替門派立名',{contribution:14}),choice('為弟子示範',{legacy:16})]],
      ['山門的下一盞燈','師父想放下日常的責任，請你作出選擇。',[choice('接掌山門',{contribution:18,master:8},'head'),choice('整理師父的心得',{legacy:20},'masterBook'),choice('退居側席，扶持後輩',{virtue:8,contribution:10})]],
      ['後來的江湖','林溪將要下山。你也想起那些曾欠下的話。',[choice('把最後一式傳下',{legacy:22},'successor'),choice('補還舊日的虧欠',{virtue:22,money:-15},'atoned'),choice('回去陪伴故人',{brother:15,rival:8})]],
      ['風雪中的茶','顧寒放下茶杯，問你還想不想再比一次。',[choice('先敘舊，再切磋',{rival:15,brother:8},'reconcile'),choice('卸下名次，準備遠行',{health:15,energy:15},'roamIntent'),choice('邀弟子觀摩',{legacy:14})]],
      ['一生的去處','最後一次論武之後，你想把餘生留給誰？',[choice('回到故人身邊',{brother:8},'retire:home'),choice('開館授業',{legacy:8},'retire:teach'),choice('交代手中責任，行走江湖',{virtue:5},'retire:duty')]]
    ];
    function prepare(s){s.phase='action';s.ap=0;s.eventIndex=0;s.training=freshTraining();const pool=encounters.filter(e=>s.year>=e.min&&s.year<=e.max&&(e.id!=='name'||s.fame>=20));let available=pool.filter(e=>!s.seen.includes(e.id));if(!available.length)available=pool;s.encounter=available[integer(s,0,available.length-1)].id;s.seen.push(s.encounter);s.battle={round:0,wins:0,pattern:0,logs:[]};}
    function create(name,route,seed,options={}){seed=String(seed||'青嵐').slice(0,32);const s=L.create(name,route,'普通人物',options);s.version=3;s.seed=seed;s.rng=2166136261;for(const c of seed)s.rng=Math.imul(s.rng^c.codePointAt(0),16777619)>>>0;s.potential={};s.carry={};s.traits={};s.counts={safe:0,bold:0};s.seen=[];s.focus={};
      for(const k of keys){s[k]=clamp(s[k]+integer(s,-4,6));s.potential[k]=integer(s,52,82);s.carry[k]=0;s.focus[k]=0;}s.potential[{swift:'agility',heavy:'body',palm:'inner'}[route]]=integer(s,78,92);
      if(Object.hasOwn(codes,seed)){s.cheat=codes[seed];log(s,'secret','山門初見',L.cheatInfo[s.cheat].text);}prepare(s);return s;}
    function rollTraining(state){if(state.phase!=='action'||state.training.rolled)throw Error('此章已擲骰，請分配修行成果');const s=copy(state);let n=integer(s,3,6);if(s.health<35)n=Math.max(2,n-1);if(s.version===4&&s.saga.injury){n=Math.max(2,n-1);s.saga.injury--;}s.training.rolled=true;s.training.dice=Array.from({length:n},()=>die(s));s.training.base={stats:Object.fromEntries(keys.map(k=>[k,s[k]])),carry:copy(s.carry)};return s;}
    function allocate(state,k){if(state.phase!=='action'||!state.training.rolled||!keys.includes(k)||state[k]>=cap(state)||state.training.index>=state.training.dice.length)throw Error('目前不能分配這顆骰子');const s=copy(state);gain(s,k,s.training.dice[s.training.index]);s.training.picks.push(k);s.training.index++;return s;}
    function undoAllocation(state){if(state.phase!=='action'||!state.training.index)throw Error('沒有可以復原的分配');const s=copy(state),picks=s.training.picks.slice(0,-1);Object.assign(s,s.training.base.stats);s.carry=copy(s.training.base.carry);s.training.picks=[];s.training.index=0;for(const k of picks){gain(s,k,s.training.dice[s.training.index++]);s.training.picks.push(k);}return s;}
    function finishTraining(state){if(state.phase!=='action'||!state.training.rolled||state.training.index!==state.training.dice.length&&!keys.every(k=>state[k]>=cap(state)))throw Error('請先分配所有骰子');const s=copy(state),changes={};while(s.training.index<s.training.dice.length){s.training.picks.push('skill');s.training.index++;}for(const k of keys){changes[k]=s[k]-s.training.base.stats[k];s.focus[k]+=s.training.picks.filter(x=>x===k).length;}log(s,'training','修行有得',`本章擲出 ${s.training.dice.join('、')}；已分配 ${s.training.dice.length} 顆修行骰。`,changes);if(!s.traits.focused&&Math.max(...Object.values(s.focus))>=12){s.traits.focused=true;log(s,'trait','專精一道','長期投入同一門功夫，比武實力獲得額外 4 點。');}s.phase='event';return s;}
    function event(state){if(state.eventIndex===1){const[title,body,cs]=milestones[state.year-1];return{title,body,who:'人生關口',choices:cs.map(original=>{const c=state.year===15&&original.flag==='retire:duty'&&state.flags.roamIntent?{...original,label:'卸下責任，歸隱山河',flag:'retire:roam'}:original;return({...c,preview:c.effect,enabled:state.money+(c.effect.money||0)>=0&&state.energy+(c.effect.energy||0)>=0,locked:state.money+(c.effect.money||0)<0?'盤纏不足':state.energy+(c.effect.energy||0)<0?'內力不足':''});})};}
      const e=encounters.find(e=>e.id===state.encounter),bonus=(state.insight>=60?1:0)+(state.traits.daring?1:0)-(state.health<35?1:0);
      return{title:e.title,body:e.body,who:'江湖際遇 · 命運擲骰',choices:chanceModes.map((m,i)=>{const needed=clamp(m.target-bonus,1,6),wins=diceChances(state).reduce((sum,p,j)=>sum+(j+1>=needed?p:0),0);return{label:m.label,enabled:true,locked:'',preview:{},hint:`成功 ${Math.round(wins*100)}% · 需骰出 ${needed} 以上｜成功：${L.labels[e.target]} +${e.target==='money'?m.good*3:m.good}${['fame','legacy'].includes(e.target)?'、俠義 +2':''}；失敗：${e.target==='money'?'盤纏':'健康'} −${e.target==='money'?m.bad*2:m.bad}`,needed,mode:i};})};}
    function canChoose(s,i){return s.phase==='event'&&Number.isInteger(i)&&!!event(s).choices[i]?.enabled;}
    function choose(state,i){if(!canChoose(state,i))throw Error('目前不能選擇此項');const s=copy(state),v=event(s),c=v.choices[i];let text,effect;
      if(s.eventIndex===0){const e=encounters.find(e=>e.id===s.encounter),m=chanceModes[i],d=die(s),good=d>=c.needed;effect=apply(s,good?{[e.target]:e.target==='money'?m.good*3:m.good,...(['fame','legacy'].includes(e.target)?{virtue:2}:{})}:{[e.target==='money'?'money':'health']:-(e.target==='money'?m.bad*2:m.bad)});text=`${c.label}：骰出 ${d}，門檻 ${c.needed}，${good?'成功':'失敗'}。${good?e.good:e.bad}`;if(good&&i===0)s.counts.safe++;if(good&&i===2)s.counts.bold++;}
      else{effect=apply(s,c.effect);text=c.label+'。這個決定，會留在往後的人生裡。';if(c.flag){if(c.flag.includes(':')){const[k,value]=c.flag.split(':');s[k]=value;}else s.flags[c.flag]=true;}}
      log(s,'event',v.title,text,effect);s.eventIndex++;if(s.eventIndex===2)s.phase=L.duelInfo[s.year]?'battle':'review';for(const [k,counter,limit,desc]of [['steady','safe',4,'往後命運骰至少 2 點。'],['daring','bold',3,'往後事件判定額外 +1。']])if(!s.traits[k]&&s.counts[counter]>=limit){s.traits[k]=true;log(s,'trait',traits[k],desc);}return s;}
    function resolveDuel(state,style){if(state.phase!=='battle'||!['safe','balanced','bold'].includes(style))throw Error('目前不能比武');const s=copy(state),duel=L.duelInfo[s.year],base=Math.round(s.skill*.4+s.inner*.25+s.body*.15+s.agility*.1+s.insight*.1)+(s.traits.focused?4:0),health=-Math.floor((100-s.health)/10)-(s.version===4?s.saga.scars*2:0);let wins=0;const logs=[];
      for(let r=0;r<3;r++){const intel=r===0&&((s.year===5&&s.flags.scout)||(s.year===8&&s.flags.riverIntel))?6:0,d=die(s),bonus=style==='safe'?7:style==='bold'?d*4-7:d*2,target=duel.target+r*3-7,total=base+health+bonus+intel,won=total>=target;if(won)wins++;logs.push({round:r+1,die:d,base,health,bonus,intel,total,target,won});}
      const won=wins>=2;s.battle={round:3,wins,pattern:0,logs};s.duels.push({year:s.year,name:duel.name,opponent:duel.opponent,wins,won});s.flags['duel'+s.year]=won;const e=apply(s,{health:won?-3:-8,fame:won?12:3,contribution:won?8:2});log(s,'battle',duel.name,`${{safe:'穩守根基',balanced:'見招拆招',bold:'放手搶攻'}[style]}，${wins} 勝 ${3-wins} 負。\n`+logs.map(l=>`第 ${l.round} 合：骰 ${l.die}，實力 ${base}、狀態 ${health}、策略 ${l.bonus}、情報 ${l.intel}，總計 ${l.total}／門檻 ${l.target}，${l.won?'得勢':'失勢'}。`).join('\n'),e);s.phase=s.year===15?'ending':'review';if(s.phase==='ending'){const ending=L.ending(s);log(s,'ending',ending.title,ending.body);}return s;}
    function nextYear(state){if(state.phase!=='review'||state.year>=15)throw Error('目前不能進入下一章');const s=copy(state);s.year++;const e=apply(s,{health:s.year>=13?5:12,energy:18,money:s.flags.business?26:8,...(s.vocation==='leader'?{contribution:5}:s.vocation==='guardian'?{brother:3}:{virtue:3}),...(s.flags.disciple?{legacy:3}:{})});if(s.year>=13)for(const k of ['body','agility'])Object.assign(e,apply(s,{[k]:-2}));log(s,'passage',`${L.age(s)} 歲 · 歲月流轉`,'旅途收入、調養與牽掛逐年累積。'+(s.year>=13?'年歲漸長，體魄與身法開始衰退。':''),e);prepare(s);return s;}
    function restore(input){if(input?.version!==3)return L.restore(input);const s=copy(input),fail=()=>{throw Error('存檔內容不完整或已損壞，原本進度未變更');};
      // Reuse the established base validator through a compatible validation-only projection.
      const projection=copy(s);projection.version=2;projection.ap=s.phase==='action'?3:0;projection.eventIndex=0;projection.phase='action';projection.battle={round:0,wins:0,pattern:0,logs:[]};projection.ap=3;delete projection.cheat;try{L.restore(projection);}catch{fail();}
      if(!['action','event','battle','review','ending'].includes(s.phase)||!Number.isInteger(s.eventIndex)||s.eventIndex<0||s.eventIndex>2||s.ap!==0)fail();
      if(s.cheat!==undefined&&codes[s.seed]!==s.cheat)fail();
      for(const k of keys){if(!Number.isInteger(s.potential?.[k])||s.potential[k]<40||s.potential[k]>95||!Number.isInteger(s.carry?.[k])||s.carry[k]<0||s.carry[k]>=cost(s,k)||!Number.isInteger(s.focus?.[k])||s.focus[k]<0)fail();}
      if(!s.traits||Array.isArray(s.traits)||Object.entries(s.traits).some(([k,v])=>!Object.hasOwn(traits,k)||typeof v!=='boolean')||!s.counts||['safe','bold'].some(k=>!Number.isInteger(s.counts[k])||s.counts[k]<0))fail();
      if(!Array.isArray(s.seen)||s.seen.length>15||!s.seen.every(id=>encounters.some(e=>e.id===id))||!encounters.some(e=>e.id===s.encounter&&s.year>=e.min&&s.year<=e.max))fail();
      const t=s.training;if(!t||typeof t.rolled!=='boolean'||!Array.isArray(t.dice)||t.dice.length>6||!t.dice.every(d=>Number.isInteger(d)&&d>=1&&d<=6)||!Number.isInteger(t.index)||t.index<0||t.index>t.dice.length||!Array.isArray(t.picks)||t.picks.length!==t.index||!t.picks.every(k=>keys.includes(k)))fail();
      if(t.rolled){if(t.dice.length<2||!t.base||keys.some(k=>!Number.isInteger(t.base.stats?.[k])||t.base.stats[k]<0||t.base.stats[k]>100||!Number.isInteger(t.base.carry?.[k])||t.base.carry[k]<0||t.base.carry[k]>8))fail();}else if(t.index||t.dice.length||t.base!==null)fail();
      if(s.phase==='action'&&s.eventIndex!==0)fail();if(s.phase!=='action'&&(!t.rolled||t.index!==t.dice.length))fail();if(s.phase==='event'&&s.eventIndex>=2)fail();
      if(['battle','review','ending'].includes(s.phase)&&s.eventIndex!==2)fail();if(s.phase==='battle'&&(!L.duelInfo[s.year]||s.battle.round!==0))fail();if(s.phase==='ending'&&(s.year!==15||s.battle.round!==3||s.duels.length!==5))fail();if(s.phase==='review'&&(s.year===15||(L.duelInfo[s.year]&&s.battle.round!==3)))fail();return s;}
    const dispatch=(modern,old)=>(s,...args)=>s.version>=3?modern(s,...args):old(s,...args);
    const routes=copy(L.routes),sects=copy(L.sects);routes.swift.desc='身法起步較高，身法潛力落在 78～92。';routes.heavy.desc='武學起步較高，體魄潛力落在 78～92。';routes.palm.desc='內功起步較高，內功潛力落在 78～92。';sects.qinglan.desc='初始武學較高，劍有分寸，心有山河。';sects.chixia.desc='初始體魄較高，以堅實根基立身江湖。';sects.tingyu.desc='初始內功較高，從吐納中體會武道。';return {...L,routes,sects,legacy:L,cap,diceChances,rollFate:die,applyEffect:apply,recordLife:log,create,restore,rollTraining,allocate,undoAllocation,finishTraining,resolveDuel,cost,trainingKeys:keys,traits,
      event:dispatch(event,L.event),canChoose:dispatch(canChoose,L.canChoose),choose:dispatch(choose,L.choose),nextYear:dispatch(nextYear,L.nextYear)};
  }
  if(typeof module!=='undefined')module.exports=extend;else root.JianghuCultivation=extend;
})(typeof window!=='undefined'?window:this);
