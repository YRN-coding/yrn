import { createProducer, KAFKA_TOPICS } from '@aquapool/shared';
import type { Producer } from '@aquapool/shared';

let producer: Producer | null = null;

export async function getProducer(): Promise<Producer | null> {
  if (producer) return producer;
  try {
    producer = await createProducer();
    return producer;
  } catch (err) {
    console.warn('[exchange-service] Kafka unavailable:', (err as Error).message);
    return null;
  }
}

export async function emitOrderCreated(userId: string, orderId: string, symbol: string, side: string, quantity: string) {
  const p = await getProducer();
  if (!p) return;
  await p.send({
    topic: KAFKA_TOPICS.ORDER_CREATED,
    messages: [{ value: JSON.stringify({ userId, orderId, symbol, side, quantity, timestamp: Date.now() }) }],
  });
}

export async function emitOrderFilled(userId: string, orderId: string, symbol: string, filledQuantity: string, price: string) {
  const p = await getProducer();
  if (!p) return;
  await p.send({
    topic: KAFKA_TOPICS.ORDER_FILLED,
    messages: [{ value: JSON.stringify({ userId, orderId, symbol, filledQuantity, price, timestamp: Date.now() }) }],
  });
}
