/**
 * PUNTO DE ENTRADA (js/app.js)
 * Instancia las tres partes fundamentales del patrón MVC:
 * - Modelo (js/models/modelo.js)
 * - Vista (js/views/vista.js)
 * - Controlador (js/controllers/controlador.js)
 */
import { Modelo } from './models/modelo.js';
import { Vista } from './views/vista.js';
import { Controlador } from './controllers/controlador.js';

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas');

  // 1. Instanciar Modelo
  const modelo = new Modelo();

  // 2. Instanciar Vista
  const vista = new Vista(canvas);

  // 3. Instanciar Controlador conectando Modelo y Vista
  new Controlador(modelo, vista);
});
