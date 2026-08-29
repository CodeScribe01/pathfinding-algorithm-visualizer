import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LayoutGrid, Trash2, Upload } from 'lucide-react'
import {
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  PageHeader,
  Skeleton,
} from '@/components/ui'
import { useAsync } from '@/hooks/useAsync'
import { useBoard } from '@/context/BoardContext'
import { useToast } from '@/context/ToastContext'
import { gridsService } from '@/services'
import { formatRelative } from '@/lib/format'

/** Library of boards saved through the SavedGrid API. */
export default function SavedGridsPage() {
  const { loadGrid } = useBoard()
  const navigate = useNavigate()
  const toast = useToast()
  const [pendingDelete, setPendingDelete] = useState(null)

  const { data, loading, error, execute, setData } = useAsync(() => gridsService.list(), [])
  const grids = data?.results ?? (Array.isArray(data) ? data : [])

  const handleLoad = useCallback(
    (saved) => {
      const start = { row: saved.start_position.row, col: saved.start_position.col }
      const target = { row: saved.target_position.row, col: saved.target_position.col }
      loadGrid(saved.grid_data, start, target)
      toast.success('Board loaded', { description: saved.name })
      navigate('/visualizer')
    },
    [loadGrid, navigate, toast],
  )

  const handleDelete = async () => {
    await gridsService.remove(pendingDelete.id)
    const remaining = grids.filter((grid) => grid.id !== pendingDelete.id)
    setData(Array.isArray(data) ? remaining : { ...data, results: remaining })
    toast.success('Board deleted')
  }

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6">
      <PageHeader
        eyebrow="Account"
        title="Saved boards"
        description="Boards you saved from the visualiser, with their walls, weighted cells and marker positions intact."
      />

      <div className="mt-6">
        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton key={index} className="h-32" />
            ))}
          </div>
        ) : error ? (
          <Card>
            <ErrorState error={error} onRetry={execute} />
          </Card>
        ) : grids.length === 0 ? (
          <Card>
            <EmptyState
              icon={LayoutGrid}
              title="No saved boards"
              description="Draw a board in the visualiser and use Save board to keep it. Saved boards are tied to your account and load back with one click."
            />
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {grids.map((saved) => (
              <article
                key={saved.id}
                className="flex flex-col rounded-card border border-hairline bg-panel p-4"
              >
                <h2 className="truncate text-sm font-semibold text-ink">{saved.name}</h2>
                <p className="mt-1 font-mono text-2xs text-ink-faint">
                  {saved.grid_data?.rows}×{saved.grid_data?.cols} ·{' '}
                  {saved.grid_data?.walls?.length ?? 0} walls ·{' '}
                  {saved.grid_data?.weights?.length ?? 0} weighted
                </p>
                <p className="mt-1 text-2xs text-ink-ghost">
                  Saved {formatRelative(saved.created_at)}
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <Button size="sm" variant="subtle" icon={Upload} onClick={() => handleLoad(saved)}>
                    Load board
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={`Delete ${saved.name}`}
                    onClick={() => setPendingDelete(saved)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={handleDelete}
        title="Delete this board?"
        description={pendingDelete ? `"${pendingDelete.name}" will be removed from your library.` : ''}
      />
    </div>
  )
}
