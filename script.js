/* =========================================================
   EDIT THIS PART — your personal content
   ========================================================= */
const CONFIG = {
  passkey: "0902",                 // 4-digit code to open the surprise
  music: "2fe4-7031-4cb2-872c-8370d7f6e37d.mp3",               // your song (upload it next to index.html)
  volume: 0.6,                     // 0 to 1
  hint: "",                        // optional hint shown on a wrong code
  photos: [                        // upload your photos next to index.html and list them here
    "1.jpg", "2.jpg", "3.jpg", "4.jpg",
    "5.jpg", "6.jpg", "7.jpg", "8.jpg"
  ],
  letter:
`To My Dholu,

I am writing this little note just because you have been on my mind all day long, which is nothing new since you pretty much live there anyway.

Every single time I find myself smiling at my phone like a complete fool whenever your name pops up, and honestly, it is my absolute favorite part of the day.

You have this way of making ordinary moments feel like home. Thank you for being you.

Always yours
Sushi.`
};

/* =========================================================
   Code below — no need to edit
   ========================================================= */
const $ = (s) => document.querySelector(s);
const rnd = (a, b) => a + Math.random() * (b - a);

/* preload the images used by the animations so nothing pops in late */
["rose-pink.png", "rose-white.png", "lock.png", "couple.png", "dried-rose.png"].forEach((s) => { new Image().src = s; });

/* roses: pink, white, and a peach one (pink shifted by CSS filter) */
const ROSES = ["rose-pink.png", "rose-white.png", "rose-pink.png peach"];
function makeRose(size, kind) {
  const [src, cls] = ROSES[kind % 3].split(" ");
  const img = new Image();
  img.src = src; img.alt = ""; img.width = size; img.draggable = false; img.decoding = "async";
  if (cls) img.style.filter = "hue-rotate(30deg) saturate(1.25) brightness(1.1) drop-shadow(0 4px 7px rgba(0,0,0,.42))";
  return img;
}

/* split a text into animated letters (or words) */
function splitText(el, words) {
  const text = el.textContent;
  el.setAttribute("aria-label", text);
  el.textContent = "";
  let n = 0;
  text.split(" ").forEach((word, wi, all) => {
    const w = document.createElement("span");
    w.className = "w"; w.setAttribute("aria-hidden", "true");
    if (words) {
      w.classList.add("wd"); w.style.setProperty("--i", wi); w.textContent = word;
    } else {
      [...word].forEach((ch) => {
        const s = document.createElement("span");
        s.className = "ch"; s.style.setProperty("--i", n++); s.textContent = ch;
        w.appendChild(s);
      });
    }
    el.appendChild(w);
    if (wi < all.length - 1) el.appendChild(document.createTextNode(" "));
  });
}
splitText($("#title"));
splitText($("#always"), true);

/* ---------- Music ---------- */
const bgm = new Audio(CONFIG.music);
bgm.loop = true; bgm.volume = 0; bgm.preload = "auto";
let musicOn = false, fadeTimer;
function fadeTo(v, ms) {
  clearInterval(fadeTimer);
  const from = bgm.volume, steps = Math.max(1, ms / 50); let i = 0;
  fadeTimer = setInterval(() => {
    bgm.volume = Math.min(1, Math.max(0, from + (v - from) * (++i / steps)));
    if (i >= steps) clearInterval(fadeTimer);
  }, 50);
}
function startMusic() {
  if (musicOn) return;
  bgm.play().then(() => {
    musicOn = true;
    $("#muteBtn").hidden = false;
    fadeTo(CONFIG.volume, 2500);
  }).catch(() => {});
}
$("#muteBtn").onclick = () => {
  bgm.muted = !bgm.muted;
  $("#muteBtn").classList.toggle("off", bgm.muted);
};
document.addEventListener("visibilitychange", () => {
  if (!musicOn) return;
  if (document.hidden) bgm.pause(); else bgm.play().catch(() => {});
});

/* ---------- 0. Gift screen ---------- */
const sparkTimer = setInterval(() => {
  const host = $("#sparkles");
  if (!host) return clearInterval(sparkTimer);
  const s = document.createElement("i");
  s.className = "sp"; s.textContent = ["✦", "♥", "✧"][(Math.random() * 3) | 0];
  s.style.left = rnd(2, 98) + "vw"; s.style.fontSize = rnd(.7, 1.4) + "rem";
  s.style.setProperty("--t", rnd(6, 10) + "s"); s.style.setProperty("--sx", rnd(-50, 50) + "px");
  host.appendChild(s); setTimeout(() => s.remove(), 10500);
}, 420);

$("#giftBtn").onclick = () => {
  $("#giftBtn").onclick = null;
  startMusic();
  $("#gift").classList.add("opening");
  setTimeout(() => $("#gift").classList.add("gone"), 500);
  setTimeout(runIntro, 650);
  setTimeout(() => { clearInterval(sparkTimer); $("#gift").remove(); }, 2200);
};

/* ---------- 1. Rose curtain: roses cover the screen, tap -> curtain opens ---------- */
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
      pins.forEach((pin) => {                    // same roses in both halves of the curtain
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
    document.body.classList.add("opened");
    setTimeout(() => document.body.classList.remove("locked-scroll"), 1600);
    setTimeout(observeReveal, 900);
    setTimeout(() => intro.remove(), 2400);
  };
}

/* ---------- scroll reveal ---------- */
function observeReveal() {
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }), { threshold: .25 });
  ["#hero", "#poem", "#lockSection"].forEach((s) => io.observe($(s)));
}

/* ---------- 2. Passkey ---------- */
let entered = "", busy = false;
function buildKeypad() {
  const pad = $("#keypad");
  $("#pkDots").innerHTML = "<i></i><i></i><i></i><i></i>";
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 0].forEach((n, i) => {
    const b = document.createElement("button");
    b.textContent = n; b.style.setProperty("--k", i);
    if (n === 0) b.className = "zero";
    b.onclick = () => press(String(n));
    pad.appendChild(b);
  });
  const clr = document.createElement("button");
  clr.textContent = "Clear"; clr.className = "clr"; clr.style.setProperty("--k", 10);
  clr.onclick = () => { if (busy) return; entered = ""; paintDots(); $("#pkHint").textContent = ""; };
  pad.appendChild(clr);
}
function paintDots() {
  [...$("#pkDots").children].forEach((d, i) => d.classList.toggle("on", i < entered.length));
}
function press(n) {
  if (busy || entered.length >= 4) return;
  if (navigator.vibrate) navigator.vibrate(10);
  entered += n; paintDots();
  if (entered.length === 4) setTimeout(check, 300);
}
function burst(x, y) {
  const wrap = document.createElement("div");
  wrap.className = "burst"; wrap.style.left = x + "px"; wrap.style.top = y + "px";
  const colors = ["#f4a7c0", "#fbf6ea", "#e9a58a", "#e0526a", "#7fd29b"];
  for (let i = 0; i < 28; i++) {
    const s = document.createElement("i");
    const a = Math.random() * Math.PI * 2, dist = rnd(90, 280);
    s.textContent = ["♥", "✦", "❀", "♡"][(Math.random() * 4) | 0];
    s.style.setProperty("--dx", Math.cos(a) * dist + "px");
    s.style.setProperty("--dy", Math.sin(a) * dist - 50 + "px");
    s.style.setProperty("--rot", rnd(-200, 200) + "deg");
    s.style.setProperty("--s", rnd(.9, 1.9) + "rem");
    s.style.setProperty("--c", colors[(Math.random() * colors.length) | 0]);
    s.style.animationDelay = rnd(0, .15) + "s";
    wrap.appendChild(s);
  }
  document.body.appendChild(wrap);
  setTimeout(() => wrap.remove(), 2000);
}
function check() {
  if (entered === CONFIG.passkey) {
    busy = true;
    const lock = $(".pk-lock"), r = lock.getBoundingClientRect();
    lock.classList.add("unlocked");
    burst(r.left + r.width / 2, r.top + r.height / 2);
    $("#pkTitle").textContent = "Unlocked ✓"; $("#pkTitle").classList.add("ok");
    $("#pkHint").textContent = "Welcome, my love"; $("#pkHint").classList.add("ok");
    setTimeout(() => {
      $("#passkey").hidden = true;
      lock.classList.remove("unlocked");
      $("#pkTitle").textContent = "Enter Passkey"; $("#pkTitle").classList.remove("ok");
      $("#pkHint").textContent = ""; $("#pkHint").classList.remove("ok");
      entered = ""; paintDots(); busy = false;
      startLoading();
    }, 1700);
  } else {
    if (navigator.vibrate) navigator.vibrate([40, 40, 40]);
    const d = $("#pkDots");
    d.classList.add("shake");
    $("#pkHint").textContent = CONFIG.hint || "Wrong passkey, try again";
    busy = true;
    setTimeout(() => { d.classList.remove("shake"); entered = ""; paintDots(); busy = false; }, 550);
  }
}
document.addEventListener("keydown", (e) => {
  if ($("#passkey").hidden) return;
  if (/^\d$/.test(e.key)) press(e.key);
  if (e.key === "Backspace" && !busy) { entered = entered.slice(0, -1); paintDots(); }
  if (e.key === "Escape" && !busy) $("#passkey").hidden = true;
});

/* ---------- 3. Loading ---------- */
function startLoading() {
  const w = $("#wreath"); w.innerHTML = "";
  for (let i = 0; i < 8; i++) {
    const rose = makeRose(62, i % 2 === 0 ? 0 : 1);
    rose.style.transform = `rotate(${i * 45}deg) translateY(-60px)`;
    rose.style.setProperty("--i", i);
    w.appendChild(rose);
  }
  $("#loading").hidden = false;
  setTimeout(() => { $("#loading").hidden = true; openMemories(); }, 2800);
}

/* ---------- 4. Memories ---------- */
let typed = false, heartTimer;
function buildGallery() {
  const g = $("#gallery");
  if (g.children.length) return;
  CONFIG.photos.forEach((src) => {
    const p = document.createElement("figure");
    p.className = "polaroid";
    p.style.setProperty("--rot", rnd(-4, 4).toFixed(1) + "deg");
    const img = new Image();
    img.src = src; img.alt = "Our memory"; img.loading = "lazy";
    img.onerror = () => { const ph = document.createElement("div"); ph.className = "ph"; ph.textContent = "♡"; img.replaceWith(ph); };
    p.appendChild(img);
    g.appendChild(p);
  });
}
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
  startHearts();

  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    const t = e.target;
    t.classList.add("in");
    if (t.id === "letter" && !typed) { typed = true; setTimeout(typeLetter, 900); }
    io.unobserve(t);
  }), { root: m, threshold: .15 });
  document.querySelectorAll(".polaroid,#letter,.finale").forEach((el, i) => {
    if (el.classList.contains("polaroid")) el.style.transitionDelay = (i % 4) * 130 + "ms";
    io.observe(el);
  });
}
function typeLetter() {
  const el = $("#letterText"), txt = CONFIG.letter; let i = 0;
  (function tick() {
    el.textContent = txt.slice(0, ++i);
    if (i >= txt.length) return $("#letter").classList.add("finished");
    const ch = txt[i - 1];
    const wait = ch === "\n" ? 320 : /[.!?]/.test(ch) ? 360 : ch === "," ? 190 : rnd(26, 58);
    setTimeout(tick, wait);
  })();
}

/* ---------- wiring ---------- */
$("#lockBtn").onclick = () => {
  startMusic();
  entered = ""; paintDots(); $("#pkHint").textContent = "";
  $("#passkey").hidden = false;
};
$("#pkClose").onclick = () => { if (!busy) $("#passkey").hidden = true; };
$("#backBtn").onclick = () => {
  $("#memories").hidden = true; clearInterval(heartTimer);
  document.body.classList.remove("locked-scroll");
};

buildKeypad();
