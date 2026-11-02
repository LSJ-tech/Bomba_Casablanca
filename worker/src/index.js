// Worker de Bomba Casablanca - recibe postulaciones y las envía por correo vía Resend.

const REQUIRED_FIELDS = ['nombre', 'rut', 'fecha_nacimiento', 'telefono', 'correo', 'direccion', 'motivo'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

function buildEmailHtml(data) {
  return (
    '<h2>Nueva postulación a Bomba Casablanca</h2>' +
    '<p><strong>Nombre:</strong> ' + escapeHtml(data.nombre) + '</p>' +
    '<p><strong>RUT:</strong> ' + escapeHtml(data.rut) + '</p>' +
    '<p><strong>Fecha de nacimiento:</strong> ' + escapeHtml(data.fecha_nacimiento) + '</p>' +
    '<p><strong>Teléfono:</strong> ' + escapeHtml(data.telefono) + '</p>' +
    '<p><strong>Correo:</strong> ' + escapeHtml(data.correo) + '</p>' +
    '<p><strong>Dirección:</strong> ' + escapeHtml(data.direccion) + '</p>' +
    '<p><strong>Motivo:</strong><br>' + escapeHtml(data.motivo).replace(/\n/g, '<br>') + '</p>'
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
        html: buildEmailHtml(data)
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
