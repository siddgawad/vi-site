import React, { useMemo, useState } from "react";
import { Heart, Send, Sparkles } from "lucide-react";

type FeedbackFormProps = {
  onSubmit?: (payload: FeedbackPayload) => void;
};

type FeedbackPayload = {
  days: number;
  rating: number;
  tags: string[];
  comments: string;
  createdAt: string; // ISO
};

const TAG_OPTIONS = ["communication", "time together", "surprises", "support", "affection", "trust"] as const;
type Tag = (typeof TAG_OPTIONS)[number];
const MAX_CHARS = 500;
const START = new Date("2022-09-10T00:00:00-05:00");

const FeedbackForm: React.FC<FeedbackFormProps> = ({ onSubmit }) => {
  const [rating, setRating] = useState<number>(4);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [comments, setComments] = useState<string>("");
  const [submitted, setSubmitted] = useState<boolean>(false);

  // Always compute from the fixed start date
  const days = useMemo(() => {
    const now = Date.now();
    const diffDays = Math.floor((now - START.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }, []);

  const handleTagToggle = (t: Tag) =>
    setSelectedTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (submitted) return;

    const payload: FeedbackPayload = {
      days,
      rating,
      tags: selectedTags,
      comments: comments.trim(),
      createdAt: new Date().toISOString(),
    };
    onSubmit?.(payload);
    setSubmitted(true);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative isolate rounded-3xl border border-white/20 bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-xl p-4 sm:p-6 md:p-8 lg:p-10 shadow-[0_10px_30px_rgba(216,109,181,0.35)]"
      style={{ touchAction: "pan-y" }}
    >
      <div className="pointer-events-none absolute -inset-px rounded-3xl bg-[conic-gradient(from_180deg_at_50%_50%,rgba(255,255,255,0.3),rgba(216,109,181,0.45),rgba(255,255,255,0.25))] opacity-40 blur-[2px]" />

      <div className="relative z-10 mb-4 sm:mb-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/25 text-white text-xs sm:text-sm">
          <Sparkles className="w-4 h-4" />
          <span>Let your heart speak</span>
        </div>

        <p className="mt-3 text-white text-lg sm:text-xl font-black drop-shadow">feedback form</p>
        <p className="mt-1 text-white/90 text-sm sm:text-base">
          have u enjoyed your <span className="font-semibold text-white">{days}</span> days of relationship?
        </p>
        <p className="text-white/80 text-xs sm:text-sm">
          if u have any feedback u would like to give for ur man to improve himself — write comments below.
          thank u for being a part of this journey. much love to u 💗
        </p>
      </div>

      {/* Rating */}
      <div>
        <label className="block text-white/90 text-sm mb-2 text-center">rate today with hearts</label>
        <div className="flex gap-2 justify-center">
          {[1, 2, 3, 4, 5].map((n) => {
            const active = n <= rating;
            return (
              <button
                key={n}
                type="button"
                aria-label={`Set rating ${n}`}
                onClick={() => setRating(n)}
                className={[
                  "rounded-2xl p-2 transition will-change-transform",
                  active ? "scale-110" : "opacity-70 hover:opacity-100 hover:scale-105",
                ].join(" ")}
              >
                <Heart className="w-8 h-8 sm:w-9 sm:h-9" stroke="none" fill={active ? "#ffffff" : "none"} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Tags */}
      <div className="mt-6">
        <label className="block text-white/90 text-sm mb-2">what should we keep doing?</label>
        <div className="flex flex-wrap gap-2">
          {TAG_OPTIONS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => handleTagToggle(t)}
              aria-pressed={selectedTags.includes(t)}
              className={[
                "px-3 py-1.5 rounded-full text-sm border",
                selectedTags.includes(t)
                  ? "bg-white text-pink-600 border-white"
                  : "bg-white/10 text-white/90 border-white/20 hover:bg-white/15",
              ].join(" ")}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Comments */}
      <div className="mt-6">
        <label htmlFor="comments" className="block text-white/90 text-sm mb-2">any special notes</label>
        <textarea
          id="comments"
          value={comments}
          onChange={(e) => {
            if (e.target.value.length <= MAX_CHARS) setComments(e.target.value);
          }}
          placeholder="type your thoughts here..."
          className="w-full rounded-xl bg-white/8 border border-white/20 text-white px-3 py-2 outline-none min-h-[120px] resize-y"
        />
        <div className="text-right text-white/70 text-xs mt-1">
          {comments.length} / {MAX_CHARS}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex items-center justify-end gap-3">
        <button
          type="submit"
          disabled={submitted}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-pink-600 font-semibold hover:brightness-95 active:scale-[0.99] disabled:opacity-60"
        >
          <Send className="w-4 h-4" />
          <span>{submitted ? "sent" : "send feedback"}</span>
        </button>
      </div>
    </form>
  );
};

export default FeedbackForm;
