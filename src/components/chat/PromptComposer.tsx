import { SendHorizontal } from 'lucide-react'

interface PromptComposerProps {
  prompt: string
  estimatedTokens: number
  isSending: boolean
  isBlocked: boolean
  blockReason: string | null
  onPromptChange: (value: string) => void
  onSubmit: () => Promise<void>
}

export const PromptComposer = ({
  prompt,
  estimatedTokens,
  isSending,
  isBlocked,
  blockReason,
  onPromptChange,
  onSubmit
}: PromptComposerProps) => {
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await onSubmit()
  }

  const promptLength = prompt.trim().length

  return (
    <form onSubmit={handleSubmit} className="space-y-3 border border-slate-200 bg-white p-4 shadow-sm">
      <label className="block text-sm font-medium text-slate-800" htmlFor="prompt-input">
        Prompt
      </label>

      <textarea
        id="prompt-input"
        value={prompt}
        onChange={(event) => onPromptChange(event.target.value)}
        maxLength={1500}
        rows={4}
        placeholder="Escribe tu prompt para el servicio IA"
        className="w-full resize-y border border-slate-300 p-3 text-sm text-slate-900 outline-none focus:border-brand-500"
      />

      <div className="flex flex-col gap-2 text-xs text-slate-600 md:flex-row md:items-center md:justify-between">
        <p>Estimador: {estimatedTokens} tokens aproximados</p>
        <p>{promptLength}/1500 caracteres</p>
      </div>

      {blockReason && <p className="text-xs text-red-700">{blockReason}</p>}

      <button
        type="submit"
        disabled={isSending || isBlocked || promptLength === 0}
        className="inline-flex items-center gap-2 border border-brand-600 bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:border-slate-400 disabled:bg-slate-400"
      >
        <SendHorizontal className="h-4 w-4" />
        {isSending ? 'Enviando...' : 'Enviar'}
      </button>
    </form>
  )
}
