// Bomba Casablanca - formulario de postulación (voluntario/a 18+, o Brigadier/Cadete si es menor de edad)
// NOTA: reemplazar POSTULACION_ENDPOINT con la URL real que entregue "wrangler deploy" del Worker en worker/.

var POSTULACION_ENDPOINT = 'https://bombacasablanca-postulaciones.devquad.workers.dev';

var normalizacion = typeof require === 'function' ? require('./normalizacion.js') : window;
var formatearRut = normalizacion.formatearRut;
var validarRut = normalizacion.validarRut;
var calcularEdad = normalizacion.calcularEdad;
var normalizarEspacios = normalizacion.normalizarEspacios;
var normalizarTelefono = normalizacion.normalizarTelefono;

function esMenorDeEdad(fechaNacimiento) {
  return !!fechaNacimiento && calcularEdad(fechaNacimiento) < 18;
}

function actualizarSeccionApoderado(form) {
  var seccion = document.getElementById('seccion-apoderado');
  var campoFecha = document.getElementById('fecha_nacimiento');
  if (!seccion || !campoFecha) return;

  var camposApoderado = [
    document.getElementById('apoderado_nombre'),
    document.getElementById('apoderado_telefono'),
    document.getElementById('apoderado_correo')
  ];

  var esMenor = esMenorDeEdad(campoFecha.value);
  seccion.style.display = esMenor ? '' : 'none';

  camposApoderado.forEach(function (campo) {
    if (!campo) return;
    campo.required = esMenor;
    if (!esMenor) campo.value = '';
  });
}

function initFormPostulacion() {
  var form = document.getElementById('form-postulacion');
  if (!form) return;

  var mensaje = document.getElementById('form-mensaje');
  var boton = document.getElementById('form-enviar');
  var campoRut = document.getElementById('rut');
  var campoFecha = document.getElementById('fecha_nacimiento');

  if (campoFecha) {
    campoFecha.addEventListener('change', function () {
      actualizarSeccionApoderado(form);
    });
  }

  if (campoRut) {
    campoRut.addEventListener('blur', function () {
      if (campoRut.value.trim()) {
        campoRut.value = formatearRut(campoRut.value);
      }
    });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    var rut = formatearRut(document.getElementById('rut').value);

    if (!validarRut(rut)) {
      mensaje.className = 'form-mensaje visible error';
      mensaje.textContent = 'El RUT ingresado no es válido. Revísalo e intenta de nuevo.';
      document.getElementById('rut').focus();
      return;
    }

    var fechaNacimiento = document.getElementById('fecha_nacimiento').value;
    var menor = esMenorDeEdad(fechaNacimiento);

    var datos = {
      tipo: menor ? 'cadete' : 'voluntario',
      nombre: normalizarEspacios(document.getElementById('nombre').value),
      rut: rut,
      fecha_nacimiento: fechaNacimiento,
      telefono: normalizarTelefono(document.getElementById('telefono').value),
      correo: normalizarEspacios(document.getElementById('correo').value).toLowerCase(),
      direccion: normalizarEspacios(document.getElementById('direccion').value),
      motivo: document.getElementById('motivo').value.trim(),
      website: document.getElementById('website').value
    };

    if (menor) {
      datos.apoderado_nombre = normalizarEspacios(document.getElementById('apoderado_nombre').value);
      datos.apoderado_telefono = normalizarTelefono(document.getElementById('apoderado_telefono').value);
      datos.apoderado_correo = normalizarEspacios(document.getElementById('apoderado_correo').value).toLowerCase();
    }

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
        actualizarSeccionApoderado(form);
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
  module.exports = {
    initFormPostulacion: initFormPostulacion,
    esMenorDeEdad: esMenorDeEdad,
    actualizarSeccionApoderado: actualizarSeccionApoderado
  };
}
