/* eslint-disable no-unused-vars */
/* eslint-disable prefer-const */
// sliders
const lookaheadSlider = document.getElementById('lookahead');
const accelSlider = document.getElementById('accel');
const decelSlider = document.getElementById('decel');
const maxSpeedSlider = document.getElementById('maxSpeed');
const curveMultiplierSlider = document.getElementById('multiplier');
const kVSlider = document.getElementById('kV');
const kASlider = document.getElementById('kA');
const kPSlider = document.getElementById('kP');
const precisionSlider = document.getElementById('precision');
const inchesPerPointSlider = document.getElementById('inchesPerPoint');

// buttons
const downloadBtn = document.getElementById('downloadBtn');
const uploadBtn = document.getElementById('uploadBtn');

// user settings
let lookahead = 0.5;
let accel = 0.5;
let decel = 0.5;
let maxSpeed = 62.8318530718; // inches per second
let curvatureMultiplier = 50; // robot speed over sharp curves, range from 1 - 5
let kV = 0.5; // velocity gain
let kA = 0.5; // acceleration gain
let kP = 0.5; // position gain
let precision = 100; // how many raw points to generate per spline
let inchesPerPoint = 2; // this will be approximated

let controlPointRadius = 2; // radius of control points in inches
