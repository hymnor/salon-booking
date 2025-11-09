const form = document.getElementById('booking-form');
const statusEl = document.getElementById('status');
const checkBtn = document.getElementById('check-btn');
document.getElementById('year').textContent = new Date().getFullYear();

function getFormData() {
  const fd = new FormData(form);
  return Object.fromEntries(fd.entries());
}

function show(msg, type='info') {
  statusEl.textContent = msg;
  statusEl.style.color = type === 'error' ? '#ff8a8a' : (type === 'ok' ? '#8affc1' : '#a1a1aa');
}

checkBtn.addEventListener('click', async () => {
  const data = getFormData();
  if (!data.date || !data.time || !data.staff) {
    show('Pick a date, time, and staff first', 'error');
    return;
  }
  try {
    const res = await fetch('/api/availability', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ date: data.date, time: data.time, staff: data.staff })
    });
    const json = await res.json();
    if (!json.ok) throw new Error(json.message || 'Error');
    if (json.available) show('Slot is available ✅', 'ok');
    else show('That slot is taken — try another time/staff.', 'error');
  } catch (e) {
    show('Error checking availability', 'error');
  }
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = getFormData();
  if (!data.name || !data.phone || !data.service || !data.staff || !data.date || !data.time) {
    show('Please fill required fields (*)', 'error');
    return;
  }
  show('Booking your slot…');
  try {
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!json.ok) {
      show(json.message || 'Booking failed', 'error');
      return;
    }
    show('Booked! We’ll see you soon. 🎉', 'ok');
    form.reset();
  } catch (e) {
    show('Server error — please try again.', 'error');
  }
});
