import { TranslationRequest, TranslationResult, Language, Gender, AudienceType } from '../types/translation';

// SECURITY NOTE: In production, move this to environment variables
// For development, replace with your actual OpenAI API key
const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || 'your-openai-api-key-here';

const createTranslationPrompt = (
  text: string,
  fromLanguage: Language,
  toLanguage: Language,
  userGender: Gender,
  audienceType: AudienceType
): string => {
  const languageMap = {
    english: 'English',
    hebrew: 'Hebrew'
  };

  const from = languageMap[fromLanguage];
  const to = languageMap[toLanguage];

  let contextInstruction = '';
  
  if (toLanguage === 'hebrew' && audienceType !== 'general') {
    const genderContext = userGender === 'male' ? 'masculine' : 'feminine';
    
    switch (audienceType) {
      case 'male':
        contextInstruction = `The speaker is ${genderContext} and speaking to one male person. Use appropriate Hebrew verb conjugations and forms.`;
        break;
      case 'female':
        contextInstruction = `The speaker is ${genderContext} and speaking to one female person. Use appropriate Hebrew verb conjugations and forms.`;
        break;
      case 'group_males':
        contextInstruction = `The speaker is ${genderContext} and speaking to a group of males. Use appropriate Hebrew plural masculine forms.`;
        break;
      case 'group_females':
        contextInstruction = `The speaker is ${genderContext} and speaking to a group of females. Use appropriate Hebrew plural feminine forms.`;
        break;
      case 'mixed_group':
        contextInstruction = `The speaker is ${genderContext} and speaking to a mixed group. Use appropriate Hebrew plural forms (default to masculine plural for mixed groups as per Hebrew grammar rules).`;
        break;
    }
  }

  return `You are a professional Hebrew-English translator specializing in contextually accurate translations.

Task: Translate the following text from ${from} to ${to}.

${contextInstruction ? `Context: ${contextInstruction}` : ''}

Text to translate: "${text}"

Requirements:
- Provide a natural, conversational translation
- Maintain the tone and intent of the original text
- Use proper grammar and conjugations for the target language
- For Hebrew: Include proper nikud (vowel points) only when necessary for clarity
- Keep cultural nuances and expressions when possible

Respond with only the translated text, no explanations or additional commentary.`;
};

export const translateText = async (request: TranslationRequest): Promise<TranslationResult> => {
  try {
    const prompt = createTranslationPrompt(
      request.text,
      request.fromLanguage,
      request.toLanguage,
      request.userGender,
      request.audienceType
    );

    // Simulate API call for now - replace with actual OpenAI API call
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4', // Use gpt-4 or gpt-5 when available
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`Translation API error: ${response.status}`);
    }

    const data = await response.json();
    const translatedText = data.choices[0]?.message?.content?.trim() || 'Translation failed';

    return {
      originalText: request.text,
      translatedText,
      fromLanguage: request.fromLanguage,
      toLanguage: request.toLanguage,
      contextUsed: request.audienceType,
    };
  } catch (error) {
    console.error('Translation error:', error);
    
    // Fallback mock translation for development
    const mockTranslation = request.fromLanguage === 'english' 
      ? `[Hebrew translation of: ${request.text}]`
      : `[English translation of: ${request.text}]`;
      
    return {
      originalText: request.text,
      translatedText: mockTranslation,
      fromLanguage: request.fromLanguage,
      toLanguage: request.toLanguage,
      contextUsed: request.audienceType,
    };
  }
};

export const detectLanguage = (text: string): Language => {
  // Simple Hebrew detection - looks for Hebrew characters
  const hebrewRegex = /[\u0590-\u05FF]/;
  return hebrewRegex.test(text) ? 'hebrew' : 'english';
};
