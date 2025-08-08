/*
#todos
- [x] Define a reusable initializer identical to page-specific behavior
- [x] Provide a Web Component <mxm-testimonials> for declarative use
- [x] Support slotting raw HTML content (cards) to preserve markup
- [x] Auto-init animations, hover/touch pause, accessibility, perf observer
- [x] Expose cleanup for SPA
*/

(function () {
  // Ensure CSS is present so pages only need to include this JS
  (function ensureTestimonialsCssLoaded() {
    if (document.querySelector('link[data-mxm-testimonials-css], style[data-mxm-testimonials-css]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    // Use absolute path so it works from any subpage
    link.href = '/assets/css/testimonials.css';
    link.setAttribute('data-mxm-testimonials-css', 'true');
    document.head.appendChild(link);
  })();
  function getDefaultTestimonialsMarkup() {
    return `
      <!-- Row 1 - Scrolling Right to Left -->
      <div class="testimonials-row testimonials-row-1">
        <div class="testimonial-card">
          <div class="testimonial-content">
            <p class="testimonial-text">When Marissa was our team's Chief of Staff, she made everyone feel valued. She had this incredible gift for reading the room - knowing exactly when to inject humour, when to push harder, and when someone just needed a coffee and a chat. She'd champion our ideas to leadership, protect us from unnecessary politics, and somehow make even the most mundane tasks feel meaningful. She turned our dreaded Monday meetings into sessions we actually looked forward to - part strategy, part comedy show, all to bolster morale and unity. Her emotional intelligence is extremely rare and her energy is infectious. If you get the chance to work with her, prepare to be inspired</p>
            <div class="testimonial-author">
              <div class="author-name">Lorraine Hopkins</div>
              <div class="author-title">Agent / Producer, Artist Editions</div>
            </div>
          </div>
        </div>
        <div class="testimonial-card">
          <div class="testimonial-content">
            <p class="testimonial-text">Marissa and I have referred each other clients for years as our businesses have grown in tandem. The referral relationship we've built is pure gold. Every client I send to MxM comes back with their minds blown, and the clients she sends my way are perfectly primed to understand the value of AI-enhanced creative services. If you want someone who'll just set up ChatGPT for you, look elsewhere. If you want someone who'll fundamentally rewire how your business thinks about and uses AI, Marissa is the key to your AI literacy. What really sets Marissa apart is her project systemisation methodology. Commanding brilliance from any LLM becomes like second nature, she does just teach you how to use AI; she demonstrates how to build interconnected AI workflows that talk to each other based on your specific needs, team and business. Compounding the power of LLM's as the navigator to build your agentic ecosystems. I've seen clients go from AI-illiterate to AI-fluent in 8 weeks. Her 'mother threads' process is genuinely game-changing - it's like having a master architect design the blueprint for every AI conversation your team will ever need.</p>
            <div class="testimonial-author">
              <div class="author-name">Sascha Flook</div>
              <div class="author-title">Founder & CEO, Digital by Sasch</div>
            </div>
          </div>
        </div>
        <div class="testimonial-card">
          <div class="testimonial-content">
            <p class="testimonial-text">Marissa Kos is that rare combination of intellect, instinct, and velocity. A consummate operator in both marketing and AI, she doesn't just follow trends she bends them to her will. Her energy is relentless, her passion disarming, and her execution razor sharp. In a world full of noise, Marissa is a signal. A force to be reckoned with.</p>
            <div class="testimonial-author">
              <div class="author-name">Scott Crawford</div>
              <div class="author-title">Founder & CEO, 3verest</div>
            </div>
          </div>
        </div>
        <div class="testimonial-card">
          <div class="testimonial-content">
            <p class="testimonial-text">Marissa at MxM has helped us when it comes to leveraging AI, AI agents, and agentic workflows, our go to AI consultant across various ventures. Marissa has helped us identify exactly where AI can streamline and enhance business processes, making automation more effective and ensuring these solutions are scalable. Marissa's deep knowledge and industry connections make her a valuable resource for businesses looking to integrate AI-driven solutions into their business. Whether you're exploring AI agents or refining workflows with automation, I highly recommend you set up a call with Marissa to discuss all things AI.</p>
            <div class="testimonial-author">
              <div class="author-name">Jonothan Chilcott</div>
              <div class="author-title">Founder, Marlo Wellness</div>
            </div>
          </div>
        </div>
        <!-- Duplicate cards for seamless infinite scroll -->
        <div class="testimonial-card">
          <div class="testimonial-content">
            <p class="testimonial-text">When Marissa was our team's Chief of Staff, she made everyone feel valued. She had this incredible gift for reading the room - knowing exactly when to inject humour, when to push harder, and when someone just needed a coffee and a chat. She'd champion our ideas to leadership, protect us from unnecessary politics, and somehow make even the most mundane tasks feel meaningful. She turned our dreaded Monday meetings into sessions we actually looked forward to - part strategy, part comedy show, all to bolster morale and unity. Her emotional intelligence is extremely rare and her energy is infectious. If you get the chance to work with her, prepare to be inspired</p>
            <div class="testimonial-author">
              <div class="author-name">Lorraine Hopkins</div>
              <div class="author-title">Agent / Producer, Artist Editions</div>
            </div>
          </div>
        </div>
        <div class="testimonial-card">
          <div class="testimonial-content">
            <p class="testimonial-text">Marissa and I have referred each other clients for years as our businesses have grown in tandem. The referral relationship we've built is pure gold. Every client I send to MxM comes back with their minds blown, and the clients she sends my way are perfectly primed to understand the value of AI-enhanced creative services. If you want someone who'll just set up ChatGPT for you, look elsewhere. If you want someone who'll fundamentally rewire how your business thinks about and uses AI, Marissa is the key to your AI literacy. What really sets Marissa apart is her project systemisation methodology. Commanding brilliance from any LLM becomes like second nature, she does just teach you how to use AI; she demonstrates how to build interconnected AI workflows that talk to each other based on your specific needs, team and business. Compounding the power of LLM's as the navigator to build your agentic ecosystems. I've seen clients go from AI-illiterate to AI-fluent in 8 weeks. Her 'mother threads' process is genuinely game-changing - it's like having a master architect design the blueprint for every AI conversation your team will ever need.</p>
            <div class="testimonial-author">
              <div class="author-name">Sascha Flook</div>
              <div class="author-title">Founder & CEO, Digital by Sasch</div>
            </div>
          </div>
        </div>
        <div class="testimonial-card">
          <div class="testimonial-content">
            <p class="testimonial-text">Marissa Kos is that rare combination of intellect, instinct, and velocity. A consummate operator in both marketing and AI, she doesn't just follow trends she bends them to her will. Her energy is relentless, her passion disarming, and her execution razor sharp. In a world full of noise, Marissa is a signal. A force to be reckoned with.</p>
            <div class="testimonial-author">
              <div class="author-name">Scott Crawford</div>
              <div class="author-title">Founder & CEO, 3verest</div>
            </div>
          </div>
        </div>
        <div class="testimonial-card">
          <div class="testimonial-content">
            <p class="testimonial-text">Marissa at MxM has helped us when it comes to leveraging AI, AI agents, and agentic workflows, our go to AI consultant across various ventures. Marissa has helped us identify exactly where AI can streamline and enhance business processes, making automation more effective and ensuring these solutions are scalable. Marissa's deep knowledge and industry connections make her a valuable resource for businesses looking to integrate AI-driven solutions into their business. Whether you're exploring AI agents or refining workflows with automation, I highly recommend you set up a call with Marissa to discuss all things AI.</p>
            <div class="testimonial-author">
              <div class="author-name">Jonothan Chilcott</div>
              <div class="author-title">Founder, Marlo Wellness</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Row 2 - Scrolling Left to Right -->
      <div class="testimonials-row testimonials-row-2">
        <div class="testimonial-card">
          <div class="testimonial-content">
            <p class="testimonial-text">I've collaborated with Marissa on several projects, and her expertise in AI and marketing has been transformative for our business. Since working together, we've scaled our copy and marketing output by 2.5 to 3 times, cut down content creation time by roughly two hours a day, and completely rethought our positioning strategy for the better. I've found her insights to be sharp, actionable, and high-impact. I highly recommend her.</p>
            <div class="testimonial-author">
              <div class="author-name">Sami Jarrous</div>
              <div class="author-title">Co-Founder & Co-CEO, Mateship</div>
            </div>
          </div>
        </div>
        <div class="testimonial-card">
          <div class="testimonial-content">
            <p class="testimonial-text">Working with Marissa and the MxM team has been nothing short of amazing. The coaching has allowed us to use and leverage AI in ways we never thought possible and bring forward better solutions to our own clients as well as within the business ourselves. But here's what really impressed me, it wasn't just about the tech, Marissa's ability to understand brand mission and translate it into AI-powered systems that actually enhance creativity is brilliant. If you're on the fence about AI integration, stop overthinking it and call MxM.</p>
            <div class="testimonial-author">
              <div class="author-name">Avani Malhotra</div>
              <div class="author-title">Digital strategist & Co-Founder, SME Digital</div>
            </div>
          </div>
        </div>
        <div class="testimonial-card">
          <div class="testimonial-content">
            <p class="testimonial-text">Working with Marissa is like having an AI oracle on speed dial. She's spent years diving deep into artificial intelligence research and emerges with insights that consistently blow minds and deliver real results. Her passion for excellence isn't just talk - it's woven into every recommendation, strategy, and solution she crafts. Marissa has this rare combination of creative vision and analytical precision that makes her both innovative and data-driven. Beyond her technical brilliance, she's simply a joy to collaborate with - the kind of person who makes complex AI challenges feel manageable and exciting. When Marissa's handling your AI strategy, rest assured, you're working with someone who genuinely cares about your success and has the tools to make it happen.</p>
            <div class="testimonial-author">
              <div class="author-name">Fiorella Bonfiglioli</div>
              <div class="author-title">Founder and Director, Palermo Agency</div>
            </div>
          </div>
        </div>
        <div class="testimonial-card">
          <div class="testimonial-content">
            <p class="testimonial-text">I've had the privilege of watching Marissa build MxM from the ground up. From the very beginning, her vision, professionalism, and relentless drive were unmistakable. Her authentic leadership style commands respect through competence, integrity, and an infectious passion for innovation. And make no mistake — Marissa might be young in chronological age, but she's dynamic, fearless, and a true force - you want her in your corner! Her ability to articulate complex concepts with clarity, treat everyone with genuine warmth, and maintain unwavering professionalism under pressure is remarkable. She's the kind of person who elevates every room she enters and every project she touches. Having observed her journey from those early days, I can say with absolute certainty that Marissa represents the future of business - brilliant, bold, and beautifully human.</p>
            <div class="testimonial-author">
              <div class="author-name">Tracey Mietzke</div>
              <div class="author-title">COO, Athas</div>
            </div>
          </div>
        </div>
        <!-- Duplicate cards for seamless infinite scroll -->
        <div class="testimonial-card">
          <div class="testimonial-content">
            <p class="testimonial-text">I've collaborated with Marissa on several projects, and her expertise in AI and marketing has been transformative for our business. Since working together, we've scaled our copy and marketing output by 2.5 to 3 times, cut down content creation time by roughly two hours a day, and completely rethought our positioning strategy for the better. I've found her insights to be sharp, actionable, and high-impact. I highly recommend her.</p>
            <div class="testimonial-author">
              <div class="author-name">Sami Jarrous</div>
              <div class="author-title">Co-Founder & Co-CEO, Mateship</div>
            </div>
          </div>
        </div>
        <div class="testimonial-card">
          <div class="testimonial-content">
            <p class="testimonial-text">Working with Marissa and the MxM team has been nothing short of amazing. The coaching has allowed us to use and leverage AI in ways we never thought possible and bring forward better solutions to our own clients as well as within the business ourselves. But here's what really impressed me, it wasn't just about the tech, Marissa's ability to understand brand mission and translate it into AI-powered systems that actually enhance creativity is brilliant. If you're on the fence about AI integration, stop overthinking it and call MxM.</p>
            <div class="testimonial-author">
              <div class="author-name">Avani Malhotra</div>
              <div class="author-title">Digital strategist & Co-Founder, SME Digital</div>
            </div>
          </div>
        </div>
        <div class="testimonial-card">
          <div class="testimonial-content">
            <p class="testimonial-text">Working with Marissa is like having an AI oracle on speed dial. She's spent years diving deep into artificial intelligence research and emerges with insights that consistently blow minds and deliver real results. Her passion for excellence isn't just talk - it's woven into every recommendation, strategy, and solution she crafts. Marissa has this rare combination of creative vision and analytical precision that makes her both innovative and data-driven. Beyond her technical brilliance, she's simply a joy to collaborate with - the kind of person who makes complex AI challenges feel manageable and exciting. When Marissa's handling your AI strategy, rest assured, you're working with someone who genuinely cares about your success and has the tools to make it happen.</p>
            <div class="testimonial-author">
              <div class="author-name">Fiorella Bonfiglioli</div>
              <div class="author-title">Founder and Director, Palermo Agency</div>
            </div>
          </div>
        </div>
        <div class="testimonial-card">
          <div class="testimonial-content">
            <p class="testimonial-text">I've had the privilege of watching Marissa build MxM from the ground up. From the very beginning, her vision, professionalism, and relentless drive were unmistakable. Her authentic leadership style commands respect through competence, integrity, and an infectious passion for innovation. And make no mistake — Marissa might be young in chronological age, but she's dynamic, fearless, and a true force - you want her in your corner! Her ability to articulate complex concepts with clarity, treat everyone with genuine warmth, and maintain unwavering professionalism under pressure is remarkable. She's the kind of person who elevates every room she enters and every project she touches. Having observed her journey from those early days, I can say with absolute certainty that Marissa represents the future of business - brilliant, bold, and beautifully human.</p>
            <div class="testimonial-author">
              <div class="author-name">Tracey Mietzke</div>
              <div class="author-title">COO, Athas</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function initTestimonialsSection(root) {
    const scope = root || document;
    const testimonialsSection = scope.querySelector('.testimonials-rows-container');
    const testimonialsRows = scope.querySelectorAll('.testimonials-row');
    const testimonialsCards = scope.querySelectorAll('.testimonial-card');
    if (!testimonialsSection || testimonialsRows.length === 0) return;

    let isPaused = false;
    let pauseTimeout;
    let isTouch = false;
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    function pauseRowAnimation(row) { row.style.animationPlayState = 'paused'; }
    function resumeRowAnimation(row) { row.style.animationPlayState = 'running'; }
    function pauseAllAnimations() {
      if (isPaused) return;
      isPaused = true;
      testimonialsRows.forEach(row => { row.style.animationPlayState = 'paused'; });
    }
    function resumeAllAnimations() {
      isPaused = false;
      testimonialsRows.forEach(row => { row.style.animationPlayState = 'running'; });
    }
    function initializeAnimations() {
      testimonialsRows.forEach((row, index) => {
        row.style.animationPlayState = 'running';
        row.style.transform = index === 0 ? 'translateX(0)' : 'translateX(-100%)';
      });
    }
    function scheduleAutoResume() {
      clearTimeout(pauseTimeout);
      pauseTimeout = setTimeout(() => { if (!isTouch) resumeAllAnimations(); }, 3000);
    }

    if (!isTouchDevice) {
      testimonialsRows.forEach(row => {
        const cardsInRow = row.querySelectorAll('.testimonial-card');
        const MAX_ROTATION = 2;
        row.addEventListener('mouseenter', () => { pauseRowAnimation(row); });
        row.addEventListener('mouseleave', () => { resumeRowAnimation(row); isPaused = false; });
        cardsInRow.forEach(card => {
          card.addEventListener('mouseleave', () => {
            card.style.setProperty('--rotateX', '0deg');
            card.style.setProperty('--rotateY', '0deg');
          });
          card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const mouseX = e.clientX - rect.left - rect.width / 2;
            const mouseY = e.clientY - rect.top - rect.height / 2;
            const rotateY = (mouseX / (rect.width / 2)) * MAX_ROTATION;
            const rotateX = -1 * (mouseY / (rect.height / 2)) * MAX_ROTATION;
            card.style.setProperty('--rotateX', `${rotateX}deg`);
            card.style.setProperty('--rotateY', `${rotateY}deg`);
          });
        });
      });
    }

    if (isTouchDevice) {
      testimonialsCards.forEach(card => {
        card.addEventListener('touchstart', () => { isTouch = true; pauseAllAnimations(); scheduleAutoResume(); }, { passive: true });
        card.addEventListener('touchend', () => { isTouch = false; scheduleAutoResume(); }, { passive: true });
      });
      testimonialsSection.addEventListener('touchstart', () => { isTouch = true; pauseAllAnimations(); scheduleAutoResume(); }, { passive: true });
      testimonialsSection.addEventListener('touchend', () => { isTouch = false; scheduleAutoResume(); }, { passive: true });
    }

    testimonialsCards.forEach(card => {
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'article');
      card.setAttribute('aria-label', 'Customer testimonial');
      card.addEventListener('focus', () => { pauseAllAnimations(); });
      card.addEventListener('blur', () => { resumeAllAnimations(); });
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (isPaused) resumeAllAnimations(); else pauseAllAnimations();
        }
      });
    });

    const observerOptions = { root: null, rootMargin: '50px', threshold: 0.1 };
    const testimonialsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          isPaused = false;
          clearTimeout(pauseTimeout);
          setTimeout(() => {
            resumeAllAnimations();
            testimonialsRows.forEach(row => {
              if (row.style.animationPlayState === 'paused') row.style.animationPlayState = 'running';
            });
          }, 100);
        } else {
          testimonialsRows.forEach(row => { row.style.animationPlayState = 'paused'; });
        }
      });
    }, observerOptions);
    testimonialsObserver.observe(testimonialsSection);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    function handleReducedMotion() {
      if (prefersReducedMotion.matches) {
        testimonialsRows.forEach(row => { row.style.animationPlayState = 'paused'; });
      } else {
        resumeAllAnimations();
      }
    }
    handleReducedMotion();
    prefersReducedMotion.addEventListener('change', handleReducedMotion);

    let animationFrameId;
    function monitorPerformance() {
      const startTime = performance.now();
      animationFrameId = requestAnimationFrame(() => {
        const endTime = performance.now();
        const frameTime = endTime - startTime;
        if (frameTime > 20) {
          testimonialsRows.forEach(row => { row.style.willChange = 'auto'; });
        }
        monitorPerformance();
      });
    }
    monitorPerformance();

    initializeAnimations();

    return function cleanup() {
      clearTimeout(pauseTimeout);
      testimonialsObserver.disconnect();
      prefersReducedMotion.removeEventListener('change', handleReducedMotion);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }

  // Expose a minimal API
  window.MxmTestimonials = { init: initTestimonialsSection };

  // Web Component that preserves light DOM markup inside
  class MxmTestimonialsElement extends HTMLElement {
    constructor() {
      super();
      this._cleanup = null;
    }
    connectedCallback() {
      this.classList.add('mxm-testimonials');
      // Ensure expected structure exists; if not, create wrapper and move children
      let container = this.querySelector('.testimonials-rows-container');
      if (!container) {
        container = document.createElement('div');
        container.className = 'testimonials-rows-container';
        while (this.firstChild) container.appendChild(this.firstChild);
        this.appendChild(container);
      }
      const src = this.getAttribute('src') || this.getAttribute('data-src') || '/assets/data/testimonials.json';
      const renderFromData = (items) => {
        if (!Array.isArray(items) || items.length === 0) return false;
        // Build two rows by splitting data roughly in half; duplicate to create seamless scroll
        const midpoint = Math.ceil(items.length / 2);
        const row1 = items.slice(0, midpoint);
        const row2 = items.slice(midpoint);

        function renderRow(rowItems) {
          const cards = rowItems.map(t => `
            <div class="testimonial-card">
              <div class="testimonial-content">
                <p class="testimonial-text">${(t.text || '').replace(/</g,'&lt;')}</p>
                <div class="testimonial-author">
                  <div class="author-name">${t.authorName || ''}</div>
                  <div class="author-title">${[t.authorTitle, t.authorCompany].filter(Boolean).join(', ')}</div>
                </div>
              </div>
            </div>`).join('');
          // duplicate for seamless loop
          return cards + cards;
        }

        const row1Html = renderRow(row1.length ? row1 : items);
        const row2Html = renderRow(row2.length ? row2 : items);

        container.innerHTML = `
          <div class="testimonials-row testimonials-row-1">${row1Html}</div>
          <div class="testimonials-row testimonials-row-2">${row2Html}</div>
        `;
        return true;
      };

      const tryInit = () => { this._cleanup = initTestimonialsSection(this); };

      // If there are no rows yet, try to fetch JSON and render; else keep existing
      if (!container.querySelector('.testimonials-row')) {
        fetch(src).then(r => r.ok ? r.json() : Promise.reject()).then(json => {
          const items = Array.isArray(json) ? json : (json && Array.isArray(json.testimonials) ? json.testimonials : []);
          if (!renderFromData(items)) {
            container.innerHTML = getDefaultTestimonialsMarkup();
          }
          tryInit();
        }).catch(() => {
          container.innerHTML = getDefaultTestimonialsMarkup();
          tryInit();
        });
      } else {
        tryInit();
      }
    }
    disconnectedCallback() {
      if (typeof this._cleanup === 'function') this._cleanup();
      this._cleanup = null;
    }
  }

  if (!customElements.get('mxm-testimonials')) {
    customElements.define('mxm-testimonials', MxmTestimonialsElement);
  }
  // Alias singular tag for convenience
  if (!customElements.get('mxm-testimonial')) {
    customElements.define('mxm-testimonial', MxmTestimonialsElement);
  }
})();


