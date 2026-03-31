import { createProducer, KAFKA_TOPICS } from '@aquapool/shared';
import type { Producer } from '@aquapool/shared';

let producer: Producer | null = null;

export async function getProducer(): Promise<Producer | null> {
  if (producer) return producer;
  try {
    producer = await createProducer();
    return producer;
  } catch (err) {
    console.warn('[wallet-service] Kafka unavailable:', (err as Error).message);
    return null;
  }
}

export async function emitTransactionInitiated(userId: string, txId: string, toAddress: string, amount: string, network: string) {
  const p = await getProducer();
  if (!p) return;
  await p.send({
    topic: KAFKA_TOPICS.TRANSACTION_INITIATED,
    messages: [{ value: JSON.stringify({ userId, txId, toAddress, amount, network, timestamp: Date.now() }) }],
  });
}

export async function emitTransactionConfirmed(userId: string, txId: string, txHash: string) {
  const p = await getProducer();
  if (!p) return;
  await p.send({
    topic: KAFKA_TOPICS.TRANSACTION_CONFIRMED,
    messages: [{ value: JSON.stringify({ userId, txId, txHash, timestamp: Date.now() }) }],
  });
}
