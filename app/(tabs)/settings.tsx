import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
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
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { IconSymbol } from '@/components/ui/icon-symbol';

import { getUserSettings, updateUserGender, updatePreferredLanguage } from '../../utils/storage';
import { UserSettings, Gender, Language } from '../../types/translation';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

export default function SettingsScreen() {
  const [userSettings, setUserSettings] = useState<UserSettings>({ 
    userGender: 'male', 
    preferredLanguage: 'english' 
  });
  const [isLoading, setIsLoading] = useState(true);

  // Animation values
  const fadeInValue = useSharedValue(0);
  const slideUpValue = useSharedValue(50);

  useEffect(() => {
    loadSettings();
    
    // Entrance animations
    fadeInValue.value = withTiming(1, { duration: 800 });
    slideUpValue.value = withSpring(0, { damping: 15 });
  }, [fadeInValue, slideUpValue]);

  const loadSettings = async () => {
    try {
      const settings = await getUserSettings();
      setUserSettings(settings);
    } catch {
      console.error('Error loading settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenderChange = async (gender: Gender) => {
    Haptics.selectionAsync();
    
    try {
      await updateUserGender(gender);
      setUserSettings(prev => ({ ...prev, userGender: gender }));
    } catch {
      Alert.alert('Error', 'Failed to update gender setting');
    }
  };

  const handleLanguageChange = async (language: Language) => {
    Haptics.selectionAsync();
    
    try {
      await updatePreferredLanguage(language);
      setUserSettings(prev => ({ ...prev, preferredLanguage: language }));
    } catch {
      Alert.alert('Error', 'Failed to update language setting');
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: fadeInValue.value,
    transform: [{ translateY: slideUpValue.value }],
  }));

  const SettingCard: React.FC<{
    title: string;
    subtitle: string;
    icon: string;
    children: React.ReactNode;
  }> = ({ title, subtitle, icon, children }) => (
    <AnimatedBlurView
      style={styles.settingCard}
      blurType="light"
      blurAmount={20}
    >
      <View style={styles.settingHeader}>
        <View style={styles.settingIconContainer}>
          <IconSymbol name={icon as any} size={24} color="#4A90E2" />
        </View>
        <View style={styles.settingTextContainer}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingSubtitle}>{subtitle}</Text>
        </View>
      </View>
      <View style={styles.settingContent}>
        {children}
      </View>
    </AnimatedBlurView>
  );

  const OptionButton: React.FC<{
    label: string;
    selected: boolean;
    onPress: () => void;
    icon?: string;
  }> = ({ label, selected, onPress, icon }) => {
    const buttonScale = useSharedValue(1);

    const handlePress = () => {
      buttonScale.value = withSpring(0.95, { duration: 100 }, () => {
        buttonScale.value = withSpring(1);
      });
      onPress();
    };

    const buttonAnimatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: buttonScale.value }],
    }));

    return (
      <AnimatedTouchableOpacity
        style={[
          styles.optionButton,
          selected && styles.optionButtonSelected,
          buttonAnimatedStyle,
        ]}
        onPress={handlePress}
      >
        {icon && (
          <IconSymbol 
            name={icon as any} 
            size={18} 
            color={selected ? '#FFFFFF' : '#4A90E2'} 
          />
        )}
        <Text style={[
          styles.optionButtonText,
          selected && styles.optionButtonTextSelected,
        ]}>
          {label}
        </Text>
      </AnimatedTouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#4A90E2', '#7B68EE', '#9B59B6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading Settings...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#4A90E2', '#7B68EE', '#9B59B6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View style={[styles.header, animatedStyle]}>
            <Text style={styles.title}>Settings</Text>
            <Text style={styles.subtitle}>Customize your translation experience</Text>
          </Animated.View>

          {/* Gender Setting */}
          <Animated.View style={[styles.settingSection, animatedStyle]}>
            <SettingCard
              title="Your Gender"
              subtitle="This affects Hebrew verb conjugations when you're the speaker"
              icon="person.circle.fill"
            >
              <View style={styles.optionRow}>
                <OptionButton
                  label="Male"
                  icon="mustache.fill"
                  selected={userSettings.userGender === 'male'}
                  onPress={() => handleGenderChange('male')}
                />
                <OptionButton
                  label="Female"
                  icon="figure.dress.line.vertical.figure"
                  selected={userSettings.userGender === 'female'}
                  onPress={() => handleGenderChange('female')}
                />
              </View>
            </SettingCard>
          </Animated.View>

          {/* Preferred Language Setting */}
          <Animated.View style={[styles.settingSection, animatedStyle]}>
            <SettingCard
              title="Preferred Starting Language"
              subtitle="Default language to translate from"
              icon="globe"
            >
              <View style={styles.optionRow}>
                <OptionButton
                  label="English"
                  icon="textformat.abc"
                  selected={userSettings.preferredLanguage === 'english'}
                  onPress={() => handleLanguageChange('english')}
                />
                <OptionButton
                  label="Hebrew"
                  icon="textformat"
                  selected={userSettings.preferredLanguage === 'hebrew'}
                  onPress={() => handleLanguageChange('hebrew')}
                />
              </View>
            </SettingCard>
          </Animated.View>

          {/* App Info */}
          <Animated.View style={[styles.settingSection, animatedStyle]}>
            <SettingCard
              title="About Baba"
              subtitle="Hebrew translation powered by AI"
              icon="info.circle.fill"
            >
              <View style={styles.infoContainer}>
                <Text style={styles.infoText}>
                  Baba uses advanced AI to provide contextually accurate Hebrew-English translations,
                  taking into account gender, audience, and cultural nuances.
                </Text>
                <View style={styles.versionContainer}>
                  <Text style={styles.versionText}>Version 1.0.0</Text>
                </View>
              </View>
            </SettingCard>
          </Animated.View>

          {/* API Key Info */}
          <Animated.View style={[styles.settingSection, animatedStyle]}>
            <SettingCard
              title="API Configuration"
              subtitle="Translation service setup"
              icon="key.fill"
            >
              <View style={styles.infoContainer}>
                <Text style={styles.warningText}>
                  ⚠️ To use real translations, add your OpenAI API key in services/translation.ts
                </Text>
                <Text style={styles.infoText}>
                  Currently using mock translations for development.
                </Text>
              </View>
            </SettingCard>
          </Animated.View>
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '300',
    marginTop: 5,
    textAlign: 'center',
  },
  settingSection: {
    marginBottom: 20,
  },
  settingCard: {
    borderRadius: 20,
    overflow: 'hidden',
    padding: 20,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 18,
  },
  settingContent: {
    marginTop: 5,
  },
  optionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  optionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionButtonSelected: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  optionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A90E2',
  },
  optionButtonTextSelected: {
    color: '#FFFFFF',
  },
  infoContainer: {
    gap: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  warningText: {
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: '500',
    lineHeight: 20,
  },
  versionContainer: {
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  versionText: {
    fontSize: 12,
    color: '#999999',
    fontWeight: '500',
  },
});