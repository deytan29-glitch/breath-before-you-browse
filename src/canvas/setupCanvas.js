/* src/canvas/setupCanvas.js
   HiDPI canvas setup + safe resize.
*/
(function () {
  function setupCanvas(canvas) {
    var ctx = canvas.getContext('2d', { alpha: false });

    var state = {
      canvas: canvas,
      ctx: ctx,
      dpr: window.devicePixelRatio || 1,
      width: 0,
      height: 0
    };

    function resize() {
      state.dpr = window.devicePixelRatio || 1;
      state.width = window.innerWidth;
      state.height = window.innerHeight;

      canvas.width = Math.floor(state.width * state.dpr);
      canvas.height = Math.floor(state.height * state.dpr);

      ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);

      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }

    window.addEventListener('resize', resize, { passive: true });
    resize();

    return state;
  }

  window.StudioCanvas = window.StudioCanvas || {};
  window.StudioCanvas.setupCanvas = setupCanvas;
})();
