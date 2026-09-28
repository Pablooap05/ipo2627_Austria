const galleryView = document.getElementById('gallery');
const readerView  = document.getElementById('reader');

let scale = 1.0;

export function renderGallery(sonnets, onSelect) {
  const list = galleryView.querySelector('.gallery-list');
  list.innerHTML = sonnets.map(s => `
    <li>
      <button class="gallery-btn" data-id="${s.id}">
        <span class="gallery-title">${s.title}</span>
        <span class="gallery-author">${s.author}</span>
      </button>
    </li>
  `).join('');

  list.querySelectorAll('.gallery-btn').forEach(btn => {
    btn.onclick = () => onSelect(btn.dataset.id);
  });

  toggleView(false);
}

export function renderSonnet(sonnet, onBack) {
  const card = readerView.querySelector('.sonnet-card');
  const labels = ['Cuarteto I', 'Cuarteto II', 'Terceto I', 'Terceto II'];
  let n = 1;

  card.innerHTML = `
    <h2 class="sonnet-title">${sonnet.title}</h2>
    <p class="sonnet-author">${sonnet.author}</p>
    <div class="sonnet-stanzas">
      ${sonnet.stanzas.map((st, i) => `
        <div class="stanza">
          <span class="stanza-badge">${labels[i]}</span>
          ${st.map(v => `<p class="verse"><span class="verse-num">${n++}</span><span>${v}</span></p>`).join('')}
        </div>
      `).join('')}
    </div>
  `;

  card.querySelectorAll('.stanza').forEach(st => {
    st.onclick = () => {
      card.querySelectorAll('.stanza').forEach(s => s.classList.remove('is-focused'));
      st.classList.add('is-focused');
    };
  });

  document.getElementById('btn-back').onclick = onBack;
  document.getElementById('btn-dec').onclick = () => setScale(scale - 0.1);
  document.getElementById('btn-inc').onclick = () => setScale(scale + 0.1);

  toggleView(true);
}

function setScale(s) {
  scale = Math.min(Math.max(s, 0.8), 1.4);
  document.documentElement.style.setProperty('--scale', scale);
}

function toggleView(showReader) {
  galleryView.classList.toggle('hidden', showReader);
  readerView.classList.toggle('hidden', !showReader);
}
