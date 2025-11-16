export type PieceShape = number[][];
export type GridState = ({ color: string; isBomb?: boolean } | null)[][];

export interface PieceData {
  id: number;
  shape: PieceShape;
  color: string;
  width: number;
  height: number;
  bonusBomb?: { r: number; c: number };
}

export interface DraggedPiece {
  piece: PieceData;
  index: number;
}

export type AnimationState = { type: 'clear' | 'bomb' | 'place'; cells: { r: number; c: number }[] } | null;

export type ActivePowerUp = 'bomb' | null;