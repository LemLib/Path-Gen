'use strict';


/**
 * @brief Class for vectors
 */
class Vector {
  /**
   * @brief Constructor
   * @param {number} x x coordinate
   * @param {number} y y coordinate
   * @param {number} data data
   * @param {number} data2 data2
   */
  constructor(x, y, data = 0, data2 = 0) {
    this.x = x;
    this.y = y;
    this.data = data;
  }

  /**
   * @brief Add two vectors
   * @param {Vector} v1 vector 1
   * @param {Vector} v2 vector 2
   * @return {Vector} sum of v1 and v2
   * @note This is a static class method
   */
  static add(v1, v2) {
    return new Vector(v1.x + v2.x, v1.y + v2.y, 0);
  }

  /**
   * @brief Subtract two vectors
   * @param {Vector} v1 vector 1
   * @param {Vector} v2 vector 2
   * @return {Vector} difference of v1 and v2
   * @note This is a static class method
   */
  static subtract(v1, v2) {
    return new Vector(v1.x - v2.x, v1.y - v2.y, 0);
  }

  /**
   * @brief Multiply a vector by a scalar
   * @param {Vector} v vector
   * @param {number} s scalar
   * @return {Vector} product of v and s
   * @note This is a static class method
   */
  static multiply(v, s) {
    return new Vector(v.x * s, v.y * s, 0);
  }

  /**
   * @brief Divide a vector by a scalar
   * @param {Vector} v vector
   * @param {number} s scalar
   * @return {Vector} quotient of v and s
   * @note This is a static class method
   * @note This method will throw an error if s is 0
   */
  static divide(v, s) {
    if (s === 0) {
      throw new Error('Divide by 0');
    }
    return new Vector(v.x / s, v.y / s, 0);
  }

  /**
   * @brief dot product of two vectors
   * @param {Vector} v1 vector 1
   * @param {Vector} v2 vector 2
   * @return {number} dot product of v1 and v2
   * @note This is a static class method
   */
  static dot(v1, v2) {
    return v1.x * v2.x + v1.y * v2.y;
  }

  /**
   * @brief distance between two vectors
   * @param {Vector} v1 vector 1
   * @param {Vector} v2 vector 2
   * @return {number} distance between v1 and v2
   * @note This is a static class method
   */
  static distance(v1, v2) {
    return Math.sqrt((v1.x - v2.x) * (v1.x - v2.x) +
        (v1.y - v2.y) * (v1.y - v2.y));
  }

  /**
   * @brief interpolate between two points
   * @param {number} d - the distance
   * @param {Vector} v1 - the first point
   * @param {Vector} v2 - the second point
   * @return {Vector} - the interpolated point
   */
  static interpolate(d, v1, v2) {
    // use trig to find the angle between the two points
    const angle = Math.atan2(v2.y - v1.y, v2.x - v1.x);
    // use the angle to find the x and y components of the vector
    const x = (d * Math.cos(angle)) + v1.x;
    const y = (d * Math.sin(angle)) + v1.y;
    return new Vector(x, y);
  }

  /**
   * @brief get the magnitude of the vector
   * @return {number} magnitude of the vector
   * @note This is a static class method
   */
  get magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
};


// global path
let path;
