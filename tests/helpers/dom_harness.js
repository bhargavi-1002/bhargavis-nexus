const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const PROJECT_ROOT = path.resolve(__dirname, '../../');

function createMockAudioContext() {
    let state = 'suspended';
    return function MockAudioContext() {
        this.state = state;
        this.currentTime = 0;
        this.destination = {};
        this.resume = async function() {
            state = 'running';
            this.state = 'running';
            return Promise.resolve();
        };
        this.createOscillator = function() {
            return {
                type: 'sine',
                frequency: {
                    setValueAtTime: () => {},
                    exponentialRampToValueAtTime: () => {}
                },
                connect: () => {},
                start: () => {},
                stop: () => {}
            };
        };
        this.createGain = function() {
            return {
                gain: {
                    setValueAtTime: () => {},
                    exponentialRampToValueAtTime: () => {}
                },
                connect: () => {}
            };
        };
    };
}

function createMockCanvasContext() {
    const operations = [];
    return {
        operations,
        fillStyle: '#000000',
        strokeStyle: '#000000',
        lineWidth: 1,
        shadowBlur: 0,
        shadowColor: 'transparent',
        globalAlpha: 1,
        fillRect: function(x, y, w, h) { operations.push({ op: 'fillRect', x, y, w, h }); },
        clearRect: function(x, y, w, h) { operations.push({ op: 'clearRect', x, y, w, h }); },
        strokeRect: function(x, y, w, h) { operations.push({ op: 'strokeRect', x, y, w, h }); },
        beginPath: function() { operations.push({ op: 'beginPath' }); },
        moveTo: function(x, y) { operations.push({ op: 'moveTo', x, y }); },
        lineTo: function(x, y) { operations.push({ op: 'lineTo', x, y }); },
        arc: function(x, y, r, sa, ea) { operations.push({ op: 'arc', x, y, r, sa, ea }); },
        fill: function() { operations.push({ op: 'fill' }); },
        stroke: function() { operations.push({ op: 'stroke' }); },
        createLinearGradient: function(x0, y0, x1, y1) {
            return {
                addColorStop: function(offset, color) {}
            };
        },
        drawImage: function() { operations.push({ op: 'drawImage' }); },
        save: function() { operations.push({ op: 'save' }); },
        restore: function() { operations.push({ op: 'restore' }); }
    };
}

function loadPage(relativePath, executeScripts = false) {
    let fullPath = path.resolve(PROJECT_ROOT, relativePath);
    
    // Fallback for snake-game/index.html vs snake_pro.html pre-refactor state
    if (!fs.existsSync(fullPath) && relativePath === 'snake-game/index.html') {
        const altPath = path.resolve(PROJECT_ROOT, 'snake-game/snake_pro.html');
        if (fs.existsSync(altPath)) {
            fullPath = altPath;
        }
    }

    if (!fs.existsSync(fullPath)) {
        throw new Error(`File not found: ${fullPath}`);
    }

    const htmlContent = fs.readFileSync(fullPath, 'utf8');
    
    const virtualConsole = new (require('jsdom')).VirtualConsole();
    const errors = [];
    virtualConsole.on("jsdomError", (error) => {
        errors.push(error);
    });

    const dom = new JSDOM(htmlContent, {
        url: `http://localhost/${relativePath}`,
        runScripts: executeScripts ? "dangerously" : undefined,
        virtualConsole
    });

    const window = dom.window;

    // Inject browser mocks
    const mockAudioCtx = createMockAudioContext();
    window.AudioContext = mockAudioCtx;
    window.webkitAudioContext = mockAudioCtx;

    const localStoreData = {};
    window.localStorage = {
        getItem: (key) => localStoreData[key] || null,
        setItem: (key, val) => { localStoreData[key] = String(val); },
        removeItem: (key) => { delete store[key]; },
        clear: () => {
            Object.keys(localStoreData).forEach(k => delete localStoreData[k]);
        }
    };

    window.requestAnimationFrame = function(cb) {
        return 1;
    };
    window.cancelAnimationFrame = function(id) {};

    window.setInterval = function(fn, ms) {
        return 1;
    };
    window.clearInterval = function(id) {};

    if (window.HTMLCanvasElement) {
        const mockCtx = createMockCanvasContext();
        window.HTMLCanvasElement.prototype.getContext = function(type) {
            if (type === '2d') return mockCtx;
            return null;
        };
    }

    return {
        dom,
        window,
        document: window.document,
        htmlContent,
        errors,
        fullPath,
        dirPath: path.dirname(fullPath),
        close: () => {
            try { window.close(); } catch(e) {}
        }
    };
}

function readCssFile(relativePath) {
    const fullPath = path.resolve(PROJECT_ROOT, relativePath);
    if (!fs.existsSync(fullPath)) return null;
    let css = fs.readFileSync(fullPath, 'utf8');

    // Recursively append imported CSS files
    const importRegex = /@import\s+url\(['"]?([^'"]+)['"]?\);/g;
    let match;
    const baseDir = path.dirname(fullPath);

    while ((match = importRegex.exec(css)) !== null) {
        const importedRelPath = match[1];
        if (importedRelPath) {
            const importedFullPath = path.resolve(baseDir, importedRelPath);
            if (fs.existsSync(importedFullPath)) {
                css += '\n' + fs.readFileSync(importedFullPath, 'utf8');
            }
        }
    }

    return css;
}

module.exports = {
    PROJECT_ROOT,
    loadPage,
    readCssFile,
    createMockAudioContext,
    createMockCanvasContext
};
