const {test}=require('node:test');
const assert=require('node:assert/strict');
const G=require('../core.js');
function play(config={},pick=0,action='practice'){
  let s=G.create('測試俠客',config.route||'swift',config.seed||'life',config);
  for(let steps=0;s.phase!=='ending'&&steps<180;steps++){
    if(s.phase==='action')s=G.act(s,action);
    else if(s.phase==='event'){const cs=G.event(s).choices;const i=Math.min(pick,cs.length-1);s=G.choose(s,G.canChoose(s,i)?i:cs.findIndex((_,j)=>G.canChoose(s,j)));}
    else if(s.phase==='review')s=G.nextYear(s);
    else if(s.phase==='battle')s=G.fight(s,G.stance(s).counter);
    else throw Error(s.phase);
  }return s;
}
test('完整人生涵蓋十五章、五十二事件與五次比武',()=>{
  assert.equal(G.chapters?.length,15);
  const s=play();assert.equal(s.phase,'ending');assert.equal(s.year,15);
  assert.equal(s.history.filter(h=>h.type==='event').length,52);
  assert.equal(s.duels.length,5);assert.equal(G.age(s),60);assert.ok(G.ending(s).id);
});
test('三門派三出身都可完成，資料保持有限數值',()=>{
  assert.equal(Object.keys(G.sects||{}).length,3);
  for(const sect of Object.keys(G.sects))for(const origin of Object.keys(G.origins)){
    const s=play({sect,origin,route:sect==='chixia'?'palm':'heavy'},1,'duty');
    assert.equal(s.phase,'ending');for(const k of ['skill','body','inner','health','energy','money','virtue','legacy'])assert.ok(Number.isFinite(s[k]),k);
  }
});
test('完整選擇路徑重現，保存再載入一致',()=>{
  assert.equal(typeof G.restore,'function');
  const s=play({sect:'tingyu',origin:'merchant',seed:'shared'},2,'meditate');
  assert.deepEqual(s,play({sect:'tingyu',origin:'merchant',seed:'shared'},2,'meditate'));
  assert.deepEqual(G.restore(JSON.parse(JSON.stringify(s))),s);
});
test('舊版結局可升級後接續第六章，不損失往事',()=>{
  assert.equal(typeof G.restore,'function');
  const old=G.create('舊俠','swift','old');old.version=1;old.year=5;old.phase='ending';old.ap=0;old.eventIndex=3;old.battle={round:3,wins:2,logs:[]};old.history=[{year:5,type:'ending',title:'劍有鋒',text:'舊紀錄',effect:{}}];
  const s=G.restore(old);assert.equal(s.version,2);assert.equal(s.phase,'review');assert.equal(s.history[0].text,'舊紀錄');assert.equal(G.nextYear(s).year,6);
});
test('損壞及非法存檔不能載入',()=>{
  assert.equal(typeof G.restore,'function');
  assert.throws(()=>G.restore({version:2}));const s=G.create('甲','swift','a');s.skill='999';assert.throws(()=>G.restore(s));
  const b=G.create('甲','swift','a');b.phase='event';b.eventIndex=99;assert.throws(()=>G.restore(b));
});
test('金錢不足不能購藥，購藥確實消耗盤纏與行動',()=>{
  let s=G.create('甲','swift','a');s.money=0;assert.throws(()=>G.act(s,'medicine'));
  s.money=30;s.health=30;const healed=G.act(s,'medicine');assert.equal(healed.money,18);assert.equal(healed.ap,2);assert.ok(healed.health>30);
});
test('不同人生選擇可導向不同結局，敗戰仍能走到晚年',()=>{
  assert.equal(G.chapters?.length,15);
  const a=play({},0,'practice'),b=play({},2,'rest');
  assert.notEqual(G.ending(a).id,G.ending(b).id);assert.equal(b.phase,'ending');assert.ok(b.duels.some(d=>!d.won));
});
module.exports={play};
test('拒絕可造成終章畫面卡死的非法階段',()=>{
  const s=G.create('甲','swift','a');s.year=15;s.phase='review';s.ap=0;s.eventIndex=4;
  assert.throws(()=>G.restore(s));
  const b=G.create('乙','swift','b');b.year=5;b.phase='battle';b.eventIndex=0;
  assert.throws(()=>G.restore(b));
});
test('存檔中年齡與比武章節必須是合法數值，不接受 HTML 字串',()=>{
  const s=G.act(G.create('甲','swift','a'),'practice');s.history[0].age='<img src=x onerror=alert(1)>';
  assert.throws(()=>G.restore(s));
  const d=G.create('乙','swift','b');d.duels=[{year:'__proto__',name:'比武',opponent:'甲',wins:1,won:false}];
  assert.throws(()=>G.restore(d));
});
test('八種結局都有可走通的實際選擇路徑',()=>{
  const reached=[];
  for(const goal of ['guardian','mentor','hermit','leader','champion','atonement','merchant','wanderer']){
    let s=G.create('此生','swift','paths',{origin:'merchant'});
    for(let step=0;s.phase!=='ending'&&step<180;step++){
      if(s.phase==='action'){
        const action=goal==='leader'?'duty':['merchant','atonement'].includes(goal)?'work':goal==='wanderer'?'rest':s.health<65?'rest':s.skill<85?'practice':'meditate';
        s=G.act(s,action);
      }else if(s.phase==='event'){
        const e=G.event(s);let i=goal==='wanderer'?Math.min(2,e.choices.length-1):0;
        if(e.title==='一生的去處')i=goal==='guardian'||goal==='wanderer'?0:goal==='mentor'?1:goal==='hermit'?2:3;
        if(e.title==='一袋封口銀'&&goal==='atonement')i=1;
        if(!G.canChoose(s,i))i=e.choices.findIndex((_,j)=>G.canChoose(s,j));
        s=G.choose(s,i);
      }else if(s.phase==='battle')s=G.fight(s,G.stance(s).counter);
      else s=G.nextYear(s);
    }
    reached.push(G.ending(s).id);
    assert.equal(G.ending(s).id,goal,JSON.stringify({goal,reached:G.ending(s).id,skill:s.skill,health:s.health,brother:s.brother,fame:s.fame,virtue:s.virtue,duels:s.duels}));
  }
  assert.equal(new Set(reached).size,8);
});
