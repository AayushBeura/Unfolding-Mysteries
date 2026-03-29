const express = require('express');
const cors = require('cors');
const axios = require('axios');
const http = require('http');
const { WebSocketServer } = require('ws');
const { AssemblyAI } = require('assemblyai');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

const suspectsList = [
    "Edward Hartwell",
    "Thomas Blackwood",
    "Victor Lancaster",
    "Emma Graves",
    "Lady Beatrice Vale"
];

app.post('/api/generate-story', async (req, res) => {
    try {
        const { apiKey, difficulty } = req.body;
        
        // Randomly pick the killer
        const killer = suspectsList[Math.floor(Math.random() * suspectsList.length)];
        
        let difficultyContext = "EASY difficulty: The suspects should be mostly truthful. Only the killer lies.";
        if (difficulty === "MEDIUM") {
            difficultyContext = "MEDIUM difficulty: The suspects hide some truths but the killer lies carefully.";
        } else if (difficulty === "HARD") {
            difficultyContext = "HARD difficulty: Everyone is hiding secrets, lying, or being evasive. Very complicated.";
        }

        const prompt = `
        You are the master storyteller for a murder mystery set in an old, foreboding mansion in the 1880s.
        The victim is Arthur Brown, a wealthy man with many enemies, recently found murdered with a hunting knife in his study.
        The mansion is locked down; no one can enter or leave. The player is the investigator who has just arrived.

        STORY CONSTRAINTS:
        - The story must revolve ONLY around the following 5 suspects and the victim (Arthur Brown). 
        - Absolutely NO external entities, unrelated people, or outside mentions are allowed.
        - Refer to characters only by first name, surname, or specific labels:
          - Lady Beatrice Vale: "Mistress", "Widow", "Beatrice", or "Vale".
          - Emma Graves: "Maid", "Emma", or "Graves".
          - Edward Hartwell: "Guest", "Edward", or "Hartwell".
          - Thomas Blackwood: "Guest", "Thomas", or "Blackwood".
          - Victor Lancaster: "Butler", "Victor", or "Lancaster".
        - No mention of police, previous cases, or outside family members.

        There are exactly 5 suspects trapped inside:
        1. Edward Hartwell (The Scared Guest) - nervous, anxious.
        2. Thomas Blackwood (The Silent Guest) - quiet, observant, secretive.
        3. Victor Lancaster (The Butler) - formal, knows the house's secrets.
        4. Emma Graves (The Maid) - observant but vulnerable, often overlooked.
        5. Lady Beatrice Vale (The Widow/Mistress) - Arthur Brown's wife.
        
        THE TRUE KILLER IS: ${killer}
        
        ${difficultyContext}
        
        Please weave a complex backstory deciding:
        1. How and exactly when Arthur was killed that night.
        2. Who saw the dead body first and how they reacted.
        3. What each suspect was doing during the time of the murder (their alibis, true or false).
        4. Relationships, dark secrets, and conflicts that each suspect had with Arthur.
        5. Provide a 'system instruction prompt' for each suspect. You must instruct them to act out their specific role and personality. They must know the story you created, but act evasive or helpful according to the difficulty and whether they are the killer. The true killer will lie about their alibi. They must be instructed to answer strictly in NO MORE THAN 30-40 words, keeping their character. All clues must eventually help the investigator deduce that ${killer} is the murderer. Only one murderer.

        CRITICAL RULE FOR ALL CHARACTER PROMPTS: 
        - Instruct every character to speak entirely in plain dialogue only. Absolutely NO non-verbal roleplay actions. Do NOT use asterisks, brackets, or parentheses. 
        - Instruct characters NEVER to mention or refer to anyone outside the 5 suspects and the victim. 
        - Instruct them to use the defined labels (Mistress/Widow, Maid, Butler, Guest) or names (First/Last) when referring to others.

        Output strictly as a valid JSON object. Ensure all strings are enclosed in double quotes ("), NEVER use single quotes (') or backticks (\`) for strings. Do not use unescaped newlines.
        {
          "story": "...",
          "instructions": {
             "Edward Hartwell": "system instruction for Edward...",
             "Thomas Blackwood": "...",
             "Victor Lancaster": "...",
             "Emma Graves": "...",
             "Lady Beatrice Vale": "..."
          }
        }
        `;

        let storyData = null;

        // Helper to extract JSON if LLM output conversational text
        const extractJSON = (rawText) => {
            if (!rawText) throw new Error("Received empty response from AI");
            const match = rawText.match(/\{[\s\S]*\}/);
            if (match) {
                try {
                    return JSON.parse(match[0]);
                } catch (pe) {
                    console.error("JSON Parsing failed. Raw text:", rawText);
                    throw new Error("Malformed JSON found in response");
                }
            }
            console.error("No JSON braces found. Raw text:", rawText);
            throw new Error("No JSON found in response");
        };

        const response = await axios.post('https://api.cerebras.ai/v1/chat/completions', {
            model: 'qwen-3-235b-a22b-instruct-2507',
            messages: [{ role: 'system', content: 'You must output only valid JSON.' }, { role: 'user', content: prompt }],
            temperature: 0.7,
            response_format: { type: "json_object" }
        }, {
            headers: { 'Authorization': `Bearer ${apiKey}` }
        });
        const text = response.data.choices[0].message.content;
        storyData = extractJSON(text);

        res.json({ killer, ...storyData });

    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/interrogate', async (req, res) => {
    try {
        const { apiKey, sysPrompt, history, question } = req.body;
        
        const messages = [{ role: 'system', content: sysPrompt + ' Respond ONLY in plain spoken dialogue. No asterisks, parentheses, brackets, or stage directions. 30-40 words max. You must ONLY refer to the 5 suspects and the victim; absolutely no external people or entities. Refer to others by their role (Mistress/Widow, Maid, Butler, Guest) or name (Edward, Hartwell, etc.).' }];
        history.forEach(h => messages.push({ role: h.role === 'model' ? 'assistant' : 'user', content: h.content }));
        messages.push({ role: 'user', content: question });

        const response = await axios.post('https://api.cerebras.ai/v1/chat/completions', {
            model: 'qwen-3-235b-a22b-instruct-2507',
            messages: messages,
        }, {
            headers: { 'Authorization': `Bearer ${apiKey}` }
        });
        const raw2 = response.data.choices[0].message.content;
        const cleanAnswer2 = raw2
            .replace(/\*[^*]+\*/g, '')
            .replace(/\[[^\]]+\]/g, '')
            .replace(/\([^)]+\)/g, '')
            .replace(/[\u2014\u2013]/g, ',')
            .replace(/\.{2,}/g, '.')
            .replace(/\s{2,}/g, ' ')
            .trim();
        res.json({ answer: cleanAnswer2 });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

const characterVoiceMap = {
    "Emma Graves": {
        voiceId: "en-AU-kylie",
        style: "Conversational",
        locale: "en-AU",
        pitch: 0,
        rate: 0
    },
    "Lady Beatrice Vale": {
        voiceId: "en-UK-juliet",
        style: "Conversational",
        locale: "en-UK",
        pitch: 0,
        rate: 0
    },
    "Thomas Blackwood": {
        voiceId: "en-US-charles",
        style: "Conversational",
        locale: "en-US",
        pitch: 0,
        rate: 7
    },
    "Edward Hartwell": {
        voiceId: "en-US-caleb",
        style: "Conversation",
        locale: "en-US",
        pitch: 0,
        rate: 7
    },
    "Victor Lancaster": {
        voiceId: "en-UK-rory",
        style: "Conversational",
        locale: "en-SCOTT",
        pitch: -14,
        rate: 7
    },
    "THE_TRUTH": {
        voiceId: "en-UK-freddie",
        style: "Narrative",
        locale: "en-UK",
        pitch: -14,
        rate: 7
    }
};

app.get('/api/tts', async (req, res) => {
    try {
        const { text, murfKey, character } = req.query;
        if (!text) return res.status(400).send('No text provided');

        // Default to Freddie if character mapping fails
        const v = characterVoiceMap[character] || {
            voiceId: "en-UK-freddie",
            style: "Conversational",
            locale: "en-UK",
            pitch: 0,
            rate: 0
        };

        const config = {
            method: 'post',
            url: 'https://global.api.murf.ai/v1/speech/stream',
            headers: {
                'Content-Type': 'application/json',
                'api-key': murfKey
            },
            data: {
                "voiceId": v.voiceId,
                "style": v.style,
                "text": text,
                "rate": v.rate,
                "pitch": v.pitch,
                "multiNativeLocale": v.locale,
                "model": "FALCON",
                "format": "MP3",
                "sampleRate": 24000,
                "channelType": "MONO"
            },
            responseType: 'stream'
        };

        const murfResponse = await axios(config);
        
        res.setHeader('Content-Type', 'audio/mpeg');
        // Let Express handle Transfer-Encoding naturally for a stream
        murfResponse.data.pipe(res);
        
        murfResponse.data.on('end', () => res.end());
        murfResponse.data.on('error', () => res.status(500).end());
        
    } catch(err) {
        console.error("Murf TTS Error:", err.message);
        if (err.response) {
            console.error("Murf API Data:", err.response.data);
        }
        res.status(500).send("TTS Error");
    }
});

const PORT = 3000;
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
    let transcriber = null;
    let transcriberReady = false;
    let listening = false; // Only forward audio to AssemblyAI when actively listening

    ws.on('message', async (message, isBinary) => {
        try {
            // Binary = PCM audio chunk from the browser mic
            if (isBinary) {
                if (transcriber && transcriberReady && listening) {
                    transcriber.sendAudio(Buffer.from(message));
                }
                return;
            }

            // Text = JSON control messages
            const msg = JSON.parse(message.toString());
            console.log('[WS] Received Message:', msg.type);

            if (msg.type === 'stt_init') {
                const aaiKey = msg.apiKey;
                const aaiClient = new AssemblyAI({ apiKey: aaiKey });

                transcriber = aaiClient.streaming.transcriber({
                    sampleRate: 16000,
                    speechModel: 'u3-rt-pro',
                    encoding: 'pcm_s16le',
                    minTurnSilence: 400,   // Wait 1.2s of silence before considering end-of-turn
                    maxTurnSilence: 1000,   // Absolute max 4s silence before forcing endpoint
                    inactivityTimeout: 900  // 15 minutes — keep session alive for the whole game
                });

                transcriber.on('open', ({ id }) => {
                    console.log('[AssemblyAI] Session:', id);
                    transcriberReady = true;
                    ws.send(JSON.stringify({ type: 'stt_ready' }));
                });

                transcriber.on('turn', (t) => {
                    if (!t.transcript) return;
                    console.log(`[AAI] turn end_of_turn=${t.end_of_turn} confidence=${t.end_of_turn_confidence?.toFixed(3)} text="${t.transcript}"`);
                    if (!t.end_of_turn) {
                        ws.send(JSON.stringify({ type: 'stt_partial', text: t.transcript }));
                    } else {
                        listening = false; // Stop forwarding audio after complete utterance
                        ws.send(JSON.stringify({ type: 'stt_final', text: t.transcript }));
                    }
                });

                transcriber.on('error', (err) => {
                    console.error('[AssemblyAI] Error:', err);
                    ws.send(JSON.stringify({ type: 'stt_error', message: err.message }));
                });

                transcriber.on('close', () => {
                    transcriberReady = false;
                    listening = false;
                    console.log('[AssemblyAI] Session closed');
                });

                await transcriber.connect();
            }

            // Start forwarding audio — mic button was clicked
            if (msg.type === 'stt_start') {
                listening = true;
                console.log('[AssemblyAI] Started listening');
            }

            // Stop forwarding audio — but keep session alive
            if (msg.type === 'stt_stop_listening') {
                listening = false;
                console.log('[AssemblyAI] Stopped listening (session stays alive)');
            }

            if (msg.type === 'stt_close') {
                if (transcriber) {
                    await transcriber.close();
                    transcriber = null;
                    transcriberReady = false;
                    listening = false;
                }
            }
        } catch (err) {
            console.error('[WS] Error processing message:', err);
        }
    });

    ws.on('close', async () => {
        if (transcriber) {
            try { await transcriber.close(); } catch(e) {}
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
