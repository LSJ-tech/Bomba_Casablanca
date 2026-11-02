const worker = require('../src/index.js');

const {
  limpiarRut,
  validarRut,
  calcularEdad,
  esEmailValido,
  escapeHtml,
  buildEmailHtml,
  buildEmailText,
  validarPostulacion,
  corsHeaders,
  jsonResponse
} = worker;

const ORIGIN = 'https://bombacasablanca.devquad.cl';

function crearEnv(extra) {
  return Object.assign(
    {
      ALLOWED_ORIGIN: ORIGIN,
      FROM_EMAIL: 'postulaciones-bombacasablanca@devquad.cl',
      TO_EMAIL: 'destino@example.com',
      RESEND_API_KEY: 'clave-de-prueba'
    },
    extra
  );
}

// 11.111.111-1 es un RUT con dígito verificador válido, usado comúnmente para pruebas.
function datosVoluntarioValidos(extra) {
  return Object.assign(
    {
      nombre: 'Juana Pérez',
      rut: '11.111.111-1',
      fecha_nacimiento: '1990-01-01',
      telefono: '+56912345678',
      correo: 'juana@example.com',
      direccion: 'Calle Falsa 123, Casablanca',
      motivo: 'Quiero ayudar a mi comunidad.',
      website: ''
    },
    extra
  );
}

function datosCadeteValidos(extra) {
  return datosVoluntarioValidos(
    Object.assign(
      {
        fecha_nacimiento: '2015-01-01',
        apoderado_nombre: 'Pedro Pérez',
        apoderado_telefono: '+56987654321',
        apoderado_correo: 'pedro@example.com'
      },
      extra
    )
  );
}

function crearRequest(body, opciones) {
  opciones = opciones || {};
  return new Request('https://bombacasablanca-postulaciones.devquad.workers.dev', {
    method: opciones.method || 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: opciones.rawBody !== undefined ? opciones.rawBody : JSON.stringify(body)
  });
}

describe('limpiarRut / validarRut', () => {
  test('limpia puntos, guión y espacios', () => {
    expect(limpiarRut(' 11.111.111-1 ')).toBe('111111111');
  });

  test('valida un RUT con dígito verificador correcto', () => {
    expect(validarRut('11.111.111-1')).toBe(true);
  });

  test('valida un RUT cuyo dígito verificador es 0', () => {
    expect(validarRut('0-0')).toBe(true);
  });

  test('valida un RUT cuyo dígito verificador es K', () => {
    expect(validarRut('6-K')).toBe(true);
  });

  test('rechaza un RUT con dígito verificador incorrecto', () => {
    expect(validarRut('12.345.678-9')).toBe(false);
  });

  test('rechaza un RUT con una K en medio del cuerpo (no solo como dígito verificador)', () => {
    expect(validarRut('1K2-3')).toBe(false);
  });

  test('rechaza un RUT vacío o demasiado corto', () => {
    expect(validarRut('')).toBe(false);
    expect(validarRut('1')).toBe(false);
  });
});

describe('calcularEdad', () => {
  test('calcula la edad correctamente usando una fecha de referencia fija', () => {
    expect(calcularEdad('2000-01-01', new Date(2026, 10, 2))).toBe(26);
  });

  test('da 17 un día antes del cumpleaños número 18', () => {
    expect(calcularEdad('2008-11-03', new Date(2026, 10, 2))).toBe(17);
  });
});

describe('esEmailValido', () => {
  test('acepta un correo con formato normal', () => {
    expect(esEmailValido('juana@example.com')).toBe(true);
  });

  test('rechaza valores sin arroba, con espacios o sin dominio con punto', () => {
    expect(esEmailValido('')).toBe(false);
    expect(esEmailValido('sinarroba.com')).toBe(false);
    expect(esEmailValido('dos@arrobas@example.com')).toBe(false);
    expect(esEmailValido('con espacio@example.com')).toBe(false);
    expect(esEmailValido('juana@sinpunto')).toBe(false);
    expect(esEmailValido('juana@.com')).toBe(false);
  });
});

describe('escapeHtml', () => {
  test('escapa los caracteres especiales de HTML', () => {
    expect(escapeHtml('<script>alert(\'a&b\')</script> "x"')).toBe(
      '&lt;script&gt;alert(&#039;a&amp;b&#039;)&lt;/script&gt; &quot;x&quot;'
    );
  });
});

describe('corsHeaders / jsonResponse', () => {
  test('arma los headers CORS con el origin permitido', () => {
    expect(corsHeaders(ORIGIN)).toEqual({
      'Access-Control-Allow-Origin': ORIGIN,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
  });

  test('arma una respuesta JSON con el status y los headers correctos', async () => {
    const res = jsonResponse({ ok: true }, 200, ORIGIN);
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('application/json');
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe(ORIGIN);
    expect(await res.json()).toEqual({ ok: true });
  });
});

describe('buildEmailHtml / buildEmailText', () => {
  test('el HTML de voluntario(a) no incluye la sección de apoderado', () => {
    const html = buildEmailHtml(datosVoluntarioValidos(), false);
    expect(html).toContain('Juana Pérez');
    expect(html).toContain('voluntario(a)');
    expect(html).not.toContain('apoderado/tutor');
  });

  test('el HTML de Brigadier/Cadete incluye los datos del apoderado', () => {
    const html = buildEmailHtml(datosCadeteValidos(), true);
    expect(html).toContain('Pedro Pérez');
    expect(html).toContain('Brigadier(a)/Cadete');
  });

  test('el texto plano incluye los datos del apoderado solo si es menor de edad', () => {
    expect(buildEmailText(datosVoluntarioValidos(), false)).not.toContain('apoderado/tutor');
    expect(buildEmailText(datosCadeteValidos(), true)).toContain('Pedro Pérez');
  });

  test('escapa HTML dentro del motivo para evitar inyección', () => {
    const html = buildEmailHtml(datosVoluntarioValidos({ motivo: '<b>hola</b>' }), false);
    expect(html).toContain('&lt;b&gt;hola&lt;/b&gt;');
    expect(html).not.toContain('<b>hola</b>');
  });
});

describe('validarPostulacion', () => {
  test('acepta una postulación de voluntario(a) válida', () => {
    expect(validarPostulacion(datosVoluntarioValidos())).toEqual({ esMenor: false });
  });

  test('acepta una postulación de Brigadier/Cadete válida', () => {
    expect(validarPostulacion(datosCadeteValidos())).toEqual({ esMenor: true });
  });

  test('rechaza si falta un campo obligatorio', () => {
    const datos = datosVoluntarioValidos({ nombre: '' });
    expect(validarPostulacion(datos)).toEqual({ error: 'missing_field', field: 'nombre' });
  });

  test('rechaza un correo inválido', () => {
    const datos = datosVoluntarioValidos({ correo: 'no-es-correo' });
    expect(validarPostulacion(datos)).toEqual({ error: 'invalid_email' });
  });

  test('rechaza un RUT inválido', () => {
    const datos = datosVoluntarioValidos({ rut: '12.345.678-9' });
    expect(validarPostulacion(datos)).toEqual({ error: 'invalid_rut' });
  });

  test('rechaza una fecha de nacimiento que no es una fecha real', () => {
    const datos = datosVoluntarioValidos({ fecha_nacimiento: 'no-es-fecha' });
    expect(validarPostulacion(datos)).toEqual({ error: 'invalid_birthdate' });
  });

  test('rechaza a un menor de edad sin los datos del apoderado', () => {
    const datos = datosVoluntarioValidos({ fecha_nacimiento: '2015-01-01' });
    expect(validarPostulacion(datos)).toEqual({ error: 'missing_field', field: 'apoderado_nombre' });
  });

  test('rechaza a un menor de edad con correo de apoderado inválido', () => {
    const datos = datosCadeteValidos({ apoderado_correo: 'no-es-correo' });
    expect(validarPostulacion(datos)).toEqual({ error: 'invalid_apoderado_email' });
  });
});

describe('worker.fetch', () => {
  let env;

  beforeEach(() => {
    env = crearEnv();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('responde a una petición OPTIONS con 204 y los headers CORS', async () => {
    const req = new Request('https://x.test', { method: 'OPTIONS' });
    const res = await worker.default.fetch(req, env);

    expect(res.status).toBe(204);
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe(ORIGIN);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('rechaza métodos que no sean POST u OPTIONS', async () => {
    const req = new Request('https://x.test', { method: 'GET' });
    const res = await worker.default.fetch(req, env);

    expect(res.status).toBe(405);
    expect(await res.json()).toEqual({ ok: false, error: 'method_not_allowed' });
  });

  test('responde 400 si el cuerpo no es JSON válido', async () => {
    const req = crearRequest(null, { rawBody: 'esto no es json' });
    const res = await worker.default.fetch(req, env);

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ ok: false, error: 'invalid_json' });
  });

  test('si el honeypot viene lleno, responde éxito falso sin llamar a Resend', async () => {
    const req = crearRequest(datosVoluntarioValidos({ website: 'http://spam.test' }));
    const res = await worker.default.fetch(req, env);

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('responde 400 si falta un campo obligatorio, sin llamar a Resend', async () => {
    const req = crearRequest(datosVoluntarioValidos({ nombre: '' }));
    const res = await worker.default.fetch(req, env);

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ ok: false, error: 'missing_field', field: 'nombre' });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('envía el correo de un voluntario(a) válido y responde éxito', async () => {
    global.fetch.mockResolvedValue({ ok: true });

    const req = crearRequest(datosVoluntarioValidos());
    const res = await worker.default.fetch(req, env);

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [url, opciones] = global.fetch.mock.calls[0];
    expect(url).toBe('https://api.resend.com/emails');
    expect(opciones.headers.Authorization).toBe('Bearer clave-de-prueba');

    const cuerpo = JSON.parse(opciones.body);
    expect(cuerpo.from).toBe(env.FROM_EMAIL);
    expect(cuerpo.to).toBe(env.TO_EMAIL);
    expect(cuerpo.reply_to).toBe('juana@example.com');
    expect(cuerpo.subject).toContain('Nueva postulación — Bomba Casablanca');
  });

  test('envía el correo de un Brigadier/Cadete y responde a la dirección del apoderado', async () => {
    global.fetch.mockResolvedValue({ ok: true });

    const req = crearRequest(datosCadeteValidos());
    const res = await worker.default.fetch(req, env);

    expect(res.status).toBe(200);

    const [, opciones] = global.fetch.mock.calls[0];
    const cuerpo = JSON.parse(opciones.body);
    expect(cuerpo.reply_to).toBe('pedro@example.com');
    expect(cuerpo.subject).toContain('Brigadier/Cadete');
  });

  test('responde 502 si Resend rechaza el envío', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      status: 403,
      text: () => Promise.resolve('{"message":"domain not verified"}')
    });
    jest.spyOn(console, 'log').mockImplementation(() => {});

    const req = crearRequest(datosVoluntarioValidos());
    const res = await worker.default.fetch(req, env);

    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ ok: false, error: 'send_failed' });
  });
});
