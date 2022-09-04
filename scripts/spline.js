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
    this.points = [];
    const newTolerance = 1 / tolerance;
    for (let t = 0; t < 1; t += newTolerance) {
      this.points.push(this.getPosition(t));
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

  /**
   * @brief get the curvature of the spline at a specific point
   * @param {number} t - the index of the point
   * @return {number} - the curvature
   */
  getCurvature(t) {
    // if t is the first or last point, return 0
    if (t === 0 || t === this.points.length - 1) {
      return 0;
    } else {
      let x1 = 0;
      // fix x1 = x2 edge case
      if (this.points[t-1].x === this.points[t].x) {
        x1 = this.points[t-1].x + 0.00001;
      } else {
        x1 = this.points[t-1].x;
      }
      const x2 = this.points[t].x;
      const x3 = this.points[t+1].x;
      const y1 = this.points[t-1].y;
      const y2 = this.points[t].y;
      const y3 = this.points[t+1].y;

      const k1 = 0.5 * (x1**2 + y1**2 - x2**2 - y2**2) / (x1 - x2);
      const k2 = 0.5 * (y1 - y2) / (x1 - x2);

      const bA = x2**2 - 2*x2*k1 + y2**2 - x3**2 + 2*x3*k1 - y3**2;
      const bB = x3*k2 - y3 + y2 - x2*k2;
      const b = 0.5 * bA / bB;

      const a = k1 - k2*b;

      const r = Math.sqrt((x1 - a)**2 + (y1 - b)**2);
      const curvature = 1 / r;

      // fix NaN curvature
      if (isNaN(curvature)) {
        return 0;
      } else {
        return curvature;
      }
    }
  };
};
// above code needs further testing. Initial testing was successful.
