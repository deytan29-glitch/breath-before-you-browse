/* src/canvas/loop.js — v1 minimal
   Breath Before You Browse — simplest version.
   One white circle, no color, no ring, no counter. Pure breath.
   States: IDLE → INHALE → HOLD → EXHALE → REFLECT → IDLE
*/
(function () {
  function startLoop(canvasState, input) {
    var ctx = canvasState.ctx;
    var last = performance.now();

    var IDLE = 0, INHALE = 1, HOLD = 2, EXHALE = 3, REFLECT = 4;
    var phase = IDLE, phaseTime = 0, wasPressed = false, idleTime = 0;

    var INHALE_DUR = 4.0, HOLD_DUR = 4.0, EXHALE_DUR = 6.0, REFLECT_DUR = 5.0;
    var REST_SCALE = 0.08, FULL_SCALE = 0.28;

    function frame(now) {
      var dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      var w = canvasState.width, h = canvasState.height;
      var cx = w / 2, cy = h / 2, unit = Math.min(w, h);

      var clicked = input.isPressed && !wasPressed;
      wasPressed = input.isPressed;

      if (clicked && (phase === IDLE || phase === REFLECT)) {
        phase = INHALE; phaseTime = 0;
      }
      phaseTime += dt; idleTime += dt;

      if (phase === INHALE && phaseTime >= INHALE_DUR) { phase = HOLD; phaseTime = 0; }
      else if (phase === HOLD && phaseTime >= HOLD_DUR) { phase = EXHALE; phaseTime = 0; }
      else if (phase === EXHALE && phaseTime >= EXHALE_DUR) { phase = REFLECT; phaseTime = 0; }
      else if (phase === REFLECT && phaseTime >= REFLECT_DUR) { phase = IDLE; phaseTime = 0; }

      var dur = phase === INHALE ? INHALE_DUR : phase === HOLD ? HOLD_DUR : phase === EXHALE ? EXHALE_DUR : phase === REFLECT ? REFLECT_DUR : 1;
      var progress = StudioMath.clamp(phaseTime / dur, 0, 1);
      var minR = unit * REST_SCALE, maxR = unit * FULL_SCALE;
      var radius, alpha;

      if (phase === IDLE) {
        radius = minR * (1.0 + Math.sin(idleTime * 0.8 * Math.PI * 2) * 0.06);
        alpha = 0.25 + Math.sin(idleTime * 0.8 * Math.PI * 2) * 0.05;
      } else if (phase === INHALE) {
        var e = StudioMath.easeInOutCubic(progress);
        radius = StudioMath.lerp(minR, maxR, e);
        alpha = StudioMath.lerp(0.25, 0.55, e);
      } else if (phase === HOLD) {
        radius = maxR * (1.0 + Math.sin(progress * Math.PI) * 0.02);
        alpha = 0.55;
      } else if (phase === EXHALE) {
        var e = StudioMath.easeInOutCubic(progress);
        radius = StudioMath.lerp(maxR, minR, e);
        alpha = StudioMath.lerp(0.55, 0.25, e);
      } else {
        radius = minR; alpha = 0.25;
      }

      ctx.clearRect(0, 0, w, h);

      var bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, unit * 0.7);
      bgGrad.addColorStop(0, 'rgb(14, 13, 12)');
      bgGrad.addColorStop(1, 'rgb(5, 5, 5)');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(215, 205, 190, ' + alpha + ')';
      ctx.fill();

      var label = '', textAlpha = 0;
      var fontSize = Math.max(13, unit * 0.024);

      if (phase === IDLE) {
        label = 'tap to breathe';
        textAlpha = 0.22 + Math.sin(idleTime * 0.4 * Math.PI * 2) * 0.08;
      } else if (phase === INHALE) {
        label = 'breathe in';
        textAlpha = StudioMath.lerp(0.0, 0.55, StudioMath.clamp(phaseTime / 0.8, 0, 1));
      } else if (phase === HOLD) {
        label = 'hold';
        textAlpha = 0.45;
      } else if (phase === EXHALE) {
        label = 'breathe out';
        textAlpha = 0.55;
      } else if (phase === REFLECT) {
        label = 'still want to continue?';
        var fadeIn = StudioMath.clamp(phaseTime / 1.5, 0, 1);
        textAlpha = StudioMath.easeInOutCubic(fadeIn) * 0.5;
      }

      ctx.save();
      ctx.fillStyle = 'rgba(210, 200, 185, ' + textAlpha + ')';
      ctx.font = fontSize + 'px system-ui, -apple-system, "Segoe UI", Roboto, Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(label, cx, cy + maxR + unit * 0.05);
      ctx.restore();

      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  window.StudioCanvas = window.StudioCanvas || {};
  window.StudioCanvas.startLoop = startLoop;
})();
