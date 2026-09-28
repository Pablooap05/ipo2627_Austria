/* ==========================================================================
   Controller — Coordinación Model ↔ View
   
   Punto de entrada de la aplicación (cargado como type="module").
   Conecta el almacén de datos (Model) con el renderizado (View),
   gestionando los eventos de interacción del usuario.
   ========================================================================== */

import { getAll, getById } from './model.js';
import { renderGallery, renderSonnet } from './view.js';


/**
 * Maneja la selección de un soneto por parte del usuario.
 * Obtiene el soneto del Model y ordena a la View renderizarlo.
 * 
 * @param {string} id — Identificador del soneto seleccionado
 */
function handleSelect(id) {
  const sonnet = getById(id);
  if (sonnet) {
    renderSonnet(sonnet, handleBack);
  }
}


/**
 * Maneja el retorno a la galería desde la vista de lectura.
 * Obtiene todos los sonetos del Model y ordena a la View
 * renderizar la galería de nuevo.
 */
function handleBack() {
  const sonnets = getAll();
  renderGallery(sonnets, handleSelect);
}


/**
 * Inicializa la aplicación.
 * Se ejecuta cuando el DOM está completamente cargado.
 */
function init() {
  const sonnets = getAll();
  renderGallery(sonnets, handleSelect);
}

document.addEventListener('DOMContentLoaded', init);
