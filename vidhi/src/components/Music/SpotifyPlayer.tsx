"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Heart, Shuffle, Repeat, MoreHorizontal, Plus, RotateCcw
} from "lucide-react";

/* ---- Optional: minimal typings for global ScrollTrigger (if present) ---- */
type ScrollTriggerInstance = {
  vars: { trigger?: Element; pin?: Element | boolean };
  pin?: Element | boolean;
  disable: (reset?: boolean) => void;
};
interface ScrollTriggerStatic {
  getAll(): ScrollTriggerInstance[];
}
declare global {
  interface Window {
    ScrollTrigger?: ScrollTriggerStatic;
  }
}

const SpotifyPlayer: React.FC = () => {
  /* ---------------- Game state ---------------- */
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [gameStatus, setGameStatus] = useState<"playing" | "won" | "draw">("playing");
  const [showPlayer, setShowPlayer] = useState(false);

  /* ---------------- Audio state ---------------- */
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [isLiked, setIsLiked] = useState(true);
  const [isShuffling, setIsShuffling] = useState(false);
  const [isRepeating, setIsRepeating] = useState(false);
  const [autoplayFailed, setAutoplayFailed] = useState(false);

  const currentTrack = useMemo(
    () => ({
      title: "Forever Yours",
      artist: "Love Symphony",
      album: "Endless Romance",
      coverImage: "/api/placeholder/400/400",
      audioSrc: "/scientist.mp3",
    }),
    []
  );

  /* ---------------- Game logic ---------------- */
  const winningCombos: number[][] = useMemo(
    () => [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6],
    ],
    []
  );

  const checkWinner = (squares: (string | null)[]) => {
    for (const [a, b, c] of winningCombos) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return { winner: squares[a], combo: [a, b, c] as const };
      }
    }
    return null;
  };

  // intentionally suboptimal AI
  const makeAIMove = (squares: (string | null)[]): number | null => {
    const empty = squares.map((v, i) => (v === null ? i : null)).filter((n): n is number => n !== null);
    if (!empty.length) return null;

    const aiMoveNumber = Math.floor((9 - empty.length + 1) / 2);

    // Mistake 1: don't block obvious X wins on moves 2 & 4
    if (aiMoveNumber === 2 || aiMoveNumber === 4) {
      for (const [a, b, c] of winningCombos) {
        const vals = [squares[a], squares[b], squares[c]];
        if (vals.filter(v => v === "X").length === 2 && vals.includes(null)) {
          const other = empty.filter(i => ![a, b, c].includes(i));
          if (other.length) return other[Math.floor(Math.random() * other.length)];
        }
      }
    }

    // Mistake 2: skip winning O move
    for (const [a, b, c] of winningCombos) {
      const vals = [squares[a], squares[b], squares[c]];
      if (vals.filter(v => v === "O").length === 2 && vals.includes(null)) {
        const subopt = empty.filter(i => ![a, b, c].includes(i));
        if (subopt.length) return subopt[Math.floor(Math.random() * subopt.length)];
      }
    }

    const corners = [0, 2, 6, 8].filter(i => empty.includes(i));
    const edges = [1, 3, 5, 7].filter(i => empty.includes(i));
    if (edges.length && Math.random() < 0.7) return edges[Math.floor(Math.random() * edges.length)];
    if (corners.length) return corners[Math.floor(Math.random() * corners.length)];
    if (empty.includes(4)) return 4;
    return empty[Math.floor(Math.random() * empty.length)];
  };

  const handleSquareClick = (index: number) => {
    if (board[index] || gameStatus !== "playing" || !isPlayerTurn) return;

    const next = [...board];
    next[index] = "X";
    setBoard(next);
    setIsPlayerTurn(false);

    const res = checkWinner(next);
    if (res?.winner === "X") {
      setGameStatus("won");
      setShowPlayer(true);

      // Try autoplay (iOS may block until user gesture)
      setTimeout(() => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.play().then(() => {
          setIsPlaying(true);
          setAutoplayFailed(false);
        }).catch(() => {
          setAutoplayFailed(true);
          setIsPlaying(false);
        });
      }, 500);
      return;
    }

    if (!next.includes(null)) {
      setGameStatus("draw");
      return;
    }

    setTimeout(() => {
      const aiMove = makeAIMove(next);
      if (aiMove !== null) {
        const aiBoard = [...next];
        aiBoard[aiMove] = "O";
        setBoard(aiBoard);
        const aiRes = checkWinner(aiBoard);
        if (aiRes?.winner === "O") setGameStatus("draw");
        else if (!aiBoard.includes(null)) setGameStatus("draw");
      }
      setIsPlayerTurn(true);
    }, 500);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsPlayerTurn(true);
    setGameStatus("playing");
    setShowPlayer(false);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setAutoplayFailed(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  /* ---------------- Audio wire-up ---------------- */
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onMeta = () => {
      const d = Number.isFinite(audio.duration) ? audio.duration : 0;
      if (d > 0) setDuration(d);
    };
    const onTime = () => setCurrentTime(audio.currentTime || 0);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnd = () => setIsPlaying(false);

    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnd);

    if (audio.readyState >= 1) onMeta();

    return () => {
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnd);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().catch(() => setAutoplayFailed(true));
    } else {
      audio.pause();
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const bar = progressRef.current;
    const audio = audioRef.current;
    if (!bar || !audio || !duration) return;
    const rect = bar.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const t = (x / rect.width) * duration;
    audio.currentTime = Math.max(0, Math.min(duration, t));
    setCurrentTime(audio.currentTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const v = parseInt(e.target.value);
    setVolume(v);
    audio.volume = v / 100;
    setIsMuted(v === 0);
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

  const formatTime = (t: number) => {
    if (!Number.isFinite(t) || t < 0) return "0:00";
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const progressPct = duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0;

  /* ---------------- Scroll handoff shim (fix “stuck at X/O” on mobile) ---------------- */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Ensure this section never becomes its own scroll container.
    el.style.overflow = "visible";
    // Try to opt out of unwanted scroll snapping if present upstream.
    el.style.scrollSnapAlign = "none";

    let lastY = 0;

    const onTouchStart = (ev: TouchEvent) => {
      lastY = ev.touches[0]?.clientY ?? 0;
    };

    const onTouchMove = (ev: TouchEvent) => {
      const y = ev.touches[0]?.clientY ?? lastY;
      const dy = lastY - y; // + = swipe up (scroll down)
      lastY = y;

      // If this element has nothing to scroll (or is at top/bottom),
      // nudge the page so the user can move past the section.
      const atTop = el.scrollTop <= 0;
      const atBottom = Math.abs(el.scrollHeight - el.clientHeight - el.scrollTop) <= 1;

      if ((atTop && dy < 0) || (atBottom && dy > 0) || (el.scrollHeight <= el.clientHeight)) {
        // forward a tiny portion of the movement to the document scroller
        window.scrollBy({ top: dy, behavior: "auto" });
      }
    };

    // Passive listeners → do NOT block scrolling
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: true });

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
    };
  }, []);

  /* ---------------- Optional: disable GSAP pins overlapping this section on mobile ---------------- */
  useEffect(() => {
    const isMobile =
      (typeof window !== "undefined" && window.matchMedia && window.matchMedia("(max-width: 768px)").matches) ||
      (typeof window !== "undefined" && "ontouchstart" in window);
    if (!isMobile) return;

    const el = containerRef.current;
    if (!el || typeof window === "undefined" || !window.ScrollTrigger) return;

    try {
      const all = window.ScrollTrigger.getAll();
      all.forEach((t) => {
        const trigEl = t.vars.trigger;
        const pinEl = (typeof t.pin !== "undefined" ? t.pin : t.vars.pin);
        const overlaps =
          (trigEl && (el.contains(trigEl) || trigEl.contains(el))) ||
          (pinEl && typeof pinEl !== "boolean" && (el.contains(pinEl) || pinEl.contains(el)));
        if (overlaps || t.vars.pin) {
          t.disable(true);
        }
      });
    } catch {
      /* noop */
    }
  }, []);

  /* ---------------- UI ---------------- */
  if (!showPlayer) {
    return (
      <div
        id="love-game"
        ref={containerRef}
        className="bg-gradient-to-br from-[#D86DB5] via-[#E081C7] to-[#D86DB5] text-white w-full max-w-md mx-auto rounded-3xl relative p-8"
        style={{
          touchAction: "pan-y",
          WebkitOverflowScrolling: "touch",
          overscrollBehaviorY: "auto",
        }}
      >
        {/* decorative overlay: must not capture touches */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
        </div>

        <div className="relative z-10">
          <div className="text-center mb-8 select-none">
            <div className="mb-4">
              <Heart className="w-12 h-12 mx-auto text-white/90 animate-pulse" fill="currentColor" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3 drop-shadow-sm">Unlock Love Songs</h2>
            <p className="text-white/90 text-sm leading-relaxed">
              Win our game of hearts to play your romantic melody!
            </p>
            {gameStatus === "won" && (
              <div className="mt-4 animate-bounce pointer-events-none">
                <Heart className="w-8 h-8 mx-auto text-white mb-2" fill="currentColor" />
                <p className="text-white text-lg font-bold">You Won My Heart! 💕</p>
              </div>
            )}
            {gameStatus === "draw" && (
              <p className="text-white/90 text-lg font-semibold mt-4 pointer-events-none">
                It is a tie! Try again? 💝
              </p>
            )}
          </div>

          {/* Tic Tac Toe grid */}
          <div
            className="relative z-50 grid grid-cols-3 gap-3 mb-8 max-w-52 mx-auto"
            style={{ touchAction: "pan-y" }}
          >
            {board.map((square, index) => (
              <button
                key={index}
                onClick={() => handleSquareClick(index)}
                className={[
                  "w-16 h-16 bg-[#FFCEEF] rounded-2xl text-2xl font-bold",
                  "transition-all duration-300 ease-out transform",
                  "border-2 border-white/20 shadow-lg backdrop-blur-sm",
                  "cursor-pointer pointer-events-auto touch-manipulation select-none",
                  square === "X" ? "text-[#D86DB5] border-[#D86DB5] bg-white shadow-pink-200" : "",
                  square === "O" ? "text-[#B45A96] border-[#B45A96] bg-white/95" : "",
                  !square && gameStatus === "playing" ? "active:scale-95" : "",
                  !isPlayerTurn && gameStatus === "playing" ? "opacity-70" : "",
                ].join(" ")}
                disabled={square !== null || gameStatus !== "playing" || !isPlayerTurn}
              >
                <span className="drop-shadow-sm">{square}</span>
              </button>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={resetGame}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-6 py-3 rounded-2xl transition-all duration-300 flex items-center gap-3 mx-auto border border-white/30 hover:border-white/50 shadow-lg hover:shadow-xl transform active:scale-95"
            >
              <RotateCcw size={18} />
              <span className="font-medium">New Game</span>
            </button>
            <p className="text-xs text-white/80 mt-4 font-medium">
              {gameStatus === "playing" ? (isPlayerTurn ? "Your move ♥" : "AI is thinking...") : ""}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Player after win
  return (
    <div
      id="love-game"
      ref={containerRef}
      className="bg-gradient-to-br from-[#D86DB5] via-[#E081C7] to-[#D86DB5] text-white w-full max-w-md mx-auto rounded-3xl relative"
      style={{
        touchAction: "pan-y",
        WebkitOverflowScrolling: "touch",
        overscrollBehaviorY: "auto",
      }}
    >
      {/* decorative overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />

      <div className="relative z-10">
        {/* Hidden audio element */}
        <audio
          ref={audioRef}
          src={currentTrack.audioSrc}
          preload="metadata"
          playsInline
          crossOrigin="anonymous"
          onError={(e: React.SyntheticEvent<HTMLAudioElement, Event>) => {
       
            console.warn("Audio error:", e.currentTarget.error);
          }}
        />

        {/* Header */}
        <div className="flex justify-between items-center p-6 pb-4">
          <button
            onClick={resetGame}
            className="text-white/80 hover:text-white transition-all duration-300 transform active:scale-95 p-2 rounded-xl hover:bg-white/10"
          >
            <RotateCcw size={20} />
          </button>
          <div className="flex items-center gap-2 pointer-events-none">
            <Heart className="w-5 h-5 text-white" fill="currentColor" />
            <h1 className="text-white font-bold">Victory Serenade</h1>
          </div>
          <button className="text-white/80 hover:text-white transition-all duration-300 transform active:scale-95 p-2 rounded-xl hover:bg-white/10">
            <MoreHorizontal size={24} />
          </button>
        </div>

        {/* Cover art */}
        <div className="px-6 py-4">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-[#FFCEEF] to-white shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-[#D86DB5]/20 to-[#B45A96]/30 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <Heart className="w-24 h-24 text-[#D86DB5] mx-auto mb-4 animate-pulse" fill="currentColor" />
                <div className="space-y-2">
                  <div className="w-16 h-2 bg-[#D86DB5]/30 rounded-full mx-auto" />
                  <div className="w-12 h-2 bg-[#D86DB5]/20 rounded-full mx-auto" />
                  <div className="w-20 h-2 bg-[#D86DB5]/25 rounded-full mx-auto" />
                </div>
              </div>
            </div>

            {/* Floating hearts (decorative) */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {Array.from({ length: 6 }).map((_, i) => (
                <Heart
                  key={i}
                  className={`absolute w-4 h-4 text-[#D86DB5]/40 animate-float-${i + 1}`}
                  fill="currentColor"
                  style={{
                    left: `${20 + i * 12}%`,
                    animationDelay: `${i * 0.8}s`,
                    animationDuration: `${3 + i * 0.5}s`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Song info */}
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex-1 pointer-events-none">
              <h2 className="text-white text-xl font-bold drop-shadow-sm">{currentTrack.title}</h2>
              <p className="text-white/80 text-sm">{currentTrack.artist}</p>
            </div>
            <button className="text-white/80 hover:text-white transition-all duration-300 transform active:scale-95 p-2 rounded-xl hover:bg-white/10">
              <Plus size={24} />
            </button>
          </div>
        </div>

        {/* Progress */}
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
              style={{ width: `${progressPct}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg -mr-2" />
            </div>
          </div>
          {autoplayFailed && (
            <p className="mt-2 text-[11px] text-white/80">Autoplay was blocked. Tap Play below.</p>
          )}
        </div>

        {/* Controls */}
        <div className="px-6 py-6">
          <div className="flex items-center justify-center gap-8">
            <button
              onClick={() => setIsShuffling(!isShuffling)}
              className={`text-white/70 hover:text-white transition-all duration-300 transform active:scale-95 p-2 rounded-xl hover:bg-white/10 ${isShuffling ? "text-white bg-white/10" : ""}`}
            >
              <Shuffle size={20} />
            </button>

            <button className="text-white hover:text-white/80 transition-all duration-300 transform active:scale-95 p-2 rounded-xl hover:bg-white/10">
              <SkipBack size={24} />
            </button>

            <button
              onClick={togglePlay}
              className="bg-white text-[#D86DB5] rounded-full p-4 active:scale-95 transition-all duration-300 shadow-2xl hover:shadow-white/20"
            >
              {isPlaying ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
            </button>

            <button className="text-white hover:text-white/80 transition-all duration-300 transform active:scale-95 p-2 rounded-xl hover:bg-white/10">
              <SkipForward size={24} />
            </button>

            <button
              onClick={() => setIsRepeating(!isRepeating)}
              className={`text-white/70 hover:text-white transition-all duration-300 transform active:scale-95 p-2 rounded-xl hover:bg-white/10 ${isRepeating ? "text-white bg-white/10" : ""}`}
            >
              <Repeat size={20} />
            </button>
          </div>
        </div>

        {/* Bottom controls */}
        <div className="px-6 py-6 border-t border-white/20 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsLiked(!isLiked)}
              className="text-white/80 hover:text-white transition-all duration-300 transform active:scale-95 p-2 rounded-xl hover:bg-white/10"
            >
              <Heart size={20} className={isLiked ? "fill-white text-white" : ""} />
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={toggleMute}
                className="text-white/80 hover:text-white transition-all duration-300 transform active:scale-95 p-2 rounded-xl hover:bg-white/10"
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
                  background: `linear-gradient(to right, white 0%, white ${isMuted ? 0 : volume}%, rgba(255,255,255,0.2) ${isMuted ? 0 : volume}%, rgba(255,255,255,0.2) 100%)`,
                }}
              />
            </div>

            <button
              onClick={resetGame}
              className="text-white/80 hover:text-white transition-all duration-300 transform active:scale-95 p-2 rounded-xl hover:bg-white/10"
            >
              <RotateCcw size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Animations + slider thumb */}
      <style jsx>{`
        @keyframes float-1 { 0%,100% { transform: translateY(0) rotate(0); } 50% { transform: translateY(-20px) rotate(180deg); } }
        @keyframes float-2 { 0%,100% { transform: translateY(0) rotate(0); } 50% { transform: translateY(-15px) rotate(270deg); } }
        @keyframes float-3 { 0%,100% { transform: translateY(0) rotate(0); } 50% { transform: translateY(-25px) rotate(90deg); } }
        @keyframes float-4 { 0%,100% { transform: translateY(0) rotate(0); } 50% { transform: translateY(-18px) rotate(360deg); } }
        @keyframes float-5 { 0%,100% { transform: translateY(0) rotate(0); } 50% { transform: translateY(-22px) rotate(180deg); } }
        @keyframes float-6 { 0%,100% { transform: translateY(0) rotate(0); } 50% { transform: translateY(-16px) rotate(270deg); } }

        .animate-float-1 { animation: float-1 3s ease-in-out infinite; }
        .animate-float-2 { animation: float-2 3.5s ease-in-out infinite; }
        .animate-float-3 { animation: float-3 4s ease-in-out infinite; }
        .animate-float-4 { animation: float-4 3.8s ease-in-out infinite; }
        .animate-float-5 { animation: float-5 4.2s ease-in-out infinite; }
        .animate-float-6 { animation: float-6 3.3s ease-in-out infinite; }

        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px; height: 16px; border-radius: 50%;
          background: white; cursor: pointer; border: none;
          opacity: 0; transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
        .slider:hover::-webkit-slider-thumb { opacity: 1; transform: scale(1.2); }
        .slider::-moz-range-thumb {
          width: 16px; height: 16px; border-radius: 50%;
          background: white; cursor: pointer; border: none;
          opacity: 0; transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
        .slider:hover::-moz-range-thumb { opacity: 1; transform: scale(1.2); }
      `}</style>
    </div>
  );
};

export default SpotifyPlayer;
