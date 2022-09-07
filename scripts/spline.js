/* eslint-disable no-unused-vars */

/**
 * @brief spline class
 */
class Spline {
  /**
   * Constructor for spline
   * @param {Point} p1 - start point
   * @param {Point} p2 - control point 1
   * @param {Point} p3 - control point 2
   * @param {Point} p4 - end point
   */
  constructor(p1, p2, p3, p4) {
    this.p1 = p1;
    this.p2 = p2;
    this.p3 = p3;
    this.p4 = p4;
  };

  /**
   * @brief get the position of the spline at a certain time
   * @param {number} t - the time
   * @return {Point} - the position of the spline at the time
   */
  getPosition(t) {
    const x = (1-t)**3*this.p1.x + 3*t*(1-t)**2*this.p2.x +
              3*t**2*(1-t)*this.p3.x + t**3*this.p4.x;
    const y = (1-t)**3*this.p1.y + 3*t*(1-t)**2*this.p2.y +
              3*t**2*(1-t)*this.p3.y + t**3*this.p4.y;
    return new Point(x, y);
  };

  /**
   * @brief generate points on the spline with a specific tolerance
   * @param {number} tolerance - the tolerance. How many points to generate
   */
  generatePoints(tolerance) {
    const adjustedTolerance = tolerance - 1;
    this.points = [];
    const newTolerance = 1 / adjustedTolerance;
    for (let t = 0; t <= adjustedTolerance; t++) {
      this.points.push(this.getPosition(t/adjustedTolerance));
    }
  };

  /**
   * @brief get the length of the spline
   */
  genLength() {
    this.len = 0;
    for (let i = 0; i < this.points.len - 1; i++) {
      const v = new Vector(this.points[i], this.points[i+1]);
      this.len += v.getMagnitude();
    }
  };
};


/**
 * @brief calculate the curvature of 3 points
 * @param {Point} p1 - the first point
 * @param {Point} p2 - the second point
 * @param {Point} p3 - the third point
 * @return {number} - the curvature
 */
function calcCurvature(p1, p2, p3) {
  // set values of points
  let x1 = p1.x;
  // fix x1 = x2 edge case
  if (x1 == p2.x) {
    x1 += 0.00001;
  }
  const x2 = p2.x;
  const x3 = p3.x;
  const y1 = p1.y;
  const y2 = p2.y;
  const y3 = p3.y;

  // variables used to make the math look sane
  const k1 = 0.5 * (x1**2 + y1**2 - x2**2 - y2**2) / (x1 - x2);
  const k2 = 0.5 * (y1 - y2) / (x1 - x2);
  const bA = x2**2 - 2*x2*k1 + y2**2 - x3**2 + 2*x3*k1 - y3**2;
  const bB = x3*k2 - y3 + y2 - x2*k2;

  // useful variables
  const b = 0.5 * bA / bB; // circle center y
  const a = k1 - k2*b; // circle center x
  const r = Math.sqrt((x1 - a)**2 + (y1 - b)**2); // radius of the circle
  const curvature = 1 / r; // curvature of the circle

  // fix NaN curvature
  if (isNaN(curvature)) {
    return 0;
  }

  return curvature;
};


/**
 * @brief Class for the robot path. Contains multiple splines
 */
class Path {
  /**
   * @brief Constructor for path
   */
  constructor() {
    this.splines = [];
  };

  /**
   * @brief add a spline to the path
   * @param {Spline} spline - the spline to add
   */
  addSpline(spline) {
    this.splines.push(spline);
  };

  /**
   * @brief generate points on all splines with a specific tolerance
   * @param {number} tolerance - how many points to generate per spline
   * @param {number} spacing - the distance between points
   * WARNING: this function is computationally expensive
   * In future this should be GPU accelerated
   */
  genPoints(tolerance, spacing) {
    // generate points on all splines
    for (let i = 0; i < this.splines.length; i++) {
      this.splines[i].generatePoints(tolerance);
    }

    // combine all the splines into 1 array
    this.points = [];
    for (let i = 0; i < this.splines.length; i++) {
      this.points = this.points.concat(this.splines[i].points);
    }

    // calculate the distance from the start of the spline to each point
    for (let i = 0; i < this.points.length; i++) {
      if (i == 0) {
        this.points[i].distance = 0;
      } else {
        const v = new Vector(this.points[i-1], this.points[i]);
        this.points[i].distance = this.points[i-1].distance + v.getMagnitude();
      }
    }
    // save the length of the spline
    this.length = this.points[this.points.length - 1].distance;

    // init points2
    this.points2 = [];

    // space out the points on the curve
    // this is done by arc parametrization
    // for now we have const T value, but this should be changed to be
    // a nested for loop that goes through T values in equal increments
    const newSpacing = 1/(spacing-1);

    // map T onto t
    for (let T = 0; T < 1.00001; T += newSpacing) {
      const u = T * this.length;
      let closestIndex = 0;
      // find the largest point with a distance less than or equal to u
      // this should be done with binary search
      for (let i = 0; i < this.points.length; i++) {
        if (this.points[i].distance <= u) {
          if (this.points[i].distance > this.points[closestIndex].distance) {
            closestIndex = i;
          }
        }
      }

      // if the point we found is an exact match, we can just save it
      // eslint-disable-next-line max-len
      if (this.points[closestIndex].distance == u || closestIndex == this.points.length - 1) {
        this.points2.push(this.points[closestIndex]);
        this.points2[this.points2.length - 1].distance = u;
        // otherwise we need to interpolate (99.99% of cases)
      } else {
        const p1 = this.points[closestIndex];
        const p2 = this.points[closestIndex + 1];
        const v = new Vector(p1, p2);
        const p3 = v.interpolate(u - p1.distance);
        this.points2.push(p3);
        this.points2[this.points2.length - 1].distance = u;
      }
      console.log(T);
    }
  };
};
