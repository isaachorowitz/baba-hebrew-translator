import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserSettings, Gender, Language } from '../types/translation';

const SETTINGS_KEY = '@baba_user_settings';

const defaultSettings: UserSettings = {
  userGender: 'male',
  preferredLanguage: 'english',
};

export const saveUserSettings = async (settings: UserSettings): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(settings);
    await AsyncStorage.setItem(SETTINGS_KEY, jsonValue);
  } catch (error) {
    console.error('Error saving user settings:', error);
  }
};

export const getUserSettings = async (): Promise<UserSettings> => {
  try {
    const jsonValue = await AsyncStorage.getItem(SETTINGS_KEY);
    if (jsonValue != null) {
      return JSON.parse(jsonValue);
    }
    return defaultSettings;
  } catch (error) {
    console.error('Error loading user settings:', error);
    return defaultSettings;
  }
};

export const updateUserGender = async (gender: Gender): Promise<void> => {
  const currentSettings = await getUserSettings();
  const updatedSettings = { ...currentSettings, userGender: gender };
  await saveUserSettings(updatedSettings);
};

export const updatePreferredLanguage = async (language: Language): Promise<void> => {
  const currentSettings = await getUserSettings();
  const updatedSettings = { ...currentSettings, preferredLanguage: language };
  await saveUserSettings(updatedSettings);
};
