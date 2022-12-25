const canvas = document.getElementById('fieldCanvas');
const ctx = canvas.getContext('2d');

// dev settings
const imgTrueWidth = 147.8377757;
const img = new Image;
img.src = 'images/field.png';

// constants based on settings
// these are not the settings you are looking for
const imgActualWidth = Number(canvas.attributes.width.value);
const imgHalfActualWidth = imgActualWidth / 2;
const imgPixelsPerInch = imgActualWidth / imgTrueWidth;


/**
 * @brief Line class
 */
class Line {
  static instances = []; // store all instances of the class
  /**
   * @brief constructor
   * @param {Vector} start start point
   * @param {Vector} end end point
   * @param {Number} width line width
   * @param {String} color line color (hex)
   */
  constructor(start, end, width = 1, color = 'black') {
    this.start = start;
    this.end = end;
    this.width = width;
    this.color = color;
    Line.instances.push(this);
  }
};


/**
 * @brief Rectangle class
 */
class Rectangle {
  static instances = []; // store all instances of the class
  /**
   * @brief constructor
   * @param {Vector} start start point
   * @param {Vector} end end point
   * @param {String} color fill color (hex)
   * @param {Number} borderWidth border width
   * @param {String} borderColor border color (hex)
   */
  constructor(start, end, color = 'black',
      borderWidth = 0, borderColor = 'black') {
    this.start = start;
    this.end = end;
    this.color = color;
    this.borderWidth = borderWidth;
    this.borderColor = borderColor;
    Rectangle.instances.push(this);
  }
};

/**
 * @brief Circle class
 */
class Circle {
  static instances = []; // store all instances of the class
  /**
   * @brief constructor
   * @param {Vector} center center point
   * @param {Number} radius radius
   * @param {String} color fill color (hex)
   * @param {Number} borderWidth border width
   * @param {String} borderColor border color (hex)
   */
  constructor(center, radius, color = 'black',
      borderWidth = 0, borderColor = 'black') {
    this.center = center;
    this.radius = radius;
    this.color = color;
    this.borderWidth = borderWidth;
    this.borderColor = borderColor;
    Circle.instances.push(this);
  }
}


/**
 * @brief convert the mouse position to position in coordinate system
 * @param {Vector} point - the mouse position
 * @return {Vector} - the position in the coordinate system
 */
function pxToCoord(point) {
  const newPoint = new Vector(point.x, point.y);
  newPoint.x = newPoint.x - imgHalfActualWidth;
  newPoint.y = imgActualWidth - newPoint.y - imgHalfActualWidth;
  newPoint.x = newPoint.x / imgPixelsPerInch;
  newPoint.y = newPoint.y / imgPixelsPerInch;
  return newPoint;
};


/**
 * @brief convert a point in the coordinate system to the position on the canvas
 * @param {Vector} point - the point on the coordinate system
 * @return {Vector} - the position on the canvas
 */
function coordToPx(point) {
  const newPoint = new Vector(point.x, point.y);
  newPoint.x = newPoint.x * imgPixelsPerInch;
  newPoint.y = newPoint.y * imgPixelsPerInch;
  newPoint.x = newPoint.x + imgHalfActualWidth;
  newPoint.y = imgActualWidth - newPoint.y - imgHalfActualWidth;
  return newPoint;
};


/**
 * @brief render function
 */
function render() {
  // clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // draw the background image
  ctx.drawImage(img, 0, 0, img.width, img.height, // source rectangle
      0, 0, canvas.width, canvas.height); // destination rectangle

  // draw all lines
  for (let i = 0; i < Line.instances.length; i++) {
    const line = Line.instances[i];
    const start = coordToPx(line.start);
    const end = coordToPx(line.end);
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.lineWidth = line.width;
    ctx.strokeStyle = line.color;
    ctx.stroke();
    ctx.closePath();
  }

  // draw all rectangles
  for (let i = 0; i < Rectangle.instances.length; i++) {
    const rect = Rectangle.instances[i];
    const start = coordToPx(rect.start);
    const end = coordToPx(rect.end);
    ctx.beginPath();
    ctx.rect(start.x, start.y, end.x - start.x, end.y - start.y);
    ctx.fillStyle = rect.color;
    ctx.fill();
    ctx.lineWidth = rect.borderWidth;
    ctx.strokeStyle = rect.borderColor;
    ctx.stroke();
    ctx.closePath();
  }

  // draw all circles
  for (let i = 0; i < Circle.instances.length; i++) {
    const circle = Circle.instances[i];
    const center = coordToPx(circle.center);
    ctx.beginPath();
    ctx.arc(center.x, center.y, circle.radius * imgPixelsPerInch,
        0, 2 * Math.PI);
    ctx.fillStyle = circle.color;
    ctx.fill();
    ctx.lineWidth = circle.borderWidth;
    ctx.strokeStyle = circle.borderColor;
    ctx.stroke();
    ctx.closePath();
  }
}


// make the render function run regularly
setInterval(render, 1000 / 60);
