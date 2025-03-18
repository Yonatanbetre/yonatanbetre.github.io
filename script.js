// ---------- Typewriter Effect ----------
function typeWriter(element, text, speed) {
  let i = 0;
  element.textContent = "";
  function type() {
      if (i < text.length) {
          element.textContent += text.charAt(i);
          i++;
          setTimeout(type, speed);
      }
  }
  type();
}

// ---------- Card Scrolling & Snapping ----------
let accumulatedDelta = 0;
let scrollTimeout = null;
const threshold = 100;
const tabs = document.querySelectorAll('.tab');
const containers = document.querySelectorAll('.cards-container');

// Tab click handlers
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      containers.forEach(container => container.style.display = 'none');
      
      tab.classList.add('active');
      const targetContainer = document.getElementById(tab.dataset.target);
      if (targetContainer) {
          targetContainer.style.display = 'flex';
          attachScrollListener(targetContainer);
          updateActiveCard(targetContainer);
      }
  });
});

function attachScrollListener(container) {
  container.removeEventListener('scroll', scrollHandler);
  container.removeEventListener('wheel', wheelHandler);
  
  container.addEventListener('scroll', scrollHandler);
  container.addEventListener('wheel', wheelHandler, { passive: false });
}

function wheelHandler(e) {
  e.preventDefault();
  accumulatedDelta += e.deltaY;
  
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(() => {
      const cards = Array.from(this.querySelectorAll('.card'));
      const activeIndex = cards.findIndex(c => c.classList.contains('active-card')) || 0;
      const newIndex = Math.max(0, Math.min(
          activeIndex + Math.round(accumulatedDelta / threshold),
          cards.length - 1
      ));
      
      const targetCard = cards[newIndex];
      const scrollTo = targetCard.offsetLeft - 
                     (this.clientWidth - targetCard.clientWidth) / 2;
      
      this.scrollTo({
          left: scrollTo,
          behavior: 'smooth'
      });
      
      accumulatedDelta = 0;
  }, 150);
}

function scrollHandler(e) {
  updateActiveCard(e.target);
}

function updateActiveCard(container) {
  const containerCenter = container.getBoundingClientRect().left + 
                       container.clientWidth / 2;
  
  container.querySelectorAll('.card').forEach(card => {
      const cardRect = card.getBoundingClientRect();
      const distance = Math.abs(containerCenter - (cardRect.left + cardRect.width/2));
      card.classList.toggle('active-card', distance < cardRect.width/2);
      
      if (distance < cardRect.width/2) {
          card.style.transform = 'scale(1.1)';
      } else {
          card.style.transform = 'scale(1)';
      }
  });
}

// ---------- Modal System ----------
function openModal(modalId) {
  document.getElementById(modalId).style.display = 'flex';
}

function closeModal(modalId) {
  document.getElementById(modalId).style.display = 'none';
}

// ---------- Image Viewer ----------
let currentImageIndex = 0;
let currentModalImages = [];
let touchStartX = 0;

function openImageViewer(modalId, imageSrc) {
  const modal = document.getElementById(modalId);
  currentModalImages = Array.from(modal.querySelectorAll('.image-gallery img'))
                        .map(img => img.src);
  currentImageIndex = currentModalImages.indexOf(imageSrc);
  
  const viewer = document.getElementById('imageViewer');
  const img = document.getElementById('expandedImage');
  
  viewer.style.opacity = 0;
  viewer.style.display = 'flex';
  img.src = imageSrc;
  
  void viewer.offsetHeight; // Trigger reflow
  viewer.style.opacity = 1;
  img.style.transform = 'scale(1)';
}

function closeImageViewer() {
  const viewer = document.getElementById('imageViewer');
  viewer.style.opacity = 0;
  
  setTimeout(() => {
      viewer.style.display = 'none';
  }, 300);
}


// Fixed navigation functions
function prevImage() {
  navigateImage(-1);
}

function nextImage() {
  navigateImage(1);
}

function navigateImage(step) {
  currentImageIndex = (currentImageIndex + step + currentModalImages.length) % currentModalImages.length;
  const img = document.getElementById('expandedImage');
  
  img.style.opacity = 0;
  img.style.transform = 'scale(0.95)';
  
  setTimeout(() => {
      img.src = currentModalImages[currentImageIndex];
      img.style.opacity = 1;
      img.style.transform = 'scale(1)';
  }, 300);
}


// ---------- Event Listeners ----------
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeImageViewer();
});

document.addEventListener('keydown', e => {
  const viewer = document.getElementById('imageViewer');
  if (viewer.style.display === 'flex') {
      switch(e.key) {
          case 'ArrowLeft':
              e.preventDefault();
              prevImage();
              break;
          case 'ArrowRight':
              e.preventDefault();
              nextImage();
              break;
          case 'Escape':
              closeImageViewer();
              break;
      }
  }
});

window.addEventListener('click', e => {
  if (e.target.classList.contains('modal')) {
      e.target.style.display = 'none';
  }
});

document.addEventListener('touchstart', e => {
  touchStartX = e.touches[0].clientX;
});

document.addEventListener('touchend', e => {
  const deltaX = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(deltaX) > 50) {
      deltaX > 0 ? prevImage() : nextImage();
  }
});

// ---------- Image Loading Effects ----------
document.querySelectorAll('.card-image img').forEach(img => {
  // Set initial state
  img.style.opacity = '0';
  img.style.transform = 'scale(0.95)';
  img.style.transition = 'opacity 0.5s ease, transform 0.3s ease';

  // Handle both cached and new images
  const loadHandler = () => {
      img.style.opacity = '1';
      img.style.transform = 'scale(1)';
  };

  if (img.complete) {
      // Image already loaded
      loadHandler();
  } else {
      // Wait for load
      img.addEventListener('load', loadHandler);
      // Fallback in case load event doesn't fire
      setTimeout(loadHandler, 1000);
  }

  // Error handling
  img.addEventListener('error', () => {
      console.error('Error loading image:', img.src);
      img.style.opacity = '1';
      img.style.transform = 'scale(1)';
      img.src = 'fallback-image.jpg'; // Add a fallback image path
  });
});

// ---------- Initialization ----------
document.addEventListener('DOMContentLoaded', () => {
  // Typewriter
  const typedDescription = document.getElementById('typed-description');
  if (typedDescription) {
      typeWriter(typedDescription, typedDescription.textContent, 30);
  }
  
  // Initialize first container
  const activeContainer = document.querySelector('.cards-container:not([style*="none"])');
  if (activeContainer) {
      attachScrollListener(activeContainer);
      updateActiveCard(activeContainer);
  }
  
// JavaScript to toggle mobile menu visibility
document.querySelector('.menu-toggle').addEventListener('click', function() {
  const mobileNav = document.querySelector('.mobile-nav');
  
  // Toggle the 'active' class to open/close the menu
  mobileNav.classList.toggle('active');
});
  
  
});


// MY RESUME

// Animate skill bars when section comes into view
document.addEventListener('DOMContentLoaded', function() {
  const skillItems = document.querySelectorAll('.skill-item');
  
  const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
          if(entry.isIntersecting) {
              const level = entry.target.dataset.level;
              const progressBar = entry.target.querySelector('.skill-progress');
              progressBar.style.width = `${level}%`;
          }
      });
  }, { threshold: 0.5 });

  skillItems.forEach(item => observer.observe(item));
});