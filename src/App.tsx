import { useState } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { PlayerCard } from './components/PlayerCard'
import { TeamColumn } from './components/TeamColumn'
import { SwapList } from './components/SwapList'
import { Player, BalanceResult, Swap } from './types'

const makeTeam = (startId: number): Player[] =>
  Array.from({ length: 4 }, (_, i) => ({ id: startId + i, name: '', elo: 0 }))

function computeSwaps(
  currentA: Player[],
  currentB: Player[],
  result: BalanceResult,
): Swap[] {
  const optimalAIds = new Set(result.team_a.map(p => p.id))

  // Players currently in A that should move to B
  const leavingA = currentA.filter(p => !optimalAIds.has(p.id))
  // Players currently in B that should move to A
  const joiningA = currentB.filter(p => optimalAIds.has(p.id))

  return leavingA.map((p, i) => ({ out: p, in: joiningA[i] }))
}

function App() {
  const [teamA, setTeamA] = useState<Player[]>(makeTeam(0))
  const [teamB, setTeamB] = useState<Player[]>(makeTeam(4))
  const [result, setResult] = useState<BalanceResult | null>(null)
  const [swaps, setSwaps] = useState<Swap[]>([])
  const [loading, setLoading] = useState(false)

  const updateTeamA = (index: number, updated: Player) =>
    setTeamA(prev => prev.map((p, i) => (i === index ? updated : p)))

  const updateTeamB = (index: number, updated: Player) =>
    setTeamB(prev => prev.map((p, i) => (i === index ? updated : p)))

  const allPlayers = [...teamA, ...teamB]
  const canBalance = allPlayers.every(p => p.elo > 0)

  const handleBalance = async () => {
    if (!canBalance) return
    setLoading(true)
    try {
      const payload = allPlayers.map((p, i) => ({
        id: p.id,
        name: p.name.trim() || `Player ${i + 1}`,
        elo: p.elo,
      }))
      const res = await invoke<BalanceResult>('balance', { players: payload })

      // Re-attach original names (Rust returns the same players back)
      const nameMap = new Map(payload.map(p => [p.id, p.name]))
      res.team_a = res.team_a.map(p => ({ ...p, name: nameMap.get(p.id) ?? p.name }))
      res.team_b = res.team_b.map(p => ({ ...p, name: nameMap.get(p.id) ?? p.name }))

      setResult(res)
      setSwaps(computeSwaps(
        payload.filter(p => p.id < 4),
        payload.filter(p => p.id >= 4),
        res,
      ))
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setTeamA(makeTeam(0))
    setTeamB(makeTeam(4))
    setResult(null)
    setSwaps([])
  }

  return (
    <div className="min-h-screen flex flex-col px-10 py-8 gap-7 max-w-5xl mx-auto w-full">

      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Matchmaker</h1>
          <p className="text-sm text-gray-500 mt-0.5">Legion TD · ELO Team Balancer</p>
        </div>
        {result && (
          <button onClick={handleReset} className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
            Reset
          </button>
        )}
      </div>

      {/* Team A Input */}
      <section className="flex flex-col gap-2.5">
        <h2 className="text-[11px] font-semibold text-blue-500/70 uppercase tracking-widest">
          Current Team A
        </h2>
        <div className="grid grid-cols-4 gap-3">
          {teamA.map((p, i) => (
            <PlayerCard key={p.id} index={i} player={p} onChange={pl => updateTeamA(i, pl)} accent="blue" />
          ))}
        </div>
      </section>

      {/* Team B Input */}
      <section className="flex flex-col gap-2.5">
        <h2 className="text-[11px] font-semibold text-violet-500/70 uppercase tracking-widest">
          Current Team B
        </h2>
        <div className="grid grid-cols-4 gap-3">
          {teamB.map((p, i) => (
            <PlayerCard key={p.id} index={i} player={p} onChange={pl => updateTeamB(i, pl)} accent="violet" />
          ))}
        </div>
      </section>

      {/* Balance Button */}
      <div className="flex items-center justify-center gap-4">
        {!canBalance && (
          <span className="text-xs text-gray-600">Fill in all 8 ELO values to balance</span>
        )}
        <button
          onClick={handleBalance}
          disabled={!canBalance || loading}
          className="px-10 py-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-2xl transition-colors text-sm tracking-wide shadow-lg shadow-indigo-900/30"
        >
          {loading ? 'Balancing…' : 'Balance Teams'}
        </button>
      </div>

      {/* Results */}
      {result && (
        <>
          {/* Swaps */}
          <section className="flex flex-col gap-2.5">
            <h2 className="text-[11px] font-semibold text-gray-600 uppercase tracking-widest">
              {swaps.length === 0 ? 'No Changes Needed' : `Make ${swaps.length} Swap${swaps.length > 1 ? 's' : ''}`}
            </h2>
            <SwapList swaps={swaps} />
          </section>

          {/* Optimal Teams */}
          <section className="flex flex-col gap-2.5">
            <h2 className="text-[11px] font-semibold text-gray-600 uppercase tracking-widest">
              Optimal Split
            </h2>
            <div className="flex items-stretch gap-4">
              <TeamColumn label="Team A" players={result.team_a} totalElo={result.team_a_elo} color="blue" />
              <div className="flex flex-col items-center justify-center px-4 gap-1 min-w-[80px]">
                <span className="text-[10px] text-gray-700 uppercase tracking-widest">diff</span>
                <span className="text-3xl font-bold font-mono text-gray-300">{result.difference}</span>
                <span className="text-[10px] text-gray-700 uppercase tracking-widest">elo</span>
              </div>
              <TeamColumn label="Team B" players={result.team_b} totalElo={result.team_b_elo} color="violet" />
            </div>
          </section>
        </>
      )}
    </div>
  )
}

export default App
