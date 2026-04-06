// Global variables
let activitiesData = [];

// Load default CSV data on page load
window.addEventListener('DOMContentLoaded', () => {
    loadDefaultCSV();
    initHeroAnimations();
});

// ===========================================
// HERO ANIMATIONS
// ===========================================

// Initialize Hero Animations
function initHeroAnimations() {
    initSlideshow();
    initParticles();
}

// Slideshow functionality
let currentSlideIndex = 0;
let slideInterval;

function initSlideshow() {
    // Start automatic slideshow
    slideInterval = setInterval(nextSlide, 5000); // Change every 5 seconds
}

function nextSlide() {
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.slideshow-dots .dot');
    
    // Remove active class from current slide
    slides[currentSlideIndex].classList.remove('active');
    dots[currentSlideIndex].classList.remove('active');
    
    // Move to next slide
    currentSlideIndex = (currentSlideIndex + 1) % slides.length;
    
    // Add active class to new slide
    slides[currentSlideIndex].classList.add('active');
    dots[currentSlideIndex].classList.add('active');
}

function currentSlide(index) {
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.slideshow-dots .dot');
    
    // Remove active class from all
    slides[currentSlideIndex].classList.remove('active');
    dots[currentSlideIndex].classList.remove('active');
    
    // Set new index
    currentSlideIndex = index;
    
    // Add active class to selected
    slides[currentSlideIndex].classList.add('active');
    dots[currentSlideIndex].classList.add('active');
    
    // Reset interval
    clearInterval(slideInterval);
    slideInterval = setInterval(nextSlide, 5000);
}

// Particles Animation with Canvas
function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    function resizeCanvas() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Particle class
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 3 + 1;
            this.speedX = Math.random() * 2 - 1;
            this.speedY = Math.random() * 2 - 1;
            this.opacity = Math.random() * 0.5 + 0.2;
            
            // Random color from palette
            const colors = [
                'rgba(255, 20, 147,',   // Pink
                'rgba(0, 206, 209,',    // Cyan
                'rgba(255, 215, 0,',    // Gold
                'rgba(147, 112, 219,',  // Purple
                'rgba(255, 255, 255,'   // White
            ];
            this.color = colors[Math.floor(Math.random() * colors.length)];
        }
        
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            
            // Wrap around screen
            if (this.x > canvas.width) this.x = 0;
            if (this.x < 0) this.x = canvas.width;
            if (this.y > canvas.height) this.y = 0;
            if (this.y < 0) this.y = canvas.height;
        }
        
        draw() {
            ctx.fillStyle = this.color + this.opacity + ')';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // Create particles
    const particlesArray = [];
    const numberOfParticles = 100;
    
    for (let i = 0; i < numberOfParticles; i++) {
        particlesArray.push(new Particle());
    }
    
    // Animation loop
    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw connections between nearby particles
        for (let i = 0; i < particlesArray.length; i++) {
            for (let j = i + 1; j < particlesArray.length; j++) {
                const dx = particlesArray[i].x - particlesArray[j].x;
                const dy = particlesArray[i].y - particlesArray[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 100) {
                    ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 * (1 - distance / 100)})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particlesArray[i].x, particlesArray[i].y);
                    ctx.lineTo(particlesArray[j].x, particlesArray[j].y);
                    ctx.stroke();
                }
            }
        }
        
        // Update and draw particles
        particlesArray.forEach(particle => {
            particle.update();
            particle.draw();
        });
        
        requestAnimationFrame(animateParticles);
    }
    
    animateParticles();
}

// ===========================================
// ACTIVITIES DATA
// ===========================================

// Load default CSV file
async function loadDefaultCSV() {
    try {
        const response = await fetch('data/activities.csv');
        const csvText = await response.text();
        parseCSV(csvText);
    } catch (error) {
        console.error('Erreur lors du chargement du CSV par défaut:', error);
        showError('Erreur lors du chargement des données par défaut');
    }
}

// Parse CSV data
function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',');
    
    activitiesData = [];
    
    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values.length === headers.length) {
            const activity = {};
            headers.forEach((header, index) => {
                activity[header.trim()] = values[index].trim();
            });
            activitiesData.push(activity);
        }
    }
    
    // Sort by date and time chronologically
    sortActivitiesChronologically(activitiesData);
    
    populateFilters();
    displayActivitiesAndExpositions(activitiesData);
}

// Parse CSV line (handles commas within quotes)
function parseCSVLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            values.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    values.push(current);
    
    return values;
}

// Populate filter dropdowns
function populateFilters() {
    const dates = [...new Set(activitiesData.map(a => a.Date))].sort();
    const langues = [...new Set(activitiesData.map(a => a.Langue))].sort();
    const types = [...new Set(activitiesData.map(a => a['Activité']))].sort();
    
    const dateSelect = document.getElementById('filter-date');
    const langueSelect = document.getElementById('filter-langue');
    const typeSelect = document.getElementById('filter-type');
    
    // Clear existing options (except first)
    dateSelect.innerHTML = '<option value="">Toutes les dates</option>';
    langueSelect.innerHTML = '<option value="">Toutes les langues</option>';
    typeSelect.innerHTML = '<option value="">Tous les types</option>';
    
    // Add options
    dates.forEach(date => {
        const option = document.createElement('option');
        option.value = date;
        option.textContent = formatDate(date);
        dateSelect.appendChild(option);
    });
    
    langues.forEach(langue => {
        const option = document.createElement('option');
        option.value = langue;
        option.textContent = langue;
        langueSelect.appendChild(option);
    });
    
    types.forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type;
        typeSelect.appendChild(option);
    });
}

// Format date (DD/MM/YYYY to readable format)
function formatDate(dateStr) {
    const [day, month, year] = dateStr.split('/');
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('fr-FR', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
    });
}

// Format time (HH:MM:SS to HH:MM)
function formatTime(timeStr) {
    return timeStr.substring(0, 5);
}

// Sort activities chronologically
function sortActivitiesChronologically(activities) {
    activities.sort((a, b) => {
        // Parse dates (DD/MM/YYYY)
        const [dayA, monthA, yearA] = a.Date.split('/');
        const [dayB, monthB, yearB] = b.Date.split('/');
        const dateA = new Date(yearA, monthA - 1, dayA);
        const dateB = new Date(yearB, monthB - 1, dayB);
        
        // Compare dates first
        if (dateA.getTime() !== dateB.getTime()) {
            return dateA - dateB;
        }
        
        // If same date, compare times
        const timeA = a.Début || '00:00:00';
        const timeB = b.Début || '00:00:00';
        return timeA.localeCompare(timeB);
    });
}

// Display activities and expositions separately
function displayActivitiesAndExpositions(allActivities) {
    // Separate expositions from regular activities
    const expositions = allActivities.filter(a => 
        a['Activité'] === 'Exposition' || 
        a['Activité'] === 'Exposition d\'affiches' ||
        a['Activité'] === 'Frise collaborative'
    );
    
    const regularActivities = allActivities.filter(a => 
        a['Activité'] !== 'Exposition' && 
        a['Activité'] !== 'Exposition d\'affiches' &&
        a['Activité'] !== 'Frise collaborative'
    );
    
    // Display regular activities
    displayActivities(regularActivities);
    
    // Display expositions
    displayExpositions(expositions);
}

// Display activities
function displayActivities(activities) {
    const container = document.getElementById('activities-container');
    
    if (activities.length === 0) {
        container.innerHTML = '<div class="loading"><i class="fas fa-exclamation-circle"></i> Aucune activité trouvée</div>';
        return;
    }
    
    container.innerHTML = '';
    
    activities.forEach(activity => {
        const card = createActivityCard(activity);
        container.appendChild(card);
    });
}

// Display expositions
function displayExpositions(expositions) {
    const container = document.getElementById('expositions-container');
    
    if (expositions.length === 0) {
        container.innerHTML = '<div class="loading"><i class="fas fa-exclamation-circle"></i> Aucune exposition trouvée</div>';
        return;
    }
    
    container.innerHTML = '';
    
    expositions.forEach(exposition => {
        const card = createActivityCard(exposition);
        container.appendChild(card);
    });
}

// Create activity card
function createActivityCard(activity) {
    const card = document.createElement('div');
    card.className = 'activity-card';
    
    const languageColors = {
        'Anglais': '#FF1493',
        'Espagnol': '#FF4500',
        'Allemand': '#FFD700',
        'Japonais': '#FF69B4',
        'Italien': '#00CED1',
        'Arabe': '#9370DB',
        'International': '#00BFFF'
    };
    
    const color = languageColors[activity.Langue] || '#6b7280';
    card.style.borderLeftColor = color;
    
    // Time display
    let timeDisplay = '';
    let timeClass = '';
    if (!activity.Fin || activity.Fin === '') {
        timeDisplay = 'Toute la journée';
        timeClass = 'all-day';
    } else {
        timeDisplay = `${formatTime(activity.Début)} - ${formatTime(activity.Fin)}`;
    }
    
    // Date display
    const dateDisplay = formatDate(activity.Date);
    
    // Public badge
    const isPublic = activity.Publique === 'TRUE';
    const publicBadge = isPublic ? 
        '<span class="activity-badge badge-public"><i class="fas fa-globe"></i> Ouvert à tous</span>' : 
        '<span class="activity-badge badge-private"><i class="fas fa-lock"></i> Classe spécifique</span>';
    
    card.innerHTML = `
        <div class="activity-card-header">
            <h3>${activity.Titre}</h3>
            <button class="activity-expand-btn" onclick="toggleCard(event)">
                <i class="fas fa-chevron-down"></i>
            </button>
        </div>
        <div class="activity-date">
            <i class="fas fa-calendar-day"></i> ${dateDisplay}
        </div>
        <div class="activity-time ${timeClass}">
            <i class="fas fa-clock"></i> ${timeDisplay}
        </div>
        <div class="activity-meta">
            <span><i class="fas fa-language"></i> ${activity.Langue}</span>
            <span><i class="fas fa-map-marker-alt"></i> ${activity.Salle}</span>
            <span><i class="fas fa-tag"></i> ${activity['Activité']}</span>
        </div>
        ${activity.Professeur ? `<div class="activity-teacher"><i class="fas fa-chalkboard-teacher"></i> ${activity.Professeur}</div>` : ''}
        ${activity.Classe ? `<div class="activity-class"><i class="fas fa-users"></i> ${activity.Classe}</div>` : ''}
        <div class="activity-badges">
            ${publicBadge}
        </div>
        <div class="activity-description">
            <div class="activity-description-header">
                <i class="fas fa-info-circle"></i> Description
            </div>
            <p>${activity.Description || 'Aucune description disponible.'}</p>
        </div>
    `;
    
    // Click on card to toggle (except button)
    card.addEventListener('click', (e) => {
        if (!e.target.closest('.activity-expand-btn')) {
            card.classList.toggle('expanded');
        }
    });
    
    return card;
}

// Toggle card accordion
function toggleCard(event) {
    event.stopPropagation();
    const card = event.target.closest('.activity-card');
    card.classList.toggle('expanded');
}

// Show activity details in modal (kept for compatibility)
function showActivityDetails(activity) {
    const modal = document.getElementById('activityModal');
    const modalBody = document.getElementById('activityModalBody');
    
    const isPublic = activity.Publique === 'TRUE';
    const isThread = activity['Fils rouge'] === 'TRUE';
    
    let timeInfo = '';
    if (!activity.Fin || activity.Fin === '') {
        timeInfo = 'Activité sur toute la journée ou la semaine';
    } else {
        timeInfo = `${formatTime(activity.Début)} - ${formatTime(activity.Fin)}`;
    }
    
    const publicTag = isPublic ? 
        '<span class="activity-modal-tag"><i class="fas fa-globe"></i> Ouvert à tous</span>' : 
        '<span class="activity-modal-tag"><i class="fas fa-lock"></i> Classes : ' + activity.Classe + '</span>';
    
    const threadTag = isThread ? 
        '<span class="activity-modal-tag"><i class="fas fa-stream"></i> Fil rouge</span>' : '';
    
    modalBody.innerHTML = `
        <div class="activity-modal-header">
            <h2>${activity.Titre}</h2>
            <div class="activity-modal-tags">
                <span class="activity-modal-tag"><i class="fas fa-language"></i> ${activity.Langue}</span>
                <span class="activity-modal-tag"><i class="fas fa-tag"></i> ${activity['Activité']}</span>
                ${publicTag}
                ${threadTag}
            </div>
        </div>
        <div class="activity-modal-body">
            <div class="activity-detail-section">
                <h3><i class="fas fa-info-circle"></i> Informations pratiques</h3>
                <div class="activity-detail-grid">
                    <div class="activity-detail-item">
                        <strong><i class="fas fa-calendar"></i> Date</strong>
                        <span>${formatDate(activity.Date)}</span>
                    </div>
                    <div class="activity-detail-item">
                        <strong><i class="fas fa-clock"></i> Horaire</strong>
                        <span>${timeInfo}</span>
                    </div>
                    <div class="activity-detail-item">
                        <strong><i class="fas fa-map-marker-alt"></i> Lieu</strong>
                        <span>${activity.Salle}</span>
                    </div>
                    <div class="activity-detail-item">
                        <strong><i class="fas fa-chalkboard-teacher"></i> Professeur</strong>
                        <span>${activity.Professeur}</span>
                    </div>
                </div>
            </div>
            
            <div class="activity-detail-section">
                <h3><i class="fas fa-file-alt"></i> Description</h3>
                <div class="activity-description">${activity.Description}</div>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Close activity modal
function closeActivityModal() {
    const modal = document.getElementById('activityModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Close modal on outside click
window.addEventListener('click', (event) => {
    const modal = document.getElementById('activityModal');
    if (event.target === modal) {
        closeActivityModal();
    }
});

// Close modal on Escape key
window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        closeActivityModal();
    }
});

// Filter activities
function filterActivities() {
    const dateFilter = document.getElementById('filter-date').value;
    const langueFilter = document.getElementById('filter-langue').value;
    const typeFilter = document.getElementById('filter-type').value;
    const publicFilter = document.getElementById('filter-public').value;
    
    const filtered = activitiesData.filter(activity => {
        const dateMatch = !dateFilter || activity.Date === dateFilter;
        const langueMatch = !langueFilter || activity.Langue === langueFilter;
        const typeMatch = !typeFilter || activity['Activité'] === typeFilter;
        const publicMatch = !publicFilter || (activity.Publique === 'TRUE') === (publicFilter === 'true');
        
        return dateMatch && langueMatch && typeMatch && publicMatch;
    });
    
    // Sort filtered results
    sortActivitiesChronologically(filtered);
    
    // Separate and display
    displayActivitiesAndExpositions(filtered);
}

// Reset filters
function resetFilters() {
    document.getElementById('filter-date').value = '';
    document.getElementById('filter-langue').value = '';
    document.getElementById('filter-type').value = '';
    document.getElementById('filter-public').value = '';
    
    // Sort and display all activities
    sortActivitiesChronologically(activitiesData);
    displayActivitiesAndExpositions(activitiesData);
}

// ===========================================
// GAMES FILTERING
// ===========================================

// Filter games by category
function filterGames(category) {
    const gameItems = document.querySelectorAll('.game-item.compact');
    const categoryBtns = document.querySelectorAll('.category-btn');
    
    // Update active button
    categoryBtns.forEach(btn => btn.classList.remove('active'));
    event.target.closest('.category-btn').classList.add('active');
    
    // Show/hide games
    gameItems.forEach(item => {
        const itemCategory = item.dataset.category;
        
        if (category === 'all' || itemCategory === category) {
            item.classList.remove('hidden');
            // Fade in animation
            item.style.animation = 'fadeInUp 0.5s ease-out';
        } else {
            item.classList.add('hidden');
        }
    });
}

// Show error message
function showError(message) {
    const container = document.getElementById('activities-container');
    container.innerHTML = `
        <div class="loading" style="color: var(--danger-color);">
            <i class="fas fa-exclamation-triangle"></i> ${message}
        </div>
    `;
}

// Toggle mobile menu
function toggleMenu() {
    const menu = document.querySelector('.nav-menu');
    menu.classList.toggle('active');
}

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            // Close mobile menu if open
            document.querySelector('.nav-menu').classList.remove('active');
        }
    });
});

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.15)';
    } else {
        navbar.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    }
});

// ===========================================
// AFFICHES MODAL
// ===========================================

// Open affiche modal
function openAfficheModal(imgElement) {
    const modal = document.getElementById('afficheModal');
    const modalImg = document.getElementById('afficheModalImg');
    const caption = document.getElementById('afficheModalCaption');
    
    modal.style.display = 'block';
    modalImg.src = imgElement.src;
    caption.innerHTML = imgElement.alt;
    
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
}

// Close affiche modal
function closeAfficheModal() {
    const modal = document.getElementById('afficheModal');
    modal.style.display = 'none';
    
    // Restore body scroll
    document.body.style.overflow = 'auto';
}

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeAfficheModal();
    }
});

// ===========================================
// AUDIO PLAYER
// ===========================================

const audio = document.getElementById('hymneAudio');
const playPauseBtn = document.getElementById('playPauseBtn');
const loopBtn = document.getElementById('loopBtn');
const volumeSlider = document.getElementById('volumeSlider');
const volumeValue = document.getElementById('volumeValue');
const volumeIcon = document.getElementById('volumeIcon');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');
const progressFill = document.getElementById('progressFill');
const audioPlayer = document.querySelector('.audio-player');

// Set initial volume
audio.volume = 0.7;

// Initialize time display
currentTimeEl.textContent = '0:00';
durationEl.textContent = '0:00';

// Toggle Play/Pause
function togglePlayPause() {
    if (audio.paused) {
        audio.play();
        playPauseBtn.querySelector('i').classList.remove('fa-play');
        playPauseBtn.querySelector('i').classList.add('fa-pause');
        audioPlayer.classList.add('playing');
    } else {
        audio.pause();
        playPauseBtn.querySelector('i').classList.remove('fa-pause');
        playPauseBtn.querySelector('i').classList.add('fa-play');
        audioPlayer.classList.remove('playing');
    }
}

// Toggle Loop
function toggleLoop() {
    audio.loop = !audio.loop;
    loopBtn.classList.toggle('active');
}

// Change Volume
function changeVolume(value) {
    audio.volume = value / 100;
    volumeValue.textContent = value + '%';
    
    // Update volume icon
    if (value == 0) {
        volumeIcon.classList.remove('fa-volume-up', 'fa-volume-down');
        volumeIcon.classList.add('fa-volume-mute');
    } else if (value < 50) {
        volumeIcon.classList.remove('fa-volume-up', 'fa-volume-mute');
        volumeIcon.classList.add('fa-volume-down');
    } else {
        volumeIcon.classList.remove('fa-volume-down', 'fa-volume-mute');
        volumeIcon.classList.add('fa-volume-up');
    }
}

// Toggle Mute
function toggleMute() {
    if (audio.volume > 0) {
        audio.dataset.previousVolume = audio.volume;
        audio.volume = 0;
        volumeSlider.value = 0;
        volumeValue.textContent = '0%';
        volumeIcon.classList.remove('fa-volume-up', 'fa-volume-down');
        volumeIcon.classList.add('fa-volume-mute');
    } else {
        const previousVolume = audio.dataset.previousVolume || 0.7;
        audio.volume = previousVolume;
        volumeSlider.value = previousVolume * 100;
        volumeValue.textContent = Math.round(previousVolume * 100) + '%';
        changeVolume(previousVolume * 100);
    }
}

// Format time (seconds to MM:SS) for audio player
function formatAudioTime(seconds) {
    if (isNaN(seconds) || !isFinite(seconds)) {
        return '0:00';
    }
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Update progress bar
audio.addEventListener('timeupdate', () => {
    if (audio.duration && !isNaN(audio.duration)) {
        const progress = (audio.currentTime / audio.duration) * 100;
        progressFill.style.width = progress + '%';
        currentTimeEl.textContent = formatAudioTime(audio.currentTime);
    }
});

// Set duration when metadata is loaded
audio.addEventListener('loadedmetadata', () => {
    if (audio.duration && !isNaN(audio.duration)) {
        durationEl.textContent = formatAudioTime(audio.duration);
    }
});

// Also try on canplay event
audio.addEventListener('canplay', () => {
    if (audio.duration && !isNaN(audio.duration) && durationEl.textContent === '0:00') {
        durationEl.textContent = formatAudioTime(audio.duration);
    }
});

// Seek audio
function seekAudio(event) {
    if (!audio.duration || isNaN(audio.duration)) {
        return;
    }
    const progressBar = event.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const percentage = offsetX / rect.width;
    audio.currentTime = percentage * audio.duration;
}

// Reset play button when audio ends (if not looping)
audio.addEventListener('ended', () => {
    if (!audio.loop) {
        playPauseBtn.querySelector('i').classList.remove('fa-pause');
        playPauseBtn.querySelector('i').classList.add('fa-play');
        audioPlayer.classList.remove('playing');
    }
});
