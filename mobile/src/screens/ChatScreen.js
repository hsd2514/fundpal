import React, { useRef, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import useChat from '../hooks/useChat';
import MessageBubble from '../components/Chat/MessageBubble';
import ChatInput from '../components/Chat/ChatInput';
import tw from '../lib/tailwind';

const ChatScreen = ({ navigation }) => {
  const { messages, loading, sendMessage } = useChat();
  const scrollViewRef = useRef(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    // Auto scroll to bottom when new messages arrive
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  return (
    <SafeAreaView style={tw`flex-1 bg-background`} edges={['top']}>
      <KeyboardAvoidingView 
        style={tw`flex-1`}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Header */}
        <View style={tw`bg-surface border-b border-gray-800 px-4 py-3`}>
          <Text style={tw`text-white text-lg font-bold`}>FundPal Chat</Text>
          <Text style={tw`text-gray-400 text-xs mt-0.5`}>Your AI Financial Assistant</Text>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={tw`flex-1 bg-background`}
          contentContainerStyle={tw`p-4 pb-4`}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} navigation={navigation} />
          ))}
          
          {loading && (
            <View style={tw`flex-row items-center mb-4`}>
              <View style={tw`bg-gray-800 p-3 rounded-2xl rounded-tl-none border border-gray-700 flex-row items-center`}>
                <ActivityIndicator size="small" color="#3b82f6" />
                <Text style={tw`text-gray-300 text-xs ml-2`}>Thinking...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <ChatInput onSend={sendMessage} disabled={loading} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatScreen;

