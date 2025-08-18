// Enhanced Portfolio JavaScript with Theme Toggle and Auto-scroll
document.addEventListener('DOMContentLoaded', function() {
  
  /* Theme Management */
  const themeToggle = document.getElementById('theme-toggle');
  const html = document.documentElement;
  
  // Get saved theme from localStorage or default to dark
  const savedTheme = localStorage.getItem('theme') || 'dark';
  html.setAttribute('data-theme', savedTheme);
  
  if (themeToggle) {
    themeToggle.addEventListener('click', function() {
      const currentTheme = html.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      html.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      
      // Add a subtle animation feedback
      this.style.transform = 'scale(0.95)';
      setTimeout(() => {
        this.style.transform = '';
      }, 150);
    });
  }

  /* Responsive Navigation Toggle */
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');
  
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function(e) {
      e.preventDefault();
      navToggle.classList.toggle('active');
      navMenu.classList.toggle('active');
      document.body.classList.toggle('nav-open');
      
      // Animate hamburger menu
      const spans = navToggle.querySelectorAll('span');
      if (navToggle.classList.contains('active')) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
      } else {
        spans[0].style.transform = '';
        spans[1].style.opacity = '1';
        spans[2].style.transform = '';
      }
    });
  }
  
  navLinks.forEach(link => {
    link.addEventListener('click', function() {
      if (navToggle && navMenu) {
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.classList.remove('nav-open');
        
        // Reset hamburger menu
        const spans = navToggle.querySelectorAll('span');
        spans[0].style.transform = '';
        spans[1].style.opacity = '1';
        spans[2].style.transform = '';
      }
    });
  });

  /* Active Navigation Link Management */
  function updateActiveNavLink() {
    const sections = document.querySelectorAll('.section, .hero');
    const navbar = document.getElementById('navbar');
    const navbarHeight = navbar ? navbar.offsetHeight : 80;
    let current = '';

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (pageYOffset >= sectionTop - navbarHeight - 100) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  }

  /* Typewriter Effect */
  function typeWriter(element, text, speed = 80) {
    let i = 0;
    element.innerHTML = '';
    element.style.borderRight = '2px solid var(--color-primary)';
    
    function type() {
      if (i < text.length) {
        element.innerHTML += text.charAt(i);
        i++;
        setTimeout(type, speed);
      } else {
        setTimeout(() => { 
          element.style.animation = 'blink 1s infinite'; 
        }, 500);
      }
    }
    setTimeout(type, 850);
  }
  
  const typewriterElement = document.querySelector('.typewriter');
  if (typewriterElement) {
    const text = typewriterElement.getAttribute('data-text');
    typeWriter(typewriterElement, text, 70);
  }

  /* Smooth Scrolling to Sections */
  function smoothScrollToSection(targetId) {
    const targetSection = document.querySelector(targetId);
    if (targetSection) {
      const navbar = document.getElementById('navbar');
      const navbarHeight = navbar ? navbar.offsetHeight : 80;
      const offsetTop = targetSection.offsetTop - navbarHeight;
      window.scrollTo({top: offsetTop, behavior: 'smooth'});
    }
  }
  
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (targetId && targetId.startsWith('#')) {
        smoothScrollToSection(targetId);
        // Update active state immediately
        navLinks.forEach(navLink => navLink.classList.remove('active'));
        this.classList.add('active');
      }
    });
  });

  /* Section Reveal Animation */
  function updateSectionVisibility() {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
      if (section.getBoundingClientRect().top < window.innerHeight - 80) {
        section.classList.add('visible');
      }
    });
  }

  /* Auto-scroll Projects */
  class ProjectAutoScroll {
    constructor() {
      this.scrollers = [];
      this.init();
    }
    
    init() {
      const autoScrollGrids = document.querySelectorAll('.projects-grid.auto-scroll');
      autoScrollGrids.forEach((grid, index) => {
        this.setupAutoScroll(grid, index);
      });
    }
    
    setupAutoScroll(grid, index) {
      const container = grid.closest('.projects-container');
      const controls = container.querySelector('.scroll-controls');
      const leftBtn = controls.querySelector('.scroll-btn--left');
      const rightBtn = controls.querySelector('.scroll-btn--right');
      const playBtn = controls.querySelector('.scroll-btn--play');
      
      const speed = parseInt(grid.dataset.speed) || 30;
      const scrollWidth = grid.scrollWidth;
      const containerWidth = grid.parentElement.offsetWidth;
      
      // Calculate duration based on speed and content width
      const duration = (scrollWidth / speed) + 's';
      grid.style.setProperty('--scroll-duration', duration);
      
      const scroller = {
        grid,
        container,
        isPlaying: true,
        currentPosition: 0,
        speed
      };
      
      this.scrollers.push(scroller);
      
      // Add event listeners
      if (leftBtn) {
        leftBtn.addEventListener('click', () => this.scrollManual(scroller, 'left'));
      }
      
      if (rightBtn) {
        rightBtn.addEventListener('click', () => this.scrollManual(scroller, 'right'));
      }
      
      if (playBtn) {
        playBtn.addEventListener('click', () => this.toggleAutoScroll(scroller, playBtn));
      }
      
      // Pause on hover
      grid.addEventListener('mouseenter', () => {
        if (scroller.isPlaying) {
          grid.style.animationPlayState = 'paused';
        }
      });
      
      grid.addEventListener('mouseleave', () => {
        if (scroller.isPlaying) {
          grid.style.animationPlayState = 'running';
        }
      });
      
      // Handle window resize
      window.addEventListener('resize', () => {
        this.recalculateDuration(scroller);
      });
    }
    
    scrollManual(scroller, direction) {
      const { grid } = scroller;
      const scrollAmount = 320; // Width of one project card
      
      // Pause auto-scroll temporarily
      const wasPlaying = scroller.isPlaying;
      if (wasPlaying) {
        grid.style.animationPlayState = 'paused';
      }
      
      // Get current transform
      const currentTransform = grid.style.transform;
      const currentX = currentTransform ? 
        parseInt(currentTransform.match(/translateX\((-?\d+)px\)/)?.[1] || 0) : 0;
      
      const newX = direction === 'left' ? 
        Math.min(currentX + scrollAmount, 0) : 
        Math.max(currentX - scrollAmount, -(grid.scrollWidth - grid.parentElement.offsetWidth));
      
      grid.style.transform = `translateX(${newX}px)`;
      scroller.currentPosition = newX;
      
      // Resume auto-scroll after manual scroll
      if (wasPlaying) {
        setTimeout(() => {
          grid.style.animationPlayState = 'running';
        }, 1000);
      }
    }
    
    toggleAutoScroll(scroller, playBtn) {
      const { grid } = scroller;
      const icon = playBtn.querySelector('i');
      
      if (scroller.isPlaying) {
        // Pause
        grid.style.animationPlayState = 'paused';
        grid.classList.add('paused');
        icon.className = 'fas fa-play';
        scroller.isPlaying = false;
      } else {
        // Resume
        grid.style.animationPlayState = 'running';
        grid.classList.remove('paused');
        icon.className = 'fas fa-pause';
        scroller.isPlaying = true;
      }
    }
    
    recalculateDuration(scroller) {
      const { grid, speed } = scroller;
      const scrollWidth = grid.scrollWidth;
      const duration = (scrollWidth / speed) + 's';
      grid.style.setProperty('--scroll-duration', duration);
    }
    
    // Method to pause all scrollers (useful for performance)
    pauseAll() {
      this.scrollers.forEach(scroller => {
        scroller.grid.style.animationPlayState = 'paused';
      });
    }
    
    // Method to resume all scrollers
    resumeAll() {
      this.scrollers.forEach(scroller => {
        if (scroller.isPlaying) {
          scroller.grid.style.animationPlayState = 'running';
        }
      });
    }
  }
  
  // Initialize auto-scroll only on desktop
  let projectScroller = null;
  if (window.innerWidth > 768) {
    projectScroller = new ProjectAutoScroll();
  }
  
  // Handle window resize for auto-scroll
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      // Reinitialize auto-scroll based on screen size
      if (window.innerWidth > 768 && !projectScroller) {
        projectScroller = new ProjectAutoScroll();
      } else if (window.innerWidth <= 768 && projectScroller) {
        // Disable auto-scroll on mobile
        const autoScrollGrids = document.querySelectorAll('.projects-grid.auto-scroll');
        autoScrollGrids.forEach(grid => {
          grid.style.animation = 'none';
          grid.style.transform = 'none';
        });
      }
    }, 250);
  });

  /* Scroll Event Handler with Performance Optimization */
  let ticking = false;
  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateSectionVisibility();
        updateActiveNavLink();
        handleNavbarScroll();
        ticking = false;
      });
      ticking = true;
    }
  }

  /* Navbar Hide/Show on Scroll */
  let lastScrollTop = 0;
  function handleNavbarScroll() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;
    
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > lastScrollTop && scrollTop > 100) {
      // Scrolling down
      navbar.style.transform = 'translateY(-100%)';
    } else {
      // Scrolling up
      navbar.style.transform = 'translateY(0)';
    }
    lastScrollTop = scrollTop;
  }

  window.addEventListener('scroll', onScroll);
  
  // Initial calls
  updateSectionVisibility();
  updateActiveNavLink();

  /* Enhanced Skill Item Interactions */
  document.querySelectorAll('.skill-item').forEach(item => {
    item.addEventListener('mouseenter', function() {
      this.style.boxShadow = '0 10px 36px rgba(34, 197, 94, 0.2)';
      
      // Add ripple effect
      const ripple = document.createElement('div');
      ripple.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        border-radius: 50%;
        background: rgba(34, 197, 94, 0.3);
        transform: translate(-50%, -50%);
        transition: width 0.6s, height 0.6s;
        pointer-events: none;
        z-index: 0;
      `;
      
      this.style.position = 'relative';
      this.appendChild(ripple);
      
      setTimeout(() => {
        ripple.style.width = '100px';
        ripple.style.height = '100px';
      }, 10);
    });
    
    item.addEventListener('mouseleave', function() {
      this.style.boxShadow = '';
      const ripple = this.querySelector('div:last-child');
      if (ripple && ripple.style.background.includes('rgba(34, 197, 94')) {
        ripple.remove();
      }
    });
  });

  /* Enhanced Project Card Interactions */
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-10px) scale(1.02)';
      
      // Animate tech badges
      const badges = this.querySelectorAll('.tech-badge');
      badges.forEach((badge, index) => {
        setTimeout(() => {
          badge.style.transform = 'translateY(-2px)';
        }, index * 50);
      });
    });
    
    card.addEventListener('mouseleave', function() {
      this.style.transform = '';
      
      // Reset tech badges
      const badges = this.querySelectorAll('.tech-badge');
      badges.forEach(badge => {
        badge.style.transform = '';
      });
    });
  });

  /* Contact Form Enhanced Feedback */
  const contactForm = document.querySelector('.contact-form form');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const message = document.getElementById('message').value.trim();
      
      // Enhanced validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      if (!name || !email || !message) {
        showNotification('Please fill all required fields.', 'error');
        return;
      }
      
      if (!emailRegex.test(email)) {
        showNotification('Please enter a valid email address.', 'error');
        return;
      }
      
      if (message.length < 10) {
        showNotification('Message should be at least 10 characters long.', 'error');
        return;
      }
      
      // Simulate form submission
      const submitBtn = this.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
      submitBtn.disabled = true;
      
      setTimeout(() => {
        showNotification('Message sent successfully! I will get back to you soon.', 'success');
        contactForm.reset();
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      }, 2000);
    });
    
    // Real-time validation feedback
    const inputs = contactForm.querySelectorAll('.form-control');
    inputs.forEach(input => {
      input.addEventListener('blur', function() {
        validateInput(this);
      });
      
      input.addEventListener('input', function() {
        // Remove error styling on input
        this.style.borderColor = '';
        const errorMsg = this.parentElement.querySelector('.error-message');
        if (errorMsg) errorMsg.remove();
      });
    });
  }
  
  function validateInput(input) {
    const value = input.value.trim();
    const type = input.type;
    const isRequired = input.hasAttribute('required');
    
    let isValid = true;
    let errorMessage = '';
    
    if (isRequired && !value) {
      isValid = false;
      errorMessage = 'This field is required.';
    } else if (type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        isValid = false;
        errorMessage = 'Please enter a valid email address.';
      }
    }
    
    if (!isValid) {
      input.style.borderColor = 'var(--color-error)';
      
      // Remove existing error message
      const existingError = input.parentElement.querySelector('.error-message');
      if (existingError) existingError.remove();
      
      // Add new error message
      const errorDiv = document.createElement('div');
      errorDiv.className = 'error-message';
      errorDiv.style.cssText = `
        color: var(--color-error);
        font-size: var(--font-size-xs);
        margin-top: var(--space-1);
      `;
      errorDiv.textContent = errorMessage;
      input.parentElement.appendChild(errorDiv);
    }
  }

  /* Enhanced Notification System */
  function showNotification(message, type = 'info', duration = 3000) {
    let container = document.querySelector('.notification-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'notification-container';
      document.body.appendChild(container);
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    
    // Add icon based on type
    const icons = {
      success: 'fas fa-check-circle',
      error: 'fas fa-exclamation-circle',
      warning: 'fas fa-exclamation-triangle',
      info: 'fas fa-info-circle'
    };
    
    notification.innerHTML = `
      <i class="${icons[type] || icons.info}"></i>
      <span>${message}</span>
    `;
    
    container.appendChild(notification);
    
    // Animate in
    setTimeout(() => notification.classList.add('fade'), 50);
    
    // Animate out and remove
    setTimeout(() => {
      notification.classList.remove('fade');
      setTimeout(() => {
        if (notification.parentElement) {
          notification.remove();
        }
      }, 300);
    }, duration);
    
    // Add click to dismiss
    notification.addEventListener('click', () => {
      notification.classList.remove('fade');
      setTimeout(() => {
        if (notification.parentElement) {
          notification.remove();
        }
      }, 300);
    });
  }

  /* Intersection Observer for Better Performance */
  if (window.IntersectionObserver) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          
          // Trigger special animations for specific elements
          if (entry.target.classList.contains('skills')) {
            animateSkills(entry.target);
          }
          
          if (entry.target.classList.contains('projects')) {
            animateProjects(entry.target);
          }
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    document.querySelectorAll('.section').forEach(section => {
      observer.observe(section);
    });
  }
  
  function animateSkills(skillsSection) {
    const skillItems = skillsSection.querySelectorAll('.skill-item');
    skillItems.forEach((item, index) => {
      setTimeout(() => {
        item.style.transform = 'translateY(0)';
        item.style.opacity = '1';
      }, index * 100);
    });
  }
  
  function animateProjects(projectsSection) {
    const projectCards = projectsSection.querySelectorAll('.project-card');
    projectCards.forEach((card, index) => {
      setTimeout(() => {
        card.style.transform = 'translateY(0)';
        card.style.opacity = '1';
      }, index * 150);
    });
  }

  /* Performance Optimizations */
  
  // Lazy load images
  const images = document.querySelectorAll('img[data-src]');
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        imageObserver.unobserve(img);
      }
    });
  });
  
  images.forEach(img => imageObserver.observe(img));
  
  // Pause animations when page is not visible
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      // Page is hidden, pause animations
      if (projectScroller) {
        projectScroller.pauseAll();
      }
    } else {
      // Page is visible, resume animations
      if (projectScroller) {
        projectScroller.resumeAll();
      }
    }
  });

  /* Initialize Active States */
  const homeLink = document.querySelector('.nav-link[href="#home"]');
  if (homeLink) {
    homeLink.classList.add('active');
  }

  /* Keyboard Navigation Support */
  document.addEventListener('keydown', (e) => {
    // ESC to close mobile menu
    if (e.key === 'Escape' && navMenu && navMenu.classList.contains('active')) {
      navToggle.click();
    }
    
    // Arrow keys for project navigation (when focused)
    if (document.activeElement.closest('.projects-container')) {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        const container = document.activeElement.closest('.projects-container');
        const leftBtn = container.querySelector('.scroll-btn--left');
        const rightBtn = container.querySelector('.scroll-btn--right');
        
        if (e.key === 'ArrowLeft' && leftBtn) {
          leftBtn.click();
        } else if (e.key === 'ArrowRight' && rightBtn) {
          rightBtn.click();
        }
      }
    }
  });

  /* Analytics and Debug Info (Development) */
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('🚀 Portfolio Enhanced Version Loaded');
    console.log('📱 Screen Size:', window.innerWidth, 'x', window.innerHeight);
    console.log('🎨 Current Theme:', html.getAttribute('data-theme'));
    console.log('⚡ Auto-scroll Enabled:', projectScroller ? 'Yes' : 'No');
  }

  /* Add smooth reveal animation to initially hidden elements */
  const hiddenElements = document.querySelectorAll('.skill-item, .project-card');
  hiddenElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  });
  
  console.log('✅ Enhanced Portfolio JavaScript Loaded Successfully!');
});