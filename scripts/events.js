'use strict';


const canvasQuery = document.querySelector('canvas');


/**
 * @brief event fired when the mouse is left clicked
 */
function leftClick() {

}


/**
 * @brief event fired when the mouse is right clicked
 */
function rightClick() {

}


/**
 * @brief event fired when the mouse is dragged while left clicking
 */
function leftDrag() {

}


/**
 * @brief event fired when the mouse is dragged while right clicking
 */
function rightDrag() {

}


/**
 * @brief event fired when the mouse is moved
 */
function mouseMove() {

}


/**
 * @brief event fired when the mouse is released after left clicking
 */
function leftRelease() {

}


/**
 * @brief event fired when the mouse is released after right clicking
 */
function rightRelease() {

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
    leftClick();
    leftDown = true;
  } else if (event.button === 2) {
    rightClick();
    rightDown = true;
  }
};


/**
 * @brief event fired when the mouse is moved
 */
canvasQuery.onmouseup = function() {
  if (leftDown) {
    leftRelease();
  }
  if (rightDown) {
    rightRelease();
  }
  leftDown = false;
  rightDown = false;
};


/**
 * @brief event fired when the mouse is moved
 */
canvasQuery.onmousemove = function() {
  if (leftDown) {
    leftDrag();
  }
  if (rightDown) {
    rightDrag();
  }
  mouseMove();
};
