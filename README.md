# Unfolding Mysteries 🕯️

**Unfolding Mysteries** is an immersive, voice-activated murder mystery game set in the fog-drenched atmosphere of an 1880s mansion. As an investigator, you must interrogate five unique suspects using your own voice, piece together clues in your journal, and deliver the final verdict before time runs out.

What sets this experience apart is its use of cutting-edge AI to create a dynamic, living narrative where the killer, motive, and clues change with every playthrough.

---

## 🚀 The Murf Falcon Innovation
This game is likely the **first-ever project** built using the **Murf Falcon TTS API**, the fastest text-to-speech engine available today. 

By leveraging Falcon, **Unfolding Mysteries** achieves near-instant voice responses for the suspects. This eliminates the "uncanny valley" of AI latency, allowing for natural, fluid interrogations that feel like real conversations. Each suspect has a distinct, regionally accurate voice (Australian Maid, Scottish Butler, British Widow, etc.) generated on-the-fly.

---

## 🛠️ Tech Stack & AI Integration

The game's "brain" is a sophisticated orchestration of several state-of-the-art AI technologies:

### **1. Voice & Audio (The Senses)**
*   **TTS (Text-to-Speech):** [Murf AI Falcon](https://murf.ai/) - Used for high-speed, emotive character dialogue.
*   **STT (Speech-to-Text):** [AssemblyAI Universal-3 Pro](https://www.assemblyai.com/) - Real-time, ultra-accurate transcription of user voice input via a persistent WebSocket proxy.

### **2. Logic & Generation (The Mind)**
*   **Story Orchestration:** [Google Gemini 2.0 Flash](https://ai.google.dev/) - Generates the randomized case files, secret backstories, and system instructions for all suspects.
*   **Interrogation Engine:** [Cerebras (Llama 3.3 70B)](https://cerebras.ai/) - Provides ultra-fast inference for character responses, ensuring the suspects stay in character while reacting to your specific questions.

### **3. Frontend & Backend (The Body)**
*   **Frontend:** Pure HTML5, Vanilla JavaScript, and Advanced CSS3 (Glassmorphism, Dynamic Blurs, and 1880s aesthetic).
*   **Backend:** Node.js with Express and WebSocket Server.

---

## 🕵️ Gameplay Features

*   **Voice-Activated Interrogations**: Speak directly to the suspects. No typing, just investigation.
*   **Investigator's Journal**: Document your findings in a persistent, flippable book.
*   **Dynamic Storytelling**: Each game session generates a unique "Locked Room" mystery. No two cases are identical.
*   **Atmospheric Immersion**: Period-accurate visuals combined with a layered soundscape (rain, thunder, and ambient period music).
*   **Difficulty Scaling**: Choose between Easy, Medium, and Hard. At higher levels, every suspect hides secrets, and the killer lies with chilling precision.

---

## ⚙️ Configuration

To run the game, you will need your own API keys for:
1.  **Murf AI** (Falcon access required)
2.  **AssemblyAI**
3.  **Google AI (Gemini)** or **Cerebras**

Pass these keys into the **Settings** menu within the game to authorize the AI engines.

---

## 📜 License
This project is for educational and experimental purposes, demonstrating the potential of high-speed AI inference in gaming.

---

*“The fog is thickening. The killer is watching. The truth is unfolding.”*
