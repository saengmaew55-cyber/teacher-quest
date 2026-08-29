const Game = {
  state:{q:null,mode:"random",start:0,usedHint:false,answered:false},
  start(mode="random"){this.state={q:Engine.pick(mode),mode,start:Date.now(),usedHint:false,answered:false};UI.question();},
  answer(i){
    if(this.state.answered)return;
    const q=this.state.q, correct=i===q.answer, time=Math.round((Date.now()-this.state.start)/1000);
    this.state.answered=true;
    const p=Engine.updateAfter(q,correct,time,this.state.usedHint);
    UI.result(correct,i,q,p,time);
  },
  hint(){
    if(this.state.answered||this.state.usedHint)return;
    this.state.usedHint=true;
    const q=this.state.q;
    const wrong=this.shuffle(q.choices.map((x,i)=>i).filter(i=>i!==q.answer)).slice(0,1)[0];
    document.querySelector(`[data-choice="${wrong}"]`)?.classList.add("eliminate");
    document.getElementById("hintText").textContent="💡 ลองตัดตัวเลือกที่ไม่สอดคล้องกับคำถามออกก่อน แล้วมองหาหลักการที่ตอบโจทย์ “สิ่งที่ควรทำที่สุด”";
    document.getElementById("hintBtn").disabled=true;
  },
  shuffle(a){return [...a].sort(()=>Math.random()-0.5)}
};
const UI={
  render(){
    const p=Store.get(), lvl=Engine.level(p.xp), acc=p.attempts?Math.round(p.correct/p.attempts*100):0;
    document.getElementById("app").innerHTML=`<main class="shell">
      <header><div><div class="brand">🎓 TEACHER QUEST</div><div class="sub">Professional Teacher Training</div></div><button class="ghost" onclick="UI.profile()">📊</button></header>
      <section class="hero"><div class="rank">👨‍🏫 TRAINEE • LV.${lvl}</div><div class="xp">⭐ ${p.xp} XP</div><div class="stats"><span>🎯 ${acc}%</span><span>🔥 ${p.bestCombo||0} BEST</span><span>🧩 ${p.attempts} PLAYED</span></div></section>
      <button class="play" onclick="Game.start('random')">⚡ PLAY NOW <small>สุ่มภารกิจคละทุกด้าน</small></button>
      <div class="grid"><button class="tile" onclick="Game.start('random')">⚔️<b>RANDOM BATTLE</b><small>คละข้อแบบไม่บอกหมวด</small></button><button class="tile" onclick="Game.start('boss')">👑<b>BOSS BATTLE</b><small>เน้นโจทย์ตัดสินใจ</small></button><button class="tile" onclick="UI.cards()">🃏<b>KNOWLEDGE</b><small>ทบทวนหลักคิด</small></button><button class="tile" onclick="UI.profile()">📈<b>MY PROFILE</b><small>ดูจุดแข็ง–จุดอ่อน</small></button></div>
      <div class="notice">🎯 เป้าหมายการฝึก: <b>คิดให้เหมือนครูมืออาชีพ</b><br><small>ข้อสอบต้นฉบับ 30 ข้อ • อิงกรอบมาตรฐาน 5 ด้านของคุรุสภา</small></div>
    </main>`;
  },
  question(){
    const q=Game.state.q;
    document.getElementById("app").innerHTML=`<main class="shell">
      <header><button class="ghost" onclick="UI.render()">←</button><div class="mission">⚔️ RANDOM MISSION</div><div class="difficulty">${"★".repeat(q.difficulty)}</div></header>
      <div class="progress"><span></span></div><section class="question"><div class="tag">🧩 ${q.type==="BOSS"?"BOSS": "MISSION"}</div><h2>${q.q}</h2>
      <div class="choices">${q.choices.map((c,i)=>`<button class="choice" data-choice="${i}" onclick="Game.answer(${i})"><span>${String.fromCharCode(65+i)}</span>${c}</button>`).join("")}</div>
      <button id="hintBtn" class="hint" onclick="Game.hint()">💡 ใช้ HINT</button><div id="hintText"></div></section>
    </main>`;
  },
  result(correct,i,q,p,time){
    const lvl=Engine.level(p.xp);
    document.getElementById("app").innerHTML=`<main class="shell">
      <header><div class="brand">🧠 KNOWLEDGE DROP</div><div class="xp">+${correct?(p.combo>1?120:100):20} XP</div></header>
      <section class="result ${correct?"good":"bad"}"><div class="big">${correct?"⚡ CORRECT!":"💥 NOT YET"}</div><p>${correct?"คำตอบของคุณดีที่สุดสำหรับสถานการณ์นี้":"คำตอบที่ดีที่สุดคือ <b>"+String.fromCharCode(65+q.answer)+"</b>"}</p>
      <div class="card"><h3>🎯 ทำไม?</h3><p>${q.explanation}</p><h3>📚 ความรู้</h3><p>${q.knowledge}</p><h3>💡 เทคนิคสอบ</h3><p>${q.tip}</p><h3>⚠️ จุดหลอก</h3><p>${q.trap}</p></div>
      <div class="resultStats"><span>🔥 Combo ${p.combo}</span><span>⭐ Level ${lvl}</span><span>⏱️ ${time}s</span></div>
      <button class="play" onclick="Game.start('${Game.state.mode}')">ต่อไป →</button><button class="secondary" onclick="UI.render()">กลับหน้าหลัก</button></section>
    </main>`;
  },
  profile(){
    const p=Store.get(), names={S1:"🌎 บริบทโลก",S2:"🧠 จิตวิทยา",S3:"🏫 หลักสูตร/การสอน",S4:"📊 วัดและประเมินผล",S5:"🏛️ ประกันคุณภาพ"};
    const rows=Object.entries(p.standardMastery).map(([s,v])=>`<div class="barrow"><span>${names[s]}</span><b>${Math.round(v*100)}%</b><div><i style="width:${Math.round(v*100)}%"></i></div></div>`).join("");
    document.getElementById("app").innerHTML=`<main class="shell"><header><button class="ghost" onclick="UI.render()">←</button><div class="brand">📊 MY PROFILE</div><div></div></header><section class="card profile"><h2>Teacher Profile</h2><p>⭐ ${p.xp} XP • 🎯 ${p.attempts?p.correct+"/"+p.attempts:"ยังไม่มีข้อมูล"}</p>${rows}<div class="notice">🔴 ถ้าด้านใดต่ำกว่า 65% ระบบจะเพิ่มน้ำหนักข้อด้านนั้นในการสุ่มครั้งต่อไป</div><button class="secondary" onclick="Store.reset()">รีเซ็ตข้อมูล</button></section></main>`;
  },
  cards(){alert("Knowledge Cards จะเปิดในเฟสถัดไป — ตอนนี้ทุกข้อมี Knowledge Drop หลังตอบแล้ว");}
};
