const path = new Path(); // robot path


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
};


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
}


// initialize path inputs
let mousePos;
let controlPointHold = false;
let controlPointSpline = 0;
let controlPointNumber = 0;

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

canvasQuery.onmousedown = function(event) {
  if (event.button == 0) {
    for (let i = 0; i < path.splines.length; i++) {
      // p1
      const p1 = path.splines[i].p1;
      const v1 = new Vector(p1, mousePos);
      if (v1.getMagnitude() < controlPointRadius*2) {
        controlPointHold = true;
        controlPointSpline = i;
        controlPointNumber = 1;
        break;
      }
      // p2
      const p2 = path.splines[i].p2;
      const v2 = new Vector(p2, mousePos);
      if (v2.getMagnitude() < controlPointRadius*2) {
        controlPointHold = true;
        controlPointSpline = i;
        controlPointNumber = 2;
        break;
      }
      // p3
      const p3 = path.splines[i].p3;
      const v3 = new Vector(p3, mousePos);
      if (v3.getMagnitude() < controlPointRadius*2) {
        controlPointHold = true;
        controlPointSpline = i;
        controlPointNumber = 3;
        break;
      }
      // p4
      const p4 = path.splines[i].p4;
      const v4 = new Vector(p4, mousePos);
      if (v4.getMagnitude() < controlPointRadius*2) {
        controlPointHold = true;
        controlPointSpline = i;
        controlPointNumber = 4;
        break;
      }
    }

    // default behavior
    if (!controlPointHold) {
      // generate points on the spline
      const p1 = path.splines[path.splines.length - 1].p4;
      const p2V = new Vector(path.splines[path.splines.length - 1].p3, p1);
      const p2 = p2V.interpolate(p2V.getMagnitude()*2);
      // third point, just add 5 to the y coordinate of the mouse point
      const p3 = new Point(mousePos.x, mousePos.y + 12);
      // fourth point, same as the mouse point
      const p4 = mousePos;

      // add the spline to the path
      const spline = new Spline(p1, p2, p3, p4);
      path.addSpline(spline);
    }
  } else if (event.button == 2) {
    const v1 = new Vector(path.splines[0].p1, mousePos);
    const v4 = new Vector(path.splines[path.splines.length-1].p4, mousePos);
    if (v4.getMagnitude() < controlPointRadius*2 && path.splines.length > 1) {
      // remove the last spline
      path.splines.pop();
    }
    if (v1.getMagnitude() < controlPointRadius*2 && path.splines.length > 1) {
      // remove the first spline
      path.splines.shift();
    }
  }
};

canvasQuery.onmouseup = function(event) {
  controlPointHold = false;
};

canvasQuery.onmousemove = function(event) {
  mousePos = pxToCoord(getCursorPosition(canvasQuery, event));
  if (controlPointHold) {
    switch (controlPointNumber) {
      case 1:
        if (controlPointSpline == 0) {
          path.splines[controlPointSpline].p1 = mousePos;
        } else {
          path.splines[controlPointSpline].p1 = mousePos;
          path.splines[controlPointSpline-1].p4 = mousePos;
        }
        break;
      case 2:
        if (controlPointSpline == 0) {
          path.splines[controlPointSpline].p2 = mousePos;
        } else {
          const p1 = path.splines[controlPointSpline].p1;
          const v = new Vector(p1, mousePos);
          const p3 = v.interpolate(-v.getMagnitude());
          path.splines[controlPointSpline-1].p3 = p3;
          path.splines[controlPointSpline].p2 = mousePos;
        }
        break;
      case 3:
        if (controlPointSpline == path.splines.length-1) {
          path.splines[controlPointSpline].p3 = mousePos;
        } else {
          const p4 = path.splines[controlPointSpline].p4;
          const v = new Vector(p4, mousePos);
          const p2 = v.interpolate(-v.getMagnitude());
          path.splines[controlPointSpline+1].p2 = p2;
          path.splines[controlPointSpline].p3 = mousePos;
        }
        break;
      case 4:
        if (controlPointSpline == path.splines.length - 1) {
          path.splines[controlPointSpline].p4 = mousePos;
        } else {
          path.splines[controlPointSpline].p4 = mousePos;
          path.splines[controlPointSpline+1].p1 = mousePos;
        }
        break;
    }
  }
};

document.addEventListener('contextmenu', function(e) {
  e.preventDefault();
});


/**
 * @brief function that gets user input
 */
function getInput() {
  lookahead = lookaheadSlider.value;
  decel - decelSlider.value; // inches/s/s
  maxSpeed = maxSpeedSlider.value;
  precision = precisionSlider.value;
  curvatureMultiplier = (curveMultiplierSlider.value * precision)/100;
  inchesPerPoint = inchesPerPointSlider.value;
  trackWidth = trackWidthSlider.value;
  deactivateDist = deactivateDistSlider.value;

  // update PID constants
  lF = lFSlider.value;
  lA = lASlider.value;
  lP = lPSlider.value;
  lI = lISlider.value;
  lD = lDSlider.value;
  lB = lBSlider.value;
  lG = lGSlider.value;

  rF = rFSlider.value;
  rA = rASlider.value;
  rP = rPSlider.value;
  rI = rISlider.value;
  rD = rDSlider.value;
  rB = rBSlider.value;
  rG = rGSlider.value;
};

/**
 * @brief draw the spline
 */
function drawSpline() {
  // init
  getInput();
  const finalSpacing = Math.round(path.length / inchesPerPoint);
  path.genPoints(precision, finalSpacing);

  // draw image
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, img.width, img.height, // source rectangle
      0, 0, canvas.width, canvas.height); // destination rectangle

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
    ctx.fillStyle = hslToHex((path.points2[i].velocity/maxSpeed)*180, 100, 50);
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


// draw path every x seconds
setInterval(drawSpline, 1000/60);
/**
 * @brief log the path for use in the robot
 */
downloadBtn.onclick = function() {
  // mega string
  let out = '';

  // log constants
  out += lookahead + '\n';
  out += trackWidth + '\n';
  out += deactivateDist + '\n';

  out += lF + '\n';
  out += lA + '\n';
  out += lP + '\n';
  out += lI + '\n';
  out += lD + '\n';
  out += lB + '\n';
  out += lG + '\n';

  out += rF + '\n';
  out += rA + '\n';
  out += rP + '\n';
  out += rI + '\n';
  out += rD + '\n';
  out += rB + '\n';
  out += rG + '\n';

  // log path points
  for (let i = 0; i < path.points2.length; i++) {
    const x = path.points2[i].x;
    const y = path.points2[i].y;
    const velocity = path.points2[i].velocity;
    out += x + ', ' + y + ', ' + velocity + '\n';
  }

  const blob = new Blob([out], {type: 'text/csv'});
  if (window.navigator.msSaveOrOpenBlob) {
    window.navigator.msSaveBlob(out, 'path.txt');
  } else {
    const elem = window.document.createElement('a');
    elem.href = window.URL.createObjectURL(blob);
    elem.download = 'path.txt';
    document.body.appendChild(elem);
    elem.click();
    document.body.removeChild(elem);
  }
};
