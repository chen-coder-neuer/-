export type DiceValue = 1 | 2 | 3 | 4 | 5 | 6;

export interface GameState {
  totalPlayers: number;
  dicePerPlayer: number; // Default 5
  myHand: DiceValue[];
  bidQuantity: number;
  bidFace: DiceValue;
  isPure: boolean; // Replaces GameMode, true if "斋"
  isFly: boolean; // True if the bid is a "Fly" (reverting Pure to Normal)
}

export interface ProbabilityResult {
  probability: number; // 0-100
  k_me: number;
  k_needed: number;
  riskAssessment: string;
  advice?: string; // Only for feature 2
}

export type AppMode = 'calculator' | 'analyzer' | null;