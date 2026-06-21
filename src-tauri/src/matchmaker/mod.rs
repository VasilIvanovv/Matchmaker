mod brute_force;
mod types;

pub use brute_force::BruteForceMatchmaker;
pub use types::{BalanceResult, Player};

pub trait Matchmaker {
    fn balance(&self, players: Vec<Player>) -> BalanceResult;
}
