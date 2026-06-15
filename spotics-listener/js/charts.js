/**
 * Canvas bar chart for dashboard.
 */

function drawTopArtistsChart(artistCounts, topN = 5) {
  const canvas = document.getElementById('top-artists-chart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const sorted = Object.entries(artistCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (sorted.length === 0) {
    ctx.font = '14px Segoe UI';
    ctx.fillStyle = '#b3b3b3';
    ctx.textAlign = 'center';
    ctx.fillText('No data yet', canvas.width / 2, canvas.height / 2);
    return;
  }

  const w = canvas.width;
  const h = canvas.height;
  const padding = { top: 20, bottom: 50, left: 40, right: 20 };
  const chartWidth = w - padding.left - padding.right;
  const chartHeight = h - padding.top - padding.bottom;
  const maxCount = Math.max(...sorted.map(([, count]) => count), 1);
  const barWidth = chartWidth / sorted.length - 10;

  ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--surface').trim() || '#1e1e1e';
  ctx.fillRect(0, 0, w, h);

  sorted.forEach(([artist, count], index) => {
    const barHeight = Math.max((count / maxCount) * chartHeight, 1);
    const x = padding.left + index * (barWidth + 10);
    const y = padding.top + chartHeight - barHeight;

    const gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
    gradient.addColorStop(0, '#1DB954');
    gradient.addColorStop(1, '#168d40');
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, barWidth, barHeight);

    ctx.fillStyle = '#fff';
    ctx.font = '10px Segoe UI';
    ctx.textAlign = 'center';
    ctx.fillText(count, x + barWidth / 2, y - 5);

    ctx.save();
    ctx.translate(x + barWidth / 2, h - padding.bottom + 15);
    ctx.rotate(-0.4);
    ctx.fillStyle = '#b3b3b3';
    ctx.font = '11px Segoe UI';
    ctx.textAlign = 'right';
    ctx.fillText(artist, 0, 0);
    ctx.restore();
  });
}
