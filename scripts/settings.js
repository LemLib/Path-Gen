/**
 * Global objects
 */
const lookaheadSlider = document.getElementById('lookaheadSlider');
const trackWidthSlider = document.getElementById('trackWidthSlider');
const decelerationSlider = document.getElementById('decelerationSlider');
const maxSpeedSlider = document.getElementById('maxSpeedSlider');
const multiplierSlider = document.getElementById('multiplierSlider');
const deactivateSlider = document.getElementById('deactivateSlider');
let path;
let highlightList = [];
let highlightCircles = [];


/**
 * Path settings
 */
const spacing = 2; // target inches between points


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
const pointRadius = 1;
const pointBorderWidth = 0;
const lineWidth = 1;
const controlPointColor = 'rgba(50, 161, 68, 0.452)';
const controlPointRadius = 5;
const controlPointBorderColor = 'rgba(50, 161, 68, 0.452)';
const controlPointBorderWidth = 0;
const controlLineWidth = 0.5;
const controlLineColor = 'black';
