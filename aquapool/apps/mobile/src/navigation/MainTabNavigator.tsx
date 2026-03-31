import React, { useRef, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity,
  Animated, Dimensions, StyleSheet, Platform,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';

import WalletScreen from '../screens/main/WalletScreen';
import MarketsScreen from '../screens/main/MarketsScreen';
import ExchangeScreen from '../screens/main/ExchangeScreen';
import EarnScreen from '../screens/main/EarnScreen';
import SendScreen from '../screens/main/SendScreen';

/* ─── Types ────────────────────────────────────────────── */
export type MainTabParamList = {
  Wallet: undefined;
  Markets: undefined;
  Exchange: undefined;
  Earn: undefined;
  Send: undefined;
};

/* ─── Tab config ────────────────────────────────────────── */
type FeatherName = React.ComponentProps<typeof Feather>['name'];

const TABS: { name: keyof MainTabParamList; icon: FeatherName; component: React.ComponentType }[] = [
  { name: 'Wallet',   icon: 'briefcase',   component: WalletScreen },
  { name: 'Markets',  icon: 'trending-up', component: MarketsScreen },
  { name: 'Exchange', icon: 'repeat',      component: ExchangeScreen },
  { name: 'Earn',     icon: 'zap',         component: EarnScreen },
  { name: 'Send',     icon: 'send',        component: SendScreen },
];

/* ─── Design tokens ─────────────────────────────────────── */
const C = {
  bg:          '#050D1A',
  border:      'rgba(255,255,255,0.06)',
  active:      '#BAFF39',   // lime
  activeText:  '#050D1A',   // navy — text on lime pill
  inactive:    '#4B5563',
  indicator:   'rgba(186,255,57,0.14)',
  label:       '#BAFF39',
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 80 : 68;
const TAB_BAR_INNER  = 56;  // pill height
const TAB_WIDTH      = SCREEN_WIDTH / TABS.length;
const PILL_W         = TAB_WIDTH - 16;
const PILL_H         = 44;
const PILL_RADIUS    = 22;

/* ─── Custom tab bar ─────────────────────────────────────── */
function AquaTabBar({ state, navigation }: BottomTabBarProps) {
  // Animated X position of the indicator pill
  const indicatorX = useRef(new Animated.Value(state.index * TAB_WIDTH)).current;

  // Per-tab scale animations for the pressed "pop"
  const scales = useRef(TABS.map(() => new Animated.Value(1))).current;

  useEffect(() => {
    Animated.spring(indicatorX, {
      toValue: state.index * TAB_WIDTH,
      useNativeDriver: true,
      damping: 18,
      stiffness: 200,
      mass: 0.7,
    }).start();
  }, [state.index, indicatorX]);

  const onPress = useCallback((index: number, name: string) => {
    const isFocused = state.index === index;
    if (!isFocused) {
      // Bounce scale on the tapped tab
      Animated.sequence([
        Animated.spring(scales[index], { toValue: 0.82, useNativeDriver: true, speed: 50, bounciness: 0 }),
        Animated.spring(scales[index], { toValue: 1,    useNativeDriver: true, speed: 16, bounciness: 12 }),
      ]).start();
      navigation.navigate(name);
    }
  }, [state.index, navigation, scales]);

  return (
    <View style={styles.container}>
      {/* Sliding background pill indicator */}
      <Animated.View
        style={[
          styles.indicatorPill,
          {
            transform: [{ translateX: indicatorX }],
            width: PILL_W,
            height: PILL_H,
            borderRadius: PILL_RADIUS,
          },
        ]}
      />

      {/* Tab items */}
      {TABS.map((tab, index) => {
        const isFocused = state.index === index;
        return (
          <Animated.View
            key={tab.name}
            style={[styles.tabItem, { transform: [{ scale: scales[index] }] }]}
          >
            <TouchableOpacity
              onPress={() => onPress(index, tab.name)}
              activeOpacity={0.75}
              style={styles.tabTouchable}
              accessibilityRole="button"
              accessibilityLabel={tab.name}
              accessibilityState={isFocused ? { selected: true } : {}}
            >
              <Feather
                name={tab.icon}
                size={isFocused ? 19 : 20}
                color={isFocused ? C.activeText : C.inactive}
                style={isFocused ? styles.iconActive : undefined}
              />
              {isFocused && (
                <Text style={styles.label} numberOfLines={1}>
                  {tab.name}
                </Text>
              )}
            </TouchableOpacity>
          </Animated.View>
        );
      })}
    </View>
  );
}

/* ─── Navigator ─────────────────────────────────────────── */
const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <AquaTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      {TABS.map((tab) => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={tab.component}
        />
      ))}
    </Tab.Navigator>
  );
}

/* ─── Styles ─────────────────────────────────────────────── */
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.bg,
    borderTopWidth: 1,
    borderTopColor: C.border,
    height: TAB_BAR_HEIGHT,
    paddingBottom: Platform.OS === 'ios' ? 20 : 6,
    paddingHorizontal: 0,
    position: 'relative',
    overflow: 'hidden',
  },
  // Pill slides behind the active tab
  indicatorPill: {
    position: 'absolute',
    top: (TAB_BAR_INNER - PILL_H) / 2,
    left: 8,
    backgroundColor: C.active,
    zIndex: 0,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    height: TAB_BAR_INNER,
  },
  tabTouchable: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    height: PILL_H,
    minWidth: 56,
    flexDirection: 'row',
    gap: 5,
  },
  iconActive: {
    // slight shift when text label is present
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: C.activeText,
    letterSpacing: 0.2,
  },
});
