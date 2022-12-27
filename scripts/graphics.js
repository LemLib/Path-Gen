'use strict';


const canvas = document.getElementById('fieldCanvas');
const ctx = canvas.getContext('2d');


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
    this.index = Line.instances.length;
    Line.instances.push(this);
  }

  /**
   * @brief remove the line from the canvas
   */
  remove() {
    Line.instances.splice(this.index, 1);
    for (let i = this.index; i < Line.instances.length; i++) {
      Line.instances[i].index--;
    }
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
    this.index = Rectangle.instances.length;
    Rectangle.instances.push(this);
  }

  /**
   * @brief remove the rectangle from the canvas
   */
  remove() {
    Rectangle.instances.splice(this.index, 1);
    for (let i = this.index; i < Rectangle.instances.length; i++) {
      Rectangle.instances[i].index--;
    }
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
    this.index = Circle.instances.length;
    Circle.instances.push(this);
  }

  /**
   * @brief remove the circle from the canvas
   */
  remove() {
    Circle.instances.splice(this.index, 1);
    for (let i = this.index; i < Circle.instances.length; i++) {
      Circle.instances[i].index--;
    }
  }
}


/**
 * @brief Text class
 */
class SimpleText {
  static instances = []; // store all instances of the class

  /**
   * @brief constructor
   * @param {Vector} position position
   * @param {String} text text
   * @param {String} color text color (hex)
   * @param {Number} size text size
   * @param {String} font text font
   */
  constructor(position, text, color = 'black', size = 12, font = 'Arial') {
    this.position = position;
    this.text = text;
    this.color = color;
    this.size = size;
    this.font = font;
    this.index = SimpleText.instances.length;
    SimpleText.instances.push(this);
  }

  /**
   * @brief remove the text from the canvas
   */
  remove() {
    SimpleText.instances.splice(this.index, 1);
    for (let i = this.index; i < SimpleText.instances.length; i++) {
      SimpleText.instances[i].index--;
    }
  }
};


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
    ctx.lineWidth = line.width*imgPixelsPerInch;
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
    ctx.lineWidth = rect.borderWidth*imgPixelsPerInch;
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
    ctx.lineWidth = circle.borderWidth*imgPixelsPerInch;
    ctx.strokeStyle = circle.borderColor;
    ctx.stroke();
    ctx.closePath();
  }

  // draw all texts
  for (let i = 0; i < SimpleText.instances.length; i++) {
    const text = SimpleText.instances[i];
    const position = coordToPx(text.position);
    ctx.beginPath();
    ctx.font = text.size * imgPixelsPerInch + 'px ' + text.font;
    ctx.fillStyle = text.color;
    ctx.fillText(text.text, position.x, position.y);
    ctx.closePath();
  }
}


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
