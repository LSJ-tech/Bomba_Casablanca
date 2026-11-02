// Worker de Bomba Casablanca - recibe postulaciones y las envía por correo vía Resend.

const REQUIRED_FIELDS = ['nombre', 'rut', 'fecha_nacimiento', 'telefono', 'correo', 'direccion', 'motivo'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function limpiarRut(rut) {
  return String(rut || '').replace(/[^0-9kK]/g, '').toUpperCase();
}

function validarRut(rut) {
  const limpio = limpiarRut(rut);
  if (limpio.length < 2) return false;

  const cuerpo = limpio.slice(0, -1);
  const dv = limpio.slice(-1);

  if (!/^\d+$/.test(cuerpo)) return false;

  let suma = 0;
  let multiplo = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo.charAt(i), 10) * multiplo;
    multiplo = multiplo < 7 ? multiplo + 1 : 2;
  }
  const resto = 11 - (suma % 11);
  const dvEsperado = resto === 11 ? '0' : resto === 10 ? 'K' : String(resto);
  return dv === dvEsperado;
}

function calcularEdad(fechaNacimiento, hoy) {
  hoy = hoy || new Date();
  const nacimiento = new Date(fechaNacimiento + 'T00:00:00');
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mesDiff = hoy.getMonth() - nacimiento.getMonth();
  if (mesDiff < 0 || (mesDiff === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }
  return edad;
}

function corsHeaders(allowedOrigin) {
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
}

function jsonResponse(body, status, allowedOrigin) {
  return new Response(JSON.stringify(body), {
    status: status,
    headers: Object.assign({ 'Content-Type': 'application/json' }, corsHeaders(allowedOrigin))
  });
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const CAMPOS_TABLA = [
  ['Nombre', 'nombre'],
  ['RUT', 'rut'],
  ['Fecha de nacimiento', 'fecha_nacimiento'],
  ['Teléfono', 'telefono'],
  ['Correo', 'correo'],
  ['Dirección', 'direccion']
];

function buildEmailHtml(data) {
  const filasHtml = CAMPOS_TABLA.map(function (campo) {
    return (
      '<tr>' +
      '<td style="padding:10px 16px;border-bottom:1px solid #e4ecf5;font-family:Arial,Helvetica,sans-serif;' +
      'font-size:13px;font-weight:bold;color:#1d5fa6;white-space:nowrap;vertical-align:top;">' +
      escapeHtml(campo[0]) +
      '</td>' +
      '<td style="padding:10px 16px;border-bottom:1px solid #e4ecf5;font-family:Arial,Helvetica,sans-serif;' +
      'font-size:14px;color:#1c232b;">' +
      escapeHtml(data[campo[1]]) +
      '</td>' +
      '</tr>'
    );
  }).join('');

  return (
    '<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>' +
    '<body style="margin:0;padding:0;background:#f2f5f9;">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f2f5f9;padding:24px 0;">' +
    '<tr><td align="center">' +
    '<table role="presentation" width="600" cellpadding="0" cellspacing="0" ' +
    'style="background:#ffffff;border-radius:6px;overflow:hidden;max-width:600px;width:100%;">' +

    '<tr><td style="background:#0b2a4d;padding:24px 28px;border-bottom:3px solid #ffd500;">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>' +
    '<td style="width:48px;"><img src="https://bombacasablanca.devquad.cl/img/escudo-segunda.png" width="40" ' +
    'height="40" alt="" style="display:block;"></td>' +
    '<td style="padding-left:12px;">' +
    '<div style="font-family:Georgia,serif;font-weight:bold;color:#ffffff;font-size:18px;">Bomba Casablanca</div>' +
    '<div style="font-family:Arial,Helvetica,sans-serif;color:#ffe14d;font-size:12px;">' +
    'Segunda Compañía del Cuerpo de Bomberos de Casablanca</div>' +
    '</td></tr></table>' +
    '</td></tr>' +

    '<tr><td style="padding:24px 28px 8px;">' +
    '<h1 style="margin:0;font-family:Georgia,serif;font-size:20px;color:#0b2a4d;">Nueva postulación</h1>' +
    '<p style="margin:6px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#4f5b68;">' +
    'Alguien completó el formulario de postulación del sitio.</p>' +
    '</td></tr>' +

    '<tr><td style="padding:12px 28px 4px;">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" ' +
    'style="border:1px solid #e4ecf5;border-radius:4px;overflow:hidden;">' +
    filasHtml +
    '</table>' +
    '</td></tr>' +

    '<tr><td style="padding:16px 28px 24px;">' +
    '<div style="font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:bold;color:#1d5fa6;' +
    'margin-bottom:6px;">Motivo de la postulación</div>' +
    '<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#1c232b;line-height:1.5;' +
    'background:#f7f9fc;border:1px solid #e4ecf5;border-radius:4px;padding:12px 14px;white-space:pre-line;">' +
    escapeHtml(data.motivo) +
    '</div>' +
    '</td></tr>' +

    '<tr><td style="padding:16px 28px 24px;border-top:1px solid #e4ecf5;">' +
    '<p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#94806f;">' +
    'Enviado automáticamente desde el formulario de postulación de bombacasablanca.devquad.cl. ' +
    'Responde este correo para contactar directamente a quien postuló.</p>' +
    '</td></tr>' +

    '</table></td></tr></table></body></html>'
  );
}

function buildEmailText(data) {
  const lineas = CAMPOS_TABLA.map(function (campo) {
    return campo[0] + ': ' + data[campo[1]];
  });
  return (
    'Nueva postulación — Bomba Casablanca\n\n' +
    lineas.join('\n') +
    '\n\nMotivo de la postulación:\n' + data.motivo +
    '\n\n---\nEnviado automáticamente desde el formulario de postulación de bombacasablanca.devquad.cl.'
  );
}

export default {
  async fetch(request, env) {
    const allowedOrigin = env.ALLOWED_ORIGIN;

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(allowedOrigin) });
    }

    if (request.method !== 'POST') {
      return jsonResponse({ ok: false, error: 'method_not_allowed' }, 405, allowedOrigin);
    }

    let data;
    try {
      data = await request.json();
    } catch (err) {
      return jsonResponse({ ok: false, error: 'invalid_json' }, 400, allowedOrigin);
    }

    // Honeypot: si el campo trampa (invisible para personas) viene lleno, es un bot.
    // Respondemos éxito falso para no revelarle al bot que fue detectado, sin enviar correo.
    if (data.website) {
      return jsonResponse({ ok: true }, 200, allowedOrigin);
    }

    for (const field of REQUIRED_FIELDS) {
      if (!data[field] || !String(data[field]).trim()) {
        return jsonResponse({ ok: false, error: 'missing_field', field: field }, 400, allowedOrigin);
      }
    }

    if (!EMAIL_RE.test(data.correo)) {
      return jsonResponse({ ok: false, error: 'invalid_email' }, 400, allowedOrigin);
    }

    if (!validarRut(data.rut)) {
      return jsonResponse({ ok: false, error: 'invalid_rut' }, 400, allowedOrigin);
    }

    if (Number.isNaN(new Date(data.fecha_nacimiento).getTime()) || calcularEdad(data.fecha_nacimiento) < 18) {
      return jsonResponse({ ok: false, error: 'underage' }, 400, allowedOrigin);
    }

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + env.RESEND_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: env.FROM_EMAIL,
        to: env.TO_EMAIL,
        reply_to: data.correo,
        subject: 'Nueva postulación — Bomba Casablanca: ' + data.nombre,
        html: buildEmailHtml(data),
        text: buildEmailText(data)
      })
    });

    if (!resendRes.ok) {
      const detalle = await resendRes.text();
      console.log('Resend rechazó el envío:', resendRes.status, detalle);
      return jsonResponse({ ok: false, error: 'send_failed' }, 502, allowedOrigin);
    }

    return jsonResponse({ ok: true }, 200, allowedOrigin);
  }
};
