'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Hash,
  Send,
  Users,
  Search,
  Plus,
  Paperclip,
  Smile,
  Circle,
  Clock,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/lib/api';

interface MessageItem {
  _id: string;
  conversationType: 'direct' | 'channel';
  channelName: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  createdAt: string;
}

const DEFAULT_CHANNELS = [
  { id: '#general', name: 'general', description: 'Company-wide conversations and updates' },
  { id: '#engineering', name: 'engineering', description: 'Technical architecture, sprint coordination, PRs' },
  { id: '#product-design', name: 'product-design', description: 'UI/UX iterations, design systems, feedback' },
  { id: '#announcements', name: 'announcements', description: 'Executive broadcasts and official company news' }
];

const DIRECT_CONTACTS = [
  { id: 'user-1', name: 'Alex Rivera', role: 'Staff Architect', online: true },
  { id: 'user-2', name: 'Sophia Chen', role: 'Senior Designer', online: true },
  { id: 'user-3', name: 'Marcus Vance', role: 'Frontend Lead', online: false },
  { id: 'user-4', name: 'Elena Rostova', role: 'SDET Lead', online: true }
];

export default function TeamChatPage() {
  const [activeChannel, setActiveChannel] = useState('#general');
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async (channel: string) => {
    try {
      const res = await api.get<MessageItem[]>(`/api/messages?channelName=${encodeURIComponent(channel)}`);
      if (res.data && res.data.length > 0) {
        setMessages(res.data);
      } else {
        // Fallback default message history
        setMessages([
          {
            _id: 'm-1',
            conversationType: 'channel',
            channelName: channel,
            senderId: 'user-1',
            senderName: 'Alex Rivera',
            content: `Welcome to the ${channel} channel! Feel free to discuss sprint milestones and project deliverables here.`,
            createdAt: new Date(Date.now() - 3600000).toISOString()
          },
          {
            _id: 'm-2',
            conversationType: 'channel',
            channelName: channel,
            senderId: 'user-2',
            senderName: 'Sophia Chen',
            content: 'Phase 7 Kanban and Work Velocity modules were deployed with 100% test pass rates.',
            createdAt: new Date(Date.now() - 1800000).toISOString()
          }
        ]);
      }
    } catch {
      setMessages([
        {
          _id: 'm-1',
          conversationType: 'channel',
          channelName: channel,
          senderId: 'user-1',
          senderName: 'Alex Rivera',
          content: `Welcome to ${channel}!`,
          createdAt: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages(activeChannel);
  }, [activeChannel]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const outgoingText = newMessage.trim();
    setNewMessage('');

    // Optimistic UI append
    const tempMessage: MessageItem = {
      _id: 'temp-' + Date.now(),
      conversationType: 'channel',
      channelName: activeChannel,
      senderId: 'me',
      senderName: 'You',
      content: outgoingText,
      createdAt: new Date().toISOString()
    };
    setMessages((prev) => [...prev, tempMessage]);

    try {
      setSending(true);
      await api.post('/api/messages', {
        conversationType: 'channel',
        channelName: activeChannel,
        content: outgoingText
      });
    } catch {
      // Message already in optimistic state
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '20px', height: 'calc(100vh - 140px)', maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
      {/* Left Panel: Channels & Direct Messages */}
      <div
        style={{
          width: '280px',
          flexShrink: 0,
          backgroundColor: 'var(--bg-surface)',
          borderRadius: '10px',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Panel Header */}
        <div style={{ padding: '16px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <MessageSquare size={18} color="#6C5CE7" />
            <h2 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
              Team Communications
            </h2>
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Internal channels and direct messaging
          </span>
        </div>

        {/* Scrollable List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
          {/* Channels Section */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', marginBottom: '8px', paddingLeft: '8px' }}>
              Company Channels
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {DEFAULT_CHANNELS.map((ch) => {
                const isActive = activeChannel === ch.id;
                return (
                  <button
                    key={ch.id}
                    onClick={() => setActiveChannel(ch.id)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: isActive ? 'var(--bg-elevated)' : 'transparent',
                      color: isActive ? '#6C5CE7' : 'var(--text-secondary)',
                      fontWeight: isActive ? 700 : 500,
                      fontSize: '13px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Hash size={15} color={isActive ? '#6C5CE7' : 'var(--text-muted)'} />
                    <span>{ch.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Direct Messages Section */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', marginBottom: '8px', paddingLeft: '8px' }}>
              Team Members
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {DIRECT_CONTACTS.map((user) => (
                <div
                  key={user.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    color: 'var(--text-secondary)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        backgroundColor: '#6C5CE7',
                        color: '#FFFFFF',
                        fontSize: '11px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {user.name[0]}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '13px' }}>{user.name}</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{user.role}</div>
                    </div>
                  </div>

                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: user.online ? '#00B894' : 'var(--text-muted)'
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Center Chat Canvas */}
      <div
        style={{
          flex: 1,
          backgroundColor: 'var(--bg-surface)',
          borderRadius: '10px',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Chat Canvas Header */}
        <div
          style={{
            padding: '14px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Hash size={18} color="#6C5CE7" />
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                {activeChannel.replace('#', '')}
              </h3>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {DEFAULT_CHANNELS.find((c) => c.id === activeChannel)?.description}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Badge variant="neutral" style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>
              <Users size={12} style={{ display: 'inline', marginRight: '4px' }} />
              24 Members
            </Badge>
          </div>
        </div>

        {/* Messages Stream */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {messages.map((msg) => {
            const isMe = msg.senderName === 'You' || msg.senderId === 'me';
            const initials = msg.senderName
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase();

            return (
              <div
                key={msg._id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  maxWidth: '85%',
                  alignSelf: isMe ? 'flex-end' : 'flex-start',
                  flexDirection: isMe ? 'row-reverse' : 'row'
                }}
              >
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    backgroundColor: isMe ? '#6C5CE7' : '#0984E3',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  {initials}
                </div>

                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '4px',
                      justifyContent: isMe ? 'flex-end' : 'flex-start'
                    }}
                  >
                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {msg.senderName}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      backgroundColor: isMe ? '#6C5CE7' : 'var(--bg-elevated)',
                      color: isMe ? '#FFFFFF' : 'var(--text-primary)',
                      border: isMe ? 'none' : '1px solid var(--border-subtle)',
                      fontSize: '13px',
                      lineHeight: 1.5,
                      whiteSpace: 'pre-wrap'
                    }}
                  >
                    {msg.content}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Composer Bar */}
        <form
          onSubmit={handleSendMessage}
          style={{
            padding: '14px 18px',
            borderTop: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-elevated)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={`Message ${activeChannel}...`}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: '6px',
              border: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              fontSize: '13px',
              outline: 'none'
            }}
          />

          <Button
            type="submit"
            variant="primary"
            isLoading={sending}
            style={{
              backgroundColor: '#6C5CE7',
              borderColor: '#6C5CE7',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Send size={15} />
            Send
          </Button>
        </form>
      </div>
    </div>
  );
}
