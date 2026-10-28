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

/* ---------- 1. Rose intro ---------- */
function runIntro() {
  const intro = $("#intro");
  intro.classList.add("active");
  const size = Math.max(70, Math.min(120, innerWidth / 10));
  const step = size * 0.62;
  const cols = Math.ceil(innerWidth / step) + 1;
  const rows = Math.ceil(innerHeight / step) + 1;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const rose = makeRose(size, (Math.random() * 3) | 0);
      rose.style.left = (c * step - size * 0.3 + (Math.random() - .5) * step * .6) + "px";
      rose.style.top = (r * step - size * 0.3 + (Math.random() - .5) * step * .6) + "px";
      rose.style.setProperty("--r0", (Math.random() * 360 - 180) + "deg");
      rose.style.setProperty("--r1", (Math.random() * 60 - 30) + "deg");
      rose.style.setProperty("--d", (Math.random() * 2.2).toFixed(2) + "s");
      intro.appendChild(rose);
    }
  }
  setTimeout(() => {
    intro.classList.add("done");
    $("#main").classList.add("show");
    document.body.classList.remove("locked-scroll");
    observeReveal();
    setTimeout(() => intro.remove(), 1600);
  }, 4600);
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
function press(n) {
  if (entered.length >= 4) return;
  entered += n; paintDots();
  if (entered.length === 4) setTimeout(check, 250);
}
function check() {
  if (entered === CONFIG.passkey) {
    $("#passkey").hidden = true;
    startLoading();
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
    const rose = makeRose(34, i % 2 === 0 ? 0 : 1);
    rose.style.transform = `rotate(${i * 45}deg) translateY(-34px)`;
    w.appendChild(rose);
  }
  $("#loading").hidden = false;
  setTimeout(() => { $("#loading").hidden = true; openMemories(); }, 2400);
}

/* ---------- 4. Memories ---------- */
let typed = false;
function openMemories() {
  const g = $("#gallery");
  if (!g.children.length) {
    CONFIG.photos.forEach((src) => {
      const p = document.createElement("figure");
      p.className = "polaroid";
      p.style.setProperty("--rot", (Math.random() * 8 - 4).toFixed(1) + "deg");
      const img = new Image();
      img.src = src; img.alt = "Our memory"; img.loading = "lazy";
      img.onerror = () => { const ph = document.createElement("div"); ph.className = "ph"; ph.textContent = "♡"; img.replaceWith(ph); };
      p.appendChild(img);
      g.appendChild(p);
    });
  }
  const m = $("#memories");
  m.hidden = false; m.scrollTop = 0;
  document.body.classList.add("locked-scroll");

  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    const t = e.target;
    if (t.classList.contains("polaroid")) t.classList.add("in");
    if (t.id === "letter" && !typed) { typed = true; typeLetter(); }
    if (t.classList.contains("finale")) t.classList.add("in");
    io.unobserve(t);
  }), { root: m, threshold: .2 });
  document.querySelectorAll(".polaroid,#letter,.finale").forEach((el, i) => {
    if (el.classList.contains("polaroid")) el.style.transitionDelay = (i % 4) * 120 + "ms";
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
$("#backBtn").onclick = () => { $("#memories").hidden = true; document.body.classList.remove("locked-scroll"); };

buildKeypad();
/* gift tap -> music + roses fill the screen -> page opens */
$("#giftBtn").onclick = () => {
  $("#giftBtn").onclick = null;
  startMusic();
  $("#gift").classList.add("gone");
  runIntro();
  setTimeout(() => $("#gift").remove(), 1500);
};
