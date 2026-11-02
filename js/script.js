// Bomba Casablanca - interacciones básicas

function initNavToggle() {
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.main-nav');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }
}

function marcarEnlaceActivo() {
  var current = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.main-nav a').forEach(function (link) {
    var href = link.getAttribute('href');
    if (href === current) {
      link.classList.add('active');
    }
  });
}

function initLightbox() {
  var grid = document.querySelector('.galeria-grid');
  if (!grid) return;

  var imgs = Array.prototype.slice.call(grid.querySelectorAll('.galeria-item img'));
  if (imgs.length === 0) return;

  var overlay = document.createElement('div');
  overlay.className = 'lightbox-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-hidden', 'true');
  overlay.innerHTML =
    '<button type="button" class="lightbox-cerrar" aria-label="Cerrar">&times;</button>' +
    '<button type="button" class="lightbox-anterior" aria-label="Foto anterior">&#10094;</button>' +
    '<img class="lightbox-imagen" src="" alt="">' +
    '<button type="button" class="lightbox-siguiente" aria-label="Foto siguiente">&#10095;</button>';
  document.body.appendChild(overlay);

  var imgEl = overlay.querySelector('.lightbox-imagen');
  var botonCerrar = overlay.querySelector('.lightbox-cerrar');
  var current = 0;

  function abrir(index) {
    current = index;
    imgEl.src = imgs[current].src;
    imgEl.alt = imgs[current].alt;
    overlay.classList.add('abierto');
    overlay.setAttribute('aria-hidden', 'false');
    botonCerrar.focus();
  }

  function cerrar() {
    overlay.classList.remove('abierto');
    overlay.setAttribute('aria-hidden', 'true');
  }

  function siguiente() {
    abrir((current + 1) % imgs.length);
  }

  function anterior() {
    abrir((current - 1 + imgs.length) % imgs.length);
  }

  imgs.forEach(function (img, index) {
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', function () {
      abrir(index);
    });
  });

  botonCerrar.addEventListener('click', cerrar);
  overlay.querySelector('.lightbox-siguiente').addEventListener('click', siguiente);
  overlay.querySelector('.lightbox-anterior').addEventListener('click', anterior);

  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) cerrar();
  });

  document.addEventListener('keydown', function (e) {
    if (!overlay.classList.contains('abierto')) return;
    if (e.key === 'Escape') cerrar();
    if (e.key === 'ArrowRight') siguiente();
    if (e.key === 'ArrowLeft') anterior();
  });
}

document.addEventListener('DOMContentLoaded', function () {
  initNavToggle();
  marcarEnlaceActivo();
  initLightbox();
});

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initNavToggle: initNavToggle,
    marcarEnlaceActivo: marcarEnlaceActivo,
    initLightbox: initLightbox
  };
}
