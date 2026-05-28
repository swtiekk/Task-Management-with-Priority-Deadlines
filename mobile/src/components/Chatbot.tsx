import { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import api from '../api/axios';
import { colors } from '../theme';

const ICON_SIZE = 56;
const MARGIN = 16;
const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Position state — starts bottom-right
  const position = useRef(new Animated.ValueXY({
    x: SCREEN_W - ICON_SIZE - MARGIN,
    y: SCREEN_H - ICON_SIZE - MARGIN - 80, // 80 for tab bar
  })).current;

  // Track actual position for clamping
  const posRef = useRef({
    x: SCREEN_W - ICON_SIZE - MARGIN,
    y: SCREEN_H - ICON_SIZE - MARGIN - 80,
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gesture) =>
        Math.abs(gesture.dx) > 2 || Math.abs(gesture.dy) > 2,

      onPanResponderGrant: () => {
        position.setOffset({ x: posRef.current.x, y: posRef.current.y });
        position.setValue({ x: 0, y: 0 });
      },

      onPanResponderMove: Animated.event(
        [null, { dx: position.x, dy: position.y }],
        { useNativeDriver: false }
      ),

      onPanResponderRelease: (_, gesture) => {
        position.flattenOffset();

        // Clamp within screen bounds
        const clampedX = Math.max(MARGIN, Math.min(
          SCREEN_W - ICON_SIZE - MARGIN,
          posRef.current.x + gesture.dx
        ));
        const clampedY = Math.max(MARGIN + 40, Math.min(
          SCREEN_H - ICON_SIZE - MARGIN - 80,
          posRef.current.y + gesture.dy
        ));

        // Snap to nearest edge (left or right)
        const snapX = clampedX + ICON_SIZE / 2 < SCREEN_W / 2
          ? MARGIN
          : SCREEN_W - ICON_SIZE - MARGIN;

        Animated.spring(position, {
          toValue: { x: snapX, y: clampedY },
          useNativeDriver: false,
          bounciness: 6,
        }).start();

        posRef.current = { x: snapX, y: clampedY };
      },
    })
  ).current;

  const sendMessage = async () => {
  const text = input.trim();
  if (!text || loading) return;

  const userMessage: Message = { role: 'user', content: text };
  const updated = [...messages, userMessage];
  setMessages(updated);
  setInput('');
  setLoading(true);

  try {
    const response = await api.post('/chat/', { message: text });
    const botText = response.data?.assistant?.message || 'No response from assistant.';
    setMessages([...updated, { role: 'assistant', content: botText }]);
  } catch (error) {
    console.error('Chatbot request failed', error);
    setMessages([...updated, { role: 'assistant', content: 'Server error.' }]);
  } finally {
    setLoading(false);
  }
};

  return (
    <>
      <Animated.View
        style={[styles.fab, { transform: position.getTranslateTransform() }]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity style={styles.fabInner} onPress={() => setOpen(true)} activeOpacity={0.85}>
          <MaterialIcons name="smart-toy" size={26} color="#FFFFFF" />
        </TouchableOpacity>
      </Animated.View>

      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <KeyboardAvoidingView
          style={styles.modalWrap}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <View style={styles.sheetTitleRow}>
                <MaterialIcons name="smart-toy" size={20} color={colors.teal} />
                <Text style={styles.sheetTitle}>AI Assistant</Text>
              </View>
              <TouchableOpacity onPress={() => setOpen(false)}>
                <MaterialIcons name="close" size={22} color={colors.textHint} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.messageList}
              contentContainerStyle={styles.messageListContent}
            >
              {messages.length === 0 && (
                <Text style={styles.emptyHint}>Ask me anything about your tasks or projects.</Text>
              )}
              {messages.map((msg, i) => (
                <View
                  key={i}
                  style={[styles.bubble, msg.role === 'user' ? styles.bubbleUser : styles.bubbleBot]}
                >
                  <Text style={[styles.bubbleText, msg.role === 'user' && styles.bubbleTextUser]}>
                    {msg.content}
                  </Text>
                </View>
              ))}
              {loading && (
                <View style={[styles.bubble, styles.bubbleBot]}>
                  <Text style={styles.bubbleText}>Thinking…</Text>
                </View>
              )}
            </ScrollView>

            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="Ask something..."
                placeholderTextColor={colors.textHint}
                value={input}
                onChangeText={setInput}
                onSubmitEditing={sendMessage}
                returnKeyType="send"
              />
              <TouchableOpacity
                style={[styles.sendButton, (!input.trim() || loading) && styles.sendButtonDisabled]}
                onPress={sendMessage}
                disabled={!input.trim() || loading}
              >
                <MaterialIcons name="send" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    width: ICON_SIZE,
    height: ICON_SIZE,
    zIndex: 999,
  },
  fabInner: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: ICON_SIZE / 2,
    backgroundColor: colors.teal,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 8,
  },
  modalWrap: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15,23,42,0.45)',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '65%',
    paddingBottom: 20,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  sheetTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sheetTitle: {
    marginLeft: 8,
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    padding: 16,
  },
  emptyHint: {
    textAlign: 'center',
    color: colors.textHint,
    fontSize: 13,
    marginTop: 24,
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 10,
  },
  bubbleUser: {
    backgroundColor: colors.teal,
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  bubbleBot: {
    backgroundColor: colors.surfaceMuted,
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  bubbleTextUser: {
    color: '#FFFFFF',
  },
  inputRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: colors.surfaceMuted,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
    marginRight: 10,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.teal,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.45,
  },
});