import { createProducer, KAFKA_TOPICS } from '@aquapool/shared';
import type { Producer } from '@aquapool/shared';

let producer: Producer | null = null;

export async function getProducer(): Promise<Producer | null> {
  if (producer) return producer;
  try {
    producer = await createProducer();
    return producer;
  } catch (err) {
    console.warn('[auth-service] Kafka unavailable:', (err as Error).message);
    return null;
  }
}

export async function emitUserCreated(userId: string, email: string, fullName?: string) {
  const p = await getProducer();
  if (!p) return;
  await p.send({
    topic: KAFKA_TOPICS.USER_CREATED,
    messages: [{ value: JSON.stringify({ userId, email, fullName, timestamp: Date.now() }) }],
  });
}
