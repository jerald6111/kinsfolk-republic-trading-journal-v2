import React, { useRef, useState, useEffect } from 'react'
import { exportData, importData, deleteAllData, getDiscordWebhook, setDiscordWebhook } from '../utils/storage'
import Modal from '../components/Modal'
import { AlertTriangle, Save, Link2, Trash2 } from 'lucide-react'

export default function DataSettings(){
  const fileRef = useRef<HTMLInputElement|null>(null)
  const [showExportModal, setShowExportModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [webhookUrl, setWebhookUrl] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [importMode, setImportMode] = useState<'merge' | 'overwrite'>('merge')

  useEffect(() => {
    setWebhookUrl(getDiscordWebhook())
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

  const saveWebhook = () => {
    setDiscordWebhook(webhookUrl)
    alert('Discord webhook saved!')
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
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Webhook URL
            </label>
            <input
              type="url"
              className="w-full px-3 py-2 border border-krborder rounded-md focus:ring-1 focus:ring-krgold"
              placeholder="https://discord.com/api/webhooks/..."
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
            />
          </div>
          <button
            onClick={saveWebhook}
            className="px-4 py-2 bg-krgold text-white rounded-md hover:bg-kryellow transition-colors"
          >
            Save Webhook
          </button>
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
}
