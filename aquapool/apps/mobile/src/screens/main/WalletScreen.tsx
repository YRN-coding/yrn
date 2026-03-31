import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const C = {
  bg: '#050D1A',
  card: '#0A1628',
  border: 'rgba(255,255,255,0.06)',
  lime: '#BAFF39',
  limeAlpha: 'rgba(186,255,57,0.12)',
  limeBorder: 'rgba(186,255,57,0.3)',
  cyan: '#00E5FF',
  muted: '#4B5563',
  label: '#6B7280',
  text: '#F0F4FF',
  positive: '#10B981',
  negative: '#EF4444',
};

const mockWallets = [
  { id: '1', network: 'ETHEREUM', address: '0x1234...5678', isDefault: true },
  { id: '2', network: 'SOLANA',   address: 'Ax3k...9mNp', isDefault: false },
];

const mockBalances = [
  { symbol: 'ETH',  name: 'Ethereum', amount: '1.245',  usdValue: 4301.45, change24h:  2.3, abbr: 'ET' },
  { symbol: 'USDC', name: 'USD Coin', amount: '850.00', usdValue:  850.00, change24h:  0.0, abbr: 'US' },
  { symbol: 'SOL',  name: 'Solana',   amount: '12.5',   usdValue: 1787.50, change24h: -1.2, abbr: 'SO' },
  { symbol: 'XRP',  name: 'XRP',      amount: '500',    usdValue:  275.00, change24h:  0.8, abbr: 'XR' },
];

const totalValue = mockBalances.reduce((sum, b) => sum + b.usdValue, 0);

export default function WalletScreen() {
  const [activeWallet, setActiveWallet] = useState(mockWallets[0]!);

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content}>

        {/* Header */}
        <View style={s.header}>
          <Text style={s.title}>Wallet</Text>
        </View>

        {/* Total balance */}
        <View style={s.balanceCard}>
          <Text style={s.balanceLabel}>Total Balance</Text>
          <Text style={s.balanceAmount}>
            ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </Text>
          <View style={s.changeRow}>
            <View style={s.changePill}>
              <Text style={s.changeText}>+$124.50 · +3.04% today</Text>
            </View>
          </View>
        </View>

        {/* Action buttons */}
        <View style={s.actionRow}>
          {[
            { label: 'Send',    icon: '↗' },
            { label: 'Receive', icon: '↙' },
            { label: 'Swap',    icon: '⇄' },
            { label: 'Buy',     icon: '+' },
          ].map((a) => (
            <TouchableOpacity key={a.label} style={s.actionBtn} activeOpacity={0.7}>
              <View style={s.actionIconWrap}>
                <Text style={s.actionIcon}>{a.icon}</Text>
              </View>
              <Text style={s.actionLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Wallet selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.walletScroll}>
          {mockWallets.map((w) => (
            <TouchableOpacity
              key={w.id}
              onPress={() => setActiveWallet(w)}
              style={[s.walletChip, activeWallet.id === w.id && s.walletChipActive]}
              activeOpacity={0.7}
            >
              <Text style={[s.walletNetwork, activeWallet.id === w.id && s.walletNetworkActive]}>
                {w.network}
              </Text>
              <Text style={s.walletAddress}>{w.address}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Token list */}
        <View style={s.tokenCard}>
          <Text style={s.sectionTitle}>Token Balances</Text>
          {mockBalances.map((token, i) => (
            <View key={token.symbol} style={[s.tokenRow, i < mockBalances.length - 1 && s.tokenBorder]}>
              <View style={s.tokenLeft}>
                <View style={s.tokenLogo}>
                  <Text style={s.tokenLogoText}>{token.abbr}</Text>
                </View>
                <View>
                  <Text style={s.tokenName}>{token.name}</Text>
                  <Text style={s.tokenAmount}>{token.amount} {token.symbol}</Text>
                </View>
              </View>
              <View style={s.tokenRight}>
                <Text style={s.tokenValue}>${token.usdValue.toLocaleString()}</Text>
                <Text style={[s.tokenChange, token.change24h >= 0 ? s.positive : s.negative]}>
                  {token.change24h >= 0 ? '+' : ''}{token.change24h}%
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: C.bg },
  scroll:        { flex: 1 },
  content:       { padding: 16, paddingBottom: 32 },
  header:        { marginBottom: 16 },
  title:         { fontSize: 26, fontWeight: '800', color: C.text },

  balanceCard: {
    backgroundColor: C.card, borderRadius: 20, padding: 24, marginBottom: 16,
    borderWidth: 1, borderColor: C.border,
  },
  balanceLabel:  { fontSize: 12, color: C.label, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 },
  balanceAmount: { fontSize: 38, fontWeight: '800', color: C.text, marginBottom: 10 },
  changeRow:     { flexDirection: 'row' },
  changePill: {
    backgroundColor: 'rgba(16,185,129,0.12)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: 'rgba(16,185,129,0.25)',
  },
  changeText:    { fontSize: 12, color: C.positive, fontWeight: '600' },

  actionRow:     { flexDirection: 'row', gap: 8, marginBottom: 16 },
  actionBtn:     { flex: 1, alignItems: 'center', gap: 6 },
  actionIconWrap: {
    width: 52, height: 52, borderRadius: 16, backgroundColor: C.limeAlpha,
    borderWidth: 1, borderColor: C.limeBorder, alignItems: 'center', justifyContent: 'center',
  },
  actionIcon:    { fontSize: 18, color: C.lime, fontWeight: '700' },
  actionLabel:   { fontSize: 11, color: C.label, fontWeight: '500' },

  walletScroll:  { marginBottom: 16 },
  walletChip: {
    backgroundColor: C.card, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12,
    marginRight: 8, borderWidth: 1, borderColor: C.border,
  },
  walletChipActive:    { borderColor: C.lime, backgroundColor: C.limeAlpha },
  walletNetwork:       { fontSize: 12, fontWeight: '700', color: C.label, letterSpacing: 0.5 },
  walletNetworkActive: { color: C.lime },
  walletAddress:       { fontSize: 11, color: C.muted, fontFamily: 'monospace', marginTop: 2 },

  tokenCard: {
    backgroundColor: C.card, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: C.border,
  },
  sectionTitle:  { fontSize: 14, fontWeight: '700', color: C.text, marginBottom: 12, letterSpacing: 0.3 },
  tokenRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14,
  },
  tokenBorder:   { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' },
  tokenLeft:     { flexDirection: 'row', alignItems: 'center', gap: 12 },
  tokenLogo: {
    width: 42, height: 42, borderRadius: 21, backgroundColor: C.limeAlpha,
    borderWidth: 1, borderColor: C.limeBorder, alignItems: 'center', justifyContent: 'center',
  },
  tokenLogoText: { fontSize: 11, fontWeight: '800', color: C.lime },
  tokenName:     { fontSize: 14, fontWeight: '600', color: C.text },
  tokenAmount:   { fontSize: 12, color: C.label, marginTop: 1 },
  tokenRight:    { alignItems: 'flex-end' },
  tokenValue:    { fontSize: 14, fontWeight: '600', color: C.text },
  tokenChange:   { fontSize: 12, marginTop: 1, fontWeight: '500' },
  positive:      { color: C.positive },
  negative:      { color: C.negative },
});
