const test=require('node:test'),assert=require('node:assert/strict');
const G=require('../core');
function finishChapter(s,gateChoice=0){
 for(let guard=0;guard<40;guard++){
  if(s.phase==='ending'||s.phase==='review')return s;
  if(s.phase==='action'){
   if(!s.training.rolled)s=G.rollTraining(s);
   else if(s.training.index<s.training.dice.length){const ks=G.trainingKeys.filter(k=>s[k]<G.cap(s));s=G.allocate(s,ks.reduce((a,b)=>s[a]<s[b]?a:b));}
   else s=G.finishTraining(s);
  }else if(s.phase==='event'){const cs=G.event(s).choices;s=G.choose(s,cs[0].enabled?0:cs.findIndex(c=>c.enabled));}
  else if(s.phase==='battle')s=G.resolveDuel(s,'bold');
  else if(s.phase==='crossroads'){const cs=G.crossroads(s).choices;s=G.chooseCrossroads(s,cs[gateChoice]?.enabled?gateChoice:cs.findIndex(c=>c.enabled));}
  else throw Error(s.phase);
  s=G.restore(JSON.parse(JSON.stringify(s)));
 }throw Error('chapter did not terminate');
}
function play(seed,gateChoice=0){let s=G.create('問天','palm',seed,{sect:'tingyu',origin:'merchant'});for(let i=0;i<22;i++){s=finishChapter(s,gateChoice);if(s.phase==='ending')return s;s=G.nextYear(s);}throw Error('life did not terminate');}
test('新人物有固定命格，命格改變骰子分布且祕碼恆六',()=>{
 const s=G.create('甲','swift','問天');assert.equal(s.version,4);assert.deepEqual(s,G.create('甲','swift','問天'));
 const bad=structuredClone(s),good=structuredClone(s);bad.saga.luck=-2;good.saga.luck=2;
 assert.ok(G.diceChances(good)[5]>G.diceChances(bad)[5]);assert.equal(G.diceChances(s).reduce((a,b)=>a+b,0),1);
 for(const code of ['天生奇才','逍遙一生','醉顛狂','Marrash'])assert.deepEqual(G.diceChances(G.create('甲','swift',code)),[0,0,0,0,0,1]);
});
test('祕碼完成突破、渡劫、延壽及六章後續人生，存檔隨處續玩',()=>{
 const s=play('Marrash');assert.equal(s.phase,'ending');assert.equal(s.year,21);assert.equal(G.ending(s).id,'celestial');assert.equal(s.saga.realm,5);assert.equal(G.age(s),200);assert.ok(s.history.some(h=>h.type==='trial'&&h.text.includes('骰出 6')));assert.deepEqual(s,play('Marrash'));
});
test('保守路線仍能完成凡人一生，舊版人物保持原規則',()=>{
 const s=play('普通命格',2);assert.equal(s.year,15);assert.equal(s.phase,'ending');assert.equal(G.age(s),65);assert.equal(s.saga.extended,false);
 const old=G.diceLegacy.create('甲','swift','舊人生');assert.equal(old.version,3);assert.deepEqual(G.restore(old),old);
});
test('不足資格不得冒險，準備費用不可透支',()=>{
 let s=G.create('甲','swift','Marrash');s.year=15;s.phase='crossroads';s.saga.gate='heaven';s.saga.resume='ending';s.money=0;s.saga.realm=0;
 assert.equal(G.crossroads(s).choices[0].enabled,false);assert.equal(G.crossroads(s).choices[1].enabled,false);assert.equal(G.crossroads(s).choices[2].enabled,true);assert.throws(()=>G.chooseCrossroads(s,0));
});
test('命格、關口、年齡及境界損壞存檔會被拒絕',()=>{
 const s=G.create('甲','swift','存檔');for(const mutate of [x=>x.saga.luck=99,x=>x.saga.realm=10,x=>x.year=21,x=>x.phase='crossroads',x=>x.saga.injury=-1,x=>x.saga.endAge='壞資料',x=>x.money='999',x=>x.money=null,x=>x.money=1e20]){const bad=structuredClone(s);mutate(bad);assert.throws(()=>G.restore(bad));}
});
test('相同關口準備提升成功率，失敗留下永久潛力傷害與兩次修行恢復期',()=>{
 let s=G.create('甲','palm','傷勢測試',{origin:'merchant'});
 for(let year=1;year<3;year++)s=G.nextYear(finishChapter(s,2));
 s=G.rollTraining(s);while(s.training.index<s.training.dice.length)s=G.allocate(s,'inner');s=G.finishTraining(s);s=G.choose(s,0);s=G.choose(s,0);
 assert.equal(s.saga.gate,'marrow');const cs=G.crossroads(s).choices;assert.ok(cs[1].needed<cs[0].needed);
 s.rng=0;const potential=s.potential.inner,money=s.money;s=G.chooseCrossroads(s,0);
 assert.equal(s.saga.scars,1);assert.equal(s.saga.injury,2);assert.equal(s.potential.inner,potential-6);assert.equal(s.money,money);s=G.restore(s);
 s=G.nextYear(s);assert.equal(s.saga.injury,2);
 const healthy=structuredClone(s);healthy.saga.injury=0;const healthyRoll=G.rollTraining(healthy);s=G.rollTraining(s);
 assert.equal(s.saga.injury,1);assert.equal(s.training.dice.length,Math.max(2,healthyRoll.training.dice.length-1));
});
test('能力全滿可直接完成修行，防止餘骰卡住',()=>{
 let s=G.rollTraining(G.create('甲','palm','Marrash'));for(const k of G.trainingKeys)s[k]=G.cap(s);
 s=G.finishTraining(s);assert.equal(s.phase,'event');assert.equal(s.training.index,s.training.dice.length);assert.deepEqual(G.restore(s),s);
});
test('保留金丹可玩到170歲，180歲壽元結束而非跳到200歲',()=>{
 let s=G.create('甲','palm','Marrash',{sect:'tingyu',origin:'merchant'});
 while(s.year<18)s=G.nextYear(finishChapter(s));
 s=finishChapter(s,2);assert.equal(s.saga.realm,3);assert.equal(s.phase,'review');
 while(s.phase!=='ending'){s=G.nextYear(s);if(s.phase!=='ending')s=finishChapter(s);}
 assert.equal(s.year,20);assert.equal(G.age(s),180);assert.equal(G.ending(s).id,'immortal');assert.deepEqual(G.restore(s),s);
});
test('重大關口成功率使用實際命格權重，穩健特質消除1點',()=>{
 let s=G.create('甲','palm','機率');s.phase='crossroads';s.saga.gate='marrow';s.saga.resume='review';s.year=3;
 for(let luck=-2;luck<=2;luck++){s.saga.luck=luck;const c=G.crossroads(s).choices[0],p=G.diceChances(s).reduce((v,w,i)=>v+(i+1>=c.needed?w:0),0);assert.ok(c.hint.includes(`成功率 ${Math.round(p*100)}%`));}
 s.traits.steady=true;assert.equal(G.diceChances(s)[0],0);
});
module.exports={play,finishChapter};
test('最終天劫有殞命及帶傷生還兩種失敗，代價與存檔一致',()=>{
 let s=G.create('問天','palm','Marrash',{sect:'tingyu',origin:'merchant'});while(s.year<21)s=G.nextYear(finishChapter(s));
 s=G.rollTraining(s);while(s.training.index<s.training.dice.length)s=G.allocate(s,G.trainingKeys.reduce((a,b)=>s[a]<s[b]?a:b));s=G.finishTraining(s);s=G.choose(s,0);s=G.choose(s,0);
 const normal=G.create('甲','swift','終劫測試');s.seed=normal.seed;s.saga.luck=normal.saga.luck;delete s.cheat;
 for(const face of [2,3]){const fixture=structuredClone(s);let rng=0;while(rng<10000){fixture.rng=rng;const probe=structuredClone(fixture);if(G.rollFate(probe)===face)break;rng++;}assert.ok(rng<10000);
  const result=G.chooseCrossroads(fixture,0);assert.equal(G.ending(result).id,face===2?'fallen':'immortal');assert.equal(result.saga.scars,s.saga.scars+1);assert.deepEqual(G.restore(result),result);
 }
});
