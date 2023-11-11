# what I learned

## SOLID principles

### S - Single Responsibility Principle

The SRP states that **each class should have only one responsibility**.

This is how this principle would apply to React:

- Anytime you are mapping over and rendering items in a list using `map()`, consider moving out each list item into its own component.
- Anytime you are using a `useEffect()` hook, consider moving that logic into its own custom hook.

### O - Open/Closed Principle

The OCP states that **classes should be open for extension, but closed for modification**.

You should only ever add functionality to a class during runtime rather than modifying the class itself, because other code may rely on that class.

### L - Liskov Substitution Principle

The LSP states that **subclasses should be substitutable for their base classes**.

Every child class must be able to do everything its parent class can.

This is how this principle would apply to React:

- WHen you are making a custom component that builds upon a base HTML element like an `<input>`, make sure to accept all props tha an HTML input element takes in as well.

### I - Interface Segregation Principle

The ISP states that **many client-specific interfaces are better than one general-purpose interface**. Clients should not depend on interfaces they don't use.

Only implement or inherit from a class if you use **all** of its properties and methods. This helps in preventing bugs.

:::tip
It's better to have many small interfaces than one large interface.
:::

This is how this principle would apply to React:

- Components should not depend on props they are not going to use.

### D - Dependency Inversion Principle

The DIP states that **entities must depend on abstractions, not on concretions**. It's better to depend on and extend from interfaces and abstract classes rather than inherit from a concrete class.

## Getting image data

```javascript
ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
```

THe `ctx.getImageData()` method returns an `ImageData` instance, and on the `ImageData.data` property, you get a byte array of the rgba color values for each pixel in the image.

Every 4 consecutive elements in the array refers to the rgba values, respectively, of a single pixel in the image.

These are the properties returned by the `ImageData` instance:

- `imageData.width` - the width of the image in pixels
- `imageData.height` - the height of the image in pixels
- `imageData.data` - a byte array of the rgba values for each pixel in the image

This is a standard way of looping through the image data byte array and accessing/manipulating those rgba values:

```javascript
for (let i = 0; i < imageData.data.length; i += 4) {
  const red = imageData.data[i];
  const green = imageData.data[i + 1];
  const blue = imageData.data[i + 2];
  const alpha = imageData.data[i + 3];
}
```

After manipulating the image data, you can modify how the image is drawn on canvas by using the `ctx.putImageData(ImageData, x, y)` method, which just takes in an image data instance.

```javascript
ctx.putImageData(ImageData, x, y);
```

```javascript
ctx.putImageData(imageData, 0, 0);
```

## Gray Scale effect

A grayscale effect involves taking adding all the rgb values for a single pixel, and then dividing by three, getting the average color. You then set that average for all three components to make the pixel gray, but varying in intensity.

```javascript
function grayscale() {
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  // 1. get image data
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
```

## Particle and mouse repelling

We want to make an effect where wherever we move our mouse, the particles will move away from it as if gravity were repelling them. Then they go back to their original position after the mouse moves away.

- There will be a **radius** value that determines how far away the particles should be from the mouse at all times.
- We use lerping technique to move particles smoothly out of the radius distance, instead of a jerking animation.

### Mouse coordinates

A global `mouse` object will let us keep track of the mous x and y coordinates, as well as define a constant radius of the repelling force.

```typescript
export const mouse: {
  x: number | null;
  y: number | null;
  radius: number;
} = {
  x: null,
  y: null,
  radius: 50,
};

window.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});
```

You can think of the radius as a forcefield against the particles, repelling them away from the mouse.

### Basic particle

Here are the specific properties we'll add to the particle so that we can make the repelling effect:

- `baseX` and `baseY` - the original x and y coordinates of the particle, so that we can move them back to their position after they are being repelled. We need these since we're going to be changing the actual `x` and `y` properties of the particle.
- `density` - a random number between 1 and 30 that determines how fast the particle will move away from the mouse. The higher the number, the faster it moves.

```typescript
export default class TextParticle implements ParticleRenderable {
  size: number = 3;
  private baseX: number;
  private baseY: number;
  private density: number = Math.random() * 30 + 1;
  constructor(public x: number, public y: number) {
    this.baseX = x;
    this.baseY = y;
  }
}
```

### Effect

Here are the steps to follow to repel a particle from the mous

1. Get the distance between the mouse and the individual particle using the distance formula.

   ```typescript
   const dx = mouse.x - this.x;
   const dy = mouse.y - this.y;
   const distance = Math.sqrt(dx * dx + dy * dy);
   ```

2. Create "force" variables that mimic gravitational force and determine how fast a particle moves away. The closer the particle is to the mouse, the greater the force.

   ```typescript
   const forceDirectionX = dx / distance;
   const forceDirectionY = dy / distance;

   let force = (mouse.radius - distance) / mouse.radius;
   ```

3. If the particle is within the radius, move it away from the mouse.

   ```typescript
   if (distance < mouse.radius) {
     // calculate by how much to move the particle away from the mouse: velocities
     const directionX = forceDirectionX * force * this.density;
     const directionY = forceDirectionY * force * this.density;
     // move particles away from mouse, but stop moving at distance away from mouse radius
     this.x -= directionX;
     this.y -= directionY;
   }
   ```

4. If the particle is outside the radius, move it back to its original position, but not immediately. Instead calculate the distance between the particle's current position and its original position, and only move a portion of that distance. Each frame, that distance will get smaller and smaller, but in a smooth way called **lerping**.

   ```typescript
   else {
      if (Math.floor(this.x) !== Math.floor(this.baseX)) {
        // each frame move 1/10th of the distance between particle's current x and original x
        const dx = this.x - this.baseX;
        this.x -= dx / 10;
      }
        // each frame move 1/10th of the distance between particle's current y and original y
      if (Math.floor(this.y) !== Math.floor(this.baseY)) {
        const dy = this.y - this.baseY;
        this.y -= dy / 10;
      }
   }
   ```

```typescript
class TextParticle {
  // .. other methods and properties
  update(): void {
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
      if (Math.floor(this.x) !== Math.floor(this.baseX)) {
        const dx = this.x - this.baseX;
        this.x -= dx / 10;
      }
      if (Math.floor(this.y) !== Math.floor(this.baseY)) {
        const dy = this.y - this.baseY;
        this.y -= dy / 10;
      }
    }
  }
}
```

### Lerping utility

I made a lerping utility function that will live on the number prototype, and it does what we did in the previous example. Here is how it looks:

```typescript
// specify the number to you want to lerp to, and how much you're dividing the distance by
Number.prototype.lerpTo = function (end: number, lerpFactor: number) {
  if (Math.floor(this.valueOf()) === Math.floor(end)) return this.valueOf();

  let distance = this.valueOf() - end;
  return this.valueOf() - distance / lerpFactor;
};
```

## Shaping particles from text

The `ctx.getImageData()` doesn't work on only just images. It works on any part of the canvas you specify, and just gets back the pixel color values rendered on the canvas from the area you specify.

So what we can do is render some text on the canvas, and then get the pixel color values of the area that includes that text, and then use those values to create particles by checking for pixels with a high opacity or color value.

Here are the basic steps:

1. Render text on the canvas
2. Get the image data of the area that includes the text
3. Loop through each pixel, and create a particle at that coordinate if the pixel has an alpha value greater than 128.

The method below renders text on canvas, and then returns the imageData of the area that contains the text.

```typescript
class TextParticleManager {
  private createText(text: string, width: number) {
    this.ctx.font = "30px Arial";
    this.ctx.fillText(text, 0, 30, width);
    const imageData = this.ctx.getImageData(
      0,
      0,
      Math.max(100, width),
      Math.max(100, width)
    );
    return imageData;
  }
}
```

We can then create a function that takes in the image data and just for convenience returns a 2D representation of the canvas image data with the color values:

```typescript
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
```

Then we can use this function to create particles from the text:

```typescript
class TextParticleManager {
  // .. other methods and properties
  createParticlesFromText() {
    // 1. render text and get image data
    const imageData = this.createText("A", 100);
    // 2. get 2D representation of image data
    const { pixels, width, height } = imageDataToPixels(imageData);
    // 3. loop through each pixel and create a particle if the pixel has an alpha value greater than 128
    for (let row = 0; row < height; row++) {
      for (let col = 0; col < width; col++) {
        const pixel = pixels[row][col];
        // if pixel has an alpha value greater than 128, we know it's of text
        if (pixel.a > 128) {
          // code to move and translate particle
          const adjustX = 10;
          const adjustY = 10;
          this.particles.push(
            new TextParticle((col + adjustX) * 10, (row + adjustY) * 10)
          );
        }
      }
    }
  }
}
```

### Constellation effect

The constellation effect is simple. If the distance between two given particles is less than a certain number, say 50, then draw a line between them.

We can also vary the opacity of the line depending on the distance between the particles. The closer they are, the more opaque, and the further they are, the more transparent.

```typescript
class TextParticle {
  public static drawLines(
    particle1: TextParticle,
    particle2: TextParticle,
    ctx: CanvasRenderingContext2D
  ) {
    // in one line, get opacity and ensure that we only draw line when distance is less than 50
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
}
```

Then the last thing we have to do is loop through all the particles in a nested for loop and draw lines between them:

```typescript
class TextParticleManager {
  private constellationEffect() {
    // for loop, but more efficient since we're not looping through the same particles twice
    for (let a = 0; a < this.particles.length; a++) {
      for (let b = a + 1; b < this.particles.length; b++) {
        // draw lines between particles
        TextParticle.drawLines(this.particles[a], this.particles[b], this.ctx);
      }
    }
  }
}
```
