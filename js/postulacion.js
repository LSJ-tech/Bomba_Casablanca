// Bomba Casablanca - formulario de postulación
// NOTA: reemplazar POSTULACION_ENDPOINT con la URL real que entregue "wrangler deploy" del Worker en worker/.

var POSTULACION_ENDPOINT = 'https://bombacasablanca-postulaciones.devquad.workers.dev';

function limpiarRut(rut) {
  return String(rut || '').replace(/[^0-9kK]/g, '').toUpperCase();
}

function formatearRut(rut) {
  var limpio = limpiarRut(rut);
  if (limpio.length < 2) return limpio;
  var cuerpo = limpio.slice(0, -1);
  var dv = limpio.slice(-1);
  var cuerpoFormateado = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return cuerpoFormateado + '-' + dv;
}

function validarRut(rut) {
  var limpio = limpiarRut(rut);
  if (limpio.length < 2) return false;

  var cuerpo = limpio.slice(0, -1);
  var dv = limpio.slice(-1);

  if (!/^\d+$/.test(cuerpo)) return false;

  var suma = 0;
  var multiplo = 2;
  for (var i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo.charAt(i), 10) * multiplo;
    multiplo = multiplo < 7 ? multiplo + 1 : 2;
  }
  var resto = 11 - (suma % 11);
  var dvEsperado = resto === 11 ? '0' : resto === 10 ? 'K' : String(resto);
  return dv === dvEsperado;
}

function normalizarEspacios(texto) {
  return String(texto || '').trim().replace(/\s+/g, ' ');
}

function calcularEdad(fechaNacimiento, hoy) {
  hoy = hoy || new Date();
  var nacimiento = new Date(fechaNacimiento + 'T00:00:00');
  var edad = hoy.getFullYear() - nacimiento.getFullYear();
  var mesDiff = hoy.getMonth() - nacimiento.getMonth();
  if (mesDiff < 0 || (mesDiff === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }
  return edad;
}

function fechaMaximaPara18Anios(hoy) {
  hoy = hoy || new Date();
  var limite = new Date(hoy.getFullYear() - 18, hoy.getMonth(), hoy.getDate());
  var mes = String(limite.getMonth() + 1).padStart(2, '0');
  var dia = String(limite.getDate()).padStart(2, '0');
  return limite.getFullYear() + '-' + mes + '-' + dia;
}

function normalizarTelefono(telefono) {
  var limpio = String(telefono || '').trim().replace(/[^\d+]/g, '');
  // Si escribieron un celular chileno sin el +56 (9 dígitos empezando en 9), se lo agregamos.
  if (/^9\d{8}$/.test(limpio)) {
    limpio = '+56' + limpio;
  }
  return limpio;
}

function initFormPostulacion() {
  var form = document.getElementById('form-postulacion');
  if (!form) return;

  var mensaje = document.getElementById('form-mensaje');
  var boton = document.getElementById('form-enviar');
  var campoRut = document.getElementById('rut');
  var campoFecha = document.getElementById('fecha_nacimiento');

  if (campoFecha) {
    campoFecha.max = fechaMaximaPara18Anios();
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

    var fechaNacimiento = document.getElementById('fecha_nacimiento').value;
    if (fechaNacimiento && calcularEdad(fechaNacimiento) < 18) {
      mensaje.className = 'form-mensaje visible error';
      mensaje.textContent = 'Debes tener al menos 18 años para postular como voluntario(a). Si eres menor de edad, contáctanos para información sobre Brigadieres/Cadetes.';
      document.getElementById('fecha_nacimiento').focus();
      return;
    }

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

    var datos = {
      nombre: normalizarEspacios(document.getElementById('nombre').value),
      rut: rut,
      fecha_nacimiento: document.getElementById('fecha_nacimiento').value,
      telefono: normalizarTelefono(document.getElementById('telefono').value),
      correo: normalizarEspacios(document.getElementById('correo').value).toLowerCase(),
      direccion: normalizarEspacios(document.getElementById('direccion').value),
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
  module.exports = {
    initFormPostulacion: initFormPostulacion,
    limpiarRut: limpiarRut,
    formatearRut: formatearRut,
    validarRut: validarRut,
    calcularEdad: calcularEdad,
    fechaMaximaPara18Anios: fechaMaximaPara18Anios,
    normalizarEspacios: normalizarEspacios,
    normalizarTelefono: normalizarTelefono
  };
}
