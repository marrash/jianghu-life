const test=require('node:test'),assert=require('node:assert/strict');
const G=require('../core.js');
function play(seed='新江湖',mode=1){let s=G.create('試劍','swift',seed);for(let i=0;s.phase!=='ending'&&i<350;i++){
 if(s.phase==='action'){if(!s.training.rolled)s=G.rollTraining(s);else if(s.training.index<s.training.dice.length)s=G.allocate(s,['skill','inner','body','agility','insight'][s.training.index%5]);else s=G.finishTraining(s);}
 else if(s.phase==='event')s=G.choose(s,Math.min(mode,G.event(s).choices.length-1));
 else if(s.phase==='battle')s=G.resolveDuel(s,'balanced');else s=G.nextYear(s);
 s=G.restore(JSON.parse(JSON.stringify(s)));
 }return s;}
test('新版由擲骰開始，種子相同可重現，不同種子有不同資質',()=>{const a=G.create('甲','swift','甲');assert.equal(a.version,3);assert.equal(a.training.rolled,false);assert.deepEqual(a,G.create('甲','swift','甲'));assert.notDeepEqual(a.potential,G.create('甲','swift','乙').potential);assert.equal(G.rollTraining(a).training.dice.length>=3,true);});
test('四個祕碼只讓命運骰全六，起始能力正常，不能重骰',()=>{for(const seed of ['天生奇才','逍遙一生','醉顛狂','Marrash']){let s=G.create('甲','swift',seed);assert.ok(s.skill<50);assert.ok(s.money<100);s=G.rollTraining(s);assert.ok(s.training.dice.every(d=>d===6));assert.throws(()=>G.rollTraining(s));}});
test('配點可復原且不變骰子，確認前不能進事件',()=>{const a=G.rollTraining(G.create('甲','swift','復原'));assert.throws(()=>G.finishTraining(a));const b=G.allocate(a,'skill');assert.deepEqual(G.undoAllocation(b),a);assert.throws(()=>G.allocate(a,'money'));});
test('完整人生、存檔往返與同種子重現',()=>{const a=play();assert.equal(a.phase,'ending');assert.equal(a.duels.length,5);assert.equal(a.history.filter(h=>h.type==='event').length,30);assert.deepEqual(a,play());assert.ok(a.history.some(h=>h.type==='event'&&/失敗/.test(h.text)));assert.ok(play('Marrash').history.some(h=>h.type==='event'&&/骰出 6/.test(h.text)));});
test('新版損壞骰子、進度、潛力不可載入',()=>{const s=G.create('甲','swift','存檔');assert.ok(s.training);for(const mutate of [x=>x.training.index=99,x=>x.potential.skill=999,x=>x.rng=-1,x=>x.phase='ending']){const x=structuredClone(s);mutate(x);assert.throws(()=>G.restore(x));}});
module.exports={play};
test('一般種子的八種結局都可由正常操作走到',()=>{
 const found=new Set();for(const run of [0,1,2,5,7,10,14,31]){let s=G.create('試劍','swift','探索'+run),n=run+1;
 const rand=()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296};
 while(s.phase!=='ending'){
  if(s.phase==='action'){s=G.rollTraining(s);while(s.training.index<s.training.dice.length)s=G.allocate(s,G.trainingKeys.reduce((a,b)=>s[a]<s[b]?a:b));s=G.finishTraining(s);}
  else if(s.phase==='event'){const cs=G.event(s).choices.map((c,i)=>c.enabled?i:-1).filter(i=>i>=0);s=G.choose(s,cs[Math.floor(rand()*cs.length)]);}
  else if(s.phase==='battle')s=G.resolveDuel(s,'bold');else s=G.nextYear(s);
  s=G.restore(s);
 }found.add(G.ending(s).id);}assert.equal(found.size,8);
});
test('全六不是必勝，情報僅在指定比武首合生效',()=>{
 let s=G.create('甲','swift','Marrash');s.phase='battle';s.year=5;for(const k of G.trainingKeys)s[k]=0;
 const a=G.resolveDuel(s,'bold');assert.ok(a.battle.logs.every(l=>l.die===6));assert.equal(a.duels[0].won,false);
 s.flags.scout=true;const b=G.resolveDuel(s,'bold');assert.equal(b.battle.logs[0].total-a.battle.logs[0].total,6);assert.equal(b.battle.logs[1].total,a.battle.logs[1].total);
});
test('超過潛力增加成本，滿值不能浪費骰子',()=>{
 let s=G.rollTraining(G.create('甲','swift','Marrash'));s.skill=60;s.potential.skill=60;s.carry.skill=0;
 assert.equal(G.cost(s,'skill'),6);s=G.allocate(s,'skill');assert.equal(s.skill,61);assert.equal(s.carry.skill,0);
 s.skill=100;assert.throws(()=>G.allocate(s,'skill'));
});
