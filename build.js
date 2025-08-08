// build.js - Asset versioning for your existing structure (ES Module)
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class AssetVersioner {
    constructor() {
        this.rootDir = './';
        this.distDir = './dist';
        this.assetMap = new Map();
    }

    // Generate hash for file content
    generateHash(content) {
        return crypto.createHash('md5').update(content).digest('hex').substring(0, 8);
    }

    // Main build function
    build() {
        console.log('🚀 Starting build...');
        
        // Clean dist directory
        if (fs.existsSync(this.distDir)) {
            fs.rmSync(this.distDir, { recursive: true });
        }
        fs.mkdirSync(this.distDir, { recursive: true });

        // Version CSS and JS files from assets folder
        this.versionAssets();
        
        // Copy and update HTML files
        this.copyHtmlFiles();
        
        // Copy other assets (images, fonts, audio)
        this.copyStaticAssets();

        console.log('\n✅ Build complete! Asset versions:');
        console.table(Object.fromEntries(this.assetMap));
        console.log(`📦 Output: ${this.distDir}/`);
    }

    versionAssets() {
        // Version CSS files
        this.versionFilesInDir('./assets/css', 'assets/css');
        
        // Version JS files
        this.versionFilesInDir('./assets/js', 'assets/js');
    }

    versionFilesInDir(srcPath, outputPath) {
        if (!fs.existsSync(srcPath)) {
            console.log(`⚠️  ${srcPath} not found, skipping...`);
            return;
        }

        const distPath = path.join(this.distDir, outputPath);
        fs.mkdirSync(distPath, { recursive: true });

        const files = fs.readdirSync(srcPath);
        
        files.forEach(file => {
            const ext = path.extname(file).slice(1);
            if (ext === 'css' || ext === 'js') {
                const filePath = path.join(srcPath, file);
                const content = fs.readFileSync(filePath, 'utf8');
                const hash = this.generateHash(content);
                const name = path.parse(file).name;
                const newFileName = `${name}.${hash}.${ext}`;
                
                // Save versioned file
                fs.writeFileSync(path.join(distPath, newFileName), content);
                // Also write an unversioned copy so any runtime-injected URLs still resolve (e.g., JS-injected CSS links)
                fs.writeFileSync(path.join(distPath, file), content);
                
                // Store mapping for HTML replacement
                const originalPath = `${outputPath}/${file}`;
                const newPath = `${outputPath}/${newFileName}`;
                this.assetMap.set(originalPath, newPath);
                
                console.log(`📦 ${originalPath} → ${newPath}`);
            }
        });
    }

    copyHtmlFiles() {
        // Copy root HTML files
        const rootHtmlFiles = fs.readdirSync('./')
            .filter(file => file.endsWith('.html'));
        
        rootHtmlFiles.forEach(file => {
            this.copyAndUpdateHtml('./', file, '');
        });

        // Copy pages/ HTML files
        if (fs.existsSync('./pages')) {
            fs.mkdirSync(path.join(this.distDir, 'pages'), { recursive: true });
            
            const pageFiles = fs.readdirSync('./pages')
                .filter(file => file.endsWith('.html'));
            
            pageFiles.forEach(file => {
                this.copyAndUpdateHtml('./pages', file, 'pages');
            });
        }
    }

    copyAndUpdateHtml(srcDir, fileName, distSubDir) {
        const srcPath = path.join(srcDir, fileName);
        const distPath = distSubDir 
            ? path.join(this.distDir, distSubDir, fileName)
            : path.join(this.distDir, fileName);
        
        let content = fs.readFileSync(srcPath, 'utf8');
        
        // Update asset references in HTML
        for (const [oldPath, newPath] of this.assetMap) {
            // Handle different path variations
            const patterns = [
                // Exact match: "assets/css/fonts.css"
                new RegExp(`"${this.escapeRegex(oldPath)}"`, 'g'),
                new RegExp(`'${this.escapeRegex(oldPath)}'`, 'g'),
                // Absolute: "/assets/css/fonts.css"
                new RegExp(`"/${this.escapeRegex(oldPath)}"`, 'g'),
                new RegExp(`'/${this.escapeRegex(oldPath)}'`, 'g'),
                // Relative from subdir: "../assets/css/fonts.css"
                new RegExp(`"\\.\\./${this.escapeRegex(oldPath)}"`, 'g'),
                new RegExp(`'\\.\\./${this.escapeRegex(oldPath)}'`, 'g'),
                // Current dir: "./assets/css/fonts.css"
                new RegExp(`"\\.\/${this.escapeRegex(oldPath)}"`, 'g'),
                new RegExp(`'\\.\/${this.escapeRegex(oldPath)}'`, 'g')
            ];
            
            patterns.forEach((pattern, index) => {
                const quote = index % 2 === 0 ? '"' : "'";
                let replacement;
                
                if (index < 2) {
                    // Exact match
                    replacement = `${quote}${newPath}${quote}`;
                } else if (index < 4) {
                    // Absolute path
                    replacement = `${quote}/${newPath}${quote}`;
                } else if (index < 6) {
                    // Relative from subdir
                    replacement = `${quote}../${newPath}${quote}`;
                } else {
                    // Current dir relative
                    replacement = `${quote}./${newPath}${quote}`;
                }
                
                content = content.replace(pattern, replacement);
            });
        }
        
        fs.writeFileSync(distPath, content);
        console.log(`📄 Updated ${fileName}`);
    }

    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    copyStaticAssets() {
        // Copy non-CSS/JS assets
        const assetDirs = ['images', 'fonts', 'audio', 'data'];
        
        assetDirs.forEach(dir => {
            const srcPath = path.join('./assets', dir);
            if (fs.existsSync(srcPath)) {
                const distPath = path.join(this.distDir, 'assets', dir);
                fs.mkdirSync(distPath, { recursive: true });
                this.copyRecursive(srcPath, distPath);
                console.log(`📁 Copied assets/${dir}/`);
            }
        });

        // Copy public folder if it exists
        if (fs.existsSync('./public')) {
            const distPath = path.join(this.distDir, 'public');
            this.copyRecursive('./public', distPath);
            console.log(`📁 Copied public/`);
        }

        // Copy any other important files
        const filesToCopy = ['robots.txt', 'sitemap.xml', '.env'];
        filesToCopy.forEach(file => {
            if (fs.existsSync(file)) {
                fs.copyFileSync(file, path.join(this.distDir, file));
                console.log(`📄 Copied ${file}`);
            }
        });
    }

    copyRecursive(src, dest) {
        const stat = fs.statSync(src);
        if (stat.isDirectory()) {
            if (!fs.existsSync(dest)) {
                fs.mkdirSync(dest, { recursive: true });
            }
            fs.readdirSync(src).forEach(file => {
                this.copyRecursive(path.join(src, file), path.join(dest, file));
            });
        } else {
            fs.copyFileSync(src, dest);
        }
    }
}

// Debug: Always run when this file is executed
console.log('🔧 Build script loaded...');
console.log('📍 Current directory:', process.cwd());
console.log('📁 Files in current directory:', fs.readdirSync('./').filter(f => f.endsWith('.html')));

// Run the build
const versioner = new AssetVersioner();
versioner.build();

export default AssetVersioner;