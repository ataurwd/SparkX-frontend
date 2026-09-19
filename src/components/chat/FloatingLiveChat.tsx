'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Hash,
  Sparkles,
  Users,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import api from '@/lib/api';

interface ChatMessage {
  _id: string;
  channelName: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  createdAt: string;
}

const CHANNELS = [
  { id: '#general', label: 'general' },
  { id: '#engineering', label: 'engineering' },
  { id: '#product-design', label: 'design' }
];

export const FloatingLiveChat: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [activeChannel, setActiveChannel] = useState('#general');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async (channel: string) => {
    try {
      const res: any = await api.get('/messages', {
        params: { channelName: channel }
      });
      if (res.data) {
        setMessages(res.data);
      }
    } catch (err) {
      // ignore silent polling errors
    }
  };

  // Poll messages every 3 seconds when open or periodically when closed
  useEffect(() => {
    fetchMessages(activeChannel);

    const interval = setInterval(() => {
      fetchMessages(activeChannel);
    }, 3000);

    return () => clearInterval(interval);
  }, [activeChannel]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setUnreadCount(0);
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const messageContent = inputText.trim();
    setInputText('');

    try {
      const res: any = await api.post('/messages', {
        channelName: activeChannel,
        conversationType: 'channel',
        content: messageContent
      });

      if (res.data) {
        setMessages((prev) => [...prev, res.data]);
      }
    } catch (err) {
      // Fallback optimistic display
      const tempMessage: ChatMessage = {
        _id: 'temp-' + Date.now(),
        channelName: activeChannel,
        senderName: user ? `${user.firstName} ${user.lastName}` : 'You',
        content: messageContent,
        createdAt: new Date().toISOString()
      };
      setMessages((prev) => [...prev, tempMessage]);
    }
  };

  return (
    <>
      {/* Floating Chat Window */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '84px',
            right: '24px',
            width: '380px',
            height: '480px',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '10px',
            boxShadow: '0 12px 32px rgba(0,0,0,0.18)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 999,
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: '#6C5CE7',
              color: '#FFFFFF',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#10B981',
                  boxShadow: '0 0 6px #10B981'
                }}
              />
              <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>
                SparkX Live Chat
              </span>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#FFFFFF',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Channel selector bar */}
          <div
            style={{
              display: 'flex',
              padding: '8px 12px',
              backgroundColor: 'var(--color-surface-subtle)',
              borderBottom: '1px solid var(--color-border)',
              gap: '6px'
            }}
          >
            {CHANNELS.map((ch) => (
              <button
                key={ch.id}
                onClick={() => setActiveChannel(ch.id)}
                style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  border: '1px solid',
                  borderColor: activeChannel === ch.id ? '#6C5CE7' : 'transparent',
                  backgroundColor: activeChannel === ch.id ? '#6C5CE7' : 'transparent',
                  color: activeChannel === ch.id ? '#FFFFFF' : 'var(--color-text-secondary)',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {ch.id}
              </button>
            ))}
          </div>

          {/* Messages scroll area */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >
            {messages.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                No messages yet in {activeChannel}. Say hello!
              </div>
            ) : (
              messages.map((msg, i) => {
                const isMe = user ? msg.senderName.includes(user.firstName) : false;
                return (
                  <div
                    key={msg._id || i}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isMe ? 'flex-end' : 'flex-start'
                    }}
                  >
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginBottom: '2px', padding: '0 4px' }}>
                      {msg.senderName} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div
                      style={{
                        maxWidth: '80%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        fontSize: '0.84rem',
                        lineHeight: 1.4,
                        backgroundColor: isMe ? '#6C5CE7' : 'var(--color-surface-subtle)',
                        color: isMe ? '#FFFFFF' : 'var(--color-text-primary)',
                        border: isMe ? 'none' : '1px solid var(--color-border)'
                      }}
                    >
                      {msg.content}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message input bar */}
          <form
            onSubmit={handleSendMessage}
            style={{
              display: 'flex',
              padding: '10px 12px',
              borderTop: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              gap: '8px'
            }}
          >
            <input
              type="text"
              placeholder={`Message ${activeChannel}...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface-subtle)',
                color: 'var(--color-text-primary)',
                fontSize: '0.84rem',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              style={{
                padding: '8px 12px',
                backgroundColor: '#6C5CE7',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: '#6C5CE7',
          color: '#FFFFFF',
          border: 'none',
          borderRadius: '50px',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: 700,
          fontSize: '0.88rem',
          boxShadow: '0 8px 24px rgba(108, 92, 231, 0.4)',
          cursor: 'pointer',
          zIndex: 998,
          transition: 'transform 0.15s ease'
        }}
      >
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#10B981',
            boxShadow: '0 0 6px #10B981'
          }}
        />
        <MessageSquare size={17} />
        <span>Live Chat</span>
      </button>
    </>
  );
};
