import { DiceValue, GameState, ProbabilityResult } from '../types';

// Factorial helper
function factorial(n: number): number {
  if (n === 0 || n === 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}

// Combinations (nCr)
function combinations(n: number, r: number): number {
  if (r < 0 || r > n) return 0;
  return factorial(n) / (factorial(r) * factorial(n - r));
}

// Binomial CDF (Probability of >= k successes)
function binomialSurvival(n: number, k: number, p: number): number {
  if (k <= 0) return 1;
  if (k > n) return 0;

  let prob = 0;
  for (let i = k; i <= n; i++) {
    prob += combinations(n, i) * Math.pow(p, i) * Math.pow(1 - p, n - i);
  }
  return prob;
}

export function calculateLiarProbability(state: GameState, isAnalyzer: boolean): ProbabilityResult {
  const { totalPlayers, dicePerPlayer, myHand, bidQuantity, bidFace, isPure, isFly } = state;

  // 1. Check My Hand Special Conditions
  
  // Straight Check: 5 distinct values (Only possible if player has >= 5 dice)
  // Standard rule: Straight requires exactly 5 dice 1-5 or 2-6
  const uniqueValues = new Set(myHand);
  const isStraight = myHand.length === 5 && uniqueValues.size === 5;

  // Leopard Check: All dice identical
  const isLeopard = uniqueValues.size === 1 && myHand.length > 0;
  const leopardFace = myHand[0];

  // 2. Determine Wildcard Status
  // Wildcards are ACTIVE if: Bid is NOT 1 AND (Round is NOT Pure OR Bid is Fly)
  // "Fly" explicitly restores Wildcards even if the round was Pure.
  const isWildcardActive = bidFace !== 1 && (!isPure || isFly);

  // 3. Calculate My Contribution (k_me)
  let k_me = 0;

  if (isStraight) {
    k_me = 0;
  } else if (isLeopard) {
    // If wildcard is active, 1s leopard counts as anything.
    // Otherwise, leopard face must match bid face.
    const matchesBid = leopardFace === bidFace;
    const matchesWild = isWildcardActive && leopardFace === 1;
    
    if (matchesBid || matchesWild) {
      // Leopard usually counts as N+1 dice (e.g. 5 dice leopard = 6 contribution)
      k_me = myHand.length + 1; 
    } else {
      k_me = 0;
    }
  } else {
    // Normal counting
    myHand.forEach(die => {
      if (die === bidFace) {
        k_me++;
      } else if (isWildcardActive && die === 1) {
        k_me++;
      }
    });
  }

  // 4. Probability Algorithm
  const unknownDiceCount = (totalPlayers - 1) * dicePerPlayer;
  const k_needed = bidQuantity - k_me;
  
  // Single die probability (p)
  // If Wildcard ACTIVE: Matches BidFace OR 1 => 2/6 = 1/3
  // If Wildcard INACTIVE: Matches BidFace => 1/6
  const p = isWildcardActive ? (1/3) : (1/6);

  const probability = binomialSurvival(unknownDiceCount, k_needed, p) * 100;

  // 5. Assessment
  let riskAssessment = "";
  let advice = "";

  if (probability >= 80) riskAssessment = "极大概率存在 (Safe)";
  else if (probability >= 50) riskAssessment = "值得一博 (Likely)";
  else if (probability >= 20) riskAssessment = "风险较高 (Risky)";
  else riskAssessment = "极大概率吹牛 (Bluff)";

  // Analyzer Logic (Evaluating Previous Player's Bid)
  if (isAnalyzer) {
    // If probability is HIGH, it means the bid is likely true. Don't open.
    // If probability is LOW, it means the bid is likely false. Open!
    if (probability < 20) {
      advice = "建议：开！(大概率是假的)";
    } else if (probability < 45) {
      advice = "建议：考虑开 (风险适中)";
    } else {
      advice = "建议：不要开 (大概率是真的)";
    }
  }

  return {
    probability: Number(probability.toFixed(2)),
    k_me,
    k_needed: Math.max(0, k_needed),
    riskAssessment,
    advice
  };
}