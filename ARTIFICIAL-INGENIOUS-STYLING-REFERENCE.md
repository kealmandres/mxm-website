# Artificial Ingenious - Complete Styling Reference

> **Purpose**: This document serves as a comprehensive styling reference for the Artificial Ingenious page design. Use this as a guide to replicate the visual aesthetic, typography, glass panel effects, animations, and responsive behavior in other applications.

---

## Table of Contents
1. [Design Philosophy](#design-philosophy)
2. [Color Palette](#color-palette)
3. [Typography System](#typography-system)
4. [Glass Panel Effects (Glassmorphism)](#glass-panel-effects-glassmorphism)
5. [Animations & Transitions](#animations--transitions)
6. [Spacing & Layout](#spacing--layout)
7. [Button Styles](#button-styles)
8. [Card Components](#card-components)
9. [Responsive Breakpoints](#responsive-breakpoints)
10. [Special Effects & Details](#special-effects--details)

---

## Design Philosophy

**Visual Style**: Futuristic cyberpunk aesthetic with heavy glassmorphism
**Key Elements**:
- Dark background with semi-transparent glass panels
- White text with subtle glows
- Smooth animations and hover effects
- Clean, condensed typography
- Responsive design that scales elegantly

---

## Color Palette

### Primary Colors
```css
/* Background */
--background-primary: #000000;
--background-glass: rgba(0, 0, 0, 0.85);
--background-glass-alt: rgba(25, 25, 35, 0.65);

/* Text */
--text-primary: #FFFFFF;
--text-secondary: #FFFFFF;

/* Borders & Accents */
--border-glass: rgba(255, 255, 255, 0.2);
--border-glass-subtle: rgba(255, 255, 255, 0.1);

/* Glow Effects */
--glow-blue: rgba(255, 255, 255, 0.3);
--glow-pink: rgba(255, 255, 255, 0.3);
--glow-white: rgba(255, 255, 255, 0.2);
```

### Usage Examples
- **Page background**: Pure black `#000000`
- **Glass panels**: `rgba(0, 0, 0, 0.85)` with blur
- **All text**: White `#FFFFFF`
- **Borders**: `rgba(255, 255, 255, 0.2)`

---

## Typography System

### Font Families

#### Primary Fonts
```css
/* Titles, Headers, Buttons */
font-family: "Uniform Extra Condensed", sans-serif;
font-weight: 300; /* Light - default */
font-weight: 700; /* Bold - for emphasis */

/* Body Copy, Descriptions, Paragraphs */
font-family: "Cartograph Mono", monospace;
font-weight: normal;
```

#### Font Loading (CSS)
```css
@font-face {
  font-family: 'Uniform Extra Condensed';
  src: url('../fonts/UniformExtraCondensed.ttf') format('truetype');
  font-weight: 300;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Cartograph Mono';
  src: url('../fonts/CartographMono.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}
```

### Font Size Scale

#### Desktop Sizes
```css
/* Large Titles */
.room-title (H1): 3.5rem;          /* Main page title */
.section-title (H2): 2.8rem;       /* Section headers */
.cta-title: 2.5rem;                /* Call-to-action headers */
.step-number: 2.5rem;              /* Process step numbers */
.diagnosis-price: 2.5rem;          /* Price displays */

/* Medium Titles */
.offering-title: 1.8rem;           /* Package/card titles */
.step-title (H3): 1.6rem;          /* Process step titles */
.use-case-title: 1.4rem;           /* Use case titles */

/* Pricing */
.offering-price: 2rem;             /* Package pricing */

/* Body Text */
p, .intro-text, .room-description: 1.05rem;  /* Primary body text */
.offering-description: 0.95rem;               /* Card descriptions */
.faq-question h3: 1.1rem;                     /* FAQ questions */
.faq-answer p: 0.95rem;                       /* FAQ answers */

/* Small Text */
.offering-features li: 0.9rem;     /* List items */
.testimonial-text: 0.85rem;        /* Testimonial content */
```

#### Mobile Sizes (Responsive)
```css
/* Mobile: max-width 768px */
.room-title: clamp(2rem, 6vw, 2.5rem);
.section-title: clamp(1.8rem, 5vw, 2rem);
.cta-title: clamp(1.6rem, 4.5vw, 1.8rem);

/* Body text on mobile */
p, .intro-text: 0.95rem;
```

### Typography Styling
```css
/* Letter spacing for headers */
letter-spacing: 2px;

/* Line height */
line-height: 1.6;  /* Body text */
line-height: 1.75; /* Paragraph text */

/* Text shadow for titles */
text-shadow: 0 0 12px rgba(255, 255, 255, 0.3);

/* Text transform */
text-transform: uppercase; /* For buttons and titles */
```

---

## Glass Panel Effects (Glassmorphism)

### Core Glass Effect Variables
```css
--ai-glass-bg: rgba(25, 25, 35, 0.65);
--ai-glass-border: rgba(255, 255, 255, 0.2);
--ai-card-border-radius: 18px;
```

### Primary Glass Panel (Sections)
**Used for**: Main section containers, page sections

```css
.glass-section {
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.35),
    inset 0 0 0 1.5px rgba(255, 255, 255, 0.06),
    0 0 60px rgba(255, 255, 255, 0.12);
  transition: transform 0.4s ease, box-shadow 0.4s ease;
}

/* Hover effect */
.glass-section:hover {
  transform: translateY(-6px);
  box-shadow:
    0 18px 55px rgba(0, 0, 0, 0.45),
    inset 0 0 0 1.5px rgba(255, 255, 255, 0.09),
    0 0 80px rgba(255, 255, 255, 0.18);
}
```

### Glass Card (Offerings, Cards)
**Used for**: Package cards, offering cards, feature cards

```css
.glass-card {
  background: rgba(25, 25, 35, 0.65);
  backdrop-filter: blur(12px) saturate(120%);
  -webkit-backdrop-filter: blur(12px) saturate(120%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 18px;
  box-shadow:
    0 8px 30px rgba(0, 0, 0, 0.3),
    inset 0 0 0 1px rgba(255, 255, 255, 0.05),
    0 0 40px rgba(255, 255, 255, 0.1);
  transition: transform 0.35s ease-out, box-shadow 0.35s ease-out;
}

/* Hover effect */
.glass-card:hover {
  transform: translateY(-6px);
  box-shadow:
    0 14px 45px rgba(0, 0, 0, 0.4),
    inset 0 0 0 1.5px rgba(255, 255, 255, 0.08),
    0 0 60px rgba(255, 255, 255, 0.3);
}
```

### Glass Card with 3D Tilt Effect
**Used for**: Interactive cards with mouse-follow tilt

```css
.glass-card-3d {
  background: rgba(25, 25, 35, 0.65);
  backdrop-filter: blur(12px) saturate(120%);
  -webkit-backdrop-filter: blur(12px) saturate(120%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 18px;
  box-shadow:
    0 8px 30px rgba(0, 0, 0, 0.3),
    inset 0 0 0 1px rgba(255, 255, 255, 0.05),
    0 0 40px rgba(255, 255, 255, 0.1);
  transition: transform 0.35s ease-out, box-shadow 0.35s ease-out;
  transform-style: preserve-3d;
}

/* 3D Tilt Hover - Uses CSS custom properties set by JS */
.glass-card-3d:hover {
  transform: rotateX(var(--rotateX, 0deg)) rotateY(var(--rotateY, 0deg)) scale3d(1.03, 1.03, 1.03);
  z-index: 5;
}
```

### Modal Glass Effect
**Used for**: Modals, overlays, popup containers

```css
.modal-glass {
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.5);

  /* Hide scrollbar */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.modal-glass::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}
```

### Subtle Glass Background
**Used for**: Nested elements, subtle overlays

```css
.glass-subtle {
  background: rgba(30, 30, 45, 0.55);
  backdrop-filter: blur(8px) saturate(110%);
  -webkit-backdrop-filter: blur(8px) saturate(110%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}
```

---

## Animations & Transitions

### Floating Animation (Gentle Up-Down)
**Used for**: Images, icons, decorative elements

```css
@keyframes simple-float {
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-7px);
  }
  100% {
    transform: translateY(0px);
  }
}

/* Apply to element */
.floating-element {
  animation: simple-float 3.5s ease-in-out infinite;
}
```

### Bobbing Float with Flip
**Used for**: Character images, special decorative elements

```css
@keyframes bobbing-float {
  0% {
    transform: scaleX(-1) translateY(0px) perspective(800px);
  }
  50% {
    transform: scaleX(-1) translateY(-8px) perspective(800px);
  }
  100% {
    transform: scaleX(-1) translateY(0px) perspective(800px);
  }
}

.bobbing-element {
  animation: bobbing-float 3.5s ease-in-out infinite;
}
```

### Scroll Animations (Infinite Marquee)
**Used for**: Testimonial sliders, infinite scrolling content

```css
/* Right to Left scroll */
@keyframes scroll-right-to-left {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-150%);
  }
}

/* Left to Right scroll */
@keyframes scroll-left-to-right {
  0% {
    transform: translateX(-150%);
  }
  100% {
    transform: translateX(0);
  }
}

/* Apply to scrolling row */
.scroll-row-rtl {
  animation: scroll-right-to-left 50s linear infinite;
}

.scroll-row-ltr {
  animation: scroll-left-to-right 50s linear infinite;
}

/* Pause on hover */
.scroll-row:hover {
  animation-play-state: paused;
}
```

### Shimmer/Shine Effect
**Used for**: Card hovers, interactive elements

```css
.shimmer-card {
  position: relative;
  overflow: hidden;
}

.shimmer-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.15),
    transparent
  );
  transition: left 0.6s ease;
  z-index: 1;
}

.shimmer-card:hover::before {
  left: 100%;
}
```

### Standard Hover Transitions

```css
/* Section/Card hover */
.hover-lift {
  transition: transform 0.4s ease, box-shadow 0.4s ease;
}
.hover-lift:hover {
  transform: translateY(-6px);
}

/* Button hover */
.hover-button {
  transition: background 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
}

/* Quick hover */
.hover-quick {
  transition: all 0.3s ease;
}

/* Smooth hover */
.hover-smooth {
  transition: all 0.35s ease-out;
}

/* Bouncy hover */
.hover-bouncy {
  transition: all 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
```

### Accordion Transition
**Used for**: FAQ accordions, expandable content

```css
.accordion-icon {
  transition: transform 0.3s ease;
}

.accordion-item.active .accordion-icon {
  transform: rotate(45deg);
}

.accordion-content {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.4s ease-out;
}

.accordion-item.active .accordion-content {
  max-height: 1000px; /* Large enough for content */
}
```

---

## Spacing & Layout

### CSS Variables
```css
:root {
  --section-padding-vertical: clamp(40px, 8vh, 80px);
  --section-padding-horizontal: clamp(20px, 5vw, 50px);
  --card-border-radius: 18px;
  --container-max-width: 1400px;
}
```

### Body Padding
```css
body {
  padding-top: clamp(2.5rem, 5vw, 3.5rem);
  padding-left: clamp(12rem, 5vw, 3.5rem);
  padding-right: clamp(12rem, 5vw, 3.5rem);
  padding-bottom: 0;
}

/* Tablet: max-width 1080px */
@media (max-width: 1080px) {
  body {
    padding-left: clamp(6rem, 5vw, 6.5rem);
    padding-right: clamp(6rem, 5vw, 6.5rem);
  }
}

/* Mobile: max-width 768px */
@media (max-width: 768px) {
  body {
    padding-left: clamp(1rem, 5vw, 6.5rem);
    padding-right: clamp(1rem, 5vw, 6.5rem);
  }
}
```

### Section Spacing
```css
.page-section {
  padding-bottom: var(--section-padding-vertical);
  padding-left: 0;
  padding-right: 0;
  max-width: 1400px;
  margin: 40px auto;
}

/* Mobile: max-width 768px */
@media (max-width: 768px) {
  .page-section {
    margin: 25px auto;
  }
}
```

### Container
```css
.container {
  width: 100%;
  max-width: 90%;
  padding-left: var(--section-padding-horizontal);
  padding-right: var(--section-padding-horizontal);
  margin-left: auto;
  margin-right: auto;
  position: relative;
  z-index: 1;
}
```

### Common Margins
```css
/* Title bottom margin */
h1, h2, .section-title, .room-title {
  margin-bottom: 1.5rem;
}

/* Paragraph bottom margin */
p, .intro-text {
  margin-bottom: 1.5rem;
}

/* List item spacing */
li {
  padding: 5px 0 5px 25px;
}
```

---

## Button Styles

### Primary Button
**Used for**: Main CTAs, activation buttons

```css
.btn-primary {
  display: inline-block;
  padding: 12px 25px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #FFFFFF;
  font-family: "Uniform Extra Condensed", sans-serif;
  text-transform: uppercase;
  border-radius: 50px;
  text-align: center;
  text-decoration: none;
  transition: background 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
  cursor: pointer;
}

.btn-primary:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.2);
}
```

### Large CTA Button
**Used for**: Hero CTAs, important actions

```css
.btn-cta-large {
  font-size: 1.5rem;
  height: 55px;
  line-height: 1;
  padding: 0 24px;
  width: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.4);
  color: #FFFFFF;
  font-family: "Uniform Extra Condensed", sans-serif;
  text-transform: uppercase;
  border-radius: 50px;
  text-decoration: none;
  transition: background 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
}

.btn-cta-large:hover {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.6);
  box-shadow: 0 0 25px rgba(255, 255, 255, 0.2);
}

/* Mobile responsive */
@media (max-width: 768px) {
  .btn-cta-large {
    width: 100%;
    max-width: 520px;
    font-size: 1.05rem;
    height: 50px;
  }
}
```

### Continue/Navigation Button
**Used for**: Tour navigation, next/previous actions

```css
.btn-continue {
  padding: 15px 40px;
  background: rgba(255, 255, 255, 0.15);
  font-size: 1.1rem;
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 50px;
  color: #FFFFFF;
  font-family: "Uniform Extra Condensed", sans-serif;
  text-transform: uppercase;
  text-decoration: none;
  transition: background 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease, transform 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.btn-continue:hover {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.6);
  box-shadow: 0 0 25px rgba(255, 255, 255, 0.3);
  transform: translateY(-3px);
}

/* Arrow animation */
.btn-continue .arrow {
  display: inline-block;
  transition: transform 0.3s ease;
}

.btn-continue:hover .arrow {
  transform: translateX(5px);
}
```

### Back/Return Button
**Used for**: Navigation back, return to previous page

```css
.btn-back {
  position: fixed;
  top: 25px;
  left: 25px;
  display: flex;
  align-items: center;
  padding: 10px 18px;
  background-color: rgba(25, 25, 35, 0.8);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 25px;
  color: #FFFFFF;
  font-family: "Cartograph Mono", monospace;
  text-decoration: none;
  font-size: 0.9rem;
  z-index: 1000;
  transition: all 0.3s ease;
}

.btn-back svg {
  width: 20px;
  height: 20px;
  margin-right: 10px;
  stroke: #FFFFFF;
}

.btn-back:hover {
  background-color: rgba(25, 25, 35, 1);
  color: #FFFFFF;
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.2);
}
```

---

## Card Components

### Offering Card (Package Card)
**Used for**: Product packages, pricing cards, service offerings

```css
.offering-card {
  background: rgba(25, 25, 35, 0.65);
  backdrop-filter: blur(12px) saturate(120%);
  -webkit-backdrop-filter: blur(12px) saturate(120%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 18px;
  display: flex;
  flex-direction: row;
  align-items: stretch;
  box-shadow:
    0 8px 30px rgba(0, 0, 0, 0.3),
    inset 0 0 0 1px rgba(255, 255, 255, 0.05),
    0 0 40px rgba(255, 255, 255, 0.1);
  transition: transform 0.35s ease-out, box-shadow 0.35s ease-out;
  overflow: hidden;
  width: 100%;
  margin-bottom: 30px;
}

.offering-card:hover {
  transform: rotateX(var(--rotateX, 0deg)) rotateY(var(--rotateY, 0deg)) scale3d(1.03, 1.03, 1.03);
  z-index: 5;
}

/* Image wrapper - 65% width */
.offering-image-wrapper {
  flex: 0 0 65%;
  position: relative;
  background-color: rgba(0, 0, 0, 0.2);
}

.offering-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* Text content - 35% width */
.offering-text-content {
  flex: 1 1 35%;
  padding: 25px;
  display: flex;
  flex-direction: column;
  text-align: left;
}

.offering-title {
  font-size: 1.8rem;
  font-family: "Uniform Extra Condensed", sans-serif;
  margin-bottom: 0.5rem;
}

.offering-price {
  font-size: 2rem;
  font-family: "Uniform Extra Condensed", sans-serif;
  margin-bottom: 1rem;
}

.offering-description {
  font-size: 0.95rem;
  font-family: "Cartograph Mono", monospace;
  margin-bottom: 1.5rem;
  flex-grow: 1;
}

.offering-features {
  list-style: none;
  padding: 0;
  margin-bottom: 1.5rem;
}

.offering-features li {
  position: relative;
  padding: 5px 0 5px 25px;
  font-size: 0.9rem;
  font-family: "Cartograph Mono", monospace;
}

.offering-features li::before {
  content: '✧';
  position: absolute;
  left: 0;
  color: #FFFFFF;
  font-size: 1.2em;
}

/* Mobile: stack vertically */
@media (max-width: 992px) {
  .offering-card {
    flex-direction: column;
  }

  .offering-image-wrapper {
    width: 100%;
    flex: none;
  }

  .offering-text-content {
    width: 100%;
    text-align: center;
  }
}
```

### Process Step Card
**Used for**: Step-by-step processes, tutorials, workflows

```css
.process-step {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 30px;
  margin-bottom: 3rem;
  position: relative;
}

.step-main-content {
  flex: 1 1 60%;
  display: flex;
  align-items: flex-start;
  gap: 20px;
}

.step-number {
  font-size: 2.5rem;
  font-family: "Uniform Extra Condensed", sans-serif;
  color: #FFFFFF;
  line-height: 1;
  min-width: 60px;
  text-align: center;
}

.step-content h3 {
  font-size: 1.6rem;
  font-family: "Uniform Extra Condensed", sans-serif;
  margin-bottom: 0.5rem;
  text-align: left;
}

.step-content p {
  font-family: "Cartograph Mono", monospace;
  text-align: left;
  margin-bottom: 0;
}

.step-visual {
  flex: 0 0 280px;
  max-width: 280px;
  height: auto;
  object-fit: contain;
  border-radius: 12px;
  mix-blend-mode: screen;
  animation: simple-float 3.5s ease-in-out infinite;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.step-visual:hover {
  transform: scale(1.03);
}

/* Connector line between steps */
.process-connector {
  position: absolute;
  left: 29px;
  top: 70px;
  bottom: -3rem;
  width: 2px;
  background-color: rgba(255, 255, 255, 0.3);
  opacity: 0.5;
}

/* Hide connector on last step */
.process-step:last-child .process-connector {
  display: none;
}

/* Mobile: stack vertically */
@media (max-width: 768px) {
  .process-step {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .step-main-content {
    flex-direction: column;
    align-items: center;
  }

  .process-connector {
    display: none;
  }
}
```

### Testimonial Card
**Used for**: Reviews, testimonials, user feedback

```css
.testimonial-card {
  background: rgba(25, 25, 35, 0.65);
  backdrop-filter: blur(12px) saturate(120%);
  -webkit-backdrop-filter: blur(12px) saturate(120%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 18px;
  box-shadow:
    0 8px 30px rgba(0, 0, 0, 0.3),
    inset 0 0 0 1px rgba(255, 255, 255, 0.05),
    0 0 20px rgba(255, 255, 255, 0.04);
  transition: transform 0.35s ease-out, box-shadow 0.35s ease-out;
  padding: 25px;
  height: clamp(450px, 25vh, 580px);
  width: auto;
  min-width: 300px;
  max-width: 800px;
  flex-shrink: 0;
  box-sizing: border-box;
  transform-style: preserve-3d;
}

.testimonial-card:hover {
  transform: translateY(-6px) rotateX(var(--rotateX)) rotateY(var(--rotateY));
  box-shadow:
    0 14px 45px rgba(0, 0, 0, 0.4),
    inset 0 0 0 1.5px rgba(255, 255, 255, 0.08),
    0 0 30px rgba(255, 255, 255, 0.15);
}

.testimonial-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.testimonial-text {
  font-family: "Cartograph Mono", monospace;
  font-size: 0.85rem;
  line-height: 1.6;
  color: #FFFFFF;
  margin-bottom: 20px;
  flex-grow: 1;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 8;
  -webkit-box-orient: vertical;
}

.testimonial-author {
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  padding-top: 15px;
  margin-top: auto;
  flex-shrink: 0;
  min-height: 60px;
}

.author-name {
  font-family: "Uniform Extra Condensed", sans-serif;
  font-size: 1.1rem;
  color: #FFFFFF;
  margin-bottom: 5px;
  text-shadow: 0 0 8px rgba(255, 255, 255, 0.2);
}

.author-title {
  font-family: "Cartograph Mono", monospace;
  font-size: 0.85rem;
  color: #FFFFFF;
  opacity: 0.8;
}
```

### FAQ Accordion Item
**Used for**: FAQ sections, collapsible content

```css
.faq-item {
  margin-bottom: 15px;
  background: rgba(25, 25, 35, 0.5);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.faq-question {
  padding: 18px 20px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.faq-question h3 {
  font-family: "Cartograph Mono", monospace;
  font-size: 1.1rem;
  margin: 0;
  text-align: left;
  font-weight: normal;
  color: #FFFFFF;
}

.accordion-icon {
  font-size: 1.5rem;
  color: #FFFFFF;
  transition: transform 0.3s ease;
}

.faq-item.active .accordion-icon {
  transform: rotate(45deg);
}

.faq-answer {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.4s ease-out;
  padding: 0 20px;
}

.faq-item.active .faq-answer {
  max-height: 1000px;
}

.faq-answer p {
  font-family: "Cartograph Mono", monospace;
  padding-bottom: 18px;
  font-size: 0.95rem;
  text-align: left;
  margin: 0;
  color: #FFFFFF;
}
```

---

## Responsive Breakpoints

### Breakpoint Scale
```css
/* Extra Large Desktop */
@media (min-width: 1400px) {
  /* Container max-width: 1400px */
}

/* Large Desktop */
@media (max-width: 1400px) {
  /* Adjust spacing for smaller screens */
}

/* Desktop/Large Tablet */
@media (max-width: 1200px) {
  /* Video heights, reduced padding */
}

/* Desktop */
@media (max-width: 1080px) {
  /* Reduce side padding */
}

/* Tablet/iPad */
@media (max-width: 992px) {
  /* Stack horizontal cards vertically */
  /* Reduce font sizes slightly */
}

/* Mobile/Tablet Portrait */
@media (max-width: 768px) {
  /* Major layout changes */
  /* Stack all flex layouts */
  /* Reduce font sizes significantly */
  /* Increase touch targets */
}

/* Small Mobile */
@media (max-width: 480px) {
  /* Minimal padding */
  /* Smallest font sizes */
  /* Optimize for single column */
}

/* Extra Small Mobile */
@media (max-width: 320px) {
  /* Maximum compression */
}
```

### Key Responsive Changes

#### Typography (768px breakpoint)
```css
@media (max-width: 768px) {
  /* Titles scale down */
  .room-title { font-size: clamp(2rem, 6vw, 2.5rem); }
  .section-title { font-size: clamp(1.8rem, 5vw, 2rem); }

  /* Body text reduces */
  p, .intro-text { font-size: 0.95rem; }
}
```

#### Layout (992px breakpoint)
```css
@media (max-width: 992px) {
  /* Cards stack vertically */
  .offering-card {
    flex-direction: column;
  }

  /* Images take full width */
  .offering-image-wrapper {
    width: 100%;
    flex: none;
  }

  /* Text centers */
  .offering-text-content {
    text-align: center;
  }
}
```

#### Spacing (768px breakpoint)
```css
@media (max-width: 768px) {
  :root {
    --section-padding-vertical: clamp(30px, 6vh, 60px);
    --section-padding-horizontal: clamp(15px, 4vw, 30px);
  }

  .page-section {
    margin: 25px auto;
  }
}
```

---

## Special Effects & Details

### Custom List Bullets
```css
.custom-list {
  list-style: none;
  padding: 0;
}

.custom-list li {
  position: relative;
  padding-left: 25px;
}

.custom-list li::before {
  content: '✧'; /* Star symbol */
  position: absolute;
  left: 0;
  color: #FFFFFF;
  font-size: 1.2em;
}
```

### Text Glow Effect
```css
.text-glow {
  text-shadow: 0 0 12px rgba(255, 255, 255, 0.3);
}

.text-glow-strong {
  text-shadow:
    0 0 15px rgba(255, 255, 255, 0.5),
    0 0 30px rgba(255, 255, 255, 0.3);
}
```

### Backdrop Blur Background
```css
.blur-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: -10;
  background-image: url('path-to-image.webp');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-color: #000000;
}
```

### Background Slideshow
```css
.hero-background-slideshow {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background-color: #000000;
  overflow: hidden;
  z-index: -9;
}

.hero-bg-slide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 0.75s ease-in-out;
}

.hero-bg-slide:first-child {
  opacity: 1;
}

/* JavaScript controls which slide is visible by toggling opacity */
```

### Mix Blend Mode (For Images)
```css
.blend-screen {
  mix-blend-mode: screen;
}

.blend-overlay {
  mix-blend-mode: overlay;
}

.blend-lighten {
  mix-blend-mode: lighten;
}
```

### Gradient Overlays
```css
.gradient-overlay-bottom {
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.8) 0%,
    rgba(0, 0, 0, 0.3) 70%,
    transparent 100%
  );
}

.gradient-fade-sides {
  background: linear-gradient(
    to right,
    rgba(0, 0, 0, 0.85),
    transparent 10%,
    transparent 90%,
    rgba(0, 0, 0, 0.85)
  );
}
```

### Modal Backdrop Blur
```css
.modal-backdrop {
  position: fixed;
  z-index: 1000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
}
```

### Image Clipping
```css
.clip-bottom {
  clip-path: inset(0px 0px 50px 0px);
}
```

### Perspective 3D Effect
```css
.perspective-container {
  perspective: 1000px;
}

.perspective-element {
  transform: perspective(800px) rotateY(-8deg);
  transform-style: preserve-3d;
}
```

---

## Implementation Checklist

When implementing this design system in your app, ensure:

- [ ] **Fonts loaded**: Uniform Extra Condensed & Cartograph Mono
- [ ] **CSS Variables defined**: All `--ai-*` variables set
- [ ] **Backdrop filter support**: Include `-webkit-backdrop-filter` for Safari
- [ ] **Dark background**: Body background set to `#000000`
- [ ] **White text**: All text set to `#FFFFFF`
- [ ] **Glass panels**: Minimum blur of 8px, maximum 20px
- [ ] **Border radius**: Consistent 18px on cards
- [ ] **Box shadows**: Multi-layer shadows with inset highlights
- [ ] **Hover effects**: Smooth transitions (0.3s - 0.4s)
- [ ] **Responsive breakpoints**: Test at 1400px, 992px, 768px, 480px
- [ ] **Mobile optimizations**: Stack cards, reduce font sizes, increase touch targets
- [ ] **Animations**: Apply floating animations to decorative elements
- [ ] **Accessibility**: Ensure sufficient contrast (already achieved with white on dark)

---

## Quick Copy-Paste Snippets

### Complete Glass Card
```css
.glass-card {
  background: rgba(25, 25, 35, 0.65);
  backdrop-filter: blur(12px) saturate(120%);
  -webkit-backdrop-filter: blur(12px) saturate(120%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 18px;
  padding: 25px;
  box-shadow:
    0 8px 30px rgba(0, 0, 0, 0.3),
    inset 0 0 0 1px rgba(255, 255, 255, 0.05),
    0 0 40px rgba(255, 255, 255, 0.1);
  transition: transform 0.35s ease-out, box-shadow 0.35s ease-out;
}

.glass-card:hover {
  transform: translateY(-6px);
  box-shadow:
    0 14px 45px rgba(0, 0, 0, 0.4),
    inset 0 0 0 1.5px rgba(255, 255, 255, 0.08),
    0 0 60px rgba(255, 255, 255, 0.3);
}
```

### Complete Button
```css
.btn {
  display: inline-block;
  padding: 12px 25px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #FFFFFF;
  font-family: "Uniform Extra Condensed", sans-serif;
  text-transform: uppercase;
  border-radius: 50px;
  text-decoration: none;
  transition: all 0.3s ease;
}

.btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.2);
}
```

### Complete Floating Animation
```css
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-7px); }
}

.floating {
  animation: float 3.5s ease-in-out infinite;
}
```

---

## Additional Notes

### Browser Compatibility
- **Backdrop filter**: Requires `-webkit-` prefix for Safari
- **CSS Grid**: Fully supported in all modern browsers
- **CSS Variables**: Fully supported in all modern browsers
- **Flexbox**: Fully supported in all modern browsers

### Performance Optimization
- Use `will-change: transform` on animated elements
- Limit backdrop-filter usage (expensive on performance)
- Use `transform` for animations instead of position properties
- Implement lazy loading for images
- Use `font-display: swap` for custom fonts

### Accessibility
- Ensure sufficient color contrast (white on dark achieves this)
- Add ARIA labels to interactive elements
- Ensure focus states are visible
- Test with keyboard navigation
- Add alt text to all images

---

**End of Styling Reference**

This document captures the complete visual design system of the Artificial Ingenious page. Apply these styles consistently for a cohesive, futuristic aesthetic across your application.
