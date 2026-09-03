import { useEffect, useState } from 'react'

/**
 * Returns `value` after it has stopped changing for `delay` ms.
 *
 * Search filters 450 listings per keystroke; debouncing the *filtering* input
 * (while the TextInput itself stays uncontrolled-fast) keeps typing at 60fps.
 */
export function useDebouncedValue<T>(value: T, delay = 250): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}
