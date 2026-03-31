import { createProducer, KAFKA_TOPICS } from '@aquapool/shared';
import type { Producer } from '@aquapool/shared';

let producer: Producer | null = null;

export async function getProducer(): Promise<Producer | null> {
  if (producer) return producer;
  try {
    producer = await createProducer();
    return producer;
  } catch (err) {
    console.warn('[earn-service] Kafka unavailable:', (err as Error).message);
    return null;
  }
}

export async function emitEarnDeposit(userId: string, productId: string, amount: string, walletId: string) {
  const p = await getProducer();
  if (!p) return;
  await p.send({
    topic: KAFKA_TOPICS.EARN_DEPOSIT,
    messages: [{ value: JSON.stringify({ userId, productId, amount, walletId, timestamp: Date.now() }) }],
  });
}
