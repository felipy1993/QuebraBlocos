export type PieceShape = number[][];
export type GridState = (string | null)[][];

export interface PieceData {
  id: number;
  shape: PieceShape;
  color: string;
  width: number;
  height: number;
}

export interface DraggedPiece {
  piece: PieceData;
  index: number;
}

export type AnimationState = { type: 'clear' | 'bomb' | 'place'; cells: { r: number; c: number }[] } | null;

export type ActivePowerUp = 'bomb' | null;