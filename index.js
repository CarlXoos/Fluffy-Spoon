'use strict';

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase, ref, get } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

const firebaseConfig = {
    apiKey: "AIzaSyBSGh2R2_ivDkRIFKDc3UStBk1Ffgb7aa0",
    authDomain: "reze-1cb12.firebaseapp.com",
    databaseURL: "https://reze-1cb12-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "reze-1cb12",
    storageBucket: "reze-1cb12.firebasestorage.app",
    messagingSenderId: "528113849690",
    appId: "1:528113849690:web:d33c73fb6c418ab9328f63"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const form = document.getElementById('loginForm');
const tokenInput = document.getElementById('token');
const passwordInput = document.getElementById('password');
const errorMsg = document.getElementById('errorMsg');
const overlay = document.getElementById('loadingOverlay');
const logo = document.getElementById('loadingLogo');
const loadingText = document.getElementById('loadingText');
const toggleBtn = document.getElementById('toggleBtn');
const iconShow = document.getElementById('iconShow');
const iconHide = document.getElementById('iconHide');
const mainLogo = document.getElementById('mainLogo');

function togglePassword() {
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    iconShow.classList.toggle('hidden');
    iconHide.classList.toggle('hidden');
}

function animateLogo() {
    mainLogo.style.transform = 'scale(1.15)';
    setTimeout(() => {
        mainLogo.style.transform = '';
    }, 300);
}

async function handleSubmit(e) {
    e.preventDefault();
    
    const token = tokenInput.value.trim();
    const password = passwordInput.value.trim();
    
    if (!token || !password) {
        showError('Please fill in all fields.');
        return;
    }
    
    try {
        const userRef = ref(database, `users/${token}`);
        const snapshot = await get(userRef);
        
        if (snapshot.exists()) {
            const userData = snapshot.val();
            
            if (userData.password === password) {
                const loginTime = Date.now();
                
                localStorage.setItem('wifiUser', JSON.stringify({
                    token,
                    ip: userData.ip,
                    mac: userData.mac,
                    timeInSeconds: userData.timeInSeconds,
                    loginTime: loginTime
                }));
                
                overlay.classList.add('active');
                logo.classList.add('spinning');
                loadingText.classList.add('blink');
                
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 3000);
            } else {
                showError('Incorrect token or password. Please try again.');
            }
        } else {
            showError('Incorrect token or password. Please try again.');
        }
    } catch (error) {
        console.error('Login error:', error);
        showError('Connection error. Please try again.');
    }
}

function showError(message) {
    tokenInput.style.borderColor = 'var(--error)';
    passwordInput.style.borderColor = 'var(--error)';
    errorMsg.textContent = message;
    errorMsg.classList.add('show');
    tokenInput.classList.add('shake');
    passwordInput.classList.add('shake');
    
    setTimeout(() => {
        tokenInput.classList.remove('shake');
        passwordInput.classList.remove('shake');
    }, 500);
}

function clearError() {
    if (errorMsg.classList.contains('show')) {
        tokenInput.style.borderColor = '';
        passwordInput.style.borderColor = '';
        errorMsg.classList.remove('show');
        errorMsg.textContent = '';
    }
}

toggleBtn.addEventListener('click', togglePassword);
mainLogo.addEventListener('click', animateLogo);
form.addEventListener('submit', handleSubmit);
tokenInput.addEventListener('input', clearError);
passwordInput.addEventListener('input', clearError);