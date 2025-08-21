
import React, { useEffect, useMemo, useState } from "react";
import { Heart, Send, Sparkles } from "lucide-react";

type FeedbackFormProps = {
  /** Prefer this if you already have a running TIMER (total seconds). */
  timerSeconds?: number;
  /** Optional fallback if no timer: we'll compute days from this start date. */
  startedAt?: Date | string | number;
  /** Optional callback to receive the payload. */
  onSubmit?: (payload: FeedbackPayload) => void;
};

type FeedbackPayload = {
  days: number;
  rating: number;
  tags: string[];
  comments: string;
  anonymous: boolean;
  createdAt: string; // ISO
};

const TAG_OPTIONS = [
  "communication",
  "time together",
  "surprises",
  "support",
  "affection",
  "trust",
] as const;

const MAX_CHARS = 500;

const FeedbackForm: React.FC<FeedbackFormProps> = ({ timerSeconds, startedAt, onSubmit }) => {
  const [rating, setRating] = useState<number>(4);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comments, setComments] = useState<string>("");
  const [anonymous, setAnonymous] = useState<boolean>(false);
  const [userStartDate, setUserStartDate] = useState<string>("");
  const [submitted, setSubmitted] = useState<boolean>(false);

  // Try to resolve "days together"
  const days = useMemo(() => {
    if (typeof timerSeconds === "number" && Number.isFinite(timerSeconds) && timerSeconds >= 0) {
      return Math.max(0, Math.floor(timerSeconds / 86400));
    }
    const lsKey = "relationshipStart";
    let start: number | null = null;

    if (startedAt !== undefined) {
      start = new Date(startedAt).getTime();
    } else {
      const stored = typeof window !== "undefined" ? window.localStorage.getItem(lsKey) : null;
      if (stored) start = new Date(stored).getTime();
    }

    if (!start || Number.isNaN(start)) return 0;

    const now = Date.now();
    const diffDays = Math.floor((now - start) / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }, [timerSeconds, startedAt]);

  // If we don't have a timer or startDate, allow setting locally
  useEffect(() => {
    if (typeof timerSeconds === "number") return; // timer takes precedence
    if (startedAt !== undefined) return;         // explicit prop provided
    // pull a stored date if present, else leave as empty
    const stored = typeof window !== "undefined" ? window.localStorage.getItem("relationshipStart") : null;
    if (stored) setUserStartDate(stored.slice(0, 10));
  }, [timerSeconds, startedAt]);

  const handlePickStartDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value; // yyyy-mm-dd
    setUserStartDate(val);
    try {
      if (val && typeof window !== "undefined") {
        window.localStorage.setItem("relationshipStart", val);
      }
    } catch {
      // ignore storage errors
    }
  };

  const toggleTag = (t: string) => {
    setSelectedTags((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: FeedbackPayload = {
      days,
      rating,
      tags: selectedTags,
      comments: comments.trim(),
      anonymous,
      createdAt: new Date().toISOString(),
    };

    // Store locally (you can replace with a real API call)
    try {
      const key = "loveFeedback";
      const existing = typeof window !== "undefined" ? window.localStorage.getItem(key) : null;
      const list: FeedbackPayload[] = existing ? JSON.parse(existing) as FeedbackPayload[] : [];
      list.push(payload);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(list));
      }
    } catch {
      // ignore storage errors
    }

    if (onSubmit) onSubmit(payload);
    setSubmitted(true);
    // Reset form (keep rating)
    setSelectedTags([]);
    setComments("");
    setAnonymous(false);

    // Clear confetti after a moment
    setTimeout(() => setSubmitted(false), 1800);
  };

  const charCount = comments.length;
  const remaining = MAX_CHARS - charCount;

  return (
    <div
      className="
        relative mt-6 sm:mt-8
        rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8
        bg-gradient-to-br from-white/15 to-white/5
        border border-white/20 backdrop-blur-xl
        shadow-[0_10px_30px_rgba(216,109,181,0.35)]
      "
      style={{ touchAction: "pan-y" }}
    >
      {/* Animated gradient ring */}
      <div className="pointer-events-none absolute -inset-px rounded-2xl sm:rounded-3xl bg-[linear-gradient(135deg,rgba(255,255,255,0.35),rgba(216,109,181,0.45),rgba(255,255,255,0.25))] opacity-40 blur-[2px]" />

      {/* Heading blurb */}
      <div className="relative z-10 mb-4 sm:mb-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/25 text-white text-xs sm:text-sm">
          <Sparkles className="w-4 h-4" />
          <span>Let your heart speak</span>
        </div>

        <p className="mt-4 text-white/90 text-sm sm:text-base">
          have u enjoyed your <span className="font-semibold text-white">{days}</span> days of relationship?
        </p>
        <p className="text-white/80 text-xs sm:text-sm">
          if u have any feedback u would like to give for ur man to improve himself — write comments below.
          thank u for being a part of this journey. much love to u 💗
        </p>

        {/* Optional start-date picker (only shows if no timerSeconds & no startedAt) */}
        {typeof timerSeconds !== "number" && startedAt === undefined && (
          <div className="mt-4 inline-flex items-center gap-3 bg-white/10 border border-white/20 rounded-xl px-3 py-2">
            <label htmlFor="start-date" className="text-white/80 text-xs sm:text-sm">
              set start date:
            </label>
            <input
              id="start-date"
              type="date"
              value={userStartDate}
              onChange={handlePickStartDate}
              className="text-sm rounded-lg bg-white/80 text-[#B0458E] px-2 py-1 focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
        {/* Rating */}
        <div>
          <label className="block text-white/90 text-sm mb-2">rate today with hearts</label>
          <div className="flex gap-2">
            {([1, 2, 3, 4, 5] as const).map((n) => {
              const active = n <= rating;
              return (
                <button
                  key={n}
                  type="button"
                  aria-label={`Set rating ${n}`}
                  onClick={() => setRating(n)}
                  className={[
                    "w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-transform",
                    active ? "bg-white text-[#D86DB5]" : "bg-white/15 text-white/90 border border-white/30",
                    "hover:scale-105 active:scale-95",
                  ].join(" ")}
                >
                  <Heart className={active ? "w-5 h-5 fill-[#D86DB5]" : "w-5 h-5"} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-white/90 text-sm mb-2">things we could nurture</label>
          <div className="flex flex-wrap gap-2">
            {TAG_OPTIONS.map((t) => {
              const active = selectedTags.includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleTag(t)}
                  className={[
                    "px-3 py-1.5 rounded-full text-xs sm:text-sm border transition-all",
                    active
                      ? "bg-white text-[#D86DB5] border-white shadow"
                      : "bg-white/10 text-white/90 border-white/30 hover:bg-white/15",
                  ].join(" ")}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>

        {/* Comments */}
        <div>
          <label htmlFor="comments" className="block text-white/90 text-sm mb-2">write your notes</label>
          <div className="relative">
            <textarea
              id="comments"
              maxLength={MAX_CHARS}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Write something sweet or helpful…"
              rows={5}
              className="
                w-full rounded-2xl p-4 pr-14
                bg-white/80 text-[#7A2C64] placeholder-[#7A2C64]/60
                border border-white shadow-inner
                focus:outline-none focus:ring-4 focus:ring-white/40
              "
            />
            <span className="absolute bottom-3 right-4 text-xs text-[#7A2C64]/70">
              {remaining}
            </span>
          </div>
        </div>

        {/* Options */}
        <div className="flex items-center justify-between gap-3">
          <label className="inline-flex items-center gap-2 text-white/90 text-sm">
            <input
              type="checkbox"
              checked={anonymous}
              onChange={(e) => setAnonymous(e.target.checked)}
              className="accent-white"
            />
            send anonymously
          </label>

          <button
            type="submit"
            className="
              inline-flex items-center gap-2 px-4 py-2 rounded-xl
              bg-white text-[#D86DB5] font-semibold
              shadow-[0_8px_20px_rgba(255,255,255,0.35)]
              hover:scale-[1.02] active:scale-95 transition
            "
          >
            <Send className="w-4 h-4" />
            send love
          </button>
        </div>
      </form>

      {/* Subtle “confetti hearts” on submit */}
      <div
        aria-hidden
        className={[
          "pointer-events-none absolute inset-0 overflow-hidden",
          submitted ? "opacity-100" : "opacity-0",
          "transition-opacity duration-200",
        ].join(" ")}
      >
        {submitted &&
          Array.from({ length: 14 }).map((_, i) => (
            <Heart
              key={i}
              className="absolute w-4 h-4 text-white/90 confetti-heart"
              style={{
                left: `${(i * 7) % 100}%`,
                animationDelay: `${i * 0.06}s`,
              }}
              fill="currentColor"
            />
          ))}
      </div>

      {/* Tiny CSS for confetti */}
      <style>{`
        .confetti-heart {
          animation: float-up 1.2s ease-in forwards;
          filter: drop-shadow(0 4px 8px rgba(0,0,0,0.15));
        }
        @keyframes float-up {
          0%   { transform: translateY(12px) scale(0.8) rotate(0deg); opacity: 0; }
          20%  { opacity: 1; }
          100% { transform: translateY(-60px) scale(1) rotate(180deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default FeedbackForm;
