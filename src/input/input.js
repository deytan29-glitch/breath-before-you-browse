/* src/input/input.js
   Signal: tap/click to start breath cycle. Also tracks mouseY for level switching.
*/
(function () {
  function setupInput(canvas, canvasState) {
    var state = {
      mouseX: 0.5,
      mouseY: 0.5,
      isPressed: false,
      hasMoved: false
    };

    function updateXY(clientX, clientY) {
      var rect = canvas.getBoundingClientRect();
      var nx = rect.width > 0 ? (clientX - rect.left) / rect.width : 0.5;
      var ny = rect.height > 0 ? (clientY - rect.top) / rect.height : 0.5;
      state.mouseX = StudioMath.clamp(nx, 0, 1);
      state.mouseY = StudioMath.clamp(ny, 0, 1);
      state.hasMoved = true;
    }

    canvas.addEventListener('mousemove', function (e) {
      updateXY(e.clientX, e.clientY);
    }, { passive: true });

    canvas.addEventListener('mousedown', function (e) {
      updateXY(e.clientX, e.clientY);
      state.isPressed = true;
    });
    canvas.addEventListener('mouseup', function () {
      state.isPressed = false;
    });
    canvas.addEventListener('mouseleave', function () {
      state.isPressed = false;
    });

    canvas.addEventListener('touchstart', function (e) {
      if (e.touches && e.touches.length > 0) {
        state.isPressed = true;
        updateXY(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    canvas.addEventListener('touchmove', function (e) {
      if (e.touches && e.touches.length > 0) {
        updateXY(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    canvas.addEventListener('touchend', function () {
      state.isPressed = false;
    }, { passive: true });

    return state;
  }

  window.StudioInput = { setupInput: setupInput };
})();
