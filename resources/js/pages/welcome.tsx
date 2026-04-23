import { Head } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface HeartParticle { id: number; x: number; size: number; duration: number; delay: number; emoji: string; }
interface Star { id: number; x: number; y: number; size: number; delay: number; duration: number; }
interface ConfettiPiece { id: number; x: number; size: number; duration: number; delay: number; color: string; emoji: string; }
interface Sparkle { id: number; x: number; y: number; emoji: string; }
type Screen = 'password' | 'name_input' | 'intro' | 'main' | 'final' | 'surprise' | 'final_question';

// ─── Constants ────────────────────────────────────────────────────────────────
const CORRECT_PASSWORD = "LOVE";
const WHATSAPP_NUMBER = "254798400918";
const EMOJIS = ['❤️', '🌸', '✨', '💕', '🌹', '💫', '🦋'];
const CONFETTI_COLORS = ['#f43f5e', '#fb7185', '#fda4af', '#fff1f2', '#ec4899'];

// ─── Typewriter hook ──────────────────────────────────────────────────────────
// Uses textIndex state so that setState is ONLY ever called inside the interval
// callback or the cleanup function — never synchronously in the effect body.
function useTypewriter(text: string, speed = 55, active = true, onComplete?: () => void) {
    const [textIndex, setTextIndex] = useState(0);
    const onCompleteRef = useRef(onComplete);

    // Keep the callback ref fresh without re-running the main effect
    useEffect(() => {
        onCompleteRef.current = onComplete;
    });

    useEffect(() => {
        if (!active) return;

        const t = setInterval(() => {
            setTextIndex((i) => {
                const next = i + 1;
                if (next >= text.length) {
                    clearInterval(t);
                    onCompleteRef.current?.();
                }
                return next;
            });
        }, speed);

        // Cleanup: clear interval and reset index for next activation
        return () => {
            clearInterval(t);
            setTextIndex(0);
        };
    }, [text, speed, active]);

    const displayed = active ? text.slice(0, textIndex) : '';
    const done = active && textIndex >= text.length;

    return { displayed, done };
}

const CHAPTER_TEXTS: Record<number, { title: string, text: string }> = {
    1: { 
        title: "The Beginning", 
        text: "I still remember the first moment I saw you. Everything else seemed to blur, and in that instant, I knew my life was about to change. You weren't just a face in the crowd; you were the missing piece I hadn't even realized was gone. That day, my world finally started to make sense." 
    },
    2: { 
        title: "The Strength", 
        text: "The road hasn't always been smooth. We've faced storms that tried to pull us apart, moments where words were hard and silence was heavy. But every time, we chose each other. We learned that hardship isn't an ending, but the fire that tempers our bond into something unbreakable. Together, we can overcome anything." 
    },
    3: { 
        title: "Our Forever", 
        text: "I look at you and I see all my tomorrows. I see a home built on laughter, a life filled with quiet morning coffees and grand adventures. Whatever comes our way, I know that as long as I have your hand in mine, we've already won our happily ever after. You are my home." 
    }
};

const POLAROIDS = [
    { id: 1, src: '/images/polaroid_1.png', rotation: '-6deg' },
    { id: 2, src: '/images/polaroid_2.png', rotation: '4deg' },
    { id: 3, src: '/images/polaroid_3.png', rotation: '-2deg' },
];

const PARA_GRIEF =
    `It is hard to turn a page when you know someone won't be in the next chapter. Their absence is a hollow space in your heart — a silence that lingers where laughter once lived. Grief isn't just sadness; it is love that has nowhere to go, a longing that time can't erase. You find them in familiar songs, in places you wish you had shared, and in the habits they left behind. The world moves forward, yet a part of you stays frozen in the past. Turning the page does not mean forgetting — it means carrying them with you in the lessons they taught, the love they gave, and the strength they left behind.`;

const PARA_LOVE_BETTER = (name: string) => 
    `If only you knew, ${name}, how many nights I have stayed up thinking of how to love you better — not changing who I am, but just trimming the parts that could hurt you. I am learning your language and I am learning my bad habits. I want to be a place of peace for you. I want to show up as the most patient, present, and honest version of me. You deserve a love that does not make you guess, and a partner who keeps getting better at loving you. I am trying — because you are worth trying for, every single day.`;

const PARA_TRANSITION = 
    `I know where we left things... and I know it wasn't always as perfect as it should have been. But since I can't be there in person right now to express everything in my heart, I created this short story for you. Please, take your time with it. I hope you can feel the love I poured into every part of this journey, and I truly hope you love it.`;

const FINAL_MESSAGE = (name: string) => 
    `You know, ${name}, I may not tell you this every day — but I truly cherish what we have. I never want to lose this bond. It's always been you, babe — and it will always be you.\n\nMy hope and my prayer is that at the end of our lives, we'll look at each other and know this was worth it. That you'll say I helped you become the most authentic version of yourself… and that, even then, I'm still your favorite person. ❤️`;

// ─── Sub-components ───────────────────────────────────────────────────────────
function StarField({ stars, mousePos }: { stars: Star[], mousePos: { x: number, y: number } }) {
    return (
        <div className="absolute inset-0 pointer-events-none transition-transform duration-1000 ease-out" style={{ transform: `translate(${mousePos.x * 20}px, ${mousePos.y * 20}px)` }}>
            {stars.map((s) => (
                <div key={s.id} className="absolute rounded-full bg-white" style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size, animation: `twinkle ${s.duration}s ease-in-out ${s.delay}s infinite` }} />
            ))}
        </div>
    );
}

function FloatingHearts({ hearts, mousePos }: { hearts: HeartParticle[], mousePos: { x: number, y: number } }) {
    return (
        <div className="absolute inset-0 pointer-events-none transition-transform duration-700 ease-out" style={{ transform: `translate(${mousePos.x * 40}px, ${mousePos.y * 40}px)` }}>
            {hearts.map((h) => (
                <span key={h.id} className="heart-float" style={{ left: `${h.x}%`, fontSize: `${h.size}px`, animationDuration: `${h.duration}s`, animationDelay: `${h.delay}s` }}>{h.emoji}</span>
            ))}
        </div>
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Welcome() {
    const [screen, setScreen] = useState<Screen>('password');
    const [visible, setVisible] = useState(true);
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [passError, setPassError] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    
    // Use initializer functions for state that depends on randomness or heavy calculation
    // This avoids the 'setState in effect' lint warning
    const [hearts] = useState<HeartParticle[]>(() => 
        Array.from({ length: 25 }, (_, i) => ({ 
            id: i, 
            x: Math.random() * 100, 
            size: Math.random() * 18 + 11, 
            duration: Math.random() * 9 + 8, 
            delay: Math.random() * 12, 
            emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)] 
        }))
    );

    const [stars] = useState<Star[]>(() => 
        Array.from({ length: 80 }, (_, i) => ({ 
            id: i, 
            x: Math.random() * 100, 
            y: Math.random() * 100, 
            size: Math.random() * 2 + 1, 
            delay: Math.random() * 5, 
            duration: Math.random() * 3 + 2 
        }))
    );

    const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
    const [sparkles, setSparkles] = useState<Sparkle[]>([]);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [para1In, setPara1In] = useState(false);
    const [para2In, setPara2In] = useState(false);
    
    const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
    const [chaptersRead, setChaptersRead] = useState<Set<number>>(new Set());
    const [userThoughts, setUserThoughts] = useState('');
    
    const audioRef = useRef<HTMLAudioElement>(null);

    // Mouse Move Tracking for Parallax
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const x = (e.clientX / window.innerWidth) - 0.5;
            const y = (e.clientY / window.innerHeight) - 0.5;
            setMousePos({ x, y });
            if (Math.random() > 0.85) {
                const id = Date.now();
                setSparkles(prev => [...prev.slice(-15), { id, x: e.clientX, y: e.clientY, emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)] }]);
                setTimeout(() => setSparkles(prev => prev.filter(s => s.id !== id)), 800);
            }
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // Hooks for typewriter text
    const introCombinedText = `Hello ${userName}, hope you are good today ❤️\n\nI know where we left things... and I know it wasn't always as perfect as it should have been. But since I can't be there in person right now to express everything in my heart, I created this short story for you. Please, take your time with it. I hope you can feel the love I poured into every part of this journey, and I truly hope you love it.`;
    const { displayed: introText, done: introDone } = useTypewriter(introCombinedText, 45, screen === 'intro');
    const { displayed: finalText, done: finalDone } = useTypewriter(FINAL_MESSAGE(userName), 45, screen === 'final');

    // Stagger main paragraphs
    useEffect(() => {
        if (screen !== 'main') return;
        const t1 = setTimeout(() => setPara1In(true), 400);
        const t2 = setTimeout(() => setPara2In(true), 1500);
        return () => { clearTimeout(t1); clearTimeout(t2); };
    }, [screen]);

    const goTo = useCallback((next: Screen) => {
        setVisible(false);
        setTimeout(() => { setScreen(next); setVisible(true); }, 500);
    }, []);

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password.toUpperCase() === CORRECT_PASSWORD) {
            audioRef.current?.play()
                .then(() => console.log("Audio started on interaction"))
                .catch((e) => console.error("Initial audio play failed:", e));
            if (audioRef.current) audioRef.current.volume = 0.35;
            goTo('name_input');
        } else { setPassError(true); setTimeout(() => setPassError(false), 1000); }
    };

    const handleNameSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (userName.trim()) goTo('intro');
    };

    const startJourney = () => {
        audioRef.current?.play().catch(() => {});
        if (audioRef.current) audioRef.current.volume = 0.35;
        goTo('main');
    };

    const triggerSurprise = () => {
        setConfetti(Array.from({ length: 120 }, (_, i) => ({ id: i, x: Math.random() * 100, size: Math.random() * 20 + 10, duration: Math.random() * 3 + 2, delay: Math.random() * 2, color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)], emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)] })));
        goTo('surprise');
    };

    const openChapter = (id: number) => {
        setSelectedChapter(id);
        setChaptersRead(prev => new Set(prev).add(id));
    };

    const sendToWhatsApp = () => {
        const message = `Hey, it's ${userName}! ❤️\n\nWhat I think about our love:\n"${userThoughts}"\n\nDo I want us to continue? YES, forever and always!`;
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
    };

    const toggleMute = () => {
        if (!audioRef.current) return;
        audioRef.current.muted = !audioRef.current.muted;
        setIsMuted(m => !m);
    };

    const serif = { fontFamily: "'Cormorant Garamond', serif" };
    const sans = { fontFamily: "'Inter', sans-serif" };

    return (
        <>
            <Head title="For You ❤️">
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Inter:wght@300;400;500&display=swap" rel="stylesheet" />
            </Head>

            <audio ref={audioRef} loop preload="auto">
                <source src="/music.mp3" type="audio/mpeg" />
            </audio>

            {/* Background with Parallax */}
            <div className="fixed inset-0 overflow-hidden" style={{ background: 'radial-gradient(ellipse at 30% 20%, #2d0018 0%, #0e0009 68%, #050005 100%)' }}>
                <StarField stars={stars} mousePos={mousePos} />
                <FloatingHearts hearts={hearts} mousePos={mousePos} />
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full blur-[120px] bg-rose-900/10 pointer-events-none transition-transform duration-1000 ease-out" style={{ transform: `translate(${mousePos.x * -30}px, ${mousePos.y * -30}px)` }} />
                <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[100px] bg-purple-900/10 pointer-events-none transition-transform duration-1000 ease-out" style={{ transform: `translate(${mousePos.x * -50}px, ${mousePos.y * -50}px)` }} />
            </div>

            {/* Sparkle Trail */}
            {sparkles.map(s => <div key={s.id} className="sparkle" style={{ left: s.x, top: s.y }}>{s.emoji}</div>)}

            {/* Confetti */}
            {screen === 'surprise' && confetti.map(c => <div key={c.id} className="confetti text-2xl" style={{ left: `${c.x}%`, animationDuration: `${c.duration}s`, animationDelay: `${c.delay}s` }}>{c.emoji}</div>)}

            {/* Controls */}
            {['intro', 'main', 'final', 'surprise', 'final_question'].includes(screen) && (
                <button onClick={toggleMute} className="fixed top-6 right-6 z-50 w-12 h-12 rounded-full glass-input flex items-center justify-center text-xl transition-transform hover:scale-110">
                    {isMuted ? '🔇' : '🎵'}
                </button>
            )}

            {/* Chapter Modal */}
            {selectedChapter && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-6 fade-in-up">
                    <div className="glass-card max-w-lg w-full text-center relative">
                        <button onClick={() => setSelectedChapter(null)} className="absolute top-4 right-4 text-rose-400 text-xl hover:scale-110">✕</button>
                        <h3 className="text-3xl text-rose-200 mb-6" style={serif}>{CHAPTER_TEXTS[selectedChapter].title}</h3>
                        <p className="text-xl text-rose-100/90 leading-relaxed italic mb-8" style={serif}>{CHAPTER_TEXTS[selectedChapter].text}</p>
                        <button onClick={() => setSelectedChapter(null)} className="text-rose-400 text-xs tracking-[0.3em] uppercase">I've read this ❤️</button>
                    </div>
                </div>
            )}

            <div className="relative z-10 min-h-screen w-full flex flex-col items-center justify-center px-4 py-12 md:py-20 transition-opacity duration-500" style={{ opacity: visible ? 1 : 0 }}>
                
                {/* ── Screen: Password ── */}
                {screen === 'password' && (
                    <div className="max-w-md w-full px-6 text-center">
                        <div className="glass-card">
                            <h2 className="text-rose-200 text-sm tracking-[0.4em] uppercase mb-8" style={sans}>Enter the Secret Code</h2>
                            <form onSubmit={handlePasswordSubmit}>
                                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={`w-full glass-input py-4 px-6 rounded-xl text-center text-white text-xl tracking-[0.5em] mb-4 ${passError ? 'border-rose-500' : ''}`} placeholder="••••" autoFocus />
                                {passError && <p className="text-rose-400 text-xs tracking-widest mt-2 animate-bounce">Incorrect code, try again...</p>}
                                <p className="text-rose-200/30 text-[10px] mt-6 tracking-widest uppercase italic">Hint: What drives this journey?</p>
                            </form>
                        </div>
                    </div>
                )}

                {/* ── Screen: Name Input ── */}
                {screen === 'name_input' && (
                    <div className="max-w-md w-full px-6 text-center">
                        <div className="glass-card">
                            <h2 className="text-rose-200 text-sm tracking-[0.4em] uppercase mb-8" style={sans}>Who are you?</h2>
                            <form onSubmit={handleNameSubmit}>
                                <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} className="w-full glass-input py-4 px-6 rounded-xl text-center text-white text-2xl mb-6" placeholder="Your Name" autoFocus />
                                <button type="submit" className="text-rose-400 text-xs tracking-[0.3em] uppercase hover:text-rose-200 transition-colors">Confirm</button>
                            </form>
                        </div>
                    </div>
                )}

                {/* ── Screen: Intro ── */}
                {screen === 'intro' && (
                    <div className="max-w-2xl w-full px-6 text-center">
                        <div className="glass-card">
                            <div className="mb-12 min-h-[120px]" style={serif}>
                                {introText.split('\n').map((line, i) => <p key={i} className={`${i === 0 ? 'text-4xl text-rose-100' : 'text-2xl text-rose-200/70 italic'} mb-4 leading-relaxed`}>{line}</p>)}
                                {!introDone && <span className="cursor-blink text-rose-500 text-2xl">|</span>}
                            </div>
                            {introDone && <button onClick={startJourney} className="btn-glow px-12 py-4 bg-rose-600 rounded-full text-white tracking-[0.2em] uppercase text-xs hover:bg-rose-500 transition-all scale-up-center">Begin the Journey</button>}
                        </div>
                    </div>
                )}

                {/* ── Screen: Main ── */}
                {screen === 'main' && (
                    <div className="max-w-4xl w-full px-6 py-20 flex flex-col items-center">
                        {/* Swapped: Paragraph 1 is now the Grief/Absence text */}
                        <div className={`glass-card transition-all duration-1000 ${para1In ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                            <p className="text-2xl md:text-3xl text-rose-100 leading-relaxed italic text-center" style={serif}>{PARA_GRIEF}</p>
                        </div>

                        {/* Timeline */}
                        <div className={`my-16 flex flex-col items-center gap-4 transition-all duration-1000 delay-500 ${para2In ? 'opacity-100' : 'opacity-0'}`}>
                            <div className="timeline-dot" />
                            <div className="h-24 w-px bg-gradient-to-b from-rose-500 to-transparent" />
                        </div>

                        {/* Paragraph 2 is now the Love Better text */}
                        <div className={`glass-card transition-all duration-1000 delay-700 ${para2In ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                            <p className="text-2xl md:text-3xl text-rose-200/80 leading-relaxed italic text-center" style={serif}>{PARA_LOVE_BETTER(userName)}</p>
                            <div className="mt-16 flex justify-center"><button onClick={() => goTo('final')} className="glass-input px-8 py-3 rounded-full text-rose-200 text-[10px] tracking-[0.3em] uppercase hover:bg-rose-900/20">Continue Story</button></div>
                        </div>
                    </div>
                )}

                {/* ── Screen: Final ── */}
                {screen === 'final' && (
                    <div className="max-w-3xl w-full px-6 text-center">
                        <div className="glass-card">
                            <div className="mb-12 text-rose-100 text-2xl md:text-3xl leading-relaxed whitespace-pre-wrap" style={serif}>{finalText}{!finalDone && <span className="cursor-blink text-rose-500">|</span>}</div>
                            {finalDone && <div className="fade-in-up mt-12"><button onClick={triggerSurprise} className="btn-glow px-10 py-4 bg-gradient-to-r from-rose-600 to-purple-600 rounded-full text-white text-xs tracking-[0.3em] uppercase">Open Surprise ❤️</button></div>}
                        </div>
                    </div>
                )}

                {/* ── Screen: Surprise (Chapters) ── */}
                {screen === 'surprise' && (
                    <div className="max-w-5xl w-full px-6 py-20 text-center flex flex-col items-center">
                        <div className="glass-card mb-20 w-full">
                            <h1 className="text-6xl md:text-8xl mb-8 animate-bounce">🎊</h1>
                            <h2 className="text-4xl md:text-6xl text-rose-100 mb-6" style={serif}>Our Story, Chapter by Chapter</h2>
                            <p className="text-rose-200/70 text-lg tracking-[0.2em] uppercase" style={sans}>Click each polaroid to relive our memories</p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-12 mt-10">
                            {POLAROIDS.map((p, i) => (
                                <div key={p.id} onClick={() => openChapter(p.id)} className={`polaroid w-64 md:w-80 fade-in-up ${chaptersRead.has(p.id) ? 'grayscale-[0.5]' : ''}`} style={{ '--rotation': p.rotation, transitionDelay: `${i * 200}ms` } as any}>
                                    <img src={p.src} alt={`Polaroid ${p.id}`} />
                                    <p className="mt-4 text-gray-800 text-xl" style={serif}>Chapter {p.id}</p>
                                    {chaptersRead.has(p.id) && <span className="absolute top-2 right-2 text-rose-500">❤️</span>}
                                </div>
                            ))}
                        </div>
                        {chaptersRead.size === 3 && (
                            <div className="mt-24 fade-in-up">
                                <button onClick={() => goTo('final_question')} className="btn-glow px-12 py-5 bg-gradient-to-r from-rose-600 to-rose-400 rounded-full text-white text-sm tracking-[0.3em] uppercase font-bold">The Second Surprise ✨</button>
                            </div>
                        )}
                    </div>
                )}

                {/* ── Screen: Final Question (WhatsApp) ── */}
                {screen === 'final_question' && (
                    <div className="max-w-2xl w-full px-6 text-center">
                        <div className="glass-card">
                            <h2 className="text-4xl text-rose-100 mb-8" style={serif}>Our Love...</h2>
                            <p className="text-xl text-rose-200/80 mb-10 italic" style={serif}>What do you think about our love, babe? And do you want us to continue this beautiful journey forever?</p>
                            <textarea 
                                value={userThoughts}
                                onChange={(e) => setUserThoughts(e.target.value)}
                                className="w-full glass-input h-40 py-4 px-6 rounded-xl text-white text-lg italic mb-8"
                                placeholder="Write your heart out here..."
                                style={serif}
                            />
                            <button 
                                onClick={sendToWhatsApp}
                                disabled={!userThoughts.trim()}
                                className="btn-glow w-full py-4 bg-green-600 rounded-xl text-white text-sm tracking-[0.3em] uppercase font-bold disabled:opacity-50 disabled:animate-none"
                            >
                                Send to My Heart ✉️
                            </button>
                            <p className="text-rose-400/50 text-[10px] mt-6 tracking-widest uppercase">This will be sent directly to my WhatsApp</p>
                        </div>
                    </div>
                )}

            </div>
        </>
    );
}
