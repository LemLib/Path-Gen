let path = new Path(); // robot path
let intervalId;
let debugPath = [];
let debugDataList = [];
let debugDataTime = 0;
let debugSet = false;
let debugRun = false;
const fps = 60;


// program mode
// 0 = create
// 1 = debug
let mode = 0;

// initialize path inputs
let mousePos;
let controlPointHold = false;
let controlPointSpline = 0;
let controlPointNumber = 0;


/**
 * @brief convert an HSl color code to Hex
 * @param {number} h - the hue
 * @param {number} s - the saturation
 * @param {number} l - the lightness
 * @return {string} - the hex color code
 */
function hslToHex(h, s, l) {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};


/**
 * @brief function that gets user input
 */
function getInput() {
  lookahead = lookaheadSlider.value;
  decel = decelSlider.value; // inches/s/s
  maxSpeed = maxSpeedSlider.value;
  precision = precisionSlider.value;
  curvatureMultiplier = (curveMultiplierSlider.value * precision)/100;
  inchesPerPoint = inchesPerPointSlider.value;
  trackWidth = trackWidthSlider.value;
  deactivateDist = deactivateDistSlider.value;

  // update PID constants
  lF = lFSlider.value;
  lA = lASlider.value;
  lJ = lJSlider.value;
  lP = lPSlider.value;
  lI = lISlider.value;
  lD = lDSlider.value;
  lB = lBSlider.value;
  lG = lGSlider.value;

  rF = rFSlider.value;
  rA = rASlider.value;
  rJ = rJSlider.value;
  rP = rPSlider.value;
  rI = rISlider.value;
  rD = rDSlider.value;
  rB = rBSlider.value;
  rG = rGSlider.value;
};


/**
 * @brief render the field
 */
function renderField() {
  // draw field
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // draw the field
  ctx.drawImage(img, 0, 0, img.width, img.height, // source rectangle
      0, 0, canvas.width, canvas.height); // destination rectangle
  // reset line width
  ctx.lineWidth = 1.0;
}


/**
 * @brief function to create a field
 */
function renderCreate() {
  // init
  getInput();
  const finalSpacing = Math.round(path.length / inchesPerPoint);
  path.genPoints(precision, finalSpacing);

  // draw control points
  for (let i = 0; i < path.splines.length; i++) {
    const p1 = coordToPx(path.splines[i].p1);
    const p2 = coordToPx(path.splines[i].p2);
    const p3 = coordToPx(path.splines[i].p3);
    const p4 = coordToPx(path.splines[i].p4);
    ctx.fillStyle = hslToHex(140, 50, 50);
    ctx.strokeStyle = hslToHex(0, 0, 0);
    // draw the lines between the control points
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
    ctx.closePath();
    ctx.beginPath();
    ctx.moveTo(p3.x, p3.y);
    ctx.lineTo(p4.x, p4.y);
    ctx.stroke();
    ctx.closePath();
    // draw the control points
    ctx.beginPath();
    ctx.arc(p1.x, p1.y, controlPointRadius*imgPixelsPerInch, 0, 2*Math.PI);
    ctx.arc(p2.x, p2.y, controlPointRadius*imgPixelsPerInch, 0, 2*Math.PI);
    ctx.fill();
    ctx.closePath();
    ctx.beginPath();
    ctx.arc(p3.x, p3.y, controlPointRadius*imgPixelsPerInch, 0, 2*Math.PI);
    ctx.arc(p4.x, p4.y, controlPointRadius*imgPixelsPerInch, 0, 2*Math.PI);
    ctx.fill();
    ctx.closePath();
  }

  // draw spline
  for (let i = 0; i < path.points2.length; i++) {
    const p1 = coordToPx(path.points2[i]);
    // draw the points
    const radiusSetting = 0.5;
    const radius = radiusSetting * imgPixelsPerInch;
    ctx.fillStyle = hslToHex((path.points2[i].velocity/maxSpeed)*180,
        100, 50);
    ctx.strokeStyle = ctx.fillStyle;
    ctx.beginPath();
    ctx.arc(p1.x, p1.y, radius, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fill();
    ctx.closePath();
    // draw the lines
    if (i < path.points2.length - 1) {
      const p2 = coordToPx(path.points2[i + 1]);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
      ctx.closePath();
    }
  }
};


/**
 * @brief render for debug mode
 */
function renderDebug() {
  // get debug data time
  debugTimeSlider.max = debugDataList.length-1;
  const debugTime = debugTimeSlider.value;

  // render the path
  for (let i = 0; i < debugPath.length; i++) {
    const p1 = coordToPx(debugPath[i]);
    // draw the points
    const radiusSetting = 0.5;
    const radius = radiusSetting * imgPixelsPerInch;
    ctx.fillStyle = hslToHex((debugPath[i].velocity/maxSpeed)*180,
        100, 50);
    ctx.strokeStyle = ctx.fillStyle;
    ctx.beginPath();
    ctx.arc(p1.x, p1.y, radius, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fill();
    ctx.closePath();
    // draw the lines
    if (i < debugPath.length - 1) {
      const p2 = coordToPx(debugPath[i + 1]);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
      ctx.closePath();
    }
  }

  // draw the robot at the current time stamp
  // get robot position
  const robotPos = new Point();
  let robotPosPx = new Point();
  const heading = Math.PI/2 - degToRad(debugDataList[debugDataTime].heading);
  robotPos.x = debugDataList[debugDataTime].x;
  robotPos.y = debugDataList[debugDataTime].y;
  robotPosPx = coordToPx(robotPos);
  // draw the robot center
  ctx.beginPath();
  ctx.fillStyle = hslToHex(0, 0, 0);
  ctx.strokeStyle = hslToHex(0, 0, 0);
  ctx.arc(robotPosPx.x, robotPosPx.y, 2*imgPixelsPerInch, 0, 2 * Math.PI);
  ctx.fill();
  ctx.closePath();
  // draw the robot track width
  ctx.beginPath();
  ctx.arc(robotPosPx.x, robotPosPx.y, 9*imgPixelsPerInch, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.closePath();
  // draw the robot's heading
  const headingVec = new Point();
  headingVec.x = robotPos.x + 5*Math.cos(heading);
  headingVec.y = robotPos.y + 5*Math.sin(heading);
  const headingVecPx = coordToPx(headingVec);
  ctx.strokeStyle = hslToHex(184, 100, 63);
  ctx.beginPath();
  ctx.lineWidth = 0.5*imgPixelsPerInch;
  ctx.moveTo(robotPosPx.x, robotPosPx.y);
  ctx.lineTo(headingVecPx.x, headingVecPx.y);
  ctx.stroke();
  ctx.closePath();

  // draw the lookahead point
  ctx.beginPath();
  ctx.fillStyle = hslToHex(0, 0, 0);
  ctx.strokeStyle = hslToHex(0, 0, 0);
  const lookaheadRaw = new Point(debugDataList[debugDataTime].lookaheadX,
      debugDataList[debugDataTime].lookaheadY);
  const lookaheadPx = coordToPx(lookaheadRaw);
  ctx.arc(lookaheadPx.x, lookaheadPx.y, 2*imgPixelsPerInch, 0, 2*Math.PI);
  ctx.fill();
  ctx.closePath();

  // draw the curvature arc
  ctx.beginPath();
  ctx.strokeStyle = 'red';
  // calculate the circle
  const radius = 1/(debugDataList[debugDataTime].curvature);
  const theta = degToRad(debugDataList[debugDataTime].heading);
  const midX = debugDataList[debugDataTime].x +
      radius*Math.cos(theta);
  const midY = -(debugDataList[debugDataTime].y) -
      radius*Math.sin(theta);
  const trueRadius = Math.abs(radius);
  const mid = new Point(midX, midY);
  const midPx = coordToPx(mid);
  // draw the arc
  ctx.arc(midPx.x, midPx.y, trueRadius*imgPixelsPerInch, 0, 2*Math.PI);
  ctx.stroke();
  ctx.closePath();

  // update the time
  if (debugDataTime < debugDataList.length - 1) {
    debugDataTime++;
  } else {
    debugRun = false;
    clearInterval(intervalId);
  }
  debugTimeSlider.value = debugDataTime;
};


/**
 * @brief draw the spline
 */
function render() {
  // render the field
  renderField();

  // create mode render
  if (mode == 0) {
    renderCreate();
  } else if (debugSet) {
    renderDebug();
  }
};
