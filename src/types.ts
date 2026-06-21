export interface Player {
  id: number
  name: string
  elo: number
}

export interface BalanceResult {
  team_a: Player[]
  team_b: Player[]
  team_a_elo: number
  team_b_elo: number
  difference: number
}

export interface Swap {
  out: Player  // leaves their current team
  in: Player   // comes in from the other team
}
