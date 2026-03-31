import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const C = {
  bg: '#050D1A', card: '#0A1628', border: 'rgba(255,255,255,0.06)',
  lime: '#BAFF39', navy: '#050D1A',
  limeAlpha: 'rgba(186,255,57,0.1)', limeBorder: 'rgba(186,255,57,0.3)',
  cyan: '#00E5FF', muted: '#4B5563', label: '#6B7280', text: '#F0F4FF',
  positive: '#10B981',
};

const tokens = ['ETH', 'BTC', 'SOL', 'USDC', 'USDT', 'XRP', 'BNB'];
const mockPrices: Record<string, number> = {
  ETH: 3456, BTC: 95420, SOL: 143, USDC: 1, USDT: 1, XRP: 0.55, BNB: 720,
};

export default function ExchangeScreen() {
  const [fromToken, setFromToken] = useState('ETH');
  const [toToken,   setToToken]   = useState('USDC');
  const [fromAmount, setFromAmount] = useState('');

  const fromPrice = mockPrices[fromToken] ?? 1;
  const toPrice   = mockPrices[toToken]   ?? 1;
  const toAmount  = fromAmount ? ((parseFloat(fromAmount) * fromPrice) / toPrice).toFixed(6) : '';
  const fee       = fromAmount ? (parseFloat(fromAmount) * fromPrice * 0.003).toFixed(2) : '0.00';
  const usdValue  = fromAmount ? parseFloat(fromAmount) * fromPrice : 0;

  function handleSwapTokens() {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
  }

  function handleExecuteSwap() {
    if (!fromAmount || parseFloat(fromAmount) <= 0) return;
    Alert.alert(
      'Swap submitted',
      `Swapping ${fromAmount} ${fromToken} → ~${toAmount} ${toToken}`,
      [{ text: 'OK' }],
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        <Text style={s.title}>Swap</Text>
        <Text style={s.subtitle}>Best rates via 1inch & Jupiter aggregators</Text>

        {/* FROM box */}
        <View style={s.tokenBox}>
          <Text style={s.label}>From</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tokenRow}>
            {tokens.filter((t) => t !== toToken).map((t) => (
              <TouchableOpacity
                key={t}
                onPress={() => setFromToken(t)}
                style={[s.chip, fromToken === t && s.chipActive]}
                activeOpacity={0.7}
              >
                <Text style={[s.chipText, fromToken === t && s.chipTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TextInput
            value={fromAmount}
            onChangeText={setFromAmount}
            keyboardType="numeric"
            placeholder="0.00"
            placeholderTextColor={C.muted}
            style={s.amountInput}
          />
          {fromAmount ? (
            <Text style={s.usdEquiv}>
              ≈ ${usdValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </Text>
          ) : null}
        </View>

        {/* Swap direction button */}
        <TouchableOpacity style={s.swapArrow} onPress={handleSwapTokens} activeOpacity={0.8}>
          <Text style={s.swapArrowText}>⇅</Text>
        </TouchableOpacity>

        {/* TO box */}
        <View style={s.tokenBox}>
          <Text style={s.label}>To</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tokenRow}>
            {tokens.filter((t) => t !== fromToken).map((t) => (
              <TouchableOpacity
                key={t}
                onPress={() => setToToken(t)}
                style={[s.chip, toToken === t && s.chipActive]}
                activeOpacity={0.7}
              >
                <Text style={[s.chipText, toToken === t && s.chipTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Text style={[s.amountInput, toAmount ? s.toAmountText : s.placeholderText]}>
            {toAmount || '0.00'}
          </Text>
        </View>

        {/* Quote details */}
        {fromAmount && toAmount ? (
          <View style={s.detailsCard}>
            <View style={s.detailRow}>
              <Text style={s.detailLabel}>Rate</Text>
              <Text style={s.detailValue}>
                1 {fromToken} = {(fromPrice / toPrice).toFixed(4)} {toToken}
              </Text>
            </View>
            <View style={s.detailRow}>
              <Text style={s.detailLabel}>Price impact</Text>
              <Text style={[s.detailValue, { color: C.positive }]}>{'<'}0.12%</Text>
            </View>
            <View style={s.detailRow}>
              <Text style={s.detailLabel}>Protocol fee (0.3%)</Text>
              <Text style={s.detailValue}>${fee}</Text>
            </View>
            <View style={[s.detailRow, s.detailRowLast]}>
              <Text style={s.detailLabel}>You receive</Text>
              <Text style={[s.detailValue, { color: C.lime, fontWeight: '700' }]}>
                ~{toAmount} {toToken}
              </Text>
            </View>
          </View>
        ) : null}

        {/* CTA */}
        <TouchableOpacity
          style={[s.swapBtn, (!fromAmount || parseFloat(fromAmount) <= 0) && s.swapBtnDisabled]}
          onPress={handleExecuteSwap}
          disabled={!fromAmount || parseFloat(fromAmount) <= 0}
          activeOpacity={0.85}
        >
          <Text style={s.swapBtnText}>
            {fromAmount && parseFloat(fromAmount) > 0
              ? `Swap ${fromToken} → ${toToken}`
              : 'Enter amount'}
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
  subtitle: { fontSize: 13, color: C.label, marginBottom: 20 },

  tokenBox: {
    backgroundColor: C.card, borderRadius: 18, padding: 16,
    borderWidth: 1, borderColor: C.border, marginBottom: 4,
  },
  label:     { fontSize: 11, color: C.label, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.8 },
  tokenRow:  { marginBottom: 14 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, marginRight: 6,
    backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: C.border,
  },
  chipActive:     { backgroundColor: C.limeAlpha, borderColor: C.limeBorder },
  chipText:       { fontSize: 13, color: C.muted, fontWeight: '600' },
  chipTextActive: { color: C.lime },
  amountInput:    { fontSize: 30, fontWeight: '800', color: C.text },
  toAmountText:   { color: C.lime },
  placeholderText:{ color: C.muted },
  usdEquiv:       { fontSize: 12, color: C.label, marginTop: 4 },

  swapArrow: {
    alignSelf: 'center', width: 44, height: 44, borderRadius: 14,
    backgroundColor: C.limeAlpha, borderWidth: 1, borderColor: C.limeBorder,
    alignItems: 'center', justifyContent: 'center', marginVertical: 4, zIndex: 2,
  },
  swapArrowText: { fontSize: 20, color: C.lime, fontWeight: '700' },

  detailsCard: {
    backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 14, padding: 14,
    marginTop: 12, borderWidth: 1, borderColor: C.border,
  },
  detailRow:     { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  detailRowLast: { borderTopWidth: 1, borderTopColor: C.border, marginTop: 4, paddingTop: 10 },
  detailLabel:   { fontSize: 12, color: C.label },
  detailValue:   { fontSize: 12, color: C.text, fontWeight: '500' },

  swapBtn: {
    backgroundColor: C.lime, borderRadius: 16, padding: 18,
    alignItems: 'center', marginTop: 20,
  },
  swapBtnDisabled: { opacity: 0.4 },
  swapBtnText:     { fontSize: 16, fontWeight: '700', color: C.navy },
});
