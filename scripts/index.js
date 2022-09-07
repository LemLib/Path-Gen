let lastPoint = new Point(-2, 0);


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

const p5 = new Point(50, 50);
const p6 = new Point(75, 75);
const p7 = new Point(125, 20);
const p8 = new Point(150, 50);
const s = new Spline(p1, p2, p3, p4);
const s2 = new Spline(p5, p6, p7, p8);
const p = new Path();
p.addSpline(s);
p.addSpline(s2);

/**
 * @brief draw the spline
 */
function drawSpline() {
  p.genPoints(10000, 60);
  let message = '';

  // print out spline points coordinates for debug
  for (let i = 0; i < p.points2.length; i++) {
    message = message + ('(' + p.points2[i].x + ', ' + p.points2[i].y + ')\n');
  }
  console.log(message);

  // draw spline
  for (let i = 0; i < p.points2.length - 1; i++) {
    const p1 = coordToPx(p.points2[i]);
    const p2 = coordToPx(p.points2[i+1]);
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
    ctx.closePath();
  }
};
