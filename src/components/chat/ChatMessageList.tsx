import { Bot, UserRound } from 'lucide-react'
import type { ChatMessage } from '../../types/chat'

interface ChatMessageListProps {
  messages: ChatMessage[]
}

export const ChatMessageList = ({ messages }: ChatMessageListProps) => {
  return (
    <div className="h-[22rem] overflow-y-auto border border-slate-200 bg-white p-4 shadow-sm">
      {messages.length === 0 && <p className="text-sm text-slate-500">Aun no hay mensajes. Escribe tu primer prompt.</p>}

      <div className="space-y-4">
        {messages.map((message) => (
          <article key={message.id} className="flex gap-3">
            <div className="mt-1 border border-slate-200 p-2 text-slate-700">
              {message.role === 'assistant' ? <Bot className="h-4 w-4" /> : <UserRound className="h-4 w-4" />}
            </div>

            <div className="flex-1 border border-slate-200 p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {message.role === 'assistant' ? 'IA' : 'Usuario'}
                </p>
                {message.tokens !== undefined && <p className="text-xs text-slate-500">{message.tokens} tokens</p>}
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-slate-800">{message.content}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
