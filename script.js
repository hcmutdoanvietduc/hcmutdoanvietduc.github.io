const timersInitial = {
    study: 60,
    break: 60,
    other: 60
};

let remaining = { ...timersInitial };
let activeTimer = null;
let endTime = null;
let intervalId = null;

// Thứ tự vòng lặp
const order = ['study', 'other', 'break'];

// Thêm thông tin finishedNotified để báo khi hết giờ
for (let key in remaining) {
    remaining[key] = { time: remaining[key], finishedNotified: false };
}

// Load dữ liệu từ localStorage
function loadTimers() {
    const saved = JSON.parse(localStorage.getItem('timerData') || "{}");
    const savedDate = saved.date;
    const today = new Date().toDateString();

    if (savedDate === today) {
        remaining = saved.remaining || remaining;
        activeTimer = saved.activeTimer;
        endTime = saved.endTime || null;
    } else {
        resetTimers();
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
        let timeLeft = remaining[name].time;
        if (name === activeTimer && endTime) {
            timeLeft = Math.max(0, Math.floor((endTime - now) / 1000));
        }
        document.getElementById(`timer-${name}`).textContent = formatTime(timeLeft);
    });
}

// Bắt đầu đồng hồ khi nhấn nút
function startTimer(name) {
    const now = Date.now();
    if (activeTimer && endTime) {
        remaining[activeTimer].time = Math.max(0, Math.floor((endTime - now) / 1000));
    }
    activeTimer = name;
    endTime = now + remaining[name].time * 1000;
    remaining[name].finishedNotified = false;
    saveTimers();
}

// Reset đồng hồ khi sang ngày mới
function resetTimers() {
    for (let key in timersInitial) {
        remaining[key] = { time: timersInitial[key], finishedNotified: false };
    }
    activeTimer = 'break';
    endTime = Date.now() + remaining.break.time * 1000;
    saveTimers();
}

// Tìm đồng hồ tiếp theo trong vòng lặp còn thời gian
function getNextTimer(current) {
    const idx = order.indexOf(current);
    for (let i = 1; i <= order.length; i++) {
        const next = order[(idx + i) % order.length];
        if (remaining[next].time > 0) return next;
    }
    return null;
}

// Phát âm thanh
function playSound() {
    const audio = document.getElementById("alarm-sound");
    if (audio) audio.play();
}

// Rung điện thoại
function vibratePhone() {
    if ("vibrate" in navigator) {
        navigator.vibrate([500, 200, 500]);
    }
}

// Interval 1s
function startInterval() {
    if (intervalId) clearInterval(intervalId);
    intervalId = setInterval(() => {
        const now = Date.now();
        const today = new Date().toDateString();
        const savedDate = localStorage.getItem('timerDate');

        // Reset ngày mới
        if (savedDate !== today) {
            resetTimers();
        }

        if (activeTimer && endTime) {
            const timeLeft = Math.floor((endTime - now) / 1000);

            // Hết giờ
            if (timeLeft <= 0 && !remaining[activeTimer].finishedNotified) {
                remaining[activeTimer].time = 0;

                // Kích hoạt chuông/rung khi hết giờ
                if (activeTimer === 'break') {
                    vibratePhone(); // chỉ rung
                } else {
                    playSound();
                    vibratePhone();
                }

                remaining[activeTimer].finishedNotified = true;

                // Chuyển đồng hồ tiếp theo
                const nextTimer = getNextTimer(activeTimer);
                if (nextTimer) {
                    activeTimer = nextTimer;
                    endTime = now + remaining[nextTimer].time * 1000;
                    remaining[nextTimer].finishedNotified = false;
                } else {
                    activeTimer = null;
                    endTime = null;
                }
            }
        }

        updateDisplay();
        saveTimers();
    }, 1000);
}

// Lưu trạng thái
function saveTimers() {
    localStorage.setItem('timerData', JSON.stringify({
        date: new Date().toDateString(),
        activeTimer,
        endTime,
        remaining
    }));
    localStorage.setItem('timerDate', new Date().toDateString());
}

// Khởi tạo
loadTimers();
