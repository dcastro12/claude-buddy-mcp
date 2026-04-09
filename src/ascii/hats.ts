// Original hat styles from Claude Code — each is a single line prepended above the sprite
export const HAT_STYLES: Record<string, string> = {
  none:      '',
  crown:     '   \\^^^/    ',
  tophat:    '   [___]    ',
  propeller: '    -+-     ',
  halo:      '   (   )    ',
  wizard:    '    /^\\     ',
  beanie:    '   (___)    ',
  tinyduck:  '    ,>      ',
};

export const HAT_NAMES = Object.keys(HAT_STYLES);
export const HAT_COUNT = HAT_NAMES.length;
