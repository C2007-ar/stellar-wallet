import * as StellarSdk from "@stellar/stellar-sdk";

const IS_MAINNET = process.env.STELLAR_NETWORK === "mainnet";

export const STELLAR_NETWORK = IS_MAINNET
  ? StellarSdk.Networks.PUBLIC
  : StellarSdk.Networks.TESTNET;

export const horizon = new StellarSdk.Horizon.Server(
  IS_MAINNET
    ? "https://horizon.stellar.org"
    : "https://horizon-testnet.stellar.org"
);

export function generateKeypair() {
  const keypair = StellarSdk.Keypair.random();
  return {
    publicKey: keypair.publicKey(),
    secretKey: keypair.secret(),
  };
}

export async function fundTestnetAccount(publicKey: string): Promise<void> {
  if (IS_MAINNET) throw new Error("Friendbot indisponible sur mainnet");
  const res = await fetch(
    `https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`
  );
  if (!res.ok) throw new Error("Friendbot funding échoué");
}

export async function getBalances(publicKey: string) {
  try {
    const account = await horizon.loadAccount(publicKey);
    return account.balances.map((b) => ({
      asset: b.asset_type === "native" ? "XLM" : (b as any).asset_code,
      balance: b.balance,
    }));
  } catch {
    return [];
  }
}

export async function buildAndSubmitPayment({
  sourceKeypair,
  destination,
  amount,
  asset = "XLM",
  memo,
}: {
  sourceKeypair: StellarSdk.Keypair;
  destination: string;
  amount: string;
  asset?: string;
  memo?: string;
}) {
  const sourceAccount = await horizon.loadAccount(sourceKeypair.publicKey());

  const stellarAsset =
    asset === "XLM"
      ? StellarSdk.Asset.native()
      : new StellarSdk.Asset(asset, process.env.USDC_ISSUER!);

  let txBuilder = new StellarSdk.TransactionBuilder(sourceAccount, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: STELLAR_NETWORK,
  })
    .addOperation(
      StellarSdk.Operation.payment({
        destination,
        asset: stellarAsset,
        amount,
      })
    )
    .setTimeout(30);

  if (memo) {
    txBuilder = txBuilder.addMemo(StellarSdk.Memo.text(memo));
  }

  const tx = txBuilder.build();
  tx.sign(sourceKeypair);

  const result = await horizon.submitTransaction(tx);
  return result.hash;
}

export function isValidStellarAddress(address: string): boolean {
  try {
    StellarSdk.Keypair.fromPublicKey(address);
    return true;
  } catch {
    return false;
  }
}

export async function getPaymentHistory(publicKey: string, limit = 20) {
  const payments = await horizon
    .payments()
    .forAccount(publicKey)
    .limit(limit)
    .order("desc")
    .call();

  return payments.records.map((p: any) => ({
    id: p.id,
    type: p.type,
    from: p.from,
    to: p.to,
    amount: p.amount,
    asset: p.asset_type === "native" ? "XLM" : p.asset_code,
    createdAt: p.created_at,
  }));
}

/** Vérifie qu'un compte Stellar existe sur le réseau */
export async function accountExists(publicKey: string): Promise<boolean> {
  try {
    await horizon.loadAccount(publicKey);
    return true;
  } catch (e: any) {
    if (e.response?.status === 404) return false;
    throw e;
  }
}