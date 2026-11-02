const { initFormPostulacion } = require('../js/postulacion.js');

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

function llenarFormularioValido() {
  document.getElementById('nombre').value = 'Juana Pérez';
  document.getElementById('rut').value = '12.345.678-9';
  document.getElementById('fecha_nacimiento').value = '2000-01-01';
  document.getElementById('telefono').value = '+56912345678';
  document.getElementById('correo').value = 'juana@example.com';
  document.getElementById('direccion').value = 'Calle Falsa 123, Casablanca';
  document.getElementById('motivo').value = 'Quiero ayudar a mi comunidad.';
  document.getElementById('consentimiento').checked = true;
}

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

  test('no envía la petición si el formulario es inválido', () => {
    initFormPostulacion();
    document.getElementById('form-postulacion').dispatchEvent(new Event('submit', { cancelable: true }));

    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('envía los datos del formulario y muestra el mensaje de éxito', async () => {
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
