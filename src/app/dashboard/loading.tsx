export default function DashboardLoading() {
  return (
    <div className="flex flex-1 items-center justify-center py-20">
      <div className="flex items-center gap-3">
        <div className="h-2 w-2 animate-bounce rounded-full bg-lime-400 [animation-delay:-0.3s]" />
        <div className="h-2 w-2 animate-bounce rounded-full bg-lime-400 [animation-delay:-0.15s]" />
        <div className="h-2 w-2 animate-bounce rounded-full bg-lime-400" />
      </div>
    </div>
  )
}
