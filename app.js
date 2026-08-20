const revealElements = document.querySelectorAll('.reveal');

const hero = document.querySelector('.hero');
const heroSlides = [...document.querySelectorAll('[data-slide]')];
const heroDots = [...document.querySelectorAll('[data-hero-dot]')];
const heroIndex = document.querySelector('[data-hero-index]');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let activeHeroSlide = 0;
let heroTimer;

const showHeroSlide = (nextIndex) => {
  activeHeroSlide = (nextIndex + heroSlides.length) % heroSlides.length;
  const activeSlide = heroSlides[activeHeroSlide];
  hero.classList.toggle('is-dark', activeSlide.dataset.theme === 'dark');

  heroSlides.forEach((slide, index) => {
    slide.classList.toggle('is-active', index === activeHeroSlide);
    slide.setAttribute('aria-hidden', String(index !== activeHeroSlide));
  });

  heroDots.forEach((dot, index) => {
    const isCurrent = index === activeHeroSlide;
    dot.classList.toggle('is-active', isCurrent);
    dot.setAttribute('aria-current', isCurrent ? 'true' : 'false');
  });

  heroIndex.textContent = String(activeHeroSlide + 1).padStart(2, '0');
};

const stopHeroAutoplay = () => clearInterval(heroTimer);
const startHeroAutoplay = () => {
  stopHeroAutoplay();
  if (!reduceMotion) {
    heroTimer = setInterval(() => showHeroSlide(activeHeroSlide + 1), 5500);
  }
};

document.querySelector('[data-hero-prev]').addEventListener('click', () => {
  showHeroSlide(activeHeroSlide - 1);
  startHeroAutoplay();
});

document.querySelector('[data-hero-next]').addEventListener('click', () => {
  showHeroSlide(activeHeroSlide + 1);
  startHeroAutoplay();
});

heroDots.forEach((dot, index) => dot.addEventListener('click', () => {
  showHeroSlide(index);
  startHeroAutoplay();
}));

hero.addEventListener('mouseenter', stopHeroAutoplay);
hero.addEventListener('mouseleave', startHeroAutoplay);
hero.addEventListener('focusin', stopHeroAutoplay);
hero.addEventListener('focusout', startHeroAutoplay);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) stopHeroAutoplay();
  else startHeroAutoplay();
});

showHeroSlide(0);
startHeroAutoplay();

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealElements.forEach((el) => observer.observe(el));
} else {
  revealElements.forEach((el) => el.classList.add('visible'));
}

const toast = document.querySelector('.toast');
let toastTimer;
document.querySelectorAll('[data-add]').forEach((button) => {
  button.addEventListener('click', () => {
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
  });
});

const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-button');
const headerPlaceholder = document.createElement('div');
headerPlaceholder.className = 'header-placeholder';
header.insertAdjacentElement('afterend', headerPlaceholder);

let headerRevealFrame;
let headerResetTimer;

const updateFixedHeader = () => {
  const triggerPoint = Math.max(140, window.innerHeight * 0.2);
  const shouldFix = window.scrollY > triggerPoint;

  if (shouldFix && !header.classList.contains('is-fixed')) {
    clearTimeout(headerResetTimer);
    headerPlaceholder.style.height = `${header.offsetHeight}px`;
    header.classList.add('is-fixed');

    headerRevealFrame = requestAnimationFrame(() => {
      requestAnimationFrame(() => header.classList.add('is-visible'));
    });
  } else if (!shouldFix && header.classList.contains('is-fixed')) {
    cancelAnimationFrame(headerRevealFrame);
    header.classList.remove('is-visible');
    headerResetTimer = setTimeout(() => {
      header.classList.remove('is-fixed');
      headerPlaceholder.style.height = '0px';
    }, 420);
  }
};

let scrollFrame;
window.addEventListener('scroll', () => {
  cancelAnimationFrame(scrollFrame);
  scrollFrame = requestAnimationFrame(updateFixedHeader);
}, { passive: true });

window.addEventListener('resize', () => {
  if (header.classList.contains('is-fixed')) {
    headerPlaceholder.style.height = `${header.offsetHeight}px`;
  }
});

updateFixedHeader();

menuButton.addEventListener('click', () => {
  const isOpen = header.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
  menuButton.textContent = isOpen ? '×' : '☰';
});

header.querySelectorAll('nav a').forEach((link) => link.addEventListener('click', () => {
  header.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.textContent = '☰';
}));
