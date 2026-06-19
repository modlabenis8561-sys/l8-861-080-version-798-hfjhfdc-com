const ready = (handler) => {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", handler);
  } else {
    handler();
  }
};

function initMenu() {
  const toggle = document.querySelector("[data-menu-toggle]");
  const nav = document.querySelector("[data-mobile-nav]");
  if (!toggle || !nav) {
    return;
  }
  toggle.addEventListener("click", () => {
    nav.classList.toggle("is-open");
  });
}

function initImageFallback() {
  document.querySelectorAll("img").forEach((image) => {
    image.addEventListener("error", () => {
      image.classList.add("image-missing");
    });
  });
}

function initHero() {
  const root = document.querySelector("[data-hero-carousel]");
  if (!root) {
    return;
  }
  const slides = Array.from(root.querySelectorAll(".hero-slide"));
  const prev = root.querySelector("[data-hero-prev]");
  const next = root.querySelector("[data-hero-next]");
  const dotsWrap = root.querySelector("[data-hero-dots]");
  if (slides.length <= 1) {
    return;
  }
  let current = 0;
  const dots = slides.map((slide, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "hero-dot";
    dot.setAttribute("aria-label", `切换到第${index + 1}部`);
    dot.addEventListener("click", () => show(index));
    dotsWrap.appendChild(dot);
    return dot;
  });
  const show = (index) => {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === current);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === current);
    });
  };
  prev?.addEventListener("click", () => show(current - 1));
  next?.addEventListener("click", () => show(current + 1));
  show(0);
  window.setInterval(() => show(current + 1), 5600);
}

function initFilters() {
  const input = document.querySelector("[data-search-input]");
  const cards = Array.from(document.querySelectorAll(".movie-card"));
  const chips = Array.from(document.querySelectorAll("[data-filter-chip]"));
  if (!input && chips.length === 0) {
    return;
  }
  let chipValue = "";
  const normalize = (value) => String(value || "").trim().toLowerCase();
  const apply = () => {
    const query = normalize(input?.value || "");
    const filter = normalize(chipValue);
    cards.forEach((card) => {
      const haystack = normalize([
        card.dataset.title,
        card.dataset.region,
        card.dataset.type,
        card.dataset.year,
        card.dataset.category,
        card.dataset.genre,
        card.dataset.tags
      ].join(" "));
      const matchQuery = !query || haystack.includes(query);
      const matchFilter = !filter || haystack.includes(filter);
      card.classList.toggle("is-hidden", !(matchQuery && matchFilter));
    });
  };
  input?.addEventListener("input", apply);
  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chips.forEach((item) => item.classList.remove("is-active"));
      chip.classList.add("is-active");
      chipValue = chip.dataset.filterValue || "";
      apply();
    });
  });
  apply();
}

function initPlayers() {
  document.querySelectorAll(".video-shell").forEach((shell) => {
    const video = shell.querySelector("video");
    const cover = shell.querySelector(".player-cover");
    const url = shell.dataset.videoUrl;
    if (!video || !cover || !url) {
      return;
    }
    let attached = false;
    const attach = () => {
      if (attached) {
        return;
      }
      attached = true;
      const HlsPlayer = window.Hls;
      if (HlsPlayer && HlsPlayer.isSupported()) {
        const hls = new HlsPlayer({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(url);
        hls.attachMedia(video);
        shell.hlsInstance = hls;
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
      }
    };
    const play = async () => {
      attach();
      try {
        await video.play();
        shell.classList.add("is-playing");
      } catch (error) {
        shell.classList.remove("is-playing");
      }
    };
    cover.addEventListener("click", play);
    video.addEventListener("play", () => shell.classList.add("is-playing"));
    video.addEventListener("pause", () => shell.classList.remove("is-playing"));
    video.addEventListener("ended", () => shell.classList.remove("is-playing"));
  });
}

ready(() => {
  initMenu();
  initImageFallback();
  initHero();
  initFilters();
  initPlayers();
});
