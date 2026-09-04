const body = document.body;
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelectorAll(".nav a, .nav-cta");
const revealItems = document.querySelectorAll(".reveal");
const parallaxPanels = document.querySelectorAll("[data-parallax]");
const musicControl = document.querySelector(".music-control");
const musicButton = musicControl?.querySelector(".music-button");
const musicInput = musicControl?.querySelector("input");
const audio = musicControl?.querySelector("audio");

const setMenu = (open) => {
  body.classList.toggle("menu-open", open);
  menuToggle?.setAttribute("aria-expanded", String(open));
  menuToggle?.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
};

menuToggle?.addEventListener("click", () => {
  setMenu(!body.classList.contains("menu-open"));
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => setMenu(false));
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.14, rootMargin: "0px 0px -40px 0px" }
);

revealItems.forEach((item) => revealObserver.observe(item));

const updateParallax = () => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  parallaxPanels.forEach((panel) => {
    const rect = panel.getBoundingClientRect();
    const progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
    const offset = Math.max(-26, Math.min(26, (progress - 0.5) * 44));
    panel.style.setProperty("--parallax", `${offset}px`);
  });
};

let ticking = false;
window.addEventListener(
  "scroll",
  () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateParallax();
        ticking = false;
      });
      ticking = true;
    }
  },
  { passive: true }
);
window.addEventListener("resize", updateParallax);
updateParallax();

musicInput?.addEventListener("change", () => {
  const file = musicInput.files?.[0];
  if (!file || !audio) return;

  if (audio.dataset.objectUrl) {
    URL.revokeObjectURL(audio.dataset.objectUrl);
  }

  const objectUrl = URL.createObjectURL(file);
  audio.src = objectUrl;
  audio.dataset.objectUrl = objectUrl;
  audio.loop = true;
  musicButton?.focus();
});

musicButton?.addEventListener("click", async () => {
  if (!audio?.src) {
    musicInput?.click();
    return;
  }

  if (audio.paused) {
    await audio.play();
    musicButton.textContent = "Ⅱ";
    musicButton.setAttribute("aria-label", "Pause selected music");
  } else {
    audio.pause();
    musicButton.textContent = "♪";
    musicButton.setAttribute("aria-label", "Play selected music");
  }
});

window.addEventListener("beforeunload", () => {
  if (audio?.dataset.objectUrl) {
    URL.revokeObjectURL(audio.dataset.objectUrl);
  }
});
