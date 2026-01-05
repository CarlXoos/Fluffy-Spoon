'use strict';

const ipEl = document.getElementById('ip');
const macEl = document.getElementById('mac');
const hoursEl = document.getElementById('hours');
const minutesEl = document.getElementById('minutes');
const secondsEl = document.getElementById('seconds');
const pauseBtn = document.getElementById('pauseBtn');
const portalBtn = document.getElementById('portalBtn');
const mainLogo = document.getElementById('mainLogo');
const overlay = document.getElementById('loadingOverlay');
const logo = document.getElementById('loadingLogo');
const loadingText = document.getElementById('loadingText');

let timeLeft = 0;
let paused = false;
let interval = null;
let totalOriginalTime = 0;

function init() {
    const data = localStorage.getItem('wifiUser');
    
    if (!data) {
        window.location.href = 'index.html';
        return;
    }
    
    try {
        const user = JSON.parse(data);
        const currentTime = Date.now();
        const elapsedSeconds = Math.floor((currentTime - user.loginTime) / 1000);
        
        timeLeft = Math.max(0, user.timeInSeconds - elapsedSeconds);
        totalOriginalTime = user.timeInSeconds;
        
        if (timeLeft === 0) {
            handleTimeExpired();
            return;
        }
        
        ipEl.textContent = user.ip;
        macEl.textContent = user.mac;
        updateTimer();
        startTimer();
    } catch (e) {
        console.error('Session data error:', e);
        localStorage.removeItem('wifiUser');
        window.location.href = 'index.html';
    }
}

function updateTimer() {
    const hrs = Math.floor(timeLeft / 3600);
    const mins = Math.floor((timeLeft % 3600) / 60);
    const secs = timeLeft % 60;
    
    hoursEl.textContent = hrs;
    minutesEl.textContent = mins;
    secondsEl.textContent = secs;
    
    if (timeLeft <= 60 && timeLeft > 0) {
        document.querySelectorAll('.timer-box').forEach(box => {
            box.style.borderColor = 'var(--secondary-red)';
            box.style.animation = 'pulse 1s ease-in-out infinite';
        });
    }
}

function startTimer() {
    if (interval) clearInterval(interval);
    
    interval = setInterval(() => {
        if (!paused && timeLeft > 0) {
            timeLeft--;
            updateTimer();
            saveTimeToStorage();
            
            if (timeLeft === 0) {
                handleTimeExpired();
            }
        }
    }, 1000);
}

function saveTimeToStorage() {
    try {
        const data = localStorage.getItem('wifiUser');
        if (data) {
            const user = JSON.parse(data);
            user.timeInSeconds = timeLeft;
            user.loginTime = Date.now() - (totalOriginalTime - timeLeft) * 1000;
            localStorage.setItem('wifiUser', JSON.stringify(user));
        }
    } catch (e) {
        console.error('Error saving time:', e);
    }
}

function handleTimeExpired() {
    clearInterval(interval);
    localStorage.removeItem('wifiUser');
    alert('Your time has expired. Thank you for using Carl\'s Free WiFi!');
    window.location.href = 'index.html';
}

function togglePause() {
    paused = !paused;
    pauseBtn.textContent = paused ? 'Resume Time' : 'Pause Time';
    pauseBtn.classList.toggle('paused');
    
    if (paused) {
        pauseBtn.style.transform = 'scale(1.05)';
        setTimeout(() => {
            pauseBtn.style.transform = '';
        }, 200);
    }
}

function navigateToMain() {
    overlay.classList.add('active');
    logo.classList.add('spinning');
    loadingText.classList.add('blink');
    
    setTimeout(() => {
        window.location.href = 'main.html';
    }, 3000);
}

function animateLogo() {
    mainLogo.style.transform = 'scale(1.2)';
    setTimeout(() => {
        mainLogo.style.transform = '';
    }, 300);
}

mainLogo.addEventListener('click', animateLogo);
pauseBtn.addEventListener('click', togglePause);
portalBtn.addEventListener('click', navigateToMain);

window.addEventListener('beforeunload', () => {
    if (interval) {
        clearInterval(interval);
        saveTimeToStorage();
    }
});

window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        init();
    }
});

document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        init();
    }
});

init();