import { getOpenAIKey } from '../config/openai';

export async function testOpenAIKey(): Promise<{ success: boolean; message: string }> {
  try {
    const apiKey = getOpenAIKey();
    
    // Test the API key by making a simple request
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        message: `✅ API key verified successfully! Available models: ${data.data.length}`
      };
    } else {
      const errorData = await response.json();
      return {
        success: false,
        message: `❌ API key verification failed: ${errorData.error?.message || 'Unknown error'}`
      };
    }
  } catch (error) {
    return {
      success: false,
      message: `❌ Error testing API key: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

export async function testCursorCompatibility(): Promise<{ success: boolean; message: string }> {
  try {
    const apiKey = getOpenAIKey();
    
    // Test with a simple completion request (similar to what Cursor might use)
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: 'Hello, this is a test message.'
          }
        ],
        max_tokens: 10
      }),
    });

    if (response.ok) {
      return {
        success: true,
        message: '✅ API key is compatible with Cursor models!'
      };
    } else {
      const errorData = await response.json();
      return {
        success: false,
        message: `❌ Cursor compatibility test failed: ${errorData.error?.message || 'Unknown error'}`
      };
    }
  } catch (error) {
    return {
      success: false,
      message: `❌ Error testing Cursor compatibility: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
} 