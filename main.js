'use strict';

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase, ref, push, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

const firebaseConfig = {
    apiKey: "AIzaSyBSGh2R2_ivDkRIFKDc3UStBk1Ffgb7aa0",
    authDomain: "reze-1cb12.firebaseapp.com",
    databaseURL: "https://reze-1cb12-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "reze-1cb12",
    storageBucket: "reze-1cb12.firebasestorage.app",
    messagingSenderId: "528113849690",
    appId: "1:528113849690:web:d33c73fb6c418ab9328f63"
};

let app, database;

try {
    app = initializeApp(firebaseConfig);
    database = getDatabase(app);
} catch (error) {
    console.error('Firebase initialization error:', error);
}

const header = document.querySelector('header');
const mobileMenu = document.querySelector('.mobile-menu');
const navLinks = document.querySelector('.nav-links');
const contactForm = document.getElementById('contactForm');
const formFeedback = document.getElementById('formFeedback');
const submitButton = document.getElementById('submitButton');
const profileImage = document.querySelector('.profile-image');

function toggleMenu() {
    const isActive = navLinks.classList.toggle('active');
    mobileMenu.setAttribute('aria-expanded', isActive);
}

function closeMenu() {
    navLinks.classList.remove('active');
    mobileMenu.setAttribute('aria-expanded', 'false');
}

mobileMenu.addEventListener('click', toggleMenu);

navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
});

document.addEventListener('click', (e) => {
    if (!e.target.closest('nav')) {
        closeMenu();
    }
});

window.addEventListener('scroll', () => {
    const currentScrollY = window.pageYOffset;
    header.style.borderBottomColor = currentScrollY > 20 ? 'var(--primary)' : 'var(--border)';
}, { passive: true });

const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -80px 0px'
};

const fadeInObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            
            if (entry.target.querySelector('.stat-value')) {
                const statValues = entry.target.querySelectorAll('.stat-value');
                statValues.forEach(stat => animateCounter(stat));
            }
            
            fadeInObserver.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.about-card, .step-box, .value-item, .contact-info, .contact-form').forEach(el => {
    fadeInObserver.observe(el);
});

const heroStatsContainer = document.querySelector('.hero-stats');
if (heroStatsContainer) {
    fadeInObserver.observe(heroStatsContainer);
}

function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-target'));
    const duration = 2000;
    const frameRate = 1000 / 60;
    const totalFrames = Math.round(duration / frameRate);
    const increment = target / totalFrames;
    let current = 0;
    let frame = 0;

    const updateCounter = () => {
        frame++;
        current += increment;
        
        if (frame < totalFrames) {
            element.textContent = Math.floor(current);
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target;
        }
    };

    requestAnimationFrame(updateCounter);
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const target = document.querySelector(targetId);
        if (!target) return;
        
        e.preventDefault();
        const headerHeight = header.offsetHeight;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = targetPosition - headerHeight;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
        
        closeMenu();
    });
});

function getPhilippineDateTime() {
    const now = new Date();
    
    const phOptions = {
        timeZone: 'Asia/Manila',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    };
    
    const dateOptions = { 
        timeZone: 'Asia/Manila',
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        weekday: 'long'
    };
    
    const timeOptions = { 
        timeZone: 'Asia/Manila',
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit', 
        hour12: true 
    };
    
    return {
        date: now.toLocaleDateString('en-PH', dateOptions),
        time: now.toLocaleTimeString('en-PH', timeOptions),
        fullDateTime: now.toLocaleString('en-PH', phOptions)
    };
}

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        formFeedback.style.display = 'none';
        formFeedback.className = 'form-message';
        
        const originalText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';
        
        const userName = document.getElementById('userName').value.trim();
        const userMessage = document.getElementById('userMessage').value.trim();
        
        if (!userName || !userMessage) {
            formFeedback.className = 'form-message error';
            formFeedback.textContent = 'Please fill in all fields.';
            formFeedback.style.display = 'block';
            submitButton.disabled = false;
            submitButton.textContent = originalText;
            return;
        }
        
        const phDateTime = getPhilippineDateTime();
        
        const formData = {
            name: userName,
            message: userMessage,
            timestamp: serverTimestamp(),
            date: phDateTime.date,
            time: phDateTime.time,
            fullDateTime: phDateTime.fullDateTime
        };

        try {
            const messagesRef = ref(database, 'messages');
            await push(messagesRef, formData);
            
            formFeedback.className = 'form-message success';
            formFeedback.textContent = 'Thank you! Your message has been sent successfully.';
            formFeedback.style.display = 'block';
            contactForm.reset();
            
            setTimeout(() => {
                formFeedback.style.display = 'none';
            }, 5000);
            
        } catch (error) {
            console.error('Submission error:', error);
            formFeedback.className = 'form-message error';
            formFeedback.textContent = 'Something went wrong. Please try again later.';
            formFeedback.style.display = 'block';
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }
    });
}

window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        closeMenu();
    }
});