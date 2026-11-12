import React, { useMemo, useState } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TextInput,
  TextInputFocusEvent,
  TextInputProps,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

type Props = TextInputProps & {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  error?: string;
  rightElement?: React.ReactNode;
};

/**
 * Campo com label flutuante e borda que "acende" em ciano ao focar.
 * useNativeDriver não é usado aqui porque animamos layout/cor, não
 * transform/opacity puros — o custo é desprezível para 2-3 campos.
 */
export function FloatingLabelInput({ label, icon, error, rightElement, ...rest }: Props) {
  const [focused, setFocused] = useState(false);
  const [hasValue, setHasValue] = useState(Boolean(rest.value));
  const focusAnim = useMemo(() => new Animated.Value(0), []);

  const animateTo = (value: number) => {
    Animated.timing(focusAnim, {
      toValue: value,
      duration: 180,
      useNativeDriver: false,
    }).start();
  };

  const handleFocus = (e: TextInputFocusEvent) => {
    setFocused(true);
    animateTo(1);
    rest.onFocus?.(e);
  };

  const handleBlur = (e: TextInputFocusEvent) => {
    setFocused(false);
    animateTo(hasValue ? 1 : 0);
    rest.onBlur?.(e);
  };

  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.surfaceBorder, colors.accent],
  });

  const labelTop = focusAnim.interpolate({ inputRange: [0, 1], outputRange: [18, 7] });
  const labelSize = focusAnim.interpolate({ inputRange: [0, 1], outputRange: [15, 11] });
  const labelColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.textMuted, colors.accentSoft],
  });

  return (
    <View style={styles.wrapper}>
      <Animated.View style={[styles.field, { borderColor: error ? colors.danger : borderColor }]}>
        <Ionicons
          name={icon}
          size={18}
          color={focused ? colors.accent : colors.textMuted}
          style={styles.icon}
        />
        <View style={styles.inputArea}>
          <Animated.Text
            style={[styles.label, { top: labelTop, fontSize: labelSize, color: labelColor }]}
          >
            {label}
          </Animated.Text>
          <TextInput
            {...rest}
            placeholder=""
            placeholderTextColor={colors.textMuted}
            style={[styles.input, rest.style]}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChangeText={(text) => {
              setHasValue(text.length > 0);
              rest.onChangeText?.(text);
            }}
          />
        </View>
        {rightElement}
      </Animated.View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: '100%', marginBottom: 14 },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 16,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    height: 58,
  },
  icon: { marginRight: 10 },
  inputArea: { flex: 1, justifyContent: 'center', height: '100%' },
  label: { position: 'absolute', left: 0 },
  input: {
    color: colors.textPrimary,
    fontSize: 16,
    paddingTop: 14,
    height: '100%',
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  },
});
