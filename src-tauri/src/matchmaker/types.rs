use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Player {
    pub id: usize,
    pub name: String,
    pub elo: i32,
}

#[derive(Serialize, Clone, Debug)]
pub struct BalanceResult {
    pub team_a: Vec<Player>,
    pub team_b: Vec<Player>,
    pub team_a_elo: i32,
    pub team_b_elo: i32,
    pub difference: i32,
}
