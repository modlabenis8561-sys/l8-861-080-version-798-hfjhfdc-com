const mobileToggle = document.querySelector('[data-mobile-toggle]');
const mobileNav = document.querySelector('[data-mobile-nav]');

if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', () => {
        mobileNav.classList.toggle('is-open');
    });
}

const hero = document.querySelector('[data-hero]');

if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let current = 0;
    let timer = null;

    const showSlide = (index) => {
        current = (index + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle('is-active', slideIndex === current);
        });
        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle('is-active', dotIndex === current);
        });
    };

    const startTimer = () => {
        window.clearInterval(timer);
        timer = window.setInterval(() => showSlide(current + 1), 5200);
    };

    dots.forEach((dot) => {
        dot.addEventListener('click', () => {
            showSlide(Number(dot.dataset.heroDot || 0));
            startTimer();
        });
    });

    if (prev) {
        prev.addEventListener('click', () => {
            showSlide(current - 1);
            startTimer();
        });
    }

    if (next) {
        next.addEventListener('click', () => {
            showSlide(current + 1);
            startTimer();
        });
    }

    startTimer();
}

const filterBar = document.querySelector('[data-filter-bar]');

if (filterBar) {
    const localSearch = filterBar.querySelector('[data-local-search]');
    const yearButtons = Array.from(filterBar.querySelectorAll('[data-filter-year]'));
    const cards = Array.from(document.querySelectorAll('[data-search-card]'));
    let activeYear = 'all';

    const normalize = (value) => String(value || '').trim().toLowerCase();

    const applyFilters = () => {
        const keyword = normalize(localSearch ? localSearch.value : '');
        cards.forEach((card) => {
            const haystack = normalize([
                card.dataset.title,
                card.dataset.year,
                card.dataset.region,
                card.dataset.genre
            ].join(' '));
            const yearMatched = activeYear === 'all' || card.dataset.year === activeYear;
            const keywordMatched = !keyword || haystack.includes(keyword);
            card.classList.toggle('is-hidden', !(yearMatched && keywordMatched));
        });
    };

    if (localSearch) {
        localSearch.addEventListener('input', applyFilters);
    }

    yearButtons.forEach((button) => {
        button.addEventListener('click', () => {
            activeYear = button.dataset.filterYear || 'all';
            yearButtons.forEach((item) => item.classList.toggle('is-active', item === button));
            applyFilters();
        });
    });
}
