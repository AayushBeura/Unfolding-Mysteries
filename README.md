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
*   **TTS (Text-to-Speech):** [Murf AI Falcon](https://murf.ai/) — Cinematic narration & high-speed, emotive character voice synthesis.
*   **STT (Speech-to-Text):** [AssemblyAI Universal-3 Pro](https://www.assemblyai.com/) — Real-time speech recognition & transcript handling via a persistent WebSocket proxy.

### **2. Logic & Narrative (The Mind)**
*   **Interrogation Engine:** [Cerebras API](https://cerebras.ai/) — Ultra-fast inference for interactive reasoning & narrative logic. Suspects stay fully in character while reacting to your specific questions.

### **3. Frontend & Backend (The Body)**
*   **Frontend:** HTML, CSS, JavaScript — Full interface & interaction system with a custom browser-based scene sequencing system.
*   **Backend:** Node.js + Express.js — Backend logic & API orchestration.

---

## 🕵️ Gameplay Features

*   **Voice-Activated Interrogations** — Speak directly to suspects using your microphone. No typing, just investigation.
*   **Investigator's Journal** — Document your findings in a persistent, flippable in-game notebook.
*   **Dynamic Storytelling** — Each session generates a unique locked-room mystery. The killer, motive, and clues change every playthrough.
*   **Atmospheric Immersion** — Period-accurate visuals paired with a layered soundscape: rain, thunder, and ambient period music.
*   **Difficulty Scaling** — Easy, Medium, and Hard modes. At higher difficulties, suspects actively mislead you with partial truths and outright lies.
*   **Full-Screen Cinematic Experience** — Designed to be played in fullscreen with headphones for maximum immersion. 🎧
*   **Final Verdict System** — Once you've interrogated all suspects, lock in your accusation. The game then reveals the truth.

---

## ⚙️ Configuration

To run the game, you will need your own API keys for:
1.  **Murf AI** (Falcon access required)
2.  **AssemblyAI**
3.  **Cerebras**

Pass these keys into the **Settings** menu within the game to authorize the AI engines.

---

## 🚀 Getting Started

The game requires **two servers** running simultaneously — one to serve the frontend, and one to run the Node.js backend.

**1. Install dependencies**
```bash
npm install
```

**2. Start the Node.js backend** (handles AI, TTS, and STT)
```bash
node server.js
```
The backend will start on `http://localhost:3000`.

**3. Serve the frontend** (in a separate terminal)

Using the VS Code **Live Server** extension, right-click `index.html` → *Open with Live Server*.

Or via `npx`:
```bash
npx serve .
```

**4. Open the game** in your browser, go to **Settings**, enter and validate your API keys, then hit **New Game**.

> ⚠️ Both servers must be running at the same time. The game will not function if the Node.js backend (`server.js`) is not active.

---


## 📜 License
This project is for educational and experimental purposes, demonstrating the potential of high-speed AI inference in gaming.

---

*“The fog is thickening. The killer is watching. The truth is unfolding.”*
