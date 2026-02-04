import { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Personal from './components/Personal';
import InteractiveGlobe from './components/InteractiveGlobe';
import { CountryDropdown, PhotoGallery } from './components/CountryDropdown';
import AdminPanel from './components/AdminPanel';
import PhotoManager from './components/PhotoManager';
import DataManager from './components/DataManager';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import Valentine from './components/Valentine';

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

function AppContent() {
  const { isDarkMode, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('home');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [visitedCountries, setVisitedCountries] = useState(() => {
    try {
      const saved = localStorage.getItem('visitedCountries');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.warn('Failed to load visited countries from localStorage:', error);
      return [];
    }
  });
  const [countryPhotos, setCountryPhotos] = useState(() => {
    try {
      const saved = localStorage.getItem('countryPhotos');
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.warn('Failed to load country photos from localStorage:', error);
      return {};
    }
  });
  
  const images = [];

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

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Save visited countries to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('visitedCountries', JSON.stringify(visitedCountries));
    } catch (error) {
      console.warn('Failed to save visited countries to localStorage:', error);
    }
  }, [visitedCountries]);

  // Save country photos to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('countryPhotos', JSON.stringify(countryPhotos));
    } catch (error) {
      console.warn('Failed to save country photos to localStorage:', error);
    }
  }, [countryPhotos]);

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
  };

  const handleGlobeCountryClick = (country) => {
    setSelectedCountry(country.name);
  };

  const handleAddPin = (newPin) => {
    setVisitedCountries(prev => [...prev, newPin]);
  };

  const handleRemovePin = (index) => {
    setVisitedCountries(prev => prev.filter((_, i) => i !== index));
  };

  const toggleAdmin = () => {
    setIsAdmin(!isAdmin);
  };

  const handlePhotosUpdate = (country, photos) => {
    setCountryPhotos(prev => ({
      ...prev,
      [country]: photos
    }));
  };

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <h2>Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className={`App ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
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
        </div>
        <div className="nav-actions">
          <button className="theme-toggle" onClick={toggleTheme}>
            <i className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i>
          </button>
        <button className="contact-button">Get in Touch</button>
        </div>
      </nav>

      <div className="main-content">
        {activeTab === 'home' && (
          <>
            <div className="hero-section">
              <h1 className="hero-title">Abhiraj Kane</h1>
              <p className="hero-subtitle">Salesforce Integration Consultant</p>
              <div className="contact-info">
                <div className="contact-item">
                  <i className="fas fa-envelope"></i>
                  <span>abhirajkane@gmail.com</span>
                </div>
                <div className="contact-item">
                  <i className="fas fa-phone"></i>
                  <span>+44 (0)7957365499</span>
                </div>
                <div className="contact-item">
                  <i className="fas fa-map-marker-alt"></i>
                  <span>Ruislip, UK</span>
                </div>
              </div>
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

            <div className="profile-section">
              <h2>Professional Profile</h2>
              <p className="profile-description">
                A motivated Consultant with a strong track record of delivering scalable, enterprise-grade integration solutions across the EMEA region. Experienced in API-led connectivity, cloud platforms, DevOps best practices, and digital transformation strategy. Proven ability to lead cross-functional teams, manage full API lifecycles, and support complex system migrations. Strong communicator and collaborator, committed to delivering value-driven outcomes and long-term client success.
              </p>
            </div>

            <div className="education-section">
              <h2>Education</h2>
              <div className="education-grid">
                <div className="education-item">
                  <h3>University College London (UCL)</h3>
                  <p className="degree">MSc Technology Management</p>
                  <p className="duration">2024–2026, Predicted Distinction</p>
                </div>
                <div className="education-item">
                  <h3>Royal Holloway, University of London</h3>
                  <p className="degree">BSc Computer Science with Artificial Intelligence</p>
                  <p className="duration">2019–2022, First Class Honours</p>
                </div>
              </div>
            </div>

            <div className="experience-section">
              <h2>Professional Experience</h2>
              <div className="experience-timeline">
                <div className="experience-item">
                  <div className="experience-header">
                    <h3>Salesforce Integration Consultant</h3>
                    <span className="duration">Sep 2022 – Present</span>
                  </div>
                  <ul className="experience-details">
                    <li>Lead design, development, and deployment of scalable MuleSoft integration solutions across EMEA</li>
                    <li>Delivered API-led connectivity solutions modernising legacy systems</li>
                    <li>Managed full integration lifecycle and large-scale data migrations across Salesforce and SAP</li>
                    <li>Conducted technical workshops, mentored client teams, and supported pre-sales initiatives</li>
                  </ul>
                    </div>
                <div className="experience-item">
                  <div className="experience-header">
                    <h3>MuleSoft Technical Consultant Intern</h3>
                    <span className="duration">Jun 2021 – Aug 2021</span>
                    </div>
                  <ul className="experience-details">
                    <li>Created APIs following the full development lifecycle</li>
                    <li>Automated CloudHub infrastructure maintenance and resource creation</li>
                    <li>Collaborated with MuleSoft architects and consultants</li>
                  </ul>
                    </div>
                <div className="experience-item">
                  <div className="experience-header">
                    <h3>Tata Consultancy Services Placement</h3>
                    <span className="duration">2017/2018</span>
                  </div>
                  <ul className="experience-details">
                    <li>Shadowed consultants delivering global technology solutions</li>
                    <li>Learned client relationship management and scalable solution design</li>
                    <li>Built understanding of emerging technologies across industries</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="certifications-section">
              <h2>Certifications</h2>
              <div className="certifications-grid">
                <div className="cert-item">MuleSoft Certified Developer – Level 1</div>
                <div className="cert-item">Salesforce Certified AI Associate</div>
                <div className="cert-item">Salesforce Trailhead Ranger</div>
                <div className="cert-item">AWS Cloud Computing Fundamentals</div>
              </div>
            </div>

            <div className="skills-section">
              <h2>Technical Skills</h2>
              <div className="skills-grid">
                <div className="skill-category">
                  <h3>Integration</h3>
                  <p>MuleSoft, RAML, SOAP, DataWeave, Anypoint Platform, Maven</p>
                </div>
                <div className="skill-category">
                  <h3>DevOps</h3>
                  <p>Git, GitHub Actions, Pipelines, CI/CD</p>
                </div>
                <div className="skill-category">
                  <h3>Software Development</h3>
                  <p>Java, C#, Python, C, Visual Basic, Pascal</p>
                </div>
                <div className="skill-category">
                  <h3>Web Development</h3>
                  <p>HTML, CSS, JavaScript, Flask</p>
                </div>
                <div className="skill-category">
                  <h3>Databases</h3>
                  <p>SQL (MySQL, PostgreSQL), SOQL</p>
                </div>
                <div className="skill-category">
                  <h3>Methodologies</h3>
                  <p>Agile, Scrum, TDD</p>
                </div>
              </div>
            </div>

            <div className="volunteering-section">
              <h2>Volunteering & Leadership</h2>
              <div className="volunteering-grid">
                <div className="volunteer-item">Duke of Edinburgh Gold Award</div>
                <div className="volunteer-item">RAF Air Cadets contributor (first aid, expedition, leadership activities)</div>
                <div className="volunteer-item">Sports Leaders Award Level 1</div>
                <div className="volunteer-item">Classroom assistant at Castleview Primary School</div>
              </div>
                      </div>

            <div className="interests-section">
              <h2>Interests & Activities</h2>
              <div className="interests-grid">
                <div className="interest-item">Web & App Development (MVPs for startups)</div>
                <div className="interest-item">Fitness & Gym (currently completing fitness training course)</div>
                <div className="interest-item">Drums (Grade 6, performed across UK)</div>
                <div className="interest-item">Finance & Investment (member of university society)</div>
                <div className="interest-item">Swimming (Level 8, completed 5K Swimathon)</div>
                      </div>
                    </div>

            <div className="languages-section">
              <h2>Languages</h2>
              <div className="languages-grid">
                <div className="language-item">
                  <span className="language-name">English</span>
                  <span className="language-level">Fluent</span>
                </div>
                <div className="language-item">
                  <span className="language-name">Hindi</span>
                  <span className="language-level">Professional proficiency</span>
                </div>
                <div className="language-item">
                  <span className="language-name">Marathi</span>
                  <span className="language-level">Professional proficiency</span>
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
          {activeTab === 'countries' && (
            <div className="countries-section">
              <div className="countries-header">
                <h2>Interactive Travel Map</h2>
                <p className="countries-subtitle">Explore my journey around the world</p>
                <div className="countries-counter">
                  <span className="counter-number">{visitedCountries.length}</span>
                  <span className="counter-label">Countries Visited</span>
                </div>
              </div>
              
              <div className="globe-section">
                <InteractiveGlobe 
                  onCountryClick={handleGlobeCountryClick}
                  selectedCountry={selectedCountry}
                  visitedCountries={visitedCountries}
                  onAddPin={handleAddPin}
                />
                <AdminPanel
                  isAdmin={isAdmin}
                  onToggleAdmin={toggleAdmin}
                  onAddPin={handleAddPin}
                  onRemovePin={handleRemovePin}
                  visitedCountries={visitedCountries}
                />
                          </div>
              
              <div className="country-explorer">
                <CountryDropdown
                  selectedCountry={selectedCountry}
                  onCountrySelect={handleCountrySelect}
                  visitedCountries={visitedCountries}
                  countryPhotos={countryPhotos}
                />
                
                {selectedCountry && (
                  <PhotoGallery
                    country={selectedCountry}
                    photos={countryPhotos[selectedCountry] || []}
                  />
                )}
                
                {selectedCountry && (
                  <PhotoManager
                    country={selectedCountry}
                    onPhotosUpdate={handlePhotosUpdate}
                  />
                )}
                      </div>
              
              <div className="countries-stats">
                <div className="stat-card">
                  <i className="fas fa-globe-americas"></i>
                  <h4>Countries</h4>
                  <span>{visitedCountries.length}</span>
                </div>
                <div className="stat-card">
                  <i className="fas fa-camera"></i>
                  <h4>Photos</h4>
                  <span>{Object.values(countryPhotos).reduce((total, photos) => total + photos.length, 0)}</span>
                </div>
                <div className="stat-card">
                  <i className="fas fa-map-pin"></i>
                  <h4>Pins</h4>
                  <span>{visitedCountries.length}</span>
                </div>
                <div className="stat-card">
                  <i className="fas fa-heart"></i>
                  <h4>Memories</h4>
                  <span>∞</span>
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
        
        {/* Data Manager - Available on all pages */}
        <DataManager onDataChange={() => window.location.reload()} />
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Valentine's Day Proposal Page - Special route for Riya 💖 */}
        <Route path="/valentines" element={<Valentine />} />
        
        {/* Main website with theme provider */}
        <Route path="/*" element={
          <ThemeProvider>
            <AppContent />
          </ThemeProvider>
        } />
      </Routes>
    </Router>
  );
}

export default App;
