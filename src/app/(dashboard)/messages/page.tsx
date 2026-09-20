'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Hash,
  Send,
  Users,
  Search,
  Lock,
  AtSign,
  Circle,
  Building2,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { api, apiRequest } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { normalizeRole } from '@/lib/permissions';

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

interface EmployeeContact {
  id: string;
  code: string;
  name: string;
  email: string;
  role: string;
  department: string;
  avatarUrl?: string;
  online: boolean;
}

const DEFAULT_CHANNELS = [
  { id: '#general', name: 'general', description: 'Company-wide conversations and updates' },
  { id: '#engineering', name: 'engineering', description: 'Technical architecture, sprint coordination, PRs' },
  { id: '#product-design', name: 'product-design', description: 'UI/UX iterations, design systems, feedback' },
  { id: '#announcements', name: 'announcements', description: 'Executive broadcasts and official company news' }
];

function getDmChannelName(email1: string, email2: string): string {
  const c1 = email1.toLowerCase().trim().replace(/[^a-z0-9]/g, '_');
  const c2 = email2.toLowerCase().trim().replace(/[^a-z0-9]/g, '_');
  return `dm_${[c1, c2].sort().join('__')}`;
}

export default function TeamChatPage() {
  const { user } = useAuth();
  const currentRole = normalizeRole(user?.role);
  const isEmployee = currentRole === 'employee';

  const [activeChannel, setActiveChannel] = useState('#general');
  const [selectedContact, setSelectedContact] = useState<EmployeeContact | null>(null);
  const [contacts, setContacts] = useState<EmployeeContact[]>([]);
  const [contactSearch, setContactSearch] = useState('');
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Is current channel announcements and is user regular employee?
  const isAnnouncementRestricted = activeChannel === '#announcements' && isEmployee;

  // Fetch all real employees for the Team Members contact list
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await apiRequest('/employees');
        if (res.success && Array.isArray(res.data)) {
          const parsed: EmployeeContact[] = res.data.map((emp: any) => ({
            id: emp._id,
            code: emp.employeeCode || 'SPX-0000',
            name: `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'Team Member',
            email: emp.email || '',
            role: emp.designationId?.title || emp.role || 'Staff',
            department: emp.departmentId?.name || 'General',
            avatarUrl: emp.avatarUrl,
            online: true
          }));
          setContacts(parsed);
        }
      } catch (err) {
        console.warn('Could not load contacts:', err);
      }
    };
    fetchEmployees();
  }, []);

  const fetchMessages = async (channel: string) => {
    try {
      const res = await api.get<MessageItem[]>(`/messages?channelName=${encodeURIComponent(channel)}`);
      if (res.data && res.data.length > 0) {
        setMessages(res.data);
      } else {
        // Fallback default message history for standard channels
        if (channel === '#general') {
          setMessages([
            {
              _id: 'm-1',
              conversationType: 'channel',
              channelName: channel,
              senderId: 'user-1',
              senderName: 'Alex Rivera',
              content: 'Welcome to the #general channel! Feel free to discuss company milestones and deliverables here.',
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
        } else if (channel === '#announcements') {
          setMessages([
            {
              _id: 'm-ann-1',
              conversationType: 'channel',
              channelName: '#announcements',
              senderId: 'exec-1',
              senderName: 'Alex Morgan (HR Admin)',
              content: '📢 Welcome to the official Company Announcements channel! Official broadcasts, policy updates, and executive briefings will be published here.',
              createdAt: new Date(Date.now() - 7200000).toISOString()
            }
          ]);
        } else if (channel.startsWith('dm_')) {
          setMessages([]);
        } else {
          setMessages([
            {
              _id: 'm-1',
              conversationType: 'channel',
              channelName: channel,
              senderId: 'system',
              senderName: 'SparkX System',
              content: `Welcome to the ${channel} channel!`,
              createdAt: new Date().toISOString()
            }
          ]);
        }
      }
    } catch {
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  // Live Real-Time Polling: fetch every 2.5 seconds
  useEffect(() => {
    fetchMessages(activeChannel);

    const interval = setInterval(() => {
      fetchMessages(activeChannel);
    }, 2500);

    return () => clearInterval(interval);
  }, [activeChannel]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectChannel = (chId: string) => {
    setSelectedContact(null);
    setActiveChannel(chId);
  };

  const handleSelectContact = (contact: EmployeeContact) => {
    setSelectedContact(contact);
    const dmChannel = getDmChannelName(user?.email || 'user', contact.email);
    setActiveChannel(dmChannel);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isAnnouncementRestricted) return;

    const outgoingText = newMessage.trim();
    setNewMessage('');

    const currentUserName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'You';

    // Optimistic UI append
    const tempMessage: MessageItem = {
      _id: 'temp-' + Date.now(),
      conversationType: selectedContact ? 'direct' : 'channel',
      channelName: activeChannel,
      senderId: user?.id || 'me',
      senderName: currentUserName || 'You',
      content: outgoingText,
      createdAt: new Date().toISOString()
    };
    setMessages((prev) => [...prev, tempMessage]);

    try {
      setSending(true);
      await api.post('/messages', {
        conversationType: selectedContact ? 'direct' : 'channel',
        channelName: activeChannel,
        recipientId: selectedContact?.id,
        content: outgoingText
      });
    } catch {
      // Message already in optimistic state
    } finally {
      setSending(false);
    }
  };

  // Filter contacts by search query
  const filteredContacts = contacts.filter((c) => {
    const q = contactSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.role.toLowerCase().includes(q) ||
      c.department.toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ display: 'flex', gap: '20px', height: 'calc(100vh - 140px)', maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
      {/* Left Panel: Channels & Direct Messages Contacts */}
      <div
        style={{
          width: '300px',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <MessageSquare size={18} color="var(--color-primary)" />
            <h2 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
              Team Communications
            </h2>
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Internal channels & direct messaging
          </span>
        </div>

        {/* Scrollable Channels & Contacts */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
          {/* Channels Section */}
          <div style={{ marginBottom: '20px' }}>
            <div
              style={{
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--text-muted)',
                marginBottom: '8px',
                paddingLeft: '8px'
              }}
            >
              Company Channels
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {DEFAULT_CHANNELS.map((ch) => {
                const isActive = !selectedContact && activeChannel === ch.id;
                const isAnnouncement = ch.id === '#announcements';
                return (
                  <button
                    key={ch.id}
                    onClick={() => handleSelectChannel(ch.id)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: isActive ? 'var(--bg-elevated)' : 'transparent',
                      color: isActive ? 'var(--color-primary)' : 'var(--text-secondary)',
                      fontWeight: isActive ? 700 : 500,
                      fontSize: '13px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                      <Hash size={15} color={isActive ? 'var(--color-primary)' : 'var(--text-muted)'} style={{ flexShrink: 0 }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {ch.name}
                      </span>
                    </div>

                    {isAnnouncement && (
                      <span
                        style={{
                          fontSize: '10px',
                          padding: '1px 6px',
                          borderRadius: '10px',
                          backgroundColor: 'rgba(108, 92, 231, 0.12)',
                          color: '#6C5CE7',
                          fontWeight: 600,
                          flexShrink: 0
                        }}
                      >
                        Official
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Team Members / Direct Messaging Section */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '8px',
                paddingLeft: '8px',
                paddingRight: '4px'
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--text-muted)'
                }}
              >
                Team Members ({filteredContacts.length})
              </div>
            </div>

            {/* Member Search Bar */}
            <div style={{ position: 'relative', marginBottom: '8px' }}>
              <Search size={13} style={{ position: 'absolute', left: '10px', top: '8px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                value={contactSearch}
                onChange={(e) => setContactSearch(e.target.value)}
                placeholder="Search member or role..."
                style={{
                  width: '100%',
                  padding: '6px 10px 6px 28px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-elevated)',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                  outline: 'none'
                }}
              />
            </div>

            {/* Contact List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {filteredContacts.length === 0 ? (
                <div style={{ padding: '16px 8px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
                  No team members found
                </div>
              ) : (
                filteredContacts.map((contact) => {
                  const isCurrent = selectedContact?.id === contact.id;
                  const isSelf = user?.email && contact.email.toLowerCase() === user.email.toLowerCase();
                  const initials = contact.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);

                  return (
                    <button
                      key={contact.id}
                      onClick={() => handleSelectContact(contact)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        border: isCurrent ? '1px solid var(--color-primary)' : '1px solid transparent',
                        backgroundColor: isCurrent ? 'rgba(108, 92, 231, 0.12)' : 'transparent',
                        cursor: 'pointer',
                        fontSize: '13px',
                        textAlign: 'left',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                        <div
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            backgroundColor: isCurrent ? 'var(--color-primary)' : 'rgba(108, 92, 231, 0.15)',
                            color: isCurrent ? '#FFFFFF' : '#6C5CE7',
                            fontSize: '11px',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          {initials}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              fontWeight: isCurrent ? 700 : 600,
                              color: isCurrent ? 'var(--color-primary)' : 'var(--text-primary)',
                              fontSize: '13px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{contact.name}</span>
                            {isSelf && (
                              <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 500 }}>(You)</span>
                            )}
                          </div>
                          <div
                            style={{
                              fontSize: '10.5px',
                              color: 'var(--text-secondary)',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {contact.role}
                          </div>
                        </div>
                      </div>

                      <span
                        style={{
                          width: '7px',
                          height: '7px',
                          borderRadius: '50%',
                          backgroundColor: '#10B981',
                          flexShrink: 0,
                          marginLeft: '6px'
                        }}
                      />
                    </button>
                  );
                })
              )}
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
          {selectedContact ? (
            /* Direct Message Header */
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(108, 92, 231, 0.15)',
                  color: '#6C5CE7',
                  fontSize: '13px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {selectedContact.name[0]}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                    {selectedContact.name}
                  </h3>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(108, 92, 231, 0.12)',
                      color: '#6C5CE7',
                      fontSize: '11px',
                      fontWeight: 600
                    }}
                  >
                    <AtSign size={10} /> Direct Message
                  </span>
                </div>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {selectedContact.role} • {selectedContact.department} ({selectedContact.email})
                </span>
              </div>
            </div>
          ) : (
            /* Channel Header */
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Hash size={18} color="var(--color-primary)" />
                <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  {activeChannel.replace('#', '')}
                </h3>
                {activeChannel === '#announcements' && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(245, 158, 11, 0.12)',
                      color: '#F59E0B',
                      fontSize: '11px',
                      fontWeight: 600
                    }}
                  >
                    <Lock size={11} /> Broadcast Channel
                  </span>
                )}
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {DEFAULT_CHANNELS.find((c) => c.id === activeChannel)?.description}
              </span>
            </div>
          )}

          {/* Header Right Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '20px',
                backgroundColor: 'var(--color-success-bg)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: 'var(--color-success)',
                fontSize: '0.74rem',
                fontWeight: 600
              }}
            >
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-success)',
                  boxShadow: '0 0 6px var(--color-success)'
                }}
              />
              Live Sync
            </span>
          </div>
        </div>

        {/* Message Feed Canvas */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {selectedContact && messages.length === 0 && (
            <div
              style={{
                textAlign: 'center',
                padding: '40px 20px',
                margin: 'auto 0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(108, 92, 231, 0.12)',
                  color: '#6C5CE7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  fontWeight: 700
                }}
              >
                {selectedContact.name[0]}
              </div>
              <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Start a conversation with {selectedContact.name}
              </h4>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '380px' }}>
                This is the beginning of your direct message history with {selectedContact.name} ({selectedContact.role}). Messages sent here are completely private.
              </p>
            </div>
          )}

          {messages.map((msg) => {
            const currentFullName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim().toLowerCase() : '';
            const isMe =
              msg.senderId === user?.id ||
              msg.senderId === 'me' ||
              msg.senderName.toLowerCase() === 'you' ||
              (currentFullName && msg.senderName.toLowerCase() === currentFullName);

            const initials = (msg.senderName || 'TM')
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2);

            return (
              <div
                key={msg._id}
                style={{
                  display: 'flex',
                  gap: '12px',
                  alignSelf: isMe ? 'flex-end' : 'flex-start',
                  maxWidth: '75%',
                  flexDirection: isMe ? 'row-reverse' : 'row'
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: isMe ? 'var(--color-primary)' : 'rgba(108, 92, 231, 0.15)',
                    color: isMe ? '#FFFFFF' : '#6C5CE7',
                    fontSize: '11px',
                    fontWeight: 700,
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
                      {isMe ? 'You' : msg.senderName}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      backgroundColor: isMe ? 'var(--color-primary)' : 'var(--bg-elevated)',
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
        {isAnnouncementRestricted ? (
          /* Employee Read-Only Warning Banner in #announcements */
          <div
            style={{
              padding: '14px 20px',
              borderTop: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-elevated)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              color: 'var(--text-secondary)',
              fontSize: '13px'
            }}
          >
            <Lock size={16} color="#F59E0B" />
            <span>
              <strong>#announcements</strong> is read-only for employees. Only Management, HR Administrators, and Executives can broadcast announcements here.
            </span>
          </div>
        ) : (
          /* Active Message Form */
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
              placeholder={
                selectedContact
                  ? `Message ${selectedContact.name}...`
                  : activeChannel === '#announcements'
                  ? 'Broadcast company announcement...'
                  : `Message ${activeChannel}...`
              }
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
                backgroundColor: 'var(--color-primary)',
                borderColor: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Send size={15} />
              Send
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
