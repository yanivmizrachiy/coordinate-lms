/* Game registry — the single list the hub and router read from.
   To add a game: build it as a GameDefinition and append it here. */
import type { GameDefinition } from './types';
import { encryptedRouteGame } from './encryptedRoute';
import { sameAxisGame } from './sameAxis';
import { suspectPointGame } from './suspectPoint';
import { coordinateSafeGame } from './coordinateSafe';
import { hiddenDrawingGame } from './hiddenDrawing';
import { coordinateMazeGame } from './coordinateMaze';
import { colorDecodeGame } from './colorDecode';

export const GAMES: GameDefinition[] = [
  hiddenDrawingGame,
  encryptedRouteGame,
  suspectPointGame,
  sameAxisGame,
  coordinateSafeGame,
  coordinateMazeGame,
  colorDecodeGame,
];

export const gameById = (id: string): GameDefinition | undefined => GAMES.find((g) => g.id === id);

export type { GameDefinition } from './types';
