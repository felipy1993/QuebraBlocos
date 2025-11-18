
import React from 'react';
import { COIN_COST_FOR_BOMB } from '../constants.ts';
import { AnimationState, ActivePowerUp, DraggedPiece } from '../types.ts';

interface PowerUpsProps {
    coins: number;
    onActivateBomb: () => void;
    animationState: AnimationState;
    activePowerUp: ActivePowerUp;
    draggedPiece: DraggedPiece | null;
}

const BombIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
        <path d="M12.293 5.293a1 1 0 011.414 0l2 2a1 1 0 01-1.414 1.414L13 7.414V10a1 1 0 11-2 0V7.414l-1.293 1.293a1 1 0 01-1.414-1.414l2-2z" />
    </svg>
);

const CoinIcon: React.FC<{className?: string}> = ({className}) => (
     <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-amber-400 ${className}`} viewBox="0 0 20 20" fill="currentColor">
        <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="2" fill="none" />
        <text x="50%" y="65%" dominantBaseline="middle" textAnchor="middle" fontSize="9" fontWeight="bold" fill="currentColor">$</text>
    </svg>
);

const PowerUps: React.FC<PowerUpsProps> = ({ coins, onActivateBomb, animationState, activePowerUp, draggedPiece }) => {
    const canUseBomb = coins >= COIN_COST_FOR_BOMB;
    const isDisabled = !canUseBomb || animationState !== null || activePowerUp !== null || draggedPiece !== null;
    const isBombActive = activePowerUp === 'bomb';

    return (
        <>
            <button
                onClick={onActivateBomb}
                disabled={isDisabled}
                className={`flex flex-col items-center justify-center transition-all p-2 rounded-lg w-20 h-20 border-2
                    ${isBombActive 
                        ? 'bg-red-500/30 border-red-400 text-red-400 scale-105'
                        : `text-red-500 border-transparent hover:bg-slate-700/50 hover:border-red-500/50 disabled:text-gray-600 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-transparent`}
                `}
                aria-label={`Usar Bomba por ${COIN_COST_FOR_BOMB} moedas`}
            >
                <BombIcon />
                <div className="flex items-center gap-1 mt-1">
                     <span className="text-sm font-bold">{COIN_COST_FOR_BOMB}</span>
                     <CoinIcon />
                </div>
            </button>
            {/* Future power-ups can be added here as separate buttons */}
        </>
    );
};

export default PowerUps;