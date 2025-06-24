# MxM Website - Machine Maison

A modern AI agency website with clean URLs, persistent music player, and optimized for Vercel deployment.

## 🚀 Features

- **Clean URLs**: No .html extensions (e.g., `/contact` instead of `/contact.html`)
- **Persistent Music Player**: Continuous background music across pages
- **Responsive Design**: Mobile-first approach with modern CSS
- **Video Integration**: Smart volume ducking for embedded videos
- **Fast Loading**: Optimized assets and efficient routing

## 📁 Project Structure

```
mxm-website/
├── index.html                 # Homepage
├── vercel.json               # Vercel deployment configuration
├── assets/                   # Static assets
│   ├── css/                 # Stylesheets
│   ├── js/                  # JavaScript files
│   ├── images/              # Images and graphics
│   ├── audio/               # Background music files
│   └── fonts/               # Custom fonts
└── pages/                   # Individual pages
    ├── artificial-ingenious.html
    ├── machine-megamind.html
    ├── consults-coded.html
    ├── future-observatory.html
    ├── blonde-bot-lair.html
    ├── contact.html
    └── ...
```

## 🌐 Clean URLs

The website uses clean URLs without .html extensions:

| Page | Clean URL | File Location |
|------|-----------|---------------|
| Home | `/` | `index.html` |
| Artificial Ingenious | `/artificial-ingenious` | `pages/artificial-ingenious.html` |
| Machine Megamind | `/machine-megamind` | `pages/machine-megamind.html` |
| Consults Coded | `/consults-coded` | `pages/consults-coded.html` |
| Future Observatory | `/future-observatory` | `pages/future-observatory.html` |
| About (Blonde Bot Lair) | `/about` | `pages/blonde-bot-lair.html` |
| Contact | `/contact` | `pages/contact.html` |

## 🔧 Vercel Configuration

The `vercel.json` file handles:

1. **URL Rewrites**: Maps clean URLs to actual HTML files
2. **Asset Optimization**: Proper caching headers for static assets
3. **Redirects**: 301 redirects from .html URLs to clean URLs
4. **Security Headers**: Basic security headers for all pages

### Key Configuration Features:

- **Clean URLs**: `"cleanUrls": true`
- **No Trailing Slashes**: `"trailingSlash": false`
- **Asset Caching**: 1-year cache for static assets
- **Fallback Routing**: Handles 404s gracefully

## 🚀 Deployment

### Deploy to Vercel

1. **Connect Repository**:
   ```bash
   # If using Vercel CLI
   vercel --prod
   
   # Or connect via Vercel dashboard
   # Import project from GitHub/GitLab
   ```

2. **Automatic Deployment**:
   - Push to main branch triggers automatic deployment
   - Preview deployments for pull requests
   - Environment variables can be set in Vercel dashboard

3. **Custom Domain** (Optional):
   ```bash
   vercel domains add yourdomain.com
   ```

### Manual Deployment

1. **Build** (if needed):
   ```bash
   # No build step required - static site
   ```

2. **Deploy**:
   ```bash
   vercel --prod
   ```

## 🎵 Music Player

The persistent music player:
- Continues playing across page navigation
- Smart volume ducking when videos play
- Saves user preferences in session storage
- Clean, minimal interface

### Volume Ducking

Automatically reduces music volume when:
- YouTube videos start playing
- Vimeo videos start playing
- HTML5 videos start playing

## 🔗 Internal Linking

When adding new pages or links, use clean URLs:

```html
<!-- ✅ Correct -->
<a href="/contact">Contact Us</a>
<a href="/artificial-ingenious">AI Coaching</a>

<!-- ❌ Incorrect -->
<a href="pages/contact.html">Contact Us</a>
<a href="artificial-ingenious.html">AI Coaching</a>
```

## 📱 Asset Paths

All asset paths use relative references from the root:

```html
<!-- CSS -->
<link rel="stylesheet" href="assets/css/main.css">

<!-- JavaScript -->
<script src="assets/js/script.js"></script>

<!-- Images -->
<img src="assets/images/logo.png" alt="Logo">
```

## 🐛 Troubleshooting

### Common Issues:

1. **404 Errors on Deployment**:
   - Check `vercel.json` routing configuration
   - Ensure file paths are correct

2. **Assets Not Loading**:
   - Verify asset paths start with `assets/`
   - Check file names for typos

3. **Music Player Not Working**:
   - Check audio file paths in `persistent-music-player.js`
   - Verify browser autoplay permissions

4. **Clean URLs Not Working**:
   - Ensure `vercel.json` is in project root
   - Check Vercel deployment logs

## 📝 Adding New Pages

1. **Create HTML file** in `pages/` directory
2. **Update `vercel.json`** with new route:
   ```json
   {
     "src": "^/new-page/?$",
     "dest": "/pages/new-page.html"
   }
   ```
3. **Update navigation** in relevant pages using clean URL:
   ```html
   <a href="/new-page">New Page</a>
   ```

## 🔒 Security

The site includes basic security headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`

## 📊 Performance

- **Static Assets**: Cached for 1 year
- **HTML Pages**: Dynamic caching via Vercel
- **Images**: Optimized for web
- **CSS/JS**: Minified and compressed

## 🆘 Support

For deployment issues or questions:
1. Check Vercel documentation
2. Review deployment logs in Vercel dashboard
3. Test locally with `vercel dev`

---

**Built with ❤️ for Machine Maison**