export default function EmptyState({ titulo, children }) {
  return (
    <div className="empty-state">
      <p className="fw-semibold mb-1">{titulo}</p>
      <div className="text-secondary">{children}</div>
    </div>
  )
}
