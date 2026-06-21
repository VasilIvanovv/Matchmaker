use super::{BalanceResult, Matchmaker, Player};

pub struct BruteForceMatchmaker;

impl Matchmaker for BruteForceMatchmaker {
    fn balance(&self, players: Vec<Player>) -> BalanceResult {
        let n = players.len();
        let team_size = n / 2;
        let total_elo: i32 = players.iter().map(|p| p.elo).sum();

        let mut best_diff = i32::MAX;
        let mut best_mask = 0u32;

        for mask in 0u32..(1u32 << n) {
            if mask.count_ones() as usize != team_size {
                continue;
            }
            let team_a_elo: i32 = players
                .iter()
                .enumerate()
                .filter(|(i, _)| mask & (1 << i) != 0)
                .map(|(_, p)| p.elo)
                .sum();
            let diff = (total_elo - 2 * team_a_elo).abs();
            if diff < best_diff {
                best_diff = diff;
                best_mask = mask;
            }
        }

        let team_a: Vec<Player> = players
            .iter()
            .enumerate()
            .filter(|(i, _)| best_mask & (1 << i) != 0)
            .map(|(_, p)| p.clone())
            .collect();

        let team_b: Vec<Player> = players
            .iter()
            .enumerate()
            .filter(|(i, _)| best_mask & (1 << i) == 0)
            .map(|(_, p)| p.clone())
            .collect();

        let team_a_elo: i32 = team_a.iter().map(|p| p.elo).sum();
        let team_b_elo: i32 = team_b.iter().map(|p| p.elo).sum();

        BalanceResult {
            team_a,
            team_b,
            team_a_elo,
            team_b_elo,
            difference: (team_a_elo - team_b_elo).abs(),
        }
    }
}
