const { initFormPostulacion, esMenorDeEdad, actualizarSeccionApoderado } = require('../js/postulacion.js');

function construirFormulario() {
  document.body.innerHTML = `
    <form id="form-postulacion" class="form-postulacion" novalidate>
      <input type="text" id="website" name="website">
      <input type="text" id="nombre" name="nombre" required>
      <input type="text" id="rut" name="rut" required>
      <input type="date" id="fecha_nacimiento" name="fecha_nacimiento" required>
      <input type="tel" id="telefono" name="telefono" required>
      <input type="email" id="correo" name="correo" required>
      <input type="text" id="direccion" name="direccion" required>
      <div id="seccion-apoderado" style="display:none;">
        <input type="text" id="apoderado_nombre" name="apoderado_nombre">
        <input type="tel" id="apoderado_telefono" name="apoderado_telefono">
        <input type="email" id="apoderado_correo" name="apoderado_correo">
      </div>
      <textarea id="motivo" name="motivo" required></textarea>
      <input type="checkbox" id="consentimiento" name="consentimiento" required>
      <output id="form-mensaje" class="form-mensaje"></output>
      <button type="submit" id="form-enviar">Enviar Postulación</button>
    </form>
  `;
}

// 11.111.111-1 es un RUT con dígito verificador válido, usado comúnmente para pruebas.
function llenarFormularioValido(opciones) {
  opciones = opciones || {};
  document.getElementById('nombre').value = '  Juana   Pérez  ';
  document.getElementById('rut').value = '11.111.111-1';
  document.getElementById('fecha_nacimiento').value = opciones.fechaNacimiento || '2000-01-01';
  document.getElementById('telefono').value = '912345678';
  document.getElementById('correo').value = '  Juana@Example.com  ';
  document.getElementById('direccion').value = 'Calle Falsa 123, Casablanca';
  document.getElementById('motivo').value = 'Quiero ayudar a mi comunidad.';
  document.getElementById('consentimiento').checked = true;

  if (opciones.apoderado) {
    document.getElementById('apoderado_nombre').value = '  Pedro   Pérez  ';
    document.getElementById('apoderado_telefono').value = '987654321';
    document.getElementById('apoderado_correo').value = '  Pedro@Example.com  ';
  }
}

function fechaHaceAnios(anios) {
  var hoy = new Date();
  return (hoy.getFullYear() - anios) + '-01-01';
}

describe('esMenorDeEdad', () => {
  test('da true para una fecha de hace 10 años', () => {
    expect(esMenorDeEdad(fechaHaceAnios(10))).toBe(true);
  });

  test('da false para una fecha de hace 30 años', () => {
    expect(esMenorDeEdad(fechaHaceAnios(30))).toBe(false);
  });

  test('da false si no hay fecha', () => {
    expect(esMenorDeEdad('')).toBe(false);
  });
});

describe('actualizarSeccionApoderado', () => {
  beforeEach(() => {
    construirFormulario();
  });

  test('muestra la sección y marca los campos como requeridos si es menor de edad', () => {
    document.getElementById('fecha_nacimiento').value = fechaHaceAnios(10);
    actualizarSeccionApoderado(document.getElementById('form-postulacion'));

    expect(document.getElementById('seccion-apoderado').style.display).toBe('');
    expect(document.getElementById('apoderado_nombre').required).toBe(true);
    expect(document.getElementById('apoderado_telefono').required).toBe(true);
    expect(document.getElementById('apoderado_correo').required).toBe(true);
  });

  test('oculta la sección y limpia los campos si es mayor de edad', () => {
    document.getElementById('apoderado_nombre').value = 'Algo que quedó escrito antes';
    document.getElementById('fecha_nacimiento').value = fechaHaceAnios(30);
    actualizarSeccionApoderado(document.getElementById('form-postulacion'));

    expect(document.getElementById('seccion-apoderado').style.display).toBe('none');
    expect(document.getElementById('apoderado_nombre').required).toBe(false);
    expect(document.getElementById('apoderado_nombre').value).toBe('');
  });
});

describe('initFormPostulacion', () => {
  beforeEach(() => {
    construirFormulario();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('no falla si no existe el formulario en la página', () => {
    document.body.innerHTML = '<main></main>';
    expect(() => initFormPostulacion()).not.toThrow();
  });

  test('formatea el RUT al salir del campo (blur)', () => {
    initFormPostulacion();
    const campoRut = document.getElementById('rut');
    campoRut.value = '111111111';
    campoRut.dispatchEvent(new Event('blur'));

    expect(campoRut.value).toBe('11.111.111-1');
  });

  test('muestra la sección del apoderado al cambiar a una fecha de menor de edad', () => {
    initFormPostulacion();
    const campoFecha = document.getElementById('fecha_nacimiento');
    campoFecha.value = fechaHaceAnios(10);
    campoFecha.dispatchEvent(new Event('change'));

    expect(document.getElementById('seccion-apoderado').style.display).toBe('');
  });

  test('no envía la petición si el formulario es inválido', () => {
    initFormPostulacion();
    document.getElementById('form-postulacion').dispatchEvent(new Event('submit', { cancelable: true }));

    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('no envía la petición si el RUT no es válido, y muestra un mensaje de error', () => {
    initFormPostulacion();
    llenarFormularioValido();
    document.getElementById('rut').value = '12.345.678-9';

    document.getElementById('form-postulacion').dispatchEvent(new Event('submit', { cancelable: true }));

    expect(global.fetch).not.toHaveBeenCalled();
    const mensaje = document.getElementById('form-mensaje');
    expect(mensaje.className).toContain('error');
    expect(mensaje.textContent).toContain('RUT');
  });

  test('no envía la petición de un menor de edad si faltan los datos del apoderado', () => {
    initFormPostulacion();
    llenarFormularioValido({ fechaNacimiento: fechaHaceAnios(10) });
    // No se llenan los campos de apoderado; checkValidity() debe fallar porque quedaron required.
    actualizarSeccionApoderado(document.getElementById('form-postulacion'));

    document.getElementById('form-postulacion').dispatchEvent(new Event('submit', { cancelable: true }));

    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('envía los datos normalizados de un voluntario(a) mayor de edad', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ok: true })
    });

    initFormPostulacion();
    llenarFormularioValido();

    document.getElementById('form-postulacion').dispatchEvent(new Event('submit', { cancelable: true }));
    await new Promise(process.nextTick);
    await new Promise(process.nextTick);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [, opciones] = global.fetch.mock.calls[0];
    const enviado = JSON.parse(opciones.body);
    expect(enviado.tipo).toBe('voluntario');
    expect(enviado.nombre).toBe('Juana Pérez');
    expect(enviado.rut).toBe('11.111.111-1');
    expect(enviado.telefono).toBe('+56912345678');
    expect(enviado.correo).toBe('juana@example.com');
    expect(enviado.apoderado_nombre).toBeUndefined();

    const mensaje = document.getElementById('form-mensaje');
    expect(mensaje.className).toContain('exito');
    expect(document.getElementById('form-enviar').disabled).toBe(false);
  });

  test('envía los datos de un Brigadier/Cadete menor de edad junto con los del apoderado', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ok: true })
    });

    initFormPostulacion();
    llenarFormularioValido({ fechaNacimiento: fechaHaceAnios(10), apoderado: true });
    actualizarSeccionApoderado(document.getElementById('form-postulacion'));

    document.getElementById('form-postulacion').dispatchEvent(new Event('submit', { cancelable: true }));
    await new Promise(process.nextTick);
    await new Promise(process.nextTick);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [, opciones] = global.fetch.mock.calls[0];
    const enviado = JSON.parse(opciones.body);
    expect(enviado.tipo).toBe('cadete');
    expect(enviado.apoderado_nombre).toBe('Pedro Pérez');
    expect(enviado.apoderado_telefono).toBe('+56987654321');
    expect(enviado.apoderado_correo).toBe('pedro@example.com');
  });

  test('muestra un mensaje de error si la petición falla', async () => {
    global.fetch.mockResolvedValue({ ok: false });

    initFormPostulacion();
    llenarFormularioValido();

    document.getElementById('form-postulacion').dispatchEvent(new Event('submit', { cancelable: true }));
    await new Promise(process.nextTick);
    await new Promise(process.nextTick);

    const mensaje = document.getElementById('form-mensaje');
    expect(mensaje.className).toContain('error');
    expect(document.getElementById('form-enviar').disabled).toBe(false);
  });

  test('muestra un mensaje de error si la petición de red rechaza', async () => {
    global.fetch.mockRejectedValue(new Error('network error'));

    initFormPostulacion();
    llenarFormularioValido();

    document.getElementById('form-postulacion').dispatchEvent(new Event('submit', { cancelable: true }));
    await new Promise(process.nextTick);
    await new Promise(process.nextTick);

    const mensaje = document.getElementById('form-mensaje');
    expect(mensaje.className).toContain('error');
  });
});
