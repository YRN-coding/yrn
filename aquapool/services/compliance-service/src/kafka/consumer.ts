import { createConsumer, createProducer, KAFKA_TOPICS } from '@aquapool/shared';
import type { Producer } from '@aquapool/shared';
import { screenAddress } from '../services/chainalysis.service';
import { screenUserKyc } from '../services/comply-advantage.service';

export async function startComplianceConsumer(producer: Producer) {
  const consumer = await createConsumer('compliance-service');

  await consumer.subscribe({
    topics: [
      KAFKA_TOPICS.USER_CREATED,
      KAFKA_TOPICS.TRANSACTION_INITIATED,
      KAFKA_TOPICS.REMITTANCE_INITIATED,
    ],
  });

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      if (!message.value) return;
      try {
        const payload = JSON.parse(message.value.toString()) as Record<string, unknown>;

        if (topic === KAFKA_TOPICS.USER_CREATED) {
          const userId = payload['userId'] as string;
          const fullName = (payload['fullName'] as string | undefined) ?? '';
          if (!userId) return;
          const result = await screenUserKyc(userId, fullName);
          const outTopic = result.passed ? KAFKA_TOPICS.COMPLIANCE_PASSED : KAFKA_TOPICS.COMPLIANCE_FLAG;
          await producer.send({ topic: outTopic, messages: [{ value: JSON.stringify({ userId, ...result }) }] });
        }

        if (topic === KAFKA_TOPICS.TRANSACTION_INITIATED) {
          const userId = payload['userId'] as string;
          const address = payload['toAddress'] as string | undefined;
          if (!address) return;
          const network = (payload['network'] as string | undefined) ?? 'ethereum';
          const risk = await screenAddress(address, network);
          const outTopic = (risk.riskLevel === 'HIGH' || risk.riskLevel === 'SEVERE')
            ? KAFKA_TOPICS.COMPLIANCE_FLAG
            : KAFKA_TOPICS.COMPLIANCE_PASSED;
          const { address: _addr, ...riskRest } = risk;
          await producer.send({ topic: outTopic, messages: [{ value: JSON.stringify({ userId, address, ...riskRest }) }] });
        }

        if (topic === KAFKA_TOPICS.REMITTANCE_INITIATED) {
          const userId = payload['userId'] as string;
          const result = await screenUserKyc(userId, '');
          if (!result.passed) {
            await producer.send({
              topic: KAFKA_TOPICS.COMPLIANCE_FLAG,
              messages: [{ value: JSON.stringify({ userId, reason: 'remittance-aml', ...result }) }],
            });
          }
        }
      } catch (err) {
        console.error('[compliance] Failed to process message:', err);
      }
    },
  });

  console.log('[compliance-service] Kafka consumer started');
}

export async function initKafka(): Promise<Producer | null> {
  try {
    const producer = await createProducer();
    await startComplianceConsumer(producer);
    return producer;
  } catch (err) {
    console.warn('[compliance-service] Kafka unavailable:', (err as Error).message);
    return null;
  }
}
