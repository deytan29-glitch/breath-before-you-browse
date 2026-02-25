/* src/canvas/loop.js — v2 enhanced
   Breath Before You Browse — phase-colored, progress ring, levels, counter.
   States: IDLE → INHALE → HOLD → EXHALE → REFLECT → IDLE
*/
(function () {
  function startLoop(canvasState, input) {
    var ctx = canvasState.ctx;
    var last = performance.now();

    var IDLE = 0, INHALE = 1, HOLD = 2, EXHALE = 3, REFLECT = 4;

    var levels = [
      { name: 'calm',    inhale: 4, hold: 4, exhale: 6  },
      { name: 'balance', inhale: 4, hold: 7, exhale: 8  },
      { name: 'deep',    inhale: 5, hold: 5, exhale: 8  }
    ];
    var currentLevel = 0;
    var phase = IDLE, phaseTime = 0, wasPressed = false, idleTime = 0, breathCount = 0;
    var REFLECT_DUR = 5.0;
    var REST_SCALE = 0.09, FULL_SCALE = 0.26;

    var phaseColors = [
      { h: 30,  s: 15, l: 12 },
      { h: 185, s: 35, l: 18 },
      { h: 165, s: 30, l: 16 },
      { h: 35,  s: 32, l: 16 },
      { h: 25,  s: 12, l: 12 }
    ];

    var smoothHue = 30, smoothSat = 15, smoothLit = 12;

    function frame(now) {
      var dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      var w = canvasState.width, h = canvasState.height;
      var cx = w / 2, cy = h / 2, unit = Math.min(w, h);
      var lev = levels[currentLevel];

      var clicked = input.isPressed && !wasPressed;
      wasPressed = input.isPressed;

      if (clicked) {
        if (phase === IDLE) {
          if (input.mouseY > 0.78) { currentLevel = (currentLevel + 1) % levels.length; }
          else { phase = INHALE; phaseTime = 0; }
        } else if (phase === REFLECT) { phase = INHALE; phaseTime = 0; }
      }

      phaseTime += dt; idleTime += dt;

      var dur = 1;
      if (phase === INHALE) dur = lev.inhale;
      else if (phase === HOLD) dur = lev.hold;
      else if (phase === EXHALE) dur = lev.exhale;
      else if (phase === REFLECT) dur = REFLECT_DUR;

      if (phase === INHALE && phaseTime >= lev.inhale) { phase = HOLD; phaseTime = 0; }
      else if (phase === HOLD && phaseTime >= lev.hold) { phase = EXHALE; phaseTime = 0; }
      else if (phase === EXHALE && phaseTime >= lev.exhale) { phase = REFLECT; phaseTime = 0; breathCount++; }
      else if (phase === REFLECT && phaseTime >= REFLECT_DUR) { phase = IDLE; phaseTime = 0; }

      if (phase === INHALE) dur = lev.inhale;
      else if (phase === HOLD) dur = lev.hold;
      else if (phase === EXHALE) dur = lev.exhale;
      else if (phase === REFLECT) dur = REFLECT_DUR;
      else dur = 1;

      var progress = StudioMath.clamp(phaseTime / dur, 0, 1);

      var targetColor = phaseColors[phase];
      var colorDamp = StudioMath.dampFactor(0.00005, dt);
      smoothHue = StudioMath.lerp(smoothHue, targetColor.h, colorDamp);
      smoothSat = StudioMath.lerp(smoothSat, targetColor.s, colorDamp);
      smoothLit = StudioMath.lerp(smoothLit, targetColor.l, colorDamp);

      var minR = unit * REST_SCALE, maxR = unit * FULL_SCALE;
      var radius;

      if (phase === IDLE) {
        radius = minR * (1.0 + Math.sin(idleTime * 0.7 * Math.PI * 2) * 0.06);
      } else if (phase === INHALE) {
        radius = StudioMath.lerp(minR, maxR, StudioMath.easeInOutCubic(progress));
      } else if (phase === HOLD) {
        radius = maxR * (1.0 + Math.sin(progress * Math.PI) * 0.02);
      } else if (phase === EXHALE) {
        radius = StudioMath.lerp(maxR, minR, StudioMath.easeInOutCubic(progress));
      } else { radius = minR; }

      var circleHue = smoothHue;
      var circleSat, circleLight, circleAlpha;

      if (phase === IDLE) {
        circleSat = 10; circleLight = 72;
        circleAlpha = 0.18 + Math.sin(idleTime * 0.7 * Math.PI * 2) * 0.04;
      } else if (phase === INHALE) {
        var e = StudioMath.easeInOutCubic(progress);
        circleSat = StudioMath.lerp(15, 40, e);
        circleLight = StudioMath.lerp(72, 78, e);
        circleAlpha = StudioMath.lerp(0.2, 0.5, e);
      } else if (phase === HOLD) {
        circleSat = 38; circleLight = 78;
        circleAlpha = 0.48 + Math.sin(progress * Math.PI) * 0.04;
      } else if (phase === EXHALE) {
        var e = StudioMath.easeInOutCubic(progress);
        circleSat = StudioMath.lerp(38, 15, e);
        circleLight = StudioMath.lerp(78, 72, e);
        circleAlpha = StudioMath.lerp(0.5, 0.2, e);
      } else { circleSat = 10; circleLight = 72; circleAlpha = 0.18; }

      ctx.clearRect(0, 0, w, h);

      var bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, unit * 0.8);
      bgGrad.addColorStop(0, StudioMath.hsl(smoothHue, smoothSat * 0.6, smoothLit));
      bgGrad.addColorStop(0.6, StudioMath.hsl(smoothHue + 10, smoothSat * 0.3, smoothLit * 0.5));
      bgGrad.addColorStop(1, StudioMath.hsl(smoothHue + 15, smoothSat * 0.15, 3));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      if (phase !== IDLE) {
        var ringRadius = radius + unit * 0.035;
        var ringWidth = Math.max(2, unit * 0.006);
        var startAngle = -Math.PI / 2;
        var sweepAngle = startAngle + progress * Math.PI * 2;

        ctx.beginPath();
        ctx.arc(cx, cy, ringRadius, 0, Math.PI * 2);
        ctx.strokeStyle = StudioMath.hsla(smoothHue, smoothSat * 0.4, 30, 0.12);
        ctx.lineWidth = ringWidth;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(cx, cy, ringRadius, startAngle, sweepAngle);
        ctx.strokeStyle = StudioMath.hsla(circleHue, circleSat + 10, circleLight + 8, circleAlpha * 0.9);
        ctx.lineWidth = ringWidth * 1.5;
        ctx.lineCap = 'round';
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = StudioMath.hsla(circleHue, circleSat, circleLight, circleAlpha);
      ctx.fill();

      var fontSize = Math.max(13, unit * 0.026);
      var smallFont = Math.max(11, unit * 0.018);
      var textY = cy + maxR + unit * 0.08;
      var label = '', textAlpha = 0;

      if (phase === IDLE) {
        label = 'tap to breathe';
        textAlpha = 0.2 + Math.sin(idleTime * 0.4 * Math.PI * 2) * 0.06;
      } else if (phase === INHALE) {
        label = 'breathe in';
        textAlpha = StudioMath.lerp(0.0, 0.6, StudioMath.clamp(phaseTime / 0.6, 0, 1));
      } else if (phase === HOLD) {
        label = 'hold'; textAlpha = 0.5;
      } else if (phase === EXHALE) {
        label = 'breathe out'; textAlpha = 0.6;
      } else if (phase === REFLECT) {
        label = 'still want to continue?';
        textAlpha = StudioMath.easeInOutCubic(StudioMath.clamp(phaseTime / 1.5, 0, 1)) * 0.55;
      }

      ctx.save();
      ctx.fillStyle = StudioMath.hsla(smoothHue + 20, 10, 85, textAlpha);
      ctx.font = fontSize + 'px system-ui, -apple-system, "Segoe UI", Roboto, Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(label, cx, textY);
      ctx.restore();

      if (phase === INHALE || phase === HOLD || phase === EXHALE) {
        ctx.save();
        ctx.fillStyle = StudioMath.hsla(smoothHue, 8, 80, 0.35);
        ctx.font = smallFont + 'px system-ui, -apple-system, "Segoe UI", Roboto, Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(Math.ceil(dur - phaseTime) + 's', cx, textY + fontSize + unit * 0.02);
        ctx.restore();
      }

      if (breathCount > 0) {
        ctx.save();
        ctx.fillStyle = StudioMath.hsla(smoothHue, 8, 75, 0.18);
        ctx.font = smallFont + 'px system-ui, -apple-system, "Segoe UI", Roboto, Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(breathCount === 1 ? '1 breath' : breathCount + ' breaths', cx, unit * 0.05);
        ctx.restore();
      }

      if (phase === IDLE) {
        var levText = levels[currentLevel].name + '  ' + levels[currentLevel].inhale + '-' + levels[currentLevel].hold + '-' + levels[currentLevel].exhale;
        var levY = h - unit * 0.08;
        ctx.save();
        ctx.fillStyle = StudioMath.hsla(smoothHue, 10, 70, 0.22);
        ctx.font = smallFont + 'px system-ui, -apple-system, "Segoe UI", Roboto, Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(levText, cx, levY);
        ctx.fillStyle = StudioMath.hsla(smoothHue, 8, 65, 0.13);
        ctx.font = (smallFont * 0.85) + 'px system-ui, -apple-system, "Segoe UI", Roboto, Arial';
        ctx.fillText('tap here to change', cx, levY + smallFont * 1.3);
        ctx.restore();

        var dotSpacing = unit * 0.022;
        var dotY = levY - smallFont * 1.1;
        for (var d = 0; d < levels.length; d++) {
          ctx.beginPath();
          ctx.arc(cx + (d - 1) * dotSpacing, dotY, unit * 0.004, 0, Math.PI * 2);
          ctx.fillStyle = d === currentLevel ? StudioMath.hsla(smoothHue, 25, 70, 0.45) : StudioMath.hsla(smoothHue, 8, 50, 0.18);
          ctx.fill();
        }
      }

      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  window.StudioCanvas = window.StudioCanvas || {};
  window.StudioCanvas.startLoop = startLoop;
})();
