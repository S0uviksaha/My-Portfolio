// Enhanced Portfolio JavaScript with Theme Toggle, Auto-scroll and EmailJS Integration
document.addEventListener('DOMContentLoaded', function() {
  
  /* Theme Management */
  const themeToggle = document.getElementById('theme-toggle');
  const html = document.documentElement;
  
  // Get saved theme from browser storage or default to dark
  const savedTheme = 'dark'; // Removed localStorage usage
  html.setAttribute('data-theme', savedTheme);
  
  if (themeToggle) {
    themeToggle.addEventListener('click', function() {
      const currentTheme = html.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      html.setAttribute('data-theme', newTheme);
      
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

  /* EmailJS Integration */
  const contactForm = document.getElementById('contactForm');
  const submitBtn = document.getElementById('submitBtn');
  
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const formData = new FormData(this);
      const name = formData.get('name').trim();
      const email = formData.get('email').trim();
      const subject = formData.get('subject').trim() || 'Contact from Portfolio Website';
      const message = formData.get('message').trim();
      
      // Enhanced validation
      if (!validateForm(name, email, message)) {
        return;
      }
      
      // Show loading state
      setButtonLoading(true);
      
      // Prepare template parameters for both emails
      const templateParams = {
        from_name: name,
        from_email: email,
        subject: subject,
        message: message,
        to_name: 'Souvik Saha',
        reply_to: email
      };
      
      // Send email to you (main contact email)
      emailjs.send('service_jl5amsu', 'template_7csv1m3', templateParams)
        .then(() => {
          // Send auto-reply to user
          const autoReplyParams = {
            to_name: name,
            to_email: email,
            from_name: 'Souvik Saha',
            subject: 'Thank you for contacting me!',
            user_message: message
          };
          
          return emailjs.send('service_jl5amsu', 'template_auto_reply', autoReplyParams);
        })
        .then(() => {
          // Both emails sent successfully
          showEmailModal(
            'success',
            'Message Sent Successfully!',
            `Hi ${name}! Your message has been sent successfully. I'll get back to you within 24 hours. You should also receive a confirmation email shortly.`
          );
          contactForm.reset();
          clearFormErrors();
        })
        .catch((error) => {
          console.error('Email sending failed:', error);
          
          // Try sending just the main email if auto-reply fails
          if (error.status !== 200) {
            emailjs.send('service_jl5amsu', 'template_7csv1m3', templateParams)
              .then(() => {
                showEmailModal(
                  'success',
                  'Message Sent!',
                  `Hi ${name}! Your message has been sent successfully. I'll get back to you soon!`
                );
                contactForm.reset();
                clearFormErrors();
              })
              .catch(() => {
                showEmailModal(
                  'error',
                  'Failed to Send Message',
                  'Sorry, there was an error sending your message. Please try again later or contact me directly at souvik21102001@gmail.com'
                );
              });
          } else {
            showEmailModal(
              'error',
              'Failed to Send Message',
              'Sorry, there was an error sending your message. Please try again later or contact me directly at souvik21102001@gmail.com'
            );
          }
        })
        .finally(() => {
          setButtonLoading(false);
        });
    });
    
    // Real-time validation feedback
    const inputs = contactForm.querySelectorAll('.form-control');
    inputs.forEach(input => {
      input.addEventListener('blur', function() {
        validateInput(this);
      });
      
      input.addEventListener('input', function() {
        // Remove error styling on input
        this.classList.remove('error');
        const errorMsg = this.parentElement.querySelector('.error-message');
        if (errorMsg) errorMsg.remove();
      });
    });
  }
  
  /* Form Validation Functions */
  function validateForm(name, email, message) {
    let isValid = true;
    
    // Clear previous errors
    clearFormErrors();
    
    if (!name) {
      showFieldError('name', 'Name is required');
      isValid = false;
    }
    
    if (!email) {
      showFieldError('email', 'Email is required');
      isValid = false;
    } else if (!isValidEmail(email)) {
      showFieldError('email', 'Please enter a valid email address');
      isValid = false;
    }
    
    if (!message) {
      showFieldError('message', 'Message is required');
      isValid = false;
    } else if (message.length < 10) {
      showFieldError('message', 'Message should be at least 10 characters long');
      isValid = false;
    }
    
    if (!isValid) {
      showNotification('Please fix the errors below', 'error');
    }
    
    return isValid;
  }
  
  function validateInput(input) {
    const value = input.value.trim();
    const type = input.type;
    const isRequired = input.hasAttribute('required');
    const fieldName = input.name;
    
    let isValid = true;
    let errorMessage = '';
    
    if (isRequired && !value) {
      isValid = false;
      errorMessage = 'This field is required';
    } else if (type === 'email' && value && !isValidEmail(value)) {
      isValid = false;
      errorMessage = 'Please enter a valid email address';
    } else if (fieldName === 'message' && value && value.length < 10) {
      isValid = false;
      errorMessage = 'Message should be at least 10 characters long';
    }
    
    if (!isValid) {
      showFieldError(fieldName, errorMessage);
    } else {
      clearFieldError(fieldName);
      input.classList.add('success');
      setTimeout(() => input.classList.remove('success'), 2000);
    }
    
    return isValid;
  }
  
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  function showFieldError(fieldName, message) {
    const field = document.getElementById(fieldName);
    if (!field) return;
    
    field.classList.add('error');
    
    // Remove existing error message
    clearFieldError(fieldName);
    
    // Add new error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    field.parentElement.appendChild(errorDiv);
  }
  
  function clearFieldError(fieldName) {
    const field = document.getElementById(fieldName);
    if (!field) return;
    
    field.classList.remove('error');
    const existingError = field.parentElement.querySelector('.error-message');
    if (existingError) existingError.remove();
  }
  
  function clearFormErrors() {
    document.querySelectorAll('.form-control').forEach(input => {
      input.classList.remove('error', 'success');
    });
    document.querySelectorAll('.error-message').forEach(error => error.remove());
  }
  
  function setButtonLoading(isLoading) {
    if (!submitBtn) return;
    
    const btnText = submitBtn.querySelector('.btn-text');
    const icon = submitBtn.querySelector('i');
    
    if (isLoading) {
      submitBtn.disabled = true;
      submitBtn.classList.add('loading');
      if (btnText) btnText.textContent = 'Sending...';
      if (icon) {
        icon.className = 'loading-spinner';
      }
    } else {
      submitBtn.disabled = false;
      submitBtn.classList.remove('loading');
      if (btnText) btnText.textContent = 'Send Message';
      if (icon) {
        icon.className = 'fas fa-paper-plane';
      }
    }
  }

  /* Email Modal Functions */
  function showEmailModal(type, title, message) {
    const modal = document.getElementById('emailModal');
    const icon = modal.querySelector('.email-modal-icon');
    const titleEl = modal.querySelector('.email-modal-title');
    const messageEl = modal.querySelector('.email-modal-message');
    
    // Set content
    titleEl.textContent = title;
    messageEl.textContent = message;
    
    // Set icon and styling based on type
    if (type === 'success') {
      icon.className = 'email-modal-icon success fas fa-check-circle';
    } else if (type === 'error') {
      icon.className = 'email-modal-icon error fas fa-exclamation-circle';
    }
    
    // Show modal
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
    
    // Auto close after 5 seconds for success
    if (type === 'success') {
      setTimeout(() => {
        closeEmailModal();
      }, 5000);
    }
  }
  
  window.closeEmailModal = function() {
    const modal = document.getElementById('emailModal');
    modal.classList.remove('show');
    document.body.style.overflow = '';
  }
  
  // Close modal on background click
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('email-modal')) {
      closeEmailModal();
    }
  });
  
  // Close modal on Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeEmailModal();
    }
  });

  /* Enhanced Notification System */
  function showNotification(message, type = 'info', duration = 4000) {
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
    console.log('📧 EmailJS Initialized:', typeof emailjs !== 'undefined');
  }

  /* Add smooth reveal animation to initially hidden elements */
  const hiddenElements = document.querySelectorAll('.skill-item, .project-card');
  hiddenElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  });
  
  console.log('✅ Enhanced Portfolio JavaScript with EmailJS Loaded Successfully!');
});
