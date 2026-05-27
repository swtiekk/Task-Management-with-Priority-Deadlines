import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import api from '../api/axios';
import { colors } from '../theme';

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUser, setLastUser] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let isActive = true;

    const syncUser = async () => {
      try {
        const userStr = await SecureStore.getItemAsync('user');
        const user = userStr ? JSON.parse(userStr) : null;
        const userId = user?.email || (user?.id ? String(user.id) : null);

        if (!isActive) {
          return;
        }

        if (userId !== lastUser) {
          setMessages([]);
          setMessage('');
          setLastUser(userId);
        }
      } catch {
        if (isActive && lastUser !== null) {
          setMessages([]);
          setMessage('');
          setLastUser(null);
        }
      }
    };

    syncUser();
    const intervalId = setInterval(syncUser, 500);

    return () => {
      isActive = false;
      clearInterval(intervalId);
    };
  }, [isOpen, lastUser]);

  const sendMessage = async () => {
    if (!message.trim() || loading) {
      return;
    }

    const nextMessage = message.trim();
    const userMessage: Message = { role: 'user', text: nextMessage };
    setMessages((current) => [...current, userMessage]);
    setMessage('');
    setLoading(true);

    try {
      const response = await api.post('/chat/', { message: nextMessage });
      const botMessage: Message = {
        role: 'assistant',
        text: response.data?.assistant?.message || 'No response from assistant.',
      };
      setMessages((current) => [...current, botMessage]);
    } catch (error) {
      console.error('Chatbot request failed', error);
      setMessages((current) => [
        ...current,
        { role: 'assistant', text: 'Server error.' },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
    }
  };

  return (
    <View pointerEvents="box-none" style={styles.root}>
      {isOpen && (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          pointerEvents="box-none"
          style={styles.windowWrap}
        >
          <View style={styles.window}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>AI Assistant</Text>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <MaterialIcons name="close" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <ScrollView
              ref={scrollRef}
              style={styles.messages}
              contentContainerStyle={styles.messagesContent}
              onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
            >
              {messages.length === 0 && (
                <Text style={styles.emptyText}>Ask anything about your tasks and projects.</Text>
              )}

              {messages.map((item, index) => (
                <View
                  key={`${item.role}-${index}`}
                  style={[
                    styles.bubble,
                    item.role === 'user' ? styles.userBubble : styles.assistantBubble,
                  ]}
                >
                  <Text
                    style={[
                      styles.bubbleText,
                      item.role === 'user' ? styles.userBubbleText : styles.assistantBubbleText,
                    ]}
                  >
                    {item.text}
                  </Text>
                </View>
              ))}

              {loading && (
                <View style={styles.loadingRow}>
                  <ActivityIndicator size="small" color={colors.textHint} />
                  <Text style={styles.loadingText}>AI is typing...</Text>
                </View>
              )}
            </ScrollView>

            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="Type message..."
                placeholderTextColor={colors.textHint}
                value={message}
                onChangeText={setMessage}
                onSubmitEditing={sendMessage}
                returnKeyType="send"
              />
              <TouchableOpacity style={styles.sendButton} onPress={sendMessage} disabled={loading}>
                <MaterialIcons name="send" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      )}

      <TouchableOpacity style={styles.fab} onPress={() => setIsOpen((current) => !current)}>
        <MaterialIcons name="chat" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    padding: 20,
  },
  windowWrap: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  window: {
    width: '100%',
    maxWidth: 360,
    height: 500,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    shadowColor: '#0F172A',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 28,
    elevation: 8,
  },
  header: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  messages: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  messagesContent: {
    padding: 12,
  },
  emptyText: {
    fontSize: 13,
    color: colors.textHint,
    lineHeight: 19,
  },
  bubble: {
    maxWidth: '82%',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#2563EB',
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#F1F5F9',
  },
  bubbleText: {
    fontSize: 13,
    lineHeight: 18,
  },
  userBubbleText: {
    color: '#FFFFFF',
  },
  assistantBubbleText: {
    color: colors.text,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 12,
    color: colors.textHint,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft,
    padding: 10,
    backgroundColor: colors.surface,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
  },
  sendButton: {
    marginLeft: 10,
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 18,
    elevation: 8,
  },
});
