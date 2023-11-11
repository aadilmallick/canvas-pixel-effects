import Particle from "./classes/Particle";
import ParticleManager from "./classes/ParticleManager";
import SpriteAnimation from "./utils/SpriteAnimation";
import { spiderman } from "./utils/constants";
const canvas = document.querySelector("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

canvas.width = spiderman.width;
canvas.height = spiderman.height;

console.log(canvas.width, canvas.height);

function grayscale() {
  ctx.drawImage(spiderman, 0, 0, canvas.width, canvas.height);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < imageData.data.length; i += 4) {
    const average =
      (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
    imageData.data[i] = average;
    imageData.data[i + 1] = average;
    imageData.data[i + 2] = average;
  }

  ctx.putImageData(imageData, 0, 0);
}

let particleManager!: ParticleManager;

function main() {
  particleManager = new ParticleManager(ctx);
  animate();
}

function animate() {
  ctx.drawImage(spiderman, 0, 0, canvas.width, canvas.height);
  ctx.globalAlpha = 0.05;
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  particleManager.update();
  particleManager.draw();
  requestAnimationFrame(animate);
}

main();
