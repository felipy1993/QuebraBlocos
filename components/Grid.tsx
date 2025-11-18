
import React, { useState, useRef } from 'react';
import { GridState, PieceData, AnimationState, ActivePowerUp } from '../types.ts';
import { GRID_WIDTH, GRID_HEIGHT, COLORS } from '../constants.ts';

interface GridProps {
  grid: GridState;
  gridRef: React.RefObject<HTMLDivElement>;
  draggedPiece: PieceData | null;
  animationState: AnimationState;
  onGridClick: (r: number, c: number) => void;
  activePowerUp: ActivePowerUp;
  dropPosition: { r: number; c: number; isValid: boolean } | null;
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
            let isGhostValid = false;
            let isCenterOfGhost = false;

            if (draggedPiece && dropPosition && !cell) {
                const relativeRow = r - dropPosition.r;
                const relativeCol = c - dropPosition.c;
                if (relativeRow >= 0 && relativeRow < draggedPiece.height &&
                    relativeCol >= 0 && relativeCol < draggedPiece.width &&
                    draggedPiece.shape[relativeRow][relativeCol]) {
                    isGhost = true;
                    isGhostValid = dropPosition.isValid;
                    isCenterOfGhost = 
                        relativeRow === Math.floor(draggedPiece.height / 2) && 
                        relativeCol === Math.floor(draggedPiece.width / 2);
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
                cellClasses = `${COLORS[cell.color].main} border-b-4 border-r-4 shadow-lg ${COLORS[cell.color].shadow}`;
            } else if (isGhost && draggedPiece) {
                cellClasses = `${COLORS[draggedPiece.color].main} border-b-2 border-r-2 shadow-md ${COLORS[draggedPiece.color].shadow}`;
                if (!isGhostValid) {
                    cellClasses += ' opacity-50';
                }
            } else if (isBombPreview) {
                cellClasses = 'bg-red-500/40';
            } else {
                cellClasses = 'bg-slate-700/50';
            }

            return (
              <div
                key={`${r}-${c}`}
                onClick={() => onGridClick(r, c)}
                className={`relative w-full aspect-square rounded-md transition-colors duration-100 ${cellClasses} ${animationClass}`}
              >
                 {cell?.isBomb && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-3 h-3 md:w-4 md:h-4 bg-gray-800 rounded-full shadow-inner opacity-80 flex items-center justify-center">
                            <div className="w-1 h-1 bg-red-500 rounded-full animate-ping"></div>
                        </div>
                    </div>
                )}
                {isGhost && !isGhostValid && isCenterOfGhost && (
                    <div className="absolute inset-0 flex items-center justify-center text-3xl md:text-4xl text-white drop-shadow-lg pointer-events-none" style={{textShadow: '0 2px 4px rgba(0,0,0,0.7)'}}>
                        🚫
                    </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Grid;