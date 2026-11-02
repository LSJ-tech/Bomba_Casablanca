const {
  limpiarRut,
  formatearRut,
  validarRut,
  calcularEdad,
  fechaMaximaPara18Anios,
  normalizarEspacios,
  normalizarTelefono
} = require('../js/normalizacion.js');

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

// new Date(2026, 10, 2) usa el constructor en hora local (noviembre es el mes 10, base 0),
// a diferencia de new Date('2026-11-02') que se interpreta en UTC y se corre un día en Chile.
describe('calcularEdad', () => {
  test('calcula bien cuando ya pasó el cumpleaños este año', () => {
    expect(calcularEdad('2000-01-01', new Date(2026, 10, 2))).toBe(26);
  });

  test('calcula bien cuando el cumpleaños todavía no llega este año', () => {
    expect(calcularEdad('2000-12-31', new Date(2026, 10, 2))).toBe(25);
  });

  test('da 18 el mismo día del cumpleaños número 18', () => {
    expect(calcularEdad('2008-11-02', new Date(2026, 10, 2))).toBe(18);
  });

  test('da 17 un día antes del cumpleaños número 18', () => {
    expect(calcularEdad('2008-11-03', new Date(2026, 10, 2))).toBe(17);
  });
});

describe('fechaMaximaPara18Anios', () => {
  test('devuelve la fecha de hoy menos 18 años, en formato YYYY-MM-DD', () => {
    expect(fechaMaximaPara18Anios(new Date(2026, 10, 2))).toBe('2008-11-02');
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
