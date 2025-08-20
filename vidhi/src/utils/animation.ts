export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export function splitWords(el: HTMLElement) {
  const words = el.textContent?.split(' ').filter(Boolean) ?? [];
  el.innerHTML = words.map(w => `<span class="reveal" style="display:inline-block">${w}&nbsp;</span>`).join('');
  const spans = Array.from(el.querySelectorAll('span.reveal'));
  spans.forEach((s, i) => (s as HTMLElement).style.transitionDelay = `${i * 60}ms`);
  requestAnimationFrame(() => el.classList.add('ready'));
  setTimeout(() => spans.forEach(s => s.classList.add('in')), 50);
  (el as HTMLElement).classList.remove('opacity-0');
}