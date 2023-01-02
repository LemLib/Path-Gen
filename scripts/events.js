'use strict';


const canvasQuery = document.querySelector('canvas');
const highlightRect = new Rectangle(new Vector(0, 0),
    new Vector(0, 0), 'rgba(51, 51, 51, 0.705)');


/**
 * @brief function that returns the position of the mouse on the field
 * @param {Event} event - the event that is triggered (mouse click)
 * @return {Point} - the position of the mouse
 */
function getCursorPosition(event) {
  const rect = canvasQuery.getBoundingClientRect();
  const mousePoint = pxToCoord(new Vector(event.clientX - rect.left,
      event.clientY - rect.top));
  return mousePoint;
};


/**
 * @brief event fired when the mouse is left clicked
 * @param {Event} event - event object
 */
function leftClick(event) {
  // clear highlighted points
  clearHighlight();
  // check if the mouse hit any of the control points
  let foundPoint = false;
  for (let i = 0; i < path.splines.length; i++) {
    const mouse = getCursorPosition(event);
    const p0 = path.splines[i].p0;
    const p1 = path.splines[i].p1;
    const p2 = path.splines[i].p2;
    const p3 = path.splines[i].p3;
    if (Vector.distance(mouse, p0) < 5) { // p0 hit
      path.splines[i].p0.data = 1;
      foundPoint = true;
      break;
    } else if (Vector.distance(mouse, p1) < 5) { // p1 hit
      path.splines[i].p1.data = 1;
      foundPoint = true;
      break;
    } else if (Vector.distance(mouse, p2) < 5) { // p2 hit
      path.splines[i].p2.data = 1;
      foundPoint = true;
      break;
    } else if (Vector.distance(mouse, p3) < 5) { // p3 hit
      path.splines[i].p3.data = 1;
      foundPoint = true;
      break;
    }
  }

  // if no point was clicked on, add a new point to the spline
  if (foundPoint == false) {
    path.addPoint(getCursorPosition(event));
  }
}


/**
 * @brief event fired when the mouse is right clicked
 * @param {Event} event - event object
 */
function rightClick(event) {
  // clear highlightList
  clearHighlight();
  const mouse = getCursorPosition(event);
  const start = path.splines[0].p0;
  const end = path.splines[path.splines.length-1].p3;
  // if the mouse clicked on the path starting point, remove it
  if (Vector.distance(mouse, start) < 5) {
    path.removePoint(0);
  } else if (Vector.distance(mouse, end) < 5) {
    path.removePoint(1);
  }
}


/**
 * @brief event fired when the mouse is dragged while left clicking
 * @param {Event} event - event object
 * @param {Vector} start - where the mouse started to drag
 */
function leftDrag(event, start) {
  const mouse = getCursorPosition(event);
  // update control point locations if they are being dragged
  for (let i = 0; i < path.splines.length; i++) {
    if (path.splines[i].p0.data == 1) { // p0 needs to be dragged
      const dx = mouse.x - path.splines[i].p0.x;
      const dy = mouse.y - path.splines[i].p0.y;
      path.splines[i].p0 = new Vector(mouse.x, mouse.y, 1);
      path.splines[i].p1.x += dx;
      path.splines[i].p1.y += dy;
      // move the end point of the previous spline if it exists
      if (i > 0) {
        path.splines[i-1].p2.x += dx;
        path.splines[i-1].p2.y += dy;
        path.splines[i-1].p3 = new Vector(mouse.x, mouse.y, 0);
      }
      path.update();
      break;
    } else if (path.splines[i].p1.data == 1) { // p1 needs to be dragged
      path.splines[i].p1 = new Vector(mouse.x, mouse.y, 1);
      // move the second control point on the previous spline if it exists
      if (i > 0) {
        const dist = Vector.distance(path.splines[i].p1, path.splines[i].p0);
        path.splines[i-1].p2 = Vector.interpolate(dist*2, path.splines[i].p1,
            path.splines[i].p0);
      }
      path.update();
      break;
    } else if (path.splines[i].p2.data == 1) { // p2 needs to be dragged
      path.splines[i].p2 = new Vector(mouse.x, mouse.y, 1);
      // move the first control point on the next spline if it exists
      if (i < path.splines.length-1) {
        const dist = Vector.distance(path.splines[i].p2, path.splines[i].p3);
        path.splines[i+1].p1 = Vector.interpolate(dist*2, path.splines[i].p2,
            path.splines[i].p3);
      }
      path.update();
      break;
    } else if (path.splines[i].p3.data == 1) { // p3 needs to be dragged
      const dx = mouse.x - path.splines[i].p3.x;
      const dy = mouse.y - path.splines[i].p3.y;
      path.splines[i].p3 = new Vector(mouse.x, mouse.y, 1);
      path.splines[i].p2.x += dx;
      path.splines[i].p2.y += dy;
      // move the starting point on the next spline, if it exists
      if (i < path.splines.length-1) {
        path.splines[i+1].p0 = new Vector(mouse.x, mouse.y, 0);
        path.splines[i+1].p1.x += dx;
        path.splines[i+1].p1.y += dy;
      }
      path.update();
      break;
    }
  }
}


/**
 * @brief event fired when the mouse is dragged while right clicking
 * @param {Event} event - event object
 * @param {Vector} start - where the mouse started to drag
 */
function rightDrag(event, start) {
  highlightRect.start = start;
  highlightRect.end = getCursorPosition(event);
  clearHighlight();
  // add all the highlighted points to the list
  for (let i = 0; i < path.circles.length; i++) {
    if (highlightRect.contains(path.circles[i])) {
      highlightList.push(i);
    }
  }
  for (let i = 0; i < highlightList.length; i++) {
    highlightCircles.push(new Circle(path.points[highlightList[i]],
        1, 'rgba(51, 51, 51, 0)', 1, 'rgba(51, 51, 51, 0.705)'));
  }
}


// mouse position text
const mouseLabel = new SimpleText(new Vector(-70, -70), '0, 0',
    'black', 4, 'Arial');

/**
 * @brief event fired when the mouse is moved
 * @param {Event} event - event object
 */
function mouseMove(event) {
  const mousePoint = getCursorPosition(event);
  mouseLabel.text = Math.round(mousePoint.x) + ', ' + Math.round(mousePoint.y);
}


/**
 * @brief event fired when the mouse is released after left clicking
 * @param {Event} event - event object
 */
function leftRelease(event) {
  // set all control points to not dragging
  for (let i = 0; i < path.splines.length; i++) {
    path.splines[i].p0.data = 0;
    path.splines[i].p1.data = 0;
    path.splines[i].p2.data = 0;
    path.splines[i].p3.data = 0;
  }
}


/**
 * @brief event fired when the mouse is released after right clicking
 * @param {Event} event - event object
 */
function rightRelease(event) {
  // reset highlight square
  highlightRect.start = new Vector(0, 0);
  highlightRect.end = new Vector(0, 0);

  // make a "textbox" appear if the highlight list is not empty
  if (highlightList.length > 0) {
    const mouse = getCursorPosition(event);
    const start = new Vector(mouse.x+5, mouse.y+10);
    const end = new Vector(start.x+15, start.y-10);
    newSpeedBox.start = start;
    newSpeedBox.end = end;
    newSpeedText.position = new Vector(start.x, start.y - 8);
    newSpeedText.text = '100';
  }
}


/**
 * @brief event triggered whenever a keyboard button is pressed
 * @param {Event} event - event object
 */
document.onkeydown = function(event) {
  // decide what to do based on the key pressed
  if (event.key == 'Backspace') {
    if (highlightList.length > 0) {
      if (newSpeedText.text != '') {
        newSpeedText.text =
          newSpeedText.text.substr(0, newSpeedText.text.length - 1);
      }
    }
  } else if (event.key == 'Enter') {
    if (highlightList.length > 0) {
      // change the points on the path
      for (let i = 0; i < highlightList.length; i++) {
        path.points[highlightList[i]].data2 *=
            (parseFloat(newSpeedText.text))/100;
      }
      // semi-update the path and clear the highlight
      path.calcDecel();
      path.calcVisuals();
      clearHighlight();
    }
  } else {
    if (highlightList.length > 0) {
      newSpeedText.text += event.key;
    }
  }
};


const downloadRbt = document.getElementById('downloadRobotBtn');
/**
 * @brief event fired when the download robot button is clicked
 */
downloadRbt.onclick = function() {
  // mega string
  let out = '';

  // log constants
  out += lookaheadSlider.value + '\n';
  out += deactivateSlider.value + '\n';

  // log path points
  for (let i = 0; i < path.points.length; i++) {
    const x = path.points[i].x;
    const y = path.points[i].y;
    const velocity = path.points[i].data2;
    out += x + ', ' + y + ', ' + velocity + '\n';
  }

  // download file
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


const downloadPath = document.getElementById('downloadPathBtn');
/**
 * @brief event fired when the download path button is clicked
 */
downloadPath.onclick = function() {
  // mega string
  let out = '';

  // output slider values
  out += lookaheadSlider.value + '\n';
  out += decelerationSlider.value + '\n';
  out += maxSpeedSlider.value + '\n';
  out += multiplierSlider.value + '\n';
  out += deactivateSlider.value + '\n';

  // output path spline control points
  for (let i = 0; i < path.splines.length; i++) {
    const p0 = path.splines[i].p0;
    const p1 = path.splines[i].p1;
    const p2 = path.splines[i].p2;
    const p3 = path.splines[i].p3;
    out += p0.x + ', ' + p0.y + ', ' + p1.x + ', ' + p1.y + ', ' +
        p2.x + ', ' + p2.y + ', ' + p3.x + ', ' + p3.y + '\n';
  }

  // download file
  const blob = new Blob([out], {type: 'text/csv'});
  if (window.navigator.msSaveOrOpenBlob) {
    window.navigator.msSaveBlob(out, 'path.txt');
  }
  const elem = window.document.createElement('a');
  elem.href = window.URL.createObjectURL(blob);
  elem.download = 'path.txt';
  document.body.appendChild(elem);
  elem.click();
  document.body.removeChild(elem);
};


const uploadPath = document.getElementById('uploadPathBtn');
/**
 * @brief event fired when the upload path button is clicked
 */
uploadPath.onchange = function() {
  // get the file
  const file = uploadPath.files[0];

  const reader = new FileReader();
  let data = '';

  // event fired when file reading finished
  reader.onload=function() {
    data = reader.result;
    // split the data into lines
    const lines = data.split('\n');

    // get the slider values
    lookaheadSlider.value = parseFloat(lines[0]);
    decelerationSlider.value = parseFloat(lines[1]);
    maxSpeedSlider.value = parseFloat(lines[2]);
    multiplierSlider.value = parseFloat(lines[3]);
    deactivateSlider.value = parseFloat(lines[4]);
    // update their text values
    lookaheadText.innerHTML = lookaheadSlider.value;
    decelerationText.innerHTML = decelerationSlider.value;
    maxSpeedText.innerHTML = maxSpeedSlider.value;
    multiplierText.innerHTML = multiplierSlider.value;
    deactivateText.innerHTML = deactivateSlider.value;

    let i = 5;

    // read splines
    path.splines = [];
    while (i < lines.length-1) {
      // read spline
      const line = lines[i].split(', ');
      const p1 = new Vector(parseFloat(line[0]), parseFloat(line[1]));
      const p2 = new Vector(parseFloat(line[2]), parseFloat(line[3]));
      const p3 = new Vector(parseFloat(line[4]), parseFloat(line[5]));
      const p4 = new Vector(parseFloat(line[6]), parseFloat(line[7]));
      const spline = new Spline(p1, p2, p3, p4);
      path.splines.push(spline);
      i++;
    }

    // update the path
    path.update();
  };
  reader.readAsText(this.files[0]);
  // remove the file from the input
  uploadPath.value = '';
};


/**
 * Code below this point should not have to be changed
 * Its purpose is to set up the event listeners
 * and call the functions above
 */


// dragging variables
let leftDown = false;
let rightDown = false;
let leftDownStart = new Vector(0, 0);
let rightDownStart = new Vector(0, 0);


/**
 * @brief event fired when the mouse is clicked
 * @param {Event} event - event object
 */
canvasQuery.onmousedown = function(event) {
  if (event.button === 0) {
    leftClick(event);
    leftDown = true;
    leftDownStart = getCursorPosition(event);
  } else if (event.button === 2) {
    rightClick(event);
    rightDown = true;
    rightDownStart = getCursorPosition(event);
  }
};


/**
 * @brief event fired when the mouse is moved
 * @param {Event} event - event object
 */
canvasQuery.onmouseup = function(event) {
  if (leftDown) {
    leftRelease(event);
  }
  if (rightDown) {
    rightRelease(event);
  }
  leftDown = false;
  rightDown = false;
};


/**
 * @brief event fired when the mouse is moved
 * @param {Event} event - event object
 */
canvasQuery.onmousemove = function(event) {
  if (leftDown) {
    leftDrag(event, leftDownStart);
  }
  if (rightDown) {
    rightDrag(event, rightDownStart);
  }
  mouseMove(event);
};
