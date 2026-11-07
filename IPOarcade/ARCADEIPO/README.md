# 🕹️ CYBER MARIO - Proyecto Arcade (Arquitectura MVC Pura)

Juego arcade de plataformas al estilo clásico de **Mario Bros** desarrollado con **HTML5 Semántico**, **CSS3 Moderno** y **JavaScript Nativo (ES Modules)** siguiendo estrictamente el patrón **MVC (Modelo-Vista-Controlador)** con una separación clara de responsabilidades en tres únicos archivos y **cero colores directos** en el código fuente.

---

## 📁 Estructura del Proyecto

```text
ARCADEIPO/
├── index.html                      # Maquetación semántica sin estilos inline
├── README.md                       # Documentación técnica
├── css/
│   └── style.css                   # Sistema de diseño con todas las variables cromáticas en :root
└── js/
    ├── app.js                      # Punto de entrada (instancia Modelo, Vista y Controlador)
    ├── models/
    │   └── modelo.js               # MODELO: Lógica pura, físicas, colisiones AABB, entidades y nivel
    ├── views/
    │   └── vista.js                # VISTA: Renderizado Canvas API (leyendo variables CSS) y HUD DOM
    └── controllers/
        └── controlador.js          # CONTROLADOR: Bucle de animación (60 FPS) y gestión de eventos
```

---

## 🏛️ Separación de Responsabilidades MVC

1. **[`modelo.js`](file:///c:/Users/angel/Downloads/ARCADEIPO/js/models/modelo.js)**:
   - Contiene las clases del dominio: `Player`, `Enemy`, `Level` y `Modelo`.
   - Controla las físicas (gravedad, fricción, velocidad terminal, salto), colisiones AABB, monedas, vidas y dificultad.
   - Es **totalmente independiente** del DOM y del Canvas. No define colores ni estilos.

2. **[`vista.js`](file:///c:/Users/angel/Downloads/ARCADEIPO/js/views/vista.js)**:
   - Contiene `CanvasRenderer`, `UIView` y la clase compuesta `Vista`.
   - `CanvasRenderer` dibuja el juego a 60 FPS leyendo **exclusivamente las variables CSS** declaradas en `:root` vía `getComputedStyle`.
   - `UIView` gestiona el marcador, récord, selector segmentado de dificultad y modales del DOM.
   - Expone métodos limpios de suscripción de eventos (`onStartClick`, `onTouchAction`, etc.).

3. **[`controlador.js`](file:///c:/Users/angel/Downloads/ARCADEIPO/js/controllers/controlador.js)**:
   - Contiene la clase `Controlador`.
   - Conecta el Modelo y la Vista.
   - Escucha las acciones del usuario (teclado y clics/toques delegados por la Vista) y orquesta el bucle continuo `requestAnimationFrame`.

---

## 🎨 Sistema Cromático Centralizado en CSS

- Todos los colores, transparencias, brillos neón y efectos CRT están declarados **únicamente en el bloque `:root`** de [`style.css`](file:///c:/Users/angel/Downloads/ARCADEIPO/css/style.css).
- Cero valores `#hex` o `rgba(...)` quemados en archivos JavaScript o etiquetas HTML.
- **Sin scroll**: Diseño responsive de pantalla completa (100vh / 100vw).
- **Sin listas desplegables**: Control segmentado de dificultad por botones.
- **Sin audios**: Funcionamiento 100% silencioso.
