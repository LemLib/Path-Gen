const path = new Path(); // robot path


// user settings
let lookaheadDistance = 24; // the lookahead distance
let curvatureMultiplier = 1; // how fast the robot moves over sharp curves
let maxSpeed = 62.8318530718; // inches per second
let maxAccel = 1; // inches per second per second
let maxDecel = 1; // inches per second per second
let trackWidth = 17; // robot track width in inches
let precision = 10000; // how many raw points to generate per spline
let inchesPerPoint = 5; // this will be approximated


/**
 * @brief function that runs when the window loads
 */
window.onload = function() {
  // draw image
  ctx.drawImage(img, 0, 0, img.width, img.height, // source rectangle
      0, 0, canvas.width, canvas.height); // destination rectangle

  // add a spline to the path at the start of the path
  const startP1 = new Point(0, 0);
  const startP2 = new Point(20, 45);
  const startP3 = new Point(50, 50);
  const startP4 = new Point(60, 20);
  const startSpline = new Spline(startP1, startP2, startP3, startP4);
  path.addSpline(startSpline);

  // update path length
  path.genPoints(precision, 10);
  // draw the path
  drawSpline();
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
  // get the position of the mouse in field coordinates
  const mousePoint = pxToCoord(getCursorPosition(canvasQuery, e));

  // generate points on the spline
  // first point, same as the last control point of the last spline
  const p1 = path.splines[path.splines.length - 1].p4;
  // second point, same slope as the third control point of the last spline
  // also has the same magnitude as the third control point of the last spline
  // and the last point of the last spline
  const p2CalcVector = new Vector(path.splines[path.splines.length - 1].p3, p1);
  const p2 = p2CalcVector.interpolate(p2CalcVector.getMagnitude()*2);
  // third point, just add 5 to the y coordinate of the mouse point
  const p3 = new Point(mousePoint.x, mousePoint.y + 12);
  // fourth point, same as the mouse point
  const p4 = mousePoint;

  // add the spline to the path
  const spline = new Spline(p1, p2, p3, p4);
  path.addSpline(spline);
  drawSpline();
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
  const finalSpacing = Math.round(path.length / inchesPerPoint);
  path.genPoints(precision, finalSpacing);

  // draw image
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, img.width, img.height, // source rectangle
      0, 0, canvas.width, canvas.height); // destination rectangle

  // draw spline
  for (let i = 0; i < path.points2.length; i++) {
    const p1 = coordToPx(path.points2[i]);
    const radiusSetting = 0.5;
    const radius = radiusSetting * imgPixelsPerInch;
    ctx.beginPath();
    ctx.arc(p1.x, p1.y, radius, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.closePath();
  }
};
