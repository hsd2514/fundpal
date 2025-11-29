import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Bot, User, Check, TrendingUp, Shield, ArrowRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Markdown from 'react-native-markdown-display';
import useStore from '../../store/useStore';
import api from '../../api/client';

const { width } = Dimensions.get('window');

const MessageBubble = ({ message, navigation }) => {
  const { user } = useStore();
  const isBot = message.sender === 'bot';

  const handleInvest = async () => {
    if (!message.card || !message.card.data) return;
    try {
      const payload = {
        allocation: message.card.data.allocation,
        risk_profile: message.card.subtitle,
        total_amount: message.card.data.projections?.monthly_investment || 0
      };
      await api.post(`/investments?user_id=${user?.id || 'demo'}`, payload);
      if (navigation) navigation.navigate('Invest');
    } catch (error) {
      console.error("Failed to save investment plan", error);
    }
  };

  const formatTime = (timestamp) => {
    try {
      return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  // Gradients
  const botGradient = ['#27272a', '#18181b']; // Zinc 800 -> 900
  const userGradient = ['#6366f1', '#4f46e5']; // Indigo 500 -> 600
  const cardGradient = ['#18181b', '#09090b']; // Zinc 900 -> 950

  return (
    <View style={[styles.container, isBot ? styles.leftAlign : styles.rightAlign]}>
      <View style={[styles.bubbleWrapper, isBot ? styles.row : styles.rowReverse]}>
        
        {/* Avatar */}
        <View style={[styles.avatarContainer, isBot ? styles.botAvatar : styles.userAvatar]}>
          {isBot ? (
            <Bot size={18} color="#60a5fa" />
          ) : (
            <User size={18} color="#e5e7eb" />
          )}
        </View>

        {/* Bubble Content */}
        <View style={styles.contentContainer}>
          <LinearGradient
            colors={isBot ? botGradient : userGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.bubble, isBot ? styles.botBubble : styles.userBubble]}
          >
            {/* Message Text */}
            <View style={[styles.textContainer, isBot ? styles.botTextContainer : styles.userTextContainer]}>
              <Markdown style={markdownStyles(isBot)}>
                {message.text || "..."}
              </Markdown>
            </View>

            {/* Alerts */}
            {message.alerts && message.alerts.length > 0 && (
              <View style={styles.alertsContainer}>
                {message.alerts.map((alert, idx) => (
                  <View key={idx} style={styles.alertRow}>
                    <Shield size={12} color="#fb923c" style={{ marginTop: 2 }} />
                    <Text style={styles.alertText}>{alert}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Investment Card */}
            {message.card && message.card.type === 'investment_allocation' && (
              <View style={styles.cardContainer}>
                <LinearGradient
                  colors={cardGradient}
                  style={styles.card}
                >
                  <View style={styles.cardHeader}>
                    <View>
                      <Text style={styles.cardTitle}>{message.card.title}</Text>
                      <Text style={styles.cardSubtitle}>{message.card.subtitle}</Text>
                    </View>
                    <View style={styles.iconBadge}>
                      <TrendingUp size={16} color="#60a5fa" />
                    </View>
                  </View>

                  {/* Projections */}
                  {message.card.data.projections && (
                    <View style={styles.projectionBox}>
                      <Text style={styles.projectionLabel}>Projected Corpus (10Y)</Text>
                      <Text style={styles.projectionValue}>
                        ₹{message.card.data.projections.corpus_10y?.toLocaleString() || '0'}
                      </Text>
                      <Text style={styles.projectionSub}>
                        @ ₹{message.card.data.projections.monthly_investment?.toLocaleString() || '0'}/mo
                      </Text>
                    </View>
                  )}

                  {/* Allocation List */}
                  {message.card.data.allocation && (
                    <View style={styles.allocationList}>
                      {Object.entries(message.card.data.allocation).map(([asset, details]) => (
                        <View key={asset} style={styles.allocationRow}>
                          <View style={styles.allocationInfo}>
                            <Text style={styles.assetName}>{asset}</Text>
                            <Text style={styles.fundName}>{details.fund}</Text>
                          </View>
                          <Text style={styles.assetPct}>{details.pct}%</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  <TouchableOpacity onPress={handleInvest} style={styles.actionButton}>
                    <LinearGradient
                      colors={['#3b82f6', '#2563eb']}
                      style={styles.actionButtonGradient}
                    >
                      <Text style={styles.actionButtonText}>Start Investing</Text>
                      <ArrowRight size={14} color="white" />
                    </LinearGradient>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            )}

            {/* Transaction Card */}
            {message.card && message.card.type === 'transaction_confirmation' && (
              <View style={styles.cardContainer}>
                <LinearGradient
                  colors={cardGradient}
                  style={styles.card}
                >
                  <View style={styles.cardHeader}>
                    <View>
                      <Text style={styles.cardTitle}>{message.card.title}</Text>
                      <Text style={styles.cardSubtitle}>Successfully Logged</Text>
                    </View>
                    <View style={[styles.iconBadge, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                      <Check size={16} color="#10b981" />
                    </View>
                  </View>

                  <View style={styles.txnDetails}>
                    <View style={styles.txnRow}>
                      <Text style={styles.txnLabel}>Amount</Text>
                      <Text style={styles.txnValue}>₹{message.card.data.amount}</Text>
                    </View>
                    <View style={styles.txnRow}>
                      <Text style={styles.txnLabel}>Category</Text>
                      <Text style={styles.txnValue}>{message.card.data.category}</Text>
                    </View>
                    <View style={styles.txnRow}>
                      <Text style={styles.txnLabel}>Status</Text>
                      <Text style={[styles.txnValue, { color: '#10b981' }]}>{message.card.data.status}</Text>
                    </View>
                  </View>
                </LinearGradient>
              </View>
            )}

            <Text style={[styles.timestamp, isBot ? styles.botTimestamp : styles.userTimestamp]}>
              {formatTime(message.timestamp)}
            </Text>
          </LinearGradient>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  leftAlign: { alignItems: 'flex-start' },
  rightAlign: { alignItems: 'flex-end' },
  bubbleWrapper: {
    flexDirection: 'row',
    maxWidth: '85%',
    alignItems: 'flex-end',
  },
  row: { flexDirection: 'row' },
  rowReverse: { flexDirection: 'row-reverse' },
  
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  botAvatar: {
    backgroundColor: '#1f2937',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#374151',
  },
  userAvatar: {
    backgroundColor: '#3730a3',
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#4f46e5',
  },

  contentContainer: {
    flex: 1,
  },
  bubble: {
    padding: 16,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  botBubble: {
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#3f3f46',
  },
  userBubble: {
    borderTopRightRadius: 4,
  },

  text: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: 'System',
  },
  botText: { color: '#e4e4e7' },
  userText: { color: '#ffffff' },

  timestamp: {
    fontSize: 10,
    marginTop: 6,
    alignSelf: 'flex-end',
  },
  botTimestamp: { color: '#71717a' },
  userTimestamp: { color: 'rgba(255,255,255,0.7)' },

  // Alerts
  alertsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  alertRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 4,
  },
  alertText: {
    color: '#fb923c',
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
  },

  // Cards
  cardContainer: {
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#3f3f46',
  },
  card: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  cardTitle: {
    color: '#60a5fa',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  cardSubtitle: {
    color: '#a1a1aa',
    fontSize: 12,
    marginTop: 2,
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(96, 165, 250, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Projections
  projectionBox: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  projectionLabel: {
    color: '#a1a1aa',
    fontSize: 11,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  projectionValue: {
    color: '#10b981',
    fontSize: 20,
    fontWeight: '700',
  },
  projectionSub: {
    color: '#71717a',
    fontSize: 10,
    marginTop: 2,
  },

  // Allocation
  allocationList: {
    marginBottom: 16,
  },
  allocationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
  },
  allocationInfo: {
    flex: 1,
    marginRight: 12,
  },
  assetName: {
    color: '#e4e4e7',
    fontSize: 13,
    fontWeight: '600',
  },
  fundName: {
    color: '#a1a1aa',
    fontSize: 11,
    marginTop: 1,
  },
  assetPct: {
    color: '#60a5fa',
    fontSize: 13,
    fontWeight: '700',
  },

  // Button
  actionButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '700',
  },

  // Transaction Details
  txnDetails: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 12,
    padding: 12,
  },
  txnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  txnLabel: {
    color: '#a1a1aa',
    fontSize: 13,
  },
  txnValue: {
    color: '#e4e4e7',
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});

const markdownStyles = (isBot) => ({
  body: {
    color: isBot ? '#e4e4e7' : '#ffffff',
    fontSize: 15,
    lineHeight: 22,
    fontFamily: 'System',
  },
  strong: {
    fontWeight: '700',
    color: isBot ? '#60a5fa' : '#ffffff',
  },
  link: {
    color: '#60a5fa',
  },
  list_item: {
    marginVertical: 2,
  },
  bullet_list: {
    marginVertical: 4,
  },
});

export default MessageBubble;
