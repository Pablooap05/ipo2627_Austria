/* ==========================================================================
   Model — Almacén de Sonetos
   
   Cada soneto se estructura como:
   {
     id:      string    — Identificador único
     title:   string    — Título identificativo
     author:  string    — Autor del soneto
     stanzas: string[][]— 4 estrofas: 2 cuartetos (4 versos) + 2 tercetos (3 versos)
   }
   ========================================================================== */

const SONNETS = [
  {
    id: 'a-una-nariz',
    title: 'A una nariz',
    author: 'Quevedo',
    stanzas: [
      [
        'Érase un hombre a una nariz pegado,',
        'érase una nariz superlativa,',
        'érase una nariz sayón y escriba,',
        'érase un pez espada muy barbado.'
      ],
      [
        'Érase un reloj de sol mal encarado,',
        'érase un alquitara pensativa,',
        'érase un elefante boca arriba,',
        'era Ovidio Nasón mas narizado.'
      ],
      [
        'Érase un espolón de una galera,',
        'érase una pirámide de Egipto,',
        'las doce tribus de narices era.'
      ],
      [
        'Érase un naricísimo infinito,',
        'muchísima nariz, nariz tan fiera,',
        'que en la cara de Anás fuera delito.'
      ]
    ]
  },
  {
    id: 'escrito-esta-en-mi-alma',
    title: 'Escrito está en mi alma',
    author: 'Garcilaso de la Vega',
    stanzas: [
      [
        'Escrito está en mi alma vuestro gesto,',
        'y cuanto yo escribir de vos deseo;',
        'vos sola lo escribisteis, yo lo leo',
        'tan solo, que aun de vos me guardo en esto.'
      ],
      [
        'En esto estoy y estaré siempre puesto;',
        'que aunque no cabe en mí cuanto en vos veo,',
        'de tanto bien lo que no entiendo creo,',
        'tomando ya la fe por presupuesto.'
      ],
      [
        'Yo no nací sino para quereros;',
        'mi alma os ha cortado a su medida;',
        'por hábito del alma mismo os quiero.'
      ],
      [
        'Cuando tengo confieso yo deberos;',
        'por vos nací, por vos tengo la vida,',
        'por vos he de morir, y por vos muero.'
      ]
    ]
  },
  {
    id: 'mientras-por-competir',
    title: 'Mientras por competir',
    author: 'Góngora',
    stanzas: [
      [
        'Mientras por competir con tu cabello,',
        'oro bruñido, el Sol relumbra en vano,',
        'mientras con menosprecio en medio el llano',
        'mira tu blanca frente el lilio bello;'
      ],
      [
        'mientras a cada labio, por cogello,',
        'siguen más ojos que al clavel temprano,',
        'y mientras triunfa con desdén lozano',
        'del luciente cristal tu gentil cuello;'
      ],
      [
        'goza cuello, cabello, labio y frente,',
        'antes que lo que fue en tu edad dorada',
        'oro, lilio, clavel, cristal luciente,'
      ],
      [
        'no sólo en plata o viola truncada',
        'se vuelva, mas tú y ello juntamente',
        'en tierra, en humo, en polvo, en sombra, en nada.'
      ]
    ]
  },
  {
    id: 'mire-los-muros',
    title: 'Miré los muros',
    author: 'Quevedo',
    stanzas: [
      [
        'Miré los muros de la patria mía,',
        'si un tiempo fuertes ya desmoronados',
        'de la carrera de la edad cansados',
        'por quien caduca ya su valentía.'
      ],
      [
        'Salime al campo: vi que el sol bebía',
        'los arroyos del yelo desatados,',
        'y del monte quejosos los ganados',
        'que con sombras hurtó su luz al día.'
      ],
      [
        'Entré en mi casa: vi que amancillada',
        'de anciana habitación era despojos,',
        'mi báculo más corvo y menos fuerte.'
      ],
      [
        'Vencida de la edad sentí mi espada,',
        'y no hallé cosa en que poner los ojos',
        'que no fuese recuerdo de la muerte.'
      ]
    ]
  },
  {
    id: 'definicion-de-soneto',
    title: 'Definición de soneto',
    author: 'Lope de Vega',
    stanzas: [
      [
        'Un soneto me manda hacer Violante',
        'que en mi vida me he visto en tanto aprieto;',
        'catorce versos dicen que es soneto;',
        'burla burlando van los tres delante.'
      ],
      [
        'Yo pensé que no hallara consonante,',
        'y estoy a la mitad de otro cuarteto;',
        'mas si me veo en el primer terceto,',
        'no hay cosa en los cuartetos que me espante.'
      ],
      [
        'Por el primer terceto voy entrando,',
        'y parece que entré con pie derecho,',
        'pues fin con este verso le voy dando.'
      ],
      [
        'Ya estoy en el segundo, y aun sospecho',
        'que voy los trece versos acabando;',
        'contad si son catorce, y está hecho.'
      ]
    ]
  }
];


/**
 * Obtiene un listado resumido de todos los sonetos.
 * @returns {{ id: string, title: string, author: string }[]}
 */
export function getAll() {
  return SONNETS.map(({ id, title, author }) => ({ id, title, author }));
}

/**
 * Obtiene un soneto completo por su identificador.
 * @param   {string} id — Identificador del soneto
 * @returns {{ id: string, title: string, author: string, stanzas: string[][] } | null}
 */
export function getById(id) {
  return SONNETS.find(sonnet => sonnet.id === id) || null;
}
