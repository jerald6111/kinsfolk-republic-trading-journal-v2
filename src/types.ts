export type TradeObjective = 'Scalping' | 'Day Trade' | 'Swing Trade' | 'Position';
export type TradeType = 'Spot' | 'Futures';
export type TradePosition = 'Long' | 'Short';
export type StrategySetup = { id: number; title: string; };

export type JournalEntry = {
  id: number;
  date: string;
  time: string;
  ticker: string;
  objective: TradeObjective;
  setup: string;
  type: TradeType;
  position: TradePosition;
  leverage: number;
  entryPrice: number;
  exitDate: string;
  exitTime: string;
  exitPrice: number;
  fee: number;
  marginCost: number;
  pnlAmount: number;
  pnlPercent: number;
  chartImg: string;
  pnlImg: string;
  reasonIn: string;
  reasonOut: string;
  tags?: string[];
};

/** Preset trading-psychology / discipline tags. */
export const PSYCH_TAGS = [
  'Plan followed',
  'FOMO',
  'Revenge trade',
  'Overtrading',
  'Patience',
  'Early exit',
  'Late entry',
  'Broke rules',
  'Hesitation',
  'Disciplined',
] as const;

export type VisionGoal = {
  id: number;
  title: string;
  desc: string;
  target: string;
  date: string;
  img?: string;
  status: 'active' | 'completed' | 'paused';
};

export type Strategy = {
  id: number;
  title: string;
  desc: string;
  img?: string;
};

export type Transaction = {
  id: number;
  date: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  reason: string;
};