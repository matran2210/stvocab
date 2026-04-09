export const game_types = [
  {
    name: 'FLIP_CARD',
    limit: 30000,
  },
] as const;

export function getGameTypeConfig(name: string) {
  return game_types.find((item) => item.name === name) ?? null;
}
