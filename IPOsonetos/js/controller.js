import { loadAll, getAll, getById } from './model.js';
import { renderGallery, renderSonnet } from './view.js';

async function showGallery() {
  await loadAll();
  renderGallery(getAll(), id => renderSonnet(getById(id), showGallery));
}

document.addEventListener('DOMContentLoaded', () => {
  showGallery();
  document.addEventListener('keydown', e => e.key === 'Escape' && showGallery());
});
