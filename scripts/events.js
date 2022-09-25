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
  
    // draw path every x seconds
    setInterval(drawSpline, 1000/60);
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
   * @brief function that runs when the mouse is clicked
   * @param {Event} event - the event that is triggered (mouse click)
   */
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
  
  
/**
   * @brief function that runs when the mouse is released
   * @param {Event} event - the event that is triggered (mouse release)
   */
canvasQuery.onmouseup = function(event) {
    controlPointHold = false;
};
  
  
/**
   * @brief function that runs when the mouse is moved
   * @param {Event} event - the event that is triggered (mouse move)
   */
canvasQuery.onmousemove = function(event) {
    mousePos = pxToCoord(getCursorPosition(canvasQuery, event));
    if (controlPointHold) {
      switch (controlPointNumber) {
        case 1:
          if (controlPointSpline == 0) {
            const v2 = new Vector(path.splines[0].p1, mousePos);
            const x2 = v2.getX() + path.splines[controlPointSpline].p2.x;
            const y2 = v2.getY() + path.splines[controlPointSpline].p2.y;
            const tP2 = new Point(x2, y2);
            path.splines[controlPointSpline].p2 = tP2;
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
          const v3 = new Vector(path.splines[controlPointSpline].p4, mousePos);
          const x3 = v3.getX() + path.splines[controlPointSpline].p3.x;
          const y3 = v3.getY() + path.splines[controlPointSpline].p3.y;
          const tP3 = new Point(x3, y3);
          path.splines[controlPointSpline].p3 = tP3;
          if (controlPointSpline == path.splines.length - 1) {
            path.splines[controlPointSpline].p4 = mousePos;
          } else {
            const x2 = v3.getX() + path.splines[controlPointSpline+1].p2.x;
            const y2 = v3.getY() + path.splines[controlPointSpline+1].p2.y;
            const tP2 = new Point(x2, y2);
            path.splines[controlPointSpline+1].p2 = tP2;
            path.splines[controlPointSpline].p4 = mousePos;
            path.splines[controlPointSpline+1].p1 = mousePos;
          }
          break;
      }
    }
};
  
  
/**
   * @brief function that runs when the the mouse was right clicked
   * @param {Event} event - the event that is triggered (mouse right click)
   */
document.oncontextmenu = function(event) {
    event.preventDefault();
};


/**
 * @brief log the path for use in the robot
 */
downloadRobotBtn.onclick = function() {
    // mega string
    let out = '';
  
    // log constants
    out += lookahead + '\n';
    out += trackWidth + '\n';
    out += deactivateDist + '\n';
  
    out += lF + '\n';
    out += lA + '\n';
    out += lJ + '\n';
    out += lP + '\n';
    out += lI + '\n';
    out += lD + '\n';
    out += lB + '\n';
    out += lG + '\n';
  
    out += rF + '\n';
    out += rA + '\n';
    out += rJ + '\n';
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
      window.navigator.msSaveBlob(out, 'robot.txt');
    } else {
      const elem = window.document.createElement('a');
      elem.href = window.URL.createObjectURL(blob);
      elem.download = 'robot.txt';
      document.body.appendChild(elem);
      elem.click();
      document.body.removeChild(elem);
    }
};
  
  
/**
   * @brief log the path for use in the simulator
   */
downloadPathBtn.onclick = function() {
    // mega string
    let out = '';
  
    // log slider values
    out += lookahead + '\n';
    out += decel + '\n';
    out += maxSpeed + '\n';
    out += curveMultiplierSlider.value + '\n';
    out += precision + '\n';
    out += inchesPerPoint + '\n';
    out += trackWidth + '\n';
    out += deactivateDist + '\n';
    out += lF + '\n';
    out += lA + '\n';
    out += lJ + '\n';
    out += lP + '\n';
    out += lI + '\n';
    out += lD + '\n';
    out += lB + '\n';
    out += lG + '\n';
    out += rF + '\n';
    out += rA + '\n';
    out += rJ + '\n';
    out += rP + '\n';
    out += rI + '\n';
    out += rD + '\n';
    out += rB + '\n';
    out += rG + '\n';
  
    // log splines
    for (let i = 0; i < path.splines.length; i++) {
      const p1 = path.splines[i].p1;
      const p2 = path.splines[i].p2;
      const p3 = path.splines[i].p3;
      const p4 = path.splines[i].p4;
      out += p1.x + ', ' + p1.y + ', ' + p2.x + ', ' + p2.y + ', ' + p3.x + ', ' + p3.y + ', ' + p4.x + ', ' + p4.y + '\n';
    }
  
    // download the file
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
  
  
/**
   * @brief upload path data from file
   */
uploadPathBtn.onchange = function() {
    const file = uploadPathBtn.files[uploadPathBtn.files.length];
    const reader = new FileReader();
    let data = '';
  
    // event fired when file reading finished
      reader.onload=function() {
      data = reader.result;
  
      // split the data into lines
      const lines = data.split('\n');
  
      // init path
      path = new Path();
      
      // get the slider values
      lookahead = parseFloat(lines[0]);
      decel = parseFloat(lines[1]);
      maxSpeed = parseFloat(lines[2]);
      curvatureMultiplier = parseFloat(lines[3]);
      precision = parseFloat(lines[4]);
      inchesPerPoint = parseFloat(lines[5]);
      trackWidth = parseFloat(lines[6]);
      deactivateDist = parseFloat(lines[7]);
      lF = parseFloat(lines[8]);
      lA = parseFloat(lines[9]);
      lJ = parseFloat(lines[10]);
      lP = parseFloat(lines[11]);
      lI = parseFloat(lines[12]);
      lD = parseFloat(lines[13]);
      lB = parseFloat(lines[14]);
      lG = parseFloat(lines[15]);
      rF = parseFloat(lines[16]);
      rA = parseFloat(lines[17]);
      rJ = parseFloat(lines[18]);
      rP = parseFloat(lines[19]);
      rI = parseFloat(lines[20]);
      rD = parseFloat(lines[21]);
      rB = parseFloat(lines[22]);
      rG = parseFloat(lines[23]);
  
      let i = 24;
  
      // read splines
      path.splines = [];
      while (i < lines.length-1) {
        // read spline
        const line = lines[i].split(', ');
        const p1 = new Point(parseFloat(line[0]), parseFloat(line[1]));
        const p2 = new Point(parseFloat(line[2]), parseFloat(line[3]));
        const p3 = new Point(parseFloat(line[4]), parseFloat(line[5]));
        const p4 = new Point(parseFloat(line[6]), parseFloat(line[7]));
        const spline = new Spline(p1, p2, p3, p4);
        path.addSpline(spline)
        i++;
      }
  
      // update the sliders
      lookaheadSlider.value = lookahead;
      decelSlider.value = decel;
      maxSpeedSlider.value = maxSpeed;
      curveMultiplierSlider.value = curvatureMultiplier;
      precisionSlider.value = precision;
      inchesPerPointSlider.value = inchesPerPoint;
      trackWidthSlider.value = trackWidth;
      deactivateDistSlider.value = deactivateDist;
      lFSlider.value = lF;
      lASlider.value = lA;
      lJSlider.value = lJ;
      lPSlider.value = lP;
      lISlider.value = lI;
      lDSlider.value = lD;
      lBSlider.value = lB;
      lGSlider.value = lG;
      rFSlider.value = rF;
      rASlider.value = rA;
      rJSlider.value = rJ;
      rPSlider.value = rP;
      rISlider.value = rI;
      rDSlider.value = rD;
      rBSlider.value = rB;
      rGSlider.value = rG;
  
      // update the text
      lookaheadVal.innerHTML = lookahead;
      decelVal.innerHTML = decel;
      maxSpeedVal.innerHTML = maxSpeed;
      curveMultiplierVal.innerHTML = curvatureMultiplier;
      precisionVal.innerHTML = precision;
      inchesPerPointVal.innerHTML = inchesPerPoint;
      trackWidthVal.innerHTML = trackWidth;
      deactivateDistVal.innerHTML = deactivateDist;
      lFVal.innerHTML = lF;
      lAVal.innerHTML = lA;
      lJVal.innerHTML = lJ;
      lPVal.innerHTML = lP;
      lIVal.innerHTML = lI;
      lDVal.innerHTML = lD;
      lBVal.innerHTML = lB;
      lGVal.innerHTML = lG;
      rFVal.innerHTML = rF;
      rAVal.innerHTML = rA;
      rJVal.innerHTML = rJ;
      rPVal.innerHTML = rP;
      rIVal.innerHTML = rI;
      rDVal.innerHTML = rD;
      rBVal.innerHTML = rB;
      rGVal.innerHTML = rG;
    }
    reader.readAsText(this.files[0]);
}