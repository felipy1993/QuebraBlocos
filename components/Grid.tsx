
import React, { useState, useRef } from 'react';
import { GridState, PieceData, AnimationState, ActivePowerUp } from '../types';
import { GRID_WIDTH, GRID_HEIGHT, COLORS } from '../constants';

interface GridProps {
  grid: GridState;
  gridRef: React.RefObject<HTMLDivElement>;
  draggedPiece: PieceData | null;
  animationState: AnimationState;
  onGridClick: (r: number, c: number) => void;
  activePowerUp: ActivePowerUp;
  dropPosition: { r: number; c: number } | null;
}

const Grid: React.FC<GridProps> = ({ grid, gridRef, draggedPiece, animationState, onGridClick, activePowerUp, dropPosition }) => {
  const [hoverPosition, setHoverPosition] = useState<{ r: number; c: number } | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!activePowerUp || !gridRef.current) return;
    const gridRect = gridRef.current.getBoundingClientRect();
    const cellWidth = gridRect.width / GRID_WIDTH;
    const cellHeight = gridRect.height / GRID_HEIGHT;
    const relativeX = e.clientX - gridRect.left;
    const relativeY = e.clientY - gridRect.top;
    const c = Math.floor(relativeX / cellWidth);
    const r = Math.floor(relativeY / cellHeight);
    if (hoverPosition?.r !== r || hoverPosition?.c !== c) {
      setHoverPosition({ r, c });
    }
  };
  
  const isClearingCell = (r: number, c: number) => 
    animationState?.type === 'clear' && animationState.cells.some(cell => cell.r === r && cell.c === c);
    
  const isBombingCell = (r: number, c: number) => 
    animationState?.type === 'bomb' && animationState.cells.some(cell => cell.r === r && cell.c === c);

  const isPlacingCell = (r: number, c: number) =>
    animationState?.type === 'place' && animationState.cells.some(cell => cell.r === r && cell.c === c);
    
  const isBombPreviewCell = (r: number, c: number) => {
    if (activePowerUp !== 'bomb' || !hoverPosition) return false;
    return Math.abs(r - hoverPosition.r) <= 1 && Math.abs(c - hoverPosition.c) <= 1;
  }

  return (
    <div
      className="bg-slate-900/70 p-1.5 rounded-lg shadow-lg w-full"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHoverPosition(null)}
      ref={gridRef}
    >
      <div className={`grid grid-cols-8 gap-1`}>
        {grid.map((rowArr, r) =>
          rowArr.map((cell, c) => {
            let isGhost = false;
            if (draggedPiece && dropPosition && !cell) {
                const relativeRow = r - dropPosition.r;
                const relativeCol = c - dropPosition.c;
                if (relativeRow >= 0 && relativeRow < draggedPiece.height &&
                    relativeCol >= 0 && relativeCol < draggedPiece.width &&
                    draggedPiece.shape[relativeRow][relativeCol]) {
                    isGhost = true;
                }
            }

            const isClearing = isClearingCell(r, c);
            const isBombing = isBombingCell(r, c);
            const isPlacing = isPlacingCell(r, c);
            const isBombPreview = isBombPreviewCell(r, c);
            
            let animationClass = '';
            if (isClearing || isBombing) {
                animationClass = 'animate-flash';
            } else if (isPlacing) {
                animationClass = 'animate-pop-cell';
            }
            
            let cellClasses = '';
            if (cell) {
                cellClasses = `${COLORS[cell].main} border-b-4 border-r-4 shadow-lg ${COLORS[cell].shadow}`;
            } else if (isGhost && draggedPiece) {
                cellClasses = `${COLORS[draggedPiece.color].main} border-b-2 border-r-2 shadow-md ${COLORS[draggedPiece.color].shadow}`;
            } else if (isBombPreview) {
                cellClasses = 'bg-red-500/40';
            } else {
                cellClasses = 'bg-slate-700/50';
            }

            return (
              <div
                key={`${r}-${c}`}
                onClick={() => onGridClick(r, c)}
                className={`w-full aspect-square rounded-md transition-colors duration-100 ${cellClasses} ${animationClass}`}
              />
            );
          })
        )}
      </div>
    </div>
  );
};

export default Grid;