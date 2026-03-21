import type { Player } from './app-types';

export function getOpponent(player: Player): Player {
  return player === 'black' ? 'white' : 'black';
}

export function publicUrl(path: string): string {
  // In Next.js, public files are served from the root
  return '/' + path.replace(/^\//, '');
}
