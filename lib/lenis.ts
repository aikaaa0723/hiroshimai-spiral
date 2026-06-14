import type Lenis from 'lenis';

let instance: Lenis | null = null;

export const setLenis = (l: Lenis | null) => {
  instance = l;
};
export const getLenis = () => instance;

/** Smoothly travel to a parametric position (0..1) of the whole gallery. */
export const scrollToProgress = (progress: number) => {
  if (!instance) return;
  instance.scrollTo(progress * instance.limit, { duration: 2.2 });
};
