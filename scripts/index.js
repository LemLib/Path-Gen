let lastPoint = new Point(-2, 0);


// array containing all the waypoints on the canvas
let waypoints = [];
// array containing all the path segments
let pathSegments = [];


/**
 * @brief function that runs when the window loads
 */
window.onload = function() {
  // draw image
  ctx.drawImage(img, 0, 0, img.width, img.height, // source rectangle
      0, 0, canvas.width, canvas.height); // destination rectangle
};


/**
 * @brief function that returns the position of the mouse
 * @param {Event} canvas - the canvas
 * @param {Event} event - the event that is triggered (mouse click)
 * @return {Point} - the position of the mouse
 */
function getCursorPosition(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  const mousePoint = new Point(event.clientX - rect.left,
      event.clientY - rect.top);
  return mousePoint;
};


/**
 * @brief when the canvas is left clicked
 * @param {Event} e - the event
 */
canvasQuery.onclick = function(e) {
  if (lastPoint.x == -2) {
    lastPoint = getCursorPosition(canvasQuery, e);
  } else {
    const mousePoint = getCursorPosition(canvasQuery, e);
    ctx.beginPath();
    ctx.moveTo(lastPoint.x, lastPoint.y);
    ctx.lineTo(mousePoint.x, mousePoint.y);
    ctx.stroke();
    lastPoint = mousePoint;
    console.log(pxToCoord(lastPoint));
  }
};


/**
 * @brief when the canvas is right clicked
 * @param {Event} e - the event
 */
canvasQuery.oncontextmenu = function(e) {
  e.preventDefault();
  console.log(getCursorPosition(canvasQuery, e));
};
