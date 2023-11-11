/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

interface Number {
  lerpTo(end: number, lerpFactor: number): number;
}

interface Renderable {
  update(deltaTime?: number): void;
  draw(ctx: CanvasRenderingContext2D, deltaTime?: number): void;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ParticleRenderable {
  update(deltaTime?: number): void;
  draw(ctx: CanvasRenderingContext2D, deltaTime?: number): void;
  x: number;
  y: number;
  size: number;
}

interface DrawUIManager {
  update(deltaTime?: number): void;
  draw(ctx: CanvasRenderingContext2D, deltaTime?: number): void;
}

declare module "*.png";
declare module "*.wav";
