export const estimatePromptTokens = (prompt: string): number => {
  const trimmed = prompt.trim()
  if (!trimmed) {
    return 0
  }

  const words = trimmed.split(/\s+/).length
  const chars = trimmed.length

  // Approximation: hybrid between char and word count.
  return Math.max(1, Math.ceil(words * 1.2 + chars / 5))
}
