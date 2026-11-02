// Bomba Casablanca - formulario de postulación
// NOTA: reemplazar POSTULACION_ENDPOINT con la URL real que entregue "wrangler deploy" del Worker en worker/.

var POSTULACION_ENDPOINT = 'https://bombacasablanca-postulaciones.TU-SUBDOMINIO.workers.dev';

function initFormPostulacion() {
  var form = document.getElementById('form-postulacion');
  if (!form) return;

  var mensaje = document.getElementById('form-mensaje');
  var boton = document.getElementById('form-enviar');

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    var datos = {
      nombre: document.getElementById('nombre').value.trim(),
      rut: document.getElementById('rut').value.trim(),
      fecha_nacimiento: document.getElementById('fecha_nacimiento').value,
      telefono: document.getElementById('telefono').value.trim(),
      correo: document.getElementById('correo').value.trim(),
      direccion: document.getElementById('direccion').value.trim(),
      motivo: document.getElementById('motivo').value.trim(),
      website: document.getElementById('website').value
    };

    boton.disabled = true;
    boton.textContent = 'Enviando...';
    mensaje.className = 'form-mensaje';
    mensaje.textContent = '';

    fetch(POSTULACION_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    })
      .then(function (res) {
        if (!res.ok) throw new Error('No se pudo enviar');
        return res.json();
      })
      .then(function () {
        mensaje.className = 'form-mensaje visible exito';
        mensaje.textContent = 'Postulación enviada. Gracias por tu interés en Bomba Casablanca, nos pondremos en contacto contigo pronto.';
        form.reset();
      })
      .catch(function () {
        mensaje.className = 'form-mensaje visible error';
        mensaje.textContent = 'No pudimos enviar tu postulación. Intenta de nuevo más tarde o escríbenos directamente.';
      })
      .finally(function () {
        boton.disabled = false;
        boton.textContent = 'Enviar Postulación';
      });
  });
}

document.addEventListener('DOMContentLoaded', function () {
  initFormPostulacion();
});

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { initFormPostulacion: initFormPostulacion };
}
