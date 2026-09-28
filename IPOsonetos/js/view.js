/* ==========================================================================
   View — Renderizado del DOM
   
   Responsabilidad: construir y actualizar los elementos del DOM.
   No contiene lógica de negocio ni datos: solo presentación.
   
   Interactúa con el CSSOM a través de clases CSS para transiciones
   y estados visuales (.view-hidden, .view-visible, .gallery-item).
   ========================================================================== */

/** @type {HTMLElement} */
const gallery = document.getElementById('gallery');

/** @type {HTMLElement} */
const reader  = document.getElementById('reader');


/**
 * Renderiza la galería de selección de sonetos.
 * 
 * @param {{ id: string, title: string, author: string }[]} sonnets
 * @param {(id: string) => void} onSelect — Callback al seleccionar un soneto
 */
export function renderGallery(sonnets, onSelect) {
  const list = gallery.querySelector('.gallery-list');
  list.innerHTML = '';

  sonnets.forEach((sonnet, index) => {
    const li = document.createElement('li');
    li.className = 'gallery-item';
    li.style.animationDelay = `${index * 80}ms`;

    const button = document.createElement('button');
    button.className = 'gallery-button';
    button.id = `btn-${sonnet.id}`;
    button.setAttribute('aria-label', `Leer soneto: ${sonnet.title}`);
    button.addEventListener('click', () => onSelect(sonnet.id));

    const title = document.createElement('span');
    title.className = 'gallery-title';
    title.textContent = sonnet.title;

    const author = document.createElement('span');
    author.className = 'gallery-author';
    author.textContent = sonnet.author;

    button.appendChild(title);
    button.appendChild(author);
    li.appendChild(button);
    list.appendChild(li);
  });

  showView('gallery');
}


/**
 * Renderiza la vista de lectura de un soneto completo.
 * 
 * Estructura semántica generada:
 *   <h2 class="sonnet-title">…</h2>
 *   <p  class="sonnet-author">…</p>
 *   <div class="sonnet-stanzas">
 *     <div class="stanza" aria-label="Cuarteto|Terceto">
 *       <p class="verse">…</p>
 *       …
 *     </div>
 *     …
 *   </div>
 * 
 * @param {{ id: string, title: string, author: string, stanzas: string[][] }} sonnet
 * @param {() => void} onBack — Callback para volver a la galería
 */
export function renderSonnet(sonnet, onBack) {
  const article = reader.querySelector('.sonnet-article');
  article.innerHTML = '';

  /* --- Título --- */
  const title = document.createElement('h2');
  title.className = 'sonnet-title';
  title.textContent = sonnet.title;
  article.appendChild(title);

  /* --- Autor --- */
  const author = document.createElement('p');
  author.className = 'sonnet-author';
  author.textContent = sonnet.author;
  article.appendChild(author);

  /* --- Estrofas --- */
  const stanzasContainer = document.createElement('div');
  stanzasContainer.className = 'sonnet-stanzas';

  sonnet.stanzas.forEach(stanza => {
    const stanzaDiv = document.createElement('div');
    stanzaDiv.className = 'stanza';

    /* Etiquetar semánticamente cuarteto vs terceto */
    const stanzaLabel = stanza.length === 4 ? 'Cuarteto' : 'Terceto';
    stanzaDiv.setAttribute('aria-label', stanzaLabel);

    stanza.forEach(verseText => {
      const verse = document.createElement('p');
      verse.className = 'verse';
      verse.textContent = verseText;
      stanzaDiv.appendChild(verse);
    });

    stanzasContainer.appendChild(stanzaDiv);
  });

  article.appendChild(stanzasContainer);

  /* --- Botón de retorno --- */
  const backBtn = reader.querySelector('.back-button');
  const freshBtn = backBtn.cloneNode(true);
  backBtn.parentNode.replaceChild(freshBtn, backBtn);
  freshBtn.addEventListener('click', onBack);

  showView('reader');
}


/**
 * Alterna la visibilidad entre galería y lector.
 * Coordina con el CSSOM añadiendo/removiendo clases
 * .view-hidden y .view-visible para activar las transiciones CSS.
 * 
 * @param {'gallery' | 'reader'} viewId
 */
function showView(viewId) {
  [gallery, reader].forEach(view => {
    if (view.id === viewId) {
      view.classList.remove('view-hidden');
      view.classList.add('view-visible');
    } else {
      view.classList.remove('view-visible');
      view.classList.add('view-hidden');
    }
  });
}
