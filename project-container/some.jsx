import React, { useState, useEffect, useRef } from 'react';
import { 
    Book, Flame, Shield, Zap, Skull, Ghost, Sparkles, Droplet, 
    Snowflake, Moon, Sun, Link, RefreshCw, Eye, Target, 
    Network, Lock, Unlock, ChevronDown, Map as MapIcon, Tent, 
    Swords, ShieldAlert, Heart, Plus, BookOpen, AlertTriangle, 
    Crosshair, Clock, RotateCcw
} from 'lucide-react';

// --- SOUND ENGINE (Web Audio API) ---
const SoundEngine = {
    ctx: null,
    init: function() {
        if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        if (this.ctx.state === 'suspended') this.ctx.resume();
    },
    playTone: function(freq, type, duration, vol, sweepFreq, sweepTime) {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator(); const gain = this.ctx.createGain();
        osc.type = type; osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        if (sweepFreq) osc.frequency.exponentialRampToValueAtTime(sweepFreq, this.ctx.currentTime + (sweepTime || duration));
        gain.gain.setValueAtTime(vol, this.ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.start(); osc.stop(this.ctx.currentTime + duration);
    },
    playNoise: function(duration, vol) {
        if (!this.ctx) return;
        const bufferSize = this.ctx.sampleRate * duration; const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0); for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const noise = this.ctx.createBufferSource(); noise.buffer = buffer;
        const filter = this.ctx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.setValueAtTime(1000, this.ctx.currentTime); filter.frequency.linearRampToValueAtTime(100, this.ctx.currentTime + duration);
        const gain = this.ctx.createGain(); gain.gain.setValueAtTime(vol, this.ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
        noise.connect(filter); filter.connect(gain); gain.connect(this.ctx.destination);
        noise.start();
    },
    sfx: {
        fire: () => { SoundEngine.playNoise(0.6, 0.8); SoundEngine.playTone(150, 'square', 0.4, 0.3, 50); },
        ice: () => { SoundEngine.playTone(800, 'triangle', 0.3, 0.5, 1200); SoundEngine.playTone(1200, 'sine', 0.1, 0.3); },
        void: () => { SoundEngine.playTone(100, 'sawtooth', 0.8, 0.7, 20); SoundEngine.playTone(50, 'square', 0.8, 0.5, 10); },
        blood: () => SoundEngine.playTone(300, 'sine', 0.4, 0.6, 100),
        zap: () => SoundEngine.playTone(600, 'sawtooth', 0.15, 0.4, 150),
        shield: () => { SoundEngine.playTone(400, 'sine', 0.6, 0.5, 600); SoundEngine.playTone(200, 'triangle', 0.6, 0.4); },
        heal: () => { SoundEngine.playTone(500, 'sine', 0.4, 0.3, 800); setTimeout(() => SoundEngine.playTone(800, 'sine', 0.5, 0.3, 1200), 150); },
        hitLight: () => SoundEngine.playTone(200, 'square', 0.1, 0.3, 100),
        hitHeavy: () => { SoundEngine.playNoise(0.3, 1.0); SoundEngine.playTone(80, 'sawtooth', 0.3, 0.8, 30); },
        enemyAttack: () => SoundEngine.playTone(200, 'sawtooth', 0.3, 0.5, 50),
        status: () => SoundEngine.playTone(1000, 'sine', 0.2, 0.2, 500),
        relic: () => { SoundEngine.playTone(800, 'sine', 0.3, 0.4, 1200); SoundEngine.playTone(1600, 'triangle', 0.5, 0.2, 800); },
        error: () => { SoundEngine.playTone(150, 'sawtooth', 0.4, 0.6, 100); SoundEngine.playNoise(0.4, 0.5); },
        unlock: () => { SoundEngine.playTone(400, 'sine', 0.2, 0.5, 600); setTimeout(() => SoundEngine.playTone(600, 'triangle', 0.4, 0.5, 1200), 100); },
        cinematicThud: () => { SoundEngine.playNoise(0.8, 0.5); SoundEngine.playTone(40, 'sine', 1.5, 1.0, 10); }
    }
};

// --- SCRIPTABLE OBJECT DATA LAYER (Simulated) ---
const TAILWIND_TO_HEX = {
    'text-orange-500': '#f97316', 'text-blue-300': '#93c5fd', 'text-purple-500': '#a855f7', 
    'text-red-600': '#dc2626', 'text-yellow-400': '#facc15', 'text-slate-400': '#94a3b8', 
    'text-amber-300': '#fcd34d', 'text-cyan-300': '#67e8f9', 'text-slate-300': '#cbd5e1',
    'text-fuchsia-300': '#f0abfc', 'text-green-500': '#22c55e', 'text-yellow-500': '#eab308'
};

const RUNE_TYPES = { ELEMENT: 'Noun', FORM: 'Verb', MODIFIER: 'Adverb', CONJUNCTION: 'Conj' };

const RUNES_DB = {
    IGNIS: { id: 'IGNIS', name: 'IGNIS', type: RUNE_TYPES.ELEMENT, baseDmg: 3, baseDef: 0, icon: Flame, color: 'text-orange-500', vfx: 'fire' },
    GLACIES: { id: 'GLACIES', name: 'GLACIES', type: RUNE_TYPES.ELEMENT, baseDmg: 2, baseDef: 2, icon: Snowflake, color: 'text-blue-300', vfx: 'ice' },
    UMBRA: { id: 'UMBRA', name: 'UMBRA', type: RUNE_TYPES.ELEMENT, baseDmg: 5, baseDef: 0, icon: Moon, color: 'text-purple-500', vfx: 'void' },
    SANGUIS: { id: 'SANGUIS', name: 'SANGUIS', type: RUNE_TYPES.ELEMENT, baseDmg: 2, baseDef: 0, icon: Droplet, color: 'text-red-600', vfx: 'blood' },
    TELUM: { id: 'TELUM', name: 'TELUM', type: RUNE_TYPES.FORM, baseDmg: 2, baseDef: 0, icon: Zap, color: 'text-yellow-400', vfx: 'zap' },
    SCUTUM: { id: 'SCUTUM', name: 'SCUTUM', type: RUNE_TYPES.FORM, baseDmg: 0, baseDef: 4, icon: Shield, color: 'text-slate-400', vfx: 'shield' },
    MAGNUS: { id: 'MAGNUS', name: 'MAGNUS', type: RUNE_TYPES.MODIFIER, baseDmg: 0, baseDef: 0, icon: Sparkles, color: 'text-amber-300' },
    CATENA: { id: 'CATENA', name: 'CATENA', type: RUNE_TYPES.MODIFIER, baseDmg: 0, baseDef: 0, icon: Link, color: 'text-cyan-300' },
    ET: { id: 'ET', name: 'ET', type: RUNE_TYPES.CONJUNCTION, baseDmg: 0, baseDef: 0, icon: Plus, color: 'text-slate-300' },
};

const SPELL_DICT = {
    'IGNIS GLACIES TELUM': { name: 'Elemental Blast', dmg: 15, def: 5, burn: 2, frostbite: 2, color: 'text-fuchsia-300', vfx: 'zap' },
    'IGNIS IGNIS TELUM': { name: 'Hellfire Bolt', dmg: 22, def: 0, burn: 5, color: 'text-red-600', vfx: 'fire' },
    'GLACIES GLACIES SCUTUM': { name: 'Permafrost Barrier', dmg: 0, def: 25, frostbite: 4, color: 'text-cyan-300', vfx: 'shield' },
    'SANGUIS UMBRA SCUTUM': { name: 'Blood Pact', dmg: 0, def: 30, heal: 8, selfDmg: 6, color: 'text-purple-500', vfx: 'void' }
};

const RELICS_DB = {
    BOOKMARK: { id: 'BOOKMARK', name: 'Obsidian Bookmark', desc: 'It does not save your place. It remembers where reality is supposed to be. Gain 8 Shield when crafting a perfect 4+ rune spell.', icon: BookOpen, color: 'text-slate-300' },
    QUILL: { id: 'QUILL', name: 'Echoing Quill', desc: 'A feather from an extinct Seraph. The first perfect spell you cast each combat triggers twice.', icon: Sparkles, color: 'text-yellow-300' },
    VIAL: { id: 'VIAL', name: 'Blood-Ink Vial', desc: 'The ink demands a toll. Spells heal +3 HP, but applying them costs 1 HP.', icon: Droplet, color: 'text-red-500' }
};

const INTENT_TYPES = {
    ATTACK: { icon: '⚔️', color: 'text-red-400', bg: 'bg-[#7f1d1d]' },
    SHIELD: { icon: '🛡️', color: 'text-blue-300', bg: 'bg-[#1e3a8a]' },
    DEBUFF: { icon: '✦', color: 'text-purple-400', bg: 'bg-[#4c1d95]' },
    REWRITE: { icon: '✎', color: 'text-amber-400', bg: 'bg-[#78350f]' },
    CHARGE: { icon: '∞', color: 'text-yellow-300', bg: 'bg-[#854d0e]' }
};

const ENEMIES = {
    'imp': { id: 'imp', name: 'Lesser Imp', maxHp: 35, dust: 10, isElite: false, icon: Ghost, iconColor: 'text-green-500',
        intents: [{type: 'ATTACK', val: 5}, {type: 'SHIELD', val: 4}, {type: 'ATTACK', val: 6}] },
    'stalker': { id: 'stalker', name: 'Void Stalker', maxHp: 75, dust: 15, isElite: false, icon: Skull, iconColor: 'text-purple-500',
        intents: [{type: 'ATTACK', val: 8}, {type: 'ATTACK', val: 12}, {type: 'DEBUFF', val: 0, desc: 'Syntax Eaten'}] },
    'demon': { id: 'demon', name: 'Blood Demon', maxHp: 150, dust: 30, isElite: true, icon: Target, iconColor: 'text-red-600',
        intents: [{type: 'ATTACK', val: 10}, {type: 'CHARGE', val: 0, desc: 'Preparing'}, {type: 'ATTACK', val: 25}, {type: 'SHIELD', val: 15}] },
    'elder': { id: 'elder', name: 'The Cacophony', maxHp: 300, dust: 75, isElite: true, isBoss: true, icon: Eye, iconColor: 'text-yellow-500',
        intents: [{type: 'REWRITE', val: 0, desc: 'Scrambled'}, {type: 'ATTACK', val: 20}, {type: 'ATTACK', val: 30}, {type: 'SHIELD', val: 25}] }
};

const MAP_NODES = [
    { level: 0, choices: [{ id: '1a', type: 'combat', name: 'The Dusty Archive', enemy: 'imp' }] },
    { level: 1, choices: [{ id: '2a', type: 'combat', name: 'Forgotten Hall', enemy: 'stalker' }, { id: '2b', type: 'campfire', name: 'The Bindery' }] },
    { level: 2, choices: [{ id: '3a', type: 'elite', name: 'The Sanguine Atrium', enemy: 'demon' }, { id: '3b', type: 'combat', name: 'Restless Tomes', enemy: 'stalker' }] },
    { level: 3, choices: [{ id: '4a', type: 'campfire', name: 'The Bindery' }] },
    { level: 4, choices: [{ id: '5a', type: 'boss', name: 'The Epicenter', enemy: 'elder' }] }
];

const SKILLS = {
    VITALITY_1: { id: 'VITALITY_1', name: 'Tome of Vitality', desc: 'Start runs with +20 Max HP.', cost: 15, req: [] },
    CAPACITY_1: { id: 'CAPACITY_1', name: 'Expanded Binding', desc: 'Start runs with 4 Max Syntax Capacity.', cost: 30, req: ['VITALITY_1'] },
    KNOWLEDGE_1: { id: 'KNOWLEDGE_1', name: 'Innate Magnitude', desc: 'Start runs with 1 MAGNUS rune in deck.', cost: 25, req: ['VITALITY_1'] },
    CAPACITY_2: { id: 'CAPACITY_2', name: 'Master Syntax', desc: 'Start runs with 5 Max Syntax Capacity.', cost: 80, req: ['CAPACITY_1'] },
    KNOWLEDGE_2: { id: 'KNOWLEDGE_2', name: 'Innate Chain', desc: 'Start runs with 1 CATENA rune in deck.', cost: 50, req: ['KNOWLEDGE_1'] },
    SIPHON_1: { id: 'SIPHON_1', name: 'Vampiric Pages', desc: 'Heal 10 HP after each victory.', cost: 60, req: ['KNOWLEDGE_1'] },
};

// --- HYBRID PARSER ENGINE (Procedural + Dictionary) ---
const getCollapse = (runes) => ({
    isCollapse: true, name: '⚠️ SYNTAX COLLAPSE', dmg: 2, def: 0, heal: 0, burn: 0, frostbite: 0,
    selfDmg: runes.length * 3, vfx: 'void', color: 'text-red-500'
});

const evaluateSequence = (draftedRunes) => {
    if (draftedRunes.length === 0) return null;

    const subSequences = []; let current = []; let previous = null; let syntaxError = false;

    // Split by ET conjunction
    draftedRunes.forEach(r => {
        if (r.id === 'ET') {
            if (current.length === 0 || previous?.id === 'ET') syntaxError = true;
            else { subSequences.push(current); current = []; }
        } else current.push(r);
        previous = r;
    });
    if (current.length > 0) subSequences.push(current);
    if (previous?.id === 'ET') syntaxError = true; // Hanging ET

    if (syntaxError) return getCollapse(draftedRunes);

    let totalDmg = 0, totalDef = 0, totalHeal = 0, totalSelfDmg = 0, totalBurn = 0, totalFrostbite = 0;
    let names = []; let vfx = 'zap'; let color = 'text-purple-300';

    for (let seq of subSequences) {
        let modifiers = seq.filter(r => r.type === RUNE_TYPES.MODIFIER);
        let elements = seq.filter(r => r.type === RUNE_TYPES.ELEMENT);
        let forms = seq.filter(r => r.type === RUNE_TYPES.FORM);

        // Grammatical Validation Rules
        if (forms.length > 1) return getCollapse(draftedRunes); // Multiple verbs
        if (elements.length === 0 && forms.length > 0) return getCollapse(draftedRunes); // Verb without noun
        if (elements.length === 0 && modifiers.length > 0) return getCollapse(draftedRunes); // Hanging modifier

        const fullName = seq.map(r => r.id).join(' ');
        
        // Additive Modifier Stacking
        let multiplier = 1 + (modifiers.filter(m => m.id === 'MAGNUS').length);
        if (modifiers.some(m => m.id === 'CATENA')) multiplier += 0.5;

        // 1. Dictionary Overrides Check
        if (SPELL_DICT[fullName]) {
            const s = SPELL_DICT[fullName];
            totalDmg += (s.dmg || 0) * multiplier; totalDef += (s.def || 0) * multiplier;
            totalHeal += (s.heal || 0) * multiplier; totalSelfDmg += (s.selfDmg || 0) * multiplier;
            totalBurn += (s.burn || 0) * multiplier; totalFrostbite += (s.frostbite || 0) * multiplier;
            names.push(multiplier > 1 ? `Empowered ${s.name}` : s.name);
            vfx = s.vfx; color = s.color;
        } 
        // 2. Procedural Form Math
        else if (elements.length > 0 && forms.length === 1) {
            const form = forms[0];
            let seqDmg = form.baseDmg, seqDef = form.baseDef;
            let seqBurn = 0, seqFrostbite = 0, seqSelfDmg = 0, seqHeal = 0;
            
            elements.forEach(e => {
                seqDmg += e.baseDmg; seqDef += e.baseDef;
                if (e.id === 'IGNIS') seqBurn += 1;
                if (e.id === 'GLACIES') seqFrostbite += 1;
                if (e.id === 'UMBRA') seqSelfDmg += 1;
                if (e.id === 'SANGUIS') seqHeal += 1;
                color = e.color; vfx = e.vfx;
            });

            totalDmg += seqDmg * multiplier; totalDef += seqDef * multiplier;
            totalBurn += seqBurn * multiplier; totalFrostbite += seqFrostbite * multiplier;
            totalSelfDmg += seqSelfDmg * multiplier; totalHeal += seqHeal * multiplier;
            names.push(multiplier > 1 ? `Empowered ${elements[0].name} ${form.name}` : `${elements[0].name} ${form.name}`);
        }
        // 3. Procedural Spark (Element only)
        else if (elements.length > 0 && forms.length === 0 && modifiers.length === 0) {
            let seqDmg = 0, seqDef = 0, seqBurn = 0, seqFrostbite = 0;
            elements.forEach(e => {
                seqDmg += e.baseDmg; seqDef += e.baseDef;
                if (e.id === 'IGNIS') seqBurn += 1;
                if (e.id === 'GLACIES') seqFrostbite += 1;
                color = e.color; vfx = e.vfx;
            });
            totalDmg += seqDmg * multiplier; totalDef += seqDef * multiplier;
            totalBurn += seqBurn * multiplier; totalFrostbite += seqFrostbite * multiplier;
            names.push(elements.length > 1 ? `Composite Spark` : `${elements[0].name} Spark`);
        } else return getCollapse(draftedRunes);
    }

    return {
        isCollapse: false, name: names.join(' AND '),
        dmg: totalDmg, def: totalDef, heal: totalHeal, selfDmg: totalSelfDmg,
        burn: totalBurn, frostbite: totalFrostbite, vfx, color: names.length > 1 ? 'text-fuchsia-300' : color
    };
};

const delay = ms => new Promise(res => setTimeout(res, ms));

// --- GLOBAL 2D ENGINE API ---
let engine2D = null;
let globalCharLevel = 0; // For environmental reaction

export default function GrimoireApp() {
    const canvasRef = useRef(null);
    const [gameState, setGameState] = useState('boot'); 
    const [introStep, setIntroStep] = useState(0);
    const [mapLevel, setMapLevel] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    
    const gameStateRef = useRef(gameState);
    useEffect(() => { gameStateRef.current = gameState; }, [gameState]);
    
    const [meta, setMeta] = useState({ dust: 0, unlocks: [] });
    const [runDust, setRunDust] = useState(0);

    const [player, setPlayer] = useState({ hp: 50, maxHp: 50, shield: 0, maxRunes: 3, relics: [] });
    const [deck, setDeck] = useState([]);
    const [hand, setHand] = useState([]);
    const [draft, setDraft] = useState([]);
    const [drawPile, setDrawPile] = useState([]);
    const [discardPile, setDiscardPile] = useState([]);
    const [combatState, setCombatState] = useState({ turn: 0, firstSpellCast: false });
    
    const [enemy, setEnemy] = useState(null);
    const [combatLog, setCombatLog] = useState([]);
    const [rewardOptions, setRewardOptions] = useState({ runes: [], relics: [] });
    const [floatingTexts, setFloatingTexts] = useState([]);

    useEffect(() => {
        try {
            const saved = localStorage.getItem('grimoire_meta_v5');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed && typeof parsed === 'object') setMeta({ dust: parsed.dust || 0, unlocks: parsed.unlocks || [] });
            }
        } catch (e) {}
    }, []);

    useEffect(() => { try { localStorage.setItem('grimoire_meta_v5', JSON.stringify(meta)); } catch (e) {} }, [meta]);

    const handleBootClick = () => {
        SoundEngine.init();
        setGameState('intro');
    };

    useEffect(() => {
        if (gameState === 'intro') {
            const sequence = async () => {
                await delay(1000); if (gameStateRef.current !== 'intro') return;
                setIntroStep(1); SoundEngine.sfx.cinematicThud(); await delay(4000);
                if (gameStateRef.current !== 'intro') return;
                setIntroStep(2); SoundEngine.sfx.cinematicThud(); await delay(4000);
                if (gameStateRef.current !== 'intro') return;
                setIntroStep(3); SoundEngine.sfx.cinematicThud(); await delay(4000);
                if (gameStateRef.current !== 'intro') return;
                setIntroStep(4); SoundEngine.sfx.cinematicThud(); await delay(4000);
                if (gameStateRef.current !== 'intro') return;
                setGameState('menu');
            };
            sequence();
        }
    }, [gameState]);

    // Keyboard Controller Implementation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (gameStateRef.current !== 'combat' || isProcessing) return;
            const key = parseInt(e.key);
            if (!isNaN(key) && key > 0 && key <= hand.length) {
                addToDraft(hand[key - 1]);
            } else if (e.key === 'Backspace' || e.key === 'b') {
                if (draft.length > 0) removeFromDraft(draft.length - 1);
            } else if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault(); if (draft.length > 0) executeCombatRound(draft);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [hand, draft, isProcessing]);

    // --- 2D CANVAS ENGINE (Reactive Environment) ---
    useEffect(() => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationId;

        let particles = []; let projectiles = []; let auras = [];
        let shakeIntensity = 0; let currentEnemy = null; let bookPulse = 0;

        const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
        window.addEventListener('resize', resize); resize();

        const getPos = (isPlayer) => {
            const y = canvas.height * 0.45;
            if (canvas.width < 768) return { x: isPlayer ? canvas.width * 0.35 : canvas.width * 0.65, y: canvas.height * 0.35 };
            return { x: isPlayer ? canvas.width * 0.25 : canvas.width * 0.75, y };
        };

        const hexToRgb = (hex) => {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '255,255,255';
        };

        const spawnParticles = (x, y, colorStr, count, speedMulti = 1, type = 'normal') => {
            const rgb = hexToRgb(colorStr);
            for (let i = 0; i < count; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = (Math.random() * 3 + 1) * speedMulti;
                particles.push({
                    x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed + (type === 'void' ? 0 : -2),
                    life: 1.0, maxLife: 1.0 + Math.random(), color: rgb, size: Math.random() * 4 + 2, type
                });
            }
        };

        engine2D = {
            setEnemy: (enemyId, colorClass, isElite) => {
                if (!enemyId) { currentEnemy = null; return; }
                const hexColor = TAILWIND_TO_HEX[colorClass] || '#ffffff';
                currentEnemy = { id: enemyId, color: hexColor, isElite, rot: 0, scale: isElite ? 1.3 : 1 };
                const pos = getPos(false); spawnParticles(pos.x, pos.y, hexColor, 30);
            },
            triggerVFX: (isPlayerCast, colorClass, sizeMulti, vfxType, onHit, isCollapse) => {
                const hexColor = TAILWIND_TO_HEX[colorClass] || '#ffffff';
                const startPos = getPos(isPlayerCast); const endPos = getPos(!isPlayerCast);

                if (isCollapse) {
                    shakeIntensity = 20; globalCharLevel = 1.0;
                    spawnParticles(startPos.x, startPos.y, '#ef4444', 60, 2.5, 'void');
                    if (onHit) setTimeout(onHit, 500); return;
                }

                if (vfxType === 'shield' || vfxType === 'heal') {
                    auras.push({ x: startPos.x, y: startPos.y, radius: 10, maxRadius: 100 * sizeMulti, alpha: 0.8, color: hexColor, life: 1.0 });
                    spawnParticles(startPos.x, startPos.y, hexColor, 30, 1, 'heal');
                    if (onHit) setTimeout(onHit, 300); return;
                }

                projectiles.push({
                    x: startPos.x, y: startPos.y, startX: startPos.x, startY: startPos.y, endX: endPos.x, endY: endPos.y,
                    progress: 0, color: hexColor, size: sizeMulti * 10, vfxType, isArc: vfxType === 'blood',
                    onHit: () => {
                        shakeIntensity = sizeMulti * 5;
                        spawnParticles(endPos.x, endPos.y, hexColor, 40 * sizeMulti, sizeMulti * 0.5, vfxType);
                        if (onHit) onHit();
                    }
                });
            },
            triggerDeath: (isPlayer) => {
                const pos = getPos(isPlayer); spawnParticles(pos.x, pos.y, isPlayer ? '#22d3ee' : '#dc2626', 100, 3);
                if (!isPlayer) currentEnemy = null;
            }
        };

        const drawPolygon = (cx, cy, sides, radius, rotation, color, glow) => {
            ctx.save(); ctx.translate(cx, cy); ctx.rotate(rotation); ctx.beginPath();
            for (let i = 0; i < sides; i++) {
                const a = (i * 2 * Math.PI) / sides; const px = Math.cos(a) * radius; const py = Math.sin(a) * radius;
                if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
            }
            ctx.closePath();
            if (glow) { ctx.shadowBlur = 20; ctx.shadowColor = color; }
            ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.stroke();
            ctx.fillStyle = `rgba(${hexToRgb(color)}, 0.1)`; ctx.fill(); ctx.restore();
        };

        const drawBook = (cx, cy, pulse) => {
            ctx.save(); ctx.translate(cx, cy + Math.sin(pulse) * 5); ctx.rotate(Math.sin(pulse * 0.5) * 0.05);
            ctx.shadowBlur = 30; ctx.shadowColor = '#8b5cf6';
            ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(-30, -10, -50, -20); ctx.lineTo(-50, 30); ctx.quadraticCurveTo(-30, 40, 0, 50); ctx.closePath();
            ctx.fillStyle = '#cbd5e1'; ctx.fill(); ctx.strokeStyle = '#475569'; ctx.lineWidth = 2; ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(30, -10, 50, -20); ctx.lineTo(50, 30); ctx.quadraticCurveTo(30, 40, 0, 50); ctx.closePath();
            ctx.fillStyle = '#e2e8f0'; ctx.fill(); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 50); ctx.strokeStyle = '#1e1b4b'; ctx.lineWidth = 4; ctx.stroke();
            ctx.shadowBlur = 10; ctx.fillStyle = '#c084fc'; ctx.font = '14px serif';
            ctx.fillText('⎈', -25, -5 + Math.sin(pulse*2)*3); ctx.fillText('⎊', 15, -10 + Math.cos(pulse*2)*3);
            ctx.restore();
        };

        let lastTime = performance.now();
        const animate = (time) => {
            animationId = requestAnimationFrame(animate);
            const dt = (time - lastTime) / 1000; lastTime = time;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Reactive Environment: Charring
            if (globalCharLevel > 0) {
                globalCharLevel = Math.max(0, globalCharLevel - dt * 0.5);
                ctx.fillStyle = `rgba(180, 20, 0, ${globalCharLevel * 0.3})`;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.shadowBlur = 100 * globalCharLevel; ctx.shadowColor = '#ef4444';
                ctx.strokeStyle = `rgba(220, 38, 38, ${globalCharLevel})`; ctx.lineWidth = 20 * globalCharLevel;
                ctx.strokeRect(0, 0, canvas.width, canvas.height); ctx.shadowBlur = 0;
            }

            ctx.save();
            if (shakeIntensity > 0) {
                ctx.translate((Math.random() - 0.5) * shakeIntensity, (Math.random() - 0.5) * shakeIntensity);
                shakeIntensity *= 0.9; if (shakeIntensity < 0.5) shakeIntensity = 0;
            }

            const isCombat = gameStateRef.current === 'combat';
            bookPulse += dt * 2;

            if (isCombat) {
                const pPos = getPos(true); drawBook(pPos.x, pPos.y, bookPulse);

                if (currentEnemy) {
                    const ePos = getPos(false); currentEnemy.rot += dt;
                    const eY = ePos.y + Math.cos(bookPulse * 1.5) * 10;
                    
                    if (currentEnemy.id === 'imp') drawPolygon(ePos.x, eY, 3, 30 * currentEnemy.scale, currentEnemy.rot, currentEnemy.color, true);
                    else if (currentEnemy.id === 'stalker') drawPolygon(ePos.x, eY, 4, 40 * currentEnemy.scale, -currentEnemy.rot, currentEnemy.color, true);
                    else if (currentEnemy.id === 'demon') { drawPolygon(ePos.x, eY, 6, 45 * currentEnemy.scale, currentEnemy.rot, currentEnemy.color, true); drawPolygon(ePos.x, eY, 3, 20 * currentEnemy.scale, -currentEnemy.rot * 2, currentEnemy.color, false); }
                    else if (currentEnemy.id === 'elder') {
                        drawPolygon(ePos.x, eY, 8, 60 * currentEnemy.scale, currentEnemy.rot * 0.5, currentEnemy.color, true);
                        ctx.beginPath(); ctx.ellipse(ePos.x, eY, 20, 10, 0, 0, Math.PI * 2); ctx.fillStyle = '#000'; ctx.fill();
                        ctx.beginPath(); ctx.arc(ePos.x, eY, 8, 0, Math.PI * 2); ctx.fillStyle = currentEnemy.color; ctx.fill();
                    }
                }
            }

            for (let i = auras.length - 1; i >= 0; i--) {
                const a = auras[i]; a.radius += dt * 150; a.life -= dt * 2;
                if (a.life <= 0) { auras.splice(i, 1); continue; }
                ctx.beginPath(); ctx.arc(a.x, a.y, a.radius, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(${hexToRgb(a.color)}, ${a.life})`; ctx.lineWidth = 4;
                ctx.shadowBlur = 10; ctx.shadowColor = a.color; ctx.stroke(); ctx.shadowBlur = 0;
            }

            for (let i = projectiles.length - 1; i >= 0; i--) {
                const p = projectiles[i]; p.progress += dt * 2.5; 
                if (p.progress >= 1.0) { if (p.onHit) p.onHit(); projectiles.splice(i, 1); continue; }
                p.x = p.startX + (p.endX - p.startX) * p.progress; p.y = p.startY + (p.endY - p.startY) * p.progress;
                if (p.isArc) p.y -= Math.sin(p.progress * Math.PI) * 50;
                ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.vfxType === 'void' ? '#000' : '#fff'; ctx.shadowBlur = 20; ctx.shadowColor = p.color; ctx.fill();
                ctx.beginPath(); ctx.arc(p.x, p.y, p.size + 4, 0, Math.PI * 2);
                ctx.strokeStyle = p.color; ctx.lineWidth = 2; ctx.stroke(); ctx.shadowBlur = 0;
            }

            ctx.globalCompositeOperation = 'lighter';
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i]; p.x += p.vx * dt * 60; p.y += p.vy * dt * 60;
                if (p.type !== 'void') p.vy += dt * 10; else { p.vx *= 0.95; p.vy *= 0.95; }
                p.life -= dt * (1 / p.maxLife); if (p.life <= 0) { particles.splice(i, 1); continue; }
                ctx.fillStyle = `rgba(${p.color}, ${p.life})`; ctx.fillRect(p.x, p.y, p.size * p.life, p.size * p.life);
            }
            ctx.globalCompositeOperation = 'source-over'; ctx.restore();
        };

        animationId = requestAnimationFrame(animate);
        return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(animationId); engine2D = null; };
    }, []);

    const spawnFCT = (text, type, isPlayer) => {
        const id = Math.random().toString(36);
        setFloatingTexts(prev => [...prev, { id, text, type, isPlayer, x: (Math.random() * 40 - 20) }]);
        setTimeout(() => setFloatingTexts(prev => prev.filter(t => t.id !== id)), 1200);
    };
    const addLog = (msg) => setCombatLog(prev => [msg, ...prev].slice(0, 8));

    const getInitialDeck = () => {
        const d = [
            RUNES_DB.IGNIS, RUNES_DB.IGNIS, RUNES_DB.GLACIES, RUNES_DB.GLACIES,
            RUNES_DB.TELUM, RUNES_DB.TELUM, RUNES_DB.SCUTUM, RUNES_DB.SCUTUM, RUNES_DB.ET,
        ];
        if (meta.unlocks.includes('KNOWLEDGE_1')) d.push(RUNES_DB.MAGNUS);
        if (meta.unlocks.includes('KNOWLEDGE_2')) d.push(RUNES_DB.CATENA);
        return d.map(r => ({ ...r, instanceId: Math.random().toString(36) }));
    };

    const handleOpenTome = () => {
        SoundEngine.init(); SoundEngine.sfx.heal(); setRunDust(0);
        let startHp = 50 + (meta.unlocks.includes('VITALITY_1') ? 20 : 0);
        let startRunes = 3 + (meta.unlocks.includes('CAPACITY_1') ? 1 : 0) + (meta.unlocks.includes('CAPACITY_2') ? 1 : 0);
        setPlayer({ hp: startHp, maxHp: startHp, shield: 0, maxRunes: startRunes, relics: [] });
        setDeck(getInitialDeck()); setMapLevel(0); setGameState('map');
    };

    const buySkill = (skillId) => {
        const skill = SKILLS[skillId];
        if (meta.dust >= skill.cost && !meta.unlocks.includes(skillId)) {
            SoundEngine.init(); SoundEngine.sfx.unlock();
            setMeta(prev => ({ ...prev, dust: prev.dust - skill.cost, unlocks: [...prev.unlocks, skillId] }));
        }
    };

    const handleNodeSelection = (node) => {
        SoundEngine.sfx.hitLight();
        if (node.type === 'combat' || node.type === 'elite' || node.type === 'boss') {
            const enemyTemplate = ENEMIES[node.enemy];
            const nextEnemy = { ...enemyTemplate, hp: enemyTemplate.maxHp, turn: 0, statuses: { burn: 0, frostbite: 0 }, shield: 0 };
            setEnemy(nextEnemy);
            if (engine2D) engine2D.setEnemy(nextEnemy.id, nextEnemy.iconColor, nextEnemy.isElite);
            
            const initialDraw = [...deck].sort(() => Math.random() - 0.5); let nHand = [];
            for(let i=0; i<5; i++) if(initialDraw.length > 0) nHand.push(initialDraw.pop());
            setDrawPile(initialDraw); setHand(nHand); setDiscardPile([]); setDraft([]);
            setPlayer(p => ({ ...p, shield: 0 })); setCombatState({ turn: 0, firstSpellCast: false });
            setCombatLog([`${nextEnemy.name} emerges from the ink.`]); setGameState('combat');
        } else if (node.type === 'campfire') {
            if (engine2D) engine2D.setEnemy(null); setGameState('campfire');
        }
    };

    const doDrawPhase = (currentDraw, currentDiscard, cardsToDiscard) => {
        let nDraw = [...currentDraw]; let nDiscard = [...currentDiscard, ...cardsToDiscard]; let nHand = [];
        for (let i = 0; i < 5; i++) {
            if (nDraw.length === 0) {
                if (nDiscard.length === 0) break;
                nDraw = [...nDiscard].sort(() => Math.random() - 0.5); nDiscard = []; addLog('Reshuffling grimoire pages...');
            }
            nHand.push(nDraw.pop());
        }
        setHand(nHand); setDrawPile(nDraw); setDiscardPile(nDiscard);
    };

    const addToDraft = (rune) => {
        if (draft.length < player.maxRunes && !isProcessing) {
            setDraft([...draft, rune]); setHand(hand.filter(r => r.instanceId !== rune.instanceId)); SoundEngine.sfx.hitLight();
        }
    };

    const removeFromDraft = (index) => {
        if (isProcessing) return;
        const rune = draft[index];
        if (rune) {
            const newDraft = [...draft]; newDraft.splice(index, 1);
            setDraft(newDraft); setHand([...hand, rune]); SoundEngine.sfx.hitLight();
        }
    };

    // --- EXECUTE COMBAT ---
    const executeCombatRound = async (playedRunes) => {
        setIsProcessing(true); setDraft([]);
        let p_hp = player.hp, p_shield = 0, e_hp = enemy.hp, e_shield = enemy.shield || 0;
        let e_statuses = { ...enemy.statuses };

        // 0. Enemy DoTs
        if (e_statuses.burn > 0) {
            SoundEngine.sfx.fire(); e_hp = Math.max(0, e_hp - e_statuses.burn);
            spawnFCT(`-${e_statuses.burn} Burn`, 'damage', false); addLog(`${enemy.name} burns for ${e_statuses.burn}.`);
            e_statuses.burn = Math.max(0, e_statuses.burn - 1); await delay(500);
            if (e_hp <= 0) { setEnemy(e => ({ ...e, hp: e_hp, statuses: e_statuses })); return handleEnemyDeath(); }
        }

        // 1. PLAYER CASTS
        const outcome = evaluateSequence(playedRunes);
        let castCount = 1;

        if (outcome) {
            if (outcome.isCollapse) {
                addLog(`Your syntax collapses under its own instability!`); SoundEngine.sfx.error();
                if (engine2D) await new Promise(resolve => engine2D.triggerVFX(true, outcome.color, 2, 'void', resolve, true));
                p_hp -= outcome.selfDmg; spawnFCT(`-${outcome.selfDmg} (Collapse)`, 'damage', true);
                if (outcome.dmg > 0) { e_hp = Math.max(0, e_hp - outcome.dmg); spawnFCT(`-${outcome.dmg}`, 'damage', false); }
                setEnemy(e => ({ ...e, hp: e_hp, statuses: e_statuses })); setPlayer(p => ({ ...p, hp: p_hp, shield: p_shield }));
                await delay(800);
            } else {
                if (player.relics.includes('QUILL') && !combatState.firstSpellCast) {
                    addLog(`Echoing Quill triggers!`); SoundEngine.sfx.relic();
                    castCount = 2; setCombatState(prev => ({ ...prev, firstSpellCast: true })); await delay(400);
                }

                for(let c=0; c<castCount; c++) {
                    if (c > 0) addLog(`Echoing: ${outcome.name}!`); else addLog(`Invoked: ${outcome.name}!`);
                    let activeOutcome = { ...outcome };
                    if (player.relics.includes('VIAL')) { activeOutcome.heal += 3; p_hp -= 1; spawnFCT("-1 Vial", 'damage', true); }
                    if (SoundEngine.sfx[activeOutcome.vfx]) SoundEngine.sfx[activeOutcome.vfx](); else SoundEngine.sfx.zap();

                    if (engine2D && (activeOutcome.dmg > 0 || activeOutcome.def > 0 || activeOutcome.heal > 0)) {
                        const size = Math.min(3, Math.max(1, activeOutcome.dmg / 10)); 
                        await new Promise(resolve => engine2D.triggerVFX(true, activeOutcome.color, size, activeOutcome.vfx, resolve, false));
                    } else await delay(500);

                    if (activeOutcome.dmg >= 15) SoundEngine.sfx.hitHeavy(); else if (activeOutcome.dmg > 0) SoundEngine.sfx.hitLight();

                    if (activeOutcome.dmg > 0) { 
                        let dmgToEnemy = Math.max(0, activeOutcome.dmg - e_shield);
                        e_shield = Math.max(0, e_shield - activeOutcome.dmg);
                        e_hp = Math.max(0, e_hp - dmgToEnemy); 
                        spawnFCT(`-${dmgToEnemy}`, 'damage', false); 
                    }
                    if (activeOutcome.def > 0) { p_shield += activeOutcome.def; spawnFCT(`+${activeOutcome.def}`, 'shield', true); }
                    if (activeOutcome.heal > 0) { p_hp = Math.min(player.maxHp, p_hp + activeOutcome.heal); spawnFCT(`+${activeOutcome.heal}`, 'heal', true); }
                    if (activeOutcome.selfDmg > 0) { p_hp -= activeOutcome.selfDmg; spawnFCT(`-${activeOutcome.selfDmg}`, 'damage', true); }
                    if (activeOutcome.burn > 0) { e_statuses.burn += activeOutcome.burn; spawnFCT(`+${activeOutcome.burn} Burn`, 'status', false); SoundEngine.sfx.status(); }
                    if (activeOutcome.frostbite > 0) { e_statuses.frostbite += activeOutcome.frostbite; spawnFCT(`+${activeOutcome.frostbite} Frostbite`, 'status', false); SoundEngine.sfx.status(); }

                    setEnemy(e => ({ ...e, hp: e_hp, shield: e_shield, statuses: e_statuses }));
                    setPlayer(p => ({ ...p, hp: p_hp, shield: p_shield })); await delay(300);
                }
                if (player.relics.includes('BOOKMARK') && playedRunes.length >= 4) {
                    SoundEngine.sfx.relic(); p_shield += 8; setPlayer(p => ({ ...p, shield: p_shield }));
                    spawnFCT(`+8 Bookmark`, 'shield', true); addLog(`Obsidian Bookmark activated.`); await delay(300);
                }
            }
        } else { addLog("You conserved your magic."); await delay(500); }
        
        if (e_hp <= 0) return handleEnemyDeath();

        // 3. ENEMY INTENT RESOLUTION
        await delay(400);
        let intent = enemy.intents[enemy.turn % enemy.intents.length];
        addLog(`Entity uses ${intent.type}!`);

        if (intent.type === 'ATTACK') {
            let enemyDmg = intent.val;
            if (e_statuses.frostbite > 0) {
                enemyDmg = Math.max(0, enemyDmg - e_statuses.frostbite); e_statuses.frostbite = Math.max(0, e_statuses.frostbite - 1);
                spawnFCT("Frostbitten", 'status', false); await delay(300);
            }
            if (enemyDmg > 0) {
                SoundEngine.sfx.enemyAttack();
                if (engine2D) await new Promise(resolve => engine2D.triggerVFX(false, enemy.iconColor, Math.min(3, Math.max(1, enemyDmg / 8)), 'zap', resolve, false));
                const dmgToPlayer = Math.max(0, enemyDmg - p_shield); const absorbed = enemyDmg - dmgToPlayer;
                p_shield = Math.max(0, p_shield - enemyDmg); p_hp -= dmgToPlayer;
                if (dmgToPlayer > 0) { spawnFCT(`-${dmgToPlayer}`, 'damage', true); SoundEngine.sfx.hitHeavy(); } 
                else if (absorbed > 0) { SoundEngine.sfx.shield(); spawnFCT(`Blocked ${absorbed}`, 'block', true); }
            } else addLog(`The attack was frozen completely!`);
        } 
        else if (intent.type === 'SHIELD') {
            SoundEngine.sfx.shield(); e_shield += intent.val;
            if (engine2D) await new Promise(resolve => engine2D.triggerVFX(false, 'text-blue-300', 1.5, 'shield', resolve, false));
            spawnFCT(`+${intent.val} Ward`, 'shield', false);
        }
        else if (intent.type === 'DEBUFF' || intent.type === 'REWRITE') {
            SoundEngine.sfx.status();
            spawnFCT(intent.desc, 'status', true); addLog(`Syntax disrupted!`); await delay(500);
        }

        setEnemy(e => ({ ...e, turn: e.turn + 1, shield: e_shield, statuses: e_statuses }));
        setPlayer(p => ({ ...p, hp: p_hp, shield: p_shield }));

        if (p_hp <= 0) {
            SoundEngine.sfx.hitHeavy(); if (engine2D) engine2D.triggerDeath(true); await delay(1500);
            setMeta(prev => ({ ...prev, dust: prev.dust + runDust })); setGameState('gameover'); setIsProcessing(false); return;
        }

        doDrawPhase(drawPile, discardPile, [...playedRunes, ...hand]); setIsProcessing(false);
    };

    const handleEnemyDeath = async () => {
        addLog(`The paradox is resolved!`); SoundEngine.sfx.hitHeavy(); if (engine2D) engine2D.triggerDeath(false); 
        const earnedDust = enemy.dust || 10; setRunDust(prev => prev + earnedDust); await delay(1200);
        if (meta.unlocks.includes('SIPHON_1')) {
            SoundEngine.sfx.heal(); setPlayer(p => ({ ...p, hp: Math.min(p.maxHp, p.hp + 10) }));
            spawnFCT(`+10 Siphon`, 'heal', true); addLog(`Vampiric Pages restored 10 HP.`); await delay(800);
        }
        if (enemy.isBoss) { setMeta(prev => ({ ...prev, dust: prev.dust + runDust + earnedDust })); setGameState('victory'); } 
        else { generateRewards(enemy.isElite); setGameState('reward'); }
        setIsProcessing(false);
    };

    const generateRewards = (isElite) => {
        const pool = Object.values(RUNES_DB); const options = [];
        while(options.length < 3) {
            const pick = pool[Math.floor(Math.random() * pool.length)];
            if(!options.find(r => r.id === pick.id)) options.push(pick);
        }
        let relicOpt = null;
        if (isElite) {
            const availRelics = Object.values(RELICS_DB).filter(r => !player.relics.includes(r.id));
            if (availRelics.length > 0) relicOpt = availRelics[Math.floor(Math.random() * availRelics.length)];
        }
        setRewardOptions({ runes: options, relic: relicOpt });
    };

    const claimRuneReward = (rune) => {
        SoundEngine.sfx.heal(); setDeck([...deck, { ...rune, instanceId: Math.random().toString(36) }]);
        setMapLevel(mapLevel + 1); setGameState('map');
    };
    const claimRelicReward = (relic) => {
        SoundEngine.sfx.relic(); setPlayer(p => ({ ...p, relics: [...p.relics, relic.id] }));
        setMapLevel(mapLevel + 1); setGameState('map');
    };
    const handleCampfire = (action) => {
        SoundEngine.sfx.heal();
        if (action === 'heal') setPlayer(p => ({ ...p, hp: Math.min(p.maxHp, p.hp + 20) }));
        if (action === 'upgrade') setPlayer(p => ({ ...p, maxRunes: Math.min(6, p.maxRunes + 1) }));
        setMapLevel(mapLevel + 1); setGameState('map');
    };

    const RuneCard = ({ rune, onClick, disabled, minimal, inDraft }) => {
        const Icon = rune.icon;
        if (minimal) return (
            <div className={`flex flex-col items-center justify-center w-full h-full animate-in zoom-in duration-200 ${inDraft ? 'scale-110 drop-shadow-[0_0_8px_currentColor]' : ''} ${rune.color}`}>
                <Icon size={24} className="mb-1" />
                <span className="text-[9px] font-black text-white uppercase tracking-wider">{rune.name}</span>
            </div>
        );
        return (
            <div onClick={!disabled ? onClick : undefined}
                className={`relative flex-shrink-0 flex flex-col items-center justify-center w-20 h-28 rounded-sm border border-[#3f3f46] bg-[#1c1917]/90 backdrop-blur-md select-none shadow-[0_4px_12px_rgba(0,0,0,0.5)]
                    ${disabled ? 'opacity-40 cursor-not-allowed border-black' : 'cursor-pointer hover:border-[#a855f7] hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] card-hover-physics'}`}>
                <div className="absolute inset-0 bg-gradient-to-b from-[#292524] to-transparent opacity-50 rounded-sm pointer-events-none" />
                <span className="text-[9px] absolute top-1 left-1 text-[#a1a1aa] font-serif font-bold uppercase z-10">{rune.type}</span>
                <Icon size={28} className={`mb-1 z-10 ${rune.color} transition-transform duration-300 drop-shadow-[0_0_5px_currentColor]`} />
                <span className="text-[10px] font-black text-[#e5e5e5] mt-1 z-10 tracking-widest">{rune.name}</span>
            </div>
        );
    };

    const RelicBar = () => (
        <div className="flex gap-2">
            {player.relics.map(id => {
                const r = RELICS_DB[id]; const Icon = r.icon;
                return <div key={id} className={`p-1.5 rounded-sm border border-[#3f3f46] bg-[#1c1917]/80 backdrop-blur-md shadow-md ${r.color}`} title={r.desc}><Icon size={16} /></div>
            })}
        </div>
    );

    const currentSpellPrediction = evaluateSequence(draft);

    return (
        <div className="min-h-screen font-serif text-[#e5e5e5] selection:bg-purple-900 overflow-hidden relative bg-[#0c0a09]">
            
            <div className={`fixed inset-0 w-full h-full pointer-events-none transition-opacity duration-1000 ${gameState === 'combat' || gameState === 'intro' ? 'opacity-100 z-0' : 'opacity-30 -z-10'}`}>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#292524] via-[#0c0a09] to-black opacity-80" />
                <canvas ref={canvasRef} className="absolute inset-0 z-10" />
            </div>

            <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
                {floatingTexts.map(fct => {
                    const leftPos = fct.isPlayer ? '30%' : '70%';  const topPos = fct.type === 'status' ? '35%' : '45%';
                    const colorClass = fct.type === 'damage' ? 'text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,1)]' : 
                                       fct.type === 'shield' ? 'text-blue-300 drop-shadow-[0_0_10px_rgba(147,197,253,1)]' :
                                       fct.type === 'heal' ? 'text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,1)]' :
                                       fct.type === 'status' ? 'text-fuchsia-400 drop-shadow-[0_0_10px_rgba(232,121,249,1)]' : 'text-slate-100 drop-shadow-[0_0_10px_rgba(255,255,255,1)]';
                    const sizeClass = fct.type === 'damage' ? 'text-5xl font-black font-sans' : fct.type === 'status' ? 'text-xl font-bold italic' : 'text-3xl font-bold font-sans';
                    return (
                        <div key={fct.id} className={`absolute -translate-x-1/2 -translate-y-1/2 fct-anim ${colorClass} ${sizeClass} whitespace-nowrap z-50`} style={{ top: topPos, left: leftPos, marginLeft: `${fct.x}px` }}>{fct.text}</div>
                    );
                })}
            </div>

            {gameState === 'boot' && (
                <div onClick={handleBootClick} className="absolute inset-0 bg-black z-50 flex items-center justify-center cursor-pointer">
                    <p className="text-[#a1a1aa] font-sans tracking-[0.3em] uppercase animate-pulse">Click anywhere to open the tome</p>
                </div>
            )}

            {gameState === 'intro' && (
                <div onClick={() => setGameState('menu')} className="absolute inset-0 bg-black/90 backdrop-blur-sm z-40 flex flex-col items-center justify-center text-center p-8 cursor-pointer">
                    <div className="absolute bottom-4 right-4 text-[#52525b] text-xs font-sans uppercase tracking-widest">Click to skip</div>
                    <div className="h-32 flex items-center justify-center">
                        <p className={`text-2xl italic text-[#d4d4d8] transition-opacity duration-1000 ${introStep === 1 ? 'opacity-100' : 'opacity-0 absolute'}`}>"Creation was not a Big Bang..."</p>
                        <p className={`text-3xl italic text-[#e5e5e5] transition-opacity duration-1000 ${introStep === 2 ? 'opacity-100' : 'opacity-0 absolute'}`}>"It was a spoken sentence."</p>
                        <p className={`text-4xl font-black font-sans text-red-600 transition-opacity duration-1000 tracking-tighter drop-shadow-[0_0_15px_rgba(220,38,38,0.8)] ${introStep === 3 ? 'opacity-100' : 'opacity-0 absolute'}`}>But sentences can be broken.</p>
                        <div className={`flex flex-col items-center transition-opacity duration-1000 ${introStep >= 4 ? 'opacity-100' : 'opacity-0 absolute'}`}>
                            <p className="text-xl text-purple-400 font-black font-sans tracking-widest uppercase mb-2">You are the Erased Scribe.</p>
                            <p className="text-sm text-[#a1a1aa] font-sans">Bound to the Grimoire. Speak the words to seal the breach.</p>
                        </div>
                    </div>
                </div>
            )}

            {gameState === 'menu' && (
                <div className="absolute inset-0 z-30 flex flex-col items-center justify-center text-center p-8 pointer-events-auto">
                    <div className="absolute top-6 right-6 flex items-center gap-2 bg-[#1c1917]/90 px-4 py-2 rounded-sm border border-cyan-900/50 shadow-[0_0_15px_rgba(6,182,212,0.2)] backdrop-blur-md">
                        <span className="font-bold font-sans text-cyan-400">{meta.dust}</span><Sparkles size={16} className="text-cyan-500 animate-pulse" />
                    </div>
                    <Book size={80} className="text-purple-500 mb-6 drop-shadow-[0_0_30px_rgba(168,85,247,0.5)] animate-[bounce_4s_infinite]" />
                    <h1 className="text-7xl font-black font-sans text-[#fafafa] mb-2 tracking-tighter drop-shadow-2xl">GRIMOIRE</h1>
                    <p className="text-purple-400 font-bold font-sans tracking-widest uppercase mb-12 text-xs max-w-sm leading-relaxed border-t border-purple-900/50 pt-4">You are the Erased Scribe. <br/>Speak the words to seal the breach.</p>
                    <div className="flex flex-col gap-4 w-full max-w-[260px] font-sans">
                        <button onClick={handleOpenTome} className="w-full py-4 bg-[#4c1d95] hover:bg-[#5b21b6] text-white font-bold rounded-sm text-lg shadow-[0_0_20px_rgba(76,29,149,0.5)] transition-all duration-300 active:scale-95 border border-[#7c3aed] cursor-pointer tracking-widest uppercase">Open The Tome</button>
                        <button onClick={() => { SoundEngine.init(); SoundEngine.sfx.hitLight(); setGameState('skilltree'); }} className="w-full py-3 bg-[#1c1917]/90 hover:bg-[#292524] text-[#a78bfa] font-bold rounded-sm border border-[#4c1d95]/50 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider text-sm"><Network size={16} /> The Constellation</button>
                    </div>
                </div>
            )}

            {gameState === 'skilltree' && (
                <div className="absolute inset-0 bg-[#0c0a09]/95 backdrop-blur-md z-30 flex flex-col items-center pointer-events-auto">
                    <div className="w-full max-w-lg mx-auto h-screen flex flex-col relative">
                        <div className="p-6 border-b border-[#292524] bg-[#1c1917]/90 flex justify-between items-center z-10">
                            <div>
                                <h2 className="text-2xl font-black font-sans text-[#a78bfa] tracking-wider flex items-center gap-2"><Network /> Constellation</h2>
                                <p className="text-[10px] text-[#71717a] font-sans mt-1 uppercase tracking-widest">Ink written into the soul is permanent.</p>
                            </div>
                            <div className="text-right font-sans">
                                <div className="text-cyan-400 font-bold flex items-center gap-1 justify-end text-lg animate-pulse">{meta.dust} <Sparkles size={18} /></div>
                                <button onClick={() => { SoundEngine.sfx.hitLight(); setGameState('menu'); }} className="text-xs text-[#a1a1aa] hover:text-white underline mt-1 cursor-pointer">Return to Index</button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center gap-8 z-10 pb-20 font-sans">
                            {['VITALITY_1'].map(id => {
                                const skill = SKILLS[id]; const unlocked = meta.unlocks.includes(id); const purchasable = skill.req.every(reqId => meta.unlocks.includes(reqId)) && meta.dust >= skill.cost && !unlocked;
                                return (
                                    <div key={id} onClick={() => purchasable && buySkill(id)}
                                        className={`w-48 p-4 rounded-sm border-2 flex flex-col items-center justify-center text-center transition-all group ${unlocked ? 'border-amber-500/50 bg-[#78350f]/20 shadow-[0_0_15px_rgba(217,119,6,0.2)]' : purchasable ? 'border-[#8b5cf6] bg-[#4c1d95]/30 cursor-pointer hover:bg-[#4c1d95]/50' : 'border-[#27272a] bg-[#18181b] opacity-60'}`}>
                                        <div className="flex items-center gap-2 mb-2">
                                            {unlocked ? <Unlock size={14} className="text-amber-500" /> : <Lock size={14} className={purchasable ? 'text-[#c4b5fd]' : 'text-[#71717a]'} />}
                                            <span className={`font-black text-sm uppercase tracking-tighter ${unlocked ? 'text-amber-400' : purchasable ? 'text-[#ddd6fe]' : 'text-[#71717a]'}`}>{skill.name}</span>
                                        </div>
                                        <p className={`text-[10px] leading-relaxed ${unlocked ? 'text-amber-200/70' : 'text-[#a1a1aa]'}`}>{skill.desc}</p>
                                        {!unlocked && <div className={`mt-3 text-xs font-bold flex items-center gap-1 bg-black/60 px-3 py-1 rounded-full ${purchasable ? 'text-cyan-400' : 'text-[#52525b]'}`}><Sparkles size={12} /> {skill.cost} Dust</div>}
                                    </div>
                                );
                            })}
                            <div className="flex justify-center w-full relative h-4 -my-6"><ChevronDown className="text-[#3f3f46] absolute top-0 left-[30%]" /><ChevronDown className="text-[#3f3f46] absolute top-0 right-[30%]" /></div>
                            
                            <div className="flex gap-4 w-full justify-center">
                                {['CAPACITY_1', 'KNOWLEDGE_1'].map(id => {
                                    const skill = SKILLS[id]; const unlocked = meta.unlocks.includes(id); const visible = skill.req.every(reqId => meta.unlocks.includes(reqId)) || unlocked; const purchasable = visible && meta.dust >= skill.cost && !unlocked;
                                    if (!visible) return <div key={id} className="w-48 h-24 opacity-0 pointer-events-none" />;
                                    return (
                                        <div key={id} onClick={() => purchasable && buySkill(id)}
                                            className={`w-48 p-4 rounded-sm border-2 flex flex-col items-center justify-center text-center transition-all group ${unlocked ? 'border-amber-500/50 bg-[#78350f]/20 shadow-[0_0_15px_rgba(217,119,6,0.2)]' : purchasable ? 'border-[#8b5cf6] bg-[#4c1d95]/30 cursor-pointer hover:bg-[#4c1d95]/50' : 'border-[#27272a] bg-[#18181b] opacity-60'}`}>
                                            <div className="flex items-center gap-2 mb-2">
                                                {unlocked ? <Unlock size={14} className="text-amber-500" /> : <Lock size={14} className={purchasable ? 'text-[#c4b5fd]' : 'text-[#71717a]'} />}
                                                <span className={`font-black text-sm uppercase tracking-tighter ${unlocked ? 'text-amber-400' : purchasable ? 'text-[#ddd6fe]' : 'text-[#71717a]'}`}>{skill.name}</span>
                                            </div>
                                            <p className={`text-[10px] leading-relaxed ${unlocked ? 'text-amber-200/70' : 'text-[#a1a1aa]'}`}>{skill.desc}</p>
                                            {!unlocked && <div className={`mt-3 text-xs font-bold flex items-center gap-1 bg-black/60 px-3 py-1 rounded-full ${purchasable ? 'text-cyan-400' : 'text-[#52525b]'}`}><Sparkles size={12} /> {skill.cost} Dust</div>}
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="flex justify-center w-full relative h-4 -my-6"><ChevronDown className="text-[#3f3f46] absolute top-0 left-[25%]" /><ChevronDown className="text-[#3f3f46] absolute top-0 right-[25%]" /><ChevronDown className="text-[#3f3f46] absolute top-0 right-[10%]" /></div>

                            <div className="flex gap-2 w-full justify-center flex-wrap">
                                {['CAPACITY_2', 'SIPHON_1', 'KNOWLEDGE_2'].map(id => {
                                    const skill = SKILLS[id]; const unlocked = meta.unlocks.includes(id); const visible = skill.req.every(reqId => meta.unlocks.includes(reqId)) || unlocked; const purchasable = visible && meta.dust >= skill.cost && !unlocked;
                                    if (!visible) return <div key={id} className="flex-1 max-w-[140px] opacity-0 pointer-events-none" />;
                                    return (
                                        <div key={id} onClick={() => purchasable && buySkill(id)}
                                            className={`flex-1 max-w-[140px] p-3 rounded-sm border-2 flex flex-col items-center justify-center text-center transition-all group ${unlocked ? 'border-amber-500/50 bg-[#78350f]/20 shadow-[0_0_15px_rgba(217,119,6,0.2)]' : purchasable ? 'border-[#8b5cf6] bg-[#4c1d95]/30 cursor-pointer hover:bg-[#4c1d95]/50' : 'border-[#27272a] bg-[#18181b] opacity-60'}`}>
                                            <div className="flex items-center gap-1 mb-2">
                                                {unlocked ? <Unlock size={12} className="text-amber-500" /> : <Lock size={12} className={purchasable ? 'text-[#c4b5fd]' : 'text-[#71717a]'} />}
                                                <span className={`font-black text-[10px] uppercase tracking-tighter ${unlocked ? 'text-amber-400' : purchasable ? 'text-[#ddd6fe]' : 'text-[#71717a]'}`}>{skill.name}</span>
                                            </div>
                                            {!unlocked && <div className={`mt-1 text-[10px] font-bold flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded-full ${purchasable ? 'text-cyan-400' : 'text-[#52525b]'}`}><Sparkles size={10} /> {skill.cost}</div>}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {gameState === 'map' && (
                <div className="absolute inset-0 bg-[#0c0a09]/95 backdrop-blur-md z-30 flex flex-col items-center p-6 pointer-events-auto overflow-y-auto">
                    <div className="w-full max-w-md flex justify-between items-center mb-8 border-b border-[#292524] pb-4 font-sans">
                        <div className="flex items-center gap-2 font-bold text-[#a1a1aa] uppercase tracking-widest text-sm"><MapIcon size={18} /> The Atlas</div>
                        <div className="flex items-center gap-4">
                            <RelicBar />
                            <div className="flex items-center gap-1 text-green-500 text-sm font-bold bg-[#14532d]/30 px-2 py-1 rounded-sm"><Heart size={14}/> {player.hp}/{player.maxHp}</div>
                        </div>
                    </div>
                    
                    <h2 className="text-3xl font-black font-sans text-[#fafafa] mb-2 tracking-wide">Depth {mapLevel + 1}</h2>
                    <p className="text-[#a1a1aa] text-sm italic mb-10 text-center px-4">The library shifts around you. Reality feels thin here.</p>
                    
                    <div className="flex flex-col gap-5 w-full max-w-md font-sans">
                        {MAP_NODES[mapLevel].choices.map(node => (
                            <div key={node.id} onClick={() => handleNodeSelection(node)}
                                className={`p-5 rounded-sm border cursor-pointer transition-all hover:-translate-y-1 shadow-lg flex items-center justify-between
                                ${node.type === 'combat' ? 'bg-[#18181b] border-[#3f3f46] hover:border-[#60a5fa]' : 
                                  node.type === 'elite' ? 'bg-[#3b0764]/40 border-[#7e22ce] hover:border-[#c084fc] shadow-[0_0_20px_rgba(147,51,234,0.1)]' :
                                  node.type === 'boss' ? 'bg-[#7f1d1d]/40 border-[#b91c1c] hover:border-[#f87171] shadow-[0_0_30px_rgba(220,38,38,0.2)]' :
                                  'bg-[#78350f]/40 border-[#b45309] hover:border-[#fbbf24]'}`}>
                                <div>
                                    <h3 className="text-lg font-bold text-[#f4f4f5] font-serif">{node.name}</h3>
                                    <p className={`text-xs font-black uppercase tracking-widest mt-1 ${node.type === 'combat' ? 'text-[#a1a1aa]' : node.type === 'elite' ? 'text-[#c084fc]' : node.type === 'boss' ? 'text-[#f87171]' : 'text-[#fbbf24]'}`}>{node.type}</p>
                                </div>
                                <div>
                                    {node.type === 'combat' && <Swords className="text-[#71717a]" size={28} />}
                                    {node.type === 'elite' && <ShieldAlert className="text-[#a855f7]" size={28} />}
                                    {node.type === 'boss' && <Skull className="text-[#ef4444]" size={28} />}
                                    {node.type === 'campfire' && <Tent className="text-[#f59e0b]" size={28} />}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {gameState === 'campfire' && (
                <div className="absolute inset-0 bg-[#1c1917]/95 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 pointer-events-auto">
                    <Tent size={70} className="text-[#f59e0b] mb-6 drop-shadow-[0_0_20px_rgba(245,158,11,0.4)]" />
                    <h2 className="text-4xl font-black font-sans text-[#fef3c7] mb-4 tracking-tighter">The Bindery</h2>
                    <p className="text-[#d4d4d8] text-sm italic mb-12 max-w-sm text-center leading-relaxed">The ancient, blind Bookbinders offer their thread. Will you mend the damage, or expand the Grimoire's capacity for paradox?</p>
                    
                    <div className="flex gap-4 w-full max-w-md font-sans">
                        <button onClick={() => handleCampfire('heal')} className="flex-1 p-6 bg-[#0c0a09] border border-[#16a34a]/50 hover:bg-[#14532d] rounded-sm flex flex-col items-center gap-3 transition-colors cursor-pointer">
                            <Heart size={32} className="text-[#4ade80]" />
                            <span className="font-bold text-[#dcfce7] uppercase tracking-wider text-sm">Mend Pages</span>
                            <span className="text-xs text-[#4ade80]">Heal 20 HP</span>
                        </button>
                        <button onClick={() => handleCampfire('upgrade')} disabled={player.maxRunes >= 6} className="flex-1 p-6 bg-[#0c0a09] border border-[#9333ea]/50 hover:bg-[#3b0764] disabled:opacity-50 disabled:hover:bg-[#0c0a09] rounded-sm flex flex-col items-center gap-3 transition-colors cursor-pointer">
                            <Plus size={32} className="text-[#c084fc]" />
                            <span className="font-bold text-[#f3e8ff] uppercase tracking-wider text-sm">Expand Binding</span>
                            <span className="text-xs text-[#c084fc]">Max Syntax +1</span>
                        </button>
                    </div>
                </div>
            )}

            {gameState === 'reward' && (
                <div className="absolute inset-0 bg-[#0c0a09]/95 backdrop-blur-md z-30 flex flex-col items-center justify-center text-center p-6 pointer-events-auto">
                    <h1 className="text-4xl font-black font-sans text-[#c084fc] mb-2 tracking-tighter drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">Paradox Resolved</h1>
                    <p className="text-[#a1a1aa] text-sm italic mb-10">Draft a new syllable into your pages.</p>
                    
                    <div className="flex gap-4 justify-center w-full max-w-md mb-10">
                        {rewardOptions.runes.map(rune => (
                            <RuneCard key={rune.id} rune={rune} onClick={() => claimRuneReward(rune)} />
                        ))}
                    </div>

                    {rewardOptions.relic && (
                        <div className="w-full max-w-md border-t border-[#292524] pt-8 animate-in fade-in slide-in-from-bottom-4">
                            <p className="text-[#71717a] mb-4 text-xs font-bold font-sans uppercase tracking-widest">Artifact Recovered</p>
                            <button onClick={() => claimRelicReward(rewardOptions.relic)} className="w-full p-4 bg-[#18181b] hover:bg-[#27272a] border border-[#ca8a04]/50 rounded-sm flex items-center gap-4 transition-colors text-left cursor-pointer">
                                <div className={`p-3 rounded-sm bg-[#0c0a09] ${rewardOptions.relic.color} border border-[#3f3f46]`}>
                                    {React.createElement(rewardOptions.relic.icon, { size: 24 })}
                                </div>
                                <div className="font-sans">
                                    <p className={`font-black text-sm uppercase tracking-wide ${rewardOptions.relic.color}`}>{rewardOptions.relic.name}</p>
                                    <p className="text-xs text-[#a1a1aa] mt-1 leading-relaxed">{rewardOptions.relic.desc}</p>
                                </div>
                            </button>
                        </div>
                    )}
                </div>
            )}

            {(gameState === 'gameover' || gameState === 'victory') && (
                <div className="absolute inset-0 bg-black/95 backdrop-blur-md z-30 flex flex-col items-center justify-center text-center p-8 pointer-events-auto">
                    {gameState === 'victory' ? <Sun size={90} className="text-[#facc15] mb-6 drop-shadow-[0_0_30px_rgba(250,204,21,0.5)] animate-[spin_10s_linear_infinite]" /> : <Skull size={80} className="text-[#dc2626] mb-6 drop-shadow-[0_0_30px_rgba(220,38,38,0.5)] animate-pulse" />}
                    
                    <h1 className={`text-6xl font-black font-sans mb-4 tracking-tighter animate-in zoom-in ${gameState === 'victory' ? 'text-[#facc15]' : 'text-[#ef4444]'}`}>
                        {gameState === 'victory' ? 'ABYSS SEALED' : 'LIGHT FADES'}
                    </h1>
                    
                    <p className="text-[#a1a1aa] mb-10 text-sm italic max-w-md leading-relaxed">
                        {gameState === 'victory' ? "You draft a sequence so mathematically sublime, it overwrites the Cacophony. But you remain bound to the Grimoire, waiting in the dark for the next typo in reality." : "You forget the word for 'light', then 'self', then 'pain'. But the Grimoire remembers. It begins to write you again."}
                    </p>

                    <div className="bg-[#18181b] border border-[#27272a] p-5 rounded-sm w-full max-w-xs mb-8 shadow-2xl font-sans">
                        <p className="text-xs uppercase tracking-widest mb-2 font-bold text-[#71717a]">Dust Extracted</p>
                        <p className="text-4xl font-black text-cyan-400 flex items-center justify-center gap-2">
                            +{runDust} <Sparkles className="text-cyan-500 animate-pulse" />
                        </p>
                    </div>

                    <button onClick={() => setGameState('menu')} className="px-10 py-4 font-black font-sans uppercase tracking-widest text-sm rounded-sm transition-colors active:scale-95 bg-[#27272a] text-[#f4f4f5] hover:bg-[#3f3f46] border border-[#52525b] cursor-pointer">Return to Void</button>
                </div>
            )}

            {/* COMBAT UI */}
            {gameState === 'combat' && (
                <div className="w-full max-w-md mx-auto h-screen flex flex-col relative z-20 pointer-events-none">
                    <div className="px-5 py-4 flex justify-between items-center bg-gradient-to-b from-[#0c0a09] to-transparent pointer-events-auto">
                        <RelicBar />
                        <div className="flex items-center gap-2 text-[#a1a1aa] font-bold font-sans text-xs uppercase tracking-widest bg-[#18181b]/80 backdrop-blur-sm px-3 py-1 rounded-sm border border-[#27272a]">Depth {mapLevel + 1}</div>
                    </div>

                    <div className="flex-1 relative flex flex-col justify-between">
                        <div className="absolute top-0 left-4 right-4 h-24 overflow-hidden text-[11px] text-[#a1a1aa] font-sans flex flex-col-reverse gap-1 opacity-80 pointer-events-none mask-image-linear-top z-20">
                            {combatLog.map((log, i) => (<div key={i + log} className="animate-in fade-in slide-in-from-left-2">{log}</div>))}
                        </div>

                        <div className="absolute bottom-8 left-0 right-0 flex justify-between px-6 items-end font-sans">
                            <div className="flex flex-col items-center w-28 pointer-events-auto">
                                {player.shield > 0 && (
                                    <div className="absolute -top-10 flex items-center text-blue-300 font-black animate-in zoom-in bg-[#1e3a8a]/90 px-3 py-1 rounded-full border border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                                        <Shield size={14} className="mr-1" /> {player.shield}
                                    </div>
                                )}
                                <span className="text-[10px] font-bold tracking-widest text-[#a1a1aa] mb-1 uppercase bg-[#0c0a09]/80 px-2 rounded-sm backdrop-blur-sm">Scribe</span>
                                <div className="w-full h-2 bg-[#18181b] border border-[#3f3f46] rounded-sm relative overflow-hidden">
                                    <div className="h-full bg-[#16a34a] transition-all duration-300" style={{ width: `${(player.hp / player.maxHp) * 100}%` }} />
                                </div>
                                <span className="text-[10px] font-black mt-1 text-[#d4d4d8]">{player.hp}/{player.maxHp}</span>
                            </div>

                            <div className="flex flex-col items-center pointer-events-auto pb-4">
                                <span className="text-xs font-black text-[#d4d4d8] bg-[#18181b]/90 backdrop-blur-md px-3 py-1 rounded-sm border border-[#3f3f46] shadow-lg">{drawPile.length} | {discardPile.length}</span>
                            </div>

                            {enemy && (
                                <div className="flex flex-col items-center w-32 pointer-events-auto">
                                    {/* ENEMY INTENT UI */}
                                    <div className={`absolute -top-12 flex gap-1 transition-opacity duration-300 ${isProcessing ? 'opacity-0' : 'opacity-100 animate-bounce'}`}>
                                        {(() => {
                                            const intent = enemy.intents[enemy.turn % enemy.intents.length];
                                            const styling = INTENT_TYPES[intent.type];
                                            return (
                                                <span className={`${styling.bg}/90 px-3 py-1 rounded-full text-[11px] font-black ${styling.color} border border-current shadow-[0_0_10px_currentColor]`}>
                                                    {styling.icon} {intent.val > 0 ? intent.val : intent.desc}
                                                </span>
                                            );
                                        })()}
                                    </div>

                                    {enemy.shield > 0 && (
                                        <div className="absolute -top-20 flex items-center text-blue-300 font-black animate-in zoom-in bg-[#1e3a8a]/90 px-3 py-1 rounded-full border border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                                            <Shield size={14} className="mr-1" /> {enemy.shield}
                                        </div>
                                    )}

                                    <div className="absolute -top-24 flex gap-1">
                                        {enemy.statuses.burn > 0 && <span className="bg-[#78350f]/90 px-2 py-0.5 rounded-sm text-[9px] font-bold text-[#fb923c] border border-[#f97316]/50">🔥 {enemy.statuses.burn}</span>}
                                        {enemy.statuses.frostbite > 0 && <span className="bg-[#1e3a8a]/90 px-2 py-0.5 rounded-sm text-[9px] font-bold text-[#60a5fa] border border-[#3b82f6]/50">❄️ {enemy.statuses.frostbite}</span>}
                                    </div>
                                    <span className={`text-[10px] font-bold tracking-widest mb-1 uppercase truncate w-full text-center bg-[#0c0a09]/80 px-2 rounded-sm backdrop-blur-sm ${enemy.iconColor}`}>
                                        {enemy.isElite ? '⭐ ' : ''}{enemy.name}
                                    </span>
                                    <div className="w-full h-2 bg-[#18181b] border border-[#3f3f46] rounded-sm relative overflow-hidden">
                                        <div className="h-full bg-[#dc2626] transition-all duration-300" style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }} />
                                    </div>
                                    <span className="text-[10px] font-black mt-1 text-[#d4d4d8]">{enemy.hp}/{enemy.maxHp}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className={`bg-[#1c1917]/95 backdrop-blur-xl border-t border-[#3f3f46] p-4 flex flex-col gap-4 shadow-[0_-10px_40px_rgba(0,0,0,0.8)] z-20 transition-transform duration-500 pointer-events-auto ${isProcessing ? 'translate-y-4 opacity-50 pointer-events-none' : ''}`}>
                        
                        <div className="flex flex-col items-center min-h-[44px] justify-center font-sans">
                            {!currentSpellPrediction && draft.length === 0 ? (
                                <span className="text-[#a1a1aa] font-mono tracking-widest uppercase text-[9px] font-bold bg-[#0c0a09]/60 px-4 py-2 rounded-sm border border-[#27272a]">
                                    Exact syntax required. Beware Dissonance.
                                </span>
                            ) : currentSpellPrediction && currentSpellPrediction.isCollapse ? (
                                <div className="flex flex-col items-center animate-in fade-in zoom-in duration-200 bg-[#7f1d1d]/80 w-full py-2 rounded-sm border border-[#ef4444] shadow-[0_0_15px_rgba(220,38,38,0.2)]">
                                    <span className="text-[11px] font-black tracking-widest uppercase text-[#fca5a5] flex items-center gap-1">
                                        <AlertTriangle size={14} /> {currentSpellPrediction.name}
                                    </span>
                                    <span className="text-[10px] font-bold mt-1 text-[#f87171]">Take {currentSpellPrediction.selfDmg} Self-Damage</span>
                                </div>
                            ) : currentSpellPrediction ? (
                                <div className="flex flex-col items-center animate-in fade-in zoom-in duration-200 bg-[#0c0a09]/60 w-full py-2 rounded-sm border border-[#27272a] shadow-inner">
                                    <span className={`text-[11px] font-black tracking-widest uppercase text-center px-2 font-serif ${currentSpellPrediction.color} drop-shadow-[0_0_5px_currentColor]`}>
                                        {currentSpellPrediction.name}
                                    </span>
                                    <div className="flex flex-wrap justify-center gap-4 text-[10px] font-bold mt-1.5 text-[#e5e5e5] px-2">
                                        {currentSpellPrediction.dmg > 0 && <span>⚔️ {currentSpellPrediction.dmg}</span>}
                                        {currentSpellPrediction.def > 0 && <span className="text-blue-300">🛡️ {currentSpellPrediction.def}</span>}
                                        {currentSpellPrediction.heal > 0 && <span className="text-green-400">💚 {currentSpellPrediction.heal}</span>}
                                        {currentSpellPrediction.burn > 0 && <span className="text-orange-400">🔥 {currentSpellPrediction.burn}</span>}
                                        {currentSpellPrediction.frostbite > 0 && <span className="text-cyan-300">❄️ {currentSpellPrediction.frostbite}</span>}
                                        {currentSpellPrediction.selfDmg > 0 && <span className="text-red-500">🩸 -{currentSpellPrediction.selfDmg}</span>}
                                    </div>
                                </div>
                            ) : null}
                        </div>

                        <div className="flex justify-center gap-3">
                            {[...Array(player.maxRunes)].map((_, i) => (
                                <div key={i} onClick={() => draft[i] && removeFromDraft(i)}
                                    className={`w-14 h-20 rounded-sm border transition-all duration-300 flex items-center justify-center
                                    ${draft[i] ? 'border-[#a855f7] bg-[#4c1d95]/40 cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:-translate-y-1' 
                                               : 'border-[#3f3f46]/60 bg-[#0c0a09]/50 shadow-inner'}`}>
                                    {draft[i] && <RuneCard rune={draft[i]} minimal inDraft />}
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-center gap-3 mt-1 font-sans">
                            <button onClick={() => executeCombatRound(draft)} disabled={draft.length === 0 || isProcessing}
                                className={`flex-1 py-3 text-white font-black text-xs uppercase tracking-widest rounded-sm transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 max-w-[200px] border cursor-pointer
                                    ${currentSpellPrediction && currentSpellPrediction.isCollapse ? 'bg-[#b91c1c] hover:bg-[#dc2626] border-[#f87171] shadow-[0_0_15px_rgba(220,38,38,0.4)]' : 'bg-[#5b21b6] hover:bg-[#6d28d9] border-[#a855f7] shadow-[0_0_15px_rgba(147,51,234,0.4)]'}
                                    disabled:bg-[#27272a] disabled:text-[#71717a] disabled:border-[#3f3f46] disabled:shadow-none`}>
                                {currentSpellPrediction && currentSpellPrediction.isCollapse ? (<><AlertTriangle size={16} /> Collapse</>) : (<><Flame size={16} className={draft.length > 0 ? 'animate-pulse text-yellow-300' : ''} /> {isProcessing ? 'Invoking...' : 'Cast Spell'}</>)}
                            </button>
                            <button onClick={() => { setDraft([]); setHand([...hand, ...draft]); }} disabled={isProcessing || draft.length === 0}
                                className="px-4 py-3 bg-[#18181b] hover:bg-[#27272a] disabled:opacity-50 text-[#d4d4d8] rounded-sm shadow-md transition-all duration-200 active:scale-95 flex items-center justify-center border border-[#3f3f46] cursor-pointer" title="Clear Draft (Hold B)">
                                <RotateCcw size={16} />
                            </button>
                            <button onClick={() => executeCombatRound([])} disabled={isProcessing}
                                className="px-4 py-3 bg-[#18181b] hover:bg-[#27272a] disabled:opacity-50 text-[#d4d4d8] font-black text-xs uppercase tracking-widest rounded-sm shadow-md transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 border border-[#3f3f46] cursor-pointer" title="Pass Turn">
                                <Clock size={16} /> End
                            </button>
                        </div>

                        <div className="flex justify-center gap-3 overflow-x-auto pb-2 mt-2 min-h-[120px] px-2 snap-x hide-scrollbar">
                            {hand.map((rune, index) => (
                                <div key={rune.instanceId} className="snap-center animate-in slide-in-from-bottom-8 fade-in" style={{animationDelay: `${index * 50}ms`, animationFillMode: 'backwards'}}>
                                    <RuneCard rune={rune} onClick={() => addToDraft(rune)} disabled={draft.length >= player.maxRunes || isProcessing} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            
            <style dangerouslySetInnerHTML={{__html: `
                @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;900&family=Inter:wght@400;700;900&display=swap');
                body { font-family: 'Cinzel', serif; background-color: #000; }
                .font-sans { font-family: 'Inter', sans-serif; }
                .font-serif { font-family: 'Cinzel', serif; }
                .mask-image-linear-top { mask-image: linear-gradient(to bottom, black 50%, transparent 100%); -webkit-mask-image: linear-gradient(to bottom, black 50%, transparent 100%); }
                .card-hover-physics { transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1); }
                .card-hover-physics:hover { transform: translateY(-8px) scale(1.05); }
                .card-hover-physics:active { transform: translateY(2px) scale(0.95); }
                .hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                .fct-anim { animation: float-up-fade 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                @keyframes float-up-fade { 0% { opacity: 0; transform: translate(-50%, 20px) scale(0.5); } 15% { opacity: 1; transform: translate(-50%, -10px) scale(1.3); } 30% { transform: translate(-50%, -15px) scale(1); } 100% { opacity: 0; transform: translate(-50%, -80px) scale(1); } }
            `}} />
        </div>
    );
}