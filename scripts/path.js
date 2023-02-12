'use strict';


/**
 * @brief Spline class
 */
class Spline {
  /**
   * @brief constructor
   * @param {Vector} p0 - first point
   * @param {Vector} p1 - second point
   * @param {Vector} p2 - third point
   * @param {Vector} p3 - fourth point
   */
  constructor(p0, p1, p2, p3) {
    this.p0 = p0;
    this.p1 = p1;
    this.p2 = p2;
    this.p3 = p3;
    this.points = [];
  }

  /**
   * @brief get the points on the spline
   */
  genPoints() {
    // clear any exiting points
    this.points = [];
    for (let t = 0; t <= 1; t += 0.01) {
      t = parseFloat(t.toPrecision(10));
      const tempIndex = parseFloat((t*100).toPrecision(10));
      const x = (1-t)**3*this.p0.x + 3*t*(1-t)**2*this.p1.x +
          3*t**2*(1-t)*this.p2.x + t**3*this.p3.x;
      const y = (1-t)**3*this.p0.y + 3*t*(1-t)**2*this.p1.y +
          3*t**2*(1-t)*this.p2.y + t**3*this.p3.y;
      this.points.push(new Vector(x, y));
    }
  }
};


/**
 * @brief Path class
 */
class Path {
  /**
   * @brief constructor
   * @param {Spline} spline - the first spline of the path
   */
  constructor(spline) {
    this.visible = true;
    this.splines = [spline];
    this.points = [];
    this.circles = [];
    this.lines = [];
    this.controlCircles = [];
    this.controlLines = [];
    this.update();
  }

  /**
   * @brief add an endpoint to the path
   * @param {Vector} point - the endpoint to add
   */
  addPoint(point) {
    // the first point is the same as the endpoint on the previous spline
    const p0 = this.splines[this.splines.length - 1].p3;
    // calculate the first control point
    // it is mirrored to the last control point of the previous spline
    const oldControl = this.splines[this.splines.length -1].p2;
    const p1 = Vector.interpolate(Vector.distance(oldControl, p0) * 2,
        oldControl, p0);
    // the third point will just be 24 inches above the end point
    const p2 = new Vector(point.x, point.y - 24);
    // the fourth point is the point passed as the function parameter
    const p3 = point;
    // update the path
    this.splines.push(new Spline(p0, p1, p2, p3));
    this.update();
  }

  /**
   * @brief remove a point from the path
   * @param {Number} pos the position (0 is back, 1 is front)
   */
  removePoint(pos) {
    if (this.splines.length > 1) {
      if (pos == 1) {
        this.splines.pop();
      } else if (pos == 0) {
        this.splines.shift();
      }
      this.update();
    }
  }

  /**
   * @brief calculate the positions of each circle
   */
  calcVisuals() {
    // remove all existing circles
    while (this.circles.length > 0) {
      this.circles[0].remove();
      this.circles.shift();
    }
    // create circles for each point on the path
    for (let i = 0; i < this.points.length; i++) {
      const color = hslToHex((this.points[i].data2/maxSpeedSlider.value)*180,
          100, 50);
      this.circles.push(new Circle(this.points[i], pointRadius,
          color, pointBorderWidth, color));
    }

    // remove all existing lines
    while (this.lines.length > 0) {
      this.lines[0].remove();
      this.lines.shift();
    }
    // calculate the lines
    for (let i = 0; i < this.circles.length-1; i++) {
      this.lines.push(new Line(this.circles[i].center, this.circles[i+1].center,
          lineWidth, this.circles[i].color));
    }

    // remove all existing control circles
    while (this.controlCircles.length > 0) {
      this.controlCircles[0].remove();
      this.controlCircles.shift();
    }
    // calculate the circles for every control point
    for (let i = 0; i < this.splines.length; i++) {
      if (i == 0) {
        this.controlCircles.push(new Circle(this.splines[i].p0,
            controlPointRadius, controlPointColor,
            controlPointBorderWidth, controlPointBorderColor));
      }
      this.controlCircles.push(new Circle(this.splines[i].p1,
          controlPointRadius, controlPointColor,
          controlPointBorderWidth, controlPointBorderColor));
      this.controlCircles.push(new Circle(this.splines[i].p2,
          controlPointRadius, controlPointColor,
          controlPointBorderWidth, controlPointBorderColor));
      this.controlCircles.push(new Circle(this.splines[i].p3,
          controlPointRadius, controlPointColor,
          controlPointBorderWidth, controlPointBorderColor));
    }

    // remove all existing control point lines
    while (this.controlLines.length > 0) {
      this.controlLines[0].remove();
      this.controlLines.shift();
    }
    // calculate the lines between the control points
    for (let i = 0; i < this.splines.length; i++) {
      this.controlLines.push(new Line(this.splines[i].p0, this.splines[i].p1,
          controlLineWidth, controlLineColor));
      this.controlLines.push(new Line(this.splines[i].p2, this.splines[i].p3,
          controlLineWidth, controlLineColor));
    }
  }

  /**
   * @brief calculate the deceleration of the robot at each point
   */
  calcDecel() {
    // apply deceleration
    this.points[this.points.length - 1].data2 = 0;
    for (let i = this.points.length-1; i > 0; i--) {
      const p0 = this.points[i];
      const p1 = this.points[i-1];

      const dist = Vector.distance(p0, p1);
      const vel = Math.sqrt(p0.data2**2 + 2*decelerationSlider.value*dist);
      this.points[i-1].data2 = Math.min(vel, p1.data2);
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
      const vel = Math.min(maxSpeedSlider.value, multiplierSlider.value*dist);
      this.tempPoints[i].data2 = vel;

      if (i == this.tempPoints.length - 2) {
        this.tempPoints[i+1].data2 = vel;
      }
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
    for (let i = 0; i < this.splines.length; i++) {
      this.splines[i].genPoints();
      // unless the spline is the last one, remove the last point
      if (i != this.splines.length-1) {
        this.splines[i].points.pop();
      }
      this.tempPoints = this.tempPoints.concat(this.splines[i].points);
      // get rid of the points after we are done with them
      this.splines[i].points = [];
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
    // clear the highlight
    clearHighlight();
    // clear the points
    this.points = [];
    // calculate the points
    this.calcPoints();
    // calculate the speed of each point
    this.calcSpeed();
    // space out the points
    this.spacePoints();
    // calculate the deceleration of each point
    this.calcDecel();
    // calculate the visuals
    this.calcVisuals();
  }

  /**
   * @brief set the path visibility
   * @param {Bool} visible - whether the path is visible
   */
  setVisible(visible) {
    this.visible = visible;
    // circles
    for (let i = 0; i < this.circles.length; i++) {
      this.circles[i].visible = visible;
    }
    // lines
    for (let i = 0; i < this.lines.length; i++) {
      this.lines[i].visible = visible;
    }
    // control circles
    for (let i = 0; i < this.controlCircles.length; i++) {
      this.controlCircles[i].visible = visible;
    }
    // control lines
    for (let i = 0; i < this.controlLines.length; i++) {
      this.controlLines[i].visible = visible;
    }
  }
};
