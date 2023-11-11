import { ModuleDetectionKind } from "typescript";
import { mouse } from "./MouseMove";

Number.prototype.lerpTo = function (end: number, lerpFactor: number) {
  if (Math.floor(this.valueOf()) === Math.floor(end)) return this.valueOf();

  let distance = this.valueOf() - end;
  return this.valueOf() - distance / lerpFactor;
};

export default class TextParticle implements ParticleRenderable {
  size: number = 3;
  private baseX: number;
  private baseY: number;
  private density: number = Math.random() * 30 + 1;
  constructor(public x: number, public y: number) {
    this.baseX = x;
    this.baseY = y;
  }

  private static getDistance(x1: number, y1: number, x2: number, y2: number) {
    const xDistance = x2 - x1;
    const yDistance = y2 - y1;
    return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
  }

  public static drawLines(
    particle1: TextParticle,
    particle2: TextParticle,
    ctx: CanvasRenderingContext2D
  ) {
    const opacity =
      1 -
      this.getDistance(particle1.x, particle1.y, particle2.x, particle2.y) / 50;
    if (opacity > 0) {
      ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(particle1.x, particle1.y);
      ctx.lineTo(particle2.x, particle2.y);
      ctx.stroke();
    }
  }

  update(deltaTime?: number | undefined): void {
    if (!mouse.x || !mouse.y) return;
    const dx = mouse.x - this.x;
    const dy = mouse.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const forceDirectionX = dx / distance;
    const forceDirectionY = dy / distance;

    let force = (mouse.radius - distance) / mouse.radius;

    if (distance < mouse.radius) {
      const directionX = forceDirectionX * force * this.density;
      const directionY = forceDirectionY * force * this.density;
      // move particles away from mouse, but stop moving at distance away from mouse radius
      this.x -= directionX;
      this.y -= directionY;
    } else {
      this.x = this.x.lerpTo(this.baseX, 10);
      this.y = this.y.lerpTo(this.baseY, 10);
      //   // lerp on x
      //   if (Math.floor(this.x) !== Math.floor(this.baseX)) {
      //     const dx = this.x - this.baseX;
      //     this.x -= dx / 10;
      //   }
      //   // lerp on y
      //   if (Math.floor(this.y) !== Math.floor(this.baseY)) {
      //     const dy = this.y - this.baseY;
      //     this.y -= dy / 10;
      //   }
    }
  }

  draw(ctx: CanvasRenderingContext2D, deltaTime?: number | undefined): void {
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}
