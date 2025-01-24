let conversationHistory = [];
let systemPrompt = "";

// Add event listeners outside initialize function
document.getElementById('send-btn').addEventListener('click', sendMessage);
document.getElementById('user-input').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendMessage();
});

// Modified initializeChat function
async function initializeChat() {
    try {
      // Get parameter from URL without named parameter
      const urlPath = window.location.search.substring(1); // Remove leading "?"
      const jsonName = urlPath.split('?')[0]; // Handle multiple parameters
      
      if (!jsonName) throw new Error('Missing JSON parameter in URL');
      
      const safeJsonName = jsonName.replace(/[^a-zA-Z0-9._-]/g, '');
      const response = await fetch(`texts/${safeJsonName}.json`);
      
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      
      const config = await response.json();
      systemPrompt = config.system_prompt;
      
      conversationHistory = [{ role: "system", content: systemPrompt }];
      addMessage("Bot", config.welcome_message, "bot");
  
    } catch (error) {
      console.error('Initialization error:', error);
      addMessage("System", `Error: ${error.message}`, "bot");
    }
  }
  
  // Add this at the bottom of script.js
  document.getElementById('send-btn').addEventListener('click', sendMessage);
  document.getElementById('user-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });

// Modified sendMessage function
async function sendMessage() {
  const input = document.getElementById('user-input');
  const userMessage = input.value.trim();
  
  if (!userMessage) return;
  
  input.disabled = true;
  document.getElementById('send-btn').disabled = true;
  
  try {
    addMessage("You", userMessage, "user");
    conversationHistory.push({ role: "user", content: userMessage });
    
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
    const botMessage = data.choices[0].message.content;
    
    addMessage("Bot", botMessage, "bot");
    conversationHistory.push({ role: "assistant", content: botMessage });

  } catch (error) {
    console.error('Chat error:', error);
    addMessage("System", `Fehler: ${error.message}`, "bot");
  } finally {
    input.disabled = false;
    document.getElementById('send-btn').disabled = false;
    input.value = "";
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