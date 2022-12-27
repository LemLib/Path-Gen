/**
 * Path settings
 */
const spacing = 2; // target inches between points
const curvatureMultiplier = 100;
const decel = 100;
const maxSpeed = 100;


/**
 * Graphics settings
 */
const imgTrueWidth = 147.8377757; // the width of the image in inches
const img = new Image; // background image
img.src = 'images/field.png';
const fps = 60; // how many frames to render each second


/**
 * Accessibility settings
 */
const pointRadius = 0.5;
const pointBorderWidth = 0;
const lineWidth = 0.5;
const controlPointColor = 'rgba(50, 161, 68, 0.452)';
const controlPointRadius = 5;
const controlPointBorderColor = 'rgba(50, 161, 68, 0.452)';
const controlPointBorderWidth = 0;
const controlLineWidth = 0.5;
const controlLineColor = 'black';
