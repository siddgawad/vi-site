// OpenAI Configuration
export const openAIConfig = {
  apiKey: process.env.OPENAI_API_KEY || '',
  model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  organization: process.env.OPENAI_ORG_ID || '',
};

// Validate API key
export const validateOpenAIKey = (): boolean => {
  if (!openAIConfig.apiKey) {
    console.error('❌ OPENAI_API_KEY is not set in environment variables');
    return false;
  }
  
  if (!openAIConfig.apiKey.startsWith('sk-')) {
    console.error('❌ Invalid OpenAI API key format. Should start with "sk-"');
    return false;
  }
  
  console.log('✅ OpenAI API key is properly configured');
  return true;
};

// Get API key for use in the application
export const getOpenAIKey = (): string => {
  if (!validateOpenAIKey()) {
    throw new Error('OpenAI API key is not properly configured');
  }
  return openAIConfig.apiKey;
}; 