const timersInitial = {
    study: 12 * 60 * 60,  // 12 giờ
    break: 8 * 60 * 60,   // 8 giờ
    other: 4 * 60 * 60    // 4 giờ
};

let remaining = { ...timersInitial };
let activeTimer = null;
let endTime = null;
let intervalId = null;

// Thứ tự vòng lặp khi đồng hồ hết thời gian
const order = ['study', 'other', 'break'];

// Load dữ liệu từ localStorage
function loadTimers() {
    const saved = JSON.parse(localStorage.getItem('timerData') || "{}");
    const savedDate = saved.date;
    const today = new Date().toDateString();

    if (savedDate === today) {
        remaining = saved.remaining || { ...timersInitial };
        activeTimer = saved.activeTimer;
        endTime = saved.endTime || null;

        if (activeTimer && endTime) {
            const timeLeft = Math.floor((endTime - Date.now()) / 1000);
            if (timeLeft <= 0) {
                remaining[activeTimer] = 0;
                activeTimer = null;
                endTime = null;
            }
        }
    } else {
        // Ngày mới: reset đồng hồ và bắt đầu "Nghỉ ngơi"
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
        let timeLeft;
        if (name === activeTimer && endTime) {
            timeLeft = Math.max(0, Math.floor((endTime - now) / 1000));
        } else {
            timeLeft = remaining[name];
        }
        document.getElementById(`timer-${name}`).textContent = formatTime(timeLeft);
    });
}

// Bắt đầu đồng hồ khi nhấn nút
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

// Reset đồng hồ khi sang ngày mới
function resetTimers() {
    remaining = { ...timersInitial };
    activeTimer = 'break';  // "Nghỉ ngơi" bắt đầu chạy
    endTime = Date.now() + remaining.break * 1000;
    saveTimers();
}

// Tìm đồng hồ tiếp theo trong vòng lặp còn thời gian
function getNextTimer(current) {
    const idx = order.indexOf(current);
    for (let i = 1; i <= order.length; i++) {
        const next = order[(idx + i) % order.length];
        if (remaining[next] > 0) return next;
    }
    return null; // không còn đồng hồ nào
}

// Interval 1s
function startInterval() {
    if (intervalId) clearInterval(intervalId);
    intervalId = setInterval(() => {
        const now = Date.now();
        const today = new Date().toDateString();
        const savedDate = localStorage.getItem('timerDate');

        // Kiểm tra ngày mới
        if (savedDate !== today) {
            resetTimers();
        }

        // Đồng hồ đang chạy
        if (activeTimer && endTime) {
            const timeLeft = Math.floor((endTime - now) / 1000);

            if (timeLeft <= 0) {
                remaining[activeTimer] = 0;

                // Chuyển sang đồng hồ tiếp theo trong vòng lặp
                const nextTimer = getNextTimer(activeTimer);
                if (nextTimer) {
                    activeTimer = nextTimer;
                    endTime = now + remaining[nextTimer] * 1000;
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

// Lưu trạng thái vào localStorage
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
