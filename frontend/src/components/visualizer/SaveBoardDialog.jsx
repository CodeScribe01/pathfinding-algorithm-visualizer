import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Input, Modal } from '@/components/ui'

/** Names and persists the current board through the SavedGrid API. */
export function SaveBoardDialog({ open, onClose, onSave, isAuthenticated, defaultName }) {
  const [name, setName] = useState(defaultName)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (open) {
      setName(defaultName)
      setError(null)
    }
  }, [open, defaultName])

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Give the board a name.')
      return
    }
    try {
      setSaving(true)
      await onSave(name.trim())
      onClose()
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setSaving(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <Modal
        open={open}
        onClose={onClose}
        title="Sign in to save boards"
        description="Saved boards, run history and analytics are tied to your account."
        size="sm"
        footer={
          <>
            <Button size="sm" onClick={onClose}>
              Not now
            </Button>
            <Link to="/login">
              <Button size="sm" variant="primary">
                Sign in
              </Button>
            </Link>
          </>
        }
      >
        <p className="text-xs leading-relaxed text-ink-muted">
          The visualiser itself works without an account — everything runs in your browser. An
          account only adds persistence.
        </p>
      </Modal>
    )
  }

  return (
    <Modal
      open={open}
      onClose={saving ? undefined : onClose}
      title="Save board"
      description="Store the current walls, weights and markers so you can reload them later."
      size="sm"
      footer={
        <>
          <Button size="sm" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button size="sm" variant="primary" onClick={handleSave} loading={saving}>
            Save board
          </Button>
        </>
      }
    >
      <Input
        label="Board name"
        value={name}
        error={error}
        onChange={(event) => setName(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') handleSave()
        }}
        placeholder="Recursive division 27×59"
        maxLength={80}
      />
    </Modal>
  )
}

export default SaveBoardDialog
