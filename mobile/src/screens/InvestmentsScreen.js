import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { TrendingUp, PieChart, ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react-native';
import tw from '../lib/tailwind';
import api from '../api/client';
import useStore from '../store/useStore';

const InvestmentsScreen = ({ navigation }) => {
  const { user } = useStore();
  const [portfolio, setPortfolio] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchPortfolio = async () => {
    try {
      const response = await api.get(`/portfolio?user_id=${user?.id || 'demo'}`);
      setPortfolio(response.data);
    } catch (error) {
      console.error("Failed to fetch portfolio", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPortfolio();
    setRefreshing(false);
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchPortfolio();
    }, [user])
  );

  const formatCurrency = (amount) => {
    return `₹${amount?.toLocaleString('en-IN') || '0'}`;
  };

  const getPnlColor = (pnl) => {
    if (pnl > 0) return '#10b981'; // Green
    if (pnl < 0) return '#ef4444'; // Red
    return '#a1a1aa'; // Gray
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Portfolio</Text>
          <TouchableOpacity style={styles.walletBtn}>
            <Wallet size={20} color="#e4e4e7" />
          </TouchableOpacity>
        </View>

        {/* Portfolio Summary Card */}
        <LinearGradient
          colors={['#18181b', '#09090b']}
          style={styles.summaryCard}
        >
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryLabel}>Total Value</Text>
            <View style={[styles.pnlBadge, { backgroundColor: portfolio?.total_pnl >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' }]}>
              {portfolio?.total_pnl >= 0 ? <ArrowUpRight size={14} color="#10b981" /> : <ArrowDownRight size={14} color="#ef4444" />}
              <Text style={[styles.pnlText, { color: getPnlColor(portfolio?.total_pnl) }]}>
                {portfolio?.total_pnl >= 0 ? '+' : ''}{formatCurrency(portfolio?.total_pnl)}
              </Text>
            </View>
          </View>
          
          <Text style={styles.totalValue}>{formatCurrency(portfolio?.total_value)}</Text>
          
          <View style={styles.summaryFooter}>
            <View>
              <Text style={styles.footerLabel}>Invested</Text>
              <Text style={styles.footerValue}>{formatCurrency(portfolio?.total_invested)}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.footerLabel}>Returns</Text>
              <Text style={[styles.footerValue, { color: getPnlColor(portfolio?.total_pnl) }]}>
                {portfolio?.total_pnl >= 0 ? '+' : ''}{portfolio?.total_pnl ? ((portfolio.total_pnl / portfolio.total_invested) * 100).toFixed(2) : '0.00'}%
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Holdings List */}
        <Text style={styles.sectionTitle}>Holdings</Text>
        
        {portfolio?.holdings?.length > 0 ? (
          <View style={styles.holdingsList}>
            {portfolio.holdings.map((item, index) => (
              <View key={index} style={styles.holdingItem}>
                <View style={styles.holdingLeft}>
                  <View style={styles.iconBox}>
                    <TrendingUp size={20} color="#60a5fa" />
                  </View>
                  <View>
                    <Text style={styles.symbolText}>{item.symbol}</Text>
                    <Text style={styles.qtyText}>{item.quantity} units • Avg {formatCurrency(item.average_price)}</Text>
                  </View>
                </View>
                
                <View style={styles.holdingRight}>
                  <Text style={styles.itemValue}>{formatCurrency(item.current_value)}</Text>
                  <Text style={[styles.itemPnl, { color: getPnlColor(item.pnl) }]}>
                    {item.pnl >= 0 ? '+' : ''}{formatCurrency(item.pnl)} ({item.pnl_pct}%)
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <PieChart size={48} color="#3f3f46" />
            <Text style={styles.emptyText}>No investments yet</Text>
            <Text style={styles.emptySub}>Start a SIP or make a lumpsum investment to see your portfolio grow.</Text>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
  },
  walletBtn: {
    padding: 8,
    backgroundColor: '#27272a',
    borderRadius: 12,
  },
  summaryCard: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#27272a',
    marginBottom: 32,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    color: '#a1a1aa',
    fontSize: 14,
  },
  pnlBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  pnlText: {
    fontSize: 12,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 36,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 24,
  },
  summaryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#27272a',
    paddingTop: 16,
  },
  footerLabel: {
    color: '#71717a',
    fontSize: 12,
    marginBottom: 4,
  },
  footerValue: {
    color: '#e4e4e7',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  holdingsList: {
    gap: 12,
  },
  holdingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#18181b',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  holdingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(96, 165, 250, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  symbolText: {
    color: '#e4e4e7',
    fontSize: 15,
    fontWeight: '600',
  },
  qtyText: {
    color: '#a1a1aa',
    fontSize: 12,
    marginTop: 2,
  },
  holdingRight: {
    alignItems: 'flex-end',
  },
  itemValue: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  itemPnl: {
    fontSize: 12,
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 12,
  },
  emptyText: {
    color: '#e4e4e7',
    fontSize: 16,
    fontWeight: '600',
  },
  emptySub: {
    color: '#71717a',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default InvestmentsScreen;
