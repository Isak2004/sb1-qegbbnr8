import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Trophy, X } from 'lucide-react';

interface Position {
  x: number;
  y: number;
}

interface SnakeGameProps {
  isOpen: boolean;
  onClose: () => void;
}

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type GameState = 'playing' | 'paused' | 'gameOver' | 'won';

const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION: Direction = 'RIGHT';
const GAME_SPEED = 150;
const WIN_CONDITION = 10;

export const SnakeGame: React.FC<SnakeGameProps> = ({ isOpen, onClose }) => {
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Position>({ x: 15, y: 15 });
  const [direction, setDirection] = useState<Direction>(INITIAL_DIRECTION);
  const [gameState, setGameState] = useState<GameState>('playing');
  const [score, setScore] = useState(0);
  const [gridDimensions, setGridDimensions] = useState({ width: 25, height: 20 });
  
  const gameLoopRef = useRef<NodeJS.Timeout>();
  const directionRef = useRef<Direction>(INITIAL_DIRECTION);
  const scoreRef = useRef<number>(0);
  const gameStateRef = useRef<GameState>('playing');

  // Keep refs in sync with state
  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // Update grid dimensions based on full screen size
  useEffect(() => {
    const updateGridSize = () => {
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      
      const gridWidth = Math.floor(screenWidth / GRID_SIZE);
      const gridHeight = Math.floor(screenHeight / GRID_SIZE);
      
      setGridDimensions({ 
        width: Math.max(15, gridWidth), 
        height: Math.max(12, gridHeight) 
      });
    };

    if (isOpen) {
      updateGridSize();
      window.addEventListener('resize', updateGridSize);
      return () => window.removeEventListener('resize', updateGridSize);
    }
  }, [isOpen]);

  // Prevent scrolling and ensure fullscreen on mobile
  useEffect(() => {
    if (isOpen) {
      // Prevent scrolling
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      
      // Prevent pull-to-refresh and other mobile gestures
      const preventTouchMove = (e: TouchEvent) => {
        e.preventDefault();
      };
      
      document.addEventListener('touchmove', preventTouchMove, { passive: false });
      
      return () => {
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
        document.removeEventListener('touchmove', preventTouchMove);
      };
    }
  }, [isOpen]);

  // Generate random food position
  const generateFood = useCallback((currentSnake: Position[]): Position => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * gridDimensions.width),
        y: Math.floor(Math.random() * gridDimensions.height),
      };
    } while (currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
  }, [gridDimensions]);

  // Reset game
  const resetGame = useCallback(() => {
    const initialSnake = [{ x: Math.floor(gridDimensions.width / 2), y: Math.floor(gridDimensions.height / 2) }];
    setSnake(initialSnake);
    setFood(generateFood(initialSnake));
    setDirection(INITIAL_DIRECTION);
    directionRef.current = INITIAL_DIRECTION;
    setGameState('playing');
    gameStateRef.current = 'playing';
    setScore(0);
    scoreRef.current = 0;
  }, [gridDimensions, generateFood]);

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
      return;
    }

    gameLoopRef.current = setInterval(() => {
      // Only continue if game is still playing
      if (gameStateRef.current !== 'playing') {
        return;
      }

      setSnake(currentSnake => {
        const newSnake = [...currentSnake];
        const head = { ...newSnake[0] };

        // Move head based on direction
        switch (directionRef.current) {
          case 'UP':
            head.y -= 1;
            break;
          case 'DOWN':
            head.y += 1;
            break;
          case 'LEFT':
            head.x -= 1;
            break;
          case 'RIGHT':
            head.x += 1;
            break;
        }

        // Check wall collision
        if (head.x < 0 || head.x >= gridDimensions.width || head.y < 0 || head.y >= gridDimensions.height) {
          setGameState('gameOver');
          gameStateRef.current = 'gameOver';
          return currentSnake;
        }

        // Check self collision
        if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
          setGameState('gameOver');
          gameStateRef.current = 'gameOver';
          return currentSnake;
        }

        newSnake.unshift(head);

        // Check food collision
        setFood(currentFood => {
          if (head.x === currentFood.x && head.y === currentFood.y) {
            const newScore = scoreRef.current + 1;
            setScore(newScore);
            scoreRef.current = newScore;
            
            // Check win condition
            if (newScore >= WIN_CONDITION) {
              setGameState('won');
              gameStateRef.current = 'won';
              return currentFood; // Keep current food, game is over
            }
            
            return generateFood(newSnake);
          } else {
            newSnake.pop();
            return currentFood;
          }
        });

        return newSnake;
      });
    }, GAME_SPEED);

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameState, gridDimensions, generateFood]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameStateRef.current !== 'playing') return;

      // Prevent default behavior for arrow keys to avoid page scrolling
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }

      const newDirection = (() => {
        switch (e.key) {
          case 'ArrowUp':
          case 'w':
          case 'W':
            return directionRef.current !== 'DOWN' ? 'UP' : directionRef.current;
          case 'ArrowDown':
          case 's':
          case 'S':
            return directionRef.current !== 'UP' ? 'DOWN' : directionRef.current;
          case 'ArrowLeft':
          case 'a':
          case 'A':
            return directionRef.current !== 'RIGHT' ? 'LEFT' : directionRef.current;
          case 'ArrowRight':
          case 'd':
          case 'D':
            return directionRef.current !== 'LEFT' ? 'RIGHT' : directionRef.current;
          case 'Escape':
            onClose();
            return directionRef.current;
          default:
            return directionRef.current;
        }
      })();

      if (newDirection !== directionRef.current) {
        setDirection(newDirection);
        directionRef.current = newDirection;
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, [isOpen, onClose]);

  // Initialize game when opened
  useEffect(() => {
    if (isOpen) {
      resetGame();
    }
  }, [isOpen, resetGame]);

  const handleDirectionChange = (newDirection: Direction) => {
    if (gameStateRef.current !== 'playing') return;
    
    const canChange = (() => {
      switch (newDirection) {
        case 'UP': return directionRef.current !== 'DOWN';
        case 'DOWN': return directionRef.current !== 'UP';
        case 'LEFT': return directionRef.current !== 'RIGHT';
        case 'RIGHT': return directionRef.current !== 'LEFT';
      }
    })();

    if (canChange) {
      setDirection(newDirection);
      directionRef.current = newDirection;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black overflow-hidden" style={{ height: '100vh', width: '100vw' }}>
      {/* Full Screen Game Board */}
      <div 
        className="relative w-full h-full bg-gradient-to-br from-gray-900 via-black to-gray-900 overflow-hidden"
        style={{
          width: '100vw',
          height: '100vh',
        }}
      >
        {/* Header UI - Fully Transparent */}
        <div className="absolute top-0 left-0 right-0 z-10">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-6">
              <h2 className="text-xl font-bold text-white">Snake Game</h2>
              <div className="flex items-center space-x-4 text-white">
                <span className="text-lg">Score: {score}/{WIN_CONDITION}</span>
                <div className="w-32 bg-white/20 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(score / WIN_CONDITION) * 100}%` }}
                  />
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white transition-colors p-2"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Snake */}
        {snake.map((segment, index) => (
          <div
            key={index}
            className={`absolute transition-all duration-75 ${
              index === 0 
                ? 'bg-gradient-to-br from-green-400 to-green-600 shadow-lg shadow-green-500/50 border border-green-300/50' 
                : 'bg-gradient-to-br from-green-500 to-green-700 border border-green-400/30'
            } rounded-sm`}
            style={{
              left: segment.x * GRID_SIZE,
              top: segment.y * GRID_SIZE,
              width: GRID_SIZE - 1,
              height: GRID_SIZE - 1,
            }}
          />
        ))}

        {/* Food */}
        <div
          className="absolute bg-gradient-to-br from-red-400 to-red-600 rounded-full shadow-lg shadow-red-500/50 animate-pulse border-2 border-red-300/50"
          style={{
            left: food.x * GRID_SIZE + 2,
            top: food.y * GRID_SIZE + 2,
            width: GRID_SIZE - 4,
            height: GRID_SIZE - 4,
          }}
        />

        {/* Game Over Overlay */}
        {gameState === 'gameOver' && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center bg-black/60 p-8 rounded-2xl border border-red-500/30">
              <div className="text-red-400 text-6xl font-bold mb-4">Game Over!</div>
              <div className="text-white text-2xl mb-8">Final Score: {score}/{WIN_CONDITION}</div>
              <div className="flex flex-col space-y-4 justify-center">
                <button
                  onClick={resetGame}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 text-lg"
                >
                  Play Again
                </button>
                <button
                  onClick={onClose}
                  className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 text-lg"
                >
                  Exit Game
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Win Overlay */}
        {gameState === 'won' && (
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center bg-black/60 p-8 rounded-2xl border border-yellow-500/30">
              <Trophy className="w-20 h-20 text-yellow-400 mx-auto mb-6 animate-bounce" />
              <div className="text-yellow-400 text-6xl font-bold mb-4">You Won!</div>
              <div className="text-white text-2xl mb-8">Perfect Score: {WIN_CONDITION}/{WIN_CONDITION}</div>
              <div className="flex flex-col space-y-4 justify-center">
                <button
                  onClick={resetGame}
                  className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 text-lg"
                >
                  Play Again
                </button>
                <button
                  onClick={onClose}
                  className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 text-lg"
                >
                  Exit Game
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Controls */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10 sm:hidden">
          <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
            <div className="grid grid-cols-3 gap-3">
              <div></div>
              <button
                onClick={() => handleDirectionChange('UP')}
                className="bg-white/20 hover:bg-white/30 text-white p-4 rounded-lg transition-colors"
              >
                <ArrowUp className="w-6 h-6" />
              </button>
              <div></div>
              <button
                onClick={() => handleDirectionChange('LEFT')}
                className="bg-white/20 hover:bg-white/30 text-white p-4 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div></div>
              <button
                onClick={() => handleDirectionChange('RIGHT')}
                className="bg-white/20 hover:bg-white/30 text-white p-4 rounded-lg transition-colors"
              >
                <ArrowRight className="w-6 h-6" />
              </button>
              <div></div>
              <button
                onClick={() => handleDirectionChange('DOWN')}
                className="bg-white/20 hover:bg-white/30 text-white p-4 rounded-lg transition-colors"
              >
                <ArrowDown className="w-6 h-6" />
              </button>
              <div></div>
            </div>
          </div>
        </div>

        {/* Grid Lines (Optional - for visual reference) */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          {/* Vertical lines */}
          {Array.from({ length: gridDimensions.width + 1 }).map((_, i) => (
            <div
              key={`v-${i}`}
              className="absolute top-0 bottom-0 w-px bg-white"
              style={{ left: i * GRID_SIZE }}
            />
          ))}
          {/* Horizontal lines */}
          {Array.from({ length: gridDimensions.height + 1 }).map((_, i) => (
            <div
              key={`h-${i}`}
              className="absolute left-0 right-0 h-px bg-white"
              style={{ top: i * GRID_SIZE }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};