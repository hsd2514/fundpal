import React from 'react';
import clsx from 'clsx';
import { Bot, User } from 'lucide-react';
import api from '../../api/client';
import useStore from '../../store/useStore';
import { useNavigate } from 'react-router-dom';

const MessageBubble = ({ message }) => {
  const isBot = message.sender === 'bot';
  const navigate = useNavigate();
  const { user } = useStore();

  const handleInvest = async () => {
    if (!message.card || !message.card.data) return;
    
    try {
      // Extract allocation from the new data structure
      const payload = {
        allocation: message.card.data.allocation, // Fix: Send only the allocation part
        risk_profile: message.card.subtitle
      };

      await api.post(`/investments?user_id=${user?.id || 'demo'}`, payload);
      
      navigate('/investments');
    } catch (error) {
      console.error("Failed to save investment plan", error);
    }
  };

  return (
    <div className={clsx('flex w-full mb-4', isBot ? 'justify-start' : 'justify-end')}>
      <div className={clsx('flex max-w-[90%] md:max-w-[80%]', isBot ? 'flex-row' : 'flex-row-reverse')}>
        {/* Avatar */}
        <div className={clsx(
          'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1',
          isBot ? 'bg-blue-100 text-blue-600 mr-2' : 'bg-gray-200 text-gray-600 ml-2'
        )}>
          {isBot ? <Bot size={16} /> : <User size={16} />}
        </div>

        {/* Bubble */}
        <div className={clsx(
          'p-3 rounded-2xl text-sm leading-relaxed shadow-sm w-full',
          isBot 
            ? 'bg-white text-gray-800 rounded-tl-none border border-gray-100' 
            : 'bg-blue-600 text-white rounded-tr-none'
        )}>
          <p className="whitespace-pre-wrap">{message.text}</p>
          
          {/* Alerts */}
          {message.alerts && message.alerts.length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-100">
              {message.alerts.map((alert, idx) => (
                <div key={idx} className="flex items-start text-xs text-orange-600 mt-1">
                  <span className="mr-1">⚠️</span>
                  <span>{alert}</span>
                </div>
              ))}
            </div>
          )}

          {/* Rich Investment Card */}
          {message.card && message.card.type === 'investment_allocation' && (
            <div className="mt-3 bg-blue-50 rounded-xl p-4 border border-blue-100">
              {/* ... existing investment card code ... */}
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold text-blue-900 text-sm uppercase tracking-wider">{message.card.title}</h4>
                <span className="text-[10px] bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full">{message.card.subtitle}</span>
              </div>

              {/* Projections Teaser */}
              {message.card.data.projections && (
                <div className="mb-4 bg-white/60 p-2 rounded-lg text-center">
                  <p className="text-xs text-gray-500">Projected Corpus (10 Years)</p>
                  <p className="text-lg font-bold text-green-600">
                    ₹{message.card.data.projections.corpus_10y.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-gray-400">
                    from ₹{message.card.data.projections.monthly_investment.toLocaleString()}/mo
                  </p>
                </div>
              )}

              {/* Allocation List */}
              <div className="space-y-3 mb-4">
                <h5 className="text-xs font-bold text-gray-500 uppercase">Recommended Funds</h5>
                {Object.entries(message.card.data.allocation).map(([asset, details]) => (
                  <div key={asset} className="text-sm border-b border-blue-100 pb-2 last:border-0">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium text-blue-900">{asset}</span>
                      <span className="font-bold text-blue-700">{details.pct}%</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span className="italic">{details.fund}</span>
                      <span className="text-green-600 font-medium">~{details.expected_return} Return</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Steps */}
              {message.card.data.steps && (
                <div className="mb-4">
                   <h5 className="text-xs font-bold text-gray-500 uppercase mb-2">Next Steps</h5>
                   <ul className="list-disc list-inside text-xs text-gray-700 space-y-1">
                     {message.card.data.steps.map((step, i) => (
                       <li key={i}>{step}</li>
                     ))}
                   </ul>
                </div>
              )}

              <button 
                onClick={handleInvest}
                className="w-full bg-blue-600 text-white text-xs font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                Start Investing Now
              </button>
            </div>
          )}

          {/* Transaction Confirmation Card */}
          {message.card && message.card.type === 'transaction_confirmation' && (
            <div className="mt-3 bg-green-50 rounded-xl p-4 border border-green-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-lg">
                  ₹
                </div>
                <div>
                  <h4 className="font-bold text-green-900 text-sm">{message.card.title}</h4>
                  <p className="text-xs text-green-700">{message.card.subtitle}</p>
                </div>
              </div>
              
              <div className="bg-white/60 rounded-lg p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Amount</span>
                  <span className="font-bold text-gray-900">₹{message.card.data.amount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Category</span>
                  <span className="font-medium text-gray-900 capitalize">{message.card.data.category}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Status</span>
                  <span className="font-bold text-green-600 flex items-center gap-1">
                    ✓ {message.card.data.status}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <span className={clsx('text-[10px] block mt-1 opacity-70', isBot ? 'text-gray-400' : 'text-blue-100')}>
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
