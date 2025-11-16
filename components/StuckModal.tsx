
import React from 'react';
import { COIN_COST_FOR_SHUFFLE } from '../constants';

interface StuckModalProps {
  coins: number;
  onShuffle: () => void;
  onEndGame: () => void;
}

const StuckModal: React.FC<StuckModalProps> = ({ coins, onShuffle, onEndGame }) => {
  const canShuffle = coins >= COIN_COST_FOR_SHUFFLE;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-b from-slate-700 to-slate-800 rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center border-2 border-slate-600 animate-fade-in-up">
        <h2 className="text-3xl font-bold text-orange-400 mb-4">Sem Movimentos!</h2>
        <p className="text-gray-300 mb-6">
          Você está preso!
          {!canShuffle 
              ? " Você não tem moedas suficientes para embaralhar."
              : " Use o embaralhamento para obter novas peças ou termine o jogo."
          }
        </p>
        <div className="space-y-4">
          <button
            onClick={onShuffle}
            disabled={!canShuffle}
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-4 rounded-lg text-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-cyan-500/50 shadow-lg disabled:bg-gray-500 disabled:cursor-not-allowed"
          >
            Embaralhar Peças ({COIN_COST_FOR_SHUFFLE} moedas)
          </button>
          <button
            onClick={onEndGame}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg text-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-500/50 shadow-lg"
          >
            Terminar Jogo
          </button>
        </div>
      </div>
       <style>{`
        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
      `}</style>
    </div>
  );
};

export default StuckModal;
