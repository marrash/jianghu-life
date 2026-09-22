const {test}=require('node:test');
const assert=require('node:assert/strict');
const G=require('../core.js');
function year(s, action='practice', choice=0){
  for(let i=0;i<3;i++)s=G.act(s,action);
  while(s.phase==='event')s=G.choose(s,choice);
  if(s.phase==='review')s=G.nextYear(s);
  return s;
}
test('序章五年比武後可接續完整版人生',()=>{
  assert.equal(typeof G.create,'function');
  let s=G.create('沈行舟','swift','青山');
  for(let i=0;i<5;i++)s=year(s);
  assert.equal(s.phase,'battle');assert.equal(s.year,5);
  assert.equal(s.history.filter(x=>x.type==='event').length,12);
  for(let i=0;i<3;i++)s=G.fight(s,'guard');
  assert.equal(s.phase,'review');assert.equal(s.battle.round,3);
  assert.equal(G.nextYear(s).year,6);
  assert.ok(G.ending(s).title);
});
test('相同種子與選擇產生相同人生，存檔中途續玩不改變結果',()=>{
  assert.equal(typeof G.create,'function');
  let a=G.create('雲生','heavy','shared');let b=G.create('雲生','heavy','shared');
  a=G.act(a,'travel');b=G.act(b,'travel');
  b=JSON.parse(JSON.stringify(b));
  a=G.act(a,'practice');b=G.act(b,'practice');assert.deepEqual(a,b);
});
test('援助師兄的決定在第三年的事件改變敘事',()=>{
  assert.equal(typeof G.create,'function');
  let helped=year(G.create('甲','swift','a'),'practice',0);
  let alone=year(G.create('甲','swift','a'),'practice',1);
  helped=year(helped);alone=year(alone);
  for(let i=0;i<3;i++){helped=G.act(helped,'rest');alone=G.act(alone,'rest');}
  helped=G.choose(G.choose(helped,0),0);alone=G.choose(G.choose(alone,0),0);
  assert.notEqual(G.event(helped).body,G.event(alone).body);
  assert.equal(helped.flags.helped,true);assert.equal(alone.flags.helped,undefined);
});
test('事件中不能偷練功，非法選項不能推進',()=>{
  assert.equal(typeof G.create,'function');
  let s=G.create('甲','swift','a');for(let i=0;i<3;i++)s=G.act(s,'practice');
  assert.throws(()=>G.act(s,'practice'));assert.throws(()=>G.choose(s,99));
});
test('招牌武學消耗內力，不能無限施展',()=>{
  assert.equal(typeof G.create,'function');
  let s=G.create('甲','heavy','a');for(let i=0;i<5;i++)s=year(s);
  const before=s.energy;s=G.fight(s,'special');assert.equal(s.energy,before-18);
  s.energy=0;assert.throws(()=>G.fight(s,'special'));
});
