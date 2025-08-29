// Thời gian ban đầu (giây)
const timersInitial = {
    study: 12 * 60 * 60,
    break: 8 * 60 * 60,
    other: 4 * 60 * 60
};

let timers = { ...timersInitial };
let activeTimer = null;
let intervalId = null;

// Load trạng thái từ localStorage
function loadTimers() {
    const saved = localStorage.getItem('timers');
    const savedDate = localStorage.getItem('timersDate');

    const today = new Date().toDateString();

    if (saved && savedDate === today) {
        timers = JSON.parse(saved);
    } else {
        timers = { ...timersInitial };
        // Nếu là ngày mới, bắt đầu đồng hồ "Nghỉ ngơi" từ 8h
        activeTimer = 'break';
        startInterval();
    }
    updateDisplay();
}

// Cập nhật hiển thị
function updateDisplay() {
    document.getElementById('timer-study').textContent = formatTime(timers.study);
    document.getElementById('timer-break').textContent = formatTime(timers.break);
    document.getElementById('timer-other').textContent = formatTime(timers.other);
}

// Format giây thành HH:MM:SS
function formatTime(sec) {
    const h = Math.floor(sec / 3600).toString().padStart(2, '0');
    const m = Math.floor((sec % 3600) / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
}

// Bắt đầu hẹn giờ cho một loại
function startTimer(name) {
    activeTimer = name;
    if (!intervalId) startInterval();
}

// Interval
function startInterval() {
    intervalId = setInterval(() => {
        if (activeTimer && timers[activeTimer] > 0) {
            timers[activeTimer]--;
            updateDisplay();
            saveTimers();
        }
    }, 1000);
}

// Lưu trạng thái
function saveTimers() {
    localStorage.setItem('timers', JSON.stringify(timers));
    localStorage.setItem('timersDate', new Date().toDateString());
}

// Khởi tạo
loadTimers();
