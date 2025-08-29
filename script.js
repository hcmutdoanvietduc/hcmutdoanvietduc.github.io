const timersInitial = {
    study: 12 * 60 * 60,
    break: 8 * 60 * 60,
    other: 4 * 60 * 60
};

let timers = { ...timersInitial };
let activeTimer = null;
let intervalId = null;
let endTime = null;

// Load trạng thái từ localStorage
function loadTimers() {
    const saved = JSON.parse(localStorage.getItem('timerData') || "{}");
    const today = new Date().toDateString();

    if (saved.date === today) {
        activeTimer = saved.activeTimer;
        endTime = saved.endTime;
        timers = saved.timers || { ...timersInitial };
    } else {
        // Ngày mới: reset timers
        timers = { ...timersInitial };
        activeTimer = 'break';
        endTime = Date.now() + timers.break * 1000;
    }
    startInterval();
}

// Update hiển thị
function updateDisplay() {
    const now = Date.now();
    Object.keys(timers).forEach(name => {
        let remaining;
        if (name === activeTimer && endTime) {
            remaining = Math.max(0, Math.floor((endTime - now) / 1000));
        } else {
            remaining = timers[name];
        }
        document.getElementById(`timer-${name}`).textContent = formatTime(remaining);
    });
}

// Format giây
function formatTime(sec) {
    const h = Math.floor(sec / 3600).toString().padStart(2, '0');
    const m = Math.floor((sec % 3600) / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
}

// Start timer
function startTimer(name) {
    activeTimer = name;
    endTime = Date.now() + timers[name] * 1000;
    saveTimers();
}

// Interval
function startInterval() {
    if (intervalId) clearInterval(intervalId);
    intervalId = setInterval(() => {
        updateDisplay();
        saveTimers();
    }, 1000);
}

// Save trạng thái
function saveTimers() {
    localStorage.setItem('timerData', JSON.stringify({
        date: new Date().toDateString(),
        activeTimer,
        endTime,
        timers
    }));
}

// Khởi tạo
loadTimers();
