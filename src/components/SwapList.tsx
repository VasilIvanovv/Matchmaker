import { Swap } from '../types'

interface Props {
  swaps: Swap[]
}

export function SwapList({ swaps }: Props) {
  if (swaps.length === 0) {
    return (
      <div className="flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
        <span className="text-emerald-400 text-sm font-medium">Teams are already balanced</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {swaps.map((swap, i) => (
        <div
          key={i}
          className="flex items-center gap-3 py-3 px-5 rounded-2xl bg-amber-500/10 border border-amber-500/20"
        >
          <span className="text-amber-500 text-xs font-bold uppercase tracking-widest min-w-[40px]">
            Swap
          </span>
          <div className="flex items-center gap-3 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-blue-300">{swap.out.name}</span>
              <span className="text-xs font-mono text-blue-400/70">{swap.out.elo}</span>
            </div>
            <span className="text-gray-600">↔</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-violet-300">{swap.in.name}</span>
              <span className="text-xs font-mono text-violet-400/70">{swap.in.elo}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
