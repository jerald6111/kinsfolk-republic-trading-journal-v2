import React, { useState } from 'react'
import FileUploader from '../components/FileUploader'
import { loadData, saveData, triggerAutoEmailBackup } from '../utils/storage'
import { marked } from 'marked'
import Modal from '../components/Modal'
import { Trash2, Edit2, Eye, X, ChevronDown, ChevronUp } from 'lucide-react'

interface Strategy {
  id: number
  title: string
  desc: string
  images: string[] // Now supports multiple images
}

export default function Playbook(){
  const data = loadData()
  
  // Migrate old playbook data format (img -> images array)
  const migratedPlaybook = (data.playbook || []).map((item: any) => {
    if (item.img && !item.images) {
      // Old format: convert single img to images array
      return { ...item, images: [item.img] }
    }
    if (!item.images) {
      // No images at all
      return { ...item, images: [] }
    }
    return item
  })
  
  const [items, setItems] = useState<Strategy[]>(migratedPlaybook)
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [images, setImages] = useState<string[]>(['', '', '', ''])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [viewStrategy, setViewStrategy] = useState<Strategy | null>(null)
  const [isInfoExpanded, setIsInfoExpanded] = useState(false)

  const add = () => {
    const filteredImages = images.filter(img => img.trim() !== '')
    
    if (editingId) {
      // Update existing strategy
      const next = items.map(it => 
        it.id === editingId ? { id: editingId, title, desc, images: filteredImages } : it
      )
      setItems(next)
      saveData({ playbook: next })
      triggerAutoEmailBackup('update')
      setEditingId(null)
    } else {
      // Add new strategy
      const it = { id: Date.now(), title, desc, images: filteredImages }
      const next = [it, ...items]
      setItems(next)
      saveData({ playbook: next })
      triggerAutoEmailBackup('add')
    }
    
    setTitle('')
    setDesc('')
    setImages(['', '', '', ''])
  }

  const editStrategy = (strategy: Strategy) => {
    setTitle(strategy.title)
    setDesc(strategy.desc)
    const imgs = [...strategy.images]
    while (imgs.length < 4) imgs.push('')
    setImages(imgs.slice(0, 4))
    setEditingId(strategy.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const deleteStrategy = (id: number) => {
    if (!confirm('Are you sure you want to delete this strategy?')) return
    const next = items.filter(it => it.id !== id)
    setItems(next)
    saveData({ playbook: next })
    triggerAutoEmailBackup('delete')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setTitle('')
    setDesc('')
    setImages(['', '', '', ''])
  }

  // Safe markdown rendering
  const renderMarkdown = (text: string) => {
    try {
      return marked(text || '')
    } catch (error) {
      console.error('Markdown rendering error:', error)
      return text || ''
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-krblack to-gray-950 text-krtext relative overflow-hidden">
      {/* Animated gradient accents */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-krgold/10 via-transparent to-transparent pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-kryellow/5 via-transparent to-transparent pointer-events-none"></div>
      
      <div className="relative z-10 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
      {/* Header with Introduction */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">📖</span>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-krgold to-kryellow bg-clip-text text-transparent">Trading Playbook</h1>
            <p className="text-krmuted text-sm mt-1">Your personal collection of proven trading strategies</p>
          </div>
        </div>

        {/* Introduction Card - Collapsible */}
        <div className="bg-gradient-to-br from-krgold/10 via-krgold/5 to-transparent backdrop-blur-sm rounded-2xl border border-krgold/30 mb-6 overflow-hidden">
          <button
            onClick={() => setIsInfoExpanded(!isInfoExpanded)}
            className="w-full p-6 flex items-start gap-4 hover:bg-krgold/5 transition-colors text-left"
          >
            <div className="p-3 bg-krgold/20 rounded-xl flex-shrink-0">
              <span className="text-3xl">💡</span>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-krtext flex items-center gap-2">
                What is a Trading Playbook?
                {isInfoExpanded ? (
                  <ChevronUp size={20} className="text-krgold" />
                ) : (
                  <ChevronDown size={20} className="text-krgold" />
                )}
              </h2>
              <p className="text-krmuted text-sm mt-1">
                {isInfoExpanded ? 'Click to collapse' : 'Click to learn more about trading playbooks'}
              </p>
            </div>
          </button>
          
          {isInfoExpanded && (
            <div className="px-6 pb-6 space-y-2 text-krmuted text-sm animate-fade-in">
              <p>
                A trading playbook is your <span className="text-krgold font-semibold">strategic blueprint</span> for consistent success in the markets. 
                Think of it as your personal collection of battle-tested setups, entry/exit rules, and market scenarios that work for you.
              </p>
              <div className="grid md:grid-cols-3 gap-4 mt-4">
                <div className="bg-krcard/50 backdrop-blur-sm rounded-xl p-4 border border-krborder/30">
                  <div className="text-2xl mb-2">🎯</div>
                  <h3 className="text-krtext font-semibold mb-1">Define Your Edge</h3>
                  <p className="text-xs">Document patterns and setups that consistently give you an advantage in the market</p>
                </div>
                <div className="bg-krcard/50 backdrop-blur-sm rounded-xl p-4 border border-krborder/30">
                  <div className="text-2xl mb-2">📊</div>
                  <h3 className="text-krtext font-semibold mb-1">Reduce Emotions</h3>
                  <p className="text-xs">Pre-defined strategies help you stay disciplined and avoid impulsive decisions</p>
                </div>
                <div className="bg-krcard/50 backdrop-blur-sm rounded-xl p-4 border border-krborder/30">
                  <div className="text-2xl mb-2">🔄</div>
                  <h3 className="text-krtext font-semibold mb-1">Continuous Improvement</h3>
                  <p className="text-xs">Review and refine your strategies based on real trading results over time</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-krborder/30">
                <p className="text-xs">
                  <span className="text-krgold font-semibold">Pro Tip:</span> Each strategy should include clear entry criteria, exit rules, risk management parameters, 
                  and visual examples. Update your playbook regularly as you learn what works best for your trading style.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6 mb-6">
        {/* Form Section */}
        <div className="bg-krcard/90 backdrop-blur-md rounded-2xl shadow-2xl border border-krborder/50 p-6">
          <h2 className="text-xl font-bold mb-4 text-krtext flex items-center gap-2">
            {editingId ? (
              <>
                <span className="text-blue-400">✏️</span> Edit Strategy
              </>
            ) : (
              <>
                <span className="text-krgold">➕</span> New Strategy
              </>
            )}
          </h2>
          
          <input 
            className="w-full mb-3 px-3 py-2 rounded-lg bg-transparent border border-krborder text-krtext focus:border-krgold focus:ring-1 focus:ring-krgold" 
            placeholder="Strategy Title" 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
          />
          
          <div className="mb-3 space-y-2">
            <label className="text-sm font-medium text-krtext">Strategy Images (up to 4)</label>
            {[0, 1, 2, 3].map(idx => (
              <div key={idx}>
                <FileUploader 
                  value={images[idx]} 
                  onChange={val => {
                    const newImgs = [...images]
                    newImgs[idx] = val
                    setImages(newImgs)
                  }} 
                  accept="image/*" 
                />
              </div>
            ))}
          </div>
          
          <textarea 
            className="w-full mb-3 px-3 py-2 rounded-lg bg-transparent border border-krborder text-krtext focus:border-krgold focus:ring-1 focus:ring-krgold min-h-[120px]" 
            placeholder="Description (markdown supported)" 
            value={desc} 
            onChange={e => setDesc(e.target.value)} 
          />
          
          <div className="flex gap-2">
            <button 
              className="flex-1 px-4 py-2 bg-krgold hover:bg-kryellow text-krblack rounded-lg font-semibold transition-colors" 
              onClick={add}
            >
              {editingId ? 'Update Strategy' : 'Save Strategy'}
            </button>
            {editingId && (
              <button 
                className="px-4 py-2 bg-krcard hover:bg-krgray/20 border border-krborder text-krtext rounded-lg transition-colors" 
                onClick={cancelEdit}
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Strategies Grid */}
        <div className="md:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-krtext flex items-center gap-2">
              <span className="text-krgold">📚</span> My Strategies ({items.length})
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.length === 0 && (
              <div className="col-span-full text-center py-20">
                <div className="text-6xl mb-4">📖</div>
                <p className="text-krmuted">No strategies yet</p>
                <p className="text-xs text-krmuted/60 mt-2">Create your first trading strategy!</p>
              </div>
            )}
            {items.map((it) => (
              <div key={it.id} className="bg-krcard/90 backdrop-blur-md rounded-xl border border-krborder/50 overflow-hidden hover:border-krgold/70 hover:shadow-lg hover:shadow-krgold/10 transition-all duration-200 group">
                {/* Image Grid - Show up to 4 images */}
                {it.images.length > 0 && (
                  <div className={`grid ${it.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} gap-1 bg-krblack/50`}>
                    {it.images.slice(0, 4).map((img, idx) => (
                      <img 
                        key={idx} 
                        src={img} 
                        alt={`${it.title} ${idx + 1}`} 
                        className="w-full h-32 object-cover" 
                      />
                    ))}
                  </div>
                )}
                
                <div className="p-4">
                  <h3 className="font-bold text-krtext mb-2">{it.title}</h3>
                  <div 
                    className="text-sm text-gray-400 line-clamp-3 prose prose-invert max-w-none" 
                    dangerouslySetInnerHTML={{__html: renderMarkdown(it.desc || '')}}
                  ></div>
                  
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => setViewStrategy(it)}
                      className="flex-1 px-3 py-1.5 bg-krgold/10 hover:bg-krgold/20 border border-krgold/30 text-krgold rounded-md transition-colors flex items-center justify-center gap-1"
                      title="View Details"
                    >
                      <Eye size={14} />
                      View
                    </button>
                    <button
                      onClick={() => editStrategy(it)}
                      className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-md transition-colors"
                      title="Edit Strategy"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => deleteStrategy(it.id)}
                      className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-md transition-colors"
                      title="Delete Strategy"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* View Strategy Modal */}
      {viewStrategy && (
        <Modal isOpen={true} onClose={() => setViewStrategy(null)} title="">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-2xl font-bold text-krtext">{viewStrategy.title}</h2>
              <button 
                onClick={() => setViewStrategy(null)}
                className="text-gray-400 hover:text-krtext"
              >
                <X size={24} />
              </button>
            </div>
            
            {/* Images Grid in Modal */}
            {viewStrategy.images.length > 0 && (
              <div className={`grid ${viewStrategy.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} gap-2 mb-4`}>
                {viewStrategy.images.map((img, idx) => (
                  <img 
                    key={idx} 
                    src={img} 
                    alt={`${viewStrategy.title} ${idx + 1}`} 
                    className="w-full h-64 object-cover rounded-lg" 
                  />
                ))}
              </div>
            )}
            
            <div 
              className="prose prose-invert max-w-none text-gray-300" 
              dangerouslySetInnerHTML={{__html: renderMarkdown(viewStrategy.desc || '')}}
            ></div>
          </div>
        </Modal>
      )}
      </div>
      </div>
    </div>
  )
}
