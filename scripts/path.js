'use strict';

// dev settings
const spacing = 2; // target inches between points
const curvatureMultiplier = 100;
const decel = 100;
const maxSpeed = 100;


/**
 * @brief Spline class
 */
class Spline {
  /**
   * @brief constructor
   * @param {Vector} p1 - first point
   * @param {Vector} p2 - second point
   * @param {Vector} p3 - third point
   * @param {Vector} p4 - fourth point
   */
  constructor(p1, p2, p3, p4) {
    this.p1 = p1;
    this.p2 = p2;
    this.p3 = p3;
    this.p4 = p4;
    this.points = [];
    this.genPoints();
  }

  /**
   * @brief get the points on the spline
   */
  genPoints() {
    for (let t = 0; t <= 1; t += 0.01) {
      t = parseFloat(t.toPrecision(10));
      const tempIndex = parseFloat((t*100).toPrecision(10));
      const x = (1-t)**3*this.p1.x + 3*t*(1-t)**2*this.p2.x +
          3*t**2*(1-t)*this.p3.x + t**3*this.p4.x;
      const y = (1-t)**3*this.p1.y + 3*t*(1-t)**2*this.p2.y +
          3*t**2*(1-t)*this.p3.y + t**3*this.p4.y;
      this.points.push(new Vector(x, y));
    }
  }
};


/**
 * @brief Segment class
 */
class Segment {
  /**
   * @brief constructor
   * @param {Vector} base - base point
   * @param {Vector} control - control point
   */
  constructor(base, control) {
    this.base = base;
    this.control = control;
  }
};


/**
 * @brief Path class
 */
class Path {
  /**
   * @brief constructor
   * @param {Vector} s1 - first segment
   * @param {Vector} s2 - second segment
   */
  constructor(s1, s2) {
    this.segments = [s1, s2];
    this.points = [];
    this.circles = [];
    this.lines = [];
    this.update();
  }

  /**
   * @brief add a segment to the path
   * @param {Segment} segment - segment to add
   */
  addSegment(segment) {
    this.segments.push(segment);
    this.update();
  }

  /**
   * @brief remove a segment from the path
   * @param {Number} pos - the first or last segment to remove (0 or 1)
   * @Note this will only work if there are more than 2 segments
   */
  removeSegment(pos) {
    // check that there are more than 2 segments
    if (this.segments.length > 2) {
      if (pos == 1) {
        this.segments.pop();
      } else {
        this.segments.shift();
      }
      this.update();
    }
  }

  /**
   * @brief calculate the lines between points
   */
  calcLines() {
    // remove all the lines
    while (this.lines.length > 0) {
      this.lines[0].remove();
      this.lines.shift();
    }
    // calculate the lines
    for (let i = 0; i < this.circles.length-1; i++) {
      this.lines.push(new Line(this.circles[i].center, this.circles[i+1].center,
          0.5, this.circles[i].color));
    }
  }

  /**
   * @brief calculate the color for each point
   */
  calcCircles() {
    // remove all the circles
    while (this.circles.length > 0) {
      this.circles[0].remove();
      this.circles.shift();
    }
    // calculate the color for each point
    for (let i = 0; i < this.points.length; i++) {
      // calculate the color
      const tempColor = hslToHex((this.points[i].data2/maxSpeed)*180,
          100, 50);
      this.circles.push(new Circle(this.points[i], 0.5,
          tempColor, 0, tempColor));
    }
  }

  /**
   * @brief calculate the speed at all points on the path
   */
  calcSpeed() {
    // generate velocities
    for (let i = 0; i < this.tempPoints.length-1; i++) {
      const p1 = this.tempPoints[i];
      const p2 = this.tempPoints[i+1];

      const dist = Vector.distance(p1, p2);
      const vel = Math.min(maxSpeed, curvatureMultiplier*dist);
      this.tempPoints[i].data2 = vel;

      if (i == this.tempPoints.length - 2) {
        this.tempPoints[i+1].data2 = vel;
      }
    }

    // apply deceleration
    this.tempPoints[this.tempPoints.length - 1].data2 = 0;
    for (let i = this.tempPoints.length-1; i > 0; i--) {
      const p0 = this.tempPoints[i];
      const p1 = this.tempPoints[i-1];

      const dist = Vector.distance(p0, p1);
      const vel = Math.sqrt(p0.data2**2 + 2*decel*dist);
      this.tempPoints[i-1].data2 = Math.min(vel, p1.data2);
    }
  }

  /**
   * @brief space out the points evenly
   * @param {Array} tempPoints - points to space out
   */
  spacePoints() {
    // calculate the distance along the path
    let curDist = 0;
    this.tempPoints[0].data = 0;
    for (let i = 1; i < this.tempPoints.length; i++) {
      const p1 = this.tempPoints[i-1];
      const p2 = this.tempPoints[i];
      const dist = Vector.distance(p1, p2);
      curDist += dist;
      this.tempPoints[i].data = curDist;
    }

    // calculate the number of points we need
    const numPoints = Math.floor(curDist / spacing);
    const interval = 1 / numPoints;

    // map T onto t
    for (let T = 0; T < 1; T += interval) {
      const u = T * this.tempPoints[this.tempPoints.length-1].data;
      // find the index of the point with the largest distance less than u
      let closestIndex = 0;
      for (let i = 0; i < this.tempPoints.length; i++) {
        if (this.tempPoints[i].data <= u) {
          closestIndex = i;
        }
      }

      // if we have an exact match, just use that point
      if (this.tempPoints[closestIndex].data == u) {
        this.points.push(this.tempPoints[closestIndex]);
      } else { // otherwise, interpolate
        const p1 = this.tempPoints[closestIndex];
        const p2 = this.tempPoints[closestIndex+1];
        const t = (u - p1.data) / (p2.data - p1.data);
        const x = p1.x + t*(p2.x - p1.x);
        const y = p1.y + t*(p2.y - p1.y);
        const p3 = new Vector(x, y, u);
        // calculate the speed at the new point
        const dist1 = Vector.distance(p1, p3);
        const dist2 = Vector.distance(p2, p3);
        if (dist1 < dist2) {
          p3.data2 = p1.data2;
        } else {
          p3.data2 = p2.data2;
        }
        this.points.push(p3);
      }
    }
    this.points.push(this.tempPoints[this.tempPoints.length-1]);
    // clear the temporary points
    this.tempPoints = [];
  }

  /**
   * @brief calculate the points on the path
   */
  calcPoints() {
    // calculate all the points with all the line segments
    this.tempPoints = [];
    for (let i = 1; i < this.segments.length; i++) {
      const spline = new Spline(this.segments[i-1].base,
          this.segments[i-1].control, this.segments[i].control,
          this.segments[i].base);
      this.tempPoints = this.tempPoints.concat(spline.points);
    }

    // calculate how far along the path each point is
    let curDistance = 0;
    for (let i = 0; i < this.tempPoints.length; i++) {
      if (i == 0) {
        this.tempPoints[i].data = 0;
      } else {
        const dist = Vector.distance(this.tempPoints[i], this.tempPoints[i-1]);
        curDistance += dist;
        this.tempPoints[i].data = curDistance;
      }
    }
  }

  /**
   * @brief update the path
   */
  update() {
    // clear the points
    this.points = [];
    // calculate the points
    this.calcPoints();
    // calculate the speed of each point
    this.calcSpeed();
    // space out the points
    this.spacePoints();
    // generate the circles
    this.calcCircles();
    // generate the lines
    this.calcLines();
  }
};


let p1 = new Vector(-32.3, -6.3);
let p2 = new Vector(-41, 49);
let p3 = new Vector(-42, 52);
let p4 = new Vector(5.2, 6.12);


let s1 = new Segment(p1, p2);
let s2 = new Segment(p4, p3);
let path = new Path(s1, s2);


let p5 = new Vector(10, 10);
let p6 = new Vector(20, 20);
let s3 = new Segment(p5, p6);
// path.addSegment(s3);
