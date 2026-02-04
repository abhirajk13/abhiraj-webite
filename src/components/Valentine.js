import React, { useState, useEffect, useRef, useCallback } from 'react';
import './Valentine.css';

/**
 * Valentine's Day Proposal Page for Riya
 * A romantic, playful, and dramatic page asking Riya to be my Valentine
 * Features: Floating hearts, runaway NO button, mini-game, celebration effects
 */

const Valentine = () => {
  // ==================== STATE MANAGEMENT ====================
  const [gamePhase, setGamePhase] = useState('intro'); // intro, catching, asking, celebration
  const [heartsCollected, setHeartsCollected] = useState(0);
  const [noButtonPosition, setNoButtonPosition] = useState({ x: 0, y: 0 });
  const [noButtonEscapeCount, setNoButtonEscapeCount] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [floatingHearts, setFloatingHearts] = useState([]);
  const [clickableHearts, setClickableHearts] = useState([]);
  const [sparkles, setSparkles] = useState([]);
  const [fireworks, setFireworks] = useState([]);
  
  const audioRef = useRef(null);
  const celebrationAudioRef = useRef(null);
  const containerRef = useRef(null);
  
  const HEARTS_TO_COLLECT = 5; // Number of hearts to catch before YES becomes active

  // ==================== FLOATING BACKGROUND HEARTS ====================
  useEffect(() => {
    // Create initial floating hearts for background ambiance
    const createFloatingHeart = () => ({
      id: Math.random(),
      x: Math.random() * 100,
      y: 100 + Math.random() * 20,
      size: 15 + Math.random() * 25,
      duration: 8 + Math.random() * 12,
      delay: Math.random() * 5,
      emoji: ['💕', '💖', '💗', '💘', '💝', '❤️', '🩷', '💜'][Math.floor(Math.random() * 8)]
    });

    const initialHearts = Array.from({ length: 20 }, createFloatingHeart);
    setFloatingHearts(initialHearts);

    // Continuously add new hearts
    const interval = setInterval(() => {
      setFloatingHearts(prev => [...prev.slice(-25), createFloatingHeart()]);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // ==================== CLICKABLE HEARTS FOR MINI-GAME ====================
  const spawnClickableHeart = useCallback(() => {
    if (gamePhase !== 'catching') return;
    
    const newHeart = {
      id: Math.random(),
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 70,
      size: 40 + Math.random() * 20,
      emoji: ['💖', '💕', '💗', '💘'][Math.floor(Math.random() * 4)]
    };
    
    setClickableHearts(prev => [...prev, newHeart]);
    
    // Remove heart after 3 seconds if not clicked
    setTimeout(() => {
      setClickableHearts(prev => prev.filter(h => h.id !== newHeart.id));
    }, 3000);
  }, [gamePhase]);

  useEffect(() => {
    if (gamePhase === 'catching') {
      // Spawn hearts periodically during catching phase
      const interval = setInterval(spawnClickableHeart, 1000);
      spawnClickableHeart(); // Spawn first heart immediately
      return () => clearInterval(interval);
    }
  }, [gamePhase, spawnClickableHeart]);

  // ==================== HEART CLICK HANDLER ====================
  const handleHeartClick = (heartId) => {
    setClickableHearts(prev => prev.filter(h => h.id !== heartId));
    setHeartsCollected(prev => {
      const newCount = prev + 1;
      if (newCount >= HEARTS_TO_COLLECT) {
        setGamePhase('asking');
      }
      return newCount;
    });
    
    // Create sparkle effect at click location
    createSparkles();
  };

  // ==================== SPARKLE EFFECTS ====================
  const createSparkles = () => {
    const newSparkles = Array.from({ length: 8 }, () => ({
      id: Math.random(),
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 10 + Math.random() * 20
    }));
    setSparkles(prev => [...prev, ...newSparkles]);
    setTimeout(() => setSparkles([]), 1000);
  };

  // ==================== NO BUTTON ESCAPE LOGIC ====================
  const handleNoButtonHover = () => {
    if (gamePhase !== 'asking') return;
    
    const container = containerRef.current;
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    const buttonWidth = 120;
    const buttonHeight = 50;
    const padding = 20;
    
    // Calculate random new position, getting more erratic with each escape
    const maxX = rect.width - buttonWidth - padding;
    const maxY = rect.height - buttonHeight - padding;
    
    // Increase escape distance with each attempt
    const escapeMultiplier = Math.min(1 + noButtonEscapeCount * 0.2, 2);
    
    let newX = padding + Math.random() * maxX * escapeMultiplier;
    let newY = padding + Math.random() * maxY * escapeMultiplier;
    
    // Keep within bounds
    newX = Math.max(padding, Math.min(newX, maxX));
    newY = Math.max(padding, Math.min(newY, maxY));
    
    setNoButtonPosition({ x: newX, y: newY });
    setNoButtonEscapeCount(prev => prev + 1);
  };

  // ==================== YES BUTTON CLICK - CELEBRATION ====================
  const handleYesClick = () => {
    if (gamePhase !== 'asking') return;
    
    setGamePhase('celebration');
    setShowConfetti(true);
    
    // Start celebration fireworks
    triggerFireworks();
    
    // Try to play celebration music
    if (celebrationAudioRef.current) {
      celebrationAudioRef.current.play().catch(() => {});
    }
  };

  // ==================== FIREWORKS ANIMATION ====================
  const triggerFireworks = () => {
    const createFirework = () => ({
      id: Math.random(),
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 60,
      color: ['#ff69b4', '#ff1493', '#ff6b6b', '#ffd700', '#ff85a2'][Math.floor(Math.random() * 5)]
    });

    // Burst of fireworks
    const burst = () => {
      setFireworks(prev => [...prev, createFirework()]);
      setTimeout(() => setFireworks(prev => prev.slice(1)), 2000);
    };

    // Multiple bursts over time
    for (let i = 0; i < 20; i++) {
      setTimeout(burst, i * 300);
    }
  };

  // ==================== MUSIC TOGGLE ====================
  const toggleMusic = () => {
    if (audioRef.current) {
      if (musicPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(() => {});
      }
      setMusicPlaying(!musicPlaying);
    }
  };

  // ==================== START MINI-GAME ====================
  const startGame = () => {
    setGamePhase('catching');
  };

  // ==================== CONFETTI COMPONENT ====================
  const Confetti = () => {
    const confettiPieces = Array.from({ length: 150 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 3 + Math.random() * 2,
      color: ['#ff69b4', '#ff1493', '#ff6b6b', '#ffd700', '#ff85a2', '#e91e63', '#9c27b0'][Math.floor(Math.random() * 7)],
      size: 8 + Math.random() * 8,
      shape: ['square', 'circle', 'heart'][Math.floor(Math.random() * 3)]
    }));

    return (
      <div className="confetti-container">
        {confettiPieces.map(piece => (
          <div
            key={piece.id}
            className={`confetti-piece confetti-${piece.shape}`}
            style={{
              left: `${piece.left}%`,
              animationDelay: `${piece.delay}s`,
              animationDuration: `${piece.duration}s`,
              backgroundColor: piece.shape !== 'heart' ? piece.color : 'transparent',
              width: piece.size,
              height: piece.size,
              color: piece.color
            }}
          >
            {piece.shape === 'heart' && '❤️'}
          </div>
        ))}
      </div>
    );
  };

  // ==================== RENDER ====================
  return (
    <div className="valentine-container" ref={containerRef}>
      {/* Background audio elements */}
      <audio ref={audioRef} loop>
        <source src="https://www.soundjay.com/misc/sounds/romantic-2.mp3" type="audio/mpeg" />
      </audio>
      <audio ref={celebrationAudioRef}>
        <source src="https://www.soundjay.com/misc/sounds/fanfare-1.mp3" type="audio/mpeg" />
      </audio>

      {/* Floating background hearts */}
      <div className="floating-hearts-bg">
        {floatingHearts.map(heart => (
          <span
            key={heart.id}
            className="floating-heart"
            style={{
              left: `${heart.x}%`,
              fontSize: `${heart.size}px`,
              animationDuration: `${heart.duration}s`,
              animationDelay: `${heart.delay}s`
            }}
          >
            {heart.emoji}
          </span>
        ))}
      </div>

      {/* Music toggle button */}
      <button className="music-toggle" onClick={toggleMusic}>
        {musicPlaying ? '🔊' : '🔇'} Music
      </button>

      {/* ==================== INTRO PHASE ==================== */}
      {gamePhase === 'intro' && (
        <div className="intro-screen">
          <h1 className="main-title animate-title">
            Riya, will you be my Valentine? 💖
          </h1>
          <p className="subtitle animate-subtitle">
            But first... catch some hearts to prove your love! 💕
          </p>
          <button className="start-button bounce-animation" onClick={startGame}>
            Start the Love Game 💘
          </button>
        </div>
      )}

      {/* ==================== CATCHING PHASE (MINI-GAME) ==================== */}
      {gamePhase === 'catching' && (
        <div className="catching-screen">
          <h2 className="catching-title">Catch the Hearts! 💖</h2>
          <div className="hearts-counter">
            <span className="heart-count">{heartsCollected}</span>
            <span className="heart-total">/ {HEARTS_TO_COLLECT}</span>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${(heartsCollected / HEARTS_TO_COLLECT) * 100}%` }}
              />
            </div>
          </div>
          
          {/* Clickable hearts */}
          {clickableHearts.map(heart => (
            <button
              key={heart.id}
              className="clickable-heart pulse-animation"
              style={{
                left: `${heart.x}%`,
                top: `${heart.y}%`,
                fontSize: `${heart.size}px`
              }}
              onClick={() => handleHeartClick(heart.id)}
            >
              {heart.emoji}
            </button>
          ))}
          
          {/* Sparkle effects */}
          {sparkles.map(sparkle => (
            <span
              key={sparkle.id}
              className="sparkle"
              style={{
                left: `${sparkle.x}%`,
                top: `${sparkle.y}%`,
                fontSize: `${sparkle.size}px`
              }}
            >
              ✨
            </span>
          ))}
        </div>
      )}

      {/* ==================== ASKING PHASE ==================== */}
      {gamePhase === 'asking' && (
        <div className="asking-screen">
          <h1 className="asking-title animate-title">
            Riya, will you be my Valentine? 💖
          </h1>
          
          <div className="buttons-container">
            <button 
              className="yes-button bounce-animation"
              onClick={handleYesClick}
            >
              YES 💕
            </button>
            
            <button
              className="no-button"
              style={{
                position: noButtonEscapeCount > 0 ? 'absolute' : 'relative',
                left: noButtonEscapeCount > 0 ? `${noButtonPosition.x}px` : 'auto',
                top: noButtonEscapeCount > 0 ? `${noButtonPosition.y}px` : 'auto',
                transform: `scale(${Math.max(0.5, 1 - noButtonEscapeCount * 0.1)})`,
                opacity: Math.max(0.3, 1 - noButtonEscapeCount * 0.1)
              }}
              onMouseEnter={handleNoButtonHover}
              onTouchStart={handleNoButtonHover}
            >
              NO 😈
            </button>
          </div>
          
          {noButtonEscapeCount > 0 && (
            <p className="escape-message">
              {noButtonEscapeCount === 1 && "The NO button ran away! 😜"}
              {noButtonEscapeCount === 2 && "Are you sure you want to say no? 🥺"}
              {noButtonEscapeCount === 3 && "Think again... 💭"}
              {noButtonEscapeCount === 4 && "Last chance! 😏"}
              {noButtonEscapeCount >= 5 && "Just click YES already! 💖"}
            </p>
          )}
        </div>
      )}

      {/* ==================== CELEBRATION PHASE ==================== */}
      {gamePhase === 'celebration' && (
        <div className="celebration-screen">
          {showConfetti && <Confetti />}
          
          {/* Fireworks */}
          {fireworks.map(fw => (
            <div
              key={fw.id}
              className="firework"
              style={{
                left: `${fw.x}%`,
                top: `${fw.y}%`,
                '--fw-color': fw.color
              }}
            />
          ))}
          
          <div className="celebration-content">
            <h1 className="celebration-title animate-celebration">
              SHE SAID YES!!! 💖🎉
            </h1>
            
            <div className="hearts-explosion">
              {Array.from({ length: 30 }, (_, i) => (
                <span 
                  key={i} 
                  className="explosion-heart"
                  style={{
                    animationDelay: `${i * 0.1}s`,
                    '--angle': `${(i * 12)}deg`
                  }}
                >
                  ❤️
                </span>
              ))}
            </div>
            
            <p className="celebration-message animate-message">
              Happy Valentine's Day Riya ❤️
            </p>
            <p className="celebration-submessage animate-submessage">
              You are my favorite person in the universe. 🌌
            </p>
            
            <div className="final-message animate-final">
              <p className="love-quote">
                "I choose you today, tomorrow, and always." 💕
              </p>
            </div>
            
            <div className="floating-emojis-celebration">
              {['💕', '💘', '💖', '💗', '💝', '🌹', '✨', '🦋'].map((emoji, i) => (
                <span 
                  key={i} 
                  className="floating-emoji"
                  style={{ 
                    animationDelay: `${i * 0.5}s`,
                    left: `${10 + i * 12}%`
                  }}
                >
                  {emoji}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Valentine;
