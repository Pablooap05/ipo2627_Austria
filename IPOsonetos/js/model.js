

const FILES = [
  'eraseUnHombre.md',
  'escritoEstaEnMiALma.md',
  'mientrasPorCompetir.md',
  'mireLosMuros.md',
  'unSonetoMeManda.md'
];

let sonnets = [];

export async function loadAll() {
  if (sonnets.length) return sonnets;

  sonnets = await Promise.all(FILES.map(async file => {
    const res = await fetch(`sonetos/${file}`);
    const text = await res.text();

    const titleMatch = text.match(/T[ií]tulo:\s*"?([^"\n]+)"?/i);
    const authorMatch = text.match(/Autor:\s*"?([^"\n]+)"?/i);

    const title = titleMatch ? titleMatch[1].replace(/"/g, '').trim() : file;
    const author = authorMatch ? authorMatch[1].replace(/"/g, '').trim() : 'Anónimo';

    const sonetoIdx = text.search(/Soneto:?/i);
    const body = sonetoIdx !== -1 ? text.slice(sonetoIdx) : text;
    const lines = body.split('\n')
      .map(l => l.trim())
      .filter(l => l && !l.match(/^(T[ií]tulo|Autor|Soneto)/i));

    return {
      id: file.replace('.md', ''),
      title,
      author,
      stanzas: [
        lines.slice(0, 4), 
        lines.slice(4, 8),
        lines.slice(8, 11),
        lines.slice(11, 14)
      ]
    };
  }));

  return sonnets;
}

export function getAll() { return sonnets.map(({ id, title, author }) => ({ id, title, author })); }
export function getById(id) { return sonnets.find(s => s.id === id) || null; }
