// --- Кнопка для обновления ---
const update_app = document.getElementById('update_app');
update_app.style.display = 'none'; // скрыта по умолчанию

// --- Service Worker регистрация ---
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').then(reg => {
    // Слушаем появление новой версии SW
    reg.onupdatefound = () => {
      const newWorker = reg.installing;
      newWorker.onstatechange = () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // Новый контент доступен
          update_app.style.display = 'flex';
        }
      };
    };
  }).catch(console.error);
}

// При клике на кнопку обновления
update_app.onclick = () => {
  window.location.reload(); // перезагрузка страницы и активация нового SW
  speak("Приложение обновлено");
};

// --- Тут твой код  ---

let sound_voice = true;
let utterance = null;

function speak(text) {
  if (!sound_voice) return;
  speechSynthesis.cancel();
  utterance = new SpeechSynthesisUtterance(text);
  speechSynthesis.speak(utterance);
}

async function getCurrencies() {
  const url = 'https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json';
  const response = await fetch(url);
  const data = await response.json();

  renderRates(data);
}

function renderRates(data) {
  const usd = data.find(item => item.cc === 'USD');
  const eur = data.find(item => item.cc === 'EUR');

  const usdRate = usd.rate.toFixed(2);
  const eurRate = eur.rate.toFixed(2);

  const usdElement = document.querySelector('#usd');
  const eurElement = document.querySelector('#eur');

  usdElement.innerText = usdRate;
  eurElement.innerText = eurRate;
}
setInterval(getCurrencies, 300000);
getCurrencies();


const ECB_URL = "https://ecb-proxy.onrender.com/ecb";
const spread = 0.98; // 2% "скидка" для продажи валюты банку

async function fetchRates() {
  try {
    const response = await fetch(ECB_URL);
    const xmlText = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");

    let usd = null;
    let ron = null;

    xmlDoc.querySelectorAll('Cube[currency]').forEach(el => {
      const cur = el.getAttribute("currency");
      const rate = parseFloat(el.getAttribute("rate"));

      if (cur === "USD") usd = rate;
      if (cur === "RON") ron = rate;
    });

    if (ron) {
      document.querySelector('#eur_ro').innerText = (ron * spread).toFixed(2); // реальная продажа EUR
    }

    if (usd && ron) {
      document.querySelector('#usd_ro').innerText = ((ron / usd) * spread).toFixed(2); // реальная продажа USD
    }
  } catch (err) {
    console.error("Ошибка получения курсов:", err);
  }
}

fetchRates();
setInterval(fetchRates, 300000); // обновление каждые 5 минут





// Animation BG
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const particles = [];
const particleCount = 20;
const maxDistance = 120;

class Particle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.vx = (Math.random() - 0.5) * 1;
    this.vy = (Math.random() - 0.5) * 1;
    this.radius = 4;
    this.points = 8; // Количество концов у звезды
    this.innerRadius = this.radius / 2; // Внутренний радиус звезды
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    if (this.x > canvas.width) this.x = 0;
    if (this.x < 0) this.x = canvas.width;
    if (this.y > canvas.height) this.y = 0;
    if (this.y < 0) this.y = canvas.height;
  }

  drawStar(cx, cy, spikes, outerRadius, innerRadius) {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    let step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fill();
  }

  draw() {
    this.drawStar(this.x, this.y, this.points, this.radius, this.innerRadius);
  }
}

for (let i = 0; i < particleCount; i++) {
  particles.push(new Particle());
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particles.forEach(particle => {
    particle.update();
    particle.draw();
  });

  for (let i = 0; i < particleCount; i++) {
    for (let j = i + 1; j < particleCount; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < maxDistance) {
        const opacity = 1 - distance / maxDistance;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);  // Начало линии в координатах первой частицы
        ctx.lineTo(particles[j].x, particles[j].y);  // Конец линии в координатах второй частицы
        ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.8})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }

  requestAnimationFrame(animate);
}
animate();
window.addEventListener('resize', () => {
  canvas.width = window = window.innerWidth;
  canvas.height = window = window.innerHeight;
});

function convert(input, rateId, resultId) {
  const rateSpan = document.getElementById(rateId);
  const resultSpan = document.getElementById(resultId);
  const amount = parseFloat(input.value);
  const rate = parseFloat(rateSpan.innerText.replace(',', '.'));

  if (!isNaN(amount) && !isNaN(rate)) {
    const result = (amount * rate).toFixed(2);
    resultSpan.innerText = resultId.includes('uah') ? `${result} Гривен` : `${result} RON`;
  } else {
    resultSpan.innerText = resultId.includes('uah') ? `0 Гривен` : `0 RON`;
  }
}