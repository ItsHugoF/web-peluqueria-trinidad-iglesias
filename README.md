# Pelu Trini 1999 — maqueta web

Web estática (HTML + CSS + JS, sin dependencias) para la Peluquería Trinidad Iglesias (Matamá, Vigo).

## Ver en local

```bash
npx serve -l 5173 .
```

## Qué sustituir antes de publicar

- **Fotos**: ahora son de Unsplash (demo). Cambiar los `src` de `index.html` por fotos reales del salón (`assets/img/`).
- **Vídeos**: en la sección `#videos`, rellenar `data-video="assets/video/xxx.mp4"` en `.video-main` y en cada `.reel`. Sin vídeo, el visor muestra un hueco reservado.
- **Antes / después**: `#compare` usa la misma foto con un filtro. Poner una foto real de antes (`.compare__before`) y otra de después (`.compare__after`).
- **Opiniones**: los textos son marcadores. Sustituir por reseñas reales de Google (con permiso).
- **Aviso legal / Privacidad**: enlaces del pie pendientes.

## Funcionalidad

- Formulario de cita → abre WhatsApp con el mensaje preparado. Avisa si se elige un miércoles (cerrado).
  Ahora está en **modo demo** (no hay número). Para activarlo: poner el número en `WHATSAPP` (`js/main.js`)
  y en el `href` del botón flotante `.wa` (`index.html`) como `https://wa.me/34XXXXXXXXX`.
- Horario con el día de hoy resaltado y estado "Abierto / Cerrado ahora" (horario en `SCHEDULE`, `js/main.js`).
- Filtro de servicios, comparador antes/después, menú móvil, animaciones de entrada (respetan `prefers-reduced-motion`).
