import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from '@react-native-community/blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { IconSymbol } from '@/components/ui/icon-symbol';

import { translateText, detectLanguage } from '../../services/translation';
import { getUserSettings } from '../../utils/storage';
import { UserSettings, AudienceType, Language, TranslationResult } from '../../types/translation';

// const { width, height } = Dimensions.get('window');

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

export default function TranslateScreen() {
  const [inputText, setInputText] = useState('');
  const [translationResult, setTranslationResult] = useState<TranslationResult | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [userSettings, setUserSettings] = useState<UserSettings>({ userGender: 'male', preferredLanguage: 'english' });
  const [selectedAudience, setSelectedAudience] = useState<AudienceType>('general');
  const [fromLanguage, setFromLanguage] = useState<Language>('english');
  
  // Animation values
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);
  const resultOpacity = useSharedValue(0);
  const resultTranslateY = useSharedValue(50);
  const buttonScale = useSharedValue(1);
  const colorProgress = useSharedValue(0);

  useEffect(() => {
    loadUserSettings();
  }, []);

  const loadUserSettings = async () => {
    const settings = await getUserSettings();
    setUserSettings(settings);
  };

  const audienceOptions: { key: AudienceType; label: string; icon: string }[] = [
    { key: 'general', label: 'General', icon: 'person' },
    { key: 'male', label: 'To Male', icon: 'person.fill' },
    { key: 'female', label: 'To Female', icon: 'person.fill' },
    { key: 'group_males', label: 'To Males', icon: 'person.3.fill' },
    { key: 'group_females', label: 'To Females', icon: 'person.3.fill' },
    { key: 'mixed_group', label: 'Mixed Group', icon: 'person.3.sequence.fill' },
  ];

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsTranslating(true);
    
    // Detect language
    const detectedFrom = detectLanguage(inputText);
    const toLanguage = detectedFrom === 'english' ? 'hebrew' : 'english';
    setFromLanguage(detectedFrom);

    // Animation: Move input up and fade
    translateY.value = withSpring(-100);
    opacity.value = withTiming(0.3);
    colorProgress.value = withTiming(1);
    buttonScale.value = withSpring(0.95);

    try {
      const result = await translateText({
        text: inputText,
        fromLanguage: detectedFrom,
        toLanguage,
        userGender: userSettings.userGender,
        audienceType: selectedAudience,
      });

      setTranslationResult(result);
      
      // Show result with animation
      resultOpacity.value = withTiming(1, { duration: 800 });
      resultTranslateY.value = withSpring(0, { damping: 15 });
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      Alert.alert('Translation Error', 'Failed to translate. Please try again.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsTranslating(false);
      buttonScale.value = withSpring(1);
    }
  };

  const resetTranslation = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Reset animations
    translateY.value = withSpring(0);
    opacity.value = withTiming(1);
    colorProgress.value = withTiming(0);
    resultOpacity.value = withTiming(0);
    resultTranslateY.value = withTiming(50);
    
    // Clear state
    setInputText('');
    setTranslationResult(null);
  };

  const inputAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
    opacity: opacity.value,
  }));

  const resultAnimatedStyle = useAnimatedStyle(() => ({
    opacity: resultOpacity.value,
    transform: [{ translateY: resultTranslateY.value }],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const backgroundAnimatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      colorProgress.value,
      [0, 1],
      ['rgba(74, 144, 226, 0.1)', 'rgba(74, 144, 226, 0.2)']
    ),
  }));

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#4A90E2', '#7B68EE', '#9B59B6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <Animated.View style={[styles.backgroundOverlay, backgroundAnimatedStyle]} />
        
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Baba</Text>
              <Text style={styles.subtitle}>Hebrew Translator</Text>
            </View>

            {/* Audience Selection */}
            {!translationResult && (
              <Animated.View style={[styles.audienceContainer, inputAnimatedStyle]}>
                <Text style={styles.audienceTitle}>Who are you speaking to?</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.audienceScroll}>
                  {audienceOptions.map((option) => (
                    <TouchableOpacity
                      key={option.key}
                      style={[
                        styles.audienceOption,
                        selectedAudience === option.key && styles.audienceOptionSelected,
                      ]}
                      onPress={() => {
                        setSelectedAudience(option.key);
                        Haptics.selectionAsync();
                      }}
                    >
                      <IconSymbol 
                        name={option.icon as any} 
                        size={20} 
                        color={selectedAudience === option.key ? '#FFFFFF' : '#4A90E2'} 
                      />
                      <Text style={[
                        styles.audienceOptionText,
                        selectedAudience === option.key && styles.audienceOptionTextSelected,
                      ]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </Animated.View>
            )}

            {/* Input Section */}
            <Animated.View style={[styles.inputContainer, inputAnimatedStyle]}>
              <AnimatedBlurView
                style={styles.inputBlur}
                blurType="light"
                blurAmount={20}
              >
                <TextInput
                  style={styles.textInput}
                  value={inputText}
                  onChangeText={setInputText}
                  placeholder="Type your message..."
                  placeholderTextColor="rgba(0, 0, 0, 0.5)"
                  multiline
                  textAlignVertical="top"
                  maxLength={500}
                />
              </AnimatedBlurView>
            </Animated.View>

            {/* Translate Button */}
            {!translationResult && (
              <AnimatedTouchableOpacity
                style={[styles.translateButton, buttonAnimatedStyle]}
                onPress={handleTranslate}
                disabled={isTranslating || !inputText.trim()}
              >
                <LinearGradient
                  colors={['#FF6B6B', '#FF8E8E', '#FFA8A8']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.buttonGradient}
                >
                  {isTranslating ? (
                    <Text style={styles.buttonText}>Translating...</Text>
                  ) : (
                    <>
                      <IconSymbol name="arrow.right.circle.fill" size={24} color="#FFFFFF" />
                      <Text style={styles.buttonText}>Translate</Text>
                    </>
                  )}
                </LinearGradient>
              </AnimatedTouchableOpacity>
            )}

            {/* Translation Result */}
            {translationResult && (
              <Animated.View style={[styles.resultContainer, resultAnimatedStyle]}>
                <AnimatedBlurView
                  style={styles.resultBlur}
                  blurType="light"
                  blurAmount={30}
                >
                  <View style={styles.resultHeader}>
                    <IconSymbol 
                      name="checkmark.circle.fill" 
                      size={28} 
                      color="#4CAF50" 
                    />
                    <Text style={styles.resultTitle}>Translation</Text>
                  </View>
                  
                  <Text style={styles.originalText}>{translationResult.originalText}</Text>
                  <View style={styles.divider} />
                  <Text style={[
                    styles.translatedText,
                    { textAlign: fromLanguage === 'hebrew' ? 'left' : 'right' }
                  ]}>
                    {translationResult.translatedText}
                  </Text>
                  
                  <View style={styles.resultFooter}>
                    <Text style={styles.languageInfo}>
                      {translationResult.fromLanguage === 'english' ? 'EN' : 'עב'} → {translationResult.toLanguage === 'english' ? 'EN' : 'עב'}
                    </Text>
                    <Text style={styles.contextInfo}>
                      Context: {translationResult.contextUsed}
                    </Text>
                  </View>
                </AnimatedBlurView>

                <TouchableOpacity style={styles.resetButton} onPress={resetTranslation}>
                  <IconSymbol name="arrow.clockwise" size={20} color="#4A90E2" />
                  <Text style={styles.resetButtonText}>New Translation</Text>
                </TouchableOpacity>
              </Animated.View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  title: {
    fontSize: 48,
    fontWeight: '800',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '300',
    marginTop: 5,
  },
  audienceContainer: {
    marginBottom: 30,
  },
  audienceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 15,
    textAlign: 'center',
  },
  audienceScroll: {
    flexGrow: 0,
  },
  audienceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginHorizontal: 5,
    gap: 8,
  },
  audienceOptionSelected: {
    backgroundColor: '#4A90E2',
  },
  audienceOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4A90E2',
  },
  audienceOptionTextSelected: {
    color: '#FFFFFF',
  },
  inputContainer: {
    marginBottom: 30,
  },
  inputBlur: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  textInput: {
    fontSize: 18,
    color: '#000000',
    padding: 20,
    minHeight: 120,
    fontWeight: '400',
  },
  translateButton: {
    alignSelf: 'center',
    borderRadius: 30,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 16,
    gap: 10,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  resultContainer: {
    marginTop: 30,
  },
  resultBlur: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 15,
    gap: 10,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333333',
  },
  originalText: {
    fontSize: 16,
    color: '#666666',
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    marginVertical: 15,
    marginHorizontal: 20,
  },
  translatedText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    paddingHorizontal: 20,
    lineHeight: 30,
  },
  resultFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 15,
  },
  languageInfo: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4A90E2',
  },
  contextInfo: {
    fontSize: 12,
    color: '#999999',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 8,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A90E2',
  },
});