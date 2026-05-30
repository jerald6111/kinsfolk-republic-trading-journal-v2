import React, { createContext, useContext, useCallback, useState } from 'react'
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info'
type ToastItem = { id: number; message: string; type: ToastType }

type ToastContextType = { toast: (message: string, type?: ToastType) => void }

const ToastContext = createContext<ToastContextType | null>(null)

let counter = 0

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])

  const remove = useCallback((id: number) => {
    setItems((xs) => xs.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback((message: string, type: ToastType = 'success') => {
    const id = ++counter
    setItems((xs) => [...xs, { id, message, type }])
    setTimeout(() => remove(id), 3200)
  }, [remove])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 w-[min(90vw,22rem)]">
        {items.map((t) => {
          const icon = t.type === 'success' ? <CheckCircle2 size={18} className="text-krsuccess" />
            : t.type === 'error' ? <AlertTriangle size={18} className="text-krdanger" />
            : <Info size={18} className="text-krgold" />
          return (
            <div key={t.id} className="animate-fade-in flex items-start gap-3 rounded-lg border border-krborder bg-krcard shadow-card px-4 py-3">
              <span className="mt-0.5 shrink-0">{icon}</span>
              <p className="flex-1 text-sm text-krtext">{t.message}</p>
              <button onClick={() => remove(t.id)} className="text-krmuted hover:text-krwhite shrink-0" aria-label="Dismiss">
                <X size={15} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) return { toast: () => {} } // no-op if used outside provider
  return ctx
}
