import TextParticleManager from "./classes/TextParticleManager";

const canvas = document.querySelector("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const pm = new TextParticleManager(ctx);
pm.loop();
