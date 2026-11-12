import React, { useEffect, useMemo, useState } from 'react';
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { AnimatedOrbBackground } from '../components/AnimatedOrbBackground';
import { FloatingLabelInput } from '../components/FloatingLabelInput';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors } from '../theme/colors';

/**
 * Login institucional do Sinal.claro.
 *
 * Importante: este acesso NÃO é o fluxo do atendimento (RNE/RF do documento
 * de especificação). O app de atendimento não tem contas — o aparelho
 * pertence ao ponto de atendimento, e usuário surdo e atendente dividem a
 * mesma sessão sem autenticação (seção 17.2). Esta tela é a porta de entrada
 * de um painel separado, para a instituição administrar catálogo de sinais/
 * frases, acompanhar telemetria agregada e gerenciar versões de modelo —
 * apenas a gestão por trás do app, nunca o atendimento em si.
 */

type FieldErrors = { email?: string; password?: string };

const ENTRANCE_ITEMS = 6;

export default function InstitutionalLoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  const shake = useMemo(() => new Animated.Value(0), []);
  const entranceValues = useMemo(
    () => Array.from({ length: ENTRANCE_ITEMS }, () => new Animated.Value(0)),
    [],
  );

  useEffect(() => {
    Animated.stagger(
      90,
      entranceValues.map((value) =>
        Animated.timing(value, {
          toValue: 1,
          duration: 480,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ),
    ).start();
  }, [entranceValues]);

  const entranceStyle = (index: number) => ({
    opacity: entranceValues[index],
    transform: [
      {
        translateY: entranceValues[index].interpolate({
          inputRange: [0, 1],
          outputRange: [18, 0],
        }),
      },
    ],
  });

  const runShake = () => {
    shake.setValue(0);
    Animated.sequence([
      Animated.timing(shake, { toValue: 1, duration: 55, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -1, duration: 55, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 1, duration: 55, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0, duration: 55, useNativeDriver: true }),
    ]).start();
  };

  const validate = (): FieldErrors => {
    const next: FieldErrors = {};
    if (!email.trim()) next.email = 'Informe o e-mail institucional.';
    else if (!/^\S+@\S+\.\S+$/.test(email)) next.email = 'E-mail em formato inválido.';
    if (!password) next.password = 'Informe a senha.';
    else if (password.length < 6) next.password = 'Mínimo de 6 caracteres.';
    return next;
  };

  const handleSubmit = () => {
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) {
      runShake();
      return;
    }
    setLoading(true);
    // Simulação local — aqui entraria a chamada ao serviço remoto opcional
    // (Supabase, seção 20) de autenticação institucional.
    setTimeout(() => setLoading(false), 1400);
  };

  return (
    <View style={styles.root}>
      <AnimatedOrbBackground />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[styles.brandRow, entranceStyle(0)]}>
            <View style={styles.logoMark}>
              <Ionicons name="hand-left" size={26} color={colors.textPrimary} />
            </View>
            <Text style={styles.brandName}>
              Sinal<Text style={{ color: colors.accent }}>.claro</Text>
            </Text>
          </Animated.View>

          <Animated.View style={[styles.badge, entranceStyle(1)]}>
            <View style={styles.badgeDot} />
            <Text style={styles.badgeText}>Painel institucional</Text>
          </Animated.View>

          <Animated.View style={entranceStyle(1)}>
            <Text style={styles.title}>Acesse a gestão do atendimento</Text>
            <Text style={styles.subtitle}>
              Catálogo de sinais, frases e telemetria agregada da sua unidade — o
              atendimento em si continua funcionando sem login, direto no
              aparelho.
            </Text>
          </Animated.View>

          <Animated.View
            style={[
              styles.card,
              { opacity: entranceValues[2] },
              {
                transform: [
                  {
                    translateY: entranceValues[2].interpolate({
                      inputRange: [0, 1],
                      outputRange: [18, 0],
                    }),
                  },
                  {
                    translateX: shake.interpolate({
                      inputRange: [-1, 0, 1],
                      outputRange: [-8, 0, 8],
                    }),
                  },
                ],
              },
            ]}
          >
            <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
            <View style={styles.cardInner}>
              <FloatingLabelInput
                label="E-mail institucional"
                icon="mail-outline"
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  if (errors.email) setErrors((e) => ({ ...e, email: undefined }));
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                error={errors.email}
                returnKeyType="next"
              />

              <FloatingLabelInput
                label="Senha"
                icon="lock-closed-outline"
                value={password}
                onChangeText={(t) => {
                  setPassword(t);
                  if (errors.password) setErrors((e) => ({ ...e, password: undefined }));
                }}
                secureTextEntry={!showPassword}
                error={errors.password}
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
                rightElement={
                  <Pressable
                    hitSlop={10}
                    onPress={() => setShowPassword((v) => !v)}
                    style={styles.eyeButton}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={18}
                      color={colors.textMuted}
                    />
                  </Pressable>
                }
              />

              <View style={styles.row}>
                <View style={styles.rememberRow}>
                  <Switch
                    value={remember}
                    onValueChange={setRemember}
                    trackColor={{ false: colors.surfaceBorder, true: colors.primary }}
                    thumbColor={colors.textPrimary}
                  />
                  <Text style={styles.rememberText}>Lembrar instituição</Text>
                </View>
                <Pressable hitSlop={8}>
                  <Text style={styles.linkText}>Esqueci minha senha</Text>
                </Pressable>
              </View>

              <PrimaryButton
                label="Entrar no painel"
                onPress={handleSubmit}
                loading={loading}
                style={styles.submit}
              />

              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>ou</Text>
                <View style={styles.dividerLine} />
              </View>

              <Pressable style={styles.ssoButton}>
                <Ionicons name="business-outline" size={18} color={colors.textPrimary} />
                <Text style={styles.ssoText}>Continuar com SSO da instituição</Text>
              </Pressable>
            </View>
          </Animated.View>

          <Animated.View style={[styles.footerBox, entranceStyle(5)]}>
            <Ionicons name="shield-checkmark-outline" size={14} color={colors.textMuted} />
            <Text style={styles.footerText}>
              Este acesso gerencia conteúdo e métricas anônimas. Nenhuma imagem ou
              áudio de atendimento passa por aqui — o reconhecimento continua
              100% local, no aparelho do balcão.
            </Text>
          </Animated.View>

          <Animated.View style={entranceStyle(5)}>
            <Text style={styles.requestAccess}>
              Sua instituição ainda não tem acesso?{' '}
              <Text style={[styles.linkText, { fontWeight: '700' }]}>Solicitar cadastro</Text>
            </Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 72,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  logoMark: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: colors.primary,
    shadowOpacity: 0.5,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  brandName: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 14,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
    marginRight: 8,
  },
  badgeText: { color: colors.textSecondary, fontSize: 12, fontWeight: '600' },
  title: { fontSize: 26, fontWeight: '800', color: colors.textPrimary, marginBottom: 8 },
  subtitle: { fontSize: 14, color: colors.textSecondary, lineHeight: 20, marginBottom: 28 },
  card: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  cardInner: { padding: 22 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  rememberRow: { flexDirection: 'row', alignItems: 'center' },
  rememberText: { color: colors.textSecondary, fontSize: 13, marginLeft: 8 },
  linkText: { color: colors.accentSoft, fontSize: 13, fontWeight: '600' },
  submit: { marginBottom: 18 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.surfaceBorder },
  dividerText: { color: colors.textMuted, fontSize: 12, marginHorizontal: 10 },
  ssoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 16,
    height: 52,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  ssoText: { color: colors.textPrimary, fontSize: 14, fontWeight: '600', marginLeft: 10 },
  footerBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 22,
    gap: 8,
    paddingHorizontal: 4,
  },
  footerText: { flex: 1, color: colors.textMuted, fontSize: 11.5, lineHeight: 16 },
  eyeButton: { padding: 4 },
  requestAccess: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 18,
  },
});
