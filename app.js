
(() => {
  const D = window.TQDATA;
  const KEY = 'TQ7_STATE';
  const defaultState = () => ({
    xp:0, streak:0, best:0, answered:0, correct:0,
    cat:{}, lessonDone:{}, activity:{},
    seen:[], recent:[], updated:Date.now()
  });
  let S = load();
  let screen = 'home';
  let exam = {queue:[], index:0, current:null, locked:false};
  let activity = null;

  const $ = (sel,root=document)=>root.querySelector(sel);
  const $$ = (sel,root=document)=>[...root.querySelectorAll(sel)];
  const app = $('#app');

  function load(){
    try { return {...defaultState(), ...JSON.parse(localStorage.getItem(KEY)||'{}')}; }
    catch(e){ return defaultState(); }
  }
  function save(){ localStorage.setItem(KEY, JSON.stringify(S)); const x=$('#xp'), y=$('#streak'); if(x)x.textContent=S.xp; if(y)y.textContent=S.streak; }
  function shuffle(arr){
    const a=[...arr];
    for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}
    return a;
  }
  function esc(s){
    return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }
  function cleanText(s){ return String(s||'').replace(/\s+/g,' ').trim(); }
  function pct(a,b){ return b?Math.round(a/b*100):0; }
  function catStats(cat){
    const x=S.cat[cat]||{a:0,c:0};
    return {...x, pct:pct(x.c,x.a)};
  }
  function setNav(){
    $$('.bottom-nav button').forEach(b=>b.classList.toggle('active',b.dataset.go===screen));
  }
  function header(title,sub=''){
    return `<div class="page-head"><div><div class="eyebrow">TEACHER QUEST • V7</div><h2>${esc(title)}</h2>${sub?`<p>${esc(sub)}</p>`:''}</div><div class="mini-orb">✦</div></div>`;
  }
  function toast(msg){
    const t=document.createElement('div'); t.className='toast'; t.textContent=msg; document.body.appendChild(t);
    setTimeout(()=>t.remove(),1800);
  }
  function confetti(){
    const wrap=document.createElement('div'); wrap.className='confetti';
    for(let i=0;i<22;i++){const s=document.createElement('span');s.style.left=Math.random()*100+'%';s.style.animationDelay=Math.random()*.3+'s';s.textContent=['✦','●','◆','★'][i%4];wrap.appendChild(s)}
    document.body.appendChild(wrap); setTimeout(()=>wrap.remove(),1300);
  }
  function nav(){
    return `<nav class="bottom-nav">
      <button data-go="home"><span>⌂</span><b>หน้าแรก</b></button>
      <button data-go="learn"><span>📚</span><b>เรียน</b></button>
      <button data-go="play"><span>🎮</span><b>เล่น</b></button>
      <button data-go="exam"><span>📝</span><b>ข้อสอบ</b></button>
      <button data-go="analysis"><span>📊</span><b>วิเคราะห์</b></button>
    </nav>`;
  }

  function home(){
    const x=$('#xp'), y=$('#streak'); if(x)x.textContent=S.xp; if(y)y.textContent=S.streak;
    const total=Object.keys(D.lessons).length;
    const done=Object.keys(S.lessonDone).length;
    const accuracy=pct(S.correct,S.answered);
    app.innerHTML=`
      <section class="hero-card">
        <div class="hero-top"><span class="badge">V7 • SOURCE-FIRST</span><span class="spark">✦</span></div>
        <div class="mascot">🧑‍🏫</div>
        <div class="hero-copy"><div class="eyebrow">ACADEMY OF TEACHER QUEST</div><h1>ภารกิจพิชิต<br><span>ใบประกอบวิชาชีพครู</span></h1>
        <p>เรียนให้เข้าใจ • เล่นให้จำ • ทำข้อสอบจากคลังจริง • ดูจุดอ่อนของตัวเอง</p></div>
        <div class="hero-actions"><button class="primary big-btn" data-go="exam">🚀 เข้าสู่ภารกิจ</button><button class="ghost" data-go="learn">📖 ไปห้องเรียน</button></div>
      </section>
      <section class="stat-strip">
        <div><strong>${S.xp}</strong><span>XP</span></div><div><strong>${S.streak}</strong><span>สตรีค</span></div><div><strong>${accuracy}%</strong><span>ความแม่น</span></div><div><strong>${done}/${total}</strong><span>บทเรียน</span></div>
      </section>
      <section class="home-grid">
        <button class="feature-card lilac" data-go="learn"><span>📚</span><b>ห้องเรียน</b><small>${total} หมวด • 40 บทเรียน</small><em>เลือกเรียนตามจุดอ่อน</em></button>
        <button class="feature-card peach" data-go="play"><span>🎮</span><b>สนามกิจกรรม</b><small>หลายรูปแบบ ไม่ใช่ข้อสอบอย่างเดียว</small><em>เล่นเพื่อฝึกทักษะ</em></button>
        <button class="feature-card mint" data-go="exam"><span>📝</span><b>คลังข้อสอบ</b><small>${D.vault.length} ข้อจากไฟล์ต้นฉบับ</small><em>ทีละข้อ + เฉลยสอน</em></button>
        <button class="feature-card sky" data-go="analysis"><span>📊</span><b>ห้องวิเคราะห์</b><small>ดูความแข็งแรงรายหมวด</small><em>รู้ว่าควรพัฒนาอะไร</em></button>
      </section>
      <section class="update-note"><b>อัปเดต V7</b><span>แยก “เรียน / เล่น / ข้อสอบ / วิเคราะห์” ชัดเจน • ข้อสอบที่ให้คะแนนมาจากไฟล์ที่แนบ • ไม่มี A/B/C/D/E • เฉลยแยกหน้าสอน</span></section>
      <section class="source-note"><span>🔎 Source-first</span><p>คลังหลักนำข้อจาก <b>863598_ข้อสอบคู่ขนานสำหรับนักศึกษา.pdf</b> และชุดที่อ่านได้จาก <b>2567.pdf</b> มาใช้เป็นฐานข้อสอบ</p><small>หมายเหตุ: จำลอง.pdf เป็นไฟล์ภาพล้วนที่ระบบอ่านข้อความไม่ได้ จึงยังไม่เอาข้อความที่อ่านไม่ชัดมาปะปนกับข้อสอบ</small></section>
      ${nav()}`;
    setNav();
  }

  function learn(){
    const cards=Object.entries(D.lessons).map(([cat,mods])=>{
      const done=mods.filter((_,i)=>S.lessonDone[cat+'::'+i]).length;
      const pctv=pct(done,mods.length);
      return `<button class="learn-card" data-cat="${esc(cat)}"><div class="learn-icon">${iconFor(cat)}</div><div class="learn-main"><b>${esc(cat)}</b><span>${mods.length} บทเรียน • ${done}/${mods.length} เรียนแล้ว</span><div class="progress"><i style="width:${pctv}%"></i></div></div><strong>${pctv}%</strong></button>`
    }).join('');
    app.innerHTML=`${header('ห้องเรียน','ตรงนี้มี “เนื้อหา” เท่านั้น เลือกหมวดที่อยากปูพื้นหรืออุดจุดอ่อน') }
      <div class="notice"><b>วิธีเรียน V7</b><span>อ่านแก่น → ดูตัวอย่าง → ท่องเทคนิค → ทำกิจกรรมในสนามเล่นเมื่อพร้อม</span></div>
      <section class="learn-list">${cards}</section>${nav()}`;
    setNav();
  }

  function iconFor(cat){
    const m={'การใช้ภาษาไทยเพื่อการสื่อสาร':'💬','ภาษาอังกฤษเพื่อการสื่อสาร':'🇬🇧','เทคโนโลยีดิจิทัลเพื่อการศึกษา':'💻','การเปลี่ยนแปลงบริบทโลก':'🌏','ปรัชญาของเศรษฐกิจพอเพียง':'🌱','จิตวิทยาการศึกษา':'🧠','การประกันคุณภาพการศึกษา':'🏫','วัดผลและวิจัยการเรียนรู้':'📐','หลักสูตรและการสอน':'🧩'};
    return m[cat]||'📘';
  }

  function lessonDetail(cat){ screen='learn';
    const mods=D.lessons[cat]||[];
    const done=mods.filter((_,i)=>S.lessonDone[cat+'::'+i]).length;
    app.innerHTML=`<div class="back-row"><button class="back" data-go="learn">← หมวดเรียน</button><span>${done}/${mods.length} บท</span></div>
      <section class="cat-hero"><div class="learn-icon">${iconFor(cat)}</div><div><div class="eyebrow">LEARNING PATH</div><h2>${esc(cat)}</h2><p>เรียนเป็นตอนสั้น ๆ แล้วกลับมาได้ทุกเมื่อ</p></div></section>
      <section class="lesson-list">${mods.map((m,i)=>`
        <article class="lesson-item ${S.lessonDone[cat+'::'+i]?'done':''}">
          <div class="lesson-num">${i+1}</div><div class="lesson-body"><div class="lesson-title"><b>${esc(m.title)}</b>${S.lessonDone[cat+'::'+i]?'<span>✓ เรียนแล้ว</span>':''}</div>
          <p>${esc(m.body)}</p><div class="lesson-box"><b>ตัวอย่างการคิด</b><span>${esc(m.example)}</span></div><div class="memory"><b>🧠 จำง่าย</b><span>${esc(m.memory)}</span></div>
          <button class="mark" data-learn="${i}">${S.lessonDone[cat+'::'+i]?'อ่านซ้ำ':'เรียนจบตอนนี้'}</button></div>
        </article>`).join('')}</section>${nav()}`;
    $$('.mark').forEach(b=>b.onclick=()=>{S.lessonDone[cat+'::'+b.dataset.learn]=true;S.xp+=5;save();lessonDetail(cat);toast('บันทึกความก้าวหน้าแล้ว +5 XP')});
    setNav();
  }

  function play(){
    app.innerHTML=`${header('สนามกิจกรรม','ที่นี่เน้น “เล่นและฝึก” ไม่ใช่ทำข้อสอบยาว ๆ') }
      <section class="game-hero"><div class="game-avatar">🎮</div><div><b>เลือกภารกิจ</b><p>กิจกรรมสั้น ๆ เพื่อฝึกการคิดแบบครู</p></div></section>
      <div class="activity-grid">
        <button class="activity-card" data-act="sort"><span>🧩</span><b>เรียงแผนสอน</b><small>จัดลำดับการออกแบบการเรียนรู้ให้ถูกทาง</small><em>เล่น 1 รอบ • +XP</em></button>
        <button class="activity-card" data-act="evidence"><span>🔎</span><b>นักสืบหลักฐาน</b><small>เลือกหลักฐานที่น่าเชื่อถือกว่าในสถานการณ์จริง</small><em>ฝึกคิดแบบมีเหตุผล</em></button>
        <button class="activity-card" data-act="match"><span>🧠</span><b>จับคู่แนวคิด</b><small>จับคู่คำสำคัญกับความหมาย</small><em>จำแบบไม่ท่องอย่างเดียว</em></button>
        <button class="activity-card" data-act="teacher"><span>🧑‍🏫</span><b>ครูตัดสินใจ</b><small>เลือกการกระทำที่เหมาะกับสถานการณ์ห้องเรียน</small><em>สถานการณ์สั้น ๆ</em></button>
      </div>
      ${nav()}`;
    $$('.activity-card').forEach(b=>b.onclick=()=>startActivity(b.dataset.act));
    setNav();
  }

  const ACTS={
    sort:{title:'เรียงแผนสอน',subtitle:'แตะการ์ดตามลำดับที่ควรเกิดขึ้น',items:['กำหนดผลลัพธ์การเรียนรู้','กำหนดหลักฐาน/วิธีประเมิน','ออกแบบกิจกรรมและสื่อ','จัดการเรียนรู้และเก็บข้อมูล','สะท้อนผลและปรับปรุง'],answer:[0,1,2,3,4]},
    evidence:{title:'นักสืบหลักฐาน',subtitle:'เลือกหลักฐานที่น่าเชื่อถือที่สุด',items:[
      {q:'นักเรียนแชร์ข่าวสุขภาพจากโพสต์ที่มียอดไลก์สูงมาก หลักฐานใดควรตรวจต่อก่อนเชื่อ?',a:'แหล่งอ้างอิงและหลักฐานของข้อมูล',opts:['จำนวนไลก์','ความคิดเห็นของเพื่อน','แหล่งอ้างอิงและหลักฐานของข้อมูล']},
      {q:'ครูต้องการดูว่าผู้เรียนลงมือทำทักษะได้จริง หลักฐานใดตรงที่สุด?',a:'การสังเกตการปฏิบัติจริงด้วยเกณฑ์',opts:['คะแนนข้อสอบปรนัยอย่างเดียว','การสังเกตการปฏิบัติจริงด้วยเกณฑ์','จำนวนครั้งที่ผู้เรียนยกมือ']},
      {q:'โรงเรียนต้องตั้งเป้าหมายคุณภาพที่เป็นไปได้ ควรเริ่มจากอะไร?',a:'ข้อมูลฐานของผู้เรียนและบริบทโรงเรียน',opts:['ตัวเลขที่โรงเรียนอื่นตั้ง','ข้อมูลฐานของผู้เรียนและบริบทโรงเรียน','ความรู้สึกของผู้บริหารคนเดียว']}
    ]},
    match:{title:'จับคู่แนวคิด',subtitle:'แตะคำสำคัญให้ตรงกับความหมาย',pairs:[
      ['อิงเกณฑ์','เทียบกับจุดตัด/มาตรฐานที่กำหนด'],['PDCA','วางแผน–ลงมือ–ตรวจสอบ–ปรับปรุง'],['Digital Footprint','ร่องรอยกิจกรรมที่ทิ้งไว้บนโลกออนไลน์'],['Constructivism','ผู้เรียนสร้างความหมายจากประสบการณ์และการเชื่อมโยง']
    ]},
    teacher:{title:'ครูตัดสินใจ',subtitle:'สถานการณ์สั้น ๆ เลือกทางที่ช่วยผู้เรียนจริง',items:[
      {q:'นักเรียนผลการเรียนต่ำต่อเนื่อง ครูควรเริ่มจากอะไร?',a:'ศึกษาข้อมูลและหาความต้องการ/จุดแข็งของผู้เรียน',opts:['ให้รางวัลคนคะแนนสูง','ศึกษาข้อมูลและหาความต้องการ/จุดแข็งของผู้เรียน','แยกนักเรียนออกจากห้อง']},
      {q:'นักเรียนถูกกลั่นแกล้งออนไลน์ ครูควรแนะนำแนวทางใดก่อน?',a:'เก็บหลักฐานและขอความช่วยเหลือจากผู้รับผิดชอบ',opts:['ตอบโต้ทันที','เก็บหลักฐานและขอความช่วยเหลือจากผู้รับผิดชอบ','ลบทุกบัญชีโดยไม่บอกใคร']},
      {q:'ครูต้องออกแบบบทเรียนให้ผู้เรียนมีส่วนร่วมจริง ข้อใดตรงกับ Active Learning มากที่สุด?',a:'ให้ผู้เรียนสืบค้น ลงมือทำ และสะท้อนผล',opts:['ครูบรรยายตลอดคาบ','ให้ผู้เรียนสืบค้น ลงมือทำ และสะท้อนผล','ให้ผู้เรียนคัดคำตอบจากสไลด์']}
    ]}
  };

  function startActivity(type){
    activity={type,step:0,score:0,order:[],matched:[],pairs:ACTS[type].pairs?shuffle(ACTS[type].pairs):[]};
    renderActivity();
  }
  function renderActivity(){
    const a=ACTS[activity.type];
    if(activity.type==='sort'){
      const pool=activity.pool||shuffle(a.items.map((x,i)=>({x,i})));
      activity.pool=pool;
      app.innerHTML=`<div class="back-row"><button class="back" data-go="play">← สนามกิจกรรม</button><span>ภารกิจ ${activity.step+1}/1</span></div>
      <section class="activity-play"><div class="activity-title"><span>🧩</span><div><b>${a.title}</b><p>${a.subtitle}</p></div></div>
      <div class="order-hint">เลือกทีละใบตามลำดับที่ถูกต้อง</div><div class="sort-pool">${pool.map((it,i)=>`<button class="sort-card ${activity.order.includes(it.i)?'used':''}" data-i="${it.i}">${esc(it.x)}</button>`).join('')}</div>
      <div class="selected-order">${activity.order.map((i,n)=>`<span>${n+1}. ${esc(a.items[i])}</span>`).join('')}</div>
      <button class="primary full" id="check-sort">ตรวจคำตอบ</button></section>${nav()}`;
      $$('.sort-card').forEach(b=>b.onclick=()=>{const i=+b.dataset.i;if(!activity.order.includes(i)){activity.order.push(i);renderActivity()}});
      $('#check-sort').onclick=()=>{
        const ok=JSON.stringify(activity.order)===JSON.stringify(a.answer);
        finishActivity(ok?1:0, ok?'เรียงถูกครบ!':'ลำดับยังไม่ครบ ลองอีกครั้ง');
      };
    } else if(activity.type==='match'){
      const pairs=activity.pairs;
      app.innerHTML=`<div class="back-row"><button class="back" data-go="play">← สนามกิจกรรม</button><span>${activity.matched.length}/${pairs.length}</span></div>
      <section class="activity-play"><div class="activity-title"><span>🧠</span><div><b>${a.title}</b><p>${a.subtitle}</p></div></div>
      <div class="match-grid">${pairs.map((p,i)=>`<button class="match-card" data-i="${i}"><b>${esc(p[0])}</b><span>${esc(p[1])}</span></button>`).join('')}</div></section>${nav()}`;
      $$('.match-card').forEach(b=>b.onclick=()=>{const i=+b.dataset.i;if(!activity.matched.includes(i)){activity.matched.push(i);if(activity.matched.length===pairs.length)finishActivity(1,'จับคู่ครบแล้ว!');else{b.classList.add('picked');toast('จับคู่สำเร็จ')}}});
    } else {
      const items=a.items;
      const it=items[activity.step%items.length];
      app.innerHTML=`<div class="back-row"><button class="back" data-go="play">← สนามกิจกรรม</button><span>รอบ ${activity.step+1}/${items.length}</span></div>
      <section class="activity-play"><div class="activity-title"><span>${activity.type==='evidence'?'🔎':'🧑‍🏫'}</span><div><b>${a.title}</b><p>${a.subtitle}</p></div></div>
      <div class="scenario">${esc(it.q)}</div><div class="mini-options">${shuffle(it.opts).map(o=>`<button data-o="${esc(o)}">${esc(o)}</button>`).join('')}</div></section>${nav()}`;
      $$('.mini-options button').forEach(b=>b.onclick=()=>{
        const ok=b.dataset.o===it.a;
        if(ok){activity.score++;toast('ถูกทาง! +1');} else toast('ยังไม่ใช่ ลองดูเหตุผลของสถานการณ์');
        activity.step++;
        if(activity.step>=items.length) finishActivity(activity.score,`ได้ ${activity.score}/${items.length} คะแนน`);
        else setTimeout(renderActivity,220);
      });
    }
  }
  function finishActivity(score,msg){
    const gain=10+score*5; S.xp+=gain; S.activity[activity.type]=(S.activity[activity.type]||0)+1; save(); confetti();
    app.innerHTML=`<section class="result-card"><div class="result-emoji">🎉</div><div class="eyebrow">MISSION COMPLETE</div><h2>${esc(msg)}</h2><p>รับ ${gain} XP และบันทึกสถิติแล้ว</p><button class="primary full" data-go="play">กลับสนามกิจกรรม</button></section>${nav()}`;
    setNav();
  }

  function examHome(){
    app.innerHTML=`${header('ข้อสอบจากคลัง','ข้อสอบที่ให้คะแนนในโหมดนี้มาจากไฟล์ที่แนบเท่านั้น • แสดงหมวดให้รู้ว่ากำลังฝึกอะไร') }
      <section class="exam-start">
        <div class="exam-icon">📝</div><h3>คลังฝึกพร้อมเฉลย ${D.quiz.length} ข้อ</h3><p>คละหมวด • สุ่มตำแหน่งตัวเลือก • ทีละข้อ • เฉลยแยกหน้า • อธิบายตรงประเด็น</p>
        <div class="mode-grid"><button class="mode" data-mode="mixed"><b>🎲 Mixed Run</b><span>10 ข้อ คละหมวด</span></button><button class="mode" data-mode="cat"><b>🎯 Focus Run</b><span>เลือกหมวดที่ต้องการ</span></button><button class="mode" data-mode="source"><b>🗂 Source Vault</b><span>ดูคลังต้นฉบับ ${D.vault.length} ข้อ</span></button></div>
      </section>
      <div class="source-badges">${D.sources.map(s=>`<span>${s.count?`✓ ${s.name} • ${s.count} ข้อ`:`◌ ${s.name} • ยังไม่ใช้เป็นข้อสอบ`}</span>`).join('')}</div>${nav()}`;
    $$('.mode').forEach(b=>b.onclick=()=>startExam(b.dataset.mode));
    setNav();
  }

  function startExam(mode){
    if(mode==='source'){sourceVault();return}
    let pool=[...D.quiz];
    if(mode==='cat'){
      const cats=Object.keys(D.lessons);
      app.innerHTML=`${header('เลือกหมวดข้อสอบ','เลือกได้ 1 หมวด แล้วระบบจะสุ่มข้อจากคลัง') }<div class="cat-pick">${cats.map(c=>`<button data-cat="${esc(c)}"><span>${iconFor(c)}</span><b>${esc(c)}</b><small>${D.quiz.filter(q=>q.category===c).length} ข้อพร้อมเฉลย</small></button>`).join('')}</div>${nav()}`;
      $$('.cat-pick button').forEach(b=>b.onclick=()=>beginQueue(D.quiz.filter(q=>q.category===b.dataset.cat),8));
      setNav();return;
    }
    beginQueue(shuffle(pool),10);
  }
  function beginQueue(pool,n){
    exam.queue=shuffle(pool).slice(0,n);exam.index=0;exam.locked=false;renderQuestion();
  }
  function renderQuestion(){
    const q=exam.queue[exam.index];
    const choices=shuffle(q.choices.map((text,i)=>({text,correct:i===q.answer})));
    exam.current={...q,choices};
    app.innerHTML=`<div class="quiz-top"><button class="back" id="quit">← ออก</button><div class="q-progress"><i style="width:${(exam.index/exam.queue.length)*100}%"></i></div><b>${exam.index+1}/${exam.queue.length}</b></div>
      <section class="question-card"><div class="question-meta"><span class="cat-tag">${iconFor(q.category)} ${esc(q.category)}</span><span class="source-tag">จาก ${esc(q.source_file)} • ข้อ ${q.source_number}</span></div>
      <h2>${esc(cleanText(q.question))}</h2><div class="choices-list">${choices.map((c,i)=>`<button class="answer-choice" data-i="${i}"><span>${i+1}</span><b>${esc(cleanText(c.text))}</b></button>`).join('')}</div></section>`;
    $('#quit').onclick=examHome;
    $$('.answer-choice').forEach(b=>b.onclick=()=>answerQuestion(+b.dataset.i));
  }
  function answerQuestion(i){
    if(exam.locked)return;exam.locked=true;
    const q=exam.current, chosen=q.choices[i], ok=chosen.correct;
    S.answered++; if(ok){S.correct++;S.streak++;S.best=Math.max(S.best,S.streak)} else S.streak=0;
    S.xp += ok?15:4;
    S.cat[q.category]??={a:0,c:0};S.cat[q.category].a++;if(ok)S.cat[q.category].c++;
    S.seen.push(q.id);S.recent.unshift({id:q.id,category:q.category,ok});S.recent=S.recent.slice(0,12);save();
    if(ok)confetti();
    app.innerHTML=`<section class="explain-card ${ok?'correct':'wrong'}"><div class="answer-state">${ok?'✓':'•'}</div><div class="eyebrow">${ok?'CORRECT':'KEEP LEARNING'}</div><h2>${ok?'ตอบถูก!':'ยังไม่ใช่คำตอบที่ดีที่สุด'}</h2>
      <div class="correct-box"><small>คำตอบที่ถูก</small><b>${esc(q.choices.find(c=>c.correct).text)}</b></div>
      <div class="explain-block"><h3>🧠 ทำไม?</h3><p>${esc(q.explanation)}</p></div>
      <div class="explain-block tip"><h3>🎯 เทคนิคจำ</h3><p>${esc(q.tip)}</p></div>
      <div class="source-line">📄 ${esc(q.source_file)} • ข้อ ${q.source_number} • หมวด ${esc(q.category)}</div>
      <button class="primary full" id="next-q">${exam.index+1<exam.queue.length?'ไปข้อถัดไป →':'ดูผลรอบนี้ →'}</button></section>`;
    $('#next-q').onclick=()=>{if(exam.index+1<exam.queue.length){exam.index++;exam.locked=false;renderQuestion()}else{examSummary()}};
  }
  function examSummary(){
    const run=exam.queue.map(q=>q.id);const recent=S.recent.filter(x=>run.includes(x.id));const score=recent.filter(x=>x.ok).length;
    app.innerHTML=`<section class="summary-card"><div class="result-emoji">🏆</div><div class="eyebrow">RUN COMPLETE</div><h2>จบรอบแล้ว</h2><div class="run-score">${score}<span>/${exam.queue.length}</span></div><p>${score>=8?'รอบนี้แน่นมาก!':'เก็บข้อที่พลาดกลับไปเรียน แล้วค่อยกลับมาซ้ำ'}</p><div class="summary-grid"><div><b>${S.xp}</b><span>XP รวม</span></div><div><b>${S.streak}</b><span>สตรีค</span></div><div><b>${pct(S.correct,S.answered)}%</b><span>ความแม่นรวม</span></div></div><button class="primary full" data-go="analysis">ดูจุดที่ควรพัฒนา</button><button class="ghost full" data-go="exam">กลับคลังข้อสอบ</button></section>${nav()}`;
    setNav();
  }

  function sourceVault(){
    let page=0;const pageSize=20;
    const render=()=>{
      const slice=D.vault.slice(page*pageSize,(page+1)*pageSize);
      app.innerHTML=`${header('Source Vault','คลังต้นฉบับสำหรับอ่านและสำรวจ • ไม่สร้างข้อใหม่ทับต้นฉบับ') }
      <div class="vault-head"><b>${D.vault.length} ข้อ</b><span>หน้า ${page+1}/${Math.ceil(D.vault.length/pageSize)}</span></div>
      <div class="vault-list">${slice.map(q=>`<details><summary><span>${iconFor(q.category)}</span><b>${esc(q.category)}</b><small>ข้อ ${q.source_number}</small></summary><p>${esc(cleanText(q.question))}</p><div class="vault-opts">${q.choices.map(x=>`<span>${esc(cleanText(x))}</span>`).join('')}</div><em>ต้นฉบับ: ${esc(q.source_file)}</em></details>`).join('')}</div>
      <div class="pager"><button ${page===0?'disabled':''} id="prev">← ก่อน</button><button ${page>=Math.ceil(D.vault.length/pageSize)-1?'disabled':''} id="next">ถัดไป →</button></div>${nav()}`;
      $('#prev').onclick=()=>{page--;render()};$('#next').onclick=()=>{page++;render()};setNav();
    };render();
  }

  function analysis(){
    const cats=Object.keys(D.lessons);
    const rows=cats.map(c=>{const x=catStats(c);return `<div class="analysis-row"><span class="analysis-icon">${iconFor(c)}</span><div><b>${esc(c)}</b><small>${x.a?`${x.c}/${x.a} ถูก`:'ยังไม่มีข้อมูล'}</small><div class="progress"><i style="width:${x.pct}%"></i></div></div><strong>${x.a?x.pct+'%':'—'}</strong></div>`}).join('');
    const weak=cats.map(c=>({c,...catStats(c)})).filter(x=>x.a).sort((a,b)=>a.pct-b.pct).slice(0,3);
    app.innerHTML=`${header('ห้องวิเคราะห์','ตรงนี้มีเฉพาะข้อมูลการพัฒนาของคุณ ไม่ปะปนกับเนื้อหาเรียนหรือกิจกรรม') }
      <section class="analysis-hero"><div class="donut" style="--p:${pct(S.correct,S.answered)}"><span>${pct(S.correct,S.answered)}%</span></div><div><b>ภาพรวมการทำข้อสอบ</b><p>${S.answered?`ตอบแล้ว ${S.answered} ข้อ • ถูก ${S.correct} ข้อ`:'ยังไม่มีข้อมูล เริ่มทำข้อสอบก่อน'}</p></div></section>
      <h3 class="section-title">ความแข็งแรงรายหมวด</h3><section class="analysis-list">${rows}</section>
      <h3 class="section-title">3 จุดที่ควรกลับไปเรียน</h3><section class="weak-list">${weak.length?weak.map(x=>`<button data-cat="${esc(x.c)}"><span>${iconFor(x.c)}</span><div><b>${esc(x.c)}</b><small>ความแม่น ${x.pct}% • กลับไปอ่านบทเรียน</small></div>→</button>`).join(''):'<div class="empty">ทำข้อสอบสักรอบ แล้วห้องนี้จะเริ่มวิเคราะห์ให้</div>'}</section>
      <h3 class="section-title">ข้อที่พลาดล่าสุด</h3><section class="recent-list">${S.recent.length?S.recent.map(r=>`<div><span>${r.ok?'✓':'!'}</span><b>${esc(r.category)}</b><small>${r.ok?'ตอบถูก':'ตอบผิด — แนะนำให้กลับไปเรียน'}</small></div>`).join(''):'<div class="empty">ยังไม่มีประวัติ</div>'}</section>${nav()}`;
    $$('.weak-list button').forEach(b=>b.onclick=()=>lessonDetail(b.dataset.cat));setNav();
  }

  function resetAll(){
    if(confirm('รีเซ็ตความก้าวหน้าทั้งหมดหรือไม่?')){S=defaultState();save();screen='home';home();toast('รีเซ็ตแล้ว')}
  }

  document.addEventListener('click',e=>{
    const b=e.target.closest('[data-go]');
    if(b){const g=b.dataset.go;screen=g;if(g==='home')home();else if(g==='learn')learn();else if(g==='play')play();else if(g==='exam')examHome();else if(g==='analysis')analysis()}
  });
  $('#reset')?.addEventListener('click',resetAll);
  window.addEventListener('tq-ready',home);
  window.TQ7={home,learn,play,examHome,analysis,resetAll};
  home();
})();
