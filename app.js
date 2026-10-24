'use strict';
const STORAGE_KEY = 'wattwise-readings-v1';
const TARGET_KEY = 'wattwise-target-v1';
const TARIFF_RUPEES_PER_KWH = 8;
const $ = (selector) => document.querySelector(selector);
const todayISO = () => new Date().toISOString().slice(0, 10);
const dateFromDaysAgo = (days) => { const d = new Date(); d.setDate(d.getDate() - days); return d.toISOString().slice(0, 10); };
let readings = loadReadings();
let dailyTarget = Number(localStorage.getItem(TARGET_KEY)) || 10;
let toastTimer;
function loadReadings() {
  try { const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); return Array.isArray(value) ? value.filter(r => r && /^\d{4}-\d{2}-\d{2}$/.test(r.date) && Number.isFinite(Number(r.kwh))) : []; }
  catch { return []; }
}
function persist() { localStorage.setItem(STORAGE_KEY, JSON.stringify(readings)); }
function sortedReadings() { return [...readings].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id)); }
function escapeHTML(value) { return String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])); }
function fmtDate(iso, options = { day: 'numeric', month: 'short' }) { return new Date(iso + 'T12:00:00').toLocaleDateString(undefined, options); }
function showToast(message) { const toast = $('#toast'); toast.textContent = message; toast.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('show'), 2500); }
function render() { renderMetrics(); renderChart(); renderRows(); renderTarget(); renderTips(); }
function renderMetrics() {
  const monthStart = todayISO().slice(0, 7);
  const monthReadings = readings.filter(r => r.date.slice(0, 7) === monthStart);
  const total = monthReadings.reduce((sum, r) => sum + Number(r.kwh), 0);
  const daysInMonth = new Date().getDate();
  $('#monthKwh').textContent = total.toFixed(1);
  $('#monthCost').textContent = Math.round(total * TARIFF_RUPEES_PER_KWH).toLocaleString('en-IN');
  $('#tariffLabel').textContent = `₹${TARIFF_RUPEES_PER_KWH} / kWh`;
  $('#dailyAverage').textContent = (total / daysInMonth).toFixed(1);
  $('#monthTrend').textContent = monthReadings.length ? `${monthReadings.length} reading${monthReadings.length === 1 ? '' : 's'} this month` : 'Add a reading to start';
  const perDay = aggregateByDate(monthReadings);
  const peak = Object.entries(perDay).sort((a, b) => b[1] - a[1])[0];
  $('#peakValue').textContent = peak ? peak[1].toFixed(1) : '—';
  $('#peakDate').textContent = peak ? fmtDate(peak[0], { weekday: 'short', day: 'numeric', month: 'short' }) : 'Add readings to begin';
}
function aggregateByDate(items) { return items.reduce((acc, r) => { acc[r.date] = (acc[r.date] || 0) + Number(r.kwh); return acc; }, {}); }
function renderChart() {
  const count = Number($('#period').value || 7);
  const days = Array.from({length: count}, (_, i) => dateFromDaysAgo(count - i - 1));
  const totals = aggregateByDate(readings.filter(r => days.includes(r.date)));
  const max = Math.max(dailyTarget, ...Object.values(totals), 1);
  $('#chart').innerHTML = days.map((date, index) => {
    const value = totals[date] || 0;
    const height = value ? Math.max(4, value / max * 100) : 2;
    const showLabel = count === 7 || index % 5 === 0 || index === count - 1;
    const title = `${fmtDate(date, {weekday:'long', day:'numeric', month:'long'})}: ${value.toFixed(1)} kWh`;
    return `<div class="bar-group" title="${escapeHTML(title)}"><div class="bar" style="height:${height}%" aria-label="${escapeHTML(title)}"></div>${showLabel ? `<span class="bar-label">${fmtDate(date, {day:'numeric', month:'short'})}</span>` : ''}</div>`;
  }).join('');
  const total = Object.values(totals).reduce((sum, v) => sum + v, 0);
  $('#chartTotal').textContent = `${total.toFixed(1)} kWh in selected period`;
}
function renderRows() {
  const items = sortedReadings();
  $('#readingRows').innerHTML = items.slice(0, 6).map(r => `<tr><td>${fmtDate(r.date, {weekday:'short', day:'numeric', month:'short', year:'numeric'})}</td><td>${Number(r.kwh).toFixed(2)} kWh</td><td>${escapeHTML(r.note || '—')}</td><td><button class="delete-row" data-id="${escapeHTML(r.id)}" aria-label="Delete reading">×</button></td></tr>`).join('');
  $('#emptyState').hidden = items.length > 0;
  $('#readingRows').querySelectorAll('.delete-row').forEach(button => button.addEventListener('click', () => deleteReading(button.dataset.id)));
}
function renderTarget() {
  $('#targetGoal').textContent = dailyTarget.toFixed(1).replace(/\.0$/, '');
  $('#targetInput').value = dailyTarget;
  const current = aggregateByDate(readings)[todayISO()] || 0;
  $('#targetUsed').textContent = current.toFixed(1);
  $('#targetProgress').style.width = `${Math.min(100, current / dailyTarget * 100)}%`;
  $('#targetMessage').textContent = current === 0 ? 'Add a reading for today to track your target.' : current <= dailyTarget ? `${(dailyTarget - current).toFixed(1)} kWh left in today's target. Nice work!` : `${(current - dailyTarget).toFixed(1)} kWh over your daily target today.`;
}
function renderTips() {
  const sorted = sortedReadings();
  const byDate = aggregateByDate(readings);
  const highest = Object.entries(byDate).sort((a,b) => b[1]-a[1])[0];
  const tips = [];
  if (!sorted.length) {
    tips.push(['✳','Start with one reading','Add today’s usage from your meter or electricity bill.']);
    tips.push(['☀','Try a simple habit','Switch off unused lights and standby devices to reduce avoidable use.']);
  } else {
    if (highest && highest[1] > dailyTarget) tips.push(['⚡','Review your peak day',`${fmtDate(highest[0])} was your highest day at ${highest[1].toFixed(1)} kWh. Check heating, cooling, or appliance use.`]);
    const latest = sorted[0];
    tips.push(['◷','Shift flexible use',`Try running laundry or dishwashing outside your busiest hours, if your tariff rewards off-peak use.`]);
    tips.push(['✳','Compare week to week',`You have ${readings.length} reading${readings.length === 1 ? '' : 's'} recorded. Add readings regularly to spot changes.`]);
    if (tips.length < 2) tips.push(['⌂','Check standby power','Unplug chargers and devices you are not using, where practical.']);
  }
  $('#tips').innerHTML = tips.slice(0, 2).map(t => `<div class="tip"><div class="tip-icon">${t[0]}</div><div><b>${escapeHTML(t[1])}</b><p>${escapeHTML(t[2])}</p></div></div>`).join('');
}
function openReadingDialog() { $('#readingDate').value = todayISO(); $('#readingKwh').value = ''; $('#readingNote').value = ''; $('#formError').textContent = ''; $('#readingDialog').showModal(); }
function deleteReading(id) { readings = readings.filter(r => r.id !== id); persist(); render(); showToast('Reading deleted.'); }
$('#addTop').addEventListener('click', openReadingDialog);
$('#addInline').addEventListener('click', openReadingDialog);
$('#closeDialog').addEventListener('click', () => $('#readingDialog').close());
$('#cancelDialog').addEventListener('click', () => $('#readingDialog').close());
$('#readingForm').addEventListener('submit', event => {
  event.preventDefault();
  const date = $('#readingDate').value;
  const kwh = Number($('#readingKwh').value);
  if (!date || !Number.isFinite(kwh) || kwh <= 0) { $('#formError').textContent = 'Enter a date and a usage amount greater than zero.'; return; }
  readings.push({id: (globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`), date, kwh, note: $('#readingNote').value.trim()});
  persist(); $('#readingDialog').close(); render(); showToast('Reading saved on this device.');
});
$('#sampleButton').addEventListener('click', () => {
  const samples = [
    {days:0,kwh:8.4,note:'Today'}, {days:1,kwh:9.1,note:'Air conditioning'}, {days:2,kwh:7.2,note:'Workday'},
    {days:3,kwh:11.6,note:'Laundry day'}, {days:4,kwh:8.0,note:'Workday'}, {days:5,kwh:6.9,note:'Away in evening'},
    {days:6,kwh:10.2,note:'Weekend at home'}, {days:7,kwh:7.7,note:'Workday'}, {days:8,kwh:8.5,note:'Cooking'},
    {days:9,kwh:9.4,note:'Workday'}, {days:10,kwh:7.1,note:'Workday'}, {days:11,kwh:12.3,note:'Guests at home'},
    {days:12,kwh:8.3,note:'Workday'}, {days:13,kwh:9.0,note:'Weekend'}
  ];
  readings = samples.map(x => ({id:`sample-${x.days}`,date:dateFromDaysAgo(x.days),kwh:x.kwh,note:x.note}));
  persist(); render(); showToast('Sample readings loaded.');
});
$('#clearButton').addEventListener('click', () => { if (!readings.length) { showToast('There are no readings to clear.'); return; } if (confirm('Delete all saved readings from this browser?')) { readings = []; persist(); render(); showToast('All readings cleared.'); } });
$('#period').addEventListener('change', renderChart);
$('#editTarget').addEventListener('click', () => $('#targetDialog').showModal());
$('#closeTarget').addEventListener('click', () => $('#targetDialog').close());
$('#cancelTarget').addEventListener('click', () => $('#targetDialog').close());
$('#targetForm').addEventListener('submit', event => { event.preventDefault(); const value = Number($('#targetInput').value); if (!Number.isFinite(value) || value <= 0) return; dailyTarget = value; localStorage.setItem(TARGET_KEY, String(value)); $('#targetDialog').close(); render(); showToast('Daily target updated.'); });
$('#readingDialog').addEventListener('click', event => { if (event.target === $('#readingDialog')) $('#readingDialog').close(); });
$('#targetDialog').addEventListener('click', event => { if (event.target === $('#targetDialog')) $('#targetDialog').close(); });
$('#targetGoal').textContent = dailyTarget;
render();

// The browser-only demo simulates changing meter load; it does not connect to hardware.
let liveTimer = null;
let liveEnergyKwh = 0;
let livePowerWatts = 0;
const livePanel = $('.live-panel');
const wave = $('#liveWave');
wave.innerHTML = Array.from({length:36}, () => '<i class="wave-bar"></i>').join('');
function paintWave() {
  const bars = [...wave.children];
  bars.forEach((bar, index) => {
    const center = (bars.length - 1) / 2;
    const pulse = Math.max(0.12, 1 - Math.abs(index - center) / center);
    const height = liveTimer ? 12 + Math.random() * 68 * pulse : 8 + Math.random() * 8;
    bar.style.height = `${height}%`;
    bar.style.opacity = String(0.45 + pulse * 0.5);
  });
}
function updateLiveDisplay() {
  $('#liveWatts').textContent = Math.round(livePowerWatts).toLocaleString();
  $('#liveKwh').textContent = liveEnergyKwh.toFixed(3);
  $('#saveLive').disabled = liveEnergyKwh <= 0;
  paintWave();
}
function liveTick() {
  livePowerWatts = 180 + Math.random() * 1050;
  // Accelerated demo: one 5-minute interval passes every 2.5 real seconds.
  liveEnergyKwh += livePowerWatts / 1000 * (5 / 60);
  updateLiveDisplay();
}
$('#liveToggle').addEventListener('click', () => {
  if (liveTimer) {
    clearInterval(liveTimer);
    liveTimer = null;
    livePanel.classList.remove('is-live');
    $('#liveState').textContent = 'Live demo is paused';
    $('#liveToggle').textContent = '▶ Resume live demo';
  } else {
    livePanel.classList.add('is-live');
    $('#liveState').textContent = 'Receiving simulated readings';
    $('#liveToggle').textContent = 'Ⅱ Pause demo';
    liveTick();
    liveTimer = setInterval(liveTick, 2500);
  }
  paintWave();
});
$('#saveLive').addEventListener('click', () => {
  if (liveEnergyKwh <= 0) return;
  readings.push({id:(globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`),date:todayISO(),kwh:Number(liveEnergyKwh.toFixed(3)),note:'Simulated live session'});
  persist();
  liveEnergyKwh = 0;
  render();
  updateLiveDisplay();
  showToast('Demo session saved as a reading on this device.');
});
paintWave();
