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


async function fetchINGRates() {
  const proxyUrl = "https://api.allorigins.win/get?url=";
  const targetUrl = encodeURIComponent("https://ing.ro/persoane-fizice/curs-valutar");

  try {
    const response = await fetch(`${proxyUrl}${targetUrl}`);
    const data = await response.json();

    const parser = new DOMParser();
    const doc = parser.parseFromString(data.contents, "text/html");

    const tables = doc.querySelectorAll("table");
    const standardTable = tables[1];

    const rows = standardTable.querySelectorAll("tr");

    rows.forEach(row => {
      const cells = row.querySelectorAll("td");
      if (cells.length >= 6) {
        const code = cells[1].innerText.trim().toUpperCase();
        const ingBuy = parseFloat(cells[4].innerText.trim().replace(",", ".")).toFixed(2);

        if (code.includes("EUR")) {
          document.querySelector('#eur_ro').innerText = `${ingBuy}`;
        }
        if (code.includes("USD")) {
          document.querySelector('#usd_ro').innerText = `${ingBuy}`;
        }
      }
    });

  } catch (error) {
    console.error("Ошибка при получении данных:", error);
  }
}
setInterval(fetchINGRates, 300000);
fetchINGRates();


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