import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { contactLinkApi } from '@/entities/contactLink/api'
import { Layout } from '@/widgets/Layout'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog'
import { useAuth } from '@/shared/hooks/useAuth'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, ExternalLink } from 'lucide-react'

export default function ConsultantLinks() {
  const { user } = useAuth()
  const qc = useQueryClient()

  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ serviceName: '', link: '' })

  const { data: links, isLoading } = useQuery({
    queryKey: ['contact-links', user?.id],
    queryFn: () => contactLinkApi.getByUser(user!.id),
    enabled: !!user?.id,
  })

  const createMutation = useMutation({
    mutationFn: () => contactLinkApi.create(formData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['contact-links'] })
      setShowForm(false)
      setFormData({ serviceName: '', link: '' })
      toast.success('Link added')
    },
    onError: () => toast.error('Failed to add link'),
  })

  const updateMutation = useMutation({
    mutationFn: () => contactLinkApi.update(editId!, formData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['contact-links'] })
      setEditId(null)
      setFormData({ serviceName: '', link: '' })
      toast.success('Link updated')
    },
    onError: () => toast.error('Failed to update'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => contactLinkApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['contact-links'] })
      setDeleteId(null)
      toast.success('Link deleted')
    },
    onError: () => toast.error('Failed to delete link'),
  })

  function startEdit(id: string, sn: string, l: string) {
    setEditId(id)
    setFormData({ serviceName: sn, link: l })
    setShowForm(false)
  }

  const SERVICES = ['Telegram', 'WhatsApp', 'LinkedIn', 'Email', 'Website', 'Twitter', 'GitHub']

  return (
    <Layout
      title="Contact Links"
      actions={
        <button
          onClick={() => { setShowForm(true); setEditId(null); setFormData({ serviceName: '', link: '' }) }}
          className="btn-primary text-sm flex items-center gap-1.5"
        >
          <Plus size={14} /> Add link
        </button>
      }
    >
      <div className="max-w-lg space-y-4">
        {(showForm || editId) && (
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="font-semibold text-sm mb-4">{editId ? 'Edit link' : 'New contact link'}</h3>
            <div className="space-y-3">
              <div>
                <label className="form-label">Service</label>
                <select
                  value={formData.serviceName}
                  onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
                  className="input-field"
                >
                  <option value="">Select service...</option>
                  {SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">URL / handle</label>
                <input
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  placeholder="https://t.me/username"
                  className="input-field"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { setShowForm(false); setEditId(null) }}
                  className="btn-ghost flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={() => editId ? updateMutation.mutate() : createMutation.mutate()}
                  disabled={!formData.serviceName || !formData.link || createMutation.isPending || updateMutation.isPending}
                  className="btn-primary flex-1"
                >
                  {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-card rounded-xl border border-border">
          {isLoading ? (
            <p className="p-6 text-muted text-sm">Loading...</p>
          ) : !links || links.length === 0 ? (
            <EmptyState title="No links" description="Add your contact information." />
          ) : (
            <div className="divide-y divide-border">
              {links.map((l) => (
                <div key={l.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-main">{l.serviceName}</p>
                    <a href={l.link} target="_blank" rel="noreferrer" className="text-xs text-accent hover:underline flex items-center gap-1">
                      {l.link} <ExternalLink size={10} />
                    </a>
                  </div>
                  <button onClick={() => startEdit(l.id, l.serviceName, l.link)} className="p-1.5 text-muted hover:text-text-main">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => setDeleteId(l.id)} className="p-1.5 text-muted hover:text-danger">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete link?"
        description="This will remove the contact link."
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        onCancel={() => setDeleteId(null)}
        loading={deleteMutation.isPending}
      />
    </Layout>
  )
}
