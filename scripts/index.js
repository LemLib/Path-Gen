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


const p1 = new Point(0, 0);
const p2 = new Point(0, 50);
const p3 = new Point(25, 70);
const p4 = new Point(50, 50);
const s = new Spline(p1, p2, p3, p4);

/**
 * @brief draw the spline
 */
function drawSpline() {
  s.generatePoints(3);

  for (let i = 0; i < s.points.length - 1; i++) {
    const startPoint = coordToPx(s.points[i]);
    const endPoint = coordToPx(s.points[i+1]);
    ctx.beginPath();
    ctx.lineWidth = 10;
    ctx.moveTo(startPoint.x, startPoint.y);
    ctx.lineTo(endPoint.x, endPoint.y);
    ctx.stroke();
    ctx.closePath();
  }
};
