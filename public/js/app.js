class AIAssistant {
  constructor() {
    this.ws = null;
    this.isActive = false;
    this.button = document.getElementById("startStopButton");
    this.buttonText = document.getElementById("buttonText");
    this.statusAlert = document.getElementById("statusAlert");
    this.status = document.getElementById("status");
    this.conversation = document.getElementById("conversation");
    this.voiceSelect = document.getElementById("voiceSelect");

    this.button.addEventListener("click", () => this.toggleMeeting());
    this.voiceSelect.addEventListener("change", () => this.updateVoice());
  }

  updateStatusUI(message, type = "info") {
    this.status.textContent = message;
    this.statusAlert.className = `alert alert-${type} w-full max-w-xs`;
  }

  async connect() {
    try {
      const response = await fetch("/get-credentials");
      const { apiKey } = await response.json();

      this.ws = new WebSocket("wss://api.openai.com/v1/realtime");

      this.ws.onopen = () => {
        this.ws.send(
          JSON.stringify({
            type: "session.update",
            session: {
              voice: this.voiceSelect.value || "alloy",
              model: "gpt-4o-realtime-preview-2024-10-01",
              instructions: `You are an AI meeting assistant. Participate in the conversation 
                            naturally, provide insights when relevant, and help keep the discussion 
                            focused and productive. Be concise but helpful.`,
            },
          })
        );

        this.updateStatusUI("Connected", "success");
        this.isActive = true;
        this.updateButtonState();
      };

      this.ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        this.handleMessage(message);
      };

      this.ws.onclose = () => {
        this.updateStatusUI("Disconnected", "warning");
        this.isActive = false;
        this.updateButtonState();
      };

      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        this.updateStatusUI("Connection error", "error");
      };
    } catch (error) {
      console.error("Connection error:", error);
      this.updateStatusUI("Connection error", "error");
    }
  }

  handleMessage(message) {
    if (message.type === "conversation.item.created") {
      const content = message.item.content;
      if (content && content[0].type === "text") {
        this.addMessageToConversation(content[0].text, "AI");
      }
    }
  }

  addMessageToConversation(text, sender) {
    const messageDiv = document.createElement("div");
    messageDiv.className = `chat ${
      sender === "AI" ? "chat-start" : "chat-end"
    }`;
    messageDiv.innerHTML = `
            <div class="chat-header">
                ${sender}
            </div>
            <div class="chat-bubble ${
              sender === "AI" ? "chat-bubble-primary" : "chat-bubble-secondary"
            }">
                ${text}
            </div>
        `;
    this.conversation.appendChild(messageDiv);
    this.conversation.scrollTop = this.conversation.scrollHeight;
  }

  updateVoice() {
    if (this.ws && this.isActive) {
      this.ws.send(
        JSON.stringify({
          type: "session.update",
          session: {
            voice: this.voiceSelect.value,
          },
        })
      );
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isActive = false;
    this.updateButtonState();
  }

  toggleMeeting() {
    if (this.isActive) {
      this.disconnect();
    } else {
      this.connect();
    }
  }

  updateButtonState() {
    if (this.isActive) {
      this.buttonText.textContent = "End Meeting";
      this.button.classList.remove("btn-primary");
      this.button.classList.add("btn-error");
    } else {
      this.buttonText.textContent = "Start Meeting";
      this.button.classList.remove("btn-error");
      this.button.classList.add("btn-primary");
    }
  }
}

// Initialize the assistant when the page loads
const assistant = new AIAssistant();
