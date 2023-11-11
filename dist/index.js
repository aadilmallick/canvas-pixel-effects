// src/utils/utils.ts
function mapToBrightness(imageData) {
  const mappedImage = [];
  const { data, width, height } = imageData;
  const calculateRelativeLuminance = (red, green, blue) => {
    return Math.sqrt(0.299 * Math.pow(red, 2) + 0.587 * Math.pow(green, 2) + 0.114 * Math.pow(blue, 2));
  };
  for (let row = 0;row < height; row++) {
    mappedImage.push([]);
    for (let col = 0;col < width; col++) {
      const red = data[row * width * 4 + col * 4];
      const green = data[row * width * 4 + col * 4 + 1];
      const blue = data[row * width * 4 + col * 4 + 2];
      mappedImage[row].push(calculateRelativeLuminance(red, green, blue));
    }
  }
  return mappedImage;
}

// src/utils/SpriteAnimation.ts
class SpriteAnimation {
  character;
  spriteData;
  numFrames = -1;
  animationRow = -1;
  gameLoopCounter = 0;
  staggerFrames;
  image;
  animationTimer = 0;
  currentFrame = 0;
  framesInSpriteSheet;
  constructor(character, spriteData) {
    this.character = character;
    this.spriteData = spriteData;
    this.image = spriteData.image;
    this.staggerFrames = spriteData.staggerFrames && spriteData.staggerFrames > 0 ? spriteData.staggerFrames : 5;
    if (spriteData.numFrames) {
      this.framesInSpriteSheet = spriteData.numFrames;
    }
  }
  static loadImage(querySelector) {
    const image = document.querySelector(querySelector);
    if (!image)
      throw new Error("Image not found");
    return image;
  }
  getAnimationFrame(rowIndex, columnIndex) {
    return [
      columnIndex * this.character.width,
      rowIndex * this.character.height,
      this.character.width,
      this.character.height
    ];
  }
  updatePosition(x, y) {
    this.character.x = x;
    this.character.y = y;
  }
  drawFrame(ctx, rowIndex, columnIndex, sizeMultiplier) {
    const sm = sizeMultiplier !== undefined && sizeMultiplier > 0 ? sizeMultiplier : 1;
    ctx.drawImage(this.image, ...this.getAnimationFrame(rowIndex, columnIndex), this.character.x, this.character.y, this.character.width * sm, this.character.height * sm);
  }
  setAnimation(rowIndex, numFrames) {
    if (rowIndex < 0 || rowIndex >= this.spriteData.numRows) {
      throw new Error("Invalid row index");
    }
    this.numFrames = numFrames;
    this.animationRow = rowIndex;
  }
  animateWithCompleteSpriteSheet(ctx, animationRow) {
    if (animationRow >= 0 && animationRow < this.spriteData.numRows) {
      if (!this.framesInSpriteSheet) {
        throw new Error("Frames in sprite sheet not set");
      }
      const currentFrame = Math.floor(this.gameLoopCounter / this.staggerFrames) % this.framesInSpriteSheet;
      this.drawFrame(ctx, animationRow, currentFrame);
      this.gameLoopCounter++;
      if (currentFrame === this.framesInSpriteSheet - 1) {
        return true;
      }
      return false;
    }
    throw new Error("Invalid animation row");
  }
  animateWithIncompleteSpriteSheet(ctx) {
    if (this.numFrames === -1 || this.animationRow === -1) {
      throw new Error("Animation not set");
    }
    const currentFrame = Math.floor(this.gameLoopCounter / this.staggerFrames) % this.numFrames;
    this.drawFrame(ctx, this.animationRow, currentFrame);
    this.gameLoopCounter++;
    if (currentFrame === this.numFrames - 1) {
      return true;
    }
    return false;
  }
  drawAnimation(ctx, animationRow) {
    if (animationRow !== undefined) {
      return this.animateWithCompleteSpriteSheet(ctx, animationRow);
    }
    return this.animateWithIncompleteSpriteSheet(ctx);
  }
  drawAnimationDeltaTime(ctx, options) {
    const spriteSheetIsComplete = options.animationRow !== undefined && options.animationRow >= 0 && options.animationRow < this.spriteData.numRows;
    if (this.animationTimer > 1000 / options.fps) {
      this.currentFrame = (this.currentFrame + 1) % (spriteSheetIsComplete ? this.framesInSpriteSheet : this.numFrames);
      this.animationTimer = 0;
    } else {
      this.animationTimer += options.deltaTime;
    }
    if (options.animationRow !== undefined && options.animationRow >= 0 && options.animationRow < this.spriteData.numRows) {
      if (!this.framesInSpriteSheet) {
        throw new Error("Frames in sprite sheet not set");
      }
      this.drawFrame(ctx, options.animationRow, this.currentFrame);
      if (this.currentFrame === this.framesInSpriteSheet - 1) {
        return true;
      }
      return false;
    }
    if (this.numFrames === -1 || this.animationRow === -1) {
      throw new Error("Animation not set");
    }
    this.drawFrame(ctx, this.animationRow, this.currentFrame);
    if (this.currentFrame === this.numFrames - 1) {
      return true;
    }
    return false;
  }
  drawAnimationOneOff(ctx, animationRow) {
    if (animationRow !== undefined) {
      const isComplete2 = this.animateWithCompleteSpriteSheet(ctx, animationRow);
      if (isComplete2) {
        this.gameLoopCounter = 0;
      }
      return isComplete2;
    }
    const isComplete = this.animateWithIncompleteSpriteSheet(ctx);
    if (isComplete) {
      this.gameLoopCounter = 0;
    }
    return isComplete;
  }
}

// src/utils/constants.ts
var GAME_WIDTH = 800;
var GAME_HEIGHT = 450;
var spiderman = SpriteAnimation.loadImage("#spiderman");

// src/classes/Particle.ts
class Particle {
  type;
  x = Math.random() * GAME_WIDTH;
  y = 0;
  width = Math.random() * 1 + 2;
  height = Math.random() * 1 + 2;
  size = Math.random() * 1 + 2;
  speed = 0;
  velocity = Math.random() * 3;
  constructor(type) {
    this.type = type;
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
  update(deltaTime) {
    this.y += this.velocity;
    if (this.y > GAME_HEIGHT) {
      this.y = 0;
      this.x = Math.random() * GAME_WIDTH;
    }
  }
  updateByBrightness(brightness) {
    if (this.y > GAME_HEIGHT) {
      this.y = 0;
      this.x = Math.random() * GAME_WIDTH;
    }
    this.speed = brightness;
    const movement = 2.5 - this.speed + this.velocity;
    this.y += movement;
  }
  draw(ctx, deltaTime) {
    ctx.fillStyle = "#dd0000";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
  static createParticles(numParticles, type) {
    const particles = [];
    for (let i = 0;i < numParticles; i++) {
      particles.push(new Particle(type));
    }
    return particles;
  }
}

// src/classes/ParticleManager.ts
class ParticleManager {
  ctx;
  particles;
  brightnessMap;
  constructor(ctx) {
    this.ctx = ctx;
    this.particles = Particle.createParticles(5000, "rain");
    this.brightnessMap = mapToBrightness(ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height));
  }
  update() {
    this.particles.forEach((particle) => particle.update());
  }
  draw() {
    this.particles.forEach((particle) => particle.draw(this.ctx));
  }
}

// src/index.ts
var main = function() {
  particleManager = new ParticleManager(ctx);
  animate();
};
var animate = function() {
  ctx.drawImage(spiderman, 0, 0, canvas.width, canvas.height);
  ctx.globalAlpha = 0.05;
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  particleManager.update();
  particleManager.draw();
  requestAnimationFrame(animate);
};
var canvas = document.querySelector("canvas");
var ctx = canvas.getContext("2d");
canvas.width = spiderman.width;
canvas.height = spiderman.height;
console.log(canvas.width, canvas.height);
var particleManager;
main();
