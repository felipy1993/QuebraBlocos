import { PieceShape } from './types';

export const GRID_WIDTH = 8;
export const GRID_HEIGHT = 10;

// Scoring and Economy
export const POINTS_PER_BLOCK = 5; // Points for each block placed
export const POINTS_PER_LINE_CLEAR = 50; // Base points per line cleared (multiplied by combo)
export const POINTS_PER_COIN = 500; // How many points to earn one coin
export const POINTS_PER_BOMB_BLOCK = 10; // Extra points for blocks cleared by a bonus bomb

// Power-up Costs
export const COIN_COST_FOR_ROTATE = 10;
export const COIN_COST_FOR_SHUFFLE = 25;
export const COIN_COST_FOR_BOMB = 50;

// Leveling System
export const LEVEL_UP_COIN_BONUS = 100;
export const XP_PER_BLOCK = 1;
export const XP_PER_LINE = 20;
export const XP_BASE_LEVEL = 200;
export const XP_LEVEL_MULTIPLIER = 1.3;

// Game Mechanics
export const BONUS_BOMB_CHANCE = 0.15; // 15% chance for a piece to have a bonus bomb


export const COLORS: { [key: string]: { main: string; shadow: string } } = {
  pink: { main: 'bg-pink-500 border-pink-700', shadow: 'shadow-pink-500/70' },
  green: { main: 'bg-green-500 border-green-700', shadow: 'shadow-green-500/70' },
  blue: { main: 'bg-blue-500 border-blue-700', shadow: 'shadow-blue-500/70' },
  yellow: { main: 'bg-yellow-400 border-yellow-600', shadow: 'shadow-yellow-400/70' },
  orange: { main: 'bg-orange-500 border-orange-700', shadow: 'shadow-orange-500/70' },
  red: { main: 'bg-red-500 border-red-700', shadow: 'shadow-red-500/70' },
  cyan: { main: 'bg-cyan-400 border-cyan-600', shadow: 'shadow-cyan-400/70' },
  white: { main: 'bg-gray-200 border-gray-400', shadow: 'shadow-gray-200/70' },
  purple: { main: 'bg-purple-500 border-purple-700', shadow: 'shadow-purple-500/70' },
  teal: { main: 'bg-teal-500 border-teal-700', shadow: 'shadow-teal-500/70' },
};

const PIECE_SHAPES: { [key: string]: { shape: PieceShape; color: string } } = {
  // 1x1
  DOT: { shape: [[1]], color: 'white' },
  // 1x2
  I2V: { shape: [[1], [1]], color: 'pink' },
  I2H: { shape: [[1, 1]], color: 'pink' },
  // 1x3
  I3V: { shape: [[1], [1], [1]], color: 'cyan' },
  I3H: { shape: [[1, 1, 1]], color: 'cyan' },
  // 1x4
  I4V: { shape: [[1], [1], [1], [1]], color: 'orange' },
  I4H: { shape: [[1, 1, 1, 1]], color: 'orange' },
  // 2x2
  O: { shape: [[1, 1], [1, 1]], color: 'yellow' },
  // L-shapes
  L1: { shape: [[1, 0], [1, 0], [1, 1]], color: 'green' },
  L2: { shape: [[0, 1], [0, 1], [1, 1]], color: 'green' },
  L3: { shape: [[1, 1, 1], [1, 0, 0]], color: 'green' },
  L4: { shape: [[1, 1, 1], [0, 0, 1]], color: 'green' },
  // T-shapes
  T1: { shape: [[1, 1, 1], [0, 1, 0]], color: 'blue' },
  T2: { shape: [[1, 0], [1, 1], [1, 0]], color: 'blue' },
  // Z-shapes
  Z1: { shape: [[1, 1, 0], [0, 1, 1]], color: 'red' },
  Z2: { shape: [[0, 1], [1, 1], [1, 0]], color: 'red' },
  // Pentominoes and other complex shapes
  PLUS: { shape: [[0, 1, 0], [1, 1, 1], [0, 1, 0]], color: 'purple' },
  U_SHAPE: { shape: [[1, 0, 1], [1, 1, 1]], color: 'teal' },
  P_SHAPE: { shape: [[1, 1], [1, 1], [1, 0]], color: 'pink' },
  F_SHAPE: { shape: [[0, 1, 1], [1, 1, 0], [0, 1, 0]], color: 'green' }, // Asymmetrical
  W_SHAPE: { shape: [[1, 0, 0], [1, 1, 0], [0, 1, 1]], color: 'red' },
  Y_SHAPE: { shape: [[1, 0], [1, 1], [1, 0], [1, 0]], color: 'orange' },
  CORNER_SM: { shape: [[1, 1], [1, 0]], color: 'cyan' },
  I5V: { shape: [[1], [1], [1], [1], [1]], color: 'blue' },
  I5H: { shape: [[1, 1, 1, 1, 1]], color: 'blue' },
};

export const PIECES = Object.values(PIECE_SHAPES);