import React, { useState } from 'react'
import { Link, Image, X } from 'lucide-react'

type FileUploaderProps = {
  value: string;
  onChange: (value: string) => void;
  accept?: string;
  label?: string;
}

export default function FileUploader({ value, onChange, accept = "image/*", label }: FileUploaderProps) {
  const [mode, setMode] = useState<'file' | 'url'>(value?.startsWith('http') ? 'url' : 'file')
  const [preview, setPreview] = useState<string>(value || '')

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onChange(reader.result)
        setPreview(reader.result)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleUrl = (url: string) => {
    onChange(url)
    setPreview(url)
  }

  const handleClear = () => {
    onChange('')
    setPreview('')
  }

  return (
    <div className="space-y-3">
      {/* Mode Toggle */}
      <div className="flex gap-2 text-sm">
        <button
          onClick={() => setMode('file')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition-colors ${
            mode === 'file'
              ? 'bg-krgold text-white'
              : 'text-gray-700 dark:text-gray-300 hover:bg-krgold/10'
          }`}
        >
          <Image size={16} />
          Choose File
        </button>
        <button
          onClick={() => setMode('url')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition-colors ${
            mode === 'url'
              ? 'bg-krgold text-white'
              : 'text-gray-700 dark:text-gray-300 hover:bg-krgold/10'
          }`}
        >
          <Link size={16} />
          Image URL
        </button>
      </div>

      {/* Input Area */}
      <div>
        {mode === 'file' ? (
          <div className="relative">
            <input
              type="file"
              accept={accept}
              onChange={handleFile}
              className="w-full text-sm text-gray-700 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-krgold/10 file:text-krgold hover:file:bg-krgold/20 cursor-pointer"
            />
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="url"
              value={value || ''}
              onChange={(e) => handleUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="flex-1 px-3 py-2 text-sm border border-krborder rounded-md bg-white/50 dark:bg-krblack/50 focus:border-krgold focus:ring-1 focus:ring-krgold"
            />
          </div>
        )}
      </div>

      {/* Preview */}
      {preview && (
        <div className="relative inline-block">
          <img 
            src={preview} 
            alt="Preview"
            className="max-w-full h-auto rounded-md border border-krborder"
            style={{ maxHeight: '200px' }}
          />
          <button
            onClick={handleClear}
            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            title="Remove image"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  )
}
