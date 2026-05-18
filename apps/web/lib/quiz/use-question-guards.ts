import { useRef, useEffect } from 'react'

/**
 * Guards against double-tap bugs in quiz/exam screens.
 *
 * tryAnswer()   — acquires answer lock. Returns false if already answered.
 *                 Call in handleSelect and timer timeout.
 *
 * tryNavigate() — acquires navigation lock + resets answer lock for next question.
 *                 Returns false if navigation already in progress.
 *                 Call in handleNext.
 *
 * Navigation lock auto-releases when index changes (next question rendered).
 */
export function useQuestionGuards(index: number) {
  const hasAnswered = useRef(false)
  const isNavigating = useRef(false)

  useEffect(() => {
    isNavigating.current = false
  }, [index])

  function tryAnswer(): boolean {
    if (hasAnswered.current) return false
    hasAnswered.current = true
    return true
  }

  function tryNavigate(): boolean {
    if (isNavigating.current) return false
    isNavigating.current = true
    hasAnswered.current = false
    return true
  }

  return { tryAnswer, tryNavigate }
}
