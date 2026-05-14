export interface WalletBalance {
  asset: string;
  balance: string;
}

export interface PaymentRecord {
  id: string;
  type: string;
  from: string;
  to: string;
  amount: string;
  asset: string;
  createdAt: string;
}

export interface TransferPayload {
  toAddress: string;
  amount: string;
  asset: "XLM" | "USDC";
  memo?: string;
}

export interface WalletInfo {
  publicKey: string;
  walletType: "CUSTODIAL" | "NON_CUSTODIAL";
  balances: WalletBalance[];
  history: PaymentRecord[];
}

export interface SessionUser {
  userId: string;
  email: string;
}