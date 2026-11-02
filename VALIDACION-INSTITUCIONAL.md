# Validación institucional pendiente

Este archivo **no se publica en el sitio** (está excluido del build vía `_config.yml`). Es un registro interno de
todo lo que falta confirmar antes de que este sitio pueda presentarse como la página oficial de Bomba Casablanca
(Segunda Compañía). Mientras un dato no esté aquí resuelto, la interfaz pública lo oculta en vez de mostrar un
placeholder inventado.

| Página | Dato pendiente | Información actualmente disponible | Qué debe confirmar la institución | Prioridad |
|---|---|---|---|---|
| Directorio | Plana de oficiales completa | Solo Director(a) (Verenna Beltrán Muñoz) y Capitán (Valentín Gómez V.), tomados del sitio del Cuerpo. | Teniente 1°, 2°, 3°, Secretario, Tesorero, Ayudante y demás cargos de la compañía. | **Alta** |
| Directorio | Número de voluntarios activos | Sin dato. | Cifra aproximada o exacta de voluntarios(as) de la compañía. | Media |
| Historia | Reseña institucional completa | Solo se tiene la fecha de fundación (17-07-1984) y el lema. | Texto de reseña histórica: orígenes, crecimiento, hitos, emergencias relevantes, capitanes/directores anteriores. | **Alta** |
| Material Mayor | Listado de vehículos | Página publicada solo con mensaje de "en preparación". | Tipo de carro, identificación, año, función y características de cada unidad, idealmente con fotografía. | **Alta** |
| Galería | Fotografías reales | Sección publicada sin fotos, con mensaje de "próximamente". | Fotos reales y autorizadas de la compañía. El lightbox del código ya está listo para recibirlas. | **Alta** |
| Contacto | Teléfono y correo propios de la compañía | Se muestra el teléfono general del Cuerpo (32) 2742366. | Teléfono y/o correo de contacto directo de Bomba Casablanca, si existen. | Media |
| Contacto / General | Redes sociales | Sin dato. | Instagram/Facebook oficial de la compañía, si tiene. | Baja |
| Política de Privacidad | Validación jurídica | Borrador base conforme a la Ley N° 19.628. | Revisión y validación formal por la directiva de la compañía; ajustar cuando entre en vigencia la Ley N° 21.719 (diciembre de 2026). | Media |
| General | Dominio definitivo | Sitio en `bombacasablanca.devquad.cl` (subdominio de demo). | Compra de `bombacasablanca.cl` y fecha de migración una vez que la compañía apruebe el sitio. | Baja (futuro) |
| General | Despliegue en GitHub Pages | Repo creado (`LSJ-tech/Bomba_Casablanca`), pendiente de push inicial. | Activar GitHub Pages en la configuración del repo (rama `main`) y agregar el registro DNS `bombacasablanca.devquad.cl` → `LSJ-tech.github.io` (igual que `bomberoscasablanca.devquad.cl`). | **Alta** |
| General | Secreto SONAR_TOKEN | Workflow de SonarCloud copiado del sitio del Cuerpo. | Configurar el secreto `SONAR_TOKEN` en este repo (Settings → Secrets) y crear el proyecto `LSJ-tech_Bomba_Casablanca` en SonarCloud. | Media |

## Cómo usar este archivo

Cuando se confirme un dato:
1. Agrégalo al include o página correspondiente (ver los comentarios `NOTA INTERNA` en el código de cada archivo).
2. Elimina la fila correspondiente de esta tabla.
3. Si el dato afecta a varias páginas (ej. un nombre del directorio), revisa coherencia en todas.
