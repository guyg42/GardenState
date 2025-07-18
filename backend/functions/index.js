const { onValueCreated } = require('firebase-functions/v2/database');
const { initializeApp } = require('firebase-admin/app');
const { getDatabase } = require('firebase-admin/database');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { defineSecret } = require('firebase-functions/params');

initializeApp();

// Define the API key secret
const googleApiKey = defineSecret('GOOGLE_API_KEY');

exports.handleNewMessage3 = onValueCreated({
  ref: '/plants/{plantId}/entries/{entryId}/messages/{messageId}',
  region: 'us-central1',
  memory: '1GiB',
  timeoutSeconds: 540,
  instance: 'gardenstate-test-default-rtdb',
  secrets: [googleApiKey]
}, async (event) => {
    console.log('🔥 Function triggered! Path:', event.params);
    const { plantId, entryId, messageId } = event.params;
    const message = event.data.val();
    console.log('📝 Message data:', message);

    // Initialize database connection
    const db = getDatabase();

    // Only process user messages
    if (message.role !== 'user') {
      console.log('❌ Message role is not user:', message.role);
      return null;
    }
    console.log('✅ Processing user message');

    try {
      // Get all messages in current entry
      const entryRef = db.ref(`/plants/${plantId}/entries/${entryId}`);
      const entrySnapshot = await entryRef.once('value');
      const entryData = entrySnapshot.val();

      if (!entryData || !entryData.messages) {
        return null;
      }

      // Get all other entry summaries for this plant
      const plantRef = db.ref(`/plants/${plantId}`);
      const plantSnapshot = await plantRef.once('value');
      const plantData = plantSnapshot.val();

      // Build conversation history
      const messages = Object.entries(entryData.messages)
        .sort(([, a], [, b]) => new Date(a.timestamp) - new Date(b.timestamp))
        .map(([, msg]) => ({
          role: msg.role === 'user' ? 'human' : 'assistant',
          content: msg.content,
          images: msg.images || []
        }));

      // Build context from other entries and current entry's human summary
      let plantContext = '';
      
      // Add current entry's human summary if available
      if (entryData.humanSummary && entryData.humanSummary.trim()) {
        plantContext += `\nCurrent entry notes from user: ${entryData.humanSummary}\n`;
      }
      
      if (plantData.entries) {
        const otherEntries = Object.entries(plantData.entries)
          .filter(([id]) => id !== entryId)
          .sort(([, a], [, b]) => new Date(b.entryDate || b.createdAt) - new Date(a.entryDate || a.createdAt))
          .slice(0, 5) // Last 5 entries for context
          .map(([, entry]) => {
            let contextEntry = '';
            const entryDate = entry.entryDate || entry.createdAt;
            contextEntry += `Entry from ${new Date(entryDate).toLocaleDateString()}:\n`;
            
            if (entry.humanSummary && entry.humanSummary.trim()) {
              contextEntry += `User notes: ${entry.humanSummary}\n`;
            }
            if (entry.summary && entry.summary.trim()) {
              contextEntry += `AI summary: ${entry.summary}\n`;
            }
            return contextEntry;
          })
          .filter(entry => entry.trim());

        if (otherEntries.length > 0) {
          plantContext += `\nPrevious entries for this plant:\n${otherEntries.join('\n---\n')}`;
        }
      }
      
      // Add plant information if available
      if (plantData.plantType || plantData.nickname || plantData.description) {
        plantContext += '\nPlant Information:\n';
        if (plantData.nickname) plantContext += `Name: ${plantData.nickname}\n`;
        if (plantData.plantType) plantContext += `Type: ${plantData.plantType}\n`;
        if (plantData.description) plantContext += `Description: ${plantData.description}\n`;
        if (plantData.dateAcquired) plantContext += `Acquired: ${new Date(plantData.dateAcquired).toLocaleDateString()}\n`;
        if (plantData.ageWhenAcquired) plantContext += `Age when acquired: ${plantData.ageWhenAcquired}\n`;
      }

      // Initialize Google AI Studio
      const genAI = new GoogleGenerativeAI(googleApiKey.value());
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite-preview-06-17" });

      // Create system prompt
      const systemPrompt = `You are a helpful gardening assistant. You help users track and care for their plants through conversational entries. 

You should:
- Provide helpful, accurate gardening advice
- Ask clarifying questions when needed
- Help identify plant problems and solutions
- Suggest care routines and improvements
- Be encouraging and supportive
- Keep responses concise but informative

${plantContext}

Please respond to the user's message about their plant.`;

      // Prepare conversation for Gemini
      const recentMessages = messages.slice(-10);
      
      // Collect all images from the conversation
      const allImages = [];
      recentMessages.forEach(msg => {
        if (msg.images && msg.images.length > 0) {
          allImages.push(...msg.images);
        }
      });
      
      let contentParts = [];
      
      // Build conversation history text with image references
      const conversationHistory = recentMessages.map(msg => {
        let msgText = `${msg.role === 'human' ? 'User' : 'Assistant'}: ${msg.content}`;
        if (msg.images && msg.images.length > 0) {
          msgText += ` [shared ${msg.images.length} image(s)]`;
        }
        return msgText;
      }).join('\n\n');
      
      // Add system prompt and conversation context
      if (allImages.length > 0) {
        const contextPrompt = `${systemPrompt}\n\nConversation history:\n${conversationHistory}\n\nPlease analyze all the provided images from this conversation and respond to the user's latest message about their plant. Consider the visual information from all images when providing advice.`;
        
        contentParts.push({
          text: contextPrompt
        });
        
        // Add all images from the conversation
        for (const imageUrl of allImages) {
          try {
            const imageResponse = await fetch(imageUrl);
            const imageBuffer = await imageResponse.arrayBuffer();
            const base64Image = Buffer.from(imageBuffer).toString('base64');
            
            contentParts.push({
              inlineData: {
                data: base64Image,
                mimeType: 'image/jpeg'
              }
            });
          } catch (error) {
            console.error('Error fetching image:', error);
          }
        }
      } else {
        // Text-only conversation
        const fullPrompt = `${systemPrompt}\n\nConversation history:\n${conversationHistory}\n\nPlease respond to the user's latest message.`;
        
        contentParts.push({
          text: fullPrompt
        });
      }

      // Get AI response
      const result = await model.generateContent(contentParts);
      const response = await result.response;
      const aiContent = response.text();

      // Save AI response
      const responseRef = db.ref(`/plants/${plantId}/entries/${entryId}/messages`).push();
      await responseRef.set({
        uid: 'ai-assistant',
        timestamp: new Date().toISOString(),
        content: aiContent,
        role: 'assistant'
      });

      // Generate entry name if it's blank
      let shouldUpdateName = false;
      if (!entryData.name || entryData.name.trim() === '') {
        shouldUpdateName = true;
      }

      // Always update summary, conditionally update name
      let namePrompt = '';
      if (shouldUpdateName) {
        namePrompt = '\n\nAdditionally, please suggest a short, descriptive name (3-5 words) for this conversation entry based on the main topic discussed. Format your response exactly like this:\n\nENTRY_NAME: [suggested name]\nSUMMARY: [your summary]';
      } else {
        namePrompt = '\n\nPlease provide a brief summary of this conversation for future reference. Format your response exactly like this:\n\nSUMMARY: [your summary]';
      }

      // Get summary (and name if needed) from AI
      const summarySystemPrompt = 'You are helping to summarize plant care conversations. Be concise and focus on key information that would be useful for future plant care.';
      const summaryConversation = messages.map(msg => 
        `${msg.role === 'human' ? 'User' : 'Assistant'}: ${msg.content}`
      ).join('\n\n');
      
      const summaryFullPrompt = `${summarySystemPrompt}\n\nConversation:\n${summaryConversation}\n\nBased on this conversation, ${namePrompt}`;

      const summaryResult = await model.generateContent(summaryFullPrompt);
      const summaryResponse = await summaryResult.response;
      const summaryContent = summaryResponse.text();

      // Parse the response
      let newSummary = '';
      let newName = '';

      if (shouldUpdateName && summaryContent.includes('ENTRY_NAME:') && summaryContent.includes('SUMMARY:')) {
        const nameMatch = summaryContent.match(/ENTRY_NAME:\s*(.+?)(?=\nSUMMARY:|$)/);
        const summaryMatch = summaryContent.match(/SUMMARY:\s*(.+)$/s);
        
        if (nameMatch) newName = nameMatch[1].trim();
        if (summaryMatch) newSummary = summaryMatch[1].trim();
      } else if (summaryContent.includes('SUMMARY:')) {
        const summaryMatch = summaryContent.match(/SUMMARY:\s*(.+)$/s);
        if (summaryMatch) newSummary = summaryMatch[1].trim();
      } else {
        // Fallback if format isn't followed
        newSummary = summaryContent.trim();
      }

      // Update entry with summary and name (if generated)
      const updates = { summary: newSummary };
      if (shouldUpdateName && newName) {
        updates.name = newName;
      }
      
      await entryRef.update(updates);

      return { success: true };

    } catch (error) {
      console.error('Error processing message:', error);
      
      // Send error message to user
      const errorRef = db.ref(`/plants/${plantId}/entries/${entryId}/messages`).push();
      await errorRef.set({
        uid: 'ai-assistant',
        timestamp: new Date().toISOString(),
        content: 'Sorry, I encountered an error processing your message. Please try again.',
        role: 'assistant'
      });

      return { error: error.message };
    }
  });