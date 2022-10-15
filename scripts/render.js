let path = new Path(); // robot path
let intervalId;
let debugPath = [];
let debugDataList = [];
let debugDataTime = 0;
let debugData = 0;
let debugSet = false;
let debugRun = false;
const fps = 60;


/**
 * @brief is a variable positive or negative
 * @param {number} x - the variable to check
 * @return {number} - 1 if positive, -1 if negative
 */
function sgn(x) {
  return x > 0 ? 1 : x < 0 ? -1 : 0;
}


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
  // set slider max
  debugTimeSlider.max = debugDataList.length-1;

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
  let heading = Math.PI/2 - degToRad(debugDataList[debugDataTime].heading);
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
  ctx.arc(robotPosPx.x, robotPosPx.y, debugData.trackWidth*imgPixelsPerInch/2,
      0, 2 * Math.PI);
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
  heading = degToRad(debugDataList[debugDataTime].heading);
  ctx.beginPath();
  ctx.strokeStyle = 'red';
  // calculate the circle
  if (Math.abs(debugDataList[debugDataTime].curvature) < 0.005) {
    debugDataList[debugDataTime].curvature = 0.005; // * sgn(curvature);
  }
  const radius = 1/(debugDataList[debugDataTime].curvature);
  const trueRadius = Math.abs(radius);
  const x3 = (robotPos.x + lookaheadRaw.x) / 2;
  const y3 = (robotPos.y + lookaheadRaw.y) / 2;
  const q = Math.sqrt(Math.pow(robotPos.x - lookaheadRaw.x, 2) +
      Math.pow(robotPos.y - lookaheadRaw.y, 2));
  const b = Math.sqrt(Math.pow(radius, 2) - Math.pow(q / 2, 2));

  const x = x3 - b * (robotPos.y - lookaheadRaw.y) / q *
      sgn(Math.abs(debugDataList[debugDataTime].curvature));
  const y = y3 - b * (lookaheadRaw.x - robotPos.x) / q *
      sgn(Math.abs(debugDataList[debugDataTime].curvature));

  const mid = new Point(x, y);
  const midPx = coordToPx(mid);
  // draw the arc
  ctx.arc(midPx.x, midPx.y, trueRadius*imgPixelsPerInch, 0, 2*Math.PI);
  ctx.stroke();
  ctx.closePath();

  // x = robot.x + radius*cos(heading - pi/2)
  // y = robot.y + radius*sin(heading - pi/2)
  // radius = 1/curvature
  // start angle = 0
  // end angle = 2*pi

  // update the time
  if (debugDataTime >= debugDataList.length - 1) {
    debugRun = false;
    clearInterval(intervalId);
  }
};


/**
 * @brief render the motor velocities
 */
function renderGraphs() {
  // get left motor canvas width and length
  const width = 300;
  const height = 150;

  // reset left motor canvas
  leftMotorCtx.beginPath();
  leftMotorCtx.fillStyle = hslToHex(0, 0, 60);
  leftMotorCtx.fillRect(0, 0, width, height);
  leftMotorCtx.fill();
  leftMotorCtx.font = '15px Arial';
  leftMotorCtx.fillStyle = 'red';
  leftMotorCtx.textAlign = 'center';
  leftMotorCtx.fillText('Left Motor', 150, 12);
  leftMotorCtx.fillStyle = 'red';
  leftMotorCtx.fillRect(60, 135, 10, 10);
  leftMotorCtx.fillStyle = 'black';
  leftMotorCtx.font = '10px Arial';
  leftMotorCtx.fillText('Actual Velocity', 105, 143);
  leftMotorCtx.fill();
  leftMotorCtx.fillStyle = 'blue';
  leftMotorCtx.fillRect(175, 135, 10, 10);
  leftMotorCtx.fillStyle = 'black';
  leftMotorCtx.font = '10px Arial';
  leftMotorCtx.fillText('Target Velocity', 220, 143);
  leftMotorCtx.fill();
  leftMotorCtx.closePath();

  // draw the left motor graph axis
  leftMotorCtx.beginPath();
  leftMotorCtx.strokeStyle = hslToHex(0, 0, 0);
  leftMotorCtx.lineWidth = 1;
  // bottom line
  leftMotorCtx.moveTo(20, height-20);
  leftMotorCtx.lineTo(width-20, height-20);
  // middle line
  leftMotorCtx.moveTo(20, height/2);
  leftMotorCtx.lineTo(width-20, height/2);
  // top line
  leftMotorCtx.moveTo(20, 20);
  leftMotorCtx.lineTo(width-20, 20);
  // left vertical line
  leftMotorCtx.moveTo(20, 20);
  leftMotorCtx.lineTo(20, height-20);
  // right vertical line
  leftMotorCtx.moveTo(width-20, 20);
  leftMotorCtx.lineTo(width-20, height-20);
  // draw the left motor graph labels
  leftMotorCtx.font = '15px Arial';
  leftMotorCtx.fillStyle = 'red';
  leftMotorCtx.textAlign = 'center';
  leftMotorCtx.fillText(-debugData.maxVel, 15, 145); // origin
  leftMotorCtx.fillText('0', 10, 80); // middle
  leftMotorCtx.fillText(debugData.maxVel, 15, 13); // top
  // close the path
  leftMotorCtx.stroke();
  leftMotorCtx.closePath();

  // draw the left motor actual velocity graph
  leftMotorCtx.strokeStyle = 'red';
  for (let i = 0; i <= debugDataTime; i++) {
    if (i > 0) {
      leftMotorCtx.beginPath();
      x0 = 20 + ((i-1)/(debugDataList.length-1))*260;
      y0 = 75 - (debugDataList[i-1].leftVel/debugData.maxVel)*55;
      const x1 = 20 + (i/(debugDataList.length-1))*260;
      const y1 = 75 - (debugDataList[i].leftVel/debugData.maxVel)*55;
      leftMotorCtx.moveTo(x0, y0);
      leftMotorCtx.lineTo(x1, y1);
      // draw the line
      leftMotorCtx.stroke();
      leftMotorCtx.closePath();
    }
  }

  // draw the left motor target velocity graph
  leftMotorCtx.strokeStyle = 'blue';
  for (let i = 0; i <= debugDataTime; i++) {
    if (i > 0) {
      leftMotorCtx.beginPath();
      x0 = 20 + ((i-1)/(debugDataList.length-1))*260;
      y0 = 75 - (debugDataList[i-1].leftTargetVel/debugData.maxVel)*55;
      const x1 = 20 + (i/(debugDataList.length-1))*260;
      const y1 = 75 - (debugDataList[i].leftTargetVel/debugData.maxVel)*55;
      leftMotorCtx.moveTo(x0, y0);
      leftMotorCtx.lineTo(x1, y1);
      // draw the line
      leftMotorCtx.stroke();
      leftMotorCtx.closePath();
    }
  }

  // reset right motor canvas
  rightMotorCtx.beginPath();
  rightMotorCtx.fillStyle = hslToHex(0, 0, 60);
  rightMotorCtx.fillRect(0, 0, width, height);
  leftMotorCtx.font = '15px Arial';
  rightMotorCtx.fillStyle = 'red';
  rightMotorCtx.textAlign = 'center';
  rightMotorCtx.fillText('Right Motor', 150, 12);
  rightMotorCtx.fillStyle = 'red';
  rightMotorCtx.fillRect(60, 135, 10, 10);
  rightMotorCtx.fillStyle = 'black';
  rightMotorCtx.font = '10px Arial';
  rightMotorCtx.fillText('Actual Velocity', 105, 143);
  rightMotorCtx.fill();
  rightMotorCtx.fillStyle = 'blue';
  rightMotorCtx.fillRect(175, 135, 10, 10);
  rightMotorCtx.fillStyle = 'black';
  rightMotorCtx.font = '10px Arial';
  rightMotorCtx.fillText('Target Velocity', 220, 143);
  rightMotorCtx.fill();
  rightMotorCtx.closePath();
  rightMotorCtx.fill();

  // draw the right motor graph axis
  rightMotorCtx.beginPath();
  rightMotorCtx.strokeStyle = hslToHex(0, 0, 0);
  rightMotorCtx.lineWidth = 1;
  // bottom line
  rightMotorCtx.moveTo(20, height-20);
  rightMotorCtx.lineTo(width-20, height-20);
  // middle line
  rightMotorCtx.moveTo(20, height/2);
  rightMotorCtx.lineTo(width-20, height/2);
  // top line
  rightMotorCtx.moveTo(20, 20);
  rightMotorCtx.lineTo(width-20, 20);
  // left vertical line
  rightMotorCtx.moveTo(20, 20);
  rightMotorCtx.lineTo(20, height-20);
  // right vertical line
  rightMotorCtx.moveTo(width-20, 20);
  rightMotorCtx.lineTo(width-20, height-20);
  // draw the right motor graph labels
  rightMotorCtx.font = '15px Arial';
  rightMotorCtx.fillStyle = 'red';
  rightMotorCtx.textAlign = 'center';
  rightMotorCtx.fillText(-debugData.maxVel, 15, 145); // origin
  rightMotorCtx.fillText('0', 10, 80); // middle
  rightMotorCtx.fillText(debugData.maxVel, 15, 13); // top
  // close the path
  rightMotorCtx.stroke();
  rightMotorCtx.closePath();

  // draw the right motor actual velocity graph
  rightMotorCtx.strokeStyle = 'red';
  for (let i = 0; i <= debugDataTime; i++) {
    rightMotorCtx.beginPath();
    // get the x and y coordinates
    let x0 = 20;
    let y0 = 75;
    if (i > 0) {
      x0 = 20 + ((i-1)/(debugDataList.length-1))*260;
      y0 = 75 - (debugDataList[i-1].rightVel/debugData.maxVel)*55;
    }
    const x1 = 20 + (i/(debugDataList.length-1))*260;
    const y1 = 75 - (debugDataList[i].rightVel/debugData.maxVel)*55;
    rightMotorCtx.moveTo(x0, y0);
    rightMotorCtx.lineTo(x1, y1);
    // draw the line
    rightMotorCtx.stroke();
    rightMotorCtx.closePath();
  }

  // draw the right motor target velocity graph
  rightMotorCtx.strokeStyle = 'blue';
  for (let i = 0; i <= debugDataTime; i++) {
    rightMotorCtx.beginPath();
    // get the x and y coordinates
    let x0 = 20;
    let y0 = 75;
    if (i > 0) {
      x0 = 20 + ((i-1)/(debugDataList.length-1))*260;
      y0 = 75 - (debugDataList[i-1].rightTargetVel/debugData.maxVel)*55;
    }
    const x1 = 20 + (i/(debugDataList.length-1))*260;
    const y1 = 75 - (debugDataList[i].rightTargetVel/debugData.maxVel)*55;
    rightMotorCtx.moveTo(x0, y0);
    rightMotorCtx.lineTo(x1, y1);
    // draw the line
    rightMotorCtx.stroke();
    rightMotorCtx.closePath();
  }
}


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
    renderGraphs();
    renderDebug();
    debugDataTime++;
    debugTimeSlider.value = debugDataTime;
  }
};
