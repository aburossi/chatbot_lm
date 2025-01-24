let conversationHistory = [];
let systemPrompt = "";

async function initializeChat() {
    // Get JSON name from URL parameter
    const params = new URLSearchParams(window.location.search);
    const jsonName = params.keys().next().value;
    
    try {
        // Load JSON configuration
        const response = await fetch(`texts/${jsonName}.json`);
        const config = await response.json();
        systemPrompt = config.system_prompt;
        
        // Initialize conversation
        conversationHistory = [{
            role: "system",
            content: systemPrompt
        }];
        
        // Set up UI interactions
        document.getElementById('send-btn').addEventListener('click', sendMessage);
        document.getElementById('user-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
        
        addMessage("Bot", "How can I help you today?", "bot");
    } catch (error) {
        console.error('Error initializing chat:', error);
        addMessage("System", "Failed to load chatbot configuration", "bot");
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