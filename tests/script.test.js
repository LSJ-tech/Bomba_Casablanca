const { initNavToggle, marcarEnlaceActivo, initLightbox } = require('../js/script.js');

function setLocationPath(pathname) {
  window.history.pushState({}, '', pathname);
}

describe('initNavToggle', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <button class="nav-toggle">Menú</button>
      <nav class="main-nav"></nav>
    `;
  });

  test('abre el menú al hacer clic (agrega la clase open)', () => {
    initNavToggle();
    document.querySelector('.nav-toggle').click();
    expect(document.querySelector('.main-nav').classList.contains('open')).toBe(true);
  });

  test('cierra el menú en el segundo clic (quita la clase open)', () => {
    initNavToggle();
    var boton = document.querySelector('.nav-toggle');
    boton.click();
    boton.click();
    expect(document.querySelector('.main-nav').classList.contains('open')).toBe(false);
  });

  test('no falla si falta el botón', () => {
    document.body.innerHTML = '<nav class="main-nav"></nav>';
    expect(() => initNavToggle()).not.toThrow();
  });

  test('no falla si falta el nav', () => {
    document.body.innerHTML = '<button class="nav-toggle">Menú</button>';
    expect(() => initNavToggle()).not.toThrow();
  });
});

describe('marcarEnlaceActivo', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <nav class="main-nav">
        <ul>
          <li><a href="index.html">Inicio</a></li>
          <li><a href="historia.html">Historia</a></li>
          <li><a href="directorio.html">Directorio</a></li>
        </ul>
      </nav>
    `;
  });

  test('marca como activo solo el enlace que coincide con la página actual', () => {
    setLocationPath('/historia.html');
    marcarEnlaceActivo();

    var enlaces = document.querySelectorAll('.main-nav a');
    expect(enlaces[0].classList.contains('active')).toBe(false);
    expect(enlaces[1].classList.contains('active')).toBe(true);
    expect(enlaces[2].classList.contains('active')).toBe(false);
  });

  test('usa index.html cuando la ruta termina en /', () => {
    setLocationPath('/');
    marcarEnlaceActivo();

    expect(document.querySelector('a[href="index.html"]').classList.contains('active')).toBe(true);
  });
});

describe('initLightbox', () => {
  afterEach(() => {
    document.querySelectorAll('.lightbox-overlay').forEach(function (el) {
      el.remove();
    });
  });

  test('no falla si no existe la galería', () => {
    document.body.innerHTML = '<main></main>';
    expect(() => initLightbox()).not.toThrow();
    expect(document.querySelector('.lightbox-overlay')).toBeNull();
  });

  test('no crea el overlay si la galería no tiene fotos reales', () => {
    document.body.innerHTML = `
      <div class="galeria-grid">
        <div class="galeria-item">Foto pendiente</div>
      </div>
    `;
    initLightbox();
    expect(document.querySelector('.lightbox-overlay')).toBeNull();
  });

  test('abre el lightbox con la foto, navega y cierra', () => {
    document.body.innerHTML = `
      <div class="galeria-grid">
        <div class="galeria-item"><img src="img/uno.jpg" alt="Uno"></div>
        <div class="galeria-item"><img src="img/dos.jpg" alt="Dos"></div>
      </div>
    `;
    initLightbox();

    const imgs = document.querySelectorAll('.galeria-item img');
    const overlay = document.querySelector('.lightbox-overlay');
    const lightboxImg = overlay.querySelector('.lightbox-imagen');

    imgs[0].click();
    expect(overlay.classList.contains('abierto')).toBe(true);
    expect(lightboxImg.alt).toBe('Uno');

    overlay.querySelector('.lightbox-siguiente').click();
    expect(lightboxImg.alt).toBe('Dos');

    overlay.querySelector('.lightbox-siguiente').click();
    expect(lightboxImg.alt).toBe('Uno');

    overlay.querySelector('.lightbox-anterior').click();
    expect(lightboxImg.alt).toBe('Dos');

    overlay.querySelector('.lightbox-cerrar').click();
    expect(overlay.classList.contains('abierto')).toBe(false);
  });

  test('se cierra al hacer clic fuera de la imagen, pero no al hacer clic dentro', () => {
    document.body.innerHTML = `
      <div class="galeria-grid">
        <div class="galeria-item"><img src="img/uno.jpg" alt="Uno"></div>
      </div>
    `;
    initLightbox();
    const overlay = document.querySelector('.lightbox-overlay');
    document.querySelector('.galeria-item img').click();

    overlay.querySelector('.lightbox-imagen').click();
    expect(overlay.classList.contains('abierto')).toBe(true);

    overlay.click();
    expect(overlay.classList.contains('abierto')).toBe(false);
  });

  test('el teclado navega y cierra solo cuando el lightbox está abierto', () => {
    document.body.innerHTML = `
      <div class="galeria-grid">
        <div class="galeria-item"><img src="img/uno.jpg" alt="Uno"></div>
        <div class="galeria-item"><img src="img/dos.jpg" alt="Dos"></div>
      </div>
    `;
    initLightbox();
    const overlay = document.querySelector('.lightbox-overlay');
    const lightboxImg = overlay.querySelector('.lightbox-imagen');

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    expect(overlay.classList.contains('abierto')).toBe(false);

    document.querySelectorAll('.galeria-item img')[0].click();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    expect(lightboxImg.alt).toBe('Dos');

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    expect(lightboxImg.alt).toBe('Uno');

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(overlay.classList.contains('abierto')).toBe(false);
  });
});

describe('cableado en DOMContentLoaded', () => {
  test('al disparar DOMContentLoaded, se inicializa el toggle y se marca el enlace activo', () => {
    document.body.innerHTML = `
      <button class="nav-toggle">Menú</button>
      <nav class="main-nav">
        <ul>
          <li><a href="index.html">Inicio</a></li>
          <li><a href="historia.html">Historia</a></li>
        </ul>
      </nav>
    `;
    setLocationPath('/historia.html');

    document.dispatchEvent(new Event('DOMContentLoaded'));
    document.querySelector('.nav-toggle').click();

    expect(document.querySelector('.main-nav').classList.contains('open')).toBe(true);
    expect(document.querySelector('a[href="historia.html"]').classList.contains('active')).toBe(true);
  });
});
