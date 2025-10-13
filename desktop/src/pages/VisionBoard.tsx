import React, { useState } from 'react'
import FileUploader from '../components/FileUploader'
import Modal from '../components/Modal'
import { loadData, saveData, triggerAutoEmailBackup } from '../utils/storage'
import { Trash2, Edit2, CheckCircle2, X, Image as ImageIcon } from 'lucide-react'
import { useCurrency } from '../context/CurrencyContext'

type GoalTimeline = 'Short Term (3-6 months)' | 'Mid Term (6-12 months)' | 'Long Term (1-3 years)'

const congratsMessages = [
  {
    emoji: '🎉',
    title: 'Outstanding Achievement!',
    message: 'You did it! Another milestone conquered. Your dedication is truly inspiring!',
    color: 'text-krgold'
  },
  {
    emoji: '🏆',
    title: 'Victory Unlocked!',
    message: 'Incredible work! You\'ve turned your vision into reality. Celebrate this win!',
    color: 'text-yellow-400'
  },
  {
    emoji: '⭐',
    title: 'Goal Crushed!',
    message: 'Amazing! You\'re one step closer to your dreams. Keep up the momentum!',
    color: 'text-green-400'
  },
  {
    emoji: '💪',
    title: 'Success Achieved!',
    message: 'You showed determination and won! This is proof of your commitment to growth.',
    color: 'text-blue-400'
  },
  {
    emoji: '🚀',
    title: 'Mission Accomplished!',
    message: 'Fantastic! You\'ve reached new heights. The sky is no longer the limit!',
    color: 'text-purple-400'
  },
  {
    emoji: '🎯',
    title: 'Bullseye!',
    message: 'Perfect execution! You hit your target with precision. Onwards and upwards!',
    color: 'text-red-400'
  }
]

export default function VisionBoard(){
  const data = loadData()
  const { formatAmount } = useCurrency()
  const [items, setItems] = useState(data.vision || [])
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [target, setTarget] = useState('')
  const [timeline, setTimeline] = useState<GoalTimeline>('Short Term (3-6 months)')
  const [img, setImg] = useState('')
  const [editingGoal, setEditingGoal] = useState<any>(null)
  const [showCongratsModal, setShowCongratsModal] = useState(false)
  const [completedGoalTitle, setCompletedGoalTitle] = useState('')
  const [currentCongratsMessage, setCurrentCongratsMessage] = useState(congratsMessages[0])
  
  // New states for enhanced features
  const [viewingGoal, setViewingGoal] = useState<any>(null)
  const [showCompletionModal, setShowCompletionModal] = useState(false)
  const [completingGoal, setCompletingGoal] = useState<any>(null)
  const [completionReflection, setCompletionReflection] = useState('')
  const [completionImages, setCompletionImages] = useState<string[]>([])
  const [uploadingImageIndex, setUploadingImageIndex] = useState<number | null>(null)
  const [deletingAchievement, setDeletingAchievement] = useState<any>(null)
  const [deleteConfirmStep, setDeleteConfirmStep] = useState(0) // 0 = not deleting, 1 = first confirm, 2 = second confirm

  const add = () => {
    if (editingGoal) {
      const next = items.map((it: any) => 
        it.id === editingGoal.id 
          ? { ...it, title, desc, target, timeline, img } 
          : it
      )
      setItems(next)
      saveData({ vision: next })
      triggerAutoEmailBackup('update')
      setEditingGoal(null)
    } else {
      const it = { id: Date.now(), title, desc, target, timeline, img, status: 'active' }
      const next = [it, ...items]
      setItems(next)
      saveData({ vision: next })
      triggerAutoEmailBackup('add')
    }
    setTitle(''); setDesc(''); setTarget(''); setTimeline('Short Term (3-6 months)'); setImg('')
  }

  const markComplete = (goal: any) => {
    setCompletingGoal(goal)
    setShowCompletionModal(true)
    setCompletionReflection('')
    setCompletionImages([])
  }

  const finalizeCompletion = () => {
    if (!completingGoal) return
    
    const randomMessage = congratsMessages[Math.floor(Math.random() * congratsMessages.length)]
    setCurrentCongratsMessage(randomMessage)
    
    const next = items.map((it: any) => 
      it.id === completingGoal.id ? { 
        ...it, 
        status: 'completed', 
        completedDate: new Date().toISOString(),
        completionReflection,
        completionImages
      } : it
    )
    setItems(next)
    saveData({ vision: next })
    triggerAutoEmailBackup('update')
    setCompletedGoalTitle(completingGoal.title)
    setShowCompletionModal(false)
    setShowCongratsModal(true)
    setCompletingGoal(null)
    setCompletionReflection('')
    setCompletionImages([])
  }

  const handleCompletionImageUpload = (index: number, imageUrl: string) => {
    const newImages = [...completionImages]
    newImages[index] = imageUrl
    setCompletionImages(newImages)
    setUploadingImageIndex(null)
  }

  const removeCompletionImage = (index: number) => {
    const newImages = completionImages.filter((_, i) => i !== index)
    setCompletionImages(newImages)
  }

  const deleteGoal = (id: number) => {
    if (confirm('Are you sure you want to delete this goal?')) {
      const next = items.filter((it: any) => it.id !== id)
      setItems(next)
      saveData({ vision: next })
      triggerAutoEmailBackup('delete')
    }
  }

  const handleDeleteAchievement = (achievement: any, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent opening the view modal
    setDeletingAchievement(achievement)
    setDeleteConfirmStep(1)
  }

  const confirmDeleteAchievement = () => {
    if (deleteConfirmStep === 1) {
      setDeleteConfirmStep(2)
    } else if (deleteConfirmStep === 2 && deletingAchievement) {
      const next = items.filter((it: any) => it.id !== deletingAchievement.id)
      setItems(next)
      saveData({ vision: next })
      triggerAutoEmailBackup('delete')
      setDeletingAchievement(null)
      setDeleteConfirmStep(0)
    }
  }

  const cancelDeleteAchievement = () => {
    setDeletingAchievement(null)
    setDeleteConfirmStep(0)
  }

  const editGoal = (goal: any) => {
    setEditingGoal(goal)
    setTitle(goal.title)
    setDesc(goal.desc)
    setTarget(goal.target)
    setTimeline(goal.timeline || 'Short Term (3-6 months)')
    setImg(goal.img || '')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const activeGoals = items.filter((it: any) => it.status !== 'completed')
  const completedGoals = items.filter((it: any) => it.status === 'completed')

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-krblack to-gray-950 text-krtext relative overflow-hidden">
      {/* Animated gradient accents */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-krgold/10 via-transparent to-transparent pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-kryellow/5 via-transparent to-transparent pointer-events-none"></div>
      
      <div className="relative z-10 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">🎯</span>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-krgold to-kryellow bg-clip-text text-transparent">Vision Board</h1>
            <p className="text-krmuted text-sm mt-1">Visualize your goals and track achievements</p>
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-krcard/80 backdrop-blur-sm rounded-xl border border-krborder p-4">
            <p className="text-xs text-krmuted mb-1">Active Goals</p>
            <p className="text-2xl font-bold text-blue-400">{activeGoals.length}</p>
          </div>
          <div className="bg-krcard/80 backdrop-blur-sm rounded-xl border border-krborder p-4">
            <p className="text-xs text-krmuted mb-1">Completed</p>
            <p className="text-2xl font-bold text-green-400">{completedGoals.length}</p>
          </div>
          <div className="bg-krcard/80 backdrop-blur-sm rounded-xl border border-krborder p-4">
            <p className="text-xs text-krmuted mb-1">Total Goals</p>
            <p className="text-2xl font-bold text-krgold">{items.length}</p>
          </div>
          <div className="bg-krcard/80 backdrop-blur-sm rounded-xl border border-krborder p-4">
            <p className="text-xs text-krmuted mb-1">Success Rate</p>
            <p className="text-2xl font-bold text-purple-400">
              {items.length > 0 ? `${((completedGoals.length / items.length) * 100).toFixed(0)}%` : '0%'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-[350px,1fr] gap-4 mb-6">
        <div className="p-6 bg-krcard/90 backdrop-blur-md rounded-2xl shadow-2xl border border-krborder/50 self-start">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">{editingGoal ? '✏️' : '➕'}</span>
            <h2 className="text-lg font-semibold text-krtext">{editingGoal ? 'Edit Goal' : 'Add New Goal'}</h2>
          </div>
          
          <div className="space-y-3">
            <input 
              className="w-full p-3 rounded-xl bg-krblack/30 text-krtext border border-krborder/30 focus:border-krgold/50 focus:ring-2 focus:ring-krgold/20 transition-all placeholder:text-krmuted" 
              placeholder="🎯 Goal title" 
              value={title} 
              onChange={e=>setTitle(e.target.value)} 
            />
            
            <textarea 
              className="w-full p-3 rounded-xl bg-krblack/30 text-krtext border border-krborder/30 focus:border-krgold/50 focus:ring-2 focus:ring-krgold/20 transition-all placeholder:text-krmuted" 
              placeholder="📝 Description" 
              value={desc} 
              onChange={e=>setDesc(e.target.value)} 
              rows={3} 
            />
            
            <input 
              className="w-full p-3 rounded-xl bg-krblack/30 text-krtext border border-krborder/30 focus:border-krgold/50 focus:ring-2 focus:ring-krgold/20 transition-all placeholder:text-krmuted" 
              placeholder="💰 Target amount" 
              value={target} 
              onChange={e=>setTarget(e.target.value)} 
            />
            
            <select 
              className="w-full p-3 rounded-xl bg-krblack/30 text-krtext border border-krborder/30 focus:border-krgold/50 focus:ring-2 focus:ring-krgold/20 transition-all" 
              value={timeline} 
              onChange={e=>setTimeline(e.target.value as GoalTimeline)}
            >
              <option value="Short Term (3-6 months)" className="bg-krcard text-krtext">⚡ Short Term (3-6 months)</option>
              <option value="Mid Term (6-12 months)" className="bg-krcard text-krtext">📅 Mid Term (6-12 months)</option>
              <option value="Long Term (1-3 years)" className="bg-krcard text-krtext">🚀 Long Term (1-3 years)</option>
            </select>
            
            <div className="pt-1">
              <FileUploader value={img} onChange={setImg} accept="image/*" />
            </div>
            
            <button 
              className="w-full px-4 py-3 bg-gradient-to-r from-krgold to-kryellow text-krblack rounded-xl font-bold hover:shadow-lg hover:shadow-krgold/30 transition-all duration-200" 
              onClick={add}
            >
              {editingGoal ? '💾 Update Goal' : '✨ Add Goal'}
            </button>
            
            {editingGoal && (
              <button 
                className="w-full px-4 py-2 bg-krgray/50 text-krtext rounded-xl font-medium hover:bg-krgray/70 transition-colors border border-krborder/30" 
                onClick={() => {
                  setEditingGoal(null)
                  setTitle(''); setDesc(''); setTarget(''); setTimeline('Short Term (3-6 months)'); setImg('')
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* Active Goals */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🎯</span>
              <h2 className="text-xl font-semibold text-krtext">Active Goals</h2>
            </div>
            
            {activeGoals.length === 0 ? (
              <div className="bg-krcard/50 backdrop-blur-sm rounded-xl border border-krborder/30 p-8 text-center">
                <span className="text-6xl mb-4 block">🎯</span>
                <p className="text-krmuted">No active goals yet. Create your first goal to start visualizing your success!</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                {activeGoals.map((it:any)=> (
                  <div 
                    key={it.id} 
                    className="bg-krcard/80 backdrop-blur-sm rounded-xl border border-krborder hover:border-krgold/70 hover:shadow-lg hover:shadow-krgold/10 transition-all duration-200 p-4 cursor-pointer group"
                    onClick={() => setViewingGoal(it)}
                  >
                    {it.img && <img src={it.img} alt={it.title} className="w-full h-40 object-cover rounded-lg mb-3 group-hover:scale-[1.02] transition-transform" />}
                    <div className="font-bold text-krtext text-lg mb-2">{it.title}</div>
                    <div className="text-sm text-krmuted mt-1 line-clamp-2 mb-3">{it.desc}</div>
                    <div className="text-sm space-y-1 mb-3">
                      <div className="flex items-center justify-between">
                        <span className="text-krmuted">Target:</span>
                        <span className="font-semibold text-krgold">{formatAmount(parseFloat(it.target) || 0)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-krmuted">Timeline:</span>
                        <span className="text-blue-400 text-xs">{it.timeline}</span>
                      </div>
                    </div>
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={() => markComplete(it)}
                        className="flex-1 px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg text-sm hover:shadow-md hover:shadow-green-500/30 transition-all flex items-center justify-center gap-1 font-medium"
                        title="Mark as complete"
                      >
                        <CheckCircle2 size={14} />
                        Complete
                      </button>
                      <button 
                        onClick={() => editGoal(it)}
                        className="px-3 py-2 bg-krgold/20 text-krgold rounded-lg text-sm hover:bg-krgold hover:text-krblack transition-colors border border-krgold/30"
                        title="Edit"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        onClick={() => deleteGoal(it.id)}
                        className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500 hover:text-white transition-colors border border-red-500/30"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Achievements (Completed Goals) */}
          {completedGoals.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🏆</span>
                <h2 className="text-xl font-semibold text-krtext">Achievements</h2>
              </div>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                {completedGoals.map((it:any)=> (
                  <div 
                    key={it.id} 
                    className="bg-gradient-to-br from-krgold/10 to-kryellow/5 backdrop-blur-sm rounded-xl border border-krgold/50 p-4 hover:shadow-lg hover:shadow-krgold/20 transition-all duration-200 cursor-pointer group"
                    onClick={() => setViewingGoal(it)}
                  >
                    {it.img && <img src={it.img} alt={it.title} className="w-full h-40 object-cover rounded-lg mb-3 group-hover:scale-[1.02] transition-transform" />}
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 size={20} className="text-krgold flex-shrink-0" />
                      <div className="font-bold text-krgold text-lg">{it.title}</div>
                    </div>
                    <div className="text-sm text-krmuted mt-1 line-clamp-2 mb-2">{it.desc}</div>
                    <div className="text-xs text-krmuted mt-2 flex items-center gap-1">
                      <span>✓ Completed:</span>
                      <span className="text-krgold">{it.completedDate ? new Date(it.completedDate).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    {it.completionImages && it.completionImages.length > 0 && (
                      <div className="flex gap-1 mt-3">
                        {it.completionImages.slice(0, 3).map((img: string, idx: number) => (
                          <img key={idx} src={img} alt="" className="w-12 h-12 object-cover rounded-lg ring-1 ring-krgold/30" />
                        ))}
                      </div>
                    )}
                    <button
                      onClick={(e) => handleDeleteAchievement(it, e)}
                      className="mt-3 w-full px-3 py-2 bg-red-500/10 text-red-400 rounded-lg text-sm hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center gap-1 border border-red-500/20"
                      title="Delete achievement"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* View Goal Details Modal */}
      <Modal
        isOpen={!!viewingGoal}
        onClose={() => setViewingGoal(null)}
        title={viewingGoal?.status === 'completed' ? '🏆 Achievement' : '🎯 Goal Details'}
        maxWidth="max-w-2xl"
      >
        {viewingGoal && (
          <div className="p-6">
            {viewingGoal.img && (
              <img src={viewingGoal.img} alt={viewingGoal.title} className="w-full h-64 object-cover rounded-xl mb-4" />
            )}
            <h3 className="text-2xl font-bold text-krtext mb-3">{viewingGoal.title}</h3>
            <p className="text-krmuted mb-4">{viewingGoal.desc}</p>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-krcard rounded-xl p-3 border border-krborder">
                <div className="text-sm text-krmuted">Target Amount</div>
                <div className="text-lg font-bold text-krgold">{formatAmount(parseFloat(viewingGoal.target) || 0)}</div>
              </div>
              <div className="bg-krcard rounded-xl p-3 border border-krborder">
                <div className="text-sm text-krmuted">Timeline</div>
                <div className="text-lg font-bold text-krtext">{viewingGoal.timeline}</div>
              </div>
            </div>

            {viewingGoal.status === 'completed' && (
              <div className="bg-krsuccess/10 border border-krsuccess/30 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="text-krsuccess" size={20} />
                  <span className="font-semibold text-krsuccess">
                    Completed on {viewingGoal.completedDate ? new Date(viewingGoal.completedDate).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                
                {viewingGoal.completionReflection && (
                  <div className="mt-3">
                    <div className="text-sm text-krmuted mb-1">Reflection:</div>
                    <p className="text-krtext italic">&quot;{viewingGoal.completionReflection}&quot;</p>
                  </div>
                )}

                {viewingGoal.completionImages && viewingGoal.completionImages.length > 0 && (
                  <div className="mt-3">
                    <div className="text-sm text-krmuted mb-2">Success Photos:</div>
                    <div className="grid grid-cols-3 gap-2">
                      {viewingGoal.completionImages.map((img: string, idx: number) => (
                        <img key={idx} src={img} alt={`Success ${idx + 1}`} className="w-full h-32 object-cover rounded-lg" />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => setViewingGoal(null)}
              className="w-full px-6 py-2 bg-krgold text-krblack rounded-md font-semibold hover:bg-kryellow transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </Modal>

      {/* Completion Modal */}
      <Modal
        isOpen={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
        title="� Complete Your Goal"
        maxWidth="max-w-2xl"
      >
        {completingGoal && (
          <div className="p-6">
            <h3 className="text-xl font-bold text-krtext mb-4">{completingGoal.title}</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-krtext mb-2">
                Reflection / Description
              </label>
              <textarea
                value={completionReflection}
                onChange={(e) => setCompletionReflection(e.target.value)}
                placeholder="Share your thoughts on achieving this goal... What did you learn? How do you feel?"
                className="w-full px-3 py-2 bg-krcard border border-krborder rounded-xl text-krtext placeholder-krmuted focus:outline-none focus:border-krgold resize-none"
                rows={4}
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-krtext mb-2">
                Success Photos (Upload up to 3)
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[0, 1, 2].map((index) => (
                  <div key={index} className="relative">
                    {completionImages[index] ? (
                      <div className="relative group">
                        <img 
                          src={completionImages[index]} 
                          alt={`Success ${index + 1}`} 
                          className="w-full h-32 object-cover rounded-lg border-2 border-krgold"
                        />
                        <button
                          onClick={() => removeCompletionImage(index)}
                          className="absolute top-1 right-1 p-1 bg-krdanger rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={16} className="text-white" />
                        </button>
                      </div>
                    ) : (
                      <div className="h-32">
                        <FileUploader 
                          value="" 
                          onChange={(url: string) => handleCompletionImageUpload(index, url)} 
                          accept="image/*"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-krmuted mt-2">Add photos to celebrate your achievement!</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCompletionModal(false)}
                className="flex-1 px-6 py-2 bg-krcard border border-krborder text-krtext rounded-md font-semibold hover:bg-krborder transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={finalizeCompletion}
                className="flex-1 px-6 py-2 bg-krsuccess text-white rounded-md font-semibold hover:opacity-90 transition-opacity"
              >
                Complete Goal
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Congratulations Modal */}
      <Modal
        isOpen={showCongratsModal}
        onClose={() => setShowCongratsModal(false)}
        title={currentCongratsMessage.title}
      >
        <div className="p-6 text-center">
          <div className="text-6xl mb-4">{currentCongratsMessage.emoji}</div>
          <h3 className={`text-2xl font-bold mb-2 ${currentCongratsMessage.color}`}>
            {currentCongratsMessage.title}
          </h3>
          <p className="text-krmuted mb-4">
            You've successfully completed: <strong className="text-krgold">{completedGoalTitle}</strong>
          </p>
          <p className="text-krtext mb-6">
            {currentCongratsMessage.message}
          </p>
          <button
            onClick={() => setShowCongratsModal(false)}
            className="px-6 py-2 bg-krgold text-krblack rounded-md font-semibold hover:bg-kryellow transition-colors"
          >
            Continue
          </button>
        </div>
      </Modal>

      {/* Delete Achievement Confirmation Modal */}
      <Modal
        isOpen={deleteConfirmStep > 0}
        onClose={cancelDeleteAchievement}
        title="⚠️ Delete Achievement"
      >
        <div className="p-6">
          {deleteConfirmStep === 1 && (
            <div className="text-center">
              <div className="text-6xl mb-4">🗑️</div>
              <h3 className="text-xl font-bold text-krtext mb-3">First Confirmation</h3>
              <p className="text-krmuted mb-2">
                Are you sure you want to delete this achievement?
              </p>
              <p className="text-krgold font-semibold mb-4">
                {deletingAchievement?.title}
              </p>
              <p className="text-sm text-krmuted mb-6">
                This will permanently remove this achievement from your records.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={cancelDeleteAchievement}
                  className="flex-1 px-6 py-2 bg-krcard border border-krborder text-krtext rounded-md font-semibold hover:bg-krborder transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteAchievement}
                  className="flex-1 px-6 py-2 bg-yellow-600 text-white rounded-md font-semibold hover:bg-yellow-700 transition-colors"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {deleteConfirmStep === 2 && (
            <div className="text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold text-krdanger mb-3">Final Confirmation</h3>
              <p className="text-krtext font-semibold mb-2">
                Are you absolutely certain?
              </p>
              <p className="text-krmuted mb-4">
                Deleting <strong className="text-krgold">{deletingAchievement?.title}</strong> cannot be undone.
              </p>
              <p className="text-sm text-krdanger mb-6">
                All associated photos and reflections will be permanently lost.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={cancelDeleteAchievement}
                  className="flex-1 px-6 py-2 bg-krcard border border-krborder text-krtext rounded-md font-semibold hover:bg-krborder transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteAchievement}
                  className="flex-1 px-6 py-2 bg-krdanger text-white rounded-md font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  <Trash2 size={18} />
                  Delete Permanently
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>
      </div>
      </div>
    </div>
  )
}
