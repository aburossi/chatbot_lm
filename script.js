let conversationHistory = [];
let systemPrompt = "";

async function initializeChat() {
    try {
        // Get JSON name from URL
        const urlParams = new URLSearchParams(window.location.search);
        const jsonName = urlParams.get('config'); // Changed to use named parameter
        
        if (!jsonName) {
            throw new Error('Missing config parameter in URL');
        }

        // Sanitize filename and load JSON
        const safeJsonName = jsonName.replace(/[^a-zA-Z0-9._-]/g, '');
        const response = await fetch(`texts/${safeJsonName}.json`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const config = await response.json();
        systemPrompt = config.system_prompt;
        
        conversationHistory = [{ role: "system", content: systemPrompt }];
        addMessage("Bot", config.welcome_message || "How can I help you today?", "bot");
        
    } catch (error) {
        console.error('Initialization error:', error);
        addMessage("System", `Configuration error: ${error.message}`, "bot");
    }
}

async function sendMessage() {
    const input = document.getElementById('user-input');
    const userMessage = input.value.trim();
    
    if (!userMessage) return;
    
    // Add user message
    addMessage("You", userMessage, "user");
    conversationHistory.push({ role: "user", content: userMessage });
    input.value = "";
    
    try {
        // Get bot response
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                messages: conversationHistory,
                system_prompt: systemPrompt 
            })
        });
        
        const data = await response.json();
        const botMessage = data.choices[0].message.content;
        
        // Add bot response
        addMessage("Bot", botMessage, "bot");
        conversationHistory.push({ role: "assistant", content: botMessage });
        
    } catch (error) {
        console.error('Chat error:', error);
        addMessage("System", "Error connecting to chatbot", "bot");
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