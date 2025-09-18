// ROOM JOIN (mock)
document.getElementById("roomForm").addEventListener("submit", e=>{
  e.preventDefault();
  const room = document.getElementById("roomInput").value;
  document.getElementById("roomStatus").textContent = "✅ Joined Room: " + room;
  e.target.reset();
});
// ADMIN CONTROLS (mock)
document.querySelectorAll(".admin-btn").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    const action = btn.dataset.action;
    if(action==="mute") alert("🔇 User muted (mock)");
    if(action==="remove") alert("🚪 User removed (mock)");
    if(action==="end") alert("⏹ Session ended (mock)");
  });
});

// THEME SWITCHER
(() => {
  const select = document.getElementById("themeSelect");
  const saved = localStorage.getItem("theme") || "dark";
  document.body.classList.add(saved);
  select.value = saved;
  select.addEventListener("change", () => {
    document.body.classList.remove("dark","light","pastel","solarized");
    const t = select.value;
    document.body.classList.add(t);
    localStorage.setItem("theme", t);
  });
})();

// CHAT
const msgForm = document.getElementById("msgForm");
const msgInput = document.getElementById("msgInput");
const messages = document.getElementById("messages");
msgForm.addEventListener("submit", e => {
  e.preventDefault();
  const text = msgInput.value.trim();
  if (!text) return;
  addMessage(text, "self");
  msgInput.value = "";
});
document.querySelectorAll(".emoji-btn").forEach(btn => {
  btn.addEventListener("click", () => addMessage(btn.textContent, "self"));
});
function addMessage(text, type="other") {
  const div = document.createElement("div");
  div.className = `msg ${type}`;
  div.textContent = text;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

// WHITEBOARD
const canvas = document.getElementById("whiteboard");
const ctx = canvas.getContext("2d");
canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;
let drawing=false, mode="pen";
let brush=4, eraser=24, color="#fff";
canvas.addEventListener("mousedown", e=>{drawing=true; ctx.beginPath();});
canvas.addEventListener("mouseup", ()=>drawing=false);
canvas.addEventListener("mousemove", e=>{
  if(!drawing) return;
  ctx.strokeStyle = mode==="pen"?color:"#1e1e2f";
  ctx.lineWidth = mode==="pen"?brush:eraser;
  ctx.lineCap="round";
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
});
document.getElementById("wbColor").oninput=e=>color=e.target.value;
document.getElementById("wbBrush").oninput=e=>brush=+e.target.value;
document.getElementById("wbEraser").oninput=e=>eraser=+e.target.value;
document.getElementById("wbPenBtn").onclick=()=>mode="pen";
document.getElementById("wbEraseBtn").onclick=()=>mode="erase";
document.getElementById("wbClear").onclick=()=>ctx.clearRect(0,0,canvas.width,canvas.height);

// FLASHCARDS
let deck=[{q:"2+2?",a:"4"},{q:"Capital of France?",a:"Paris"}], idx=0;
const flashcard=document.getElementById("flashcard");
const front=document.getElementById("fcFront"), back=document.getElementById("fcBack");
function renderCard(){front.textContent=deck[idx].q; back.textContent=deck[idx].a; flashcard.classList.remove("flipped");}
flashcard.onclick=()=>flashcard.classList.toggle("flipped");
document.getElementById("fcNext").onclick=()=>{idx=(idx+1)%deck.length;renderCard();};
document.getElementById("fcPrev").onclick=()=>{idx=(idx-1+deck.length)%deck.length;renderCard();};
document.getElementById("fcCheck").onclick=()=>{
  const ans=document.getElementById("fcAnswer").value.trim().toLowerCase();
  if(ans===deck[idx].a.toLowerCase()){alert("✅ Correct!");idx=(idx+1)%deck.length;renderCard();}
  else alert("❌ Nope. Answer: "+deck[idx].a);
};
document.getElementById("addCardBtn").onclick=()=>{
  const q=document.getElementById("newQ").value, a=document.getElementById("newA").value;
  if(!q||!a) return;
  deck.push({q,a}); idx=deck.length-1; renderCard();
  document.getElementById("newQ").value="";document.getElementById("newA").value="";
};
renderCard();

// TIMER
let timer, timeLeft=1500;
const timerEl=document.getElementById("timer");
function updateTimer(){
  let m=Math.floor(timeLeft/60), s=timeLeft%60;
  timerEl.textContent=`${m.toString().padStart(2,"0")}:${s.toString().padStart(2,"0")}`;
}
function startTimer(){if(!timer) timer=setInterval(()=>{if(timeLeft>0){timeLeft--;updateTimer();}else{clearInterval(timer);timer=null;}},1000);}
function pauseTimer(){clearInterval(timer);timer=null;}
function resetTimer(){pauseTimer();timeLeft=1500;updateTimer();}
document.getElementById("timerStart").onclick=startTimer;
document.getElementById("timerPause").onclick=pauseTimer;
document.getElementById("timerReset").onclick=resetTimer;
document.querySelectorAll(".preset-btn").forEach(btn=>btn.onclick=()=>{timeLeft=+btn.dataset.seconds;updateTimer();});
updateTimer();

// SESSIONS
let sessions=[];
document.getElementById("sessionForm").onsubmit=e=>{
  e.preventDefault();
  const t=document.getElementById("sessionTitle").value;
  const d=document.getElementById("sessionDate").value;
  const ti=document.getElementById("sessionTime").value||"09:00";
  sessions.push({id:Date.now(),title:t,ts:new Date(`${d}T${ti}`)});
  renderSessions(); e.target.reset();
};
function renderSessions(){
  const ul=document.getElementById("sessionList"); ul.innerHTML="";
  sessions.forEach(s=>{
    const li=document.createElement("li");
    li.textContent=`${s.title} – ${s.ts.toLocaleString()}`;
    ul.appendChild(li);
  });
}

// EXAMS
let exams=[];
document.getElementById("examForm").onsubmit=e=>{
  e.preventDefault();
  const t=document.getElementById("examTitle").value;
  const d=document.getElementById("examDate").value;
  const ti=document.getElementById("examTime").value||"09:00";
  exams.push({id:Date.now(),title:t,ts:new Date(`${d}T${ti}`)});
  renderExams(); e.target.reset();
};
function renderExams(){
  const ul=document.getElementById("examsList"); ul.innerHTML="";
  exams.forEach(ex=>{
    const li=document.createElement("li");
    li.textContent=`${ex.title} – ${ex.ts.toLocaleDateString()}`;
    ul.appendChild(li);
  });
}
// after auth
const token = "<your-access-token>";

fetch("https://api.spotify.com/v1/me/player/currently-playing", {
  headers: { Authorization: "Bearer " + token }
})
  .then(res => res.json())
  .then(data => {
    console.log("Now playing:", data.item.name, "by", data.item.artists[0].name);
  });