import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Mode = 'crypto' | 'remittance';

const C = {
  bg: '#050D1A', card: '#0A1628', border: 'rgba(255,255,255,0.06)',
  lime: '#BAFF39', navy: '#050D1A',
  limeAlpha: 'rgba(186,255,57,0.1)', limeBorder: 'rgba(186,255,57,0.3)',
  muted: '#4B5563', label: '#6B7280', text: '#F0F4FF',
};

const assets = [
  { symbol: 'USDC', name: 'USD Coin', balance: '850.00', network: 'Ethereum' },
  { symbol: 'XRP',  name: 'XRP',      balance: '500',    network: 'XRPL' },
  { symbol: 'ETH',  name: 'Ethereum', balance: '1.245',  network: 'Ethereum' },
];

const corridors = [
  { to: 'Philippines', flag: '🇵🇭', rate: '56.4 PHP', fee: '$0.99', time: '~2 min' },
  { to: 'Mexico',      flag: '🇲🇽', rate: '17.2 MXN', fee: '$0.99', time: '~2 min' },
  { to: 'Nigeria',     flag: '🇳🇬', rate: '1,640 NGN', fee: '$0.99', time: '~5 min' },
  { to: 'India',       flag: '🇮🇳', rate: '84.1 INR',  fee: '$0.99', time: '~2 min' },
];

export default function SendScreen() {
  const [mode, setMode]       = useState<Mode>('crypto');
  const [asset, setAsset]     = useState('USDC');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount]   = useState('');
  const [corridor, setCorridor] = useState(corridors[0]!);

  const selected = assets.find((a) => a.symbol === asset);

  function handleSend() {
    if (!recipient || !amount || parseFloat(amount) <= 0) return;
    if (mode === 'crypto') {
      Alert.alert('Transaction submitted', `Sending ${amount} ${asset} to ${recipient}`, [{ text: 'OK' }]);
    } else {
      Alert.alert(
        'Transfer initiated',
        `Sending $${amount} to ${corridor.to}\nRecipient gets: ${(parseFloat(amount) * parseFloat(corridor.rate.split(' ')[0]!.replace(',', ''))).toLocaleString(undefined, { maximumFractionDigits: 0 })} ${corridor.rate.split(' ')[1]}`,
        [{ text: 'OK' }],
      );
    }
  }

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        <Text style={s.title}>Send</Text>
        <Text style={s.subtitle}>Crypto transfers & global remittance</Text>

        {/* Mode toggle */}
        <View style={s.toggle}>
          {(['crypto', 'remittance'] as Mode[]).map((m) => (
            <TouchableOpacity
              key={m}
              onPress={() => setMode(m)}
              style={[s.toggleBtn, mode === m && s.toggleBtnActive]}
              activeOpacity={0.8}
            >
              <Text style={[s.toggleText, mode === m && s.toggleTextActive]}>
                {m === 'crypto' ? 'Crypto' : 'Send Money'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {mode === 'crypto' ? (
          <View style={s.card}>
            <Text style={s.label}>Asset</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.assetRow}>
              {assets.map((a) => (
                <TouchableOpacity
                  key={a.symbol}
                  onPress={() => setAsset(a.symbol)}
                  style={[s.assetChip, asset === a.symbol && s.assetChipActive]}
                  activeOpacity={0.7}
                >
                  <Text style={[s.assetChipText, asset === a.symbol && s.assetChipTextActive]}>
                    {a.symbol}
                  </Text>
                  <Text style={s.assetBalance}>{a.balance}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={s.label}>Recipient address</Text>
            <TextInput
              value={recipient}
              onChangeText={setRecipient}
              placeholder={selected?.network === 'XRPL' ? 'rXXXXXXXXXXXXXXXX' : '0x...'}
              placeholderTextColor={C.muted}
              style={[s.input, s.mono]}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View style={s.amountRow}>
              <Text style={s.label}>Amount</Text>
              <Text style={s.balanceHint}>Balance: {selected?.balance} {asset}</Text>
            </View>
            <View style={s.inputRow}>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholder="0.00"
                placeholderTextColor={C.muted}
                style={[s.input, { flex: 1, marginBottom: 0 }]}
              />
              <TouchableOpacity
                onPress={() => setAmount(selected?.balance ?? '')}
                style={s.maxBtn}
                activeOpacity={0.7}
              >
                <Text style={s.maxBtnText}>Max</Text>
              </TouchableOpacity>
            </View>

            {amount && recipient ? (
              <View style={s.feeCard}>
                <View style={s.feeRow}><Text style={s.feeLabel}>Network</Text><Text style={s.feeValue}>{selected?.network}</Text></View>
                <View style={s.feeRow}><Text style={s.feeLabel}>Est. fee</Text><Text style={s.feeValue}>~$0.50</Text></View>
              </View>
            ) : null}
          </View>
        ) : (
          <View style={s.card}>
            <Text style={s.label}>Send to</Text>
            <View style={s.corridorGrid}>
              {corridors.map((c) => (
                <TouchableOpacity
                  key={c.to}
                  onPress={() => setCorridor(c)}
                  style={[s.corridorCard, corridor.to === c.to && s.corridorCardActive]}
                  activeOpacity={0.7}
                >
                  <Text style={s.corridorFlag}>{c.flag}</Text>
                  <Text style={s.corridorName}>{c.to}</Text>
                  <Text style={s.corridorRate}>{c.rate}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={s.label}>Amount (USD)</Text>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder="0.00"
              placeholderTextColor={C.muted}
              style={s.input}
            />

            <Text style={s.label}>Recipient (phone or email)</Text>
            <TextInput
              value={recipient}
              onChangeText={setRecipient}
              placeholder="+63 9XX XXX XXXX"
              placeholderTextColor={C.muted}
              style={s.input}
              keyboardType="phone-pad"
            />

            {amount && parseFloat(amount) > 0 && (
              <View style={s.feeCard}>
                <View style={s.feeRow}><Text style={s.feeLabel}>Rate</Text><Text style={s.feeValue}>1 USD = {corridor.rate}</Text></View>
                <View style={s.feeRow}><Text style={s.feeLabel}>Fee</Text><Text style={s.feeValue}>{corridor.fee}</Text></View>
                <View style={s.feeRow}><Text style={s.feeLabel}>Time</Text><Text style={s.feeValue}>{corridor.time}</Text></View>
                <View style={[s.feeRow, s.feeRowLast]}>
                  <Text style={s.feeLabel}>Recipient gets</Text>
                  <Text style={[s.feeValue, { color: C.lime, fontWeight: '700' }]}>
                    {(parseFloat(amount) * parseFloat(corridor.rate.split(' ')[0]!.replace(',', ''))).toLocaleString(undefined, { maximumFractionDigits: 0 })} {corridor.rate.split(' ')[1]}
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        <TouchableOpacity
          style={[s.sendBtn, (!recipient || !amount || parseFloat(amount) <= 0) && s.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!recipient || !amount || parseFloat(amount) <= 0}
          activeOpacity={0.85}
        >
          <Text style={s.sendBtnText}>
            {amount && recipient
              ? mode === 'crypto' ? `Send ${amount} ${asset}` : `Send $${amount} to ${corridor.to}`
              : 'Enter details'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:     { flex: 1, backgroundColor: C.bg },
  content:  { padding: 16, paddingBottom: 40 },
  title:    { fontSize: 26, fontWeight: '800', color: C.text, marginBottom: 4 },
  subtitle: { fontSize: 13, color: C.label, marginBottom: 16 },

  toggle: {
    flexDirection: 'row', backgroundColor: C.card, borderRadius: 14, padding: 4,
    marginBottom: 16, borderWidth: 1, borderColor: C.border,
  },
  toggleBtn:       { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  toggleBtnActive: { backgroundColor: C.lime },
  toggleText:      { fontSize: 14, fontWeight: '600', color: C.label },
  toggleTextActive:{ color: C.navy },

  card: {
    backgroundColor: C.card, borderRadius: 18, padding: 16,
    borderWidth: 1, borderColor: C.border, marginBottom: 16,
  },
  label:        { fontSize: 11, color: C.label, marginBottom: 8, marginTop: 12, textTransform: 'uppercase', letterSpacing: 0.8 },
  assetRow:     { marginBottom: 4 },
  assetChip: {
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, marginRight: 8,
    backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: C.border,
    alignItems: 'center',
  },
  assetChipActive:    { backgroundColor: C.limeAlpha, borderColor: C.limeBorder },
  assetChipText:      { fontSize: 14, fontWeight: '600', color: C.muted },
  assetChipTextActive:{ color: C.lime },
  assetBalance:       { fontSize: 10, color: C.label, marginTop: 2 },

  input: {
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 14, color: C.text, fontSize: 15,
    borderWidth: 1, borderColor: C.border, marginBottom: 4,
  },
  mono: { fontFamily: 'monospace', fontSize: 13 },

  amountRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, marginBottom: 0 },
  balanceHint: { fontSize: 11, color: C.label },
  inputRow:    { flexDirection: 'row', gap: 8, marginBottom: 4, marginTop: 8 },
  maxBtn: {
    backgroundColor: C.limeAlpha, borderWidth: 1, borderColor: C.limeBorder,
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14, justifyContent: 'center',
  },
  maxBtnText: { color: C.lime, fontSize: 13, fontWeight: '700' },

  feeCard: {
    backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 12, marginTop: 10, gap: 2,
    borderWidth: 1, borderColor: C.border,
  },
  feeRow:     { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  feeRowLast: { borderTopWidth: 1, borderTopColor: C.border, marginTop: 4, paddingTop: 8 },
  feeLabel:   { fontSize: 12, color: C.label },
  feeValue:   { fontSize: 12, color: C.text, fontWeight: '500' },

  corridorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  corridorCard: {
    width: '47%', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: C.border,
  },
  corridorCardActive: { borderColor: C.lime, backgroundColor: C.limeAlpha },
  corridorFlag:       { fontSize: 22, marginBottom: 4 },
  corridorName:       { fontSize: 13, fontWeight: '600', color: C.text },
  corridorRate:       { fontSize: 11, color: C.label, marginTop: 2 },

  sendBtn:         { backgroundColor: C.lime, borderRadius: 16, padding: 18, alignItems: 'center', marginTop: 4 },
  sendBtnDisabled: { opacity: 0.4 },
  sendBtnText:     { color: C.navy, fontWeight: '700', fontSize: 16 },
});
