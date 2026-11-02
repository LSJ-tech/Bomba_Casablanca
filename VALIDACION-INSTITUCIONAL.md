# Validación institucional pendiente

Este archivo **no se publica en el sitio** (está excluido del build vía `_config.yml`). Es un registro interno de
todo lo que falta confirmar antes de que este sitio pueda presentarse como la página oficial de Bomba Casablanca
(Segunda Compañía). Mientras un dato no esté aquí resuelto, la interfaz pública lo oculta en vez de mostrar un
placeholder inventado.

| Página | Dato pendiente | Información actualmente disponible | Qué debe confirmar la institución | Prioridad |
|---|---|---|---|---|
| Oficialidad 2026 | Nombres de 7 cargos | La página ya muestra la estructura completa (Director(a), Capitán, Teniente 1°/2°/3°, Ayudante, Secretario(a), Tesorero(a), Intendente); solo Director(a) (Verenna Beltrán Muñoz) y Capitán (Valentín Gómez V.) tienen nombre, el resto dice "Por confirmar". | Nombre de cada Teniente (1°, 2°, 3°), Ayudante, Secretario(a), Tesorero(a) e Intendente. | **Alta** |
| Oficialidad 2026 | Número de voluntarios activos | Sin dato. | Cifra aproximada o exacta de voluntarios(as) de la compañía. | Media |
| Historia | Reseña institucional completa | Solo se tiene la fecha de fundación (17-07-1984) y el lema. | Texto de reseña histórica: orígenes, crecimiento, hitos, emergencias relevantes, capitanes/directores anteriores. | **Alta** |
| Material Mayor | Listado de vehículos | Página publicada solo con mensaje de "en preparación". | Tipo de carro, identificación, año, función y características de cada unidad, idealmente con fotografía. | **Alta** |
| Galería | Fotografías reales | Sección publicada sin fotos, con mensaje de "próximamente". | Fotos reales y autorizadas de la compañía. El lightbox del código ya está listo para recibirlas. | **Alta** |
| Contacto | Teléfono y correo propios de la compañía | Se muestra el teléfono general del Cuerpo (32) 2742366. | Teléfono y/o correo de contacto directo de Bomba Casablanca, si existen. | Media |
| Contacto / General | Redes sociales | Sin dato. | Instagram/Facebook oficial de la compañía, si tiene. | Baja |
| Política de Privacidad | Validación jurídica | Borrador base conforme a la Ley N° 19.628. | Revisión y validación formal por la directiva de la compañía; ajustar cuando entre en vigencia la Ley N° 21.719 (diciembre de 2026). | Media |
| General | Dominio definitivo | Sitio en `bombacasablanca.devquad.cl` (subdominio de demo). | Compra de `bombacasablanca.cl` y fecha de migración una vez que la compañía apruebe el sitio. | Baja (futuro) |
| General | Secreto SONAR_TOKEN | Repo y secreto configurados por el usuario (2026-11-02); falta verificar que el workflow de SonarCloud corra en verde tras el re-run. | Confirmar en la pestaña Actions que el run de "SonarCloud" termine en éxito. | Baja |
| Postulación | Correo de destino | Worker desplegado y probado de punta a punta (2026-11-02): llega bien a `logan.silva.jara@gmail.com` (`TO_EMAIL` en `worker/wrangler.toml`), remitente `postulaciones-bombacasablanca@devquad.cl` (dominio verificado en Resend). | Cambiar `TO_EMAIL` al correo oficial del Director(a) o de la compañía una vez exista. | Media |
| Postulación | Requisitos adicionales propios de la compañía | La página ya muestra los requisitos nacionales oficiales (18 años, sin antecedentes, salud compatible — fuente: bomberos.cl/quieres-ser-bombero). | Confirmar si Bomba Casablanca exige algo adicional a lo nacional (ej. curso de inducción propio, cupos). | Baja |
| Postulación | Flujo de Brigadier(a)/Cadete (menor de edad) pendiente de deploy | El mismo formulario ya detecta automáticamente si quien postula es menor de edad y pide los datos del apoderado/tutor (frontend y Worker, 2026-11-02). Falta redesplegar el Worker (`wrangler deploy`) y probarlo en producción. | Confirmar con la compañía si el proceso real de Brigadieres/Cadetes coincide con lo asumido (solo datos de contacto del apoderado) o si falta algo más (ej. autorización notarial, documento firmado). | Media |

## Cómo usar este archivo

Cuando se confirme un dato:
1. Agrégalo al include o página correspondiente (ver los comentarios `NOTA INTERNA` en el código de cada archivo).
2. Elimina la fila correspondiente de esta tabla.
3. Si el dato afecta a varias páginas (ej. un nombre del directorio), revisa coherencia en todas.
