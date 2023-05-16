'use strict';


/**
 * @brief initialization
 */
window.onload = function() {
  // create a starting path
  let p0 = new Vector(-20, 10);
  let p1 = new Vector(-55, 53);
  let p2 = new Vector(-45, 62);
  let p3 = new Vector(-5, 62);
  path = new Path(new Spline(p0, p1, p2, p3));
  // start rendering
  setInterval(render, 1000/fps);
};
