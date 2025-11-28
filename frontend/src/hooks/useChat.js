import { useState, useCallback } from 'react';
import api from '../api/client';
import useStore from '../store/useStore';

const useChat = () => {
  const { user } = useStore();
  const [messages, setMessages] = useState([
    { id: 'welcome', text: "Hi! I'm FundPal. How can I help you today?", sender: 'bot', timestamp: new Date() }
  ]);
  const [loading, setLoading] = useState(false);

  const sendMessage = useCallback(async (text) => {
    if (!text.trim()) return;

    // Add user message
    const userMsg = { id: Date.now(), text, sender: 'user', timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const userId = user?.id || 'demo_user';
      const response = await api.post(`/chat?user_id=${userId}`, {
        message: text
      });

      const botMsg = {
        id: Date.now() + 1,
        text: response.data.response,
        sender: 'bot',
        timestamp: new Date(),
        alerts: response.data.alerts,
        card: response.data.card
      };
      
      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMsg = {
        id: Date.now() + 1,
        text: "Sorry, I'm having trouble connecting right now. Please try again.",
        sender: 'bot',
        timestamp: new Date(),
        isError: true
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  return { messages, loading, sendMessage };
};

export default useChat;
