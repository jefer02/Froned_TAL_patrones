import { CreditCard, X } from 'lucide-react'
import { useMemo, useState } from 'react'

interface UpgradeModalProps {
  isOpen: boolean
  isSubmitting: boolean
  onClose: () => void
  onConfirm: (payload: { cardholderName: string; cardNumberMasked: string }) => Promise<void>
}

export const UpgradeModal = ({ isOpen, isSubmitting, onClose, onConfirm }: UpgradeModalProps) => {
  const [cardholderName, setCardholderName] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [error, setError] = useState<string | null>(null)

  const canSubmit = useMemo(() => cardholderName.trim().length >= 3 && cardNumber.length >= 16, [cardholderName, cardNumber])

  if (!isOpen) {
    return null
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!canSubmit) {
      setError('Completa datos validos para simular el pago.')
      return
    }

    setError(null)
    const masked = `**** **** **** ${cardNumber.slice(-4)}`
    await onConfirm({ cardholderName: cardholderName.trim(), cardNumberMasked: masked })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 px-4">
      <div className="w-full max-w-md border border-slate-300 bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Cuota mensual agotada</h3>
            <p className="mt-1 text-sm text-slate-600">Haz upgrade para seguir enviando prompts.</p>
          </div>
          <button className="border border-slate-300 p-2 text-slate-700" onClick={onClose} type="button">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <label className="block text-sm font-medium text-slate-700">
            Titular
            <input
              value={cardholderName}
              onChange={(event) => setCardholderName(event.target.value)}
              maxLength={80}
              className="mt-1 w-full border border-slate-300 p-2 text-sm outline-none focus:border-brand-500"
              placeholder="Nombre completo"
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Tarjeta (simulacion)
            <div className="mt-1 flex items-center border border-slate-300 px-3 py-2 focus-within:border-brand-500">
              <CreditCard className="h-4 w-4 text-slate-500" />
              <input
                value={cardNumber}
                onChange={(event) => setCardNumber(event.target.value.replace(/\D/g, '').slice(0, 16))}
                className="ml-2 w-full border-none p-0 text-sm outline-none"
                placeholder="0000000000000000"
              />
            </div>
          </label>

          {error && <p className="text-xs text-red-700">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting || !canSubmit}
            className="w-full border border-brand-600 bg-brand-600 px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:border-slate-400 disabled:bg-slate-400"
          >
            {isSubmitting ? 'Procesando pago...' : 'Simular pago y activar PRO'}
          </button>
        </form>
      </div>
    </div>
  )
}
