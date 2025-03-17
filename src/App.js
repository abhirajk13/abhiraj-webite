import { useState, useEffect, useRef } from 'react';
import './App.css';
import Personal from './components/Personal';

function FlappyBird() {
  const canvasRef = useRef(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  
  const birdRef = useRef({
    y: 250,
    velocity: 0,
    gravity: 0.6,
    jump: -10,
  });

  const pipesRef = useRef([]);
  const animationFrameRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let bird = birdRef.current;
    let pipes = pipesRef.current;

    const createPipe = () => {
      const gap = 150;
      const minHeight = 50;
      const maxHeight = canvas.height - gap - minHeight;
      const height = Math.random() * (maxHeight - minHeight) + minHeight;
      
      return {
        x: canvas.width,
        height,
        gap,
        counted: false
      };
    };

    const drawBird = () => {
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(100, bird.y, 15, 0, 2 * Math.PI);
      ctx.fill();
    };

    const drawPipes = () => {
      ctx.fillStyle = '#4CAF50';
      pipes.forEach(pipe => {
        // Top pipe
        ctx.fillRect(pipe.x, 0, 50, pipe.height);
        // Bottom pipe
        ctx.fillRect(pipe.x, pipe.height + pipe.gap, 50, canvas.height);
      });
    };

    const updateGame = () => {
      if (!gameStarted || gameOver) return;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update bird
      bird.velocity += bird.gravity;
      bird.y += bird.velocity;

      // Update pipes
      if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - 300) {
        pipes.push(createPipe());
      }

      pipes.forEach((pipe, index) => {
        pipe.x -= 2;

        // Check collision
        if (
          100 < pipe.x + 50 &&
          100 > pipe.x &&
          (bird.y < pipe.height || bird.y > pipe.height + pipe.gap)
        ) {
          setGameOver(true);
          setHighScore(prev => Math.max(prev, score));
          return;
        }

        // Score point
        if (!pipe.counted && pipe.x < 100) {
          pipe.counted = true;
          setScore(prev => prev + 1);
        }
      });

      // Remove off-screen pipes
      pipesRef.current = pipes.filter(pipe => pipe.x > -50);

      // Check boundaries
      if (bird.y > canvas.height || bird.y < 0) {
        setGameOver(true);
        setHighScore(prev => Math.max(prev, score));
        return;
      }

      // Draw everything
      drawBird();
      drawPipes();

      // Draw score
      ctx.fillStyle = 'white';
      ctx.font = '24px Arial';
      ctx.fillText(`Score: ${score}`, 10, 30);

      animationFrameRef.current = requestAnimationFrame(updateGame);
    };

    const handleClick = () => {
      if (gameOver) {
        // Reset game
        bird.y = 250;
        bird.velocity = 0;
        pipesRef.current = [];
        setScore(0);
        setGameOver(false);
      } else {
        if (!gameStarted) {
          setGameStarted(true);
        }
        bird.velocity = bird.jump;
      }
    };

    canvas.addEventListener('click', handleClick);
    if (gameStarted && !gameOver) {
      animationFrameRef.current = requestAnimationFrame(updateGame);
    }

    return () => {
      canvas.removeEventListener('click', handleClick);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [gameStarted, gameOver, score]);

  return (
    <div className="flappy-bird-container">
      <div className="game-header">
        <h3>High Score: {highScore}</h3>
      </div>
      <canvas
        ref={canvasRef}
        width={1200}
        height={700}
        className="flappy-bird-canvas"
      />
      {!gameStarted && (
        <div className="game-overlay">
          <h2>Flappy Bird</h2>
          <p>Click to start</p>
        </div>
      )}
      {gameOver && (
        <div className="game-overlay">
          <h2>Game Over!</h2>
          <p>Score: {score}</p>
          <p>Click to play again</p>
        </div>
      )}
    </div>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  
  const images = [
    {
      url: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=1200',
      country: 'India',
      description: 'Taj Mahal, Agra'
    },
    {
      url: 'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?q=80&w=1200',
      country: 'USA',
      description: 'Statue of Liberty, New York'
    },
    {
      url: 'https://images.unsplash.com/photo-1518638150340-f706e86654de?q=80&w=1200',
      country: 'Mexico',
      description: 'Chichen Itza'
    },
    {
      url: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=1200',
      country: 'Madeira',
      description: 'Funchal Harbor'
    },
    {
      url: 'https://images.unsplash.com/photo-1513735492246-483525079686?q=80&w=1200',
      country: 'Portugal',
      description: 'Lisbon Old Town'
    },
    {
      url: 'https://images.unsplash.com/photo-1523365154888-8a758819b722?q=80&w=1200',
      country: 'Sicily',
      description: 'Taormina Ancient Theatre'
    },
    {
      url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1200',
      country: 'France',
      description: 'Paris, Eiffel Tower'
    },
    {
      url: 'https://images.unsplash.com/photo-1597832071622-c850b1b9cace?q=80&w=1200',
      country: 'France',
      description: 'Lille Old Town'
    },
    {
      url: 'https://images.unsplash.com/photo-1491557345352-5929e343eb89?q=80&w=1200',
      country: 'Belgium',
      description: 'Bruges Canal'
    },
    {
      url: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?q=80&w=1200',
      country: 'Turkey',
      description: 'Istanbul, Hagia Sophia'
    },
    {
      url: 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?q=80&w=1200',
      country: 'Morocco',
      description: 'Marrakesh Medina'
    },
    {
      url: 'https://images.unsplash.com/photo-1511527661048-7fe73d85e9a4?q=80&w=1200',
      country: 'Spain',
      description: 'Barcelona, Sagrada Familia'
    },
    {
      url: 'https://images.unsplash.com/photo-1559636425-c7d0eb51fe53?q=80&w=1200',
      country: 'Spain',
      description: 'Seville, Plaza de España'
    }
  ];

  const socialLinks = {
    github: "https://github.com/abhirajk13",
    linkedin: "https://linkedin.com/in/yourusername",
    twitter: "https://twitter.com/yourusername",
    instagram: "https://instagram.com/yourusername"
  };

  const skills = [
    { name: "Web Development", level: 90 },
    { name: "Machine Learning", level: 85 },
    { name: "Cloud Computing", level: 80 },
    { name: "UI/UX Design", level: 75 }
  ];

  const nextImage = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    setTimeout(() => setIsTransitioning(false), 500); // Match transition duration
  };

  const prevImage = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
    setTimeout(() => setIsTransitioning(false), 500); // Match transition duration
  };

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextImage();
    }
    if (isRightSwipe) {
      prevImage();
    }

    setTouchStart(0);
    setTouchEnd(0);
  };

  return (
    <div className="App">
      <nav className="navbar">
        <div className="nav-brand">
          <h1>Abhiraj</h1>
        </div>
        <div className="nav-links">
          <a 
            href="#home" 
            className={`nav-link ${activeTab === 'home' ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('home');
            }}
          >
            Home
          </a>
          <a 
            href="#achievements" 
            className={`nav-link ${activeTab === 'achievements' ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('achievements');
            }}
          >
            Achievements
          </a>
          <a 
            href="#countries" 
            className={`nav-link ${activeTab === 'countries' ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('countries');
            }}
          >
            Countries
          </a>
          <a 
            href="#cool-stuff" 
            className={`nav-link ${activeTab === 'cool-stuff' ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('cool-stuff');
            }}
          >
            Cool Stuff
          </a>
          <a 
            href="#personal" 
            className={`nav-link ${activeTab === 'personal' ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('personal');
            }}
          >
            Personal
          </a>
          <a href="#about" className="nav-link">About</a>
          <a href="#contact" className="nav-link">Contact</a>
        </div>
        <button className="contact-button">Get in Touch</button>
      </nav>

      <div className="main-content">
        {activeTab === 'home' && (
          <>
            <div className="hero-section">
              <h1 className="hero-title">Welcome to My World</h1>
              <p className="hero-subtitle">Exploring Technology & Innovation</p>
              <div className="social-links">
                <a href={socialLinks.github} target="_blank" rel="noopener noreferrer" className="social-icon">
                  <i className="fab fa-github"></i>
                </a>
                <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="social-icon">
                  <i className="fab fa-linkedin"></i>
                </a>
                <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="social-icon">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="social-icon">
                  <i className="fab fa-instagram"></i>
                </a>
              </div>
            </div>

            <div className="about-section">
              <div className="about-content">
                <div className="about-text">
                  <h2>About Me</h2>
                  <p className="about-description">
                    Hi there! I'm a passionate software developer and technology enthusiast
                    with a keen interest in building innovative solutions. With experience
                    spanning web development, machine learning, and cloud computing,
                    I love taking on challenging projects that push the boundaries of what's possible.
                  </p>
                  <div className="stats-grid">
                    <div className="stat-item">
                      <h3>3+</h3>
                      <p>Years Experience</p>
                    </div>
                    <div className="stat-item">
                      <h3>50+</h3>
                      <p>Projects Completed</p>
                    </div>
                    <div className="stat-item">
                      <h3>20+</h3>
                      <p>Happy Clients</p>
                    </div>
                  </div>
                </div>
                <div className="skills-container">
                  <h3>Technical Skills</h3>
                  {skills.map((skill) => (
                    <div key={skill.name} className="skill-item">
                      <div className="skill-header">
                        <span>{skill.name}</span>
                        <span>{skill.level}%</span>
                      </div>
                      <div className="skill-bar">
                        <div 
                          className="skill-progress" 
                          style={{ width: `${skill.level}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="cta-section">
              <h2>Let's Work Together</h2>
              <p>Interested in collaborating or have a project in mind?</p>
              <button className="cta-button">Get In Touch</button>
            </div>
          </>
        )}

        <div className="tab-content">
          {activeTab === 'achievements' && (
            <div>
              <h2>My Achievements</h2>
              <ul>
                <li>Achievement 1</li>
                <li>Achievement 2</li>
                <li>Achievement 3</li>
              </ul>
            </div>
          )}

          {activeTab === 'countries' && (
            <div className="countries-section">
              <h2>Countries I've Visited</h2>
              <div 
                className="carousel-container"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <div className="carousel-track">
                  {[-1, 0, 1].map((offset) => {
                    const index = (currentImageIndex + offset + images.length) % images.length;
                    return (
                      <div 
                        key={`${index}-${offset}`}
                        className={`carousel-item ${offset === 0 ? 'active' : offset === -1 ? 'prev' : 'next'}`}
                        onClick={() => offset !== 0 && (offset === -1 ? prevImage() : nextImage())}
                      >
                        <img 
                          src={images[index].url} 
                          alt={images[index].country}
                          loading={offset === 0 ? "eager" : "lazy"}
                          decoding="async"
                        />
                        {offset === 0 && (
                          <div className="image-caption">
                            <h3>{images[index].country}</h3>
                            <p>{images[index].description}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'cool-stuff' && (
            <div className="cool-stuff-section">
              <FlappyBird />
            </div>
          )}

          {activeTab === 'personal' && <Personal />}
        </div>
      </div>
    </div>
  );
}

export default App;
