const marks = {
  link: {
    attrs: {
      href: {
        default: null,
      },
      target: {
        default: '_blank',
      },
      rel: {
        default: 'noopener noreferrer nofollow',
      },
      class: {
        default: null,
      },
    },
    inclusive: true,
  },
  bold: {},
  code: {
    attrs: {
      indent: {
        default: 0,
      },
    },
    excludes: '_',
  },
  italic: {},
  strike: {},
  underline: {},
};

const nodes = {
  paragraph: {
    content: 'inline*',
    group: 'block',
    attrs: {
      dir: {
        default: null,
      },
      indent: {
        default: 0,
      },
    },
  },
  blockquote: {
    content: 'block+',
    group: 'block',
    attrs: {
      indent: {
        default: 0,
      },
    },
  },
  bulletList: {
    content: 'listItem+',
    group: 'block list',
  },
  doc: {
    content: 'block+',
  },
  hardBreak: {
    group: 'inline',
    inline: true,
    selectable: false,
  },
  heading: {
    content: 'inline*',
    group: 'block',
    attrs: {
      dir: {
        default: null,
      },
      indent: {
        default: 0,
      },
      level: {
        default: 1,
      },
    },
  },
  horizontalRule: {
    group: 'block',
  },
  listItem: {
    content: 'paragraph block*',
    attrs: {
      dir: {
        default: null,
      },
      indent: {
        default: 0,
      },
    },
  },
  orderedList: {
    content: 'listItem+',
    group: 'block list',
    attrs: {
      start: {
        default: 1,
      },
    },
  },
  text: {
    group: 'inline',
  },
  codeBlock: {
    content: 'text*',
    group: 'block',
    attrs: {
      indent: {
        default: 0,
      },
      language: {
        default: null,
      },
    },
  },
  image: {
    group: 'block',
    inline: false,
    attrs: {
      src: {
        default: null,
      },
      height: {
        default: null,
      },
      width: {
        default: null,
      },
    },
  },
  file: {
    group: 'block',
    inline: false,
    attrs: {
      id: {
        default: null,
      },
      name: {
        default: null,
      },
      url: {
        default: null,
      },
      size: {
        default: null,
      },
      createdBy: {
        default: null,
      },
      createdAt: {
        default: null,
      },
    },
  },
  emoji: {
    group: 'inline',
    inline: true,
    atom: true,
    attrs: {
      name: {
        default: '',
      },
    },
    selectable: false,
  },
  mention: {
    group: 'inline',
    inline: true,
    atom: true,
    attrs: {
      id: {
        default: null,
      },
      label: {
        default: null,
      },
    },
    selectable: false,
  },
};

export const editorSchema = {
  nodes,
  marks,
};
