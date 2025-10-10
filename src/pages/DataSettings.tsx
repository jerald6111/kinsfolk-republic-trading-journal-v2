import React, { useRef, useState, useEffect } from 'react'
import { 
  exportData, 
  importData, 
  deleteAllData, 
  getDiscordWebhooks, 
  addDiscordWebhook, 
  updateDiscordWebhook, 
  deleteDiscordWebhook,
  getActiveWebhookId,
  setActiveWebhookId,
  type DiscordWebhook 
} from '../utils/storage'
import Modal from '../components/Modal'
import { AlertTriangle, Save, Link2, Trash2 } from 'lucide-react'

export default function DataSettings(){
  const fileRef = useRef<HTMLInputElement|null>(null)
  const [showExportModal, setShowExportModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [webhooks, setWebhooks] = useState<DiscordWebhook[]>([])
  const [activeWebhookId, setActiveWebhookId] = useState('')
  const [newWebhookName, setNewWebhookName] = useState('')
  const [newWebhookUrl, setNewWebhookUrl] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [importMode, setImportMode] = useState<'merge' | 'overwrite'>('merge')
  const [editingWebhook, setEditingWebhook] = useState<DiscordWebhook | null>(null)

  useEffect(() => {
    setWebhooks(getDiscordWebhooks())
    setActiveWebhookId(getActiveWebhookId())
  }, [])

  const handleExport = () => {
    exportData()
    setShowExportModal(false)
  }

  const handleImport = async () => {
    if (!selectedFile) return
    await importData(selectedFile, { overwrite: importMode === 'overwrite' })
    setShowImportModal(false)
    setSelectedFile(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleDelete = () => {
    if (deleteConfirm.toLowerCase() === 'delete') {
      deleteAllData()
      setShowDeleteModal(false)
      setDeleteConfirm('')
    }
  }

  const addWebhook = () => {
    if (!newWebhookName || !newWebhookUrl) {
      alert('Please provide both name and URL')
      return
    }
    const webhook = addDiscordWebhook(newWebhookName, newWebhookUrl)
    setWebhooks([...webhooks, webhook])
    setNewWebhookName('')
    setNewWebhookUrl('')
  }

  const updateWebhook = () => {
    if (!editingWebhook || !editingWebhook.name || !editingWebhook.url) {
      alert('Please provide both name and URL')
      return
    }
    updateDiscordWebhook(editingWebhook.id, editingWebhook.name, editingWebhook.url)
    setWebhooks(getDiscordWebhooks())
    setEditingWebhook(null)
  }

  const removeWebhook = (id: string) => {
    if (confirm('Are you sure you want to delete this webhook?')) {
      deleteDiscordWebhook(id)
      setWebhooks(getDiscordWebhooks())
      setActiveWebhookId(getActiveWebhookId())
    }
  }

  const handleSetActive = (id: string) => {
    setActiveWebhookId(id)
    setActiveWebhookId(id)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Data Settings</h1>
      
      <div className="bg-white rounded-xl shadow-sm border border-krborder p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Data Management</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <button 
            onClick={() => setShowExportModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Save size={20} />
            Export Data
          </button>
          <button 
            onClick={() => setShowImportModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <Link2 size={20} />
            Import Data
          </button>
          <button 
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            <Trash2 size={20} />
            Delete All Data
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-krborder p-6">
        <h2 className="text-lg font-semibold mb-4">Discord Integration</h2>
        <div className="space-y-6">
          {/* Add New Webhook */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium">Add New Webhook</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-krborder rounded-md focus:ring-1 focus:ring-krgold"
                  placeholder="e.g., Main Channel"
                  value={newWebhookName}
                  onChange={(e) => setNewWebhookName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Webhook URL
                </label>
                <input
                  type="url"
                  className="w-full px-3 py-2 border border-krborder rounded-md focus:ring-1 focus:ring-krgold"
                  placeholder="https://discord.com/api/webhooks/..."
                  value={newWebhookUrl}
                  onChange={(e) => setNewWebhookUrl(e.target.value)}
                />
              </div>
            </div>
            <button
              onClick={addWebhook}
              className="w-full sm:w-auto px-4 py-2 bg-krgold text-white rounded-md hover:bg-kryellow transition-colors"
            >
              Add Webhook
            </button>
          </div>

          {/* Webhook List */}
          <div className="space-y-4">
            <h3 className="font-medium">Manage Webhooks</h3>
            <div className="space-y-3">
              {webhooks.map((webhook) => (
                <div 
                  key={webhook.id} 
                  className={`p-4 rounded-lg border ${webhook.id === activeWebhookId ? 'border-krgold bg-krgold/5' : 'border-krborder'}`}
                >
                  {editingWebhook?.id === webhook.id ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-krborder rounded-md focus:ring-1 focus:ring-krgold"
                          value={editingWebhook.name}
                          onChange={(e) => setEditingWebhook({...editingWebhook, name: e.target.value})}
                        />
                        <input
                          type="url"
                          className="w-full px-3 py-2 border border-krborder rounded-md focus:ring-1 focus:ring-krgold"
                          value={editingWebhook.url}
                          onChange={(e) => setEditingWebhook({...editingWebhook, url: e.target.value})}
                        />
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={updateWebhook}
                          className="px-3 py-1 bg-krgold text-white rounded hover:bg-kryellow transition-colors text-sm"
                        >
                          Save
                        </button>
                        <button 
                          onClick={() => setEditingWebhook(null)}
                          className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{webhook.name}</div>
                        <div className="text-sm text-gray-500 truncate">{webhook.url}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {webhook.id === activeWebhookId ? (
                          <span className="px-2 py-1 bg-krgold/10 text-krgold rounded text-sm">Active</span>
                        ) : (
                          <button
                            onClick={() => handleSetActive(webhook.id)}
                            className="px-3 py-1 border border-krgold text-krgold rounded hover:bg-krgold hover:text-white transition-colors text-sm"
                          >
                            Set Active
                          </button>
                        )}
                        <button 
                          onClick={() => setEditingWebhook(webhook)}
                          className="p-1.5 text-gray-500 hover:text-gray-700 rounded transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => removeWebhook(webhook.id)}
                          className="p-1.5 text-red-500 hover:text-red-700 rounded transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Export Modal */}
      <Modal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="Export Data"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            This will download all your data as a JSON file. You can use this file to backup or transfer your data.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowExportModal(false)}
              className="px-4 py-2 border rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Export
            </button>
          </div>
        </div>
      </Modal>

      {/* Import Modal */}
      <Modal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        title="Import Data"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Select a JSON file to import. Choose whether to merge with existing data or overwrite everything.
          </p>
          <div>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="mb-4"
            />
          </div>
          <div className="flex gap-4 mb-4">
            <label className="flex items-center">
              <input
                type="radio"
                checked={importMode === 'merge'}
                onChange={() => setImportMode('merge')}
                className="mr-2"
              />
              Merge with existing data
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                checked={importMode === 'overwrite'}
                onChange={() => setImportMode('overwrite')}
                className="mr-2"
              />
              Overwrite all data
            </label>
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowImportModal(false)}
              className="px-4 py-2 border rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={!selectedFile}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              Import
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete All Data"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-red-50 text-red-800 rounded-md">
            <AlertTriangle className="flex-shrink-0" />
            <p>This action cannot be undone. All your data will be permanently deleted.</p>
          </div>
          <p className="text-gray-600">
            Type "delete" below to confirm:
          </p>
          <input
            type="text"
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-red-500"
            placeholder="Type 'delete' to confirm"
          />
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="px-4 py-2 border rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteConfirm.toLowerCase() !== 'delete'}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              Delete All Data
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
