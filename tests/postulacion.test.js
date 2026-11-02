const {
  initFormPostulacion,
  limpiarRut,
  formatearRut,
  validarRut,
  normalizarEspacios,
  normalizarTelefono
} = require('../js/postulacion.js');

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
      <textarea id="motivo" name="motivo" required></textarea>
      <input type="checkbox" id="consentimiento" name="consentimiento" required>
      <div id="form-mensaje" class="form-mensaje" role="status"></div>
      <button type="submit" id="form-enviar">Enviar Postulación</button>
    </form>
  `;
}

// 11.111.111-1 es un RUT con dígito verificador válido, usado comúnmente para pruebas.
function llenarFormularioValido() {
  document.getElementById('nombre').value = '  Juana   Pérez  ';
  document.getElementById('rut').value = '11.111.111-1';
  document.getElementById('fecha_nacimiento').value = '2000-01-01';
  document.getElementById('telefono').value = '912345678';
  document.getElementById('correo').value = '  Juana@Example.com  ';
  document.getElementById('direccion').value = 'Calle Falsa 123, Casablanca';
  document.getElementById('motivo').value = 'Quiero ayudar a mi comunidad.';
  document.getElementById('consentimiento').checked = true;
}

describe('limpiarRut', () => {
  test('quita puntos, guión y espacios, y deja la K en mayúscula', () => {
    expect(limpiarRut('11.111.111-1')).toBe('111111111');
    expect(limpiarRut(' 7.654.321-k ')).toBe('7654321K');
  });

  test('no falla con valores vacíos o nulos', () => {
    expect(limpiarRut('')).toBe('');
    expect(limpiarRut(null)).toBe('');
    expect(limpiarRut(undefined)).toBe('');
  });
});

describe('formatearRut', () => {
  test('agrega puntos de miles y el guión del dígito verificador', () => {
    expect(formatearRut('111111111')).toBe('11.111.111-1');
    expect(formatearRut('5654321')).toBe('565.432-1');
  });

  test('deja tal cual un valor demasiado corto para formatear', () => {
    expect(formatearRut('1')).toBe('1');
    expect(formatearRut('')).toBe('');
  });
});

describe('validarRut', () => {
  test('acepta RUTs con dígito verificador correcto', () => {
    expect(validarRut('11.111.111-1')).toBe(true);
    expect(validarRut('11111111-1')).toBe(true);
  });

  test('rechaza RUTs con dígito verificador incorrecto', () => {
    expect(validarRut('12.345.678-9')).toBe(false);
  });

  test('rechaza valores vacíos, incompletos o no numéricos', () => {
    expect(validarRut('')).toBe(false);
    expect(validarRut('1')).toBe(false);
    expect(validarRut('abc-d')).toBe(false);
  });
});

describe('normalizarEspacios', () => {
  test('recorta y colapsa espacios repetidos', () => {
    expect(normalizarEspacios('  Juana   Pérez  ')).toBe('Juana Pérez');
  });

  test('no falla con valores vacíos o nulos', () => {
    expect(normalizarEspacios('')).toBe('');
    expect(normalizarEspacios(null)).toBe('');
  });
});

describe('normalizarTelefono', () => {
  test('agrega +56 a un celular chileno de 9 dígitos sin prefijo', () => {
    expect(normalizarTelefono('912345678')).toBe('+56912345678');
  });

  test('deja un número que ya trae +56', () => {
    expect(normalizarTelefono('+56 9 1234 5678')).toBe('+56912345678');
  });

  test('deja igual un número que no calza con el patrón chileno', () => {
    expect(normalizarTelefono('+1 212 555 0100')).toBe('+12125550100');
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

  test('envía los datos normalizados y muestra el mensaje de éxito', async () => {
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
    expect(enviado.nombre).toBe('Juana Pérez');
    expect(enviado.rut).toBe('11.111.111-1');
    expect(enviado.telefono).toBe('+56912345678');
    expect(enviado.correo).toBe('juana@example.com');

    const mensaje = document.getElementById('form-mensaje');
    expect(mensaje.className).toContain('exito');
    expect(document.getElementById('form-enviar').disabled).toBe(false);
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
