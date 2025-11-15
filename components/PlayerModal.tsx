import React, { useState } from 'react';

interface PlayerModalProps {
  onPlayerSet: (name: string) => void;
}

const PlayerModal: React.FC<PlayerModalProps> = ({ onPlayerSet }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onPlayerSet(name.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-b from-slate-700 to-slate-800 rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center border-2 border-slate-600">
        <h2 className="text-3xl font-bold text-white mb-4">Bem-vindo ao QuebraBlocos!</h2>
        <p className="text-gray-300 mb-6">Por favor, insira seu nome para jogar.</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-900 text-white placeholder-gray-500 rounded-lg px-4 py-3 mb-4 text-center text-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="Seu Nome"
            maxLength={15}
            autoFocus
          />
          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg text-xl transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-500/50 shadow-lg disabled:bg-gray-500 disabled:cursor-not-allowed"
          >
            Jogar
          </button>
        </form>
      </div>
    </div>
  );
};

export default PlayerModal;