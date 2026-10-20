export const isReview = new URLSearchParams(window.location.search).get('review') === '1' || ['1','true'].includes(import.meta.env.VITE_REVIEW)
