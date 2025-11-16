import React, { useState, useEffect } from 'react';

type Reward = { type: 'coins'; amount: number } | { type: 'board_clear' };

interface TreasureChestModalProps {
  onReward: (reward: Reward) => void;
}

const CoinIcon: React.FC<{className?: string}> = ({className}) => (
     <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className}`} viewBox="0 0 20 20" fill="currentColor">
        <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="2" fill="none" />
        <text x="50%" y="65%" dominantBaseline="middle" textAnchor="middle" fontSize="9" fontWeight="bold" fill="currentColor">$</text>
    </svg>
);

const BombIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-7 w-7 ${className}`} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
        <path d="M12.293 5.293a1 1 0 011.414 0l2 2a1 1 0 01-1.414 1.414L13 7.414V10a1 1 0 11-2 0V7.414l-1.293 1.293a1 1 0 01-1.414-1.414l2-2z" />
    </svg>
);


const TreasureChestModal: React.FC<TreasureChestModalProps> = ({ onReward }) => {
    const [rewards, setRewards] = useState<Reward[]>([]);
    const [chosenIndex, setChosenIndex] = useState<number | null>(null);
    const [isRevealed, setIsRevealed] = useState(false);

    useEffect(() => {
        const generateRewards = (): Reward[] => {
            const potentialRewards: Reward[] = [];
            // Reward 1: small coins
            potentialRewards.push({ type: 'coins', amount: Math.floor(Math.random() * 21) + 10 }); // 10-30
            // Reward 2: medium coins
            potentialRewards.push({ type: 'coins', amount: Math.floor(Math.random() * 31) + 40 }); // 40-70

            // Reward 3: Board clear (rare) or large coins
            const isRare = Math.random() < 0.15; // 15% chance
            if (isRare) {
                potentialRewards.push({ type: 'board_clear' });
            } else {
                potentialRewards.push({ type: 'coins', amount: Math.floor(Math.random() * 26) + 75 }); // 75-100
            }
            
            return potentialRewards.sort(() => Math.random() - 0.5);
        };
        setRewards(generateRewards());
    }, []);

    const handleChestClick = (index: number) => {
        if (chosenIndex !== null) return;
        setChosenIndex(index);

        setTimeout(() => {
            setIsRevealed(true);
        }, 1200);

        setTimeout(() => {
            onReward(rewards[index]);
        }, 3000);
    };

    const renderReward = (reward: Reward) => {
        if (reward.type === 'coins') {
            return (
                <>
                    <CoinIcon className="h-10 w-10 text-amber-300" />
                    <span className="text-3xl font-bold text-white">+{reward.amount}</span>
                </>
            );
        }
        if (reward.type === 'board_clear') {
            return (
                 <>
                    <BombIcon className="h-10 w-10 text-red-400" />
                    <span className="text-xl font-bold text-white text-center">Limpar Tabuleiro!</span>
                </>
            );
        }
        return null;
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 animate-fade-in">
             <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl shadow-2xl p-8 max-w-lg w-full text-center border-2 border-slate-600">
                <h2 className="text-4xl font-bold text-yellow-400 mb-2 drop-shadow-lg">Recompensa!</h2>
                <p className="text-gray-300 mb-8 text-lg">Escolha um baú para revelar seu prêmio.</p>
                
                <div className="flex justify-around items-end gap-4">
                    {rewards.map((reward, index) => (
                        <div 
                            key={index} 
                            className={`relative transition-transform duration-300 ${chosenIndex === null ? 'cursor-pointer hover:scale-105' : ''} ${chosenIndex !== null && chosenIndex !== index ? 'opacity-50 scale-90' : ''}`}
                            onClick={() => handleChestClick(index)}
                        >
                            <div className="w-24 h-20 md:w-32 md:h-28 relative chest">
                                <div className={`lid ${chosenIndex !== null ? 'open' : ''}`}></div>
                                <div className="base"></div>
                            </div>
                            {isRevealed && (
                                <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-40 flex flex-col items-center justify-center gap-1 animate-reward-show">
                                    {renderReward(reward)}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
             </div>
             <style>{`
                .chest {
                    transform-style: preserve-3d;
                    perspective: 800px;
                }
                .lid, .base {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    background-image: linear-gradient(to right, #a26f2f, #d79740, #a26f2f);
                    border: 4px solid #4a310f;
                    box-sizing: border-box;
                }
                .base {
                    height: 80%;
                    bottom: 0;
                    border-radius: 8px;
                    background-image: linear-gradient(to right, #80551e, #b87a2a, #80551e);
                }
                .base::before, .base::after, .lid::before, .lid::after {
                    content: '';
                    position: absolute;
                    background-color: #4a310f;
                }
                .base::before { /* horizontal band */
                    width: 100%;
                    height: 10px;
                    top: 15%;
                    left: 0;
                }
                .base::after { /* lock */
                    width: 16px;
                    height: 16px;
                    background-color: #ffd700;
                    border: 2px solid #4a310f;
                    border-radius: 4px;
                    top: 10%;
                    left: 50%;
                    transform: translateX(-50%);
                }
                .lid {
                    height: 30%;
                    top: 0;
                    border-radius: 8px 8px 0 0;
                    transform-origin: bottom center;
                    transition: transform 0.8s cubic-bezier(0.68, -0.55, 0.27, 1.55);
                }
                .lid.open {
                    transform: rotateX(-120deg);
                }
                .lid::before { /* horizontal band */
                    width: 100%;
                    height: 10px;
                    top: 50%;
                    transform: translateY(-50%);
                    left: 0;
                }
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out forwards;
                }
                @keyframes reward-show {
                    0% { transform: translateY(20px) scale(0.5); opacity: 0; }
                    100% { transform: translateY(0) scale(1); opacity: 1; }
                }
                .animate-reward-show {
                    animation: reward-show 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
                }
            `}</style>
        </div>
    );
};

export default TreasureChestModal;