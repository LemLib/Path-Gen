window.onload = function() {
  const canvas = document.getElementById('myCanvas');
  const ctx = canvas.getContext('2d');
  const img = document.getElementById('scream');
  ctx.drawImage(img, 10);
};
