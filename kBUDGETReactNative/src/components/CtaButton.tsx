import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
}

const CtaButton: React.FC<Props> = ({ label, icon = 'add', onPress }) => {
  return (
    <Pressable style={({ pressed }) => [styles.button, pressed && styles.pressed]} onPress={onPress}>
      <Text style={styles.label}>{label}</Text>
      <Ionicons name={icon} size={20} color="#0b111a" />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#35c759',
    borderRadius: 999,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8
  },
  pressed: {
    opacity: 0.9
  },
  label: {
    color: '#0b111a',
    fontSize: 16,
    fontWeight: '600'
  }
});

export default CtaButton;
