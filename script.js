const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

const pages = ["giftPage","storyPage","lockPage","loadingPage","memoriesPage","finalPage"];
let entered = "";

function show(id){
  pages.forEach(p => document.getElementById(p).classList.remove("active"));
  document.getElementById(id).classList.add("active");
  window.scrollTo({top:0, behavior:"instant"});
}

function setupText(){
  $("#introTitle").textContent = CONFIG.introTitle;
  $("#introHint").textContent = CONFIG.introHint;
  $("#storyTitle").textContent = CONFIG.storyTitle;
  $("#storySubtitle").textContent = CONFIG.storySubtitle;
  $("#quote1").textContent = CONFIG.quote1;
  $("#quote2").textContent = CONFIG.quote2;
  $("#finalTitle").textContent = CONFIG.finalTitle;
  $("#finalFrom").textContent = CONFIG.finalFrom;

  // Colour specific words like the reference.
  colourWords("#quote1", ["smile"], ["#ef7186"]);
  colourWords("#quote1", ["peace"], ["#75a46c"]);
  colourWords("#quote2", ["love"], ["#e97879"]);
  colourWords("#quote2", ["home"], ["#c99759"]);
}
function colourWords(selector, words, colors){
  const el = $(selector);
  let t = el.textContent;
  words.forEach((w,i)=>{
    const re = new RegExp("\\b"+w+"\\b","gi");
    t = t.replace(re, `<mark style="color:${colors[i]||colors[0]}">${w}</mark>`);
  });
  el.innerHTML = t;
}

function setupMusic(){
  const m = $("#music");
  m.src = CONFIG.music || "";
  document.addEventListener("pointerdown",()=>{
    if(m.src) m.play().catch(()=>{});
  }, {once:true});
}

function renderMemories(){
  const box = $("#memories");
  box.innerHTML = "";
  (CONFIG.memories||[]).forEach((src,i)=>{
    const div = document.createElement("div");
    div.className = "memory";
    const img = document.createElement("img");
    img.src = src;
    img.alt = "Memory "+(i+1);
    img.onerror = ()=>{ div.style.display="none"; };
    div.appendChild(img);
    box.appendChild(div);
  });
}

function updateDots(){
  $$("#dots i").forEach((d,i)=>d.classList.toggle("filled",i<entered.length));
}

function press(k){
  if(entered.length >= 4) return;
  entered += k;
  updateDots();
  if(entered.length===4){
    setTimeout(()=>{
      if(entered === CONFIG.passkey){
        $$("#dots i").forEach(d=>d.classList.add("filled"));
        $("#lockTitle").textContent = "Unlocked";
        $("#lockTitle").style.color = "#8fd2aa";
        setTimeout(()=>{
          show("loadingPage");
          setTimeout(()=>show("memoriesPage"), 1600);
        },450);
      } else {
        $("#error").textContent = CONFIG.wrongPasskey;
        entered="";
        setTimeout(updateDots,250);
      }
    },180);
  }
}

$("#giftButton").onclick = ()=>show("storyPage");
$("#openLockBtn").onclick = ()=>{
  entered=""; $("#error").textContent="";
  $("#lockTitle").textContent="Enter Passkey";
  $("#lockTitle").style.color="#f19b88";
  updateDots(); show("lockPage");
};
$("#closeLock").onclick = ()=>show("storyPage");
$("#clearKey").onclick = ()=>{entered="";$("#error").textContent="";updateDots()};
$$("[data-key]").forEach(b=>b.onclick=()=>press(b.dataset.key));
$$(".back-btn").forEach(b=>b.onclick=()=>show(b.dataset.back));

setupText();
setupMusic();
renderMemories();

// soft floating hearts
const canvas = $("#particles"), ctx=canvas.getContext("2d");
let particles=[];
function resize(){canvas.width=innerWidth*devicePixelRatio;canvas.height=innerHeight*devicePixelRatio;ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0)}
resize();addEventListener("resize",resize);
function make(){
  particles.push({
    x:Math.random()*innerWidth,y:innerHeight+20,
    s:Math.random()*7+5,v:Math.random()*0.6+0.2,
    drift:(Math.random()-.5)*.45,life:Math.random()*180+100
  });
}
function drawHeart(x,y,s){
  ctx.save();ctx.translate(x,y);ctx.globalAlpha=.28;ctx.strokeStyle="#e78f96";ctx.lineWidth=1.2;
  ctx.beginPath();ctx.moveTo(0,s*.3);ctx.bezierCurveTo(-s,-s*.25,-s*.65,-s*.8,0,-s*.35);
  ctx.bezierCurveTo(s*.65,-s*.8,s,-s*.25,0,s*.3);ctx.stroke();ctx.restore();
}
function animate(){
  ctx.clearRect(0,0,innerWidth,innerHeight);
  if(Math.random()<.12) make();
  particles.forEach(p=>{p.y-=p.v;p.x+=p.drift;p.life--;drawHeart(p.x,p.y,p.s)});
  particles=particles.filter(p=>p.life>0&&p.y>-30);
  requestAnimationFrame(animate);
}
animate();
