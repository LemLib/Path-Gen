/**
 * @brief initialize the canvas
 */
const canvas = document.getElementById('fieldCanvas');
const canvasQuery = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const img = new Image();
img.src = 'images/Top View Render.png';
let lastPoint = new Point(-2, 0);

/**
 * @brief dev settings
 */
const imgTrueWidth = 147.8377757;

/**
 * @brief calculate the scale of the canvas
 * To be used in future versions
 */
const imgActualWidth = Number(canvas.attributes.width.value);
const imgHalfActualWidth = imgActualWidth / 2;
const imgPixelsPerInch = imgActualWidth / imgTrueWidth;


/**
 * @brief convert the mouse position to position in coordinate system
 * @param {Point} point - the mouse position
 * @return {Point} - the position in the coordinate system
 */
function pxToCoord(point) {
  const newPoint = new Point(point.x, point.y);
  newPoint.x = newPoint.x - imgHalfActualWidth;
  newPoint.y = imgActualWidth - newPoint.y - imgHalfActualWidth;
  newPoint.x = newPoint.x / imgPixelsPerInch;
  newPoint.y = newPoint.y / imgPixelsPerInch;
  return newPoint;
};


/**
 * @brief convert a point in the coordinate system to the position on the canvas
 * @param {Point} point - the point on the coordinate system
 * @return {Point} - the position on the canvas
 */
function coordToPx(point) {
  const newPoint = new Point(point.x, point.y);
  newPoint.x = newPoint.x * imgPixelsPerInch;
  newPoint.y = newPoint.y * imgPixelsPerInch;
  newPoint.x = newPoint.x + imgHalfActualWidth;
  newPoint.y = imgActualWidth - newPoint.y - imgHalfActualWidth;
  return newPoint;
};


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


/**
 * @brief when the canvas is left clicked
 * @param {Event} e - the event
 */
canvasQuery.onclick = function(e) {
  if (lastPoint.x == -2) {
    lastPoint = getCursorPosition(canvasQuery, e);
  } else {
    const mousePoint = getCursorPosition(canvasQuery, e);
    ctx.beginPath();
    ctx.moveTo(lastPoint.x, lastPoint.y);
    ctx.lineTo(mousePoint.x, mousePoint.y);
    ctx.stroke();
    lastPoint = mousePoint;
    console.log(pxToCoord(lastPoint));
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
