/**
 * @brief scale the image to fit the canvas
 */
const img = new Image();
img.src = 'images/Top View Render.png';


/**
 * @brief function that runs when the window loads
 */
window.onload = function() {
  // scale the canvas
  const canvas = document.getElementById('fieldCanvas');
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, img.width, img.height, // source rectangle
      0, 0, canvas.width, canvas.height); // destination rectangle
};
