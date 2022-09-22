/* eslint-disable no-unused-vars */
/* eslint-disable prefer-const */


// sliders
const lookaheadSlider = document.getElementById('lookahead');
const decelSlider = document.getElementById('decel');
const maxSpeedSlider = document.getElementById('maxSpeed');
const curveMultiplierSlider = document.getElementById('multiplier');
const precisionSlider = document.getElementById('precision');
const inchesPerPointSlider = document.getElementById('inchesPerPoint');
const trackWidthSlider = document.getElementById('trackWidth');
const deactivateDistSlider = document.getElementById('deactivate');

const lFSlider = document.getElementById('lF');
const lASlider = document.getElementById('lA');
const lJSlider = document.getElementById('lJ');
const lPSlider = document.getElementById('lP');
const lISlider = document.getElementById('lI');
const lDSlider = document.getElementById('lD');
const lBSlider = document.getElementById('lB');
const lGSlider = document.getElementById('lG');

const rFSlider = document.getElementById('rF');
const rASlider = document.getElementById('rA');
const rJSlider = document.getElementById('rJ');
const rPSlider = document.getElementById('rP');
const rISlider = document.getElementById('rI');
const rDSlider = document.getElementById('rD');
const rBSlider = document.getElementById('rB');
const rGSlider = document.getElementById('rG');

// buttons
const downloadBtn = document.getElementById('downloadBtn');
const uploadBtn = document.getElementById('uploadBtn');

// user settings
let lookahead = 0.5; // lookahead
let decel = 0.5; // deceleration
let maxSpeed = 62.8318530718; // inches per second
let curvatureMultiplier = 50; // robot speed over sharp curves, range from 1 - 5
let precision = 100; // how many raw points to generate per spline
let inchesPerPoint = 2; // this will be approximated
let trackWidth = 18; // inches
let controlPointRadius = 2; // radius of control points in inches
let deactivateDist = 0.5; // dist from the last point to deactivate the robot

// PID constants
let lF = 0;
let lA = 0;
let lJ = 0;
let lP = 0;
let lI = 0;
let lD = 0;
let lB = 0;
let lG = 0;

let rF = 0;
let rA = 0;
let rJ = 0;
let rP = 0;
let rI = 0;
let rD = 0;
let rB = 0;
let rG = 0;
