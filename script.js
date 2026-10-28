/* =========================================================
   EDIT THIS PART — your personal content
   ========================================================= */
const CONFIG = {
  passkey: "1234",                 // 4-digit code to open the surprise
  music: "song.mp3",         // your song file (put the file next to index.html)
  volume: 0.6,                     // 0 to 1
  hint: "",                        // optional hint shown on wrong code
  photos: [                        // put your photos next to index.html and list them here
    "1.jpg", "2.jpg", "3.jpg", "4.jpg",
    "5.jpg", "6.jpg", "7.jpg", "8.jpg"
  ],
  letter:
`To My Dearest,

I am writing this little note just because you have been on my mind all day long, which is nothing new since you pretty much live there anyway.

Every single time I find myself smiling at my phone like a complete fool whenever your name pops up, and honestly, it is my absolute favorite part of the day.

You have this way of making ordinary moments feel like home. Thank you for being you.

Always yours.`
};

/* ========================================================= */
const $ = (s) => document.querySelector(s);
const ROSES = ["rose-pink.png", "rose-white.png", "rose-pink.png peach"];
function makeRose(size, kind) {
  const [src, cls] = ROSES[kind % 3].split(" ");
  const img = new Image();
  img.src = src; img.alt = ""; img.width = size; img.draggable = false;
  if (cls) img.className = cls;
  return img;
}

/* ---------- 1. Rose intro: roses cover the screen, tap -> curtain opens ---------- */
function runIntro() {
  const intro = $("#intro");
  intro.classList.add("active");
  const pins = [...intro.querySelectorAll(".pin")];
  const size = Math.max(110, Math.min(170, innerWidth / 7));
  const step = size * 0.5;
  const cols = Math.ceil(innerWidth / step) + 2;
  const rows = Math.ceil(innerHeight / step) + 2;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const kind = (Math.random() * 3) | 0;
      const left = c * step - size * 0.45 + (Math.random() - .5) * step * .5;
      const top = r * step - size * 0.45 + (Math.random() - .5) * step * .5;
      const r0 = (Math.random() * 360 - 180) + "deg";
      const r1 = (Math.random() * 70 - 35) + "deg";
      const d = (Math.random() * 2.2).toFixed(2) + "s";
      pins.forEach((pin) => {            // same roses in both curtain halves
        const rose = makeRose(size, kind);
        rose.style.left = left + "px"; rose.style.top = top + "px";
        rose.style.setProperty("--r0", r0); rose.style.setProperty("--r1", r1); rose.style.setProperty("--d", d);
        pin.appendChild(rose);
      });
    }
  }
  setTimeout(() => intro.classList.add("ready"), 4000);
  intro.onclick = () => {
    if (!intro.classList.contains("ready") || intro.classList.contains("open")) return;
    intro.classList.add("open");
    $("#main").classList.add("show");
    document.body.classList.remove("locked-scroll");
    observeReveal();
    setTimeout(() => intro.remove(), 2200);
  };
}

/* ---------- scroll reveal ---------- */
function observeReveal() {
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }), { threshold: .25 });
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
}

/* ---------- 2. Passkey ---------- */
let entered = "";
function buildKeypad() {
  const pad = $("#keypad"), dots = $("#pkDots");
  dots.innerHTML = "<i></i><i></i><i></i><i></i>";
  [1,2,3,4,5,6,7,8,9,0].forEach((n) => {
    const b = document.createElement("button");
    b.textContent = n;
    if (n === 0) b.className = "zero";
    b.onclick = () => press(String(n));
    pad.appendChild(b);
  });
  const clr = document.createElement("button");
  clr.textContent = "Clear"; clr.className = "clr";
  clr.onclick = () => { entered = ""; paintDots(); $("#pkHint").textContent = ""; };
  pad.appendChild(clr);
}
function paintDots() {
  [...$("#pkDots").children].forEach((d, i) => d.classList.toggle("on", i < entered.length));
}
let busy = false;
function press(n) {
  if (busy || entered.length >= 4) return;
  entered += n; paintDots();
  if (entered.length === 4) setTimeout(check, 250);
}
function check() {
  if (entered === CONFIG.passkey) {
    busy = true;
    $(".pk-lock").classList.add("unlocked");
    $("#pkTitle").textContent = "Unlocked ✓"; $("#pkTitle").classList.add("ok");
    $("#pkHint").textContent = "Welcome, my love"; $("#pkHint").classList.add("ok");
    setTimeout(() => {
      $("#passkey").hidden = true;
      $(".pk-lock").classList.remove("unlocked");
      $("#pkTitle").textContent = "Enter Passkey"; $("#pkTitle").classList.remove("ok");
      $("#pkHint").textContent = ""; $("#pkHint").classList.remove("ok");
      entered = ""; paintDots(); busy = false;
      startLoading();
    }, 1500);
  } else {
    const d = $("#pkDots");
    d.classList.add("shake");
    $("#pkHint").textContent = CONFIG.hint || "Wrong passkey, try again";
    setTimeout(() => { d.classList.remove("shake"); entered = ""; paintDots(); }, 500);
  }
}
document.addEventListener("keydown", (e) => {
  if ($("#passkey").hidden) return;
  if (/^\d$/.test(e.key)) press(e.key);
  if (e.key === "Backspace") { entered = entered.slice(0, -1); paintDots(); }
  if (e.key === "Escape") $("#passkey").hidden = true;
});

/* ---------- 3. Loading ---------- */
function startLoading() {
  const w = $("#wreath"); w.innerHTML = "";
  for (let i = 0; i < 8; i++) {
    const rose = makeRose(62, i % 2 === 0 ? 0 : 1);
    rose.style.transform = `rotate(${i * 45}deg) translateY(-60px)`;
    w.appendChild(rose);
  }
  $("#loading").hidden = false;
  setTimeout(() => { $("#loading").hidden = true; openMemories(); }, 2400);
}

/* ---------- 4. Memories ---------- */
let typed = false;
const rnd = (a, b) => a + Math.random() * (b - a);

function buildGallery() {
  const g = $("#gallery");
  if (g.children.length) return;
  CONFIG.photos.forEach((src) => {
    const pw = document.createElement("figure");
    pw.className = "pw";
    pw.dataset.k = rnd(.8, 1.02).toFixed(2);        // size factor
    pw.dataset.ar = [1, 1.25, 1.33, 1.15][(Math.random() * 4) | 0]; // photo height / width
    pw.dataset.dx = rnd(-.14, .14).toFixed(2);       // sideways drift
    const side = Math.random() < .5 ? -1 : 1;
    const flyVars = pw.style;
    pw.style.setProperty("--fx", side * rnd(250, 700) + "px");   // fly-in start
    pw.style.setProperty("--fy", rnd(120, 520) + "px");
    pw.style.setProperty("--fr", rnd(-40, 40) + "deg");
    const fly = document.createElement("div");
    fly.className = "fly";
    const p = document.createElement("div");
    p.className = "polaroid";
    p.style.setProperty("--rot", rnd(-8, 8).toFixed(1) + "deg");
    p.style.setProperty("--ar", pw.dataset.ar);
    p.style.setProperty("--dur", rnd(4, 7).toFixed(1) + "s");
    p.style.setProperty("--del", (-rnd(0, 5)).toFixed(1) + "s");
    const img = new Image();
    img.src = src; img.alt = "Our memory"; img.loading = "lazy";
    img.onerror = () => { const ph = document.createElement("div"); ph.className = "ph"; ph.textContent = "♡"; img.replaceWith(ph); };
    p.appendChild(img); fly.appendChild(p); pw.appendChild(fly); g.appendChild(pw);
  });
}
function layoutGallery() {
  const g = $("#gallery"), items = [...g.children];
  if (!items.length) return;
  const W = g.clientWidth - 32, cols = W < 620 ? 2 : 3, colW = W / cols;
  const heights = new Array(cols).fill(10);
  items.forEach((el) => {
    const w = colW * parseFloat(el.dataset.k) * .92;
    const h = (w - 16) * parseFloat(el.dataset.ar) + 46;
    let c = heights.indexOf(Math.min(...heights));
    el.style.width = w + "px";
    el.style.left = 16 + c * colW + (colW - w) / 2 + parseFloat(el.dataset.dx) * colW + "px";
    el.style.top = heights[c] + "px";
    heights[c] += h + rnd(-6, 26);
  });
  g.style.height = Math.max(...heights) + 60 + "px";
}
addEventListener("resize", () => { if (!$("#memories").hidden) layoutGallery(); });

let heartTimer;
function startHearts() {
  clearInterval(heartTimer);
  heartTimer = setInterval(() => {
    const h = document.createElement("i");
    h.className = "rise"; h.textContent = ["♥", "♡", "✦"][(Math.random() * 3) | 0];
    h.style.left = rnd(2, 96) + "vw"; h.style.fontSize = rnd(.8, 1.7) + "rem";
    h.style.setProperty("--t", rnd(7, 12) + "s"); h.style.setProperty("--sx", rnd(-60, 60) + "px");
    document.body.appendChild(h); setTimeout(() => h.remove(), 12500);
  }, 650);
}

function openMemories() {
  buildGallery();
  const m = $("#memories");
  m.hidden = false; m.scrollTop = 0;
  document.body.classList.add("locked-scroll");
  layoutGallery();
  startHearts();

  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    const t = e.target;
    if (t.classList.contains("pw")) t.classList.add("in");
    if (t.id === "letter" && !typed) { typed = true; typeLetter(); }
    if (t.classList.contains("finale")) t.classList.add("in");
    io.unobserve(t);
  }), { root: m, threshold: .15 });
  document.querySelectorAll(".pw,#letter,.finale").forEach((el, i) => {
    if (el.classList.contains("pw")) el.firstChild.style.transitionDelay = (i % 3) * 180 + "ms";
    io.observe(el);
  });
}
function typeLetter() {
  const el = $("#letterText"), txt = CONFIG.letter; let i = 0;
  (function tick() {
    el.textContent = txt.slice(0, ++i);
    if (i < txt.length) setTimeout(tick, 38);
    else $("#letter").classList.add("finished");
  })();
}

/* ---------- wiring ---------- */
/* ---------- music ---------- */
const bgm = new Audio(CONFIG.music);
bgm.loop = true; bgm.volume = CONFIG.volume;
function startMusic() {
  bgm.play().then(() => { $("#muteBtn").hidden = false; }).catch(() => {});
}
$("#muteBtn").onclick = () => {
  bgm.muted = !bgm.muted;
  $("#muteBtn").classList.toggle("off", bgm.muted);
};

$("#lockBtn").onclick = () => { startMusic(); entered = ""; paintDots(); $("#pkHint").textContent = ""; $("#passkey").hidden = false; };
$("#pkClose").onclick = () => ($("#passkey").hidden = true);
$("#backBtn").onclick = () => { $("#memories").hidden = true; clearInterval(heartTimer); document.body.classList.remove("locked-scroll"); };

buildKeypad();
/* gift tap -> music + roses fill the screen -> page opens */
$("#giftBtn").onclick = () => {
  $("#giftBtn").onclick = null;
  startMusic();
  $("#gift").classList.add("gone");
  runIntro();
  setTimeout(() => $("#gift").remove(), 1500);
};
