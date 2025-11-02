// API Configuration
const API_CONFIG = {
    // Jikan API (MyAnimeList unofficial API)
    JIKAN_BASE: 'https://api.jikan.moe/v4',
    // Consumet API for streaming
    CONSUMET_BASE: 'https://api-consumet-org-zeta-ten.vercel.app',
    // GogoAnime provider
    GOGOANIME: 'https://api-consumet-org-zeta-ten.vercel.app/anime/gogoanime'
};

// Global State
let currentPage = 'home';
let searchTimeout;

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
});

async function initializeApp() {
    showLoading(true);
    try {
        await Promise.all([
            loadTrendingAnime(),
            loadTopAnime(),
            loadAiringAnime(),
            loadTopManga()
        ]);
    } catch (error) {
        console.error('Error initializing app:', error);
        showError('حدث خطأ في تحميل البيانات. يرجى المحاولة مرة أخرى.');
    } finally {
        showLoading(false);
    }
}

function setupEventListeners() {
    // Search functionality
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');

    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });

    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        if (e.target.value.trim()) {
            searchTimeout = setTimeout(() => handleSearch(), 500);
        }
    });

    // Navigation
    document.querySelectorAll('[data-page]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = e.currentTarget.dataset.page;
            navigateToPage(page);
        });
    });

    // Mobile menu
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');

    mobileMenuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });

    // Modal close
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', closeModal);
    });

    // Close modal on outside click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    });

    // Logo click - return to home
    document.querySelector('.logo').addEventListener('click', () => {
        navigateToPage('home');
    });
}

// API Functions
async function fetchJikan(endpoint, params = {}) {
    try {
        const queryString = new URLSearchParams(params).toString();
        const url = `${API_CONFIG.JIKAN_BASE}${endpoint}${queryString ? '?' + queryString : ''}`;
        const response = await fetch(url);

        if (!response.ok) throw new Error('API request failed');

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Jikan API Error:', error);
        throw error;
    }
}

async function fetchConsumet(endpoint, params = {}) {
    try {
        const queryString = new URLSearchParams(params).toString();
        const url = `${API_CONFIG.CONSUMET_BASE}${endpoint}${queryString ? '?' + queryString : ''}`;
        const response = await fetch(url);

        if (!response.ok) throw new Error('API request failed');

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Consumet API Error:', error);
        throw error;
    }
}

// Load Content Functions
async function loadTrendingAnime() {
    try {
        const data = await fetchJikan('/top/anime', {
            filter: 'bypopularity',
            limit: 12
        });

        displayAnimeGrid(data.data, 'trendingAnime');
    } catch (error) {
        console.error('Error loading trending anime:', error);
    }
}

async function loadTopAnime() {
    try {
        const data = await fetchJikan('/top/anime', {
            limit: 12
        });

        displayAnimeGrid(data.data, 'topAnime');
    } catch (error) {
        console.error('Error loading top anime:', error);
    }
}

async function loadAiringAnime() {
    try {
        const data = await fetchJikan('/seasons/now', {
            limit: 12
        });

        displayAnimeGrid(data.data, 'airingAnime');
    } catch (error) {
        console.error('Error loading airing anime:', error);
    }
}

async function loadTopManga() {
    try {
        const data = await fetchJikan('/top/manga', {
            limit: 12
        });

        displayAnimeGrid(data.data, 'topManga', true);
    } catch (error) {
        console.error('Error loading top manga:', error);
    }
}

// Display Functions
function displayAnimeGrid(items, containerId, isManga = false) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = items.map(item => createAnimeCard(item, isManga)).join('');

    // Add click listeners
    container.querySelectorAll('.anime-card').forEach((card, index) => {
        card.addEventListener('click', () => showDetails(items[index], isManga));
    });
}

function createAnimeCard(item, isManga = false) {
    const title = item.title || item.title_english || 'عنوان غير متوفر';
    const image = item.images?.jpg?.large_image_url || item.images?.jpg?.image_url || '';
    const score = item.score || 'N/A';
    const type = item.type || 'Unknown';
    const episodes = item.episodes || item.chapters || '?';
    const status = item.status || '';
    const isAiring = status === 'Currently Airing';

    return `
        <div class="anime-card" data-id="${item.mal_id}">
            <div class="anime-card-image">
                <img src="${image}" alt="${title}" loading="lazy">
                ${score !== 'N/A' ? `
                    <div class="anime-card-rating">
                        <i class="fas fa-star"></i>
                        ${score}
                    </div>
                ` : ''}
                ${isAiring ? '<div class="anime-card-badge">يُعرض الآن</div>' : ''}
            </div>
            <div class="anime-card-content">
                <h3 class="anime-card-title">${title}</h3>
                <div class="anime-card-info">
                    <span class="anime-card-type">${type}</span>
                    <span class="anime-card-episodes">
                        <i class="fas fa-${isManga ? 'book' : 'film'}"></i>
                        ${episodes}
                    </span>
                </div>
            </div>
        </div>
    `;
}

async function showDetails(item, isManga = false) {
    const modal = document.getElementById('detailModal');
    const modalBody = document.getElementById('modalBody');

    showLoading(true);

    try {
        // Fetch full details
        const endpoint = isManga ? `/manga/${item.mal_id}` : `/anime/${item.mal_id}`;
        const response = await fetchJikan(endpoint);
        const details = response.data;

        const title = details.title || details.title_english || 'عنوان غير متوفر';
        const image = details.images?.jpg?.large_image_url || '';
        const synopsis = details.synopsis || 'لا يوجد وصف متاح.';
        const score = details.score || 'N/A';
        const type = details.type || 'Unknown';
        const episodes = details.episodes || details.chapters || '?';
        const status = details.status || 'Unknown';
        const genres = details.genres || [];
        const studios = details.studios || [];
        const year = details.year || details.published?.prop?.from?.year || 'N/A';
        const duration = details.duration || 'N/A';

        modalBody.innerHTML = `
            <div class="detail-header">
                <div class="detail-poster">
                    <img src="${image}" alt="${title}">
                </div>
                <div class="detail-info">
                    <h2 class="detail-title">${title}</h2>
                    <div class="detail-meta">
                        ${score !== 'N/A' ? `
                            <div class="meta-item">
                                <i class="fas fa-star"></i>
                                <span>${score}</span>
                            </div>
                        ` : ''}
                        <div class="meta-item">
                            <i class="fas fa-tv"></i>
                            <span>${type}</span>
                        </div>
                        ${!isManga ? `
                            <div class="meta-item">
                                <i class="fas fa-film"></i>
                                <span>${episodes} حلقة</span>
                            </div>
                        ` : `
                            <div class="meta-item">
                                <i class="fas fa-book"></i>
                                <span>${episodes} فصل</span>
                            </div>
                        `}
                        <div class="meta-item">
                            <i class="fas fa-calendar"></i>
                            <span>${year}</span>
                        </div>
                        ${!isManga && duration !== 'N/A' ? `
                            <div class="meta-item">
                                <i class="fas fa-clock"></i>
                                <span>${duration}</span>
                            </div>
                        ` : ''}
                    </div>
                    <div class="detail-synopsis">
                        <p>${synopsis}</p>
                    </div>
                    ${genres.length > 0 ? `
                        <div class="detail-genres">
                            ${genres.map(g => `<span class="genre-tag">${g.name}</span>`).join('')}
                        </div>
                    ` : ''}
                    ${studios.length > 0 ? `
                        <div class="detail-meta">
                            <div class="meta-item">
                                <i class="fas fa-building"></i>
                                <span>${studios.map(s => s.name).join(', ')}</span>
                            </div>
                        </div>
                    ` : ''}
                    <div class="detail-actions">
                        ${!isManga && details.episodes ? `
                            <button class="btn btn-primary" onclick="watchAnime('${details.title}', ${details.episodes})">
                                <i class="fas fa-play"></i>
                                شاهد الآن
                            </button>
                        ` : ''}
                        <button class="btn btn-secondary" onclick="window.open('${details.url}', '_blank')">
                            <i class="fas fa-external-link-alt"></i>
                            المزيد من المعلومات
                        </button>
                    </div>
                </div>
            </div>
        `;

        modal.classList.add('active');
    } catch (error) {
        console.error('Error loading details:', error);
        showError('حدث خطأ في تحميل التفاصيل.');
    } finally {
        showLoading(false);
    }
}

async function watchAnime(title, totalEpisodes) {
    closeModal();

    const playerModal = document.getElementById('playerModal');
    const episodeSelector = document.getElementById('episodeSelector');
    const videoContainer = document.getElementById('videoContainer');

    showLoading(true);

    try {
        // Search for anime on GogoAnime
        const searchQuery = title.replace(/[^\w\s]/gi, '').replace(/\s+/g, '-').toLowerCase();

        // Create episode selector
        episodeSelector.innerHTML = `
            <h3>اختر الحلقة:</h3>
            <div class="episode-grid">
                ${Array.from({ length: Math.min(totalEpisodes, 24) }, (_, i) => `
                    <button class="episode-btn" data-episode="${i + 1}">
                        ${i + 1}
                    </button>
                `).join('')}
            </div>
        `;

        // Add episode click listeners
        episodeSelector.querySelectorAll('.episode-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                // Remove active class from all buttons
                episodeSelector.querySelectorAll('.episode-btn').forEach(b => b.classList.remove('active'));
                // Add active class to clicked button
                e.target.classList.add('active');

                const episode = e.target.dataset.episode;
                await loadEpisode(searchQuery, episode);
            });
        });

        videoContainer.innerHTML = `
            <div style="padding: 2rem; text-align: center; color: var(--text-secondary);">
                <i class="fas fa-info-circle" style="font-size: 3rem; margin-bottom: 1rem; color: var(--primary-color);"></i>
                <p style="font-size: 1.2rem;">اختر حلقة من الأعلى لبدء المشاهدة</p>
                <p style="margin-top: 1rem; font-size: 0.9rem;">ملاحظة: بعض الأنميات قد لا تكون متوفرة على الخوادم</p>
            </div>
        `;

        playerModal.classList.add('active');
    } catch (error) {
        console.error('Error loading anime:', error);
        showError('حدث خطأ في تحميل الأنمي.');
    } finally {
        showLoading(false);
    }
}

async function loadEpisode(animeId, episode) {
    const videoContainer = document.getElementById('videoContainer');

    videoContainer.innerHTML = `
        <div style="padding: 2rem; text-align: center;">
            <div class="spinner" style="margin: 0 auto;"></div>
            <p style="margin-top: 1rem; color: var(--text-secondary);">جاري تحميل الحلقة ${episode}...</p>
        </div>
    `;

    try {
        // Try to search and load the anime
        const searchUrl = `${API_CONFIG.GOGOANIME}/${animeId}`;

        // For now, we'll use a generic video player message
        // In production, you would integrate with actual streaming sources
        videoContainer.innerHTML = `
            <div style="padding: 3rem; text-align: center; color: var(--text-secondary);">
                <i class="fas fa-video" style="font-size: 4rem; margin-bottom: 1rem; color: var(--primary-color);"></i>
                <h3 style="margin-bottom: 1rem;">الحلقة ${episode}</h3>
                <p style="font-size: 1.1rem; margin-bottom: 2rem;">
                    للمشاهدة، يرجى زيارة مواقع البث المعتمدة
                </p>
                <div style="background: rgba(255, 107, 107, 0.1); padding: 1.5rem; border-radius: 15px; margin-top: 2rem;">
                    <p style="font-size: 0.95rem; line-height: 1.8;">
                        <i class="fas fa-info-circle"></i>
                        هذا الموقع يعرض معلومات الأنمي فقط. للمشاهدة الفعلية، يمكنك زيارة منصات مثل:
                        <br><br>
                        • Crunchyroll<br>
                        • Funimation<br>
                        • Netflix<br>
                        • Amazon Prime Video
                    </p>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error loading episode:', error);
        videoContainer.innerHTML = `
            <div style="padding: 2rem; text-align: center; color: var(--text-secondary);">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem; color: var(--primary-color);"></i>
                <p>عذراً، لم نتمكن من تحميل هذه الحلقة</p>
            </div>
        `;
    }
}

// Search Function
async function handleSearch() {
    const searchInput = document.getElementById('searchInput');
    const query = searchInput.value.trim();

    if (!query) return;

    showLoading(true);

    try {
        const data = await fetchJikan('/anime', {
            q: query,
            limit: 24
        });

        const searchResults = document.getElementById('searchResults');
        const searchGrid = document.getElementById('searchGrid');

        // Hide other sections
        document.querySelectorAll('.content-section').forEach(section => {
            if (section.id !== 'searchResults') {
                section.style.display = 'none';
            }
        });

        searchResults.classList.remove('hidden');
        displayAnimeGrid(data.data, 'searchGrid');
    } catch (error) {
        console.error('Error searching:', error);
        showError('حدث خطأ في البحث.');
    } finally {
        showLoading(false);
    }
}

// Navigation
function navigateToPage(page) {
    currentPage = page;

    // Update active nav link
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === page) {
            link.classList.add('active');
        }
    });

    // Show relevant sections
    const searchResults = document.getElementById('searchResults');
    searchResults.classList.add('hidden');

    document.querySelectorAll('.content-section').forEach(section => {
        if (section.id !== 'searchResults') {
            section.style.display = 'block';
        }
    });

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Close mobile menu
    document.querySelector('.nav-menu').classList.remove('active');
}

function scrollToSection(sectionId) {
    const element = document.getElementById(`${sectionId}Section`);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Modal Functions
function closeModal() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
}

// Utility Functions
function showLoading(show) {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
        spinner.style.display = show ? 'block' : 'none';
    }
}

function showError(message) {
    // Create a simple error notification
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--primary-color);
        color: white;
        padding: 1rem 2rem;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        z-index: 9999;
        animation: slideIn 0.3s ease;
    `;
    notification.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        ${message}
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
