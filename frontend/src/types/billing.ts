export interface CreditBalance {
  balance: number;
  lifetime_granted: number;
  lifetime_consumed: number;
}

export interface CreditTransaction {
  tx_id: string;
  amount: number;
  tx_type: "REFILL" | "CONSUME" | "REFUND" | "BONUS";
  reason: string;
  created_at: string;
}
