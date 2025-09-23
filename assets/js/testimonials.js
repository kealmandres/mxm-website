/*
#todos
- [x] Simplified JS - only handles HTML structure and data fetching
- [x] All animations now handled by CSS-only infinite scroll
- [x] Automatic duplication for seamless loops
- [x] Web Component support maintained
- [x] No animation JavaScript required
*/

(function () {
  // Ensure CSS is present
  (function ensureTestimonialsCssLoaded() {
    if (document.querySelector('link[data-mxm-testimonials-css], style[data-mxm-testimonials-css]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/assets/css/testimonials.css';
    link.setAttribute('data-mxm-testimonials-css', 'true');
    document.head.appendChild(link);
  })();

  function getDefaultTestimonialsMarkup() {
    return `
      <!-- Testimonials CTA Button -->
      <div class="testimonials-cta-container">
        <button onclick="openTestimonialsModal()" class="explore-btn ai-cta-button testimonials-cta-button">
          <span class="play-icon"></span>
          <div class="testimonial-button-content">
            <div class="testimonial-button-main">
              <span class="testimonial-action">View video testimonial</span>
              <span class="testimonial-dash">—</span>
              <span class="testimonial-name">Dain Walker</span>
            </div>
            <div class="testimonial-title">Founder of Rivyl Agency & Host of the Agency Podcast</div>
          </div>
        </button>
      </div>

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
        <!-- CSS-only infinite scroll requires duplication for seamless loop -->
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
        <!-- CSS-only infinite scroll requires duplication for seamless loop -->
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

  // Initialization - measure content and inject CSS vars for pixel-perfect seamless scroll
  function initTestimonialsSection(root) {
    const scope = root || document;
    const container = scope.querySelector('.testimonials-rows-container');
    if (!container) return;

    const rows = Array.from(scope.querySelectorAll('.testimonials-row'));
    if (rows.length === 0) return;

    // Add accessibility attributes
    const testimonialsCards = scope.querySelectorAll('.testimonial-card');
    testimonialsCards.forEach(card => {
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'article');
      card.setAttribute('aria-label', 'Customer testimonial');
    });

    // Measurement and animation setup
    const setupSeamlessScroll = (row) => {
      // Double RAF to ensure layout and fonts have applied for accurate scrollWidth
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const halfWidth = Math.max(0, Math.round((row.scrollWidth || 0) / 2));
          // Fallback to 800px if measurement fails
          const distancePx = halfWidth > 0 ? -halfWidth : -800;
          row.style.setProperty('--scroll-distance', distancePx + 'px');

          // Adaptive duration based on distance; clamped for UX consistency
          // Speed target: ~60px/s baseline
          const adaptiveSeconds = Math.max(20, Math.min(120, Math.round(Math.abs(distancePx) / 60)));
          row.style.setProperty('--scroll-duration-auto', adaptiveSeconds + 's');
        });
      });
    };

    rows.forEach(setupSeamlessScroll);

    // ResizeObserver to re-measure on layout/viewport/content changes
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const target = entry.target;
        if (rows.includes(target)) {
          setupSeamlessScroll(target);
        }
      }
    });

    rows.forEach((row) => resizeObserver.observe(row));

    // Optional: re-measure after fonts load (if supported)
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => rows.forEach(setupSeamlessScroll)).catch(() => {});
    }

    // Cleanup function
    return function cleanup() {
      try { resizeObserver.disconnect(); } catch (_) {}
    };
  }

  // Expose API
  window.MxmTestimonials = { init: initTestimonialsSection };

  // Web Component
  class MxmTestimonialsElement extends HTMLElement {
    constructor() {
      super();
      this._cleanup = null;
    }

    connectedCallback() {
      this.classList.add('mxm-testimonials');
      
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
        
        const midpoint = Math.ceil(items.length / 2);
        const row1 = items.slice(0, midpoint);
        const row2 = items.slice(midpoint);

        function renderRow(rowItems, duplicateForInfiniteScroll = true) {
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
          
          // CSS-only infinite scroll requires exact duplication
          return duplicateForInfiniteScroll ? cards + cards : cards;
        }

        const row1Html = renderRow(row1.length ? row1 : items);
        const row2Html = renderRow(row2.length ? row2 : items);

        container.innerHTML = `
          <!-- Testimonials CTA Button -->
          <div class="testimonials-cta-container">
            <button onclick="openTestimonialsModal()" class="testimonials-cta-button">
              <div class="testimonial-button-content">
                <div class="testimonial-button-main">
                  <span class="play-icon"></span>
                  <span class="testimonial-action">View video testimonial</span>
                </div>
                <div class="testimonial-author-text">
                   <div class="testimonial-name">Dain Walker</div>
                   <div class="testimonial-title">Founder of Rivyl Agency & Host of the Agency Podcast</div>
                 </div>
              </div>
            </button>
          </div>

          <div class="testimonials-row testimonials-row-1">${row1Html}</div>
          <div class="testimonials-row testimonials-row-2">${row2Html}</div>
        `;
        return true;
      };

      const tryInit = () => {
        if (typeof this._cleanup === 'function') { try { this._cleanup(); } catch (_) {} }
        this._cleanup = initTestimonialsSection(this);
      };

      // Handle data loading (same as before)
      if (!container.querySelector('.testimonials-row')) {
        const cacheKey = 'mxm_testimonials_v1';
        const cachedRaw = localStorage.getItem(cacheKey) || sessionStorage.getItem(cacheKey);
        const fallbackSrc = '/assets/data/testimonials.json';
        const webhookUrl = '/api/testimonials-webhook';

        const normalizeWebhookItems = (json) => {
          if (!Array.isArray(json)) return [];
          return json
            .filter(i => i && (i.property_is_active === true || i.property_is_active === 'true'))
            .map(i => ({
              id: i.id,
              text: i.property_text || '',
              authorName: i.property_author || i.name || '',
              authorTitle: i.property_title || '',
              authorCompany: i.property_company || ''
            }));
        };

        const renderAndInit = (items) => {
          if (!renderFromData(items)) {
            container.innerHTML = getDefaultTestimonialsMarkup();
          }
          tryInit();
        };

        // Load cached data immediately if available
        try {
          if (cachedRaw) {
            const cached = JSON.parse(cachedRaw);
            const items = Array.isArray(cached) ? cached : (cached && Array.isArray(cached.testimonials) ? cached.testimonials : []);
            if (items && items.length) {
              renderAndInit(items);
            }
          }
        } catch (_) {}

        // Always fetch latest from webhook
        fetch(webhookUrl)
          .then(r => r.ok ? r.json() : Promise.reject(new Error('Webhook response not ok')))
          .then(json => {
            const items = Array.isArray(json?.testimonials) ? json.testimonials : normalizeWebhookItems(json);
            if (items && items.length) {
              try { localStorage.setItem(cacheKey, JSON.stringify({ testimonials: items, updatedAt: new Date().toISOString() })); } catch (_) {}
              renderAndInit(items);
            } else {
              throw new Error('Webhook returned no active items');
            }
          })
          .catch((err) => {
            const primary = src || fallbackSrc;
            fetch(primary)
              .then(r => r.ok ? r.json() : Promise.reject())
              .then(json => {
                const items = Array.isArray(json) ? json : (json && Array.isArray(json.testimonials) ? json.testimonials : []);
                try { localStorage.setItem(cacheKey, JSON.stringify({ testimonials: items, updatedAt: new Date().toISOString() })); } catch (_) {}
                renderAndInit(items);
              })
              .catch((err2) => {
                container.innerHTML = getDefaultTestimonialsMarkup();
                tryInit();
              });
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
  
  if (!customElements.get('mxm-testimonial')) {
    class MxmTestimonialsElementAlias extends MxmTestimonialsElement {}
    customElements.define('mxm-testimonial', MxmTestimonialsElementAlias);
  }

  // Create and inject testimonials modal
  function createTestimonialsModal() {
    if (document.getElementById('testimonialsModal')) return;

    const modalHTML = `
    <div id="testimonialsModal" class="modal">
      <div class="modal-content" style="max-width: 1200px; width: 80%; box-sizing: border-box; overflow-x: hidden;">
        <span class="close" onclick="window.closeTestimonialsModal()">&times;</span>
        <div class="container" style="width: 100%; box-sizing: border-box;">
          <div class="video-hero-wrapper" style="margin-bottom: 10px;">
            <section class="page-section video-hero-section" data-section-type="video-hero">
              <div class="video-container">
                <div class="video-placeholder">
                  <iframe id="testimonialsModalVideo" src="https://player.vimeo.com/video/1121060678?h=ddaaec84b7&amp;autoplay=0&amp;loop=0&amp;title=0&amp;byline=0&amp;portrait=0" width="100%" height="100%" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" style="position:absolute;top:0;left:0;width:100%;height:100%;"></iframe>
                </div>
              </div>
              <div class="artistic-background-text">aRTiFICIALLY iNTELLIGENT</div>
            </section>
          </div>
        </div>
      </div>
    </div>`;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }

  // Global modal functions
  window.testimonialsModalPlayer = null;

  window.openTestimonialsModal = function() {
    createTestimonialsModal();
    document.getElementById('testimonialsModal').style.display = "flex";

    // Initialize Vimeo player and play video when modal opens
    const iframe = document.getElementById('testimonialsModalVideo');
    if (iframe && !window.testimonialsModalPlayer) {
      window.testimonialsModalPlayer = new Vimeo.Player(iframe);
      window.testimonialsModalPlayer.play();
    } else if (window.testimonialsModalPlayer) {
      window.testimonialsModalPlayer.play();
    }
  };

  window.closeTestimonialsModal = function() {
    const modal = document.getElementById('testimonialsModal');
    if (modal) {
      modal.style.display = "none";

      // Pause video when modal closes
      if (window.testimonialsModalPlayer) {
        window.testimonialsModalPlayer.pause();
      }
    }
  };

  // Close modal when clicking outside or pressing Escape
  document.addEventListener('click', function(event) {
    const modal = document.getElementById('testimonialsModal');
    if (event.target === modal) {
      window.closeTestimonialsModal();
    }
  });

  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
      window.closeTestimonialsModal();
    }
  });

})();
