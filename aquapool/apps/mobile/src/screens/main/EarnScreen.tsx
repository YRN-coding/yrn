import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const C = {
  bg: '#050D1A', card: '#0A1628', border: 'rgba(255,255,255,0.06)',
  lime: '#BAFF39', navy: '#050D1A',
  limeAlpha: 'rgba(186,255,57,0.1)', limeBorder: 'rgba(186,255,57,0.3)',
  cyan: '#00E5FF', cyanAlpha: 'rgba(0,229,255,0.1)',
  positive: '#10B981', positiveAlpha: 'rgba(16,185,129,0.1)',
  muted: '#4B5563', label: '#6B7280', text: '#F0F4FF',
};

const protocols = [
  {
    id: 'aave-usdc', name: 'AAVE V3', asset: 'USDC',        apy: 4.82,
    type: 'Lending', risk: 'Low', accentColor: C.lime,
    description: 'Supply USDC to Aave V3. Withdraw anytime.',
  },
  {
    id: 'lido-eth',  name: 'Lido',    asset: 'ETH → stETH', apy: 4.20,
    type: 'Staking', risk: 'Low', accentColor: C.cyan,
    description: 'Liquid ETH staking. Receive stETH tokens.',
  },
  {
    id: 'aave-usdt', name: 'AAVE V3', asset: 'USDT',        apy: 5.31,
    type: 'Lending', risk: 'Low', accentColor: C.lime,
    description: 'Highest stable yields on Aave V3.',
  },
  {
    id: 'aave-eth',  name: 'AAVE V3', asset: 'ETH',         apy: 2.14,
    type: 'Lending', risk: 'Low', accentColor: C.cyan,
    description: 'Earn ETH interest while keeping price exposure.',
  },
];

export default function EarnScreen() {
  const [selected, setSelected] = useState<string | null>(null);
  const [amount, setAmount] = useState('');

  const protocol = protocols.find((p) => p.id === selected);

  function handleDeposit() {
    if (!protocol || !amount || parseFloat(amount) <= 0) return;
    const yearlyYield = (parseFloat(amount) * protocol.apy / 100).toFixed(4);
    Alert.alert(
      'Deposit initiated',
      `Depositing ${amount} ${protocol.asset.split(' ')[0]} into ${protocol.name}\n\nEstimated yearly yield: ${yearlyYield} ${protocol.asset.split(' ')[0]}`,
      [{ text: 'OK' }],
    );
    setAmount('');
  }

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        <Text style={s.title}>Earn</Text>
        <Text style={s.subtitle}>DeFi yields and staking rewards</Text>

        {/* Summary strip */}
        <View style={s.summaryRow}>
          <View style={s.summaryItem}>
            <Text style={s.summaryValue}>$7,214.00</Text>
            <Text style={s.summaryLabel}>Deposited</Text>
          </View>
          <View style={s.summaryDivider} />
          <View style={s.summaryItem}>
            <Text style={[s.summaryValue, { color: C.positive }]}>$341.22</Text>
            <Text style={s.summaryLabel}>Earned to date</Text>
          </View>
          <View style={s.summaryDivider} />
          <View style={s.summaryItem}>
            <Text style={[s.summaryValue, { color: C.lime }]}>4.82%</Text>
            <Text style={s.summaryLabel}>Avg. APY</Text>
          </View>
        </View>

        {/* Protocol list */}
        {protocols.map((p) => {
          const isActive = selected === p.id;
          return (
            <TouchableOpacity
              key={p.id}
              onPress={() => { setSelected(isActive ? null : p.id); setAmount(''); }}
              style={[s.card, isActive && { borderColor: p.accentColor }]}
              activeOpacity={0.75}
            >
              <View style={s.cardHeader}>
                <View style={{ flex: 1 }}>
                  <View style={s.badges}>
                    <View style={[s.badge, { borderColor: `${p.accentColor}40`, backgroundColor: `${p.accentColor}15` }]}>
                      <Text style={[s.badgeText, { color: p.accentColor }]}>{p.type}</Text>
                    </View>
                    <View style={[s.badge, s.badgeGreen]}>
                      <Text style={[s.badgeText, { color: C.positive }]}>{p.risk} risk</Text>
                    </View>
                  </View>
                  <Text style={s.protocolName}>{p.name}</Text>
                  <Text style={s.protocolAsset}>{p.asset}</Text>
                </View>
                <View style={s.apyBox}>
                  <Text style={[s.apyValue, { color: p.accentColor }]}>{p.apy}%</Text>
                  <Text style={s.apyLabel}>APY</Text>
                </View>
              </View>
              <Text style={s.description}>{p.description}</Text>
            </TouchableOpacity>
          );
        })}

        {/* Deposit panel */}
        {protocol ? (
          <View style={[s.depositCard, { borderColor: `${protocol.accentColor}40` }]}>
            <Text style={s.depositTitle}>
              Deposit into {protocol.name}
            </Text>
            <Text style={s.depositAssetLabel}>{protocol.asset}</Text>

            <View style={s.inputRow}>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholder="0.00"
                placeholderTextColor={C.muted}
                style={s.input}
              />
            </View>

            {amount && parseFloat(amount) > 0 ? (
              <View style={[s.yieldRow, { backgroundColor: `${protocol.accentColor}10` }]}>
                <Text style={s.yieldLabel}>Estimated yearly yield</Text>
                <Text style={[s.yieldValue, { color: protocol.accentColor }]}>
                  +{(parseFloat(amount) * protocol.apy / 100).toFixed(4)} {protocol.asset.split(' ')[0]}
                </Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={[
                s.depositBtn,
                { backgroundColor: protocol.accentColor },
                (!amount || parseFloat(amount) <= 0) && s.depositBtnDisabled,
              ]}
              onPress={handleDeposit}
              disabled={!amount || parseFloat(amount) <= 0}
              activeOpacity={0.85}
            >
              <Text style={[s.depositBtnText, { color: C.navy }]}>
                {amount && parseFloat(amount) > 0
                  ? `Deposit ${amount} ${protocol.asset.split(' ')[0]}`
                  : 'Enter amount'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:     { flex: 1, backgroundColor: C.bg },
  content:  { padding: 16, paddingBottom: 40 },
  title:    { fontSize: 26, fontWeight: '800', color: C.text, marginBottom: 4 },
  subtitle: { fontSize: 13, color: C.label, marginBottom: 16 },

  summaryRow: {
    flexDirection: 'row', backgroundColor: C.card, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: C.border, marginBottom: 16, alignItems: 'center',
  },
  summaryItem:    { flex: 1, alignItems: 'center' },
  summaryValue:   { fontSize: 16, fontWeight: '700', color: C.text },
  summaryLabel:   { fontSize: 10, color: C.label, marginTop: 2 },
  summaryDivider: { width: 1, height: 32, backgroundColor: C.border },

  card: {
    backgroundColor: C.card, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: C.border, marginBottom: 10,
  },
  cardHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  badges:      { flexDirection: 'row', gap: 6, marginBottom: 8 },
  badge: {
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20,
    borderWidth: 1,
  },
  badgeGreen:  { backgroundColor: C.positiveAlpha, borderColor: 'rgba(16,185,129,0.3)' },
  badgeText:   { fontSize: 10, fontWeight: '600' },
  protocolName:  { fontSize: 16, fontWeight: '700', color: C.text },
  protocolAsset: { fontSize: 12, color: C.label, marginTop: 2 },
  apyBox:        { alignItems: 'flex-end' },
  apyValue:      { fontSize: 28, fontWeight: '800' },
  apyLabel:      { fontSize: 10, color: C.label },
  description:   { fontSize: 12, color: C.muted, lineHeight: 18 },

  depositCard: {
    backgroundColor: C.card, borderRadius: 18, padding: 16,
    borderWidth: 1, marginTop: 4,
  },
  depositTitle:     { fontSize: 15, fontWeight: '700', color: C.text },
  depositAssetLabel:{ fontSize: 12, color: C.label, marginBottom: 12, marginTop: 2 },
  inputRow:  { marginBottom: 12 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 14, color: C.text, fontSize: 18, fontWeight: '700',
    borderWidth: 1, borderColor: C.border,
  },
  yieldRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    borderRadius: 10, padding: 10, marginBottom: 12,
  },
  yieldLabel:  { fontSize: 12, color: C.label },
  yieldValue:  { fontSize: 12, fontWeight: '700' },
  depositBtn:  { borderRadius: 14, padding: 16, alignItems: 'center' },
  depositBtnDisabled: { opacity: 0.4 },
  depositBtnText:     { fontWeight: '700', fontSize: 15 },
});
