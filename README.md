# Baba - Hebrew Translator 🇮🇱

A beautiful, modern Hebrew translation app powered by AI with contextually accurate translations.

![Baba Hebrew Translator](https://img.shields.io/badge/Platform-iOS%20%7C%20Android-blue) ![React Native](https://img.shields.io/badge/React%20Native-0.81.4-green) ![Expo](https://img.shields.io/badge/Expo-54.0.10-purple)

## Features

### 🎯 **Smart Contextual Translation**
- Gender-aware translations (masculine/feminine conjugations)
- Audience-specific translations (male, female, group, mixed group)
- Automatic language detection
- Cultural nuance preservation

### 🎨 **Modern Design**
- iOS Liquid Glass design principles
- Beautiful gradient backgrounds
- Smooth animations and transitions
- Haptic feedback throughout
- Responsive and intuitive interface

### ⚡ **Performance Optimized**
- Fast translation responses
- Smooth 60fps animations
- Optimized for both iOS and Android
- Minimal memory footprint

## Setup

### Prerequisites
- Node.js 16+
- Expo CLI
- iOS Simulator or Android Emulator

### Installation
```bash
cd baba-new
npm install
```

### Configuration

#### Option 1: Environment Variables (Recommended)
1. Create a `.env` file in the project root:
```bash
EXPO_PUBLIC_OPENAI_API_KEY=your-openai-api-key-here
```

#### Option 2: Direct Configuration
1. Open `services/translation.ts`
2. Replace `'your-openai-api-key-here'` with your actual OpenAI API key

**Important**: For production, always use environment variables for API keys!

### Running the App
```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

## Architecture

### Core Components
- **Translation Screen**: Main interface with liquid glass design
- **Settings Screen**: User preferences and configuration
- **Translation Service**: AI-powered translation with specialized prompts
- **Storage Utilities**: Persistent user settings

### Key Technologies
- **React Native** with Expo
- **React Native Reanimated** for smooth animations
- **Expo Linear Gradient** for beautiful backgrounds
- **React Native Blur** for glass effects
- **AsyncStorage** for persistent settings
- **OpenAI GPT** for translations

## Translation Context

The app provides specialized prompts based on:

### User Gender
- Affects Hebrew verb conjugations when the user is speaking
- Set in Settings screen

### Audience Type
- **General**: Standard translation
- **To Male**: Masculine forms
- **To Female**: Feminine forms  
- **To Males**: Plural masculine
- **To Females**: Plural feminine
- **Mixed Group**: Mixed plural (defaults to masculine as per Hebrew grammar)

## Customization

### Colors
Primary colors can be customized in:
- `app.json` for app-wide theming
- Individual component stylesheets

### Animations
Animation values can be adjusted in:
- Spring damping and duration values
- Timing curves in component files

### API Integration
Currently configured for OpenAI GPT-4. Can be modified in `services/translation.ts` to use:
- Different OpenAI models
- Other translation services
- Custom API endpoints

## Development

### File Structure
```
app/
├── (tabs)/
│   ├── index.tsx      # Main translation screen
│   └── settings.tsx   # Settings screen
services/
├── translation.ts     # AI translation service
types/
├── translation.ts     # TypeScript definitions
utils/
├── storage.ts         # AsyncStorage utilities
```

### Adding Features
1. New translation contexts can be added to `types/translation.ts`
2. UI components follow the liquid glass design pattern
3. All interactions include haptic feedback
4. Animations use React Native Reanimated 3

## Performance Notes

- Animations run on the UI thread for 60fps performance
- Translation requests are debounced to prevent excessive API calls
- Images and assets are optimized for both platforms
- Bundle size is minimized through tree shaking

## Contributing

1. Follow the existing code style and patterns
2. Maintain the liquid glass design aesthetic
3. Include haptic feedback for user interactions
4. Test on both iOS and Android
5. Ensure accessibility compliance

## License

MIT License - feel free to use and modify for your projects.

---

**Made with ❤️ for the Hebrew-speaking community**