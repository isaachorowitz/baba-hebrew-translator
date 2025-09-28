export type Gender = 'male' | 'female';

export type AudienceType = 
  | 'male'
  | 'female' 
  | 'group_males'
  | 'group_females'
  | 'mixed_group'
  | 'general';

export type Language = 'english' | 'hebrew';

export interface UserSettings {
  userGender: Gender;
  preferredLanguage: Language;
}

export interface TranslationRequest {
  text: string;
  fromLanguage: Language;
  toLanguage: Language;
  userGender: Gender;
  audienceType: AudienceType;
}

export interface TranslationResult {
  originalText: string;
  translatedText: string;
  fromLanguage: Language;
  toLanguage: Language;
  contextUsed: string;
}
