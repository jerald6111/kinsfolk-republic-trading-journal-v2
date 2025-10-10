import React, { useState } from 'react'
import FileUploader from '../components/FileUploader'
import Modal from '../components/Modal'
import { loadData, saveData } from '../utils/storage'
import { Trash2, Edit2, CheckCircle2 } from 'lucide-react'

type GoalTimeline = 'Short Term (3-6 months)' | 'Mid Term (6-12 months)' | 'Long Term (1-3 years)'

export default function VisionBoard(){
  const data = loadData()
  const [items, setItems] = useState(data.vision || [])
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [target, setTarget] = useState('')
  const [timeline, setTimeline] = useState<GoalTimeline>('Short Term (3-6 months)')
  const [img, setImg] = useState('')
  const [editingGoal, setEditingGoal] = useState<any>(null)
  const [showCongratsModal, setShowCongratsModal] = useState(false)
  const [completedGoalTitle, setCompletedGoalTitle] = useState('')

  const add = () => {
    if (editingGoal) {
      const next = items.map((it: any) => 
        it.id === editingGoal.id 
          ? { ...it, title, desc, target, timeline, img } 
          : it
      )
      setItems(next)
      saveData({ vision: next })
      setEditingGoal(null)
    } else {
      const it = { id: Date.now(), title, desc, target, timeline, img, status: 'active' }
      const next = [it, ...items]
      setItems(next)
      saveData({ vision: next })
    }
    setTitle(''); setDesc(''); setTarget(''); setTimeline('Short Term (3-6 months)'); setImg('')
  }

  const markComplete = (goal: any) => {
    const next = items.map((it: any) => 
      it.id === goal.id ? { ...it, status: 'completed', completedDate: new Date().toISOString() } : it
    )
    setItems(next)
    saveData({ vision: next })
    setCompletedGoalTitle(goal.title)
    setShowCongratsModal(true)
  }

  const deleteGoal = (id: number) => {
    if (confirm('Are you sure you want to delete this goal?')) {
      const next = items.filter((it: any) => it.id !== id)
      setItems(next)
      saveData({ vision: next })
    }
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
    <div>
      <h1 className="text-2xl font-bold mb-4 text-krtext">Vision Board</h1>
      <div className="grid md:grid-cols-[350px,1fr] gap-4 mb-6">
        <div className="p-4 bg-krcard rounded-xl border border-krborder self-start">
          <h2 className="text-lg font-semibold mb-3 text-krtext">{editingGoal ? 'Edit Goal' : 'Add New Goal'}</h2>
          <input className="w-full mb-2 p-2 rounded bg-transparent text-krtext border border-krborder focus:border-krgold focus:ring-1 focus:ring-krgold" placeholder="Goal title" value={title} onChange={e=>setTitle(e.target.value)} />
          <textarea className="w-full mb-2 p-2 rounded bg-transparent text-krtext border border-krborder focus:border-krgold focus:ring-1 focus:ring-krgold" placeholder="Description" value={desc} onChange={e=>setDesc(e.target.value)} rows={3} />
          <input className="w-full mb-2 p-2 rounded bg-transparent text-krtext border border-krborder focus:border-krgold focus:ring-1 focus:ring-krgold" placeholder="Target amount" value={target} onChange={e=>setTarget(e.target.value)} />
          
          <select 
            className="w-full mb-2 p-2 rounded bg-transparent text-krtext border border-krborder focus:border-krgold focus:ring-1 focus:ring-krgold" 
            value={timeline} 
            onChange={e=>setTimeline(e.target.value as GoalTimeline)}
          >
            <option value="Short Term (3-6 months)">Short Term (3-6 months)</option>
            <option value="Mid Term (6-12 months)">Mid Term (6-12 months)</option>
            <option value="Long Term (1-3 years)">Long Term (1-3 years)</option>
          </select>
          
          <div className="mb-2">
            <FileUploader value={img} onChange={setImg} accept="image/*" />
          </div>
          <button className="w-full px-4 py-2 bg-krgold text-krblack rounded font-bold hover:bg-kryellow transition-colors" onClick={add}>
            {editingGoal ? 'Update Goal' : 'Add Goal'}
          </button>
          {editingGoal && (
            <button className="w-full mt-2 px-4 py-2 bg-krgray text-krtext rounded font-medium hover:bg-krgray/80 transition-colors" onClick={() => {
              setEditingGoal(null)
              setTitle(''); setDesc(''); setTarget(''); setTimeline('Short Term (3-6 months)'); setImg('')
            }}>
              Cancel
            </button>
          )}
        </div>

        <div className="space-y-6">
          {/* Active Goals */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-krtext">Active Goals</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {activeGoals.map((it:any)=> (
                <div key={it.id} className="bg-krcard rounded-xl border border-krborder p-3 hover:border-krgold transition-colors">
                  {it.img && <img src={it.img} alt={it.title} className="w-full h-40 object-cover rounded mb-2" />}
                  <div className="font-bold text-krtext">{it.title}</div>
                  <div className="text-sm text-krmuted mt-1">{it.desc}</div>
                  <div className="text-sm mt-2 text-krtext">
                    <div>Target: {it.target}</div>
                    <div className="text-krgold">{it.timeline}</div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button 
                      onClick={() => markComplete(it)}
                      className="flex-1 px-2 py-1 bg-krsuccess text-white rounded text-sm hover:opacity-80 transition-opacity flex items-center justify-center gap-1"
                      title="Mark as complete"
                    >
                      <CheckCircle2 size={14} />
                      Complete
                    </button>
                    <button 
                      onClick={() => editGoal(it)}
                      className="px-2 py-1 bg-krgold text-krblack rounded text-sm hover:bg-kryellow transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button 
                      onClick={() => deleteGoal(it.id)}
                      className="px-2 py-1 bg-krdanger text-white rounded text-sm hover:opacity-80 transition-opacity"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements (Completed Goals) */}
          {completedGoals.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-krtext">🏆 Achievements</h2>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                {completedGoals.map((it:any)=> (
                  <div key={it.id} className="bg-krcard/50 rounded-xl border border-krborder p-3 opacity-60 hover:opacity-80 transition-opacity">
                    {it.img && <img src={it.img} alt={it.title} className="w-full h-40 object-cover rounded mb-2 grayscale" />}
                    <div className="font-bold text-krtext line-through">{it.title}</div>
                    <div className="text-sm text-krmuted mt-1">{it.desc}</div>
                    <div className="text-sm mt-2 text-krsuccess font-medium">
                      ✓ Completed {it.completedDate && new Date(it.completedDate).toLocaleDateString()}
                    </div>
                    <button 
                      onClick={() => deleteGoal(it.id)}
                      className="mt-2 px-2 py-1 bg-krdanger/50 text-white rounded text-sm hover:bg-krdanger transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={14} className="inline" /> Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Congratulations Modal */}
      <Modal
        isOpen={showCongratsModal}
        onClose={() => setShowCongratsModal(false)}
        title="🎉 Congratulations!"
      >
        <div className="p-6 text-center">
          <div className="text-6xl mb-4">🏆</div>
          <h3 className="text-2xl font-bold text-krtext mb-2">Goal Achieved!</h3>
          <p className="text-krmuted mb-4">
            You've successfully completed: <strong className="text-krgold">{completedGoalTitle}</strong>
          </p>
          <p className="text-krtext mb-6">
            Keep up the amazing work! Your goal has been moved to achievements.
          </p>
          <button
            onClick={() => setShowCongratsModal(false)}
            className="px-6 py-2 bg-krgold text-krblack rounded-md font-semibold hover:bg-kryellow transition-colors"
          >
            Continue
          </button>
        </div>
      </Modal>
    </div>
  )
}
