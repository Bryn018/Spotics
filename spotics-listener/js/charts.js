/**
 * Spotics — Chart Rendering Module
 * Canvas-based bar charts for dashboard visualizations.
 */
(function (global) {
  'use strict';

  /**
   * Draw a horizontal bar chart on a canvas element.
   */
  function drawBarChart(canvasId, data, options) {
    options = options || {};
    var canvas = document.getElementById(canvasId);
    if (!canvas) return;

    var ctx = canvas.getContext('2d');
    var sorted = data.slice().sort(function (a, b) { return b.value - a.value; });
    var topN = options.topN || 5;
    sorted = sorted.slice(0, topN);

    // Handle high-DPI displays
    var dpr = window.devicePixelRatio || 1;
    var rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    var w = rect.width;
    var h = rect.height;
    ctx.clearRect(0, 0, w, h);

    if (!sorted.length) {
      ctx.font = '14px DM Sans, system-ui, sans-serif';
      ctx.fillStyle = '#8888AA';
      ctx.textAlign = 'center';
      ctx.fillText('No data yet', w / 2, h / 2);
      return;
    }

    var padding = { top: 20, bottom: 50, left: 40, right: 20 };
    var chartW = w - padding.left - padding.right;
    var chartH = h - padding.top - padding.bottom;
    var maxVal = Math.max.apply(null, sorted.map(function (d) { return d.value; })) || 1;
    var barW = chartW / sorted.length - 10;

    // Background
    var bgColor = getComputedStyle(document.body).getPropertyValue('--surface').trim() || '#111118';
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, w, h);

    var accent = getComputedStyle(document.body).getPropertyValue('--accent').trim() || '#8B5CF6';
    var accent2 = getComputedStyle(document.body).getPropertyValue('--accent2').trim() || '#A78BFA';
    var textColor = getComputedStyle(document.body).getPropertyValue('--text').trim() || '#F0F0FF';
    var text3Color = getComputedStyle(document.body).getPropertyValue('--text3').trim() || '#4A4A6A';

    sorted.forEach(function (item, i) {
      var barH = Math.max((item.value / maxVal) * chartH, 1);
      var x = padding.left + i * (barW + 10);
      var y = padding.top + chartH - barH;

      var grad = ctx.createLinearGradient(x, y, x, y + barH);
      grad.addColorStop(0, accent);
      grad.addColorStop(1, accent2);
      ctx.fillStyle = grad;
      ctx.fillRect(x, y, barW, barH);

      // Count label
      ctx.fillStyle = textColor;
      ctx.font = '10px DM Sans, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(String(item.value), x + barW / 2, y - 5);

      // Name label (rotated)
      ctx.save();
      ctx.translate(x + barW / 2, h - padding.bottom + 15);
      ctx.rotate(-0.4);
      ctx.fillStyle = text3Color;
      ctx.font = '11px DM Sans, system-ui, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(item.label || '', 0, 0);
      ctx.restore();
    });
  }

  global.charts = { drawBarChart };
})(window);
