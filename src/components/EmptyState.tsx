import React from 'react'
import { loadSampleData } from '../utils/storage'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  showSampleButton?: boolean
}

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  showSampleButton,
}: EmptyStateProps) {
  const handleLoadSample = () => {
    loadSampleData()
    window.location.reload()
  }

  return (
    <div className="rounded-xl border border-dashed border-krborder bg-krcard/50 p-10 text-center">
      {icon && (
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-krborder bg-krpanel text-krgold shadow-soft">
          {icon}
        </div>
      )}

      <h3 className="text-lg font-bold text-krwhite">{title}</h3>

      {description && (
        <p className="mx-auto mt-2 max-w-sm text-sm text-krmuted">{description}</p>
      )}

      {(actionLabel && onAction) || showSampleButton ? (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {actionLabel && onAction && (
            <button
              onClick={onAction}
              className="shine rounded-lg bg-krgold px-5 py-2.5 text-sm font-semibold text-krblack shadow-soft transition-colors hover:bg-kryellow"
            >
              {actionLabel}
            </button>
          )}

          {showSampleButton && (
            <button
              onClick={handleLoadSample}
              className="rounded-lg border border-krborder bg-transparent px-5 py-2.5 text-sm font-semibold text-krtext transition-colors hover:border-krgold/50 hover:text-krgold"
            >
              Load sample data
            </button>
          )}
        </div>
      ) : null}
    </div>
  )
}
