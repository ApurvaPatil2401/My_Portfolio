/* ==========================================================================
   SPACE PARTICLE ENGINE (HTML5 CANVAS)
   ========================================================================== */
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');

let particles = [];
const particleCount = 70; // Performance friendly particle density

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Particle {
    constructor() {
        this.reset();
        // Stagger initial vertical distribution
        this.y = Math.random() * canvas.height;
    }
    
    reset() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + 20;
        this.vx = (Math.random() - 0.5) * 0.35;
        this.vy = -(Math.random() * 0.45 + 0.15); // Anti-gravity: slowly float upwards
        this.radius = Math.random() * 2.2 + 0.6;
        
        // Distribute colors between signature accent colors
        const colorRand = Math.random();
        if (colorRand > 0.6) {
            this.color = 'rgba(124, 92, 252,'; // Purple accent
        } else if (colorRand > 0.2) {
            this.color = 'rgba(92, 208, 181,';  // Teal accent
        } else {
            this.color = 'rgba(240, 122, 90,';  // Coral accent
        }
        this.opacity = Math.random() * 0.45 + 0.15;
    }
    
    update(mouse) {
        this.x += this.vx;
        this.y += this.vy;
        
        // Wrap horizontally
        if (this.x < -10) this.x = canvas.width + 10;
        if (this.x > canvas.width + 10) this.x = -10;
        
        // Reset if they float off the top
        if (this.y < -20) {
            this.reset();
        }
        
        // Mouse push interaction
        if (mouse.x !== null && mouse.y !== null) {
            const dx = this.x - mouse.x;
            const dy = this.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < mouse.radius) {
                const force = (mouse.radius - dist) / mouse.radius;
                const angle = Math.atan2(dy, dx);
                // Subtle push force
                this.x += Math.cos(angle) * force * 1.5;
                this.y += Math.sin(angle) * force * 1.5;
            }
        }
    }
    
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color + this.opacity + ')';
        ctx.fill();
    }
}

// Initialize particles
for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
}

// Mouse position state
let mouse = {
    x: null,
    y: null,
    radius: 130
};

window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
});

// Canvas animation loop
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw subtle connecting lines (constellations)
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < 110) {
                // Connection fades out as distance increases
                const alpha = (1 - dist / 110) * 0.08;
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                
                // Select line color based on proximity
                ctx.strokeStyle = `rgba(124, 92, 252, ${alpha})`;
                ctx.lineWidth = 0.5;
                ctx.stroke();
            }
        }
        
        particles[i].update(mouse);
        particles[i].draw();
    }
    
    requestAnimationFrame(animate);
}
animate();

/* ==========================================================================
   3D CARD TILT & GLOW HOVER EFFECTS
   ========================================================================== */
const cards = document.querySelectorAll('.card-lift');

cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        
        // Mouse coordinates relative to card
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Card midpoints
        const xc = rect.width / 2;
        const yc = rect.height / 2;
        
        // Calculate degree of rotation (max 6 degrees to maintain readability)
        const rotateX = ((yc - y) / yc) * 6;
        const rotateY = -((xc - x) / xc) * 6;
        
        // Apply transform properties
        card.style.transform = `perspective(800px) translateY(-10px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
    
    card.addEventListener('mouseleave', () => {
        // Return to default state with smooth easing transition
        card.style.transform = 'perspective(800px) translateY(0deg) rotateX(0deg) rotateY(0deg)';
    });
});

/* ==========================================================================
   NAVIGATION MENU & SCROLLSPY
   ========================================================================== */
const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('.nav-menu');

// Mobile drawer toggle
menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close drawer on link click
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-link');

// Scroll Spy implementation
function scrollSpy() {
    const scrollPos = window.scrollY || document.documentElement.scrollTop;
    let currentSection = '';
    
    // Find section intersecting top of viewport
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 220;
        if (scrollPos >= sectionTop) {
            currentSection = section.getAttribute('id');
        }
    });
    
    // Map educational and highlight subsections to primary Nav items
    const navMapping = {
        'hero': '',
        'skills': 'skills',
        'education': 'skills', // Sub-route of Skills block
        'projects': 'projects',
        'highlights-research': 'projects', // Sub-route of Projects block
        'contact': 'contact'
    };
    
    const activeNavItem = navMapping[currentSection] || '';
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if (activeNavItem && href === `#${activeNavItem}`) {
            link.classList.add('active');
        }
    });
    
    // Navbar glass dynamic border shadow on scroll
    const navbar = document.querySelector('.navbar');
    if (scrollPos > 50) {
        navbar.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';
        navbar.style.padding = '8px 0';
    } else {
        navbar.style.boxShadow = 'none';
        navbar.style.padding = '0';
    }
}

window.addEventListener('scroll', scrollSpy);
// Execute on load to set initial state
scrollSpy();
