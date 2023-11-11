import { GAME_HEIGHT, GAME_WIDTH, spiderman } from "../utils/constants";
import { mapToBrightness } from "../utils/utils";
import Particle from "./Particle";

export default class ParticleManager {
  private particles: Particle[];
  private brightnessMap: ReturnType<typeof mapToBrightness>;
  constructor(private ctx: CanvasRenderingContext2D) {
    this.particles = Particle.createParticles(5000, "rain");
    this.brightnessMap = mapToBrightness(
      ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height)
    );
  }

  update() {
    this.particles.forEach((particle) => particle.update());
  }

  draw() {
    this.particles.forEach((particle) => particle.draw(this.ctx));
  }
}
