import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Send, Wallet, TrendingUp, Shield } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const ChatInput = ({ onSend, disabled }) => {
  const [text, setText] = useState('');

  const handleSubmit = () => {
    if (text.trim() && !disabled) {
      onSend(text);
      setText('');
    }
  };

  const handleQuickAction = (actionText) => {
    if (actionText.includes('?')) {
      onSend(actionText);
    } else {
      setText(actionText);
    }
  };

  const QuickAction = ({ icon: Icon, label, color, query }) => (
    <TouchableOpacity
      onPress={() => handleQuickAction(query)}
      style={styles.quickAction}
    >
      <LinearGradient
        colors={['rgba(39, 39, 42, 0.8)', 'rgba(24, 24, 27, 0.9)']}
        style={styles.quickActionGradient}
      >
        <Icon size={14} color={color} />
        <Text style={[styles.quickActionText, { color }]}>{label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Quick Actions */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.quickActionsContainer}
      >
        <QuickAction 
          icon={Wallet} 
          label="Wallet" 
          color="#10b981" 
          query="Where is my money?" 
        />
        <QuickAction 
          icon={TrendingUp} 
          label="Invest" 
          color="#3b82f6" 
          query="How do I invest?" 
        />
        <QuickAction 
          icon={Shield} 
          label="Mode" 
          color="#a855f7" 
          query="Check my financial mode" 
        />
      </ScrollView>

      {/* Input Bar */}
      <View style={styles.inputBar}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Ask FundPal..."
          placeholderTextColor="#71717a"
          style={styles.input}
          onSubmitEditing={handleSubmit}
          editable={!disabled}
          multiline
          maxLength={500}
        />
        
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!text.trim() || disabled}
          style={styles.sendButtonWrapper}
        >
          <LinearGradient
            colors={(!text.trim() || disabled) ? ['#3f3f46', '#27272a'] : ['#3b82f6', '#2563eb']}
            style={styles.sendButton}
          >
            <Send size={20} color={(!text.trim() || disabled) ? '#71717a' : 'white'} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#09090b', // Zinc 950
    borderTopWidth: 1,
    borderTopColor: '#27272a',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  quickAction: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#3f3f46',
  },
  quickActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#18181b', // Zinc 900
    borderWidth: 1,
    borderColor: '#3f3f46',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#ffffff',
    fontSize: 14,
    maxHeight: 100,
  },
  sendButtonWrapper: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  sendButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ChatInput;

