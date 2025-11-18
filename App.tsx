

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GridState, PieceData, DraggedPiece, AnimationState, PieceShape, ActivePowerUp } from './types.ts';
import { 
    GRID_WIDTH, GRID_HEIGHT, PIECES, POINTS_PER_COIN, COIN_COST_FOR_ROTATE, 
    COIN_COST_FOR_SHUFFLE, COIN_COST_FOR_BOMB, XP_PER_BLOCK, XP_PER_LINE, 
    XP_BASE_LEVEL, XP_LEVEL_MULTIPLIER, LEVEL_UP_COIN_BONUS, COLORS,
    POINTS_PER_BLOCK, POINTS_PER_LINE_CLEAR, BONUS_BOMB_CHANCE, POINTS_PER_BOMB_BLOCK
} from './constants.ts';
import Grid from './components/Grid.tsx';
import Piece from './components/Piece.tsx';
import Scoreboard from './components/Scoreboard.tsx';
import GameOverModal from './components/GameOverModal.tsx';
import PlayerModal from './components/PlayerModal.tsx';
import PowerUps from './components/PowerUps.tsx';
import ConfirmModal from './components/ConfirmModal.tsx';
import StuckModal from './components/StuckModal.tsx';
import TreasureChestModal from './components/TreasureChestModal.tsx';

const createEmptyGrid = (): GridState => Array.from({ length: GRID_HEIGHT }, () => Array(GRID_WIDTH).fill(null));

const rotateMatrix = (matrix: PieceShape): PieceShape => {
    const rows = matrix.length;
    const cols = matrix[0].length;
    const newMatrix = Array.from({ length: cols }, () => Array(rows).fill(0));
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            newMatrix[c][rows - 1 - r] = matrix[r][c];
        }
    }
    return newMatrix;
};

const getUniqueRotations = (shape: PieceShape): PieceShape[] => {
    const uniqueShapes = new Set<string>();
    const rotations: PieceShape[] = [];
    let currentShape = shape;

    for (let i = 0; i < 4; i++) {
        const shapeString = JSON.stringify(currentShape);
        if (!uniqueShapes.has(shapeString)) {
            uniqueShapes.add(shapeString);
            rotations.push(currentShape);
        }
        currentShape = rotateMatrix(currentShape);
    }
    return rotations;
};

const triggerHapticFeedback = (pattern: number | number[] = 30) => {
    if ('vibrate' in navigator) {
        try {
            navigator.vibrate(pattern);
        } catch (error) {
            console.warn("Haptic feedback is not supported or failed.", error);
        }
    }
};

const CoinIcon: React.FC<{className?: string}> = ({className}) => (
     <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-amber-400 ${className}`} viewBox="0 0 20 20" fill="currentColor">
        <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="2" fill="none" />
        <text x="50%" y="65%" dominantBaseline="middle" textAnchor="middle" fontSize="9" fontWeight="bold" fill="currentColor">$</text>
    </svg>
);

const App: React.FC = () => {
    const [grid, setGrid] = useState<GridState>(createEmptyGrid());
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [coins, setCoins] = useState(50);
    const [level, setLevel] = useState(1);
    const [xp, setXp] = useState(0);
    const [xpForNextLevel, setXpForNextLevel] = useState(XP_BASE_LEVEL);
    const [availablePieces, setAvailablePieces] = useState<PieceData[]>([]);
    const [draggedPiece, setDraggedPiece] = useState<DraggedPiece | null>(null);
    const [gameOver, setGameOver] = useState(false);
    const [isStuck, setIsStuck] = useState(false);
    const [combo, setCombo] = useState(0);
    const [animationState, setAnimationState] = useState<AnimationState>(null);
    const [isMuted, setIsMuted] = useState(() => localStorage.getItem('quebraBlocosMuted') === 'true');
    const [currentPlayer, setCurrentPlayer] = useState<string | null>(null);
    const [showPlayerModal, setShowPlayerModal] = useState(false);
    const [showNewGameConfirm, setShowNewGameConfirm] = useState(false);
    const [activePowerUp, setActivePowerUp] = useState<ActivePowerUp>(null);
    const [dropPosition, setDropPosition] = useState<{ r: number; c: number; isValid: boolean } | null>(null);
    const [isFullScreen, setIsFullScreen] = useState(!!document.fullscreenElement);
    const [showTreasureChests, setShowTreasureChests] = useState(false);
    const [nextChestThreshold, setNextChestThreshold] = useState(3000);
    const [isInitialized, setIsInitialized] = useState(false);
    
    const audioContextRef = useRef<AudioContext | null>(null);
    const gridRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }, []);

    const playSound = useCallback((type: 'place' | 'clear' | 'rotate' | 'gameOver' | 'coin' | 'shuffle' | 'bomb' | 'levelUp') => {
        if (isMuted || !audioContextRef.current) return;

        const audioContext = audioContextRef.current;
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        let duration = 0.2;

        switch (type) {
            case 'place':
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(150, audioContext.currentTime);
                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.2);
                duration = 0.2;
                break;
            case 'clear':
                oscillator.type = 'sawtooth';
                oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.4);
                gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.4);
                duration = 0.4;
                break;
            case 'rotate':
                oscillator.type = 'square';
                oscillator.frequency.setValueAtTime(250, audioContext.currentTime);
                gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.1);
                duration = 0.1;
                break;
            case 'coin':
            case 'levelUp':
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(500, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.1);
                gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.2);
                duration = 0.2;
                break;
            case 'shuffle':
                 oscillator.type = 'sawtooth';
                oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
                 oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.3);
                 gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                 gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.3);
                 duration = 0.3;
                break;
             case 'bomb':
                oscillator.type = 'sawtooth';
                oscillator.frequency.setValueAtTime(80, audioContext.currentTime);
                oscillator.frequency.linearRampToValueAtTime(40, audioContext.currentTime + 0.5);
                gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.5);
                duration = 0.5;
                break;
            case 'gameOver':
                oscillator.type = 'sawtooth';
                oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.8);
                gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.8);
                duration = 0.8;
                break;
        }

        oscillator.start();
        oscillator.stop(audioContext.currentTime + duration);
    }, [isMuted]);

    const addXp = useCallback((amount: number) => {
        setXp(prevXp => prevXp + amount);
    }, []);

    const generateRandomPiece = useCallback((): PieceData => {
        const pieceInfo = PIECES[Math.floor(Math.random() * PIECES.length)];
        const piece: PieceData = {
            id: Date.now() + Math.random(),
            name: pieceInfo.name,
            shape: pieceInfo.shape,
            color: pieceInfo.color,
            width: pieceInfo.shape[0].length,
            height: pieceInfo.shape.length,
        };

        if (Math.random() < BONUS_BOMB_CHANCE) {
            const possibleBombLocations: { r: number; c: number }[] = [];
            piece.shape.forEach((row, r) => {
                row.forEach((cell, c) => {
                    if (cell) {
                        possibleBombLocations.push({ r, c });
                    }
                });
            });

            if (possibleBombLocations.length > 0) {
                piece.bonusBomb = possibleBombLocations[Math.floor(Math.random() * possibleBombLocations.length)];
            }
        }
        return piece;
    }, []);

    const generateNewPieces = useCallback(() => {
        setAvailablePieces([generateRandomPiece(), generateRandomPiece(), generateRandomPiece()]);
    }, [generateRandomPiece]);

    const canPlace = useCallback((gridState: GridState, piece: PieceData, startRow: number, startCol: number): boolean => {
        for (let r = 0; r < piece.height; r++) {
            for (let c = 0; c < piece.width; c++) {
                if (piece.shape[r][c]) {
                    const gridRow = startRow + r;
                    const gridCol = startCol + c;

                    if (gridRow >= GRID_HEIGHT || gridRow < 0 || gridCol < 0 || gridCol >= GRID_WIDTH || gridState[gridRow]?.[gridCol]) {
                        return false;
                    }
                }
            }
        }
        return true;
    }, []);

    const checkGameOver = useCallback((currentGrid: GridState, pieces: PieceData[]): boolean => {
        if (pieces.length === 0) return false;
        
        for (const piece of pieces) {
            if (!piece) continue;

            const allRotations = getUniqueRotations(piece.shape);

            for (const rotatedShape of allRotations) {
                const rotatedPieceData: PieceData = {
                    ...piece,
                    shape: rotatedShape,
                    width: rotatedShape[0].length,
                    height: rotatedShape.length,
                };

                for (let r = 0; r < GRID_HEIGHT; r++) {
                    for (let c = 0; c < GRID_WIDTH; c++) {
                        if (canPlace(currentGrid, rotatedPieceData, r, c)) {
                            return false; // Found a valid move with a rotation
                        }
                    }
                }
            }
        }
        return true; // No valid moves for any piece in any rotation
    }, [canPlace]);

    const getClearedLinesInfo = useCallback((currentGrid: GridState): { clearedCoords: { r: number; c: number }[], clearedLinesCount: number } => {
        const rowsToClear: number[] = [];
        const colsToClear: number[] = [];

        for (let r = 0; r < GRID_HEIGHT; r++) {
            if (currentGrid[r].every(cell => cell !== null)) {
                rowsToClear.push(r);
            }
        }

        for (let c = 0; c < GRID_WIDTH; c++) {
            if (currentGrid.every(row => row[c] !== null)) {
                colsToClear.push(c);
            }
        }
        
        const uniqueCoords = new Set<string>();
        rowsToClear.forEach(r => {
            for (let c = 0; c < GRID_WIDTH; c++) {
                uniqueCoords.add(`${r},${c}`);
            }
        });
        colsToClear.forEach(c => {
            for (let r = 0; r < GRID_HEIGHT; r++) {
                uniqueCoords.add(`${r},${c}`);
            }
        });

        const clearedCoordsArray = Array.from(uniqueCoords, s => {
            const [r, c] = s.split(',').map(Number);
            return { r, c };
        });

        return { clearedCoords: clearedCoordsArray, clearedLinesCount: rowsToClear.length + colsToClear.length };
    }, []);

    const handleDropPiece = useCallback((row: number, col: number) => {
        if (!draggedPiece || animationState) return;

        const { piece, index } = draggedPiece;

        if (canPlace(grid, piece, row, col)) {
            playSound('place');
            triggerHapticFeedback(50);
            let newGrid = grid.map(r => [...r]);
            let pieceScore = 0;
            const placedCells: { r: number; c: number }[] = [];

            for (let r = 0; r < piece.height; r++) {
                for (let c = 0; c < piece.width; c++) {
                    if (piece.shape[r][c]) {
                        const gridRow = row + r;
                        const gridCol = col + c;
                        const isBomb = piece.bonusBomb?.r === r && piece.bonusBomb?.c === c;
                        newGrid[gridRow][gridCol] = { color: piece.color, isBomb: isBomb };
                        pieceScore += POINTS_PER_BLOCK;
                        placedCells.push({ r: gridRow, c: gridCol });
                    }
                }
            }
            
            addXp(pieceScore * XP_PER_BLOCK);

            let { clearedCoords, clearedLinesCount } = getClearedLinesInfo(newGrid);
            
            const triggeredBombLocations: { r: number; c: number }[] = [];
            clearedCoords.forEach(({ r, c }) => {
                if (newGrid[r][c]?.isBomb) {
                    triggeredBombLocations.push({ r, c });
                }
            });

            let bombExplosionScore = 0;
            if (triggeredBombLocations.length > 0) {
                playSound('bomb');
                triggerHapticFeedback([80, 40, 80]);
                const explosionCells = new Set<string>();

                triggeredBombLocations.forEach(bombPos => {
                    for (let i = -1; i <= 1; i++) {
                        for (let j = -1; j <= 1; j++) {
                            const explosionRow = bombPos.r + i;
                            const explosionCol = bombPos.c + j;

                            if (explosionRow >= 0 && explosionRow < GRID_HEIGHT && explosionCol >= 0 && explosionCol < GRID_WIDTH) {
                                if (newGrid[explosionRow][explosionCol]) {
                                    bombExplosionScore += POINTS_PER_BOMB_BLOCK;
                                }
                                explosionCells.add(`${explosionRow},${explosionCol}`);
                            }
                        }
                    }
                });
                
                const allCellsToClearSet = new Set([...clearedCoords.map(c => `${c.r},${c.c}`), ...explosionCells]);
                clearedCoords = Array.from(allCellsToClearSet, s => {
                    const [r, c] = s.split(',').map(Number);
                    return { r, c };
                });
            }

            setGrid(newGrid);

            let lineScore = 0;
            if (clearedLinesCount > 0 || triggeredBombLocations.length > 0) {
                 if (clearedLinesCount > 0) playSound('clear');
                 triggerHapticFeedback([100, 30, 100]);
                 const newCombo = combo + clearedLinesCount;
                 setCombo(newCombo);
                 lineScore = clearedLinesCount * POINTS_PER_LINE_CLEAR * newCombo;
                 addXp(clearedLinesCount * XP_PER_LINE * newCombo);
                 setAnimationState({ type: 'clear', cells: clearedCoords });
            } else {
                setAnimationState({ type: 'place', cells: placedCells });
                setCombo(0);
            }
            
            setScore(prev => {
                const newScore = prev + pieceScore + lineScore + bombExplosionScore;
                const coinsEarned = Math.floor(newScore / POINTS_PER_COIN) - Math.floor(prev / POINTS_PER_COIN);
                if (coinsEarned > 0) {
                    playSound('coin');
                    setCoins(c => c + coinsEarned);
                }
                return newScore;
            });
            addXp(bombExplosionScore * XP_PER_BLOCK);
            
            const newAvailablePieces = availablePieces.filter((_, i) => i !== index);
            setAvailablePieces(newAvailablePieces);
        }
    }, [draggedPiece, grid, canPlace, availablePieces, combo, getClearedLinesInfo, animationState, playSound, addXp]);
    
    const handleDragMove = useCallback((clientX: number, clientY: number) => {
        if (!draggedPiece) return;
        
        if (!gridRef.current) return;

        const gridRect = gridRef.current.getBoundingClientRect();
        
        if (clientX > gridRect.left && clientX < gridRect.right && clientY > gridRect.top && clientY < gridRect.bottom) {
            const cellWidth = gridRect.width / GRID_WIDTH;
            const cellHeight = gridRect.height / GRID_HEIGHT;
            const relativeX = clientX - gridRect.left;
            const relativeY = clientY - gridRect.top;
            
            const cursorCol = Math.floor(relativeX / cellWidth);
            const cursorRow = Math.floor(relativeY / cellHeight);
            
            const piece = draggedPiece.piece;
            // Align the ghost piece so its center is at the cursor's grid cell
            const dropRow = cursorRow - Math.floor(piece.height / 2);
            const dropCol = cursorCol - Math.floor(piece.width / 2);
            
            const isValid = canPlace(grid, piece, dropRow, dropCol);

            if (!dropPosition || dropPosition.r !== dropRow || dropPosition.c !== dropCol || dropPosition.isValid !== isValid) {
                setDropPosition({ r: dropRow, c: dropCol, isValid: isValid });
            }
        } else {
            setDropPosition(null);
        }
    }, [draggedPiece, canPlace, grid, dropPosition]);

    const handleDragStart = (piece: PieceData, index: number, clientX: number, clientY: number) => {
        if (animationState || activePowerUp) return;
        triggerHapticFeedback(20);
        setDraggedPiece({ piece, index });
        handleDragMove(clientX, clientY); // Immediately place the ghost piece on the grid
    };

    const handleDragEnd = useCallback(() => {
        if (draggedPiece && dropPosition && dropPosition.isValid) {
            handleDropPiece(dropPosition.r, dropPosition.c);
        }
        setDraggedPiece(null);
        setDropPosition(null);
    }, [draggedPiece, dropPosition, handleDropPiece]);
    
    const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
        handleDragMove(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: React.TouchEvent<HTMLElement>) => {
        handleDragMove(e.touches[0].clientX, e.touches[0].clientY);
    };

    const handleRotatePiece = (index: number) => {
        if (coins < COIN_COST_FOR_ROTATE || animationState || activePowerUp || draggedPiece) return;
        playSound('rotate');
        triggerHapticFeedback(20);
        setCoins(c => c - COIN_COST_FOR_ROTATE);
        setAvailablePieces(pieces => {
            const newPieces = [...pieces];
            const pieceToRotate = newPieces[index];
            const newShape = rotateMatrix(pieceToRotate.shape);
            newPieces[index] = {
                ...pieceToRotate,
                shape: newShape,
                width: newShape[0].length,
                height: newShape.length,
            };
            return newPieces;
        });
    };
    
    const handleShufflePieces = () => {
        if (coins < COIN_COST_FOR_SHUFFLE || animationState || activePowerUp || draggedPiece) return;
        playSound('shuffle');
        setCoins(c => c - COIN_COST_FOR_SHUFFLE);
        const nextPieces = [generateRandomPiece(), generateRandomPiece(), generateRandomPiece()];
        setAvailablePieces(nextPieces);
        if (checkGameOver(grid, nextPieces)) {
            setIsStuck(true);
        }
    };
    
    const toggleMute = () => {
        setIsMuted(prev => {
            const newState = !prev;
            localStorage.setItem('quebraBlocosMuted', String(newState));
            return newState;
        });
    };
    
    const handleActivateBomb = () => {
        if (coins < COIN_COST_FOR_BOMB || animationState || activePowerUp || draggedPiece) return;
        triggerHapticFeedback(50);
        setCoins(c => c - COIN_COST_FOR_BOMB);
        setActivePowerUp('bomb');
    };
    
    const handleGridClick = (r: number, c: number) => {
        if (activePowerUp === 'bomb') {
            playSound('bomb');
            const cellsToClear: {r: number, c: number}[] = [];
            let clearedCount = 0;
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    const row = r + i;
                    const col = c + j;
                    if (row >= 0 && row < GRID_HEIGHT && col >= 0 && col < GRID_WIDTH) {
                        cellsToClear.push({ r: row, c: col });
                        if(grid[row][col]) clearedCount++;
                    }
                }
            }
            
            if (clearedCount > 0) {
                 setScore(prev => {
                    const newScore = prev + (clearedCount * POINTS_PER_BLOCK);
                    const coinsEarned = Math.floor(newScore / POINTS_PER_COIN) - Math.floor(prev / POINTS_PER_COIN);
                    if (coinsEarned > 0) {
                        playSound('coin');
                        setCoins(c => c + coinsEarned);
                    }
                    return newScore;
                });
                addXp(clearedCount * XP_PER_BLOCK);
            }

            setAnimationState({ type: 'bomb', cells: cellsToClear });
            setActivePowerUp(null);
        }
    };

    const clearSavedGameState = useCallback(() => {
        if (currentPlayer) {
            localStorage.removeItem(`quebraBlocosGameState_${currentPlayer}`);
        }
    }, [currentPlayer]);

    const restartGame = useCallback(() => {
        clearSavedGameState();
        setGrid(createEmptyGrid());
        setScore(0);
        setGameOver(false);
        setIsStuck(false);
        generateNewPieces();
        setCombo(0);
        setAnimationState(null);
        setActivePowerUp(null);
        setNextChestThreshold(3000);
        setShowTreasureChests(false);
    }, [generateNewPieces, clearSavedGameState]);
    
    const handlePlayerSet = useCallback((name: string) => {
        setCurrentPlayer(name);
        localStorage.setItem('quebraBlocosCurrentPlayer', name);
        
        const storedHighScore = Number(localStorage.getItem(`quebraBlocosHighScore_${name}`) || 0);
        const storedCoins = localStorage.getItem(`quebraBlocosCoins_${name}`);
        const storedLevel = Number(localStorage.getItem(`quebraBlocosLevel_${name}`) || 1);
        const storedXp = Number(localStorage.getItem(`quebraBlocosXP_${name}`) || 0);

        setHighScore(storedHighScore);
        setCoins(storedCoins === null ? 50 : Number(storedCoins));
        setLevel(storedLevel);
        setXp(storedXp);
        setXpForNextLevel(Math.floor(XP_BASE_LEVEL * Math.pow(XP_LEVEL_MULTIPLIER, storedLevel - 1)));

        const savedGameStateJSON = localStorage.getItem(`quebraBlocosGameState_${name}`);
        let loadedGame = false;
        if (savedGameStateJSON) {
            try {
                const savedGameState = JSON.parse(savedGameStateJSON);
                if (savedGameState.grid && savedGameState.availablePieces && Array.isArray(savedGameState.availablePieces)) {
                    setGrid(savedGameState.grid);
                    setScore(savedGameState.score || 0);
                    setCombo(savedGameState.combo || 0);
                    setNextChestThreshold(savedGameState.nextChestThreshold || 3000);
                    
                    let pieces = savedGameState.availablePieces;
                    if (pieces.length === 0) {
                        pieces = [generateRandomPiece(), generateRandomPiece(), generateRandomPiece()];
                    }
                    setAvailablePieces(pieces);

                    if (checkGameOver(savedGameState.grid, pieces)) {
                        setIsStuck(true);
                    }
                    loadedGame = true;
                }
            } catch (e) {
                console.error("Failed to parse game state:", e);
            }
        }

        if (!loadedGame) {
            setGrid(createEmptyGrid());
            setScore(0);
            setGameOver(false);
            setIsStuck(false);
            generateNewPieces();
            setCombo(0);
            setAnimationState(null);
            setActivePowerUp(null);
            setNextChestThreshold(3000);
            setShowTreasureChests(false);
        }

        setShowPlayerModal(false);
        setIsInitialized(true);
    }, [generateNewPieces, checkGameOver]);

    const handleSwitchPlayer = () => {
        setIsInitialized(false);
        setCurrentPlayer(null);
        localStorage.removeItem('quebraBlocosCurrentPlayer');
        setShowPlayerModal(true);
    };

    const handleToggleFullScreen = useCallback(() => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch((err) => {
                console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }, []);

    const handleRequestNewGame = () => {
        if (gameOver || animationState || isStuck) return;
        setShowNewGameConfirm(true);
    };

    const confirmNewGame = () => {
        restartGame();
        setShowNewGameConfirm(false);
    };

    const cancelNewGame = () => {
        setShowNewGameConfirm(false);
    };
    
    const handleEndGameFromStuck = () => {
        clearSavedGameState();
        playSound('gameOver');
        triggerHapticFeedback([200, 50, 200]);
        setIsStuck(false);
        setGameOver(true);
    };

    const handleUseShuffleFromStuck = () => {
        playSound('shuffle');
        setCoins(c => c - COIN_COST_FOR_SHUFFLE);
        
        let nextPieces: PieceData[] = [];
        let isStillStuck = true;
        let attempts = 0;
        
        // Attempt to find a playable set of pieces, with a safety break
        while(isStillStuck && attempts < 20) {
            nextPieces = [generateRandomPiece(), generateRandomPiece(), generateRandomPiece()];
            isStillStuck = checkGameOver(grid, nextPieces);
            attempts++;
        }

        if (isStillStuck) {
            // Extremely rare case: couldn't find a valid set. End the game.
            handleEndGameFromStuck();
        } else {
            setAvailablePieces(nextPieces);
            setIsStuck(false);
        }
    };

    const handleRewardSelection = (reward: { type: 'coins'; amount: number } | { type: 'board_clear' }) => {
        setShowTreasureChests(false);

        if (reward.type === 'coins') {
            playSound('levelUp');
            setCoins(c => c + reward.amount);
        } else if (reward.type === 'board_clear') {
            playSound('bomb');
            triggerHapticFeedback([100, 50, 100, 50, 100]);
            const cellsToClear: {r: number, c: number}[] = [];
            let clearedCount = 0;

            grid.forEach((row, r) => {
                row.forEach((cell, c) => {
                    if (cell) {
                        cellsToClear.push({ r, c });
                        clearedCount++;
                    }
                });
            });
            
            if (clearedCount > 0) {
                 setScore(prev => {
                    const newScore = prev + (clearedCount * POINTS_PER_BLOCK * 2); // Bonus points
                    const coinsEarned = Math.floor(newScore / POINTS_PER_COIN) - Math.floor(prev / POINTS_PER_COIN);
                    if (coinsEarned > 0) {
                        playSound('coin');
                        setCoins(c => c + coinsEarned);
                    }
                    return newScore;
                });
                addXp(clearedCount * XP_PER_BLOCK * 2); // Bonus XP
            }

            setAnimationState({ type: 'bomb', cells: cellsToClear });
        }
    };

    useEffect(() => {
        const onFullScreenChange = () => {
            setIsFullScreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', onFullScreenChange);
        document.addEventListener('webkitfullscreenchange', onFullScreenChange);
        document.addEventListener('mozfullscreenchange', onFullScreenChange);
        document.addEventListener('msfullscreenchange', onFullScreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', onFullScreenChange);
            document.removeEventListener('webkitfullscreenchange', onFullScreenChange);
            document.removeEventListener('mozfullscreenchange', onFullScreenChange);
            document.removeEventListener('msfullscreenchange', onFullScreenChange);
        };
    }, []);

    useEffect(() => {
        const storedPlayer = localStorage.getItem('quebraBlocosCurrentPlayer');
        if (storedPlayer) {
            handlePlayerSet(storedPlayer);
        } else {
            setShowPlayerModal(true);
            setIsInitialized(true);
        }
    }, [handlePlayerSet]);

    useEffect(() => {
        if (!isInitialized || !currentPlayer || gameOver || isStuck) {
            return;
        }

        const gameState = {
            grid,
            score,
            availablePieces,
            combo,
            nextChestThreshold,
        };
        if (score > 0 || grid.some(row => row.some(cell => cell !== null))) {
            localStorage.setItem(`quebraBlocosGameState_${currentPlayer}`, JSON.stringify(gameState));
        }
    }, [grid, score, availablePieces, combo, nextChestThreshold, currentPlayer, gameOver, isStuck, isInitialized]);
    
    useEffect(() => {
      if (xp >= xpForNextLevel) {
          playSound('levelUp');
          const newLevel = level + 1;
          const remainingXp = xp - xpForNextLevel;
          setLevel(newLevel);
          setXp(remainingXp);
          setXpForNextLevel(Math.floor(XP_BASE_LEVEL * Math.pow(XP_LEVEL_MULTIPLIER, newLevel - 1)));
          setCoins(c => c + LEVEL_UP_COIN_BONUS);
      }
    }, [xp, xpForNextLevel, level, playSound]);

    useEffect(() => {
        if (!animationState) return;

        const animationDuration = animationState.type === 'place' ? 200 : 400;
        const timer = setTimeout(() => {
            const performEndTurnChecks = (finalGrid: GridState) => {
                let piecesForCheck = availablePieces;
                if (piecesForCheck.length === 0) {
                    const newPieces = [generateRandomPiece(), generateRandomPiece(), generateRandomPiece()];
                    setAvailablePieces(newPieces);
                    if (checkGameOver(finalGrid, newPieces)) {
                        setIsStuck(true);
                    }
                } else {
                    if (checkGameOver(finalGrid, piecesForCheck)) {
                        setIsStuck(true);
                    }
                }
            };

            if (animationState.type !== 'place') {
                const newGrid = grid.map(row => [...row]);
                animationState.cells.forEach(({ r, c }) => {
                    newGrid[r][c] = null;
                });
                setGrid(newGrid);
                performEndTurnChecks(newGrid);
            } else {
                performEndTurnChecks(grid);
            }

            setAnimationState(null);
        }, animationDuration);

        return () => clearTimeout(timer);
    }, [animationState, availablePieces, grid, checkGameOver, generateRandomPiece]);

    useEffect(() => {
        if (currentPlayer && score > highScore) {
            setHighScore(score);
            localStorage.setItem(`quebraBlocosHighScore_${currentPlayer}`, String(score));
        }
    }, [score, highScore, currentPlayer]);
    
    useEffect(() => {
        if (currentPlayer) {
            localStorage.setItem(`quebraBlocosCoins_${currentPlayer}`, String(coins));
            localStorage.setItem(`quebraBlocosLevel_${currentPlayer}`, String(level));
            localStorage.setItem(`quebraBlocosXP_${currentPlayer}`, String(xp));
        }
    }, [coins, level, xp, currentPlayer]);
    
     useEffect(() => {
        if (gameOver) {
            clearSavedGameState();
            if (level > 1) {
                const newLevel = level - 1;
                setLevel(newLevel);
                setXp(0);
                setXpForNextLevel(Math.floor(XP_BASE_LEVEL * Math.pow(XP_LEVEL_MULTIPLIER, newLevel - 1)));
            } else {
                setXp(0);
            }
        }
    }, [gameOver, level, clearSavedGameState]);

     useEffect(() => {
        if (!animationState && !gameOver && !isStuck && score >= nextChestThreshold) {
            setShowTreasureChests(true);
            setNextChestThreshold(t => t + 3000);
        }
    }, [score, nextChestThreshold, animationState, gameOver, isStuck]);

    const mainClasses = `bg-gradient-to-br from-gray-900 to-slate-800 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] h-screen w-screen text-white flex flex-col items-center justify-between p-4 selection:bg-transparent touch-none ${activePowerUp === 'bomb' ? 'cursor-crosshair' : ''}`;

    return (
        <main 
            className={mainClasses}
            onMouseMove={draggedPiece ? handleMouseMove : undefined}
            onTouchMove={draggedPiece ? handleTouchMove : undefined}
            onMouseUp={draggedPiece ? handleDragEnd : undefined}
            onTouchEnd={draggedPiece ? handleDragEnd : undefined}
            onMouseLeave={draggedPiece ? handleDragEnd : undefined}
        >
            
            {showPlayerModal && <PlayerModal onPlayerSet={handlePlayerSet} />}

            {showNewGameConfirm && (
                <ConfirmModal
                    title="Iniciar Novo Jogo?"
                    message="Sua pontuação e tabuleiro atuais serão perdidos. O nível do jogador e as moedas serão mantidos."
                    onConfirm={confirmNewGame}
                    onCancel={cancelNewGame}
                    confirmText="Novo Jogo"
                    cancelText="Continuar Jogando"
                />
            )}
            
            {isStuck && (
                <StuckModal
                    coins={coins}
                    onShuffle={handleUseShuffleFromStuck}
                    onEndGame={handleEndGameFromStuck}
                />
            )}

            {showTreasureChests && <TreasureChestModal onReward={handleRewardSelection} />}

            <div className="w-full max-w-md">
                <Scoreboard 
                    score={score} 
                    highScore={highScore} 
                    coins={coins}
                    level={level}
                    xp={xp}
                    xpForNextLevel={xpForNextLevel}
                    combo={combo}
                    isMuted={isMuted} 
                    onToggleMute={toggleMute}
                    playerName={currentPlayer}
                    onSwitchPlayer={handleSwitchPlayer}
                    isFullScreen={isFullScreen}
                    onToggleFullScreen={handleToggleFullScreen}
                    onNewGame={handleRequestNewGame}
                />
            </div>

            <div className="flex-grow flex items-center justify-center w-full max-w-md py-4">
                 <Grid 
                    grid={grid}
                    gridRef={gridRef}
                    draggedPiece={draggedPiece?.piece || null} 
                    animationState={animationState}
                    onGridClick={handleGridClick}
                    activePowerUp={activePowerUp}
                    dropPosition={dropPosition}
                  />
            </div>

            <div className="w-full max-w-md flex items-center justify-between gap-1 p-2 bg-slate-900/60 rounded-xl shadow-inner min-h-[100px]">
                <PowerUps coins={coins} onActivateBomb={handleActivateBomb} animationState={animationState} activePowerUp={activePowerUp} draggedPiece={draggedPiece} />
                
                <div className="flex-grow flex items-center justify-around">
                    {availablePieces.map((piece, index) =>
                        piece ? (
                            <Piece
                                key={piece.id}
                                piece={piece}
                                onDragStart={(clientX, clientY) => handleDragStart(piece, index, clientX, clientY)}
                                onRotate={() => handleRotatePiece(index)}
                                isHidden={draggedPiece?.index === index}
                            />
                        ) : <div className="w-16" />
                    )}
                </div>
                 <button
                    onClick={handleShufflePieces}
                    disabled={coins < COIN_COST_FOR_SHUFFLE || animationState !== null || activePowerUp !== null || draggedPiece !== null}
                    className="flex flex-col items-center justify-center text-amber-400 disabled:text-gray-600 disabled:cursor-not-allowed transition-all p-2 rounded-lg w-20 h-20 border-2 border-transparent hover:bg-slate-700/50 hover:border-amber-500/50"
                    aria-label={`Embaralhar peças por ${COIN_COST_FOR_SHUFFLE} moedas`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    <div className="flex items-center gap-1 mt-1">
                        <span className="text-sm font-bold">{COIN_COST_FOR_SHUFFLE}</span>
                        <CoinIcon />
                    </div>
                </button>
            </div>
            
            {gameOver && <GameOverModal score={score} highScore={highScore} onRestart={restartGame} />}
             <style>{`
                .touch-none {
                    -webkit-touch-callout: none;
                    -webkit-user-select: none;
                    -khtml-user-select: none;
                    -moz-user-select: none;
                    -ms-user-select: none;
                    user-select: none;
                    -webkit-tap-highlight-color: transparent;
                    touch-action: none;
                }
                @keyframes pop-in {
                    0% {
                        opacity: 0;
                        transform: scale(0.5);
                    }
                    100% {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                .animate-pop-in {
                    animation: pop-in 0.3s ease-out forwards;
                }
                @keyframes pulse-glow {
                    0%, 100% {
                        filter: drop-shadow(0 0 3px rgba(251, 146, 60, 0.7));
                        transform: scale(1);
                    }
                    50% {
                        filter: drop-shadow(0 0 10px rgba(251, 146, 60, 1));
                        transform: scale(1.05);
                    }
                }
                .animate-pulse-glow {
                    animation: pulse-glow 1.2s ease-in-out infinite;
                }
                 @keyframes flash {
                  0%, 100% { 
                    transform: scale(1.0);
                    opacity: 1;
                  }
                  50% { 
                    transform: scale(1.1);
                    opacity: 0.5;
                    box-shadow: 0 0 20px #fff, 0 0 30px #0ff;
                  }
                }
                .animate-flash {
                  animation: flash 0.4s ease-out;
                }
                @keyframes pop-cell {
                  50% {
                    transform: scale(1.15);
                  }
                }
                .animate-pop-cell {
                  animation: pop-cell 0.2s ease-out;
                }
                @keyframes value-pop {
                  50% {
                    transform: scale(1.15);
                  }
                }
                .animate-value-pop {
                  animation: value-pop 0.3s ease-out;
                }
             `}</style>
        </main>
    );
};

export default App;