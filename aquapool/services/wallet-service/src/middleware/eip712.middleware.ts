import { Request, Response, NextFunction } from 'express';
import { ethers } from 'ethers';

const EIP712_DOMAIN = {
  name: 'Aquapool',
  version: '1',
};

const WALLET_ACTION_TYPES = {
  WalletAction: [
    { name: 'userId', type: 'string' },
    { name: 'action', type: 'string' },
    { name: 'amount', type: 'string' },
    { name: 'toAddress', type: 'string' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' },
  ],
};

export interface WalletActionMessage {
  userId: string;
  action: string;
  amount: string;
  toAddress: string;
  nonce: number;
  deadline: number;
}

export interface Eip712Request extends Request {
  verifiedWallet?: string;
}

export async function verifyEip712Signature(
  req: Eip712Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { signature, message, walletAddress, chainId } = req.body as {
    signature?: string;
    message?: WalletActionMessage;
    walletAddress?: string;
    chainId?: number;
  };

  if (!signature || !message || !walletAddress) {
    res.status(400).json({
      success: false,
      error: { code: 'MISSING_SIGNATURE', message: 'EIP-712 signature, message, and walletAddress are required' },
    });
    return;
  }

  const now = Math.floor(Date.now() / 1000);
  if (message.deadline < now) {
    res.status(400).json({
      success: false,
      error: { code: 'SIGNATURE_EXPIRED', message: 'Signature deadline has passed' },
    });
    return;
  }

  try {
    const domain = { ...EIP712_DOMAIN, chainId: chainId ?? 1 };
    const recovered = ethers.verifyTypedData(domain, WALLET_ACTION_TYPES, message, signature);

    if (recovered.toLowerCase() !== walletAddress.toLowerCase()) {
      res.status(401).json({
        success: false,
        error: { code: 'INVALID_SIGNATURE', message: 'Signature does not match wallet address' },
      });
      return;
    }

    req.verifiedWallet = recovered;
    next();
  } catch {
    res.status(401).json({
      success: false,
      error: { code: 'SIGNATURE_VERIFICATION_FAILED', message: 'Could not verify EIP-712 signature' },
    });
  }
}
