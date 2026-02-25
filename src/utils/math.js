/* src/utils/math.js
   Pure math helpers -- no DOM, no canvas, no side effects.
*/
(function () {

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function inverseLerp(a, b, v) {
    return a === b ? 0 : (v - a) / (b - a);
  }

  function mapRange(v, inMin, inMax, outMin, outMax) {
    var t = (v - inMin) / (inMax - inMin);
    return outMin + (outMax - outMin) * t;
  }

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function easeOutQuad(t) {
    return 1 - (1 - t) * (1 - t);
  }

  function easeInQuad(t) {
    return t * t;
  }

  function smoothstep(edge0, edge1, x) {
    var t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
    return t * t * (3 - 2 * t);
  }

  function dampFactor(smoothing, dt) {
    return 1.0 - Math.pow(smoothing, dt);
  }

  function hsl(h, s, l) {
    return 'hsl(' + (h % 360) + ',' + s + '%,' + l + '%)';
  }

  function hsla(h, s, l, a) {
    return 'hsla(' + (h % 360) + ',' + s + '%,' + l + '%,' + a + ')';
  }

  window.StudioMath = {
    clamp: clamp,
    lerp: lerp,
    inverseLerp: inverseLerp,
    mapRange: mapRange,
    easeInOutCubic: easeInOutCubic,
    easeOutQuad: easeOutQuad,
    easeInQuad: easeInQuad,
    smoothstep: smoothstep,
    dampFactor: dampFactor,
    hsl: hsl,
    hsla: hsla
  };
})();
