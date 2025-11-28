import React, { useState } from 'react';
import { Send, Mic, Plus, Wallet, TrendingUp, Shield } from 'lucide-react';

const ChatInput = ({ onSend, disabled }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim() && !disabled) {
      onSend(text);
      setText('');
    }
  };

  const handleQuickAction = (action) => {
    if (action.type === 'fill') {
      setText(action.text);
    } else {
      onSend(action.text);
    }
  };

  return (
    <div className="p-4 bg-white border-t border-gray-200">
      <div className="flex justify-center flex-wrap gap-2 mb-4">
        <button
          onClick={() => handleQuickAction({ type: 'fill', text: 'Where is my money?' })}
          className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-medium border border-green-100 hover:bg-green-100 transition-colors whitespace-nowrap"
        >
          <Wallet size={14} />
          Wallet
        </button>
        <button
          onClick={() => handleQuickAction({ type: 'fill', text: 'How do I invest?' })}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-100 hover:bg-blue-100 transition-colors whitespace-nowrap"
        >
          <TrendingUp size={14} />
          Invest
        </button>
        <button
          onClick={() => handleQuickAction({ type: 'send', text: 'Check my financial mode' })}
          className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-xs font-medium border border-purple-100 hover:bg-purple-100 transition-colors whitespace-nowrap"
        >
          <Shield size={14} />
          Check Mode
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 max-w-md mx-auto"
      >
        <button
          type="button"
          className="p-2 rounded-full bg-gray-100 text-gray-400 cursor-not-allowed"
          disabled
        >
          <Plus size={24} />
        </button>

        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-gray-100 border-0 rounded-full px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
          disabled={disabled}
        />

        <button
          type="submit"
          disabled={!text.trim() || disabled}
          className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default ChatInput;
