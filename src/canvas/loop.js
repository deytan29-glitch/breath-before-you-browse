/* src/canvas/loop.js — v3 vivid
   Breath Before You Browse — richly colored breath pacer.
   Features: gradient-filled circle, layered background with shifting hues,
   ambient halo, progress ring, session counter, countdown, 3 breathing levels.
   States: IDLE → INHALE → HOLD → EXHALE → REFLECT → IDLE
   Annotation: The circle radius is driven by a 5-state machine. Each phase
   has a primary + accent hue that blend through the background gradient and
   circle fill. An ambient halo breathes behind the circle. The progress ring
   has a glow track. All visuals map directly to the breath state.
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
    var REST_SCALE = 0.09, FULL_SCALE = 0.27;

    var phaseStyles = [
      { ph: 28,  ah: 280, s: 18, l: 10 },
      { ph: 190, ah: 160, s: 52, l: 16 },
      { ph: 155, ah: 210, s: 45, l: 14 },
      { ph: 30,  ah: 350, s: 50, l: 14 },
      { ph: 270, ah: 220, s: 20, l: 10 }
    ];

    var sPH = 28, sAH = 280, sSat = 18, sLit = 10;

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
          if (input.mouseY > 0.78) {
            currentLevel = (currentLevel + 1) % levels.length;
          } else {
            phase = INHALE; phaseTime = 0;
          }
        } else if (phase === REFLECT) {
          phase = INHALE; phaseTime = 0;
        }
      }

      phaseTime += dt;
      idleTime += dt;

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

      var target = phaseStyles[phase];
      var cDamp = StudioMath.dampFactor(0.00003, dt);
      sPH = StudioMath.lerp(sPH, target.ph, cDamp);
      sAH = StudioMath.lerp(sAH, target.ah, cDamp);
      sSat = StudioMath.lerp(sSat, target.s, cDamp);
      sLit = StudioMath.lerp(sLit, target.l, cDamp);

      var minR = unit * REST_SCALE, maxR = unit * FULL_SCALE;
      var radius;

      if (phase === IDLE) {
        radius = minR * (1.0 + Math.sin(idleTime * 0.65 * Math.PI * 2) * 0.07);
      } else if (phase === INHALE) {
        radius = StudioMath.lerp(minR, maxR, StudioMath.easeInOutCubic(progress));
      } else if (phase === HOLD) {
        radius = maxR * (1.0 + Math.sin(progress * Math.PI) * 0.025);
      } else if (phase === EXHALE) {
        radius = StudioMath.lerp(maxR, minR, StudioMath.easeInOutCubic(progress));
      } else {
        radius = minR;
      }

      var intensity;
      if (phase === IDLE) intensity = 0.0;
      else if (phase === INHALE) intensity = StudioMath.easeInOutCubic(progress);
      else if (phase === HOLD) intensity = 1.0;
      else if (phase === EXHALE) intensity = 1.0 - StudioMath.easeInOutCubic(progress);
      else intensity = 0.0;

      ctx.clearRect(0, 0, w, h);

      // -- Background --
      var bg1 = ctx.createRadialGradient(cx, cy, 0, cx, cy, unit * 0.95);
      bg1.addColorStop(0, StudioMath.hsl(sPH, sSat * 0.7, sLit + intensity * 4));
      bg1.addColorStop(0.35, StudioMath.hsl(sPH + 15, sSat * 0.45, sLit * 0.6 + intensity * 2));
      bg1.addColorStop(0.7, StudioMath.hsl(sAH, sSat * 0.25, sLit * 0.3 + intensity * 1));
      bg1.addColorStop(1, StudioMath.hsl(sAH + 20, sSat * 0.12, 2));
      ctx.fillStyle = bg1;
      ctx.fillRect(0, 0, w, h);

      // -- Ambient halo --
      var haloRadius = radius * (1.8 + intensity * 0.6);
      var haloAlpha = 0.04 + intensity * 0.1;
      var haloGrad = ctx.createRadialGradient(cx, cy, radius * 0.5, cx, cy, haloRadius);
      haloGrad.addColorStop(0, StudioMath.hsla(sPH, sSat + 10, 45 + intensity * 15, haloAlpha));
      haloGrad.addColorStop(0.5, StudioMath.hsla(sPH + 20, sSat, 30 + intensity * 10, haloAlpha * 0.5));
      haloGrad.addColorStop(1, StudioMath.hsla(sAH, sSat * 0.3, 15, 0));
      ctx.fillStyle = haloGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, haloRadius, 0, Math.PI * 2);
      ctx.fill();

      // -- Progress ring --
      if (phase !== IDLE) {
        var ringRadius = radius + unit * 0.04;
        var ringWidth = Math.max(2.5, unit * 0.008);
        var startAngle = -Math.PI / 2;
        var sweepAngle = startAngle + progress * Math.PI * 2;

        ctx.beginPath();
        ctx.arc(cx, cy, ringRadius, 0, Math.PI * 2);
        ctx.strokeStyle = StudioMath.hsla(sPH, sSat * 0.3, 25, 0.1);
        ctx.lineWidth = ringWidth;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(cx, cy, ringRadius, startAngle, sweepAngle);
        ctx.strokeStyle = StudioMath.hsla(sPH, sSat + 15, 55 + intensity * 15, 0.15);
        ctx.lineWidth = ringWidth * 3;
        ctx.lineCap = 'round';
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(cx, cy, ringRadius, startAngle, sweepAngle);
        ctx.strokeStyle = StudioMath.hsla(sPH, sSat + 20, 65 + intensity * 15, 0.55 + intensity * 0.3);
        ctx.lineWidth = ringWidth * 1.5;
        ctx.lineCap = 'round';
        ctx.stroke();
      }

      // -- Main circle (gradient fill) --
      var coreLight = StudioMath.lerp(55, 88, intensity);
      var edgeLight = StudioMath.lerp(30, 55, intensity);
      var coreSat = StudioMath.lerp(8, sSat + 15, intensity);
      var edgeSat = StudioMath.lerp(5, sSat + 25, intensity);
      var coreAlpha = StudioMath.lerp(0.15, 0.6, intensity);
      var edgeAlpha = StudioMath.lerp(0.08, 0.35, intensity);

      if (phase === IDLE) {
        var p = Math.sin(idleTime * 0.65 * Math.PI * 2);
        coreAlpha = 0.15 + p * 0.04;
        edgeAlpha = 0.08 + p * 0.02;
      }

      var circGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      circGrad.addColorStop(0, StudioMath.hsla(sPH - 10, coreSat * 0.4, coreLight, coreAlpha));
      circGrad.addColorStop(0.4, StudioMath.hsla(sPH, coreSat, coreLight * 0.85, coreAlpha * 0.9));
      circGrad.addColorStop(0.8, StudioMath.hsla(sPH + 15, edgeSat, edgeLight, edgeAlpha));
      circGrad.addColorStop(1, StudioMath.hsla(sAH, edgeSat * 0.6, edgeLight * 0.7, edgeAlpha * 0.4));
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = circGrad;
      ctx.fill();

      if (intensity > 0.1) {
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.strokeStyle = StudioMath.hsla(sPH, sSat + 10, 70, intensity * 0.2);
        ctx.lineWidth = Math.max(1, unit * 0.002);
        ctx.stroke();
      }

      // -- Text --
      var fontSize = Math.max(14, unit * 0.028);
      var smallFont = Math.max(11, unit * 0.019);
      var textY = cy + maxR + unit * 0.09;

      var label = '', textAlpha = 0;

      if (phase === IDLE) {
        label = 'tap to breathe';
        textAlpha = 0.2 + Math.sin(idleTime * 0.4 * Math.PI * 2) * 0.06;
      } else if (phase === INHALE) {
        label = 'breathe in';
        textAlpha = StudioMath.lerp(0.0, 0.65, StudioMath.clamp(phaseTime / 0.6, 0, 1));
      } else if (phase === HOLD) {
        label = 'hold';
        textAlpha = 0.55;
      } else if (phase === EXHALE) {
        label = 'breathe out';
        textAlpha = 0.65;
      } else if (phase === REFLECT) {
        label = 'still want to continue?';
        var fadeIn = StudioMath.clamp(phaseTime / 1.5, 0, 1);
        textAlpha = StudioMath.easeInOutCubic(fadeIn) * 0.6;
      }

      ctx.save();
      ctx.fillStyle = StudioMath.hsla(sPH + 30, 12, 88, textAlpha);
      ctx.font = fontSize + 'px system-ui, -apple-system, "Segoe UI", Roboto, Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(label, cx, textY);
      ctx.restore();

      if (phase === INHALE || phase === HOLD || phase === EXHALE) {
        var remaining = Math.ceil(dur - phaseTime);
        ctx.save();
        ctx.fillStyle = StudioMath.hsla(sPH, 10, 82, 0.35);
        ctx.font = smallFont + 'px system-ui, -apple-system, "Segoe UI", Roboto, Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(remaining + 's', cx, textY + fontSize + unit * 0.02);
        ctx.restore();
      }

      if (breathCount > 0) {
        var counterText = breathCount === 1 ? '1 breath' : breathCount + ' breaths';
        ctx.save();
        ctx.fillStyle = StudioMath.hsla(sPH, 10, 75, 0.16);
        ctx.font = smallFont + 'px system-ui, -apple-system, "Segoe UI", Roboto, Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(counterText, cx, unit * 0.05);
        ctx.restore();
      }

      if (phase === IDLE) {
        var levText = levels[currentLevel].name + '  '
          + levels[currentLevel].inhale + '-'
          + levels[currentLevel].hold + '-'
          + levels[currentLevel].exhale;
        var levY = h - unit * 0.08;

        ctx.save();
        ctx.fillStyle = StudioMath.hsla(sPH, 14, 72, 0.22);
        ctx.font = smallFont + 'px system-ui, -apple-system, "Segoe UI", Roboto, Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(levText, cx, levY);

        ctx.fillStyle = StudioMath.hsla(sPH, 8, 65, 0.12);
        ctx.font = (smallFont * 0.85) + 'px system-ui, -apple-system, "Segoe UI", Roboto, Arial';
        ctx.fillText('tap here to change', cx, levY + smallFont * 1.3);
        ctx.restore();

        var dotSpacing = unit * 0.024;
        var dotY = levY - smallFont * 1.1;
        for (var d = 0; d < levels.length; d++) {
          var dotX = cx + (d - 1) * dotSpacing;
          ctx.beginPath();
          ctx.arc(dotX, dotY, unit * 0.005, 0, Math.PI * 2);
          ctx.fillStyle = d === currentLevel
            ? StudioMath.hsla(sPH, 40, 72, 0.55)
            : StudioMath.hsla(sPH, 8, 45, 0.18);
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
