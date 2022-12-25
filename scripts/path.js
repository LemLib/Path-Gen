'use strict';

// dev settings
const spacing = 2;
const curvatureMultiplier = 100;
const decel = 20000;
const maxSpeed = 1000000;


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
    for (let t = 0; t < 1; t += 0.01) {
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
    this.init();
  }

  /**
   * @brief add a segment to the path
   * @param {Segment} segment - segment to add
   */
  addSegment(segment) {
    this.segments.push(segment);
    this.init();
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
    const curDistance = this.tempPoints[this.tempPoints.length-1].data;
    // now we will space out the points evenly
    this.points = [];
    const newSpacing = 1 /
        (Math.round(this.tempPoints[this.tempPoints.length-1].data /
            spacing)-1);
    // map T onto t
    for (let T = 0; T < 1.00001; T += newSpacing) {
      const u = T * curDistance;
      let closestIndex = 0;
      // find the largest point with a distance less than or equal to u
      // this should be done with a binary search in future
      for (let i = 0; i < this.tempPoints.length; i++) {
        if (this.tempPoints[i].data <= u) {
          if (this.tempPoints[i].data > this.tempPoints[closestIndex].data) {
            closestIndex = i;
          }
        }
      }
      // if the point we found is an exact match, we can just save it
      if (this.tempPoints[closestIndex].data == u) {
        this.points.push(this.tempPoints[closestIndex]);
        this.points[this.points.length - 1].data = u;
      } else if (closestIndex == this.tempPoints.length - 1) {
        this.points.push(this.tempPoints[closestIndex]);
        this.points[this.points.length - 1].data = u;
      } else {
        const p1 = this.tempPoints[closestIndex];
        const p2 = this.tempPoints[closestIndex + 1];
        const p3 = Vector.interpolate(u - p1.data, p1, p2);
        const dist = Vector.distance(p1, p2);
        // decide what the velocity should be
        if ((u - p1.data) > dist/2) {
          p3.data = p2.data;
        } else {
          p3.data = p1.data;
        }
        this.points.push(p3);
        this.points[this.points.length - 1].data = u;
      }
    }
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
   * @brief initialize
   */
  init() {
    // calculate the points
    this.calcPoints();
    // calculate the speed of each point
    this.calcSpeed();
    // space out the points
    this.spacePoints();
    // calculate the speed of each point
  }
};


let p1 = new Vector(0, 0);
let p2 = new Vector(20, 0);
let p3 = new Vector(0, 20);
let p4 = new Vector(20, 20);
let p5 = new Vector(40, 20);
let p6 = new Vector(40, 0);
let s1 = new Segment(p1, p2);
let s2 = new Segment(p4, p3);
let s3 = new Segment(p6, p5);
let path = new Path(s1, s2);

for (let i = 0; i < path.points.length; i++) {
  new Circle(path.points[i], 0.5);
}
