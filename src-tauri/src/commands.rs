use crate::matchmaker::{BalanceResult, BruteForceMatchmaker, Matchmaker, Player};

#[tauri::command]
pub fn balance(players: Vec<Player>) -> BalanceResult {
    BruteForceMatchmaker.balance(players)
}
