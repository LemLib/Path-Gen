/**
 * @brief robot class
 */
class Robot {
  /**
   * @brief constructor
   * @param {Number} x - the x position
   * @param {Number} y - the y position
   * @param {Number} heading - the heading, in degrees
   * @param {Number} trackWidth - the track width of te robot
   */
  constructor(x, y, heading, trackWidth) {
    this.x = x;
    this.y = y;
    this.heading = heading;
    this.trackWidth = trackWidth;
  };


  /**
   * @brief returns position of the robot
   * @return {Point} - robot position
   */
  getPosition() {
    const p = new Point(this.x, this.y);
    return p;
  };


  /**
   * @brief returns the heading of the robot
   * @param {boolean} isRadians - whether to return in radians or not
   * @return {Number} - the heading of the robot
   */
  getHeading(isRadians) {
    return this.heading;
  };


  /**
   * @brief move the robot "wheels"
   * @param {Number} leftSpeed - left speed in inches/s
   * @param {Number} rightSpeed - right speed in inches/s
   */
  moveWheels(leftSpeed, rightSpeed) {
    // do something here
  };
};
