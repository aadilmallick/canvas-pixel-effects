// src/classes/MouseMove.ts
var mouse = {
  x: null,
  y: null,
  radius: 50
};
window.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

// src/classes/TextParticle.ts
Number.prototype.lerpTo = function(end, lerpFactor) {
  if (Math.floor(this.valueOf()) === Math.floor(end))
    return this.valueOf();
  let distance = this.valueOf() - end;
  return this.valueOf() - distance / lerpFactor;
};

class TextParticle {
  x;
  y;
  size = 3;
  baseX;
  baseY;
  density = Math.random() * 30 + 1;
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.baseX = x;
    this.baseY = y;
  }
  static getDistance(x1, y1, x2, y2) {
    const xDistance = x2 - x1;
    const yDistance = y2 - y1;
    return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
  }
  static drawLines(particle1, particle2, ctx) {
    const opacity = 1 - this.getDistance(particle1.x, particle1.y, particle2.x, particle2.y) / 50;
    if (opacity > 0) {
      ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(particle1.x, particle1.y);
      ctx.lineTo(particle2.x, particle2.y);
      ctx.stroke();
    }
  }
  update(deltaTime) {
    if (!mouse.x || !mouse.y)
      return;
    const dx = mouse.x - this.x;
    const dy = mouse.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const forceDirectionX = dx / distance;
    const forceDirectionY = dy / distance;
    let force = (mouse.radius - distance) / mouse.radius;
    if (distance < mouse.radius) {
      const directionX = forceDirectionX * force * this.density;
      const directionY = forceDirectionY * force * this.density;
      this.x -= directionX;
      this.y -= directionY;
    } else {
      this.x = this.x.lerpTo(this.baseX, 10);
      this.y = this.y.lerpTo(this.baseY, 10);
    }
  }
  draw(ctx, deltaTime) {
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

// src/classes/TextParticleManager.ts
var imageDataToPixels = function(imageData) {
  const pixels = [];
  for (let row = 0;row < imageData.height; row++) {
    for (let col = 0;col < imageData.width; col++) {
      const index = (row * imageData.width + col) * 4;
      const r = imageData.data[index];
      const g = imageData.data[index + 1];
      const b = imageData.data[index + 2];
      const a = imageData.data[index + 3];
      if (!pixels[row])
        pixels[row] = [];
      pixels[row][col] = { r, g, b, a };
    }
  }
  return {
    pixels,
    width: imageData.width,
    height: imageData.height
  };
};

class TextParticleManager {
  ctx;
  particles = [];
  lastTime = 0;
  constructor(ctx) {
    this.ctx = ctx;
    this.createParticles();
    console.log(this.particles.slice(0, 10));
  }
  createText(text, width) {
    this.ctx.font = "30px Arial";
    this.ctx.fillText(text, 0, 30);
    const imageData = this.ctx.getImageData(0, 0, Math.max(100, width), Math.max(100, width));
    return imageData;
  }
  createParticles() {
    const { pixels, width, height } = imageDataToPixels(this.createText("A", 100));
    for (let row = 0;row < height; row += 1) {
      for (let col = 0;col < width; col += 1) {
        if (pixels[row][col].a > 128) {
          const adjustX = 10;
          const adjustY = 10;
          this.particles.push(new TextParticle((col + adjustX) * 10, (row + adjustY) * 10));
        }
      }
    }
  }
  update() {
    this.particles.forEach((particle) => particle.update());
  }
  constellationEffect() {
    for (let a = 0;a < this.particles.length; a++) {
      for (let b = a + 1;b < this.particles.length; b++) {
        TextParticle.drawLines(this.particles[a], this.particles[b], this.ctx);
      }
    }
  }
  draw() {
    this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    this.particles.forEach((particle) => particle.draw(this.ctx));
    this.constellationEffect();
  }
  loop(timestamp = 0) {
    const deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;
    this.update();
    this.draw();
    requestAnimationFrame((timestamp2) => this.loop(timestamp2));
  }
}

// src/particleText.ts
var canvas = document.querySelector("canvas");
var ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var pm = new TextParticleManager(ctx);
pm.loop();
