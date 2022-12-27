'use strict';


/**
 * @brief initialization
 */
window.onload = function() {
  // start rendering
  setInterval(render, 1000/fps);
  // create a starting path
  let p0 = new Vector(-32.3, -6.3);
  let p1 = new Vector(-41, 49);
  let p2 = new Vector(-42, 52);
  let p3 = new Vector(5.2, 6.12);
  path = new Path(new Spline(p0, p1, p2, p3));
};
