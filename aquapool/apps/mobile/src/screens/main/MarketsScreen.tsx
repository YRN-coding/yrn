import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const C = {
  bg: '#050D1A', card: '#0A1628', border: 'rgba(255,255,255,0.06)',
  lime: '#BAFF39', limeAlpha: 'rgba(186,255,57,0.1)', limeBorder: 'rgba(186,255,57,0.25)',
  muted: '#4B5563', label: '#6B7280', text: '#F0F4FF',
  positive: '#10B981', negative: '#EF4444',
};

const mockAssets = [
  { rank: 1,  symbol: 'BTC',  name: 'Bitcoin',  price: 95420, change24h:  2.1, marketCap: 1.88e12 },
  { rank: 2,  symbol: 'ETH',  name: 'Ethereum', price:  3456, change24h:  3.4, marketCap: 4.15e11 },
  { rank: 3,  symbol: 'USDT', name: 'Tether',   price:   1.0, change24h:  0.0, marketCap: 1.40e11 },
  { rank: 4,  symbol: 'BNB',  name: 'BNB',      price:   720, change24h: -0.8, marketCap: 1.04e11 },
  { rank: 5,  symbol: 'SOL',  name: 'Solana',   price:   143, change24h: -1.2, marketCap: 6.80e10 },
  { rank: 6,  symbol: 'USDC', name: 'USD Coin', price:   1.0, change24h:  0.0, marketCap: 4.50e10 },
  { rank: 7,  symbol: 'XRP',  name: 'XRP',      price:  0.55, change24h:  0.8, marketCap: 3.10e10 },
  { rank: 8,  symbol: 'DOGE', name: 'Dogecoin', price:  0.12, change24h: -2.1, marketCap: 1.70e10 },
];

function fmtPrice(n: number) {
  if (n >= 1000) return `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  if (n >= 1)    return `$${n.toFixed(2)}`;
  return `$${n.toFixed(4)}`;
}
function fmtMcap(n: number) {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9)  return `$${(n / 1e9).toFixed(1)}B`;
  return `$${(n / 1e6).toFixed(0)}M`;
}

export default function MarketsScreen() {
  const [search, setSearch] = useState('');

  const filtered = mockAssets.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.symbol.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>Markets</Text>
        <View style={s.searchBox}>
          <Text style={s.searchIcon}>⌕</Text>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search assets…"
            placeholderTextColor={C.muted}
            style={s.searchInput}
            autoCapitalize="none"
          />
        </View>
      </View>

      {/* Column labels */}
      <View style={s.colRow}>
        <Text style={[s.colLabel, { flex: 1, marginLeft: 74 }]}>#  Name</Text>
        <Text style={[s.colLabel, { width: 90, textAlign: 'right' }]}>Price</Text>
        <Text style={[s.colLabel, { width: 68, textAlign: 'right', marginRight: 16 }]}>24h</Text>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.symbol}
        contentContainerStyle={s.list}
        renderItem={({ item }) => (
          <TouchableOpacity style={s.row} activeOpacity={0.7}>
            <Text style={s.rankText}>{item.rank}</Text>
            <View style={s.logo}>
              <Text style={s.logoText}>{item.symbol.slice(0, 2)}</Text>
            </View>
            <View style={s.info}>
              <Text style={s.assetName}>{item.name}</Text>
              <Text style={s.assetMcap}>{fmtMcap(item.marketCap)}</Text>
            </View>
            <Text style={s.price}>{fmtPrice(item.price)}</Text>
            <View style={[s.changePill, item.change24h >= 0 ? s.pillGreen : s.pillRed]}>
              <Text style={[s.changeText, item.change24h >= 0 ? s.positive : s.negative]}>
                {item.change24h >= 0 ? '+' : ''}{item.change24h}%
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={s.sep} />}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: C.bg },
  header:     { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  title:      { fontSize: 26, fontWeight: '800', color: C.text, marginBottom: 12 },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: C.card,
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 11,
    borderWidth: 1, borderColor: C.border,
  },
  searchIcon:  { fontSize: 16, color: C.muted, marginRight: 8 },
  searchInput: { flex: 1, color: C.text, fontSize: 14 },
  colRow:      { flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 6 },
  colLabel:    { fontSize: 10, color: C.muted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  list:        { paddingHorizontal: 16, paddingBottom: 32 },
  row: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.card, paddingHorizontal: 12, paddingVertical: 14, borderRadius: 14,
  },
  sep:        { height: 4 },
  rankText:   { width: 22, fontSize: 11, color: C.muted, textAlign: 'center', marginRight: 8 },
  logo: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: C.limeAlpha,
    borderWidth: 1, borderColor: C.limeBorder, alignItems: 'center', justifyContent: 'center', marginRight: 10,
  },
  logoText:   { fontSize: 11, fontWeight: '800', color: C.lime },
  info:       { flex: 1 },
  assetName:  { fontSize: 14, fontWeight: '600', color: C.text },
  assetMcap:  { fontSize: 11, color: C.label, marginTop: 1 },
  price:      { width: 86, fontSize: 13, fontWeight: '600', color: C.text, textAlign: 'right', marginRight: 8 },
  changePill: { width: 60, borderRadius: 8, paddingVertical: 4, alignItems: 'center' },
  pillGreen:  { backgroundColor: 'rgba(16,185,129,0.1)' },
  pillRed:    { backgroundColor: 'rgba(239,68,68,0.1)' },
  changeText: { fontSize: 12, fontWeight: '600' },
  positive:   { color: C.positive },
  negative:   { color: C.negative },
});
