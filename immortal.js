(function(root){
  'use strict';
  function extend(G){
    const copy=s=>JSON.parse(JSON.stringify(s)),keys=G.trainingKeys;
    const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
    const realms=['凡軀','築基','先天','金丹','元嬰','登仙'];
    const fates=['多舛','薄運','平常','順遂','福澤'];
    const extra=[
      [75,'雲外第一山','初入仙途','山下已換了一代人，你開始學習與漫長歲月相處。'],
      [90,'故人留書','初入仙途','舊信沒有變，執筆的人卻已走遠。你把牽掛交給後人。'],
      [110,'元神問道','問道長生','金丹漸滿，是否再向前一步？'],
      [140,'山門百年','問道長生','後輩重修了山門，仍保留你當年走過的石階。'],
      [170,'星海歸途','問道長生','漫長的修行之後，你開始明白何時該停步。'],
      [200,'九霄雷劫','仙凡抉擇','這一次天劫不再只是傷勢，選擇前請看清生死的代價。']
    ].map(([age,title,stage,desc])=>({age,title,stage,desc}));
    const chapters=[...G.chapters,...extra];
    const endings={...G.endings,
      immortal:{title:'長生有岸，山河有歸',tag:'長生歸客',hint:'渡過首次天劫，於仙途中歸隱或走到壽元盡頭。',body:''},
      celestial:{title:'踏過九霄，仍記人間',tag:'九霄登仙',hint:'延續仙途，修成元嬰並成功渡過最終天劫。',body:''},
      fallen:{title:'雷散雲開，故劍長留',tag:'殞身天劫',hint:'在明知生死風險後挑戰最終天劫，未能生還。',body:''}
    };
    function luckOf(seed){let n=2166136261;for(const c of '命格:'+seed)n=Math.imul(n^c.codePointAt(0),16777619)>>>0;return n%5-2;}
    const age=s=>s.version===4?(s.saga.endAge??chapters[s.year-1].age):s.phase==='ending'?65:G.age(s);
    const chapterCount=s=>s?.version===4&&s.saga.extended?21:15;
    function lifeInfo(s){if(s.version!==4)return null;return{fate:fates[s.saga.luck+2],luck:s.saga.luck,realm:realms[s.saga.realm],lifespan:s.saga.lifespan,injury:s.saga.injury,scars:s.saga.scars,cap:G.cap(s),extended:s.saga.extended};}
    function record(s,title,text,effect={},type='trial'){s.history.push({year:s.year,age:age(s),type,title,text,effect});}
    function create(...args){const s=G.create(...args);s.version=4;s.saga={luck:luckOf(s.seed),realm:0,lifespan:65,injury:0,scars:0,extended:false,gate:null,resume:null,completed:[],endAge:null,endKind:null};return s;}
    function normalize(s){for(const k of keys){s[k]=Math.min(s[k],G.cap(s));s.potential[k]=clamp(s.potential[k],30,G.cap(s));s.carry[k]=Math.min(s.carry[k],G.cost(s,k)-1);}}
    function promote(s,realm){s.saga.realm=realm;for(const k of keys)s.potential[k]=Math.min(G.cap(s),s.potential[k]+10);normalize(s);}
    const gates={
      marrow:{title:'洗髓易脈',target:5,body:'遊醫提出一次洗髓。成功能改變先天資質；失敗的經脈傷勢會留在往後的修行。',need:s=>s.health>=35?'':'健康需達 35',good:'五項潛力 +12',bad:'五項潛力 −6、內功 −6、健康 −20；永久傷勢 +1，恢復期 2 章'},
      foundation:{title:'閉關築基',target:5,body:'吐納遇到了瓶頸。你可以衝關，也可以保留根基，等待下一個機會。',need:s=>s.saga.realm===0&&s.inner>=25&&s.skill>=30&&s.health>=35?'':'需凡軀、內功 25、武學 30、健康 35',good:'進入築基，能力上限升至 110、五項潛力 +10、內功 +8、體魄 +5',bad:'內功 −8、健康 −20；永久傷勢 +1，恢復期 2 章'},
      innate:{title:'先天之門',target:5,body:'築基以後，能否讓內息自成循環？這次突破有真正的收益，也可能傷及根基。',need:s=>s.saga.realm===1&&s.inner>=45&&s.insight>=30&&s.health>=35?'':'需築基、內功 45、悟性 30、健康 35',good:'進入先天，能力上限升至 120、五項潛力 +10、內功 +8、體魄 +5',bad:'內功 −8、健康 −20；永久傷勢 +1，恢復期 2 章'},
      rescue:{title:'以命換命',target:5,body:'陸長風的舊傷突然惡化。禁術可能救他，也會損耗你自己；尋醫是較慢但不傷根基的另一條路。',need:s=>s.inner>=30&&s.health>=35?'':'需內功 30、健康 35',good:'救回陸長風，情誼 +20；自身內功 −5、健康 −8、壽元 −3 年',bad:'未能挽回，情誼 −15；體魄 −10、內功 −8、健康 −20、壽元 −5 年；永久傷勢 +1，恢復期 2 章'},
      heaven:{title:'仙凡之間 · 首次渡劫',target:5,body:'薪火已交給後輩。你可以安度餘生，也可以迎接天雷，開啟七十五歲之後的修仙人生。此關只此一次，失敗便收束凡人生涯。',need:s=>s.saga.realm>=1&&s.inner>=40&&s.insight>=35&&s.health>=35?'':'需築基以上、內功 40、悟性 35、健康 35',good:'結成金丹，能力上限 130、五項潛力 +10，壽元延至至少 180 歲，開啟最多六章仙途',bad:'內功 −12、健康 −30、境界下降一階，超出新上限的能力降至上限；永久傷勢 +1，止步仙途，按現有壽元結束凡人生涯'},
      soul:{title:'元嬰出竅',target:5,body:'金丹已能支撐長生，元嬰卻是通向九霄的門。你也可以就此停步，不再賭上根基。',need:s=>s.saga.realm===3&&s.inner>=65&&s.insight>=50&&s.health>=35?'':'需金丹、內功 65、悟性 50、健康 35',good:'修成元嬰，上限 140、五項潛力 +10，壽元延至至少 260 歲，取得最終天劫資格',bad:'內功 −12、健康 −25、五項潛力 −5；永久傷勢 +1，恢復期 2 章，失去此次元嬰機會，壽元仍為 180 歲，無法走到兩百歲天劫'},
      final:{title:'九霄雷劫 · 生死一線',target:6,body:'前方已沒有必須前行的理由。可以帶著兩百年的修行歸山；若仍選擇渡劫，低點數的失敗會當場殞命。',need:s=>s.saga.realm===4&&s.inner>=80&&s.insight>=65&&s.health>=40?'':'需元嬰、內功 80、悟性 65、健康 40',good:'渡劫登仙，上限 150、壽元至少 500 歲，以登仙結局完成此生',bad:'失敗且骰點 ≤2：當場殞命；其他失敗：內功 −15、健康 −30、永久傷勢 +1，帶傷歸隱，結束此生'}
    };
    function enterGate(s,id,resume){s.saga.gate=id;s.saga.resume=resume;s.phase='crossroads';return s;}
    function stageGate(s){if(s.phase==='event')return s;let id=null;
      if(s.year===3)id='marrow';else if(s.year===5&&s.saga.realm===0)id='foundation';else if(s.year===7)id='rescue';else if(s.year===9&&s.saga.realm===0)id='foundation';else if(s.year===12&&s.saga.realm<2)id=s.saga.realm===0?'foundation':'innate';
      return id?enterGate(s,id,s.phase):s;
    }
    function odds(s,needed){return G.diceChances(s).reduce((sum,p,i)=>sum+(i+1>=needed?p:0),0);}
    function crossroads(s){if(s.version!==4||s.phase!=='crossroads'||!gates[s.saga.gate])throw Error('目前沒有突破關口');const g=gates[s.saga.gate];
      const choices=[false,true].map(prepared=>{
        const money=prepared?30:0,energy=prepared?20:10;
        const needed=clamp(g.target-(prepared?1:0)-(s.insight>=70?1:0)+(s.health<50?1:0)+(s.saga.scars>=2?1:0),2,6);
        const locked=g.need(s)||(s.money<money?'盤纏不足':s.energy<energy?'內力不足':'');
        const fatal=s.saga.gate==='final'?G.diceChances(s).reduce((sum,p,i)=>sum+(i+1<needed&&i+1<=2?p:0),0):0;
        return{label:prepared?'備妥丹藥，請人護法':'承擔風險，直接挑戰',enabled:!locked,locked,needed,prepared,money,energy,
          hint:`成功率 ${Math.round(odds(s,needed)*100)}% · 需骰出 ${needed} 以上${s.saga.gate==='final'?` · 殞命率 ${Math.round(fatal*100)}%`:''}。無論成敗先付盤纏 ${money}、內力 ${energy}。`};
      });
      const terminal=['heaven','final'].includes(s.saga.gate),rescue=s.saga.gate==='rescue';
      choices.push({label:terminal?'不再冒險，安度餘生':rescue?'尋醫照護，不施禁術':'守住根基，暫不突破',enabled:true,locked:'',hint:terminal?'不擲骰、不付費；保留現有修為，完成這段人生。':rescue?'不擲骰；情誼 +5。持續療養，避開禁術傷害。':s.saga.gate==='soul'?'健康 +8、內力 +8；保留金丹與 180 歲壽元，不再挑戰元嬰及兩百歲天劫。':'不擲骰、不付費；健康 +8、內力 +8，保留目前境界與潛力。'});
      return{title:g.title,reward:g.good,risk:g.bad,body:g.body+' 命格、悟性、健康與永久傷勢已計入下方機率。',choices};
    }
    function ending(s){if(s.version!==4)return G.ending(s);const kind=s.saga.endKind,a=age(s);
      if(kind==='celestial')return{id:kind,...endings[kind],body:`${a} 歲，你渡過九霄雷劫。新的歲月在雲外展開，但你仍帶著山門的舊劍與故人的信。這一卷寫到登仙為止，往後的長生由你自己續寫。`};
      if(kind==='fallen')return{id:kind,...endings[kind],body:`${a} 歲，你選擇迎向最後的天雷，未能走出劫雲。後輩收回殘劍，把你曾救過的人、犯過的錯與留下的功夫，一起寫進山門的記錄。`};
      if(kind==='immortal')return{id:kind,...endings[kind],body:`${a} 歲，你停下向天爭勝的腳步。漫長歲月沒有抹去故人的名字，你將${realms[s.saga.realm]}所學留給後輩，帶著${s.saga.scars?'仍未痊癒的傷勢與':'一身修為與'}舊信回到山河之間。`};
      const e=G.ending(s);if(e.id==='guardian'&&s.flags.friendLost)return{...e,title:'故人的燈，後來的人',body:`${a} 歲，你回到陸長風的故鄉。他已不在，家人仍記得你當年的奔走。你把餘生留給這盞燈，也將他的故事說給後輩聽。`};return{...e,body:e.body.replaceAll('六十五歲',`${a} 歲`)};
    }
    function conclude(s,kind,at){s.phase='ending';s.saga.endKind=kind;s.saga.endAge=at;s.saga.gate=null;s.saga.resume=null;const e=ending(s);record(s,e.title,e.body,{},'ending');return s;}
    function chooseCrossroads(state,index){const view=crossroads(state),c=view.choices[index];if(!Number.isInteger(index)||!c?.enabled)throw Error('目前不能選擇此項');const s=copy(state),id=s.saga.gate,resume=s.saga.resume;
      s.saga.completed.push(`${s.year}:${id}`);s.saga.gate=null;s.saga.resume=null;
      if(index===2){const effect=G.applyEffect(s,id==='rescue'?{brother:5}:['heaven','final'].includes(id)?{}:{health:8,energy:8});if(id==='rescue')s.flags.treated=true;
        record(s,view.title,c.label+'。'+c.hint,effect);if(id==='heaven')return conclude(s,'mortal',Math.max(age(s),s.saga.lifespan));if(id==='final')return conclude(s,'immortal',age(s));s.phase=resume;return s;}
      const paid=G.applyEffect(s,{money:-c.money,energy:-c.energy}),d=G.rollFate(s),success=d>=c.needed;let effect={},detail='';
      if(success){
        if(id==='marrow'){for(const k of keys)s.potential[k]=Math.min(G.cap(s),s.potential[k]+12);detail='五項潛力提升，往後修行更有餘地。';}
        if(id==='foundation'||id==='innate'){promote(s,id==='foundation'?1:2);effect={inner:8,body:5};detail=`踏入${realms[s.saga.realm]}，能力上限 ${G.cap(s)}，五項潛力提升。`;}
        if(id==='rescue'){s.flags.savedFriend=true;s.flags.treated=true;s.saga.lifespan-=3;effect={brother:20,inner:-5,health:-8};detail='陸長風活了下來；你付出三年壽元與部分修為。';}
        if(id==='heaven'){promote(s,3);s.saga.extended=true;s.saga.lifespan=Math.max(180,s.saga.lifespan);effect={health:15,inner:8};detail='金丹已成，壽元延至 180 歲；七十五歲之後仍有新的歲月。';}
        if(id==='soul'){promote(s,4);s.saga.lifespan=Math.max(260,s.saga.lifespan);effect={inner:10,health:10};detail='元嬰已成，壽元延至 260 歲；你取得了九霄雷劫的資格。';}
        if(id==='final'){promote(s,5);s.saga.lifespan=Math.max(500,s.saga.lifespan);detail='九霄雷散，你跨過仙凡之門。';}
      }else{
        s.saga.scars++;s.saga.injury=2;
        if(id==='marrow'){for(const k of keys)s.potential[k]=Math.max(30,s.potential[k]-6);effect={inner:-6,health:-20};}
        else if(id==='rescue'){s.flags.friendLost=true;s.saga.lifespan-=5;effect={body:-10,inner:-8,health:-20,brother:-15};}
        else if(id==='heaven'){s.saga.realm=Math.max(0,s.saga.realm-1);effect={inner:-12,health:-30};}
        else if(id==='soul'){for(const k of keys)s.potential[k]=Math.max(30,s.potential[k]-5);effect={inner:-12,health:-25};}
        else if(id==='final')effect={inner:-15,health:d<=2?-s.health:-30};
        else effect={inner:-8,health:-20};
        detail=gates[id].bad+'。';
      }
      const actual=G.applyEffect(s,effect);normalize(s);for(const k of keys)if(s[k]!==state[k])actual[k]=s[k]-state[k];for(const[k,v]of Object.entries(paid))actual[k]=(actual[k]||0)+v;
      record(s,view.title,`${c.label}：骰出 ${d}，門檻 ${c.needed}，${success?'成功':'失敗'}。${detail}`,actual);
      if(id==='heaven'){if(success){s.phase='review';return s;}return conclude(s,'mortal',Math.max(age(s),s.saga.lifespan));}
      if(id==='final')return conclude(s,success?'celestial':d<=2?'fallen':'immortal',age(s));
      s.phase=resume;return s;
    }
    const futureScenes=[
      ['雲海採露','雲間的靈露能溫養內息，風向卻隨時會變。','inner'],
      ['古碑殘文','山腹裡的碑文記著一套與人間不同的運氣方法。','insight'],
      ['秘境行路','沉眠的秘境再度開啟，進得越深，也越難退回。','body'],
      ['山門傳道','後輩帶著新問題前來，你願意把所學驗證到哪一步？','legacy'],
      ['劍照星河','夜色裡的劍光，照出了從前看不見的破綻。','skill'],
      ['靈舟遠行','遠方宗門邀你越過風暴海。航路帶來機緣，也藏著危險。','agility']
    ];
    function futureEvent(s){if(s.eventIndex===1)return{title:'長生之後，如何自處',who:'仙途歲月',body:chapters[s.year-1].desc,choices:[
      {label:'閉關調養，修補舊傷',hint:'健康 +18、內力 +20；恢復期減少 1 章，永久傷勢仍保留。',enabled:true,preview:{}},
      {label:'尋靈採藥，補充行囊',hint:'盤纏 +25、內力 −5，為下次突破準備。',enabled:s.energy>=5,locked:s.energy<5?'內力不足':'',preview:{}},
      {label:'回山歸隱，完成此生',hint:'不再挑戰後續境界；以目前年齡及修為完成長生歸客結局。',enabled:true,preview:{}}
    ]};
      const e=futureScenes[s.saga.scene],bonus=(s.insight>=60?1:0)+(s.traits.daring?1:0)-(s.health<35?1:0);
      return{title:e[0],body:e[1],who:'仙途際遇',choices:['穩中求進','放手一試','全力一搏'].map((label,i)=>{const needed=clamp([2,3,5][i]-bonus,1,6);return{label,needed,enabled:true,preview:{},hint:`成功 ${Math.round(odds(s,needed)*100)}% · 需骰出 ${needed} 以上。成功：${G.labels[e[2]]} +${[3,6,10][i]}；失敗：健康 −${[2,5,10][i]}。`};})};
    }
    function event(s){return s.version===4&&s.year>15?futureEvent(s):G.event(s);}
    function canChoose(s,i){return s.version===4?s.phase==='event'&&Number.isInteger(i)&&!!event(s).choices[i]?.enabled:G.canChoose(s,i);}
    function choose(state,i){if(state.version!==4)return G.choose(state,i);if(!canChoose(state,i))throw Error('目前不能選擇此項');
      if(state.year<=15)return stageGate(G.choose(state,i));
      const s=copy(state),e=event(s),c=e.choices[i];let effect={},text=c.label+'。';
      if(s.eventIndex===0){const d=G.rollFate(s),success=d>=c.needed;effect=success?{[futureScenes[s.saga.scene][2]]:[3,6,10][i]}:{health:-[2,5,10][i]};text+=`骰出 ${d}，門檻 ${c.needed}，${success?'成功':'失敗'}。`;
        if(success&&i===0)s.counts.safe++;if(success&&i===2)s.counts.bold++;
        if(s.counts.safe>=4)s.traits.steady=true;if(s.counts.bold>=3)s.traits.daring=true;
      }else if(i===0){effect={health:18,energy:20};s.saga.injury=Math.max(0,s.saga.injury-1);}else if(i===1)effect={money:25,energy:-5};
      record(s,e.title,text,G.applyEffect(s,effect),'event');s.eventIndex++;
      if(s.eventIndex===2){if(i===2)return conclude(s,'immortal',age(s));if(s.year===18)return enterGate(s,'soul','review');if(s.year===21)return enterGate(s,'final','ending');s.phase='review';}return s;
    }
    function resolveDuel(s,style){let next=G.resolveDuel(s,style);if(s.version===4&&s.year===15){next.history=next.history.filter(h=>h.type!=='ending');next=enterGate(next,'heaven','ending');}return next;}
    function nextYear(state){if(state.version!==4)return G.nextYear(state);if(state.phase!=='review')throw Error('目前不能進入下一章');
      if(state.year<15){const s=G.nextYear(state);return s;}
      if(!state.saga.extended||state.year>=21)throw Error('此生已無後續篇章');const s=copy(state),nextAge=chapters[s.year].age;
      if(nextAge>s.saga.lifespan)return conclude(s,'immortal',s.saga.lifespan);
      s.year++;s.phase='action';s.eventIndex=0;s.training={rolled:false,dice:[],index:0,picks:[],base:null};s.battle={round:0,wins:0,pattern:0,logs:[]};
      // Draw the scene from the same saved PRNG without applying fate to its identity.
      s.rng=(Math.imul(s.rng,1664525)+1013904223)>>>0;s.saga.scene=Math.floor(s.rng/4294967296*futureScenes.length);
      record(s,'仙途流年',chapters[s.year-1].desc,G.applyEffect(s,{health:12,energy:25,money:s.flags.business?26:12,legacy:4}),'passage');return s;
    }
    function restore(input){if(input?.version!==4)return G.restore(input);const fail=()=>{throw Error('存檔內容不完整或已損壞，原本進度未變更');};let s;try{s=copy(input);}catch{fail();}
      const a=s.saga,integer=(v,min,max)=>Number.isInteger(v)&&v>=min&&v<=max;
      if(!integer(s.money,0,9999))fail();
      if(!a||typeof a!=='object'||Array.isArray(a)||!integer(a.luck,-2,2)||a.luck!==luckOf(s.seed)||!integer(a.realm,0,5)||!integer(a.lifespan,50,500)||!integer(a.injury,0,2)||!integer(a.scars,0,10)||typeof a.extended!=='boolean'||!integer(s.year,1,a.extended?21:15))fail();
      if(a.extended&&(a.realm<3||a.lifespan<180)||!a.extended&&a.realm>2)fail();
      if(!['action','event','battle','review','ending','crossroads'].includes(s.phase)||!integer(s.eventIndex,0,2)||s.ap!==0)fail();
      if(!Array.isArray(a.completed)||a.completed.length>10||new Set(a.completed).size!==a.completed.length||a.completed.some(x=>!/^\d+:(marrow|foundation|innate|rescue|heaven|soul|final)$/.test(x)))fail();
      if(a.endAge!==null&&!integer(a.endAge,15,500)||![null,'mortal','immortal','celestial','fallen'].includes(a.endKind))fail();
      if(s.phase==='ending'){if(s.year<15)fail();if(a.endAge===null||a.endKind===null||a.endAge<chapters[s.year-1].age||a.endAge>a.lifespan||!a.extended&&a.endKind!=='mortal'||a.extended&&a.endKind==='mortal'||a.endKind==='celestial'&&(s.year!==21||a.realm!==5)||a.endKind==='fallen'&&s.year!==21)fail();}
      else if(a.endAge!==null||a.endKind!==null||a.realm===5||chapters[s.year-1].age>a.lifespan)fail();
      if(s.phase==='crossroads'){
        const schedule={marrow:[3],foundation:[5,9,12],innate:[12],rescue:[7],heaven:[15],soul:[18],final:[21]};
        if(!schedule[a.gate]?.includes(s.year)||!['battle','review','ending'].includes(a.resume)||a.completed.includes(`${s.year}:${a.gate}`))fail();
        const expected=a.gate==='heaven'||a.gate==='final'?'ending':G.duelInfo[s.year]?'battle':'review';if(a.resume!==expected)fail();
      }else if(a.gate!==null||a.resume!==null)fail();
      // Validate common identity, stats, flags, duels and prose with the legacy validator;
      // only its fixed-age view is projected. New-age values are checked separately below.
      const p=copy(s);p.version=2;p.year=1;p.phase='action';p.ap=3;p.eventIndex=0;p.battle={round:0,wins:0,pattern:0,logs:[]};p.history=[];
      for(const k of keys)p[k]=Math.min(p[k],100);p.money=Math.min(p.money,999);try{G.legacy.restore(p);}catch{fail();}
      for(const k of keys)if(!integer(s[k],0,G.cap(s))||!integer(s.potential?.[k],30,G.cap(s))||!integer(s.carry?.[k],0,G.cost(s,k)-1)||!integer(s.focus?.[k],0,126))fail();
      if(!s.traits||Array.isArray(s.traits)||Object.entries(s.traits).some(([k,v])=>!Object.hasOwn(G.traits,k)||typeof v!=='boolean')||!s.counts||!integer(s.counts.safe,0,21)||!integer(s.counts.bold,0,21))fail();
      if(!Array.isArray(s.seen)||s.seen.length>15||s.seen.some(x=>typeof x!=='string'))fail();
      if(!s.battle||!integer(s.battle.round,0,3)||!integer(s.battle.wins,0,s.battle.round)||!integer(s.battle.pattern,0,2)||!Array.isArray(s.battle.logs)||s.battle.logs.length!==s.battle.round)fail();
      if(s.battle.logs.some(l=>!l||!integer(l.round,1,3)||!integer(l.die,1,6)||!['base','health','bonus','intel','total','target'].every(k=>Number.isFinite(l[k]))||typeof l.won!=='boolean'))fail();
      const t=s.training;if(!t||typeof t.rolled!=='boolean'||!Array.isArray(t.dice)||t.dice.length>6||!t.dice.every(d=>integer(d,1,6))||!integer(t.index,0,t.dice.length)||!Array.isArray(t.picks)||t.picks.length!==t.index||!t.picks.every(k=>keys.includes(k)))fail();
      if(t.rolled){if(t.dice.length<2||!t.base||keys.some(k=>!integer(t.base.stats?.[k],0,150)||!integer(t.base.carry?.[k],0,8)))fail();}else if(t.dice.length||t.index||t.picks.length||t.base!==null)fail();
      if(s.phase==='action'&&s.eventIndex!==0||s.phase!=='action'&&(!t.rolled||t.index!==t.dice.length)||s.phase==='event'&&s.eventIndex>1||['battle','review','ending','crossroads'].includes(s.phase)&&s.eventIndex!==2)fail();
      if(s.phase==='battle'&&(!G.duelInfo[s.year]||s.battle.round!==0)||s.phase==='review'&&(s.year===21||s.year===15&&!a.extended||G.duelInfo[s.year]&&s.battle.round!==3))fail();
      if(s.year>15&&!integer(a.scene,0,5))fail();
      if(s.year<=15&&!['rain','breath','cliff','foot','book','spar','night','escort','ambush','doctor','inn','river','duel','market','pupil','old','manuscript','name'].includes(s.encounter))fail();
      if(!Array.isArray(s.history)||s.history.length>300||s.history.some(h=>!h||!integer(h.year,1,s.year)||!integer(h.age,15,500)||typeof h.title!=='string'||typeof h.text!=='string'||typeof h.type!=='string'||!h.effect||typeof h.effect!=='object'||Array.isArray(h.effect)||Object.entries(h.effect).some(([k,v])=>!Object.hasOwn(G.labels,k)||!Number.isFinite(v))))fail();
      return s;
    }
    return{...G,diceLegacy:G,chapters,endings,create,age,chapterCount,lifeInfo,crossroads,chooseCrossroads,event,canChoose,choose,resolveDuel,nextYear,restore,ending};
  }
  if(typeof module!=='undefined')module.exports=extend;else root.JianghuImmortal=extend;
})(typeof window!=='undefined'?window:this);
