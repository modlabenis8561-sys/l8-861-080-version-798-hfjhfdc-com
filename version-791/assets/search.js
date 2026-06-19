const movies = Array.isArray(window.MOVIE_SEARCH_DATA) ? window.MOVIE_SEARCH_DATA : [];
const form = document.querySelector('[data-search-form]');
const input = document.querySelector('[data-search-input]');
const results = document.querySelector('[data-search-results]');
const status = document.querySelector('[data-search-status]');

const escapeHtml = (value) => String(value || '').replace(/[&<>"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;'
}[char]));

const normalize = (value) => String(value || '').trim().toLowerCase();

const cardTemplate = (movie) => {
    const tags = (movie.tags || []).slice(0, 3).map((tag) => `<span>${escapeHtml(tag)}</span>`).join('');
    return `
        <article class="movie-card" data-search-card>
            <a class="movie-poster" href="${escapeHtml(movie.url)}" aria-label="观看${escapeHtml(movie.title)}">
                <img src="${escapeHtml(movie.cover)}" alt="${escapeHtml(movie.title)}海报" loading="lazy">
                <span class="poster-badge">${escapeHtml(movie.score)}</span>
            </a>
            <div class="movie-card-body">
                <div class="movie-meta-line">
                    <span>${escapeHtml(movie.category)}</span>
                    <span>${escapeHtml(movie.year)}</span>
                    <span>${escapeHtml(movie.region)}</span>
                </div>
                <h3><a href="${escapeHtml(movie.url)}">${escapeHtml(movie.title)}</a></h3>
                <p>${escapeHtml(movie.oneLine)}</p>
                <div class="tag-row">${tags}</div>
            </div>
        </article>
    `;
};

const render = (keyword) => {
    const query = normalize(keyword);

    if (!query) {
        if (status) {
            status.textContent = '请输入关键词开始搜索。';
        }
        if (results) {
            results.innerHTML = '';
        }
        return;
    }

    const matched = movies.filter((movie) => normalize([
        movie.title,
        movie.year,
        movie.region,
        movie.type,
        movie.genre,
        movie.category,
        (movie.tags || []).join(' '),
        movie.oneLine
    ].join(' ')).includes(query)).slice(0, 120);

    if (status) {
        status.textContent = matched.length ? `找到 ${matched.length} 条相关影片。` : '没有找到匹配影片，请更换关键词。';
    }

    if (results) {
        results.innerHTML = matched.map(cardTemplate).join('');
    }
};

if (form && input) {
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q') || '';
    input.value = initialQuery;
    render(initialQuery);

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        render(input.value);
        const params = new URLSearchParams(window.location.search);
        params.set('q', input.value);
        history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`);
    });

    input.addEventListener('input', () => render(input.value));
}
