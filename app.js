let state = loadState();
let deck = [];
let current = null;
let locked = false;

const $ = s => document.querySelector(s);
const shuffle = arr => [...arr].sort(()=>Math.random()-0.5);

function buildDeck(){
  const source = QUESTIONS.map(q=>({...q, options: shuffle(q.options)}));
  // Mixed deck: prioritize weak items after every 8 new questions.
  const weak = source.filter(q=>state.wrong[q.id]);
  const fresh = source.filter(q=>!state.seen[q.id]);
  const rest = source.filter(q=>state.seen[q.id] && !state.wrong[q.id]);
  deck = shuffle([...weak, ...shuffle(fresh), ...shuffle(rest)]);
}

function level(){ return Math.max(1, Math.floor(state.xp/120)+1); }
function renderStats(){
  $("#level").textContent = level();
  $("#xp").textContent = state.xp;
  $("#score").textContent = state.score;
  $("#streak").textContent = state.streak;
  $("#answered").textContent = state.answered;
  const mastery = Object.values(state.mastered).filter(v=>v>=2).length;
  $("#mastery").textContent = mastery;
}

function start(){
  buildDeck();
  nextQuestion();
  renderStats();
}

function nextQuestion(){
  locked=false;
  current = deck[state.index % deck.length];
  $("#progress").textContent = `ภารกิจ ${state.answered+1}`;
  $("#question").textContent = current.q;
  $("#difficulty").textContent = current.difficulty>=5 ? "⚡ ระดับท้าทาย" : "🔥 ระดับสนามสอบ";
  const box=$("#options"); box.innerHTML="";
  current.options.forEach((opt,i)=>{
    const b=document.createElement("button");
    b.className="option";
    b.innerHTML=`<span class="dot">${i+1}</span><span>${opt}</span>`;
    b.onclick=()=>answer(opt,b);
    box.appendChild(b);
  });
  $("#feedback").className="feedback hidden";
  $("#feedback").innerHTML="";
  $("#next").classList.add("hidden");
  $("#source").textContent="";
}

function answer(selected, btn){
  if(locked) return;
  locked=true;
  const correct = selected===current.answer;
  document.querySelectorAll(".option").forEach(b=>b.disabled=true);
  if(correct){
    btn.classList.add("correct");
    state.score += 1;
    state.xp += 20 + current.difficulty*3;
    state.streak += 1;
    state.mastered[current.id]=(state.mastered[current.id]||0)+1;
  }else{
    btn.classList.add("wrong");
    state.streak=0;
    state.xp += 5;
    state.wrong[current.id]=(state.wrong[current.id]||0)+1;
    document.querySelectorAll(".option").forEach(b=>{
      if(b.querySelector("span:last-child")?.textContent===current.answer) b.classList.add("correct");
    });
  }
  state.seen[current.id]=true;
  state.answered += 1;
  state.history.push({id:current.id, correct, t:Date.now()});
  saveState(state); renderStats();
  const fb=$("#feedback");
  fb.className=`feedback ${correct?"good":"bad"}`;
  fb.innerHTML=`
    <div class="result">${correct?"✓ ถูกต้อง":"✕ ยังไม่ใช่"}</div>
    <div class="answerLine"><b>คำตอบที่ดีที่สุด:</b> ${current.answer}</div>
    <div class="why"><b>🧠 ทำไม?</b> ${current.why}</div>
    <div class="tip"><b>🎯 เทคนิค:</b> ${current.tip}</div>
    <div class="src"><b>📚 แหล่งต้นแบบ:</b> ${current.source}</div>`;
  $("#next").classList.remove("hidden");
  window.scrollTo({top:0,behavior:"smooth"});
}

$("#next").onclick=()=>{state.index++; saveState(state); nextQuestion();};
$("#continue").onclick=()=>start();
$("#reset").onclick=()=>{ if(confirm("ล้างความคืบหน้าทั้งหมด?")) resetProgress(); };
$("#review").onclick=()=>{
  const weakIds=new Set(Object.keys(state.wrong).map(Number));
  deck=shuffle(QUESTIONS.filter(q=>weakIds.has(q.id)).map(q=>({...q,options:shuffle(q.options)})));
  if(!deck.length){ alert("ตอนนี้ยังไม่มีข้อที่พลาด ลองเล่นสนามผสมก่อนครับ"); return; }
  state.index=0; nextQuestion();
};
$("#daily").onclick=()=>{
  deck=shuffle(QUESTIONS).slice(0,8).map(q=>({...q,options:shuffle(q.options)}));
  state.index=0; nextQuestion();
};
renderStats();
start();
