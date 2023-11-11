import { GAME_HEIGHT, GAME_WIDTH } from "../utils/constants";

type ParticleType = "rain";

export default class Particle implements Renderable {
  x: number = Math.random() * GAME_WIDTH;
  y: number = 0;
  width: number = Math.random() * 1 + 2;
  height: number = Math.random() * 1 + 2;
  private size: number = Math.random() * 1 + 2;
  private speed = 0;
  private velocity = Math.random() * 3;

  constructor(private type: ParticleType) {
    switch (type) {
      case "rain":
        this.x = Math.random() * GAME_WIDTH;
        this.y = 0;
        this.width = Math.random() * 1 + 2;
        this.height = Math.random() * 1 + 2;
        this.size = Math.random() * 1 + 2;
        break;
    }
  }

  update(deltaTime?: number | undefined): void {
    this.y += this.velocity;
    if (this.y > GAME_HEIGHT) {
      this.y = 0;
      this.x = Math.random() * GAME_WIDTH;
    }
  }

  updateByBrightness(brightness: number) {
    if (this.y > GAME_HEIGHT) {
      this.y = 0;
      this.x = Math.random() * GAME_WIDTH;
    }
    this.speed = brightness;
    const movement = 2.5 - this.speed + this.velocity;
    this.y += movement;
  }

  draw(ctx: CanvasRenderingContext2D, deltaTime?: number | undefined): void {
    ctx.fillStyle = "#dd0000";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }

  static createParticles(numParticles: number, type: ParticleType) {
    const particles = [];
    for (let i = 0; i < numParticles; i++) {
      particles.push(new Particle(type));
    }
    return particles;
  }
}
