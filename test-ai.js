// Simple test script to verify Google AI Studio integration
require('dotenv').config({ path: './backend/functions/.env' });
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testAI() {
  console.log('🧪 Testing Google AI Studio integration...');
  
  try {
    // Initialize Google AI Studio
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Test prompt
    const prompt = `You are a helpful gardening assistant. A user is asking about their tomato plant that has yellow leaves. Provide helpful advice.

User message: "My tomato plant's leaves are turning yellow. What should I do?"`;

    console.log('🔄 Sending test prompt to Gemini Pro...');
    
    // Get AI response
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiContent = response.text();

    console.log('✅ AI Response received:');
    console.log('---');
    console.log(aiContent);
    console.log('---');
    console.log('🎉 Google AI Studio integration is working!');

  } catch (error) {
    console.error('❌ Error testing AI integration:', error);
    
    if (error.message.includes('API_KEY')) {
      console.log('💡 Check that GOOGLE_API_KEY is set in backend/functions/.env');
    }
  }
}

testAI();