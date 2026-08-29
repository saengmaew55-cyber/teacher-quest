const Engine = {
  shuffle(a){return [...a].sort(()=>Math.random()-0.5);},
  profile(){
    const p=Store.get();
    return p;
  },
  pick(mode="random"){
    const p=this.profile(), recent=new Set(p.recent||[]);
    let pool=QUESTIONS.filter(q=>!recent.has(q.id));
    if(!pool.length) pool=QUESTIONS;
    // Adaptive weighting: weak standards/topics get more chances, while preserving variety.
    const weights=pool.map(q=>{
      let w=1;
      const weak=q.standard.some(s=>(p.standardMastery[s]??0.7)<0.65);
      if(weak) w+=2.5;
      if((p.wrong||[]).includes(q.id)) w+=2;
      if(q.difficulty>=4) w+=0.4;
      if(mode==="boss" && q.cognitive==="K5") w+=5;
      return w;
    });
    let total=weights.reduce((a,b)=>a+b,0), r=Math.random()*total;
    for(let i=0;i<pool.length;i++){r-=weights[i];if(r<=0)return pool[i];}
    return pool[pool.length-1];
  },
  updateAfter(q,correct,time,usedHint){
    const p=Store.get();
    p.attempts=(p.attempts||0)+1;
    p.correct=(p.correct||0)+(correct?1:0);
    p.wrong=p.wrong||[];
    if(correct)p.wrong=p.wrong.filter(x=>x!==q.id); else if(!p.wrong.includes(q.id))p.wrong.push(q.id);
    p.recent=p.recent||[];
    p.recent=[q.id,...p.recent.filter(x=>x!==q.id)].slice(0,8);
    p.xp=(p.xp||0)+(correct?(usedHint?80:100):20);
    p.combo=correct?(p.combo||0)+1:0;
    p.bestCombo=Math.max(p.bestCombo||0,p.combo);
    p.standardMastery=p.standardMastery||{S1:.5,S2:.5,S3:.5,S4:.5,S5:.5};
    q.standard.forEach(s=>{
      const old=p.standardMastery[s]??.5;
      p.standardMastery[s]=Math.max(0,Math.min(1,old+(correct?.035:-.045)));
    });
    p.last=Date.now();
    Store.set(p);
    return p;
  },
  level(xp){return Math.floor(Math.sqrt((xp||0)/100))+1;}
};