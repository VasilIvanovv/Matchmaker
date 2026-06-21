import { Player } from '../types'

interface Props {
  index: number
  player: Player
  onChange: (player: Player) => void
  accent: 'blue' | 'violet'
}

const focusBorder = {
  blue: 'focus:border-blue-500/70',
  violet: 'focus:border-violet-500/70',
}

export function PlayerCard({ index, player, onChange, accent }: Props) {
  const fb = focusBorder[accent]

  return (
    <div className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-2xl p-4 flex flex-col gap-3 transition-colors">
      <span className="text-[11px] font-semibold text-gray-600 uppercase tracking-widest">
        Player {index + 1}
      </span>

      <input
        type="text"
        placeholder="Name"
        value={player.name}
        onChange={e => onChange({ ...player, name: e.target.value })}
        className={`bg-gray-800/60 border border-gray-700/60 rounded-xl px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none ${fb} focus:bg-gray-800 transition-all`}
      />

      <div className="relative">
        <input
          type="number"
          placeholder="ELO"
          value={player.elo === 0 ? '' : player.elo}
          onChange={e => onChange({ ...player, elo: parseInt(e.target.value) || 0 })}
          className={`w-full bg-gray-800/60 border border-gray-700/60 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none ${fb} focus:bg-gray-800 transition-all font-mono`}
        />
        {player.elo > 0 && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-600 font-medium">
            ELO
          </span>
        )}
      </div>
    </div>
  )
}
