import React from 'react';

interface GameOverModalProps {
  score: number;
  highScore: number;
  onRestart: () => void;
}

const GameOverModal: React.FC<GameOverModalProps> = ({ score, highScore, onRestart }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-b from-slate-700 to-slate-800 rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center border-2 border-slate-600 transform transition-all animate-fade-in-up">
        <h2 className="text-4xl font-bold text-red-500 mb-4 drop-shadow-lg">Fim de Jogo</h2>
        <div className="space-y-4 mb-8">
            <div>
                <p className="text-gray-400 text-lg">Sua Pontuação</p>
                <p className="text-white text-5xl font-bold drop-shadow-md">{score}</p>
            </div>
             {score === highScore && score > 0 && (
                <div className="text-yellow-400 font-semibold text-lg animate-pulse">
                    Novo Recorde!
                </div>
            )}
             <div>
                <p className="text-gray-400 text-lg">Melhor Pontuação</p>
                <p className="text-yellow-400 text-3xl font-bold drop-shadow-md">{highScore}</p>
            </div>
        </div>
        <button
          onClick={onRestart}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg text-xl transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-500/50 shadow-lg"
        >
          Jogar Novamente
        </button>
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

export default GameOverModal;