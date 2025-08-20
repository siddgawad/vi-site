import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Heart, Shuffle, Repeat, MoreHorizontal, Plus, RotateCcw } from 'lucide-react';

const SpotifyPlayer = () => {
  // Game state
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState<boolean>(true);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'draw'>('playing');
  const [showPlayer, setShowPlayer] = useState<boolean>(false);
  
  // Music player state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration] = useState<number>(180);
  const [volume, setVolume] = useState<number>(70);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isLiked, setIsLiked] = useState<boolean>(true);
  const [isShuffling, setIsShuffling] = useState<boolean>(false);
  const [isRepeating, setIsRepeating] = useState<boolean>(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  // Sample track data with love theme
  const currentTrack = {
    title: "Forever Yours",
    artist: "Love Symphony",
    album: "Endless Romance",
    coverImage: "/api/placeholder/400/400",
    audioSrc: "/scientist.mp3" // Add the audio source
  };

  // Winning combinations
  const winningCombos = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6] // diagonals
  ];

  // Check for winner
  const checkWinner = (squares: (string | null)[]) => {
    for (const combo of winningCombos) {
      const [a, b, c] = combo;
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return { winner: squares[a], combo };
      }
    }
    return null;
  };

  // Improved AI that makes 2 strategic mistakes to let player win
  const makeAIMove = (squares: (string | null)[]): number | null => {
    const emptySquares = squares.map((square, index) => square === null ? index : null).filter(val => val !== null) as number[];
    
    if (emptySquares.length === 0) return null;

    // AI makes intentional mistakes on moves 2 and 4 to ensure player wins
    const aiMoveNumber = Math.floor((9 - emptySquares.length + 1) / 2);
    
    // First mistake: Don't block obvious player wins
    if (aiMoveNumber === 2 || aiMoveNumber === 4) {
      // Check if player is about to win and DON'T block them
      for (const combo of winningCombos) {
        const [a, b, c] = combo;
        const values = [squares[a], squares[b], squares[c]];
        const xCount = values.filter(v => v === 'X').length;
        const emptyCount = values.filter(v => v === null).length;
        
        if (xCount === 2 && emptyCount === 1) {
          // Player can win - make a random move elsewhere
          const otherMoves = emptySquares.filter(i => ![a, b, c].includes(i));
          if (otherMoves.length > 0) {
            return otherMoves[Math.floor(Math.random() * otherMoves.length)];
          }
        }
      }
    }

    // Second mistake: Don't take obvious winning moves
    for (const combo of winningCombos) {
      const [a, b, c] = combo;
      const values = [squares[a], squares[b], squares[c]];
      const oCount = values.filter(v => v === 'O').length;
      const emptyCount = values.filter(v => v === null).length;
      
      if (oCount === 2 && emptyCount === 1) {
        // AI could win but chooses not to - make suboptimal move
        const suboptimalMoves = emptySquares.filter(i => ![a, b, c].includes(i));
        if (suboptimalMoves.length > 0) {
          return suboptimalMoves[Math.floor(Math.random() * suboptimalMoves.length)];
        }
      }
    }

    // Make strategic bad moves to help player
    const corners = [0, 2, 6, 8].filter(i => emptySquares.includes(i));
    const edges = [1, 3, 5, 7].filter(i => emptySquares.includes(i));
    const center = emptySquares.includes(4) ? [4] : [];
    
    // Prefer edges over corners/center (weaker strategy)
    if (edges.length > 0 && Math.random() < 0.7) {
      return edges[Math.floor(Math.random() * edges.length)];
    } else if (corners.length > 0) {
      return corners[Math.floor(Math.random() * corners.length)];
    } else if (center.length > 0) {
      return 4;
    }
    
    return emptySquares[Math.floor(Math.random() * emptySquares.length)];
  };

  // Handle player move
  const handleSquareClick = (index: number) => {
    if (board[index] || gameStatus !== 'playing' || !isPlayerTurn) return;

    const newBoard = [...board];
    newBoard[index] = 'X';
    setBoard(newBoard);
    setIsPlayerTurn(false);

    // Check if player won
    const result = checkWinner(newBoard);
    if (result && result.winner === 'X') {
      setGameStatus('won');
      setShowPlayer(true);
      // Start playing music after a short delay
      setTimeout(() => {
        const audio = audioRef.current;
        if (audio) {
          audio.play().then(() => {
            setIsPlaying(true);
          }).catch(console.error);
        }
      }, 800);
      return;
    }

    // Check for draw
    if (!newBoard.includes(null)) {
      setGameStatus('draw');
      return;
    }

    // AI move after a delay with smooth transition
    setTimeout(() => {
      const aiMove = makeAIMove(newBoard);
      if (aiMove !== null) {
        const aiBoard = [...newBoard];
        aiBoard[aiMove] = 'O';
        setBoard(aiBoard);

        // Check if AI won (very unlikely with our bad AI)
        const aiResult = checkWinner(aiBoard);
        if (aiResult && aiResult.winner === 'O') {
          setGameStatus('draw'); // Call it a draw to be nice
        } else if (!aiBoard.includes(null)) {
          setGameStatus('draw');
        }
      }
      setIsPlayerTurn(true);
    }, 800);
  };

  // Reset game
  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsPlayerTurn(true);
    setGameStatus('playing');
    setShowPlayer(false);
    setIsPlaying(false);
    setCurrentTime(0);
    // Reset audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  // Music player effects
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        // We'll keep our simulated duration for consistency
      }
    };
    const handleEnded = () => setIsPlaying(false);
    
    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);
    
    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(console.error);
    }
    setIsPlaying(!isPlaying);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    const progressBar = progressRef.current;
    if (!audio || !progressBar) return;
    
    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    audio.volume = newVolume / 100;
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (isMuted) {
      audio.volume = volume / 100;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = Math.min((currentTime / duration) * 100, 100);

  if (!showPlayer) {
    return (
      <div className="bg-gradient-to-br from-[#D86DB5] via-[#E081C7] to-[#D86DB5] text-white w-full max-w-md mx-auto rounded-3xl overflow-hidden shadow-2xl p-8 relative">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
        </div>
        
        <div className="relative z-10">
          <div className="text-center mb-8">
            <div className="mb-4">
              <Heart className="w-12 h-12 mx-auto text-white/90 animate-pulse" fill="currentColor" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3 drop-shadow-sm">Unlock Love Songs</h2>
            <p className="text-white/90 text-sm leading-relaxed">Win our game of hearts to play your romantic melody!</p>
            {gameStatus === 'won' && (
              <div className="mt-4 animate-bounce">
                <Heart className="w-8 h-8 mx-auto text-white mb-2" fill="currentColor" />
                <p className="text-white text-lg font-bold">You Won My Heart! 💕</p>
              </div>
            )}
            {gameStatus === 'draw' && (
              <p className="text-white/90 text-lg font-semibold mt-4">It is a tie! Try again? 💝</p>
            )}
          </div>

          {/* Tic Tac Toe Game */}
          <div className="grid grid-cols-3 gap-3 mb-8 max-w-52 mx-auto">
            {board.map((square, index) => (
              <button
                key={index}
                onClick={() => handleSquareClick(index)}
                className={`
                  w-16 h-16 bg-[#FFCEEF] hover:bg-white/90 rounded-2xl text-2xl font-bold
                  transition-all duration-300 ease-out transform hover:scale-105
                  border-2 border-white/20 shadow-lg backdrop-blur-sm
                  ${square === 'X' ? 'text-[#D86DB5] border-[#D86DB5] bg-white shadow-pink-200' : ''}
                  ${square === 'O' ? 'text-[#B45A96] border-[#B45A96] bg-white/95' : ''}
                  ${!square && gameStatus === 'playing' ? 'hover:border-white hover:shadow-white/20' : ''}
                  ${!isPlayerTurn && gameStatus === 'playing' ? 'opacity-70' : ''}
                `}
                disabled={square !== null || gameStatus !== 'playing' || !isPlayerTurn}
              >
                <span className="drop-shadow-sm">{square}</span>
              </button>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={resetGame}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-6 py-3 rounded-2xl transition-all duration-300 flex items-center gap-3 mx-auto border border-white/30 hover:border-white/50 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <RotateCcw size={18} />
              <span className="font-medium">New Game</span>
            </button>
            <p className="text-xs text-white/80 mt-4 font-medium">
              {gameStatus === 'playing' ? (
                isPlayerTurn ? 'Your move ♥' : 'AI is thinking...'
              ) : ''}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show music player after winning
  return (
    <div className="bg-gradient-to-br from-[#D86DB5] via-[#E081C7] to-[#D86DB5] text-white w-full max-w-md mx-auto rounded-3xl overflow-hidden shadow-2xl relative">
      {/* Subtle overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
      
      <div className="relative z-10">
        {/* Hidden audio element */}
        <audio 
          ref={audioRef} 
          src={currentTrack.audioSrc}
          preload="metadata"
          playsInline
        />
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 pb-4">
          <button 
            onClick={resetGame} 
            className="text-white/80 hover:text-white transition-all duration-300 transform hover:scale-110 p-2 rounded-xl hover:bg-white/10"
          >
            <RotateCcw size={20} />
          </button>
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-white" fill="currentColor" />
            <h1 className="text-white font-bold">Victory Serenade</h1>
          </div>
          <button className="text-white/80 hover:text-white transition-all duration-300 transform hover:scale-110 p-2 rounded-xl hover:bg-white/10">
            <MoreHorizontal size={24} />
          </button>
        </div>

        {/* Large Album Cover */}
        <div className="px-6 py-4">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-[#FFCEEF] to-white shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-[#D86DB5]/20 to-[#B45A96]/30 flex items-center justify-center">
              <div className="text-center">
                <Heart className="w-24 h-24 text-[#D86DB5] mx-auto mb-4 animate-pulse" fill="currentColor" />
                <div className="space-y-2">
                  <div className="w-16 h-2 bg-[#D86DB5]/30 rounded-full mx-auto"></div>
                  <div className="w-12 h-2 bg-[#D86DB5]/20 rounded-full mx-auto"></div>
                  <div className="w-20 h-2 bg-[#D86DB5]/25 rounded-full mx-auto"></div>
                </div>
              </div>
            </div>
            {/* Floating hearts animation */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(6)].map((_, i: number) => (
                <Heart 
                  key={i}
                  className={`absolute w-4 h-4 text-[#D86DB5]/40 animate-float-${i + 1}`} 
                  fill="currentColor"
                  style={{
                    left: `${20 + i * 12}%`,
                    animationDelay: `${i * 0.8}s`,
                    animationDuration: `${3 + i * 0.5}s`
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Song Info */}
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-white text-xl font-bold drop-shadow-sm">{currentTrack.title}</h2>
              <p className="text-white/80 text-sm">{currentTrack.artist}</p>
            </div>
            <button className="text-white/80 hover:text-white transition-all duration-300 transform hover:scale-110 p-2 rounded-xl hover:bg-white/10">
              <Plus size={24} />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-3">
          <div className="flex items-center justify-between text-xs text-white/80 mb-3">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          <div 
            ref={progressRef}
            onClick={handleProgressClick}
            className="w-full h-2 bg-white/20 rounded-full cursor-pointer group backdrop-blur-sm"
          >
            <div 
              className="h-full bg-white rounded-full relative transition-all duration-300 ease-out shadow-lg"
              style={{ width: `${progressPercentage}%` }}
            >
              <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg -mr-2"></div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="px-6 py-6">
          <div className="flex items-center justify-center gap-8">
            <button 
              onClick={() => setIsShuffling(!isShuffling)}
              className={`text-white/70 hover:text-white transition-all duration-300 transform hover:scale-110 p-2 rounded-xl hover:bg-white/10 ${isShuffling ? 'text-white bg-white/10' : ''}`}
            >
              <Shuffle size={20} />
            </button>
            
            <button className="text-white hover:text-white/80 transition-all duration-300 transform hover:scale-110 p-2 rounded-xl hover:bg-white/10">
              <SkipBack size={24} />
            </button>
            
            <button 
              onClick={togglePlay}
              className="bg-white text-[#D86DB5] rounded-full p-4 hover:scale-110 transition-all duration-300 shadow-2xl hover:shadow-white/20"
            >
              {isPlaying ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
            </button>
            
            <button className="text-white hover:text-white/80 transition-all duration-300 transform hover:scale-110 p-2 rounded-xl hover:bg-white/10">
              <SkipForward size={24} />
            </button>
            
            <button 
              onClick={() => setIsRepeating(!isRepeating)}
              className={`text-white/70 hover:text-white transition-all duration-300 transform hover:scale-110 p-2 rounded-xl hover:bg-white/10 ${isRepeating ? 'text-white bg-white/10' : ''}`}
            >
              <Repeat size={20} />
            </button>
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="px-6 py-6 border-t border-white/20 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setIsLiked(!isLiked)}
              className="text-white/80 hover:text-white transition-all duration-300 transform hover:scale-110 p-2 rounded-xl hover:bg-white/10"
            >
              <Heart 
                size={20} 
                className={isLiked ? 'fill-white text-white' : ''} 
              />
            </button>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={toggleMute}
                className="text-white/80 hover:text-white transition-all duration-300 transform hover:scale-110 p-2 rounded-xl hover:bg-white/10"
              >
                {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-24 h-2 bg-white/20 rounded-full appearance-none cursor-pointer slider backdrop-blur-sm"
                style={{
                  background: `linear-gradient(to right, white 0%, white ${isMuted ? 0 : volume}%, rgba(255,255,255,0.2) ${isMuted ? 0 : volume}%, rgba(255,255,255,0.2) 100%)`
                }}
              />
            </div>
            
            <button 
              onClick={resetGame} 
              className="text-white/80 hover:text-white transition-all duration-300 transform hover:scale-110 p-2 rounded-xl hover:bg-white/10"
            >
              <RotateCcw size={20} />
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float-1 { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-20px) rotate(180deg); } }
        @keyframes float-2 { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-15px) rotate(270deg); } }
        @keyframes float-3 { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-25px) rotate(90deg); } }
        @keyframes float-4 { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-18px) rotate(360deg); } }
        @keyframes float-5 { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-22px) rotate(180deg); } }
        @keyframes float-6 { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-16px) rotate(270deg); } }
        
        .animate-float-1 { animation: float-1 3s ease-in-out infinite; }
        .animate-float-2 { animation: float-2 3.5s ease-in-out infinite; }
        .animate-float-3 { animation: float-3 4s ease-in-out infinite; }
        .animate-float-4 { animation: float-4 3.8s ease-in-out infinite; }
        .animate-float-5 { animation: float-5 4.2s ease-in-out infinite; }
        .animate-float-6 { animation: float-6 3.3s ease-in-out infinite; }
        
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          opacity: 0;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
        
        .slider:hover::-webkit-slider-thumb {
          opacity: 1;
          transform: scale(1.2);
        }
        
        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: none;
          opacity: 0;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
        
        .slider:hover::-moz-range-thumb {
          opacity: 1;
          transform: scale(1.2);
        }
      `}</style>
    </div>
  );
};

export default SpotifyPlayer;