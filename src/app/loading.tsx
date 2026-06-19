export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <div className="flex items-center gap-3">
        <div className="h-2 w-2 animate-bounce rounded-full bg-lime-400 [animation-delay:-0.3s]" />
        <div className="h-2 w-2 animate-bounce rounded-full bg-lime-400 [animation-delay:-0.15s]" />
        <div className="h-2 w-2 animate-bounce rounded-full bg-lime-400" />
      </div>
    </div>
  )
}
