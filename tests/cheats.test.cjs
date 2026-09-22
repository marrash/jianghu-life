const test=require('node:test');
const assert=require('node:assert/strict');
const G=require('../core.js');
const make=seed=>G.create('試劍','swift',seed);
test('四組祕碼精確辨識與初始能力；一般種子不變',()=>{
  for(const [seed,power,money] of [['天生奇才',80,200],['逍遙一生',80,200],['醉顛狂',95,9999],['Marrash',100,99999]]){
    const s=make(seed);assert.ok(s.cheat);for(const k of ['skill','body','inner','agility','insight'])assert.equal(s[k],power);
    assert.equal(s.money,money);assert.equal(s.health,100);assert.equal(s.energy,100);
    assert.deepEqual(G.restore(s),s);
  }
  for(const seed of ['marrash','Marrash ','山河有故人'])assert.ok(!make(seed).cheat);
});
test('資源豁免不繞過劇情條件；醉顛狂照常支付盤纏',()=>{
  for(const seed of ['逍遙一生','Marrash']){
    let s=make(seed);s.money=0;s.energy=0;assert.ok(G.canAct(s,'medicine'));assert.ok(!G.canAct(s,'teach'));
    s=G.act(s,'medicine');assert.equal(s.money,0);
    while(s.phase==='action')s=G.act(s,'rest');assert.ok(G.canChoose(s,1));
    s=G.choose(s,1);assert.equal(s.money,0);
  }
  let s=make('醉顛狂');s=G.act(s,'medicine');assert.equal(s.money,9987);
});
test('醉顛狂每章回滿與命運六點；Marrash 行動事件回滿',()=>{
  let s=make('醉顛狂');s=G.act(s,'practice');assert.match(s.history.at(-1).text,/6／6/);assert.ok(s.health<100);
  while(s.phase==='action')s=G.act(s,'rest');while(s.phase==='event')s=G.choose(s,0);
  s.health=1;s.energy=0;s=G.nextYear(s);assert.equal(s.health,100);assert.equal(s.energy,100);
  s=make('Marrash');s.health=1;s.energy=0;s=G.act(s,'travel');assert.equal(s.health,100);assert.equal(s.energy,100);
  while(s.phase==='action')s=G.act(s,'rest');s=G.choose(s,0);assert.equal(s.health,100);
});
test('四祕碼走完全生涯與中途讀檔，兩種無敵每合必勝',()=>{
  for(const seed of ['天生奇才','逍遙一生','醉顛狂','Marrash']){
    let s=make(seed),steps=0;
    while(s.phase!=='ending'&&steps++<180){
      if(s.phase==='action')s=G.act(s,'practice');
      else if(s.phase==='event')s=G.choose(s,G.event(s).choices.findIndex(c=>c.enabled));
      else if(s.phase==='review')s=G.nextYear(s);
      else {if(seed!=='天生奇才')s.energy=0;s=G.fight(s,seed==='天生奇才'?'attack':'special');if(['逍遙一生','Marrash'].includes(seed))assert.ok(s.battle.logs.at(-1).won);}
      s=G.restore(s);
    }
    assert.equal(s.phase,'ending');assert.equal(s.duels.length,5);
  }
});
test('舊存檔不因相同種子自動啟用，拒絕非法模式',()=>{
  const s=make('山河有故人');s.seed='Marrash';delete s.cheat;assert.ok(!G.restore(s).cheat);
  s.cheat='bad';assert.throws(()=>G.restore(s));
});
