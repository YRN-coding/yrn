import { createProducer, KAFKA_TOPICS } from '@aquapool/shared';
import type { Producer } from '@aquapool/shared';

let producer: Producer | null = null;

export async function getProducer(): Promise<Producer | null> {
  if (producer) return producer;
  try {
    producer = await createProducer();
    return producer;
  } catch (err) {
    console.warn('[remittance-service] Kafka unavailable:', (err as Error).message);
    return null;
  }
}

export async function emitRemittanceInitiated(userId: string, transferId: string, fromCurrency: string, toCurrency: string, amount: number) {
  const p = await getProducer();
  if (!p) return;
  await p.send({
    topic: KAFKA_TOPICS.REMITTANCE_INITIATED,
    messages: [{ value: JSON.stringify({ userId, transferId, fromCurrency, toCurrency, amount, timestamp: Date.now() }) }],
  });
}

export async function emitRemittanceSettled(userId: string, transferId: string) {
  const p = await getProducer();
  if (!p) return;
  await p.send({
    topic: KAFKA_TOPICS.REMITTANCE_SETTLED,
    messages: [{ value: JSON.stringify({ userId, transferId, timestamp: Date.now() }) }],
  });
}
