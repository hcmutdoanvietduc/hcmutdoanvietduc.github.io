const timersInitial = {
    study: 12 * 60 * 60,
    break: 8 * 60 * 60,
    other: 4 * 60 * 60
};

let remaining = { ...timersInitial }; // các đồng hồ đang dừng
let activeTimer = null;
let endTime = null;
let intervalId = null;

// Load dữ liệu từ localStorage
function loadTimers() {
    const saved = JSON.parse(localStorage.getItem('timerData') || "{}");
    const today = new Date().toDateString();

    if (saved.date === today) {
        remaining = saved.remaining || { ...timersInitial };
        activeTimer = saved.activeTimer;
        endTime = saved.endTime || null;

        // Nếu đồng hồ đang chạy, tính lại thời gian còn lại
        if (activeTimer && endTime) {
            const now = Date.now();
            const timeLeft = Math.floor((endTime - now) / 1000);
            if (timeLeft <= 0) {
                remaining[activeTimer] = 0;
                activeTimer = null;
                endTime = null;
            }
        }
    } else {
        // Ngày mới: reset timers
        remaining = { ...timersInitial };
        activeTimer = 'break';
        endTime = Date.now() + remaining.break * 1000;
    }
    startInterval();
}

// Format giây -> HH:MM:SS
function formatTime(sec) {
    const h = Math.floor(sec / 3600).toString().padStart(2, '0');
    const m = Math.floor((sec % 3600) / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
}

// Cập nhật hiển thị
function updateDisplay() {
    const now = Date.now();
    Object.keys(remaining).forEach(name => {
        let timeLeft;
        if (name === activeTimer && endTime) {
            timeLeft = Math.max(0, Math.floor((endTime - now) / 1000));
        } else {
            timeLeft = remaining[name];
        }
        document.getElementById(`timer-${name}`).textContent = formatTime(timeLeft);
    });
}

// Bắt đầu đồng hồ
function startTimer(name) {
    const now = Date.now();

    // Tính remaining cho đồng hồ đang chạy
    if (activeTimer && endTime) {
        remaining[activeTimer] = Math.max(0, Math.floor((endTime - now) / 1000));
    }

    activeTimer = name;
    endTime = now + remaining[name] * 1000;
    saveTimers();
}

// Interval 1s
function startInterval() {
    if (intervalId) clearInterval(intervalId);
    intervalId = setInterval(() => {
        if (activeTimer && endTime) {
            const now = Date.now();
            const timeLeft = Math.floor((endTime - now) / 1000);
            if (timeLeft <= 0) {
                remaining[activeTimer] = 0;
                activeTimer = null;
                endTime = null;
            }
        }
        updateDisplay();
        saveTimers();
    }, 1000);
}

// Lưu trạng thái vào localStorage
function saveTimers() {
    localStorage.setItem('timerData', JSON.stringify({
        date: new Date().toDateString(),
        activeTimer,
        endTime,
        remaining
    }));
}

// Khởi tạo
loadTimers();
