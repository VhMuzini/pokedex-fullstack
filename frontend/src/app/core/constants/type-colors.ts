export const TYPE_COLORS: Record<string, string> = {
  normal: '#9A9A85',
  fire: '#E8543D',
  water: '#3E7CB1',
  grass: '#5C8A6E',
  electric: '#C79B3B',
  ice: '#7FB3B3',
  fighting: '#A6432E',
  poison: '#7B4F8A',
  ground: '#A9825A',
  flying: '#8FA6C7',
  psychic: '#C0587A',
  bug: '#7C9A45',
  rock: '#8C7A5E',
  ghost: '#5D5A7C',
  dragon: '#6457C4',
  dark: '#4A4038',
  steel: '#8B96A3',
  fairy: '#D98CB3',
};

export function colorForType(type: string): string {
  return TYPE_COLORS[type] ?? '#7C9A96';
}
