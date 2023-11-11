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
