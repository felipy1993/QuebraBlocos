
import React, { useState, useEffect } from 'react';

interface ScoreboardProps {
    score: number;
    highScore: number;
    coins: number;
    level: number;
    xp: number;
    xpForNextLevel: number;
    combo: number;
    isMuted: boolean;
    onToggleMute: () => void;
    playerName: string | null;
    onSwitchPlayer: () => void;
    isFullScreen: boolean;
    onToggleFullScreen: () => void;
    onNewGame: () => void;
}

const CrownIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-yellow-400 ${className}`} viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 1a1 1 0 01.756.36l2.004 3.34a1 1 0 01-.637 1.514H7.877a1 1 0 01-.637-1.514L9.244 1.36A1 1 0 0110 1z"/>
        <path fillRule="evenodd" d="M3 6a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 14a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
    </svg>
);

const CoinIcon: React.FC<{className?: string}> = ({className}) => (
     <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-amber-400 ${className}`} viewBox="0 0 20 20" fill="currentColor">
        <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="2" fill="none" />
        <text x="50%" y="65%" dominantBaseline="middle" textAnchor="middle" fontSize="9" fontWeight="bold" fill="currentColor">$</text>
    </svg>
);

const MuteIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
    </svg>
);

const UnmuteIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
    </svg>
);

const FullscreenEnterIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 1v4m0 0h-4m4 0l-5-5" />
    </svg>
);

const FullscreenExitIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 4H4m0 0v4m0-4l5 5m1-5h4m0 0v4m0-4l-5 5m5 11h-4m0 0v-4m0 4l-5-5m-1 5H4m0 0v-4m0 4l5-5" />
    </svg>
);

const NewGameIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 9a9 9 0 0113.54-5.04M20 15a9 9 0 01-13.54 5.04" />
    </svg>
);

function usePrevious<T>(value: T): T | undefined {
  const ref = React.useRef<T>();
  React.useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

const useCountUpAnimation = (targetValue: number, duration: number = 500) => {
    const [currentValue, setCurrentValue] = React.useState(targetValue);
    const prevValue = usePrevious(targetValue);
    const frameRef = React.useRef<number>();

    React.useEffect(() => {
        const startValue = prevValue !== undefined ? prevValue : targetValue;
        const endValue = targetValue;

        if (startValue === endValue) {
            setCurrentValue(endValue);
            return;
        }

        let startTime: number | null = null;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const percentage = Math.min(progress / duration, 1);
            
            // Ease out cubic function
            const easedPercentage = 1 - Math.pow(1 - percentage, 3);

            const animatedValue = Math.floor(startValue + (endValue - startValue) * easedPercentage);
            setCurrentValue(animatedValue);

            if (progress < duration) {
                frameRef.current = requestAnimationFrame(animate);
            } else {
                 setCurrentValue(endValue);
            }
        };

        frameRef.current = requestAnimationFrame(animate);

        return () => {
            if (frameRef.current) {
                cancelAnimationFrame(frameRef.current);
            }
        };
    }, [targetValue, prevValue, duration]);

    return currentValue;
};


const Scoreboard: React.FC<ScoreboardProps> = ({ score, highScore, coins, level, xp, xpForNextLevel, combo, isMuted, onToggleMute, playerName, onSwitchPlayer, isFullScreen, onToggleFullScreen, onNewGame }) => {
    const [levelUp, setLevelUp] = useState(false);
    const prevLevel = usePrevious(level);

    const [popScore, setPopScore] = useState(false);
    const prevScore = usePrevious(score);

    const [popCoins, setPopCoins] = useState(false);
    const prevCoins = usePrevious(coins);

    const animatedScore = useCountUpAnimation(score);
    const animatedCoins = useCountUpAnimation(coins);


    useEffect(() => {
        if (prevLevel !== undefined && level > prevLevel) {
            setLevelUp(true);
            const timer = setTimeout(() => setLevelUp(false), 500);
            return () => clearTimeout(timer);
        }
    }, [level, prevLevel]);

    useEffect(() => {
        if (prevScore !== undefined && score !== prevScore) {
            setPopScore(true);
            const timer = setTimeout(() => setPopScore(false), 300);
            return () => clearTimeout(timer);
        }
    }, [score, prevScore]);

    useEffect(() => {
        if (prevCoins !== undefined && coins !== prevCoins) {
            setPopCoins(true);
            const timer = setTimeout(() => setPopCoins(false), 300);
            return () => clearTimeout(timer);
        }
    }, [coins, prevCoins]);

    const xpPercentage = Math.min((xp / xpForNextLevel) * 100, 100);

    return (
        <div className="flex flex-col gap-1">
             <div className="flex justify-between items-center text-sm px-2">
                 <div className="flex items-center gap-2">
                    <button onClick={onToggleMute} className="text-gray-400 hover:text-white transition-colors" aria-label={isMuted ? 'Ativar som' : 'Silenciar'}>
                        {isMuted ? <UnmuteIcon /> : <MuteIcon />}
                    </button>
                    <button onClick={onToggleFullScreen} className="text-gray-400 hover:text-white transition-colors" aria-label={isFullScreen ? 'Sair da Tela Cheia' : 'Entrar em Tela Cheia'}>
                        {isFullScreen ? <FullscreenExitIcon /> : <FullscreenEnterIcon />}
                    </button>
                     <button onClick={onNewGame} className="text-gray-400 hover:text-white transition-colors" aria-label="Novo Jogo">
                        <NewGameIcon />
                    </button>
                    <div className="w-px h-6 bg-slate-600/50"></div>
                     <button onClick={onSwitchPlayer} className="text-gray-400 hover:text-white transition-colors text-xs font-semibold px-2 py-1 rounded hover:bg-slate-700/50" aria-label="Trocar Jogador">
                        Trocar
                    </button>
                 </div>
                 {playerName && (
                    <div className="text-cyan-400 font-medium">
                        <span className="font-bold">{playerName}</span>
                    </div>
                )}
             </div>
            <div className="flex justify-between items-stretch w-full bg-slate-900/70 rounded-lg p-2 px-4 shadow-lg text-white gap-4">
               <div className={`relative flex items-center justify-center text-center px-2 py-1 rounded-full bg-slate-800 border-2 ${levelUp ? 'border-yellow-400 animate-pulse' : 'border-cyan-500'}`}>
                    <span className="text-xs absolute -top-2 bg-slate-800 px-1 text-cyan-400">LVL</span>
                    <div className="text-2xl font-bold text-cyan-300">{level}</div>
               </div>

                <div className="flex-1 flex flex-col justify-center">
                    <div className="flex justify-between items-baseline">
                        <div className="text-center">
                            <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Pontuação</div>
                            <div className={`text-xl font-bold ${popScore ? 'animate-value-pop' : ''}`}>{animatedScore}</div>
                        </div>
                        {combo > 1 && (
                            <div className="text-center animate-pop-in animate-pulse-glow">
                                <div className="text-xs text-orange-400 uppercase tracking-wider font-semibold">Combo</div>
                                <div className="text-xl font-bold text-orange-400">x{combo}</div>
                            </div>
                        )}
                         <div className="text-center">
                            <div className="flex items-center justify-center gap-1 text-xs text-yellow-400 uppercase tracking-wider font-semibold">
                                Recorde <CrownIcon/>
                            </div>
                            <div className="text-lg font-bold text-yellow-400">{highScore}</div>
                        </div>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2.5 mt-1 overflow-hidden border border-slate-600">
                        <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-500" style={{ width: `${xpPercentage}%` }}></div>
                    </div>
                </div>

                <div className="text-center flex flex-col justify-center items-center">
                    <CoinIcon className="h-6 w-6" />
                    <div className={`text-lg font-bold text-amber-400 ${popCoins ? 'animate-value-pop' : ''}`}>{animatedCoins}</div>
                </div>
            </div>
        </div>
    );
};

export default Scoreboard;
