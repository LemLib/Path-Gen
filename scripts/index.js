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
  // draw the path
  drawSpline();
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
let mousePosition;
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
      const v1 = new Vector(p1, mousePosition);
      if (v1.getMagnitude() < controlPointRadius*2) {
        controlPointHold = true;
        controlPointSpline = i;
        controlPointNumber = 1;
        break;
      }
      // p2
      const p2 = path.splines[i].p2;
      const v2 = new Vector(p2, mousePosition);
      if (v2.getMagnitude() < controlPointRadius*2) {
        controlPointHold = true;
        controlPointSpline = i;
        controlPointNumber = 2;
        break;
      }
      // p3
      const p3 = path.splines[i].p3;
      const v3 = new Vector(p3, mousePosition);
      if (v3.getMagnitude() < controlPointRadius*2) {
        controlPointHold = true;
        controlPointSpline = i;
        controlPointNumber = 3;
        break;
      }
      // p4
      const p4 = path.splines[i].p4;
      const v4 = new Vector(p4, mousePosition);
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
      const p3 = new Point(mousePosition.x, mousePosition.y + 12);
      // fourth point, same as the mouse point
      const p4 = mousePosition;

      // add the spline to the path
      const spline = new Spline(p1, p2, p3, p4);
      path.addSpline(spline);
      drawSpline();
    }
  } else if (event.button == 2) {
    const v = new Vector(path.splines[path.splines.length-1].p4, mousePosition);
    if (v.getMagnitude() < controlPointRadius*2 && path.splines.length > 1) {
      // remove the last spline
      path.splines.pop();
      path.genPoints(10000, 1);
      drawSpline();
    }
  }
};

canvasQuery.onmouseup = function(event) {
  controlPointHold = false;
};

canvasQuery.onmousemove = function(event) {
  mousePosition = pxToCoord(getCursorPosition(canvasQuery, event));
  if (controlPointHold) {
    switch (controlPointNumber) {
      case 1:
        if (controlPointSpline == 0) {
          path.splines[controlPointSpline].p1 = mousePosition;
        } else {
          path.splines[controlPointSpline].p1 = mousePosition;
          path.splines[controlPointSpline-1].p4 = mousePosition;
        }
        break;
      case 2:
        if (controlPointSpline == 0) {
          path.splines[controlPointSpline].p2 = mousePosition;
        } else {
          const p1 = path.splines[controlPointSpline].p1;
          const v = new Vector(p1, mousePosition);
          const p3 = v.interpolate(-v.getMagnitude());
          path.splines[controlPointSpline-1].p3 = p3;
          path.splines[controlPointSpline].p2 = mousePosition;
        }
        break;
      case 3:
        if (controlPointSpline == path.splines.length-1) {
          path.splines[controlPointSpline].p3 = mousePosition;
        } else {
          const p4 = path.splines[controlPointSpline].p4;
          const v = new Vector(p4, mousePosition);
          const p2 = v.interpolate(-v.getMagnitude());
          path.splines[controlPointSpline+1].p2 = p2;
          path.splines[controlPointSpline].p3 = mousePosition;
        }
        break;
      case 4:
        if (controlPointSpline == path.splines.length - 1) {
          path.splines[controlPointSpline].p4 = mousePosition;
        } else {
          path.splines[controlPointSpline].p4 = mousePosition;
          path.splines[controlPointSpline+1].p1 = mousePosition;
        }
        break;
    }
    drawSpline();
  }
};

document.addEventListener('contextmenu', function(e) {
  e.preventDefault();
});

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

  // draw control points
  for (let i = 0; i < path.splines.length; i++) {
    const p1 = coordToPx(path.splines[i].p1);
    const p2 = coordToPx(path.splines[i].p2);
    const p3 = coordToPx(path.splines[i].p3);
    const p4 = coordToPx(path.splines[i].p4);
    ctx.fillStyle = hslToHex(140, 50, 50);
    ctx.beginPath();
    ctx.arc(p1.x, p1.y, controlPointRadius*imgPixelsPerInch, 0, 2*Math.PI);
    ctx.arc(p2.x, p2.y, controlPointRadius*imgPixelsPerInch, 0, 2*Math.PI);
    ctx.fill();
    ctx.closePath();
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
    ctx.closePath();
    ctx.beginPath();
    ctx.moveTo(p3.x, p3.y);
    ctx.lineTo(p4.x, p4.y);
    ctx.stroke();
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


/**
 * @brief log the path for use in the robot
 */
function logPath() {
  // mega string
  let megaString = '';

  // log lookahead distance
  megaString += document.getElementById('lookahead').value + '\n';
  megaString += document.getElementById('accel').value + '\n';

  console.log(megaString);
}
