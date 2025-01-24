// Initialize event listeners FIRST
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('send-btn').addEventListener('click', sendMessage);
    document.getElementById('user-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendMessage();
    });
  });
  
  // Modified initializeChat
  async function initializeChat() {
    try {
      const rawParam = window.location.search.substring(1).split('&')[0];
      const jsonName = rawParam.replace(/[^a-zA-Z0-9._-]/g, '');
      
      if (!jsonName) throw new Error('Add ?filename to URL');
      
      const response = await fetch(`texts/${jsonName}.json`);
      const config = await response.json();
      
      systemPrompt = config.system_prompt;
      conversationHistory = [{ role: "system", content: systemPrompt }];
      
      addMessage("Bot", config.welcome_message, "bot");
  
    } catch (error) {
      console.error('Initialization failed:', error);
      addMessage("System", `Fehler: ${error.message}`, "bot");
    }
  }
  
  // Enhanced sendMessage
  async function sendMessage() {
    const input = document.getElementById('user-input');
    const btn = document.getElementById('send-btn');
    const message = input.value.trim();
    
    if (!message) return;
    
    try {
      // Disable during processing
      input.disabled = true;
      btn.disabled = true;
      
      // Add user message
      addMessage("You", message, "user");
      conversationHistory.push({ role: "user", content: message });
      
      // API call
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: conversationHistory,
          system_prompt: systemPrompt
        })
      });
  
      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      
      const data = await response.json();
      const botResponse = data.choices[0].message.content;
      
      addMessage("Bot", botResponse, "bot");
      conversationHistory.push({ role: "assistant", content: botResponse });
  
    } catch (error) {
      console.error('Chat failed:', error);
      addMessage("System", `Antwort fehlgeschlagen: ${error.message}`, "bot");
    } finally {
      input.disabled = false;
      btn.disabled = false;
      input.value = '';
      input.focus();
    }
  }

function addMessage(sender, text, type) {
    const chatWindow = document.getElementById('chat-window');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}-message`;
    messageDiv.innerHTML = `<strong>${sender}:</strong> ${text}`;
    chatWindow.appendChild(messageDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Initialize when page loads
window.addEventListener('load', initializeChat);