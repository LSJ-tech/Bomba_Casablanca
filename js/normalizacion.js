// Bomba Casablanca - funciones de normalización y validación compartidas entre los formularios de postulación.

function limpiarRut(rut) {
  return String(rut || '').replace(/[^0-9kK]/g, '').toUpperCase();
}

// Agrega los puntos de miles sin regex (evita el riesgo de backtracking de un lookahead cuantificado).
function agregarPuntosMiles(cuerpo) {
  var resultado = '';
  for (var i = 0; i < cuerpo.length; i++) {
    var posicionDesdeDerecha = cuerpo.length - i;
    resultado += cuerpo.charAt(i);
    if (posicionDesdeDerecha > 1 && (posicionDesdeDerecha - 1) % 3 === 0) {
      resultado += '.';
    }
  }
  return resultado;
}

function formatearRut(rut) {
  var limpio = limpiarRut(rut);
  if (limpio.length < 2) return limpio;
  var cuerpo = limpio.slice(0, -1);
  var dv = limpio.slice(-1);
  return agregarPuntosMiles(cuerpo) + '-' + dv;
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
    suma += Number.parseInt(cuerpo.charAt(i), 10) * multiplo;
    multiplo = multiplo < 7 ? multiplo + 1 : 2;
  }
  var resto = 11 - (suma % 11);
  var dvEsperado;
  if (resto === 11) {
    dvEsperado = '0';
  } else if (resto === 10) {
    dvEsperado = 'K';
  } else {
    dvEsperado = String(resto);
  }
  return dv === dvEsperado;
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

function normalizarEspacios(texto) {
  return String(texto || '').trim().replace(/\s+/g, ' ');
}

function normalizarTelefono(telefono) {
  var limpio = String(telefono || '').trim().replace(/[^\d+]/g, '');
  // Si escribieron un celular chileno sin el +56 (9 dígitos empezando en 9), se lo agregamos.
  if (/^9\d{8}$/.test(limpio)) {
    limpio = '+56' + limpio;
  }
  return limpio;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    limpiarRut: limpiarRut,
    formatearRut: formatearRut,
    validarRut: validarRut,
    calcularEdad: calcularEdad,
    fechaMaximaPara18Anios: fechaMaximaPara18Anios,
    normalizarEspacios: normalizarEspacios,
    normalizarTelefono: normalizarTelefono
  };
}
