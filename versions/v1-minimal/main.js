/* main.js
   Entry point: wires together canvas + input + loop.
   Rule: keep this file simple. Put real logic in /src.
*/
(function () {
  var canvas = document.getElementById('canvas');
  var canvasState = StudioCanvas.setupCanvas(canvas);
  var input = StudioInput.setupInput(canvas, canvasState);
  StudioCanvas.startLoop(canvasState, input);
})();
