import { useState } from 'react'
import { Modal } from './Modal'
import { Button } from './Button'

/** Confirmation used before destructive actions (delete run, delete grid). */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  description,
  confirmLabel = 'Delete',
  tone = 'danger',
}) {
  const [busy, setBusy] = useState(false)

  const handleConfirm = async () => {
    try {
      setBusy(true)
      await onConfirm?.()
      onClose?.()
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={busy ? undefined : onClose}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <Button size="sm" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button size="sm" variant={tone} onClick={handleConfirm} loading={busy}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-xs leading-relaxed text-ink-muted">This action cannot be undone.</p>
    </Modal>
  )
}

export default ConfirmDialog
