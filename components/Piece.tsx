
import React from 'react';
import { PieceData } from '../types.ts';
import { COLORS, COIN_COST_FOR_ROTATE } from '../constants.ts';

const CoinIcon: React.FC<{className?: string}> = ({className}) => (
     <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 text-amber-400 ${className}`} viewBox="0 0 20 20" fill="currentColor">
        <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="2" fill="none" />
        <text x="50%" y="65%" dominantBaseline="middle" textAnchor="middle" fontSize="9" fontWeight="bold" fill="currentColor">$</text>
    </svg>
);

const RotateIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 4v6h-6"/>
        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
    </svg>
);


interface PieceProps {
  piece: PieceData;
  onDragStart: (clientX: number, clientY: number) => void;
  onRotate: () => void;
  isHidden: boolean;
}

const Piece: React.FC<PieceProps> = ({ piece, onDragStart, onRotate, isHidden }) => {
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Prevent drag start on right-click
    if (e.button !== 0) return;
    e.preventDefault();
    onDragStart(e.clientX, e.clientY);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    onDragStart(e.touches[0].clientX, e.touches[0].clientY);
  };

  const stopPropagation = (e: React.SyntheticEvent) => e.stopPropagation();

  return (
    <div
      title={piece.name}
      data-piece-name={piece.name}
      className={`flex-1 flex flex-col items-center justify-between p-1 rounded-lg min-h-[90px] ${isHidden ? 'invisible' : ''}`}
    >
      <div
        className="flex-grow flex items-center justify-center cursor-grab active:cursor-grabbing transition-transform duration-200 ease-in-out hover:scale-110 active:scale-105 w-full"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div className={`grid gap-1`} style={{ gridTemplateColumns: `repeat(${piece.width}, minmax(0, 1fr))` }}>
          {piece.shape.map((row, r) =>
            row.map((cell, c) => (
              <div
                key={`${r}-${c}`}
                className={`relative w-7 h-7 transition-transform duration-150 rounded-md ${
                  cell
                    ? `${COLORS[piece.color].main} border-b-2 border-r-2 shadow-md ${COLORS[piece.color].shadow}`
                    : 'bg-transparent'
                }`}
              >
                 {cell && piece.bonusBomb?.r === r && piece.bonusBomb?.c === c && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-3 h-3 bg-gray-800 rounded-full shadow-inner opacity-80 flex items-center justify-center">
                            <div className="w-0.5 h-0.5 bg-red-500 rounded-full animate-ping"></div>
                        </div>
                    </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
      <button 
            onClick={onRotate}
            onMouseDown={stopPropagation}
            onTouchStart={stopPropagation}
            className="flex items-center justify-center gap-1.5 text-xs font-semibold text-cyan-400 bg-slate-700/50 hover:bg-slate-700 rounded-full px-2 py-1 transition-colors mt-1"
            aria-label={`Girar peça por ${COIN_COST_FOR_ROTATE} moedas`}
        >
            <RotateIcon />
            <span>{COIN_COST_FOR_ROTATE}</span>
            <CoinIcon />
        </button>
    </div>
  );
};

export default Piece;