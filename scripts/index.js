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


let sPoints = [];// array of spline points
let s; // spline added to path
let path = new Path(); // robot path

/**
 * @brief when the canvas is left clicked
 * @param {Event} e - the event
 */
canvasQuery.onclick = function(e) {
  sPoints.push(pxToCoord(getCursorPosition(canvasQuery, e)));
  if (sPoints.length == 4) {
    s = new Spline(sPoints[0], sPoints[1], sPoints[2], sPoints[3]);
    path.addSpline(s);
    sPoints = [];
    drawSpline();
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


/**
 * @brief draw the spline
 */
function drawSpline() {
  path.genPoints(10000, (60)*path.splines.length);
  let message = '';

  // print out spline points coordinates for debug
  /**
  for (let i = 0; i < path.points2.length; i++) {
    message = message + ('(' + path.points2[i].x + ', ' + path.points2[i].y + ')\n');
  }
  console.log(message);
  */

  // draw image
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, img.width, img.height, // source rectangle
      0, 0, canvas.width, canvas.height); // destination rectangle

  // draw spline
  for (let i = 0; i < path.points2.length - 1; i++) {
    const p1 = coordToPx(path.points2[i]);
    const p2 = coordToPx(path.points2[i+1]);
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
    ctx.closePath();
  }
};
