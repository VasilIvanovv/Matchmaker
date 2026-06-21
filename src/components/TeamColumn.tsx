import { Player } from '../types'

interface Props {
  label: string
  players: Player[]
  totalElo: number
  color: 'blue' | 'violet'
}

const themes = {
  blue: {
    label: 'text-blue-400',
    border: 'border-blue-500/20',
    glow: 'bg-blue-500/5',
    badge: 'bg-blue-500/15 text-blue-300 border border-blue-500/20',
    elo: 'text-blue-400',
    row: 'hover:bg-blue-500/5',
  },
  violet: {
    label: 'text-violet-400',
    border: 'border-violet-500/20',
    glow: 'bg-violet-500/5',
    badge: 'bg-violet-500/15 text-violet-300 border border-violet-500/20',
    elo: 'text-violet-400',
    row: 'hover:bg-violet-500/5',
  },
}

export function TeamColumn({ label, players, totalElo, color }: Props) {
  const t = themes[color]

  return (
    <div className={`flex-1 rounded-2xl border ${t.border} ${t.glow} p-5 flex flex-col gap-4`}>
      <div className="flex items-center justify-between">
        <span className={`text-xs font-bold uppercase tracking-widest ${t.label}`}>{label}</span>
        <span className={`text-xs font-mono px-2.5 py-1 rounded-lg ${t.badge}`}>
          {totalElo.toLocaleString()} ELO
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        {players.map((p, i) => (
          <div
            key={i}
            className={`flex items-center justify-between rounded-xl px-4 py-2.5 transition-colors ${t.row}`}
          >
            <span className="text-sm text-gray-300 font-medium">
              {p.name.trim() || `Player`}
            </span>
            <span className={`text-sm font-mono font-semibold ${t.elo}`}>
              {p.elo.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
