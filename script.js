document.addEventListener('DOMContentLoaded', () => {
    const fsScreen = document.getElementById('fs-screen');
    const fsBtn = document.getElementById('fs-btn');
    const headphonesMsg = document.getElementById('headphones-msg');
    const gameContainer = document.getElementById('game-container');
    const bgImg = document.getElementById('bg-img');
    const content = document.getElementById('content');
    const titleWrapper = document.getElementById('title-wrapper');
    const titleUnfolding = document.getElementById('title-unfolding');
    const titleMysteries = document.getElementById('title-mysteries');
    const dividerContainer = document.getElementById('divider-container');
    const menuButtons = document.getElementById('menu-buttons');
    const newGameBtn = document.getElementById('new-game-btn');
    const settingsBtn = document.getElementById('settings-btn');
    const difficultyOverlay = document.getElementById('difficulty-overlay');
    const diffBtns = document.querySelectorAll('.diff-btn');
    const diffBackBtn = document.getElementById('diff-back-btn');
    const settingsOverlay = document.getElementById('settings-overlay');
    const settingsBackBtn = document.getElementById('settings-back-btn');
    const blackOverlay = document.getElementById('black-overlay');
    const introMusic = document.getElementById('intro-music');
    const clickSfx = document.getElementById('click-sfx');
    const thunderRain = document.getElementById('thunder-rain');
    const storyOverlay = document.getElementById('story-overlay');
    const storyText = document.getElementById('story-text');
    const gameMusic = document.getElementById('game-music');

    // Configurable Game Music Constants
    const MUSIC_VOL_NORMAL = 0.40;
    const MUSIC_VOL_INTERROGATION = 0.20;
    
    // Global state
    let targetMusicVol = 1.0;
    let selectedDifficulty = 'EASY';
    let isCutsceneSkipped = false;
    let gameHasStarted = false;
    
    // Cutscene Elements
    const cutsceneLayer = document.getElementById('cutscene-layer');
    const subtitleContainer = document.getElementById('subtitle-container');
    const subtitleText = document.getElementById('subtitle-text');

    const strUnfolding = "UNFOLDING";
    const strMysteries = "MYSTERIES";

    // Two-line Typewriter effect function
    function typeWriterMulti(cb) {
        let i = 0;
        function type1() {
            if(i < strUnfolding.length) {
                titleUnfolding.textContent += strUnfolding.charAt(i);
                i++;
                setTimeout(type1, 80);
            } else {
                titleUnfolding.classList.add('no-cursor');
                titleMysteries.classList.remove('no-cursor'); // enable cursor for line 2
                i = 0;
                setTimeout(type2, 200); // pause between words
            }
        }
        function type2() {
            if(i < strMysteries.length) {
                titleMysteries.textContent += strMysteries.charAt(i);
                i++;
                setTimeout(type2, 80);
            } else {
                if(cb) cb();
            }
        }
        type1();
    }

    // Two-line Unwrite effect function
    function unWriteMulti(cb) {
        function unwrite2() {
            let text = titleMysteries.textContent;
            if(text.length > 0) {
                titleMysteries.textContent = text.substring(0, text.length - 1);
                setTimeout(unwrite2, 50);
            } else {
                titleUnfolding.classList.remove('no-cursor');
                titleMysteries.classList.add('no-cursor');
                setTimeout(unwrite1, 100);
            }
        }
        function unwrite1() {
            let text = titleUnfolding.textContent;
            if(text.length > 0) {
                titleUnfolding.textContent = text.substring(0, text.length - 1);
                setTimeout(unwrite1, 50);
            } else {
                if(cb) cb();
            }
        }
        unwrite2();
    }

    // Story Typewriter Effect
    function typeWriterStory(text, i, cb) {
        if (i < text.length) {
            storyText.textContent += text.charAt(i);
            setTimeout(() => typeWriterStory(text, i + 1, cb), 100);
        } else {
            storyText.classList.add('no-cursor');
            if (cb) cb();
        }
    }

    // Fade in audio
    function fadeInAudio(audio, duration, targetVolume = 1) {
        audio.volume = 0;
        audio.play().catch(e => console.log("Audio play prevented:", e));
        let step = targetVolume / (duration / 50);
        let fadeAudio = setInterval(() => {
            if (audio.volume + step < targetVolume) {
                audio.volume += step;
            } else {
                audio.volume = targetVolume;
                clearInterval(fadeAudio);
            }
        }, 50);
    }

    // Fade out audio
    function fadeOutAudio(audio, duration) {
        let step = audio.volume / (duration / 50);
        let fadeAudio = setInterval(() => {
            if (audio.volume - step > 0) {
                audio.volume -= step;
            } else {
                audio.volume = 0;
                audio.pause();
                clearInterval(fadeAudio);
            }
        }, 50);
    }

    // Function to play click sound
    function playClick(e) {
        if (e.currentTarget.id === 'fs-btn') return; // Exclude fullscreen button
        if (clickSfx) {
            clickSfx.currentTime = 0;
            clickSfx.play().catch(err => console.log("Can't play sound", err));
        }
    }

    // Attach click sound to all buttons
    document.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', playClick);
    });

    // Main experience trigger
    async function startExperience() {
        try {
            if (!document.fullscreenElement) {
                if (document.documentElement.requestFullscreen) {
                    await document.documentElement.requestFullscreen();
                } else if (document.documentElement.webkitRequestFullscreen) {
                    await document.documentElement.webkitRequestFullscreen();
                } else if (document.documentElement.msRequestFullscreen) {
                    await document.documentElement.msRequestFullscreen();
                }
            }
            
            if (navigator.keyboard && navigator.keyboard.lock) {
                navigator.keyboard.lock(['Escape']).catch(e => console.log('Keyboard lock failed:', e));
            }

            fsScreen.style.display = 'none';
            gameContainer.classList.remove('hidden');
            headphonesMsg.style.display = 'flex'; // show block
            headphonesMsg.classList.remove('hidden');

            setTimeout(() => {
                // Fade in headphones message
                headphonesMsg.classList.add('visible');

                // Leave it up for 3 seconds then fade out
                setTimeout(() => {
                    headphonesMsg.classList.remove('visible');

                    // After headphones MSG fades out, start main game intro
                    setTimeout(() => {
                        headphonesMsg.style.display = 'none';
                        blackOverlay.classList.add('fade-out');
                        bgImg.style.opacity = '1';
                        
                        fadeInAudio(introMusic, 6000, targetMusicVol);
                        
                        setTimeout(() => {
                            titleWrapper.classList.add('visible');
                            setTimeout(() => {
                                titleUnfolding.textContent = '';
                                titleMysteries.textContent = '';
                                typeWriterMulti(() => {
                                    setTimeout(() => {
                                        titleMysteries.classList.add('no-cursor');
                                        dividerContainer.classList.add('visible');
                                        setTimeout(() => {
                                            menuButtons.classList.add('visible');
                                        }, 800);
                                    }, 500);
                                });
                            }, 500);
                        }, 4000);
                    }, 2000); // Wait for msg to finish fading out
                }, 3000); // 3 sec duration for "Headphones Recommended"
            }, 100);

        } catch (err) {
            console.error("Error enabling fullscreen:", err);
        }
    }

    fsBtn.addEventListener('click', startExperience);

    let hasTriggeredStart = false;

    const triggerStart = () => {
        if (hasTriggeredStart) return;
        hasTriggeredStart = true;
        
        // Remove focus from any active button to prevent spacebar bugs
        if (document.activeElement) document.activeElement.blur();
        
        // Fade out into black screen
        blackOverlay.classList.remove('fade-out');
        blackOverlay.classList.add('fade-in');
        
        // Hide difficulty overlay elegantly
        difficultyOverlay.classList.remove('visible');
        
        // Unwrite text
        titleMysteries.classList.remove('no-cursor');
        dividerContainer.classList.remove('visible');
        menuButtons.classList.remove('visible');
        unWriteMulti();
        
        setTimeout(() => {
            menuButtons.style.display = 'none';
        }, 2000);

        fadeOutAudio(introMusic, 4000);

        // Sequence timeline
        setTimeout(() => { if (!isCutsceneSkipped) fadeInAudio(thunderRain, 4000, targetMusicVol * 0.45); }, 4000);
        
        // Show Story text overlay once background is black
        setTimeout(() => {
            if (isCutsceneSkipped) return;
            storyOverlay.classList.remove('hidden');
            storyOverlay.style.zIndex = '99998';
            setTimeout(() => {
                storyOverlay.classList.add('visible');
                storyOverlay.style.opacity = '1';
            }, 50);

            setTimeout(() => {
                if (isCutsceneSkipped) return;
                storyText.textContent = '';
                storyText.classList.remove('no-cursor');
                typeWriterStory("Once upon a time...", 0, () => {
                    setTimeout(() => {
                        if (isCutsceneSkipped) return;
                        storyOverlay.classList.remove('visible');
                        setTimeout(() => {
                            if (isCutsceneSkipped) return;
                            storyOverlay.classList.add('hidden');
                            startCutsceneSequence(); // ONLY START THIS AFTER STORY OVERLAY IS GONE
                            
                            setTimeout(() => {
                                if (isCutsceneSkipped) return;
                                skipPreludeBtn.classList.remove('hidden');
                                skipPreludeBtn.style.zIndex = '99999';
                            }, 7500);
                        }, 2000);
                    }, 3500); 
                });
            }, 1000);
        }, 6000); // 6s wait ensures intro text is entirely unwritten and black screen is dominant
    };

    // ----------------------------
    const cutsceneTexts = [
        "The year is 1888... Blackwood Manor sits high on a lonely hill... its dark towers reaching into the cold... foggy... sky. Inside... the house is massive... and silent... filled with heavy velvet curtains... and the smell of old dust.",
        "The owner... Arthur Brown... was a man of great wealth... but many... many enemies. One night... the silence was broken. He was found in his library... and the sight... was horrifying! It wasn't just a murder... it was an attack of pure... raw... rage.",
        "A sharp hunting knife had been plunged into his chest... so hard... the handle snapped! His blood stained the expensive Persian rugs... and his face was twisted in a final... silent... scream.",
        "Since that bloody night... the mansion has been locked tight. No one... has dared to enter... and no one... has been allowed to leave.",
        "To prevent the murderer from vanishing into the fog... the iron gates were bolted... trapping everyone inside the stone walls. There are only a few people left in this dark... hollow... house. The servants... the grieving widow... and the silent... nervous... guests.",
        "The killer didn't escape into the night. They are still here... breathing the same stale air... hiding behind a mask of innocence. As you raise your lantern... their shadows stretch long against the blood-stained floor.",
        "One of them... is a monster. And you... are the only one who can find them.."
    ];

    let currentBgIndex = 1;

    function setCutsceneImage(url, transitionDuration = 2000, effectClass = '') {
        const nextBgIndex = currentBgIndex === 1 ? 2 : 1;
        const currentBg = document.getElementById(`cutscene-bg-${currentBgIndex}`);
        const nextBg = document.getElementById(`cutscene-bg-${nextBgIndex}`);
        
        if (url.endsWith('.mp4')) {
            nextBg.innerHTML = `<video src="assets/videos/${url}" autoplay loop muted playsinline style="width: 100%; height: 100%; object-fit: cover;"></video>`;
            nextBg.style.backgroundImage = 'none';
        } else {
            nextBg.innerHTML = '';
            nextBg.style.backgroundImage = `url('assets/images/${url}')`;
        }
        
        nextBg.style.transition = `opacity ${transitionDuration}ms ease-in-out`;
        nextBg.className = `cutscene-bg ${effectClass}`; 
        nextBg.style.opacity = 1;

        currentBg.style.transition = `opacity ${transitionDuration}ms ease-in-out`;
        currentBg.style.opacity = 0;
        
        currentBgIndex = nextBgIndex;
    }

    function clearCutsceneImage(transitionDuration = 2000) {
        const currentBg = document.getElementById(`cutscene-bg-${currentBgIndex}`);
        currentBg.style.transition = `opacity ${transitionDuration}ms ease-in-out`;
        currentBg.style.opacity = 0;
    }

    function wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function performCutsceneStep(index) {
        return new Promise((resolve) => {
            if (isCutsceneSkipped) return resolve();
            
            const audio = cutsceneAudioElements[index];
            activeCutsceneAudio = audio;
            audio.volume = targetMusicVol;
            audio.currentTime = 0;
            
            let did09Trans = false;
            let did08Trans = false;

            const timeCheckInterval = setInterval(() => {
                if (index === 1 && audio.currentTime >= 9 && !did09Trans) {
                    did09Trans = true;
                    setCutsceneImage('scene3-arthurbrown.mp4', 3000);
                }
                if (index === 4 && audio.currentTime >= 8 && !did08Trans) {
                    did08Trans = true;
                    setCutsceneImage('scene5.mp4', 3000);
                }
            }, 100);

            let isResolved = false;

            const handleEnd = () => {
                if(isResolved) return;
                isResolved = true;
                clearInterval(timeCheckInterval);
                audio.pause();
                subtitleContainer.style.opacity = 0; 
                setTimeout(resolve, 1000);
            };

            // Force visual text writing
            subtitleContainer.style.opacity = 1;
            subtitleText.textContent = '';
            
            let charIndex = 0;
            const text = cutsceneTexts[index];
            
            // Validate audio and compute typing bounds (85% of audio duration to account for ending silence trailing)
            const isValidAudio = audio.duration && !isNaN(audio.duration) && audio.duration > 0;
            const targetDurationMs = isValidAudio ? (audio.duration * 1000 * 0.85) : text.length * 40;
            const minSequenceLockTime = targetDurationMs + 4000;
            
            const startTime = performance.now();
            
            function typeChar() {
                if (isCutsceneSkipped) return;
                if (charIndex < text.length) {
                    const elapsed = performance.now() - startTime;
                    const expectedChars = Math.floor((elapsed / targetDurationMs) * text.length);
                    
                    if (expectedChars > charIndex) {
                        charIndex = Math.min(expectedChars, text.length);
                        subtitleText.textContent = text.substring(0, charIndex);
                    }
                    requestAnimationFrame(typeChar);
                }
            }
            requestAnimationFrame(typeChar);

            let lockExpired = false;
            setTimeout(() => {
                lockExpired = true;
                // If audio already finished erroneously or is broken, advance now.
                if (audio.ended || audio.paused || audio.readyState === 0 || audio.error) {
                    handleEnd();
                }
            }, minSequenceLockTime);

            audio.onended = () => {
                if (lockExpired) {
                    handleEnd();
                }
            };

            let finalPlay = audio.play();
            if (finalPlay !== undefined) {
                finalPlay.catch(e => {
                    console.error("Audio sequence failure step " + index + ":", e);
                    
                    if (index === 1) {
                        setTimeout(() => setCutsceneImage('scene3-arthurbrown.mp4', 3000), 9000);
                    }
                    if (index === 4) {
                        setTimeout(() => setCutsceneImage('scene5.mp4', 3000), 8000);
                    }
                    // The minSequenceLockTime timeout will handle the resolve securely.
                });
            }
        });
    }

    async function startCutsceneSequence() {
        cutsceneLayer.classList.remove('hidden');
        cutsceneLayer.style.zIndex = '99997';
        cutsceneLayer.style.opacity = '1';
        
        // s1a1
        setCutsceneImage('scene1-mansion.mp4', 1000);
        await performCutsceneStep(0);
        await wait(500);
        
        // s1a2
        setCutsceneImage('scene2-arthurbrown.mp4', 1000);
        await performCutsceneStep(1); 
        await wait(500);

        // s1a3
        setCutsceneImage('scene3-arthurbrown.png', 1000, 'pan-right-zoom');
        await performCutsceneStep(2);
        await wait(500);

        // s1a4
        setCutsceneImage('scene4.mp4', 1000); 
        await performCutsceneStep(3);
        await wait(500);

        // s1a5
        await performCutsceneStep(4);
        await wait(500);

        // s1a6
        setCutsceneImage('scene5.png', 2000, 'pan-right-zoom');
        await performCutsceneStep(5);
        await wait(500);

        // s1final
        clearCutsceneImage(2000); 
        await performCutsceneStep(6);
        
        if (isCutsceneSkipped) return;

        // End of cutscene
        if (activeCutsceneAudio) activeCutsceneAudio.pause();
        thunderRain.pause();
        introMusic.pause();
        cutsceneAudioElements.forEach(aud => { aud.pause(); aud.currentTime = 0; });
        showRulesScreen();
    }
    // ----------------------------

    newGameBtn.addEventListener('click', () => {
        gameHasStarted = true; // game transition triggered, ignore fullscreen exits if they occur after this

        // Blur background assets
        bgImg.classList.add('blurred');
        content.classList.add('blurred');

        // Reveal Difficulty overlay
        difficultyOverlay.classList.remove('hidden');
        // setTimeout trick ensures the CSS transition hooks properly
        setTimeout(() => {
            difficultyOverlay.classList.add('visible');
        }, 50);
    });

    // ----- CUTSCENE LOGIC -----
    const cutsceneAudios = [
        'assets/generations/s1a1.mp3',
        'assets/generations/s1a2.mp3',
        'assets/generations/s1a3.mp3',
        'assets/generations/s1a4.mp3',
        'assets/generations/s1a5.mp3',
        'assets/generations/s1a6.mp3',
        'assets/generations/s1final.mp3'
    ];

    const cutsceneAudioElements = cutsceneAudios.map(src => {
        let aud = new Audio(src);
        document.body.appendChild(aud);
        return aud;
    });

    diffBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            selectedDifficulty = e.target.textContent.trim().toUpperCase();

            if (!localStorage.getItem('murf-key-validated') || !localStorage.getItem('ai-key-validated')) {
                showErrorPopup("Please configure and validate your AI Provider and Murf API keys in Settings before starting the game.");
                return;
            }

            // Synchronously authorize all cutscene audios explicitly inside a user gesture
            cutsceneAudioElements.forEach(aud => {
                aud.muted = true;
                let playPromise = aud.play();
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        aud.pause();
                        aud.currentTime = 0;
                        aud.muted = false;
                    }).catch(err => console.log('Audio init blocked:', err));
                }
            });
            
            triggerStart(); // Boot the overarching 10+ second delayed transition
        });
    });

    // Back button from Difficulty
    diffBackBtn.addEventListener('click', () => {
        difficultyOverlay.classList.remove('visible');
        setTimeout(() => {
            difficultyOverlay.classList.add('hidden');
            bgImg.classList.remove('blurred');
            content.classList.remove('blurred');
            gameHasStarted = false; // re-enable fullscreen checks if needed
        }, 500); // match css transition
    });

    // Settings logic
    settingsBtn.addEventListener('click', () => {
        document.getElementById('developer-options').style.display = 'block';
        document.getElementById('settings-home-btn').classList.add('hidden'); // Crucially strip Home Page button on Root menu
        bgImg.classList.add('blurred');
        content.classList.add('blurred');
        settingsOverlay.classList.remove('hidden');
        setTimeout(() => {
            settingsOverlay.classList.add('visible');
        }, 50);
    });

    document.getElementById('in-game-settings-btn').addEventListener('click', () => {
        document.getElementById('developer-options').style.display = 'none';
        document.getElementById('settings-home-btn').classList.remove('hidden'); // Guarantee Home Page is active in-game
        settingsOverlay.classList.remove('hidden');
        setTimeout(() => {
            settingsOverlay.classList.add('visible');
        }, 50);
    });

    settingsBackBtn.addEventListener('click', () => {
        settingsOverlay.classList.remove('visible');
        setTimeout(() => {
            settingsOverlay.classList.add('hidden');
            bgImg.classList.remove('blurred');
            content.classList.remove('blurred');
        }, 500);
    });

    document.getElementById('settings-quit-btn').addEventListener('click', () => { window.close(); });
    document.getElementById('settings-home-btn').addEventListener('click', () => { window.location.reload(); });

    // API Key Validation Logic
    const aiProviderSelect = document.getElementById('ai-provider-select');
    const aiKeyInput = document.getElementById('ai-key');
    const murfKeyInput = document.getElementById('murf-key');
    const validateAiKeyBtn = document.getElementById('validate-ai-key');
    const validateMurfKeyBtn = document.getElementById('validate-murf-key');

    if (localStorage.getItem('ai-provider')) {
        aiProviderSelect.value = localStorage.getItem('ai-provider');
    }
    if (localStorage.getItem('ai-key-validated')) {
        aiKeyInput.value = localStorage.getItem('ai-key-validated');
        validateAiKeyBtn.textContent = 'VALID';
        validateAiKeyBtn.style.color = '#5cb85c';
        validateAiKeyBtn.style.borderColor = '#5cb85c';
    }
    if (localStorage.getItem('murf-key-validated')) {
        murfKeyInput.value = localStorage.getItem('murf-key-validated');
        validateMurfKeyBtn.textContent = 'VALID';
        validateMurfKeyBtn.style.color = '#5cb85c';
        validateMurfKeyBtn.style.borderColor = '#5cb85c';
    }

    aiProviderSelect.addEventListener('change', () => {
        localStorage.setItem('ai-provider', aiProviderSelect.value);
        localStorage.removeItem('ai-key-validated');
        aiKeyInput.value = '';
        validateAiKeyBtn.textContent = 'VALIDATE';
        validateAiKeyBtn.style.color = '';
        validateAiKeyBtn.style.borderColor = '';
    });

    validateAiKeyBtn.addEventListener('click', () => {
        const val = aiKeyInput.value.trim();
        if (val.length > 5) { // Simple validation
            localStorage.setItem('ai-key-validated', val);
            localStorage.setItem('ai-provider', aiProviderSelect.value);
            validateAiKeyBtn.textContent = 'VALID';
            validateAiKeyBtn.style.color = '#5cb85c';
            validateAiKeyBtn.style.borderColor = '#5cb85c';
            if (clickSfx) { clickSfx.currentTime = 0; clickSfx.play().catch(e => {}); }
        } else {
            showErrorPopup("Invalid AI Provider API Key!");
        }
    });

    validateMurfKeyBtn.addEventListener('click', () => {
        const val = murfKeyInput.value.trim();
        if (val.length > 5) {
            localStorage.setItem('murf-key-validated', val);
            validateMurfKeyBtn.textContent = 'VALID';
            validateMurfKeyBtn.style.color = '#5cb85c';
            validateMurfKeyBtn.style.borderColor = '#5cb85c';
            if (clickSfx) { clickSfx.currentTime = 0; clickSfx.play().catch(e => {}); }
        } else {
            showErrorPopup("Invalid Murf API Key!");
        }
    });

    aiKeyInput.addEventListener('input', () => {
        validateAiKeyBtn.textContent = 'VALIDATE';
        validateAiKeyBtn.style.color = '';
        validateAiKeyBtn.style.borderColor = '';
        localStorage.removeItem('ai-key-validated');
    });
    
    murfKeyInput.addEventListener('input', () => {
        validateMurfKeyBtn.textContent = 'VALIDATE';
        validateMurfKeyBtn.style.color = '';
        validateMurfKeyBtn.style.borderColor = '';
        localStorage.removeItem('murf-key-validated');
    });

    // Volume Control Logic
    const masterVol = document.getElementById('master-vol');
    const audioVol = document.getElementById('audio-vol');
    const musicVol = document.getElementById('music-vol');

    const muteMaster = document.getElementById('mute-master');
    const muteAudio = document.getElementById('mute-audio');
    const muteMusic = document.getElementById('mute-music');

    let isMasterMuted = false;
    let isAudioMuted = false;
    let isMusicMuted = false;

    let masterVolumeValue = 1.0;
    let audioVolumeValue = 1.0;
    let musicVolumeValue = 1.0;

    let activeCutsceneAudio = null;
    let currentGameMusicBaseMultiplier = MUSIC_VOL_NORMAL;

    function updateVolumes() {
        let actualMusicVol = (isMasterMuted || isMusicMuted) ? 0 : masterVolumeValue * musicVolumeValue;
        let actualAudioVol = (isMasterMuted || isAudioMuted) ? 0 : masterVolumeValue * audioVolumeValue;
        
        introMusic.dataset.targetVolume = actualMusicVol; 
        
        thunderRain.dataset.targetVolume = actualMusicVol * 0.45;
        if(gameMusic) gameMusic.dataset.targetVolume = actualMusicVol * currentGameMusicBaseMultiplier;
        
        targetMusicVol = actualMusicVol;
        introMusic.volume = actualMusicVol;
        thunderRain.volume = actualMusicVol * 0.45;
        if(gameMusic) gameMusic.volume = actualMusicVol * currentGameMusicBaseMultiplier;
        
        clickSfx.volume = actualAudioVol;

        if (activeCutsceneAudio) {
            activeCutsceneAudio.volume = actualMusicVol;
        }
    }

    masterVol.addEventListener('input', (e) => {
        masterVolumeValue = e.target.value / 100;
        updateVolumes();
    });

    audioVol.addEventListener('input', (e) => {
        audioVolumeValue = e.target.value / 100;
        updateVolumes();
    });

    musicVol.addEventListener('input', (e) => {
        musicVolumeValue = e.target.value / 100;
        updateVolumes();
    });

    muteMaster.addEventListener('click', () => {
        isMasterMuted = !isMasterMuted;
        muteMaster.classList.toggle('muted', isMasterMuted);
        updateVolumes();
    });

    muteAudio.addEventListener('click', () => {
        isAudioMuted = !isAudioMuted;
        muteAudio.classList.toggle('muted', isAudioMuted);
        updateVolumes();
    });

    muteMusic.addEventListener('click', () => {
        isMusicMuted = !isMusicMuted;
        muteMusic.classList.toggle('muted', isMusicMuted);
        updateVolumes();
    });

    // Initial setting cache setup
    introMusic.dataset.targetVolume = 1.0;

    // --- Overlay UI & Skip System ---
    const skipPreludeBtn = document.getElementById('skip-prelude-btn');
    const rulesOverlay = document.getElementById('rules-overlay');
    const rulesDiffDisplay = document.getElementById('rules-diff-display');
    const rulesList = document.getElementById('rules-list');
    const acceptRulesBtn = document.getElementById('accept-rules-btn');
    
    function showRulesScreen() {
        cutsceneLayer.classList.add('hidden');
        storyOverlay.classList.add('hidden');
        skipPreludeBtn.classList.add('hidden');
        
        rulesDiffDisplay.textContent = selectedDifficulty;
        let questionsAllowed = 30;
        if (selectedDifficulty === 'MEDIUM') questionsAllowed = 25;
        if (selectedDifficulty === 'HARD') questionsAllowed = 20;

        rulesList.innerHTML = `
            <p>1. The complexity of the case scales with your difficulty. Trust no one; suspects will actively attempt to deceive you.</p>
            <p>2. You have a strict limit of <strong>${questionsAllowed}</strong> interrogations before you must lock in your final verdict.</p>
            <p>3. Verdict Condition: You must ask at least one question to EACH of the 5 suspects in the mansion.</p>
            <p>4. The Investigator's Log (Journal) allows you to document inconsistencies, alibis, and timelines. Once a page turns, it cannot be edited backwards.</p>
            <p>5. Time is ticking. The fog is thickening. The killer is watching.</p>
        `;

        rulesOverlay.classList.remove('hidden');
        setTimeout(() => rulesOverlay.classList.add('visible'), 50);
    }

    skipPreludeBtn.addEventListener('click', () => {
        isCutsceneSkipped = true;
        if (activeCutsceneAudio) activeCutsceneAudio.pause();
        thunderRain.pause();
        introMusic.pause();
        cutsceneAudioElements.forEach(aud => { aud.pause(); aud.currentTime = 0; });
        showRulesScreen();
    });



    acceptRulesBtn.addEventListener('click', () => {
        rulesOverlay.classList.remove('visible');
        setTimeout(() => {
            rulesOverlay.classList.add('hidden');
            openJournalBtn.classList.remove('hidden'); 
            document.getElementById('in-game-settings-btn').classList.remove('hidden');
            
            // Show suspects screen and global bottom bar
            const suspectsScreen = document.getElementById('suspects-screen');
            suspectsScreen.classList.remove('hidden');
            const globalBottomBar = document.getElementById('global-bottom-bar');
            globalBottomBar.classList.remove('hidden');
            
            // Set up total questions right before showing
            if (selectedDifficulty === 'MEDIUM') questionsTotal = 25;
            if (selectedDifficulty === 'HARD') questionsTotal = 20;
            document.getElementById('questions-total').textContent = questionsTotal;
            document.getElementById('questions-used').textContent = questionsUsed;

            setTimeout(() => {
                suspectsScreen.classList.add('visible');
                globalBottomBar.classList.add('visible');
                startGameTimer();

                currentGameMusicBaseMultiplier = MUSIC_VOL_NORMAL;
                updateVolumes();
                fadeInAudio(gameMusic, 2000, targetMusicVol * MUSIC_VOL_NORMAL);
            }, 50);
        }, 500);
    });

    // --- Suspects and Interrogation System ---
    const suspectsData = [
        { id: 'edward_hartwell', name: 'Edward Hartwell', role: 'Guest One', status: 'NOT QUESTIONED', pic: 'scared-guest.png', headshot: 'EdwardHartell-Scaredguest.png', interrogations: 0 },
        { id: 'thomas_blackwood', name: 'Thomas Blackwood', role: 'Guest Two', status: 'NOT QUESTIONED', pic: 'silent-guest.png', headshot: 'ThomasBlackwood-SilentGuest.png', interrogations: 0 },
        { id: 'victor_lancaster', name: 'Victor Lancaster', role: 'The Butler', status: 'NOT QUESTIONED', pic: 'butler.png', headshot: 'VictorLancaster-Butler.png', interrogations: 0 },
        { id: 'emma_graves', name: 'Emma Graves', role: 'The Maid', status: 'NOT QUESTIONED', pic: 'young-maid.png', headshot: 'EmmaGraves-Maid.png', interrogations: 0 },
        { id: 'lady_beatrice_vale', name: 'Lady Beatrice Vale', role: 'The Widow Wife', status: 'NOT QUESTIONED', pic: 'widow.png', headshot: 'LadyBeatriceVale-WidowWife.png', interrogations: 0 }
    ];

    let questionsUsed = 0;
    let questionsTotal = 30;
    
    // Timer
    let gameTimerInterval = null;
    let gameTimeSeconds = 0;

    function formatTime(totalSeconds) {
        const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
        const s = (totalSeconds % 60).toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    }

    function startGameTimer() {
        if (gameTimerInterval) return;
        gameTimerInterval = setInterval(() => {
            gameTimeSeconds++;
            document.getElementById('game-time').textContent = formatTime(gameTimeSeconds);
        }, 1000);
    }

    function renderSuspects() {
        const listDiv = document.getElementById('suspects-list');
        listDiv.innerHTML = '';

        suspectsData.forEach(s => {
            const card = document.createElement('div');
            card.className = 'suspect-card';
            
            // Note: I will use the actual images we have for the portraits.
            card.innerHTML = `
                <div class="suspect-portrait" style="background-image: url('assets/headshots/${s.headshot}')"></div>
                <div class="suspect-info">
                    <h3 class="suspect-name">${s.name}</h3>
                    <p class="suspect-role">${s.role}</p>
                    <p class="suspect-status">STATUS: <span>${s.status}</span> (Times Interrogated: ${s.interrogations})</p>
                </div>
                <button class="interrogate-btn-card" data-id="${s.id}">INTERROGATE</button>
            `;
            listDiv.appendChild(card);
        });

        // Add event listeners to all buttons
        document.querySelectorAll('.interrogate-btn-card').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const sid = e.target.getAttribute('data-id');
                openInterrogation(sid);
            });
            // Attach click sound
            btn.addEventListener('click', playClick);
        });
    }

    let currentSuspectId = null;

    function openInterrogation(suspectId) {
        currentSuspectId = suspectId;
        const suspect = suspectsData.find(s => s.id === suspectId);
        
        // Proper animation transition
        blackOverlay.classList.remove('fade-out');
        blackOverlay.classList.add('fade-in');
        
        setTimeout(() => {
            // Hide suspects screen
            document.getElementById('suspects-screen').classList.remove('visible');
            setTimeout(() => {
                document.getElementById('suspects-screen').classList.add('hidden');
            }, 500);

            // Prepare Interrogation UI
            const interBg = document.getElementById('interrogation-bg');
            interBg.style.backgroundImage = `url('assets/images/${suspect.pic}')`;
            
            // Add zoom animation class
            interBg.classList.remove('interrogation-anim-zoom');
            // Need a tiny timeout to re-trigger animation
            setTimeout(() => { interBg.classList.add('interrogation-anim-zoom'); }, 50);

            // Set up totals update (failsafe update)
            document.getElementById('questions-total').textContent = questionsTotal;
            document.getElementById('questions-used').textContent = questionsUsed;

            document.getElementById('interrogation-screen').classList.remove('hidden');
            
            // Fade out the black overlay
            setTimeout(() => {
                document.getElementById('interrogation-screen').classList.add('visible');
                blackOverlay.classList.remove('fade-in');
                blackOverlay.classList.add('fade-out');

                currentGameMusicBaseMultiplier = MUSIC_VOL_INTERROGATION;
                updateVolumes();
            }, 1000);
            
        }, 1500); // Wait for black overlay to cover
    }

    const errorPopupOverlay = document.getElementById('error-popup-overlay');
    const errorPopupMsg = document.getElementById('error-popup-msg');
    const errorPopupClose = document.getElementById('error-popup-close');
    const giveVerdictBtn = document.getElementById('give-verdict-btn');

    function showErrorPopup(msg) {
        if (clickSfx) {
            clickSfx.currentTime = 0;
            clickSfx.play().catch(e => {});
        }
        errorPopupMsg.textContent = msg;
        errorPopupOverlay.classList.remove('hidden');
        setTimeout(() => {
            errorPopupOverlay.classList.add('visible');
        }, 50);
    }

    errorPopupClose.addEventListener('click', () => {
        errorPopupOverlay.classList.remove('visible');
        setTimeout(() => {
            errorPopupOverlay.classList.add('hidden');
        }, 400);
    });

    function checkVerdictCondition() {
        const everyoneQuestioned = suspectsData.every(s => s.interrogations >= 1);
        if (everyoneQuestioned) {
            giveVerdictBtn.classList.remove('hidden');
        } else {
            giveVerdictBtn.classList.add('hidden');
        }
    }

    const verdictPopupOverlay = document.getElementById('verdict-popup-overlay');
    const verdictCloseBtn = document.getElementById('verdict-close-btn');
    const verdictSubmitBtn = document.getElementById('verdict-submit-btn');
    let selectedVerdictId = null;

    giveVerdictBtn.addEventListener('click', () => {
        if (clickSfx) { clickSfx.currentTime = 0; clickSfx.play().catch(e => {}); }
        verdictPopupOverlay.classList.remove('hidden');
        setTimeout(() => {
            verdictPopupOverlay.classList.add('visible');
        }, 50);
    });

    verdictCloseBtn.addEventListener('click', () => {
        if (clickSfx) { clickSfx.currentTime = 0; clickSfx.play().catch(e => {}); }
        verdictPopupOverlay.classList.remove('visible');
        setTimeout(() => {
            verdictPopupOverlay.classList.add('hidden');
        }, 400);
    });

    document.querySelectorAll('.verdict-suspect-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (clickSfx) { clickSfx.currentTime = 0; clickSfx.play().catch(err => {}); }
            document.querySelectorAll('.verdict-suspect-btn').forEach(b => b.classList.remove('selected'));
            e.currentTarget.classList.add('selected');
            selectedVerdictId = e.currentTarget.getAttribute('data-id');
            verdictSubmitBtn.disabled = false;
        });
    });

    verdictSubmitBtn.addEventListener('click', () => {
        if (!selectedVerdictId) return;
        if (clickSfx) { clickSfx.currentTime = 0; clickSfx.play().catch(e => {}); }
        console.log("FINAL VERDICT SUBMITTED: ", selectedVerdictId);
        // Can transition to ending sequence here based on selected verdict
    });

    // Mic button click inside interrogation
    document.getElementById('mic-btn').addEventListener('click', () => {
        if (!currentSuspectId) return;
        
        const suspect = suspectsData.find(s => s.id === currentSuspectId);
        if (!suspect) return;

        // Check if questions are exhausted
        if (questionsUsed >= questionsTotal) {
            showErrorPopup("All questions have been exhausted. You cannot interrogate any further. You must now give your final verdict.");
            return;
        }
        
        // Dynamic limit before everyone else is interrogated: 4 for HARD, else 5
        const maxConsecutiveQuestions = (selectedDifficulty === 'HARD') ? 4 : 5;
        if (suspect.interrogations >= maxConsecutiveQuestions) {
            const everyoneElseQuestioned = suspectsData.filter(s => s.id !== currentSuspectId).every(s => s.interrogations >= 1);
            if (!everyoneElseQuestioned) {
                showErrorPopup(`You must interrogate everyone at least once before asking this suspect more than ${maxConsecutiveQuestions} questions!`);
                return;
            }
        }

        questionsUsed++;
        document.getElementById('questions-used').textContent = questionsUsed;
        
        suspect.interrogations++;
        if (suspect.status === 'NOT QUESTIONED') suspect.status = 'QUESTIONED';
        renderSuspects(); // Re-render in background immediately
        checkVerdictCondition();

        if (questionsUsed >= questionsTotal) {
            showErrorPopup("All questions have been exhausted. You cannot interrogate any further. You must now give your final verdict.");
        }
    });

    document.getElementById('exit-interrogation-btn').addEventListener('click', () => {
        // Transition back
        blackOverlay.classList.remove('fade-out');
        blackOverlay.classList.add('fade-in');

        setTimeout(() => {
            document.getElementById('interrogation-screen').classList.remove('visible');
            setTimeout(() => {
                document.getElementById('interrogation-screen').classList.add('hidden');
                
                // Show suspects
                const suspectsScreen = document.getElementById('suspects-screen');
                suspectsScreen.classList.remove('hidden');
                
                currentGameMusicBaseMultiplier = MUSIC_VOL_NORMAL;
                updateVolumes();
                
                setTimeout(() => {
                    suspectsScreen.classList.add('visible');
                    blackOverlay.classList.remove('fade-in');
                    blackOverlay.classList.add('fade-out');
                }, 100);
                
            }, 500);
        }, 1500);
    });

    // Initial render
    renderSuspects();

    // --- Journal System ---
    const journalWrapper = document.getElementById('journal-wrapper');
    const journalInput = document.getElementById('journal-input');
    const journalWindow = document.getElementById('journal-window'); // Outer snapping block
    const journalPrev = document.getElementById('journal-prev');
    const journalNext = document.getElementById('journal-next');
    const journalPageNum = document.getElementById('journal-page-num');
    const closeJournalBtn = document.getElementById('close-journal-btn');
    const openJournalBtn = document.getElementById('open-journal-btn');
    
    let currentJournalPage = 0;

    function checkCursorPage() {
        setTimeout(() => {
            const h = journalWindow.clientHeight;
            if (h === 0) return;
            const st = journalWindow.scrollTop;
            const currentTop = currentJournalPage * h;
            
            let newPage = currentJournalPage;
            if (st > currentTop + 5) {
                newPage = Math.ceil(st / h);
            } else if (st < currentTop - 5) {
                newPage = Math.floor(st / h);
            }
            
            if (newPage !== currentJournalPage) {
                currentJournalPage = newPage;
                journalPageNum.textContent = currentJournalPage + 1;
                journalWindow.scrollTo({ top: currentJournalPage * h, behavior: 'smooth' });
            } else if (Math.abs(st - currentTop) > 5) {
                journalWindow.scrollTo({ top: currentTop, behavior: 'smooth' }); // Snap back securely
            }
        }, 10);
    }

    // Since it's contenteditable, clicking padding focuses at the end natively
    journalInput.addEventListener('input', checkCursorPage);
    journalInput.addEventListener('keyup', checkCursorPage);
    journalInput.addEventListener('click', checkCursorPage);

    // Block physical wheel scroll internally to prevent desyncs
    journalWindow.addEventListener('wheel', (e) => {
        e.preventDefault();
        if (e.deltaY > 0) {
            journalNext.click();
        } else if (e.deltaY < 0) {
            journalPrev.click();
        }
    });

    journalPrev.addEventListener('click', () => {
        if (currentJournalPage > 0) {
            currentJournalPage--;
            journalPageNum.textContent = currentJournalPage + 1;
            journalWindow.scrollTo({ top: currentJournalPage * journalWindow.clientHeight, behavior: 'smooth' });
        }
    });

    journalNext.addEventListener('click', () => {
        const h = journalWindow.clientHeight;
        if (journalWindow.scrollHeight - h > (currentJournalPage + 1) * h - 5) { 
            // Allow turning as long as we haven't hit the strict padding floor
            currentJournalPage++;
            journalPageNum.textContent = currentJournalPage + 1;
            journalWindow.scrollTo({ top: currentJournalPage * h, behavior: 'smooth' });
        }
    });

    closeJournalBtn.addEventListener('click', () => {
        journalWrapper.classList.add('hidden');
    });

    openJournalBtn.addEventListener('click', () => {
        journalWrapper.classList.remove('hidden');
        setTimeout(() => {
            journalInput.focus();
        }, 50);
    });

    // --- Anti-Cheating & Security ---
    document.addEventListener('contextmenu', e => e.preventDefault());
    
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            e.preventDefault();
            window.location.reload();
            return;
        }
        if (e.key === 'F12' || 
           (e.ctrlKey && e.shiftKey && (e.key.toLowerCase() === 'i' || e.key.toLowerCase() === 'j' || e.key.toLowerCase() === 'c')) || 
           (e.ctrlKey && e.key.toLowerCase() === 'u')) {
            e.preventDefault();
        }
    });

    document.addEventListener('fullscreenchange', () => {
        if (!document.fullscreenElement && fsScreen.style.display === 'none') {
            window.location.reload();
        }
    });

});
