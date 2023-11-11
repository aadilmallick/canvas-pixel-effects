import TextParticle from "./TextParticle";

function imageDataToPixels(imageData: ImageData) {
  const pixels: { r: number; g: number; b: number; a: number }[][] = [];
  for (let row = 0; row < imageData.height; row++) {
    for (let col = 0; col < imageData.width; col++) {
      const index = (row * imageData.width + col) * 4;
      const r = imageData.data[index];
      const g = imageData.data[index + 1];
      const b = imageData.data[index + 2];
      const a = imageData.data[index + 3];
      if (!pixels[row]) pixels[row] = [];
      pixels[row][col] = { r, g, b, a };
    }
  }
  return {
    pixels,
    width: imageData.width,
    height: imageData.height,
  };
}

export default class TextParticleManager {
  private particles: TextParticle[] = [];
  private lastTime: number = 0;
  constructor(private ctx: CanvasRenderingContext2D) {
    this.createParticles();
    console.log(this.particles.slice(0, 10));
  }

  private createText(text: string, width: number) {
    this.ctx.font = "30px Arial";
    this.ctx.fillText(text, 0, 30);
    const imageData = this.ctx.getImageData(
      0,
      0,
      Math.max(100, width),
      Math.max(100, width)
    );
    return imageData;
  }

  private createParticles() {
    const { pixels, width, height } = imageDataToPixels(
      this.createText("A", 100)
    );
    for (let row = 0; row < height; row += 1) {
      for (let col = 0; col < width; col += 1) {
        if (pixels[row][col].a > 128) {
          const adjustX = 10;
          const adjustY = 10;
          this.particles.push(
            new TextParticle((col + adjustX) * 10, (row + adjustY) * 10)
          );
        }
      }
    }
  }

  private update() {
    this.particles.forEach((particle) => particle.update());
  }

  private constellationEffect() {
    for (let a = 0; a < this.particles.length; a++) {
      for (let b = a + 1; b < this.particles.length; b++) {
        TextParticle.drawLines(this.particles[a], this.particles[b], this.ctx);
      }
    }
  }

  private draw() {
    this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    this.particles.forEach((particle) => particle.draw(this.ctx));
    this.constellationEffect();
  }

  public loop(timestamp: number = 0) {
    const deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;
    this.update();
    this.draw();

    requestAnimationFrame((timestamp) => this.loop(timestamp));
  }
}
