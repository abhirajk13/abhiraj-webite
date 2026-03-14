import { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Valentine from './components/Valentine';

// Animated Counter Component - defined outside to prevent re-renders
function AnimatedCounter({ end, duration = 2000, suffix = '' }) {
  const [count, setCount] = useState(0);
  const countRef = useRef(null);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    const element = countRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimatedRef.current) {
          hasAnimatedRef.current = true;
          let start = 0;
          const increment = end / (duration / 16);
          const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
              setCount(end);
              clearInterval(timer);
            } else {
              setCount(Math.floor(start));
            }
          }, 16);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [end, duration]);

  return <span ref={countRef}>{count}{suffix}</span>;
}

function AppContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('hero');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollProgress, setScrollProgress] = useState(0);
  const [typedText, setTypedText] = useState('');
  
  const fullTitle = "Software Engineer & AI Solutions Architect";
  const sectionsRef = useRef({});

  // Typing animation for hero title
  useEffect(() => {
    if (isLoading) return;
    
    let index = 0;
    const typeInterval = setInterval(() => {
      if (index <= fullTitle.length) {
        setTypedText(fullTitle.slice(0, index));
        index++;
      } else {
        clearInterval(typeInterval);
      }
    }, 50);

    return () => clearInterval(typeInterval);
  }, [isLoading]);

  // Track mouse for gradient effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Scroll progress indicator
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Loading screen
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2200);
    return () => clearTimeout(timer);
  }, []);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            if (entry.target.id) {
              setActiveSection(entry.target.id);
            }
          }
        });
      },
      { threshold: 0.1, rootMargin: '-50px' }
    );

    document.querySelectorAll('.animate-on-scroll').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, [isLoading]);

  // Smooth scroll to section
  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  // Data from CV
  const profile = {
    name: "Abhiraj Kane",
    title: "Software Engineer & AI Solutions Architect",
    tagline: "Building enterprise systems and applied AI solutions",
    email: "abhirajkane@gmail.com",
    phone: "+44 (0)7957365499",
    location: "London, UK",
    github: "https://github.com/abhirajk13",
    linkedin: "https://www.linkedin.com/in/abhirajk"
  };

  // Skills - exactly as stated in CV
  const skills = {
    ai: ["LangChain", "Prompt Engineering", "AI Agent Architecture", "Vector Database (RAG)", "Claude APIs", "Flask"],
    integration: ["MuleSoft", "REST/SOAP", "DataWeave", "Anypoint Platform"],
    development: ["Python", "Java", "C#", "C", "JavaScript", "HTML", "CSS", "Flask"],
    databases: ["SQL", "MySQL", "PostgreSQL", "SOQL"],
    devops: ["Git", "GitHub Actions", "CI/CD Pipelines", "Maven"],
    methodologies: ["Agile", "Scrum", "TDD"]
  };

  const experience = [
    {
      title: "Salesforce Integration Consultant",
      company: "Salesforce",
      period: "Sep 2022 – Present",
      highlights: [
        "Designed and deployed enterprise integration architectures using MuleSoft, connecting Salesforce and SAP across large EMEA clients",
        "Built scalable APIs and batch pipelines processing millions of records across distributed enterprise systems",
        "Led development across distributed engineering teams, ensuring high code quality and reliable production deployments",
        "Delivered technical workshops and mentoring to enable client teams to adopt modern integration patterns"
      ],
      tags: ["MuleSoft", "Salesforce", "API Design", "Enterprise Architecture"]
    },
    {
      title: "Applied AI & LLM Engineering",
      company: "Salesforce / Independent",
      period: "2024 – Present",
      highlights: [
        "Built AI-assisted developer workflows using Salesforce Agentforce and LLM-powered tools",
        "Developed agent-based prototypes using LangChain to orchestrate tool use and API calls",
        "Designed multi-agent AI systems where specialized agents acted as developers, BAs, and QA engineers",
        "Worked with MuleSoft Agent Fabric to orchestrate AI agents through secure middleware layers"
      ],
      tags: ["LangChain", "AI Agents", "LLMs", "Agentforce"]
    },
    {
      title: "MuleSoft Technical Consultant Intern",
      company: "Salesforce",
      period: "Jun 2021 – Aug 2021",
      highlights: [
        "Completed intensive training covering API-led connectivity and enterprise middleware architectures",
        "Developed automation scripts to streamline CloudHub infrastructure provisioning",
        "Built and tested REST APIs following the full API development lifecycle"
      ],
      tags: ["MuleSoft", "REST APIs", "CloudHub"]
    }
  ];

  const projects = [
    {
      name: "NovaraHR",
      url: "novarahr.com",
      period: "Feb 2025 – Present",
      description: "AI-powered HR operations platform automating internal workflows",
      features: [
        "Custom RAG knowledge system using vector embeddings for policy querying",
        "Backend services in Python/Flask integrating LLM APIs",
        "Prompt engineering workflows to reduce hallucination",
        "Conversational AI interfaces for HR automation"
      ],
      tags: ["Python", "Flask", "RAG", "LLMs", "Vector DB"]
    }
  ];

  const certifications = [
    { name: "MuleSoft Certified Developer", icon: "🔗" },
    { name: "Salesforce Certified AI Associate", icon: "🤖" },
    { name: "Salesforce AgentForce Specialist", icon: "🧠" },
    { name: "Salesforce Trailhead Ranger", icon: "⭐" },
    { name: "AWS Cloud Fundamentals", icon: "☁️" }
  ];

  const education = [
    {
      school: "University College London (UCL)",
      degree: "MSc Technology Management",
      period: "2024 – 2026",
      grade: "Distinction"
    },
    {
      school: "Royal Holloway, University of London",
      degree: "BSc Computer Science & Artificial Intelligence",
      period: "2019 – 2022",
      grade: "First Class Honours"
    }
  ];

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="loading-logo">
            <span className="logo-letter">A</span>
            <span className="logo-letter">K</span>
          </div>
          <div className="loading-bar">
            <div className="loading-progress"></div>
          </div>
          <p className="loading-text">
            <span className="loading-dot">.</span>
            <span className="loading-dot">.</span>
            <span className="loading-dot">.</span>
          </p>
        </div>
        <div className="loading-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      {/* Scroll Progress Bar */}
      <div className="scroll-progress" style={{ width: `${scrollProgress}%` }} />
      
      {/* Animated background gradient */}
      <div 
        className="gradient-bg"
        style={{
          '--mouse-x': `${mousePosition.x}px`,
          '--mouse-y': `${mousePosition.y}px`
        }}
      />

      {/* Floating shapes */}
      <div className="floating-shapes">
        <div className="float-shape float-1"></div>
        <div className="float-shape float-2"></div>
        <div className="float-shape float-3"></div>
        <div className="float-shape float-4"></div>
      </div>
      
      {/* Navigation */}
      <nav className="navbar glass">
        <button
          className={`nav-link nav-home ${activeSection === 'hero' ? 'active' : ''}`}
          onClick={() => scrollToSection('hero')}
          aria-label="Back to top"
        >
          👤
        </button>
        {['About', 'Skills', 'Experience', 'Projects', 'Contact'].map((item) => (
          <button
            key={item}
            className={`nav-link ${activeSection === item.toLowerCase() ? 'active' : ''}`}
            onClick={() => scrollToSection(item.toLowerCase())}
          >
            {item}
          </button>
        ))}
      </nav>

      {/* Hero Section */}
      <section id="hero" className="hero-section">
        <div className="hero-content">
          <div className="hero-badge animate-on-scroll">
            <span className="badge-dot"></span>
            Available for opportunities
          </div>
          <h1 className="hero-title animate-on-scroll">
            <span className="title-line">Hi, I'm</span>
            <span className="title-name gradient-text">{profile.name}</span>
          </h1>
          <p className="hero-subtitle animate-on-scroll">
            {typedText || '\u00A0'}
          </p>
          <p className="hero-description animate-on-scroll">{profile.tagline}</p>
          
          <div className="hero-cta animate-on-scroll">
            <button className="btn-primary glow-effect" onClick={() => scrollToSection('projects')}>
              <span className="btn-text">View My Work</span>
              <span className="btn-arrow">→</span>
            </button>
            <button className="btn-secondary" onClick={() => scrollToSection('contact')}>
              Get In Touch
            </button>
          </div>

          <div className="hero-stats animate-on-scroll">
            <div className="stat-item">
              <span className="stat-number">
                <AnimatedCounter end={5} suffix="+" />
              </span>
              <span className="stat-label">Years Experience</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">
                <AnimatedCounter end={5} />
              </span>
              <span className="stat-label">Certifications</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">
                <AnimatedCounter end={10} suffix="+" />
              </span>
              <span className="stat-label">Projects Delivered</span>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="code-window glass animate-on-scroll">
            <div className="window-header">
              <div className="window-dots">
                <span className="dot red"></span>
                <span className="dot yellow"></span>
                <span className="dot green"></span>
              </div>
              <span className="window-title">abhiraj.py</span>
            </div>
            <pre className="code-content">
              <code>
{`class SoftwareEngineer:
    def __init__(self):
        self.name = "Abhiraj Kane"
        self.role = "AI Solutions Architect"
        self.skills = ["AI/ML", "Integration", 
                       "Full-Stack Dev"]
    
    def build_solution(self, problem):
        return self.innovate(problem)
    
    def current_focus(self):
        return ["LLM Engineering",
                "Agent Architecture",
                "Enterprise AI"]`}
              </code>
            </pre>
          </div>
        </div>

        <div className="scroll-indicator" onClick={() => scrollToSection('about')}>
          <div className="mouse">
            <div className="mouse-wheel"></div>
          </div>
          <span className="scroll-text">Scroll to explore</span>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="section about-section">
        <div className="section-header animate-on-scroll">
          <span className="section-tag">About Me</span>
          <h2 className="section-title">Building the Future with <span className="gradient-text">AI & Integration</span></h2>
        </div>

        <div className="about-content">
          <div className="about-text animate-on-scroll">
            <p className="about-lead">
              A motivated Software Engineer and Technical Consultant building enterprise systems 
              and applied AI solutions. I bridge the gap between cutting-edge AI capabilities 
              and enterprise-grade production systems.
            </p>
            <p>
              With experience designing APIs, integrating complex platforms like Salesforce and SAP, 
              and delivering production systems within enterprise environments, I bring a unique 
              perspective to AI engineering—one grounded in scalability, reliability, and real-world impact.
            </p>
            <p>
              Currently focused on LLM engineering, multi-agent AI systems, and RAG architectures 
              that transform how enterprises operate.
            </p>
          </div>

          <div className="education-cards animate-on-scroll">
            {education.map((edu, index) => (
              <div key={index} className="edu-card glass" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="edu-icon">🎓</div>
                <div className="edu-content">
                  <h4>{edu.school}</h4>
                  <p className="edu-degree">{edu.degree}</p>
                  <div className="edu-meta">
                    <span>{edu.period}</span>
                    <span className="edu-grade">{edu.grade}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="section skills-section">
        <div className="section-header animate-on-scroll">
          <span className="section-tag">Expertise</span>
          <h2 className="section-title">Skills & <span className="gradient-text">Technologies</span></h2>
        </div>

        <div className="skills-grid">
          {Object.entries(skills).map(([category, skillList], categoryIndex) => (
            <div 
              key={category} 
              className="skill-category animate-on-scroll glass"
              style={{ animationDelay: `${categoryIndex * 0.1}s` }}
            >
              <h3 className="category-title">
                {category === 'ai' && '🤖 AI & LLM Engineering'}
                {category === 'integration' && '🔗 MuleSoft & Integration'}
                {category === 'development' && '💻 Software Development'}
                {category === 'databases' && '🗄️ Databases'}
                {category === 'devops' && '⚙️ DevOps'}
                {category === 'methodologies' && '📋 Methodologies'}
              </h3>
              <div className="skill-tags">
                {skillList.map((skill, index) => (
                  <span 
                    key={index} 
                    className="skill-tag"
                    style={{ animationDelay: `${(categoryIndex * 0.1) + (index * 0.05)}s` }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Certifications */}
        <div className="certifications animate-on-scroll">
          <h3 className="cert-title">Certifications</h3>
          <div className="cert-grid">
            {certifications.map((cert, index) => (
              <div 
                key={index} 
                className="cert-badge glass"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <span className="cert-icon">{cert.icon}</span>
                <span className="cert-name">{cert.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section id="experience" className="section experience-section">
        <div className="section-header animate-on-scroll">
          <span className="section-tag">Career</span>
          <h2 className="section-title">Professional <span className="gradient-text">Experience</span></h2>
        </div>

        <div className="timeline">
          {experience.map((exp, index) => (
            <div 
              key={index} 
              className="timeline-item animate-on-scroll"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className="timeline-marker">
                <div className="marker-dot"></div>
                {index < experience.length - 1 && <div className="marker-line"></div>}
              </div>
              <div className="timeline-content glass">
                <div className="exp-header">
                  <div>
                    <h3 className="exp-title">{exp.title}</h3>
                    <p className="exp-company">{exp.company}</p>
                  </div>
                  <span className="exp-period">{exp.period}</span>
                </div>
                <ul className="exp-highlights">
                  {exp.highlights.map((highlight, i) => (
                    <li key={i}>{highlight}</li>
                  ))}
                </ul>
                <div className="exp-tags">
                  {exp.tags.map((tag, i) => (
                    <span key={i} className="tag">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="section projects-section">
        <div className="section-header animate-on-scroll">
          <span className="section-tag">Portfolio</span>
          <h2 className="section-title">Featured <span className="gradient-text">Projects</span></h2>
        </div>

        <div className="projects-grid">
          {projects.map((project, index) => (
            <div key={index} className="project-card animate-on-scroll glass">
              <div className="project-glow"></div>
              <div className="project-header">
                <div className="project-icon">🚀</div>
                <div className="project-links">
                  <a href={`https://${project.url}`} target="_blank" rel="noopener noreferrer" className="project-link">
                    Visit Site ↗
                  </a>
                </div>
              </div>
              <h3 className="project-name">{project.name}</h3>
              <p className="project-period">{project.period}</p>
              <p className="project-desc">{project.description}</p>
              <ul className="project-features">
                {project.features.map((feature, i) => (
                  <li key={i}>{feature}</li>
                ))}
              </ul>
              <div className="project-tags">
                {project.tags.map((tag, i) => (
                  <span key={i} className="tag">{tag}</span>
                ))}
              </div>
            </div>
          ))}

          {/* More projects placeholder */}
          <div className="project-card coming-soon animate-on-scroll glass">
            <div className="coming-soon-content">
              <span className="coming-icon">✨</span>
              <h3>More Projects</h3>
              <p>New AI-powered projects coming soon...</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="section contact-section">
        <div className="contact-content animate-on-scroll">
          <span className="section-tag">Get In Touch</span>
          <h2 className="contact-title">Let's Build Something <span className="gradient-text">Amazing</span></h2>
          <p className="contact-desc">
            Interested in AI solutions, enterprise integration, or just want to chat about technology? 
            I'm always open to discussing new projects and opportunities.
          </p>
          
          <div className="contact-methods">
            <a href={`mailto:${profile.email}`} className="contact-card glass">
              <span className="contact-icon">📧</span>
              <span className="contact-label">Email</span>
              <span className="contact-value">{profile.email}</span>
            </a>
            <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="contact-card glass">
              <span className="contact-icon">💼</span>
              <span className="contact-label">LinkedIn</span>
              <span className="contact-value">Connect with me</span>
            </a>
            <a href={profile.github} target="_blank" rel="noopener noreferrer" className="contact-card glass">
              <span className="contact-icon">🐙</span>
              <span className="contact-label">GitHub</span>
              <span className="contact-value">View my code</span>
            </a>
          </div>

          <div className="contact-cta">
            <p className="cta-text">Ready to start a project?</p>
            <a href={`mailto:${profile.email}`} className="cta-button">
              <span className="cta-icon">✉️</span>
              <span className="cta-label">Send me a message</span>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <p>© 2026 Abhiraj Kane. Built with React & passion.</p>
          <p className="footer-tagline">Software Engineer • AI Architect • Problem Solver</p>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/valentines" element={<Valentine />} />
        <Route path="/*" element={<AppContent />} />
      </Routes>
    </Router>
  );
}

export default App;
