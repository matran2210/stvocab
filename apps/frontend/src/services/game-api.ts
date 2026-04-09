import { apiClient } from '../api/client';

export type FlipCardGameCard = {
  id: string;
  pairId: string;
  type: 'WORD' | 'MEANING';
  content: string;
  phonetic: string | null;
};

export type FlipCardGameSession = {
  gameType: string;
  canPlay: boolean;
  rewardGold: number;
  message: string;
  playStatus: {
    date: string;
    turnNumber: number;
    limit: number;
    remainingTurns: number;
  };
  board: {
    gridSize: number;
    totalPairs: number;
    totalCards: number;
    cards: FlipCardGameCard[];
  } | null;
};

export type FlipCardGameReward = {
  message: string;
  rewardGold: number;
  gold: number;
};

export function getFlipCardGame() {
  return apiClient<FlipCardGameSession>('/client/games/flip-card');
}

export function completeFlipCardGame(matchedPairIds: string[]) {
  return apiClient<FlipCardGameReward>('/client/games/flip-card/complete', {
    method: 'POST',
    body: JSON.stringify({ matchedPairIds }),
  });
}
