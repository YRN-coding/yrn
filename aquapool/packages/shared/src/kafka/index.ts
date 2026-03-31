import { Kafka, Producer, Consumer, logLevel } from 'kafkajs';

let kafka: Kafka | null = null;

export function getKafka(): Kafka {
  if (!kafka) {
    kafka = new Kafka({
      clientId: process.env['KAFKA_CLIENT_ID'] ?? 'aquapool',
      brokers: (process.env['KAFKA_BROKERS'] ?? 'localhost:9092').split(','),
      logLevel: logLevel.WARN,
      retry: { initialRetryTime: 300, retries: 5 },
    });
  }
  return kafka;
}

export async function createProducer(): Promise<Producer> {
  const producer = getKafka().producer({ allowAutoTopicCreation: true });
  await producer.connect();
  return producer;
}

export async function createConsumer(groupId: string): Promise<Consumer> {
  const consumer = getKafka().consumer({ groupId, allowAutoTopicCreation: true });
  await consumer.connect();
  return consumer;
}

export type { Producer, Consumer };
