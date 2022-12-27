'use strict';


const canvasQuery = document.querySelector('canvas');


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
 */
function leftDrag(event) {
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
      // update the path
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
      // update the path
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
      // update the path
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
      // update the path
      path.update();
      break;
    }
  }
}


/**
 * @brief event fired when the mouse is dragged while right clicking
 * @param {Event} event - event object
 */
function rightDrag(event) {

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

}


/**
 * Code below this point should not have to be changed
 * Its purpose is to set up the event listeners
 * and call the functions above
 */


// dragging variables
let leftDown = false;
let rightDown = false;


/**
 * @brief event fired when the mouse is clicked
 * @param {Event} event - event object
 */
canvasQuery.onmousedown = function(event) {
  if (event.button === 0) {
    leftClick(event);
    leftDown = true;
  } else if (event.button === 2) {
    rightClick(event);
    rightDown = true;
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
    leftDrag(event);
  }
  if (rightDown) {
    rightDrag(event);
  }
  mouseMove(event);
};
