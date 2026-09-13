import { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { themes } from '../themes/themes';
import { availableFonts } from '../themes/fonts';
import { WeddingData } from '../types';
import * as firebaseService from '../services/firebaseService';
import { Heart, MapPin, Calendar, Clock, Gift, Music, ChevronDown, MessageCircle, Send, Sparkles, ArrowRight, XCircle } from 'lucide-react';

/* ============================================================
   GLOBAL KEYFRAMES & UTILITIES (custom theme)
   ============================================================ */
const themeStyles = `
  @keyframes floatY { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-16px)} }
  @keyframes petalFall {
    0%   { transform: translate3d(0,-10vh,0) rotate(0deg); opacity:0; }
    12%  { opacity:.85; }
    100% { transform: translate3d(60px,110vh,0) rotate(720deg); opacity:0; }
  }
  @keyframes spinSlow { to { transform: rotate(360deg); } }
  @keyframes shimmer {
    0%   { background-position: -200% 0; }
    100% { background-position:  200% 0; }
  }
  @keyframes glowPulse {
    0%,100% { opacity:.35; transform:scale(1); }
    50%     { opacity:.75; transform:scale(1.08); }
  }
  @keyframes ringExpand {
    0%   { transform:scale(.8); opacity:.7; }
    100% { transform:scale(1.7); opacity:0; }
  }
  @keyframes twinkle { 0%,100%{opacity:.15} 50%{opacity:1} }
  @keyframes gradientShift {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  .shimmer-text {
    background-size: 200% auto;
    animation: shimmer 4.5s linear infinite;
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .glass-card {
    backdrop-filter: blur(18px) saturate(140%);
    -webkit-backdrop-filter: blur(18px) saturate(140%);
  }
`;

/* ============================================================
   SCROLL REVEAL WRAPPER
   ============================================================ */
function Reveal({ children, delay = 0, y = 42, className = '', style = {} }: {
  children: React.ReactNode; delay?: number; y?: number; className?: string; style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : `translateY(${y}px)`,
        transition: `opacity 1s cubic-bezier(.2,.8,.2,1) ${delay}s, transform 1s cubic-bezier(.2,.8,.2,1) ${delay}s`,
        ...style
      }}
    >
      {children}
    </div>
  );
}

/* ============================================================
   ORNAMENTAL DIVIDER
   ============================================================ */
function Ornament({ color, width = 180 }: { color: string; width?: number }) {
  return (
    <svg viewBox="0 0 200 26" width={width} height={26} fill="none" aria-hidden="true">
      <path d="M2 13 C 40 3, 62 23, 100 13 C 138 3, 160 23, 198 13"
        stroke={color} strokeWidth="1.1" opacity="0.55" strokeLinecap="round" />
      <circle cx="100" cy="13" r="3" fill={color} />
      <circle cx="100" cy="13" r="6.5" stroke={color} strokeWidth="0.8" opacity="0.4" fill="none" />
      <circle cx="22" cy="13" r="1.6" fill={color} opacity="0.6" />
      <circle cx="178" cy="13" r="1.6" fill={color} opacity="0.6" />
    </svg>
  );
}

/* ============================================================
   CORNER FLOURISH (untuk card premium)
   ============================================================ */
function CornerFlourish({ color, pos }: { color: string; pos: 'tl' | 'tr' | 'bl' | 'br' }) {
  const rotate = { tl: 0, tr: 90, br: 180, bl: 270 }[pos];
  const place: React.CSSProperties = {
    tl: { top: 8, left: 8 }, tr: { top: 8, right: 8 },
    bl: { bottom: 8, left: 8 }, br: { bottom: 8, right: 8 }
  }[pos];
  return (
    <svg viewBox="0 0 40 40" width="28" height="28"
      style={{ position: 'absolute', ...place, transform: `rotate(${rotate}deg)`, opacity: 0.55, pointerEvents: 'none' }}>
      <path d="M2 20 L2 6 Q 2 2, 6 2 L20 2" stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <circle cx="6" cy="6" r="1.6" fill={color} />
    </svg>
  );
}

/* ============================================================
   MAIN COMPONENT
   ============================================================ */
export default function Invitation() {
  const store = useStore();

  const [ownerUsername, setOwnerUsername] = useState<string>('');
  const [guestName, setGuestName] = useState('');
  const [showContent, setShowContent] = useState(false);
  const [wishes, setWishes] = useState<{ name: string; message: string; time: string }[]>([]);
  const [wishName, setWishName] = useState('');
  const [wishMessage, setWishMessage] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [rsvpStatus, setRsvpStatus] = useState<'pending' | 'accepted' | 'declined'>('pending');
  const [rsvpCount, setRsvpCount] = useState(1);
  const [showRSVP, setShowRSVP] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [firebaseWeddingData, setFirebaseWeddingData] = useState<WeddingData | null>(null);
  const [firebaseTheme, setFirebaseTheme] = useState<string>('elegant-gold');
  const [firebaseIsLive, setFirebaseIsLive] = useState<boolean>(false);
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  const copyToClipboard = async (text: string, accountId: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        setCopiedAccount(accountId);
        setTimeout(() => setCopiedAccount(null), 2000);
        return;
      }
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      if (successful) {
        setCopiedAccount(accountId);
        setTimeout(() => setCopiedAccount(null), 2000);
      } else {
        alert(`Nomor rekening ${accountId === 'bank1' ? weddingData.bankName : weddingData.bankName2}:\n\n${text}\n\nSilakan salin manual.`);
      }
    } catch (error) {
      console.error('Copy failed:', error);
      alert(`Nomor rekening ${accountId === 'bank1' ? weddingData.bankName : weddingData.bankName2}:\n\n${text}\n\nSilakan salin manual.`);
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const to = urlParams.get('to');
    const user = urlParams.get('user');
    console.log('Invitation page loaded:', { to, user, search: window.location.search });
    if (to) { try { setGuestName(decodeURIComponent(to)); } catch (e) { setGuestName(to); } }

    if (user) {
      const loadData = async () => {
        try {
          const users = await firebaseService.getUsers();
          const foundUser = users.find(u => u.username === user);
          if (!foundUser) setErrorMessage(`User "${user}" tidak ditemukan`);
          else if (!foundUser.isActive) setErrorMessage(`User "${user}" tidak aktif`);
          else {
            setOwnerUsername(user);
            const weddingData = await firebaseService.getWeddingData(user);
            if (weddingData) setFirebaseWeddingData(weddingData);
            const theme = await firebaseService.getTheme(user);
            setFirebaseTheme(theme);
            const isLive = await firebaseService.getLiveStatus(user);
            setFirebaseIsLive(isLive);
          }
        } catch (error) {
          console.error('Error loading invitation data:', error);
          setErrorMessage('Gagal memuat data undangan');
        }
      };
      loadData();
    }

    const savedWishes = localStorage.getItem('wedding-wishes');
    if (savedWishes) {
      try { setWishes(JSON.parse(savedWishes)); } catch (e) { console.error('Error loading wishes:', e); }
    }
  }, []);

  const defaultTemplateData: WeddingData = {
    groomName: 'Ahmad Fauzan',
    brideName: 'Siti Nurhaliza',
    groomFather: 'H. Muhammad Rizki',
    groomMother: 'Hj. Fatimah Az-Zahra',
    brideFather: 'H. Abdullah Hakim',
    brideMother: 'Hj. Aisyah Putri',
    groomParentsAddress: 'Jl. Mawar No. 10, Jakarta Selatan',
    brideParentsAddress: 'Jl. Melati No. 25, Jakarta Timur',
    weddingDate: '2025-12-15',
    weddingTime: '08:00',
    weddingVenue: 'Masjid Istiqlal',
    weddingAddress: 'Jl. Taman Wijaya Kusuma, Jakarta Pusat',
    receptionDate: '2025-12-15',
    receptionTime: '11:00',
    receptionVenue: 'Ballroom Hotel Mulia',
    receptionAddress: 'Jl. Asia Afrika, Senayan, Jakarta Selatan',
    mapLink: 'https://maps.google.com',
    coverImage: '',
    groomPhoto: '',
    bridePhoto: '',
    couplePhoto: '',
    galleryImages: [],
    story: 'Pertemuan kami dimulai dari sebuah kebetulan yang indah. Dari saling mengenal, kami menemukan bahwa kami saling melengkapi dalam setiap aspek kehidupan. Cinta kami tumbuh seiring waktu, dan kini kami siap melangkah ke jenjang yang lebih serius.',
    quote: 'Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu istri-istri dari jenismu sendiri, supaya kamu cenderung dan merasa tenteram kepadanya.',
    quoteSource: 'QS. Ar-Rum: 21',
    musicUrl: '',
    bankName: 'Bank Central Asia',
    bankAccount: '1234567890',
    bankHolder: 'Ahmad Fauzan',
    bankName2: 'Bank Mandiri',
    bankAccount2: '0987654321',
    bankHolder2: 'Siti Nurhaliza',
    greeting: 'Dengan memohon rahmat dan ridho Allah SWT, kami bermaksud menyelenggarakan pernikahan putra-putri kami.',
    customFont: 'poppins'
  };

  const weddingData: WeddingData = ownerUsername ? (firebaseWeddingData || defaultTemplateData) : defaultTemplateData;
  const selectedTheme = ownerUsername ? firebaseTheme : 'elegant-gold';
  const isLive = ownerUsername ? firebaseIsLive : true;
  const ownerDisplayName = ownerUsername ? store.getUserDisplayName(ownerUsername) : 'Wedding Template';
  const theme = themes.find(t => t.id === selectedTheme) || themes[0];
  const bodyFont = availableFonts.find(f => f.id === weddingData.customFont) || availableFonts[0];

  useEffect(() => {
    if (!weddingData.weddingDate) return;
    const targetDate = new Date(`${weddingData.weddingDate}T${weddingData.weddingTime}:00`).getTime();
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const diff = targetDate - now;
      if (diff > 0) {
        setCountdown({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000)
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [weddingData.weddingDate, weddingData.weddingTime]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleOpen = () => setShowContent(true);

  const submitWish = () => {
    if (wishName && wishMessage) {
      const newWish = { name: wishName, message: wishMessage, time: new Date().toLocaleString('id-ID') };
      const updated = [newWish, ...wishes];
      setWishes(updated);
      localStorage.setItem('wedding-wishes', JSON.stringify(updated));
      setWishName('');
      setWishMessage('');
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  /* ================= ERROR ================= */
  if (errorMessage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white relative overflow-hidden">
        <style>{themeStyles}</style>
        <div className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: `radial-gradient(circle at 30% 30%, #ef4444, transparent 40%), radial-gradient(circle at 70% 70%, #f59e0b, transparent 40%)` }} />
        <div className="text-center px-6 relative z-10">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center shadow-[0_0_60px_rgba(239,68,68,0.5)]">
            <XCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: bodyFont.family }}>Error</h1>
          <p className="text-gray-400 mb-4" style={{ fontFamily: bodyFont.family }}>{errorMessage}</p>
          <a href="#/admin" className="inline-block px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition">Login Admin</a>
        </div>
      </div>
    );
  }

  /* ================= NOT LIVE ================= */
  if (ownerUsername && !isLive && !store.isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white relative overflow-hidden">
        <style>{themeStyles}</style>
        <div className="text-center px-6 relative z-10">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center animate-pulse shadow-[0_0_60px_rgba(245,158,11,0.5)]">
            <Heart className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: bodyFont.family }}>Undangan Belum Aktif</h1>
          <p className="text-gray-400 mb-4" style={{ fontFamily: bodyFont.family }}>Undangan ini belum dipublikasikan oleh pemilik.</p>
          <a href="#/admin" className="inline-block px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition">Login Admin</a>
        </div>
      </div>
    );
  }

  /* ================= COVER ================= */
  if (!showContent) {
    return (
      <div
        className="min-h-screen flex items-center justify-center relative overflow-hidden"
        style={{ background: theme.bgGradient, fontFamily: bodyFont.family }}
      >
        <style>{themeStyles}</style>

        {/* Aurora glow layers */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[15%] left-[10%] w-[420px] h-[420px] rounded-full"
            style={{ background: `radial-gradient(circle, ${theme.primaryColor}45, transparent 65%)`, filter: 'blur(90px)', animation: 'glowPulse 6s ease-in-out infinite' }} />
          <div className="absolute bottom-[10%] right-[10%] w-[380px] h-[380px] rounded-full"
            style={{ background: `radial-gradient(circle, ${theme.accentColor}40, transparent 65%)`, filter: 'blur(100px)', animation: 'glowPulse 8s ease-in-out infinite reverse' }} />
        </div>

        {/* Fine grid */}
        <div className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(${theme.primaryColor} 1px, transparent 1px), linear-gradient(90deg, ${theme.primaryColor} 1px, transparent 1px)`,
            backgroundSize: '56px 56px',
            maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)'
          }} />

        {/* Twinkling stars */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(28)].map((_, i) => (
            <div key={i} className="absolute rounded-full"
              style={{
                width: 2, height: 2, background: theme.primaryColor,
                left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
                animation: `twinkle ${2 + Math.random() * 4}s ease-in-out ${Math.random() * 3}s infinite`
              }} />
          ))}
        </div>

        {/* Falling petals */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(18)].map((_, i) => {
            const size = 6 + Math.random() * 10;
            return (
              <div key={i}
                style={{
                  position: 'absolute',
                  left: `${Math.random() * 100}%`,
                  top: '-10%',
                  width: size,
                  height: size,
                  background: `radial-gradient(circle at 30% 30%, ${theme.accentColor}, ${theme.primaryColor})`,
                  borderRadius: '50% 0 50% 50%',
                  opacity: 0.35,
                  transform: 'rotate(45deg)',
                  animation: `petalFall ${8 + Math.random() * 10}s linear ${Math.random() * 10}s infinite`,
                  filter: 'blur(0.3px)'
                }} />
            );
          })}
        </div>

        {/* Mouse parallax halo (desktop) */}
        <div className="absolute w-72 h-72 rounded-full pointer-events-none transition-all duration-300 ease-out hidden md:block"
          style={{
            background: `radial-gradient(circle, ${theme.primaryColor}20, transparent 70%)`,
            left: mousePos.x - 144, top: mousePos.y - 144, filter: 'blur(24px)'
          }} />

        {/* Content */}
        <div className="text-center px-5 sm:px-6 relative z-10 w-full max-w-lg">
          <div className="flex justify-center mb-6 sm:mb-8">
            <Ornament color={theme.primaryColor} width={220} />
          </div>

          <p className="text-[10px] sm:text-xs uppercase tracking-[0.45em] mb-4 sm:mb-5 opacity-70"
            style={{ color: theme.textColor }}>✦ The Wedding Of ✦</p>

          {/* Rotating ornamental ring around names */}
          <div className="relative inline-block w-full">
            <div className="absolute -inset-8 sm:-inset-12 pointer-events-none"
              style={{
                background: `radial-gradient(circle, ${theme.primaryColor}10, transparent 70%)`,
                borderRadius: '50%'
              }} />
            <h1
              className="shimmer-text text-[42px] sm:text-6xl md:text-7xl font-bold leading-tight break-words"
              style={{
                fontFamily: theme.scriptFont,
                backgroundImage: `linear-gradient(120deg, ${theme.primaryColor} 20%, ${theme.accentColor} 45%, #ffffff 55%, ${theme.primaryColor} 80%)`,
                filter: `drop-shadow(0 0 28px ${theme.primaryColor}55)`
              }}>
              {weddingData.groomName || 'Mempelai Pria'}
            </h1>

            <div className="flex items-center justify-center gap-3 sm:gap-4 my-3 sm:my-4">
              <div className="w-12 sm:w-20 h-px" style={{ background: `linear-gradient(to right, transparent, ${theme.accentColor})` }} />
              <span className="text-2xl sm:text-3xl" style={{ fontFamily: theme.scriptFont, color: theme.accentColor }}>&</span>
              <div className="w-12 sm:w-20 h-px" style={{ background: `linear-gradient(to left, transparent, ${theme.accentColor})` }} />
            </div>

            <h1
              className="shimmer-text text-[42px] sm:text-6xl md:text-7xl font-bold leading-tight break-words"
              style={{
                fontFamily: theme.scriptFont,
                backgroundImage: `linear-gradient(120deg, ${theme.primaryColor} 20%, ${theme.accentColor} 45%, #ffffff 55%, ${theme.primaryColor} 80%)`,
                filter: `drop-shadow(0 0 28px ${theme.primaryColor}55)`
              }}>
              {weddingData.brideName || 'Mempelai Wanita'}
            </h1>
          </div>

{guestName && (
            <div className="mb-6 sm:mb-8 inline-block w-full">
              <div className="px-4 sm:px-6 py-3 sm:py-4 rounded-2xl backdrop-blur-md border" style={{ background: theme.cardBg, borderColor: `${theme.primaryColor}30` }}>
                <p className="text-xs uppercase tracking-wider opacity-50 mb-1" style={{ color: theme.textColor }}>Kepada Yth.</p>
                <p className="text-lg sm:text-xl font-bold break-words" style={{ color: theme.primaryColor }}>{guestName}</p>
              </div>
            </div>
          )}
          
          {/* CTA */}
          <div className="relative inline-block mt-8 sm:mt-10">
            <div className="absolute -inset-1 rounded-full opacity-70 pointer-events-none"
              style={{ background: `linear-gradient(135deg, ${theme.primaryColor}50, ${theme.accentColor}50)`, filter: 'blur(12px)', animation: 'glowPulse 3s ease-in-out infinite' }} />
            <button
              onClick={handleOpen}
              className="relative px-9 sm:px-12 py-4 rounded-full font-semibold text-sm transition-all hover:scale-[1.04] active:scale-[0.98] group overflow-hidden min-w-[220px]"
              style={{
                background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.accentColor})`,
                color: '#ffffff',
                boxShadow: `0 12px 40px ${theme.primaryColor}55, inset 0 1px 0 rgba(255,255,255,0.3)`
              }}>
              <span className="relative z-10 flex items-center justify-center gap-2 tracking-wide">
                Buka Undangan <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
              </span>
              <span className="absolute inset-0 bg-white/25 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            </button>
          </div>

          <ChevronDown className="w-5 h-5 mx-auto mt-10 animate-bounce opacity-40" style={{ color: theme.textColor }} />
        </div>
      </div>
    );
  }

  /* ================= MAIN CONTENT ================= */
  return (
    <div style={{ background: theme.bgGradient, minHeight: '100vh', fontFamily: bodyFont.family }} className="relative overflow-x-hidden">
      <style>{themeStyles}</style>

      {/* Floating music button */}
      <button
        onClick={() => setIsPlaying(!isPlaying)}
        className="fixed top-4 right-4 z-50 w-11 h-11 rounded-full flex items-center justify-center shadow-lg glass-card border transition-all hover:scale-110"
        style={{ background: theme.cardBg, borderColor: `${theme.primaryColor}35`, color: theme.primaryColor, boxShadow: `0 0 30px ${theme.primaryColor}25` }}>
        <Music className={`w-4 h-4 sm:w-5 sm:h-5 ${isPlaying ? 'animate-spin' : ''}`} />
      </button>

      {/* ================= HERO ================= */}
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 sm:px-6">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/5 w-[420px] h-[420px] rounded-full"
            style={{ background: `radial-gradient(circle, ${theme.primaryColor}20, transparent 65%)`, filter: 'blur(90px)', animation: 'glowPulse 7s ease-in-out infinite' }} />
          <div className="absolute bottom-1/4 right-1/5 w-[380px] h-[380px] rounded-full"
            style={{ background: `radial-gradient(circle, ${theme.accentColor}18, transparent 65%)`, filter: 'blur(80px)', animation: 'glowPulse 9s ease-in-out infinite reverse' }} />
        </div>
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(${theme.primaryColor} 1px, transparent 1px), linear-gradient(90deg, ${theme.primaryColor} 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
            maskImage: 'radial-gradient(ellipse at center, black 20%, transparent 70%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 20%, transparent 70%)'
          }} />

        {weddingData.coverImage && (
          <div className="absolute inset-0">
            <img src={weddingData.coverImage} alt="" className="w-full h-full object-cover opacity-25" />
            <div className="absolute inset-0" style={{ background: theme.bgGradient, opacity: 0.85 }} />
          </div>
        )}

        {/* Petals */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(14)].map((_, i) => {
            const size = 5 + Math.random() * 8;
            return (
              <div key={i}
                style={{
                  position: 'absolute', left: `${Math.random() * 100}%`, top: '-10%',
                  width: size, height: size,
                  background: `radial-gradient(circle at 30% 30%, ${theme.accentColor}, ${theme.primaryColor})`,
                  borderRadius: '50% 0 50% 50%', opacity: 0.3, transform: 'rotate(45deg)',
                  animation: `petalFall ${10 + Math.random() * 8}s linear ${Math.random() * 8}s infinite`
                }} />
            );
          })}
        </div>

        <div className="text-center relative z-10 py-20 w-full">
          <Reveal>
            <div className="flex justify-center mb-6">
              <Ornament color={theme.primaryColor} width={220} />
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="text-[10px] sm:text-xs uppercase tracking-[0.45em] mb-8 opacity-70"
              style={{ color: theme.textColor }}>✦ The Wedding Of ✦</p>
          </Reveal>

          {/* Photos with rotating rings */}
          <Reveal delay={0.2}>
            <div className="flex items-center justify-center gap-4 sm:gap-8 mb-8 sm:mb-10">
              {weddingData.groomPhoto ? (
                <div className="relative">
                  <div className="absolute -inset-2 rounded-full opacity-60"
                    style={{ border: `1px dashed ${theme.primaryColor}60`, animation: 'spinSlow 22s linear infinite' }} />
                  <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-36 md:h-36 rounded-full overflow-hidden border-2"
                    style={{ borderColor: `${theme.primaryColor}70`, boxShadow: `0 0 40px ${theme.primaryColor}45, inset 0 0 20px ${theme.primaryColor}20` }}>
                    <img src={weddingData.groomPhoto} alt="Groom" className="w-full h-full object-cover" />
                  </div>
                </div>
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-36 md:h-36 rounded-full flex items-center justify-center text-4xl sm:text-5xl border-2"
                  style={{ background: `${theme.primaryColor}10`, borderColor: `${theme.primaryColor}35` }}>🤵</div>
              )}
              <div className="text-3xl sm:text-4xl md:text-5xl" style={{ fontFamily: theme.scriptFont, color: theme.accentColor, textShadow: `0 0 25px ${theme.accentColor}60` }}>&</div>
              {weddingData.bridePhoto ? (
                <div className="relative">
                  <div className="absolute -inset-2 rounded-full opacity-60"
                    style={{ border: `1px dashed ${theme.primaryColor}60`, animation: 'spinSlow 22s linear infinite reverse' }} />
                  <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-36 md:h-36 rounded-full overflow-hidden border-2"
                    style={{ borderColor: `${theme.primaryColor}70`, boxShadow: `0 0 40px ${theme.primaryColor}45, inset 0 0 20px ${theme.primaryColor}20` }}>
                    <img src={weddingData.bridePhoto} alt="Bride" className="w-full h-full object-cover" />
                  </div>
                </div>
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-36 md:h-36 rounded-full flex items-center justify-center text-4xl sm:text-5xl border-2"
                  style={{ background: `${theme.primaryColor}10`, borderColor: `${theme.primaryColor}35` }}>👰</div>
              )}
            </div>
          </Reveal>

          <Reveal delay={0.3}>
            <h1 className="shimmer-text text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-3 break-words px-2"
              style={{
                fontFamily: theme.scriptFont,
                backgroundImage: `linear-gradient(120deg, ${theme.primaryColor} 20%, ${theme.accentColor} 45%, #ffffff 55%, ${theme.primaryColor} 80%)`,
                filter: `drop-shadow(0 0 30px ${theme.primaryColor}55)`
              }}>
              {weddingData.groomName}
            </h1>
          </Reveal>

          <Reveal delay={0.35}>
            <div className="flex items-center justify-center gap-3 my-3">
              <div className="w-10 sm:w-16 h-px" style={{ background: `${theme.primaryColor}70` }} />
              <span className="text-xl sm:text-2xl" style={{ fontFamily: theme.scriptFont, color: theme.accentColor }}>&</span>
              <div className="w-10 sm:w-16 h-px" style={{ background: `${theme.primaryColor}70` }} />
            </div>
          </Reveal>

          <Reveal delay={0.4}>
            <h1 className="shimmer-text text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-8 break-words px-2"
              style={{
                fontFamily: theme.scriptFont,
                backgroundImage: `linear-gradient(120deg, ${theme.primaryColor} 20%, ${theme.accentColor} 45%, #ffffff 55%, ${theme.primaryColor} 80%)`,
                filter: `drop-shadow(0 0 30px ${theme.primaryColor}55)`
              }}>
              {weddingData.brideName}
            </h1>
          </Reveal>

          {weddingData.weddingDate && (
            <Reveal delay={0.5}>
              <p className="text-sm tracking-[0.25em] uppercase opacity-60" style={{ color: theme.textColor }}>
                {formatDate(weddingData.weddingDate)}
              </p>
            </Reveal>
          )}
        </div>

        <ChevronDown className="absolute bottom-8 left-1/2 -translate-x-1/2 w-5 h-5 animate-bounce opacity-40" style={{ color: theme.textColor }} />
      </section>

      {/* ================= QUOTE ================= */}
      {weddingData.quote && (
        <section className="py-20 sm:py-28 px-4 sm:px-6 relative">
          <Reveal>
            <div className="max-w-2xl mx-auto text-center">
              <div className="glass-card p-8 sm:p-12 md:p-14 rounded-[32px] border relative overflow-hidden"
                style={{ background: theme.cardBg, borderColor: `${theme.primaryColor}25`, boxShadow: `0 20px 80px ${theme.primaryColor}10` }}>
                <CornerFlourish color={theme.primaryColor} pos="tl" />
                <CornerFlourish color={theme.primaryColor} pos="tr" />
                <CornerFlourish color={theme.primaryColor} pos="bl" />
                <CornerFlourish color={theme.primaryColor} pos="br" />

                <div className="flex justify-center mb-6">
                  <Ornament color={theme.accentColor} width={140} />
                </div>
                <p className="text-base sm:text-lg md:text-xl italic leading-relaxed mb-6"
                  style={{ color: theme.textColor, fontFamily: theme.headingFont }}>
                  “{weddingData.quote}”
                </p>
                <p className="text-sm font-semibold tracking-wider" style={{ color: theme.primaryColor }}>
                  — {weddingData.quoteSource}
                </p>
              </div>
            </div>
          </Reveal>
        </section>
      )}

      {/* ================= COUPLE ================= */}
      <section className="py-20 sm:py-28 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <div className="text-center mb-12">
              <div className="flex justify-center mb-4"><Ornament color={theme.accentColor} width={140} /></div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: theme.headingFont, color: theme.primaryColor }}>
                Mempelai
              </h2>
              {weddingData.greeting && (
                <p className="text-sm opacity-60 max-w-xl mx-auto px-4" style={{ color: theme.textColor }}>{weddingData.greeting}</p>
              )}
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* Groom */}
            <Reveal delay={0.1}>
              <div className="glass-card p-7 sm:p-9 rounded-[28px] border text-center relative overflow-hidden group transition-all duration-500 hover:-translate-y-2"
                style={{ background: theme.cardBg, borderColor: `${theme.primaryColor}25`, boxShadow: `0 12px 50px ${theme.primaryColor}10` }}>
                <CornerFlourish color={theme.primaryColor} pos="tl" />
                <CornerFlourish color={theme.primaryColor} pos="br" />
                <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                  style={{ background: `radial-gradient(circle, ${theme.primaryColor}30, transparent 70%)`, filter: 'blur(20px)' }} />

                {weddingData.groomPhoto ? (
                  <div className="relative w-32 h-32 sm:w-36 sm:h-36 mx-auto mb-6">
                    <div className="absolute -inset-2 rounded-full opacity-60"
                      style={{ border: `1px dashed ${theme.primaryColor}55`, animation: 'spinSlow 26s linear infinite' }} />
                    <div className="w-full h-full rounded-full overflow-hidden border-2"
                      style={{ borderColor: `${theme.primaryColor}60`, boxShadow: `0 0 30px ${theme.primaryColor}35` }}>
                      <img src={weddingData.groomPhoto} alt="Groom" className="w-full h-full object-cover" />
                    </div>
                  </div>
                ) : (
                  <div className="w-32 h-32 sm:w-36 sm:h-36 mx-auto mb-6 rounded-full flex items-center justify-center text-5xl sm:text-6xl border-2"
                    style={{ background: `${theme.primaryColor}10`, borderColor: `${theme.primaryColor}35` }}>🤵</div>
                )}

                <h3 className="text-2xl sm:text-3xl font-bold mb-4 break-words" style={{ fontFamily: theme.headingFont, color: theme.primaryColor }}>
                  {weddingData.groomName}
                </h3>
                <p className="text-xs uppercase tracking-[0.3em] mb-2 opacity-60" style={{ color: theme.textColor }}>Putra dari</p>
                <p className="font-medium text-sm sm:text-base break-words" style={{ color: theme.textColor }}>
                  {weddingData.groomFather} & {weddingData.groomMother}
                </p>
                {weddingData.groomParentsAddress && (
                  <p className="text-xs opacity-40 mt-3 break-words" style={{ color: theme.textColor }}>{weddingData.groomParentsAddress}</p>
                )}
              </div>
            </Reveal>

            {/* Bride */}
            <Reveal delay={0.2}>
              <div className="glass-card p-7 sm:p-9 rounded-[28px] border text-center relative overflow-hidden group transition-all duration-500 hover:-translate-y-2"
                style={{ background: theme.cardBg, borderColor: `${theme.primaryColor}25`, boxShadow: `0 12px 50px ${theme.primaryColor}10` }}>
                <CornerFlourish color={theme.primaryColor} pos="tr" />
                <CornerFlourish color={theme.primaryColor} pos="bl" />
                <div className="absolute -top-16 -left-16 w-40 h-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                  style={{ background: `radial-gradient(circle, ${theme.accentColor}30, transparent 70%)`, filter: 'blur(20px)' }} />

                {weddingData.bridePhoto ? (
                  <div className="relative w-32 h-32 sm:w-36 sm:h-36 mx-auto mb-6">
                    <div className="absolute -inset-2 rounded-full opacity-60"
                      style={{ border: `1px dashed ${theme.primaryColor}55`, animation: 'spinSlow 26s linear infinite reverse' }} />
                    <div className="w-full h-full rounded-full overflow-hidden border-2"
                      style={{ borderColor: `${theme.primaryColor}60`, boxShadow: `0 0 30px ${theme.primaryColor}35` }}>
                      <img src={weddingData.bridePhoto} alt="Bride" className="w-full h-full object-cover" />
                    </div>
                  </div>
                ) : (
                  <div className="w-32 h-32 sm:w-36 sm:h-36 mx-auto mb-6 rounded-full flex items-center justify-center text-5xl sm:text-6xl border-2"
                    style={{ background: `${theme.primaryColor}10`, borderColor: `${theme.primaryColor}35` }}>👰</div>
                )}

                <h3 className="text-2xl sm:text-3xl font-bold mb-4 break-words" style={{ fontFamily: theme.headingFont, color: theme.primaryColor }}>
                  {weddingData.brideName}
                </h3>
                <p className="text-xs uppercase tracking-[0.3em] mb-2 opacity-60" style={{ color: theme.textColor }}>Putri dari</p>
                <p className="font-medium text-sm sm:text-base break-words" style={{ color: theme.textColor }}>
                  {weddingData.brideFather} & {weddingData.brideMother}
                </p>
                {weddingData.brideParentsAddress && (
                  <p className="text-xs opacity-40 mt-3 break-words" style={{ color: theme.textColor }}>{weddingData.brideParentsAddress}</p>
                )}
              </div>
            </Reveal>
          </div>

          {weddingData.couplePhoto && (
            <Reveal delay={0.15}>
              <div className="mt-12 rounded-[32px] overflow-hidden border relative group"
                style={{ borderColor: `${theme.primaryColor}25`, boxShadow: `0 30px 80px ${theme.primaryColor}25` }}>
                <img src={weddingData.couplePhoto} alt="Couple" className="w-full h-auto transition-transform duration-[1500ms] group-hover:scale-105" />
                <div className="absolute inset-0 pointer-events-none"
                  style={{ background: `linear-gradient(to top, ${theme.primaryColor}22, transparent 40%)` }} />
              </div>
            </Reveal>
          )}
        </div>
      </section>

      {/* ================= COUNTDOWN ================= */}
      {weddingData.weddingDate && (
        <section className="py-20 sm:py-28 px-4 sm:px-6 relative">
          <div className="max-w-3xl mx-auto text-center">
            <Reveal>
              <div className="flex justify-center mb-4"><Ornament color={theme.accentColor} width={140} /></div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-10 sm:mb-14" style={{ fontFamily: theme.headingFont, color: theme.primaryColor }}>
                Menghitung Hari
              </h2>
            </Reveal>

            <div className="grid grid-cols-4 gap-2 sm:gap-3 md:gap-5">
              {[
                { label: 'Hari', value: countdown.days },
                { label: 'Jam', value: countdown.hours },
                { label: 'Menit', value: countdown.minutes },
                { label: 'Detik', value: countdown.seconds }
              ].map((item, i) => (
                <Reveal key={item.label} delay={i * 0.08}>
                  <div className="glass-card p-3 sm:p-5 md:p-7 rounded-2xl border relative overflow-hidden"
                    style={{ background: theme.cardBg, borderColor: `${theme.primaryColor}25`, boxShadow: `0 10px 40px ${theme.primaryColor}12` }}>
                    <div className="absolute inset-x-0 top-0 h-px"
                      style={{ background: `linear-gradient(to right, transparent, ${theme.primaryColor}80, transparent)` }} />
                    <p className="text-2xl sm:text-4xl md:text-5xl font-bold tabular-nums"
                      style={{
                        color: theme.primaryColor,
                        fontFamily: theme.headingFont,
                        textShadow: `0 0 25px ${theme.primaryColor}55`
                      }}>
                      {String(item.value).padStart(2, '0')}
                    </p>
                    <p className="text-[10px] mt-2 uppercase tracking-[0.2em] opacity-50" style={{ color: theme.textColor }}>{item.label}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ================= EVENTS ================= */}
      <section className="py-20 sm:py-28 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <div className="text-center mb-12">
              <div className="flex justify-center mb-4"><Ornament color={theme.accentColor} width={140} /></div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold" style={{ fontFamily: theme.headingFont, color: theme.primaryColor }}>
                Acara
              </h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {weddingData.weddingVenue && (
              <Reveal delay={0.05}>
                <div className="glass-card p-7 sm:p-9 rounded-[28px] border text-center relative overflow-hidden group transition-all duration-500 hover:-translate-y-1"
                  style={{ background: theme.cardBg, borderColor: `${theme.primaryColor}25`, boxShadow: `0 12px 50px ${theme.primaryColor}12` }}>
                  <CornerFlourish color={theme.primaryColor} pos="tl" />
                  <CornerFlourish color={theme.primaryColor} pos="br" />

                  <div className="w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center relative"
                    style={{ background: `${theme.primaryColor}15`, border: `1px solid ${theme.primaryColor}30` }}>
                    <Heart className="w-7 h-7" style={{ color: theme.primaryColor }} />
                    <div className="absolute inset-0 rounded-2xl"
                      style={{ border: `1px solid ${theme.primaryColor}40`, animation: 'ringExpand 2.5s ease-out infinite' }} />
                  </div>

                  <h3 className="text-xl font-bold mb-6 tracking-wide" style={{ fontFamily: theme.headingFont, color: theme.primaryColor }}>
                    Akad Nikah
                  </h3>
                  <div className="space-y-3.5" style={{ color: theme.textColor }}>
                    <p className="flex items-center justify-center gap-2.5 text-sm">
                      <Calendar className="w-4 h-4 flex-shrink-0" style={{ color: theme.accentColor }} />
                      <span className="break-words">{formatDate(weddingData.weddingDate)}</span>
                    </p>
                    <p className="flex items-center justify-center gap-2.5 text-sm">
                      <Clock className="w-4 h-4 flex-shrink-0" style={{ color: theme.accentColor }} />
                      {weddingData.weddingTime} WIB
                    </p>
                    <p className="flex items-center justify-center gap-2.5 text-sm font-medium">
                      <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: theme.accentColor }} />
                      <span className="break-words">{weddingData.weddingVenue}</span>
                    </p>
                  </div>
                  {weddingData.mapLink && (
                    <a href={weddingData.mapLink} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-full text-sm font-semibold transition-transform hover:scale-105"
                      style={{ background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.accentColor})`, color: '#fff', boxShadow: `0 8px 30px ${theme.primaryColor}40` }}>
                      <MapPin className="w-4 h-4" />Lihat Peta
                    </a>
                  )}
                </div>
              </Reveal>
            )}

            {weddingData.receptionVenue && (
              <Reveal delay={0.15}>
                <div className="glass-card p-7 sm:p-9 rounded-[28px] border text-center relative overflow-hidden group transition-all duration-500 hover:-translate-y-1"
                  style={{ background: theme.cardBg, borderColor: `${theme.primaryColor}25`, boxShadow: `0 12px 50px ${theme.primaryColor}12` }}>
                  <CornerFlourish color={theme.primaryColor} pos="tr" />
                  <CornerFlourish color={theme.primaryColor} pos="bl" />

                  <div className="w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center relative"
                    style={{ background: `${theme.primaryColor}15`, border: `1px solid ${theme.primaryColor}30` }}>
                    <Calendar className="w-7 h-7" style={{ color: theme.primaryColor }} />
                    <div className="absolute inset-0 rounded-2xl"
                      style={{ border: `1px solid ${theme.primaryColor}40`, animation: 'ringExpand 2.5s ease-out infinite' }} />
                  </div>

                  <h3 className="text-xl font-bold mb-6 tracking-wide" style={{ fontFamily: theme.headingFont, color: theme.primaryColor }}>
                    Resepsi
                  </h3>
                  <div className="space-y-3.5" style={{ color: theme.textColor }}>
                    <p className="flex items-center justify-center gap-2.5 text-sm">
                      <Calendar className="w-4 h-4 flex-shrink-0" style={{ color: theme.accentColor }} />
                      <span className="break-words">{formatDate(weddingData.receptionDate)}</span>
                    </p>
                    <p className="flex items-center justify-center gap-2.5 text-sm">
                      <Clock className="w-4 h-4 flex-shrink-0" style={{ color: theme.accentColor }} />
                      {weddingData.receptionTime} WIB
                    </p>
                    <p className="flex items-center justify-center gap-2.5 text-sm font-medium">
                      <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: theme.accentColor }} />
                      <span className="break-words">{weddingData.receptionVenue}</span>
                    </p>
                  </div>
                  {weddingData.mapLink && (
                    <a href={weddingData.mapLink} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-full text-sm font-semibold transition-transform hover:scale-105"
                      style={{ background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.accentColor})`, color: '#fff', boxShadow: `0 8px 30px ${theme.primaryColor}40` }}>
                      <MapPin className="w-4 h-4" />Lihat Peta
                    </a>
                  )}
                </div>
              </Reveal>
            )}
          </div>
        </div>
      </section>

      {/* ================= STORY ================= */}
      {weddingData.story && (
        <section className="py-20 sm:py-28 px-4 sm:px-6">
          <Reveal>
            <div className="max-w-2xl mx-auto text-center">
              <div className="flex justify-center mb-4"><Ornament color={theme.accentColor} width={140} /></div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-8" style={{ fontFamily: theme.headingFont, color: theme.primaryColor }}>
                Our Story
              </h2>
              <div className="glass-card p-8 sm:p-10 rounded-[28px] border relative overflow-hidden"
                style={{ background: theme.cardBg, borderColor: `${theme.primaryColor}25`, boxShadow: `0 12px 50px ${theme.primaryColor}12` }}>
                <CornerFlourish color={theme.primaryColor} pos="tl" />
                <CornerFlourish color={theme.primaryColor} pos="br" />
                <p className="leading-relaxed text-sm sm:text-base" style={{ color: theme.textColor }}>{weddingData.story}</p>
              </div>
            </div>
          </Reveal>
        </section>
      )}

      {/* ================= GALLERY ================= */}
      {weddingData.galleryImages && weddingData.galleryImages.length > 0 && (
        <section className="py-20 sm:py-28 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <Reveal>
              <div className="text-center mb-10">
                <div className="flex justify-center mb-4"><Ornament color={theme.accentColor} width={140} /></div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold" style={{ fontFamily: theme.headingFont, color: theme.primaryColor }}>
                  Galeri Foto
                </h2>
              </div>
            </Reveal>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              {weddingData.galleryImages.map((img, index) => (
                <Reveal key={index} delay={(index % 6) * 0.06}>
                  <div className="rounded-2xl overflow-hidden border shadow-lg aspect-square relative group cursor-pointer"
                    style={{ borderColor: `${theme.primaryColor}25`, boxShadow: `0 10px 40px ${theme.primaryColor}15` }}>
                    <img src={img} alt={`Gallery ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-110" />
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-3"
                      style={{ background: `linear-gradient(to top, ${theme.primaryColor}cc, transparent 60%)` }}>
                      <span className="text-white text-xs font-medium tracking-wider">✦ {String(index + 1).padStart(2, '0')}</span>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ================= GIFT ================= */}
      {(weddingData.bankName || weddingData.bankName2) && (
        <section className="py-20 sm:py-28 px-4 sm:px-6">
          <div className="max-w-2xl mx-auto text-center">
            <Reveal>
              <div className="flex justify-center mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-px" style={{ background: `${theme.primaryColor}50` }} />
                  <Gift className="w-6 h-6" style={{ color: theme.primaryColor }} />
                  <div className="w-12 h-px" style={{ background: `${theme.primaryColor}50` }} />
                </div>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: theme.headingFont, color: theme.primaryColor }}>
                Amplop Digital
              </h2>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-10">
              {weddingData.bankName && (
                <Reveal delay={0.05}>
                  <div className="glass-card p-6 sm:p-7 rounded-[24px] border relative overflow-hidden text-left"
                    style={{ background: theme.cardBg, borderColor: `${theme.primaryColor}25`, boxShadow: `0 12px 50px ${theme.primaryColor}12` }}>
                    <CornerFlourish color={theme.primaryColor} pos="tl" />
                    <CornerFlourish color={theme.primaryColor} pos="br" />
                    <p className="font-bold text-base sm:text-lg mb-3" style={{ color: theme.primaryColor }}>{weddingData.bankName}</p>
                    <p className="text-xl sm:text-2xl font-mono font-bold mb-1.5 break-all" style={{ color: theme.textColor }}>{weddingData.bankAccount}</p>
                    <p className="text-xs opacity-60 mb-5" style={{ color: theme.textColor }}>a.n. {weddingData.bankHolder}</p>
                    <button
                      onClick={() => copyToClipboard(weddingData.bankAccount, 'bank1')}
                      className="w-full px-5 py-3 rounded-xl text-sm font-semibold min-h-[44px] transition-all hover:scale-[1.02]"
                      style={{
                        background: copiedAccount === 'bank1' ? '#10b981' : `linear-gradient(135deg, ${theme.primaryColor}20, ${theme.accentColor}20)`,
                        color: copiedAccount === 'bank1' ? '#ffffff' : theme.primaryColor,
                        border: `1px solid ${copiedAccount === 'bank1' ? '#10b981' : theme.primaryColor + '40'}`
                      }}>
                      {copiedAccount === 'bank1' ? '✓ Tersalin!' : 'Salin No. Rekening'}
                    </button>
                  </div>
                </Reveal>
              )}
              {weddingData.bankName2 && (
                <Reveal delay={0.15}>
                  <div className="glass-card p-6 sm:p-7 rounded-[24px] border relative overflow-hidden text-left"
                    style={{ background: theme.cardBg, borderColor: `${theme.primaryColor}25`, boxShadow: `0 12px 50px ${theme.primaryColor}12` }}>
                    <CornerFlourish color={theme.primaryColor} pos="tl" />
                    <CornerFlourish color={theme.primaryColor} pos="br" />
                    <p className="font-bold text-base sm:text-lg mb-3" style={{ color: theme.primaryColor }}>{weddingData.bankName2}</p>
                    <p className="text-xl sm:text-2xl font-mono font-bold mb-1.5 break-all" style={{ color: theme.textColor }}>{weddingData.bankAccount2}</p>
                    <p className="text-xs opacity-60 mb-5" style={{ color: theme.textColor }}>a.n. {weddingData.bankHolder2}</p>
                    <button
                      onClick={() => copyToClipboard(weddingData.bankAccount2, 'bank2')}
                      className="w-full px-5 py-3 rounded-xl text-sm font-semibold min-h-[44px] transition-all hover:scale-[1.02]"
                      style={{
                        background: copiedAccount === 'bank2' ? '#10b981' : `linear-gradient(135deg, ${theme.primaryColor}20, ${theme.accentColor}20)`,
                        color: copiedAccount === 'bank2' ? '#ffffff' : theme.primaryColor,
                        border: `1px solid ${copiedAccount === 'bank2' ? '#10b981' : theme.primaryColor + '40'}`
                      }}>
                      {copiedAccount === 'bank2' ? '✓ Tersalin!' : 'Salin No. Rekening'}
                    </button>
                  </div>
                </Reveal>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ================= RSVP ================= */}
      <section className="py-20 sm:py-28 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto text-center">
          <Reveal>
            <div className="flex justify-center mb-4"><Ornament color={theme.accentColor} width={140} /></div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-8" style={{ fontFamily: theme.headingFont, color: theme.primaryColor }}>
              Konfirmasi Kehadiran
            </h2>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="glass-card p-7 sm:p-10 rounded-[28px] border relative overflow-hidden"
              style={{ background: theme.cardBg, borderColor: `${theme.primaryColor}25`, boxShadow: `0 12px 50px ${theme.primaryColor}12` }}>
              <CornerFlourish color={theme.primaryColor} pos="tl" />
              <CornerFlourish color={theme.primaryColor} pos="tr" />
              <CornerFlourish color={theme.primaryColor} pos="bl" />
              <CornerFlourish color={theme.primaryColor} pos="br" />

              {!showRSVP ? (
                <div className="space-y-6">
                  <p className="text-sm opacity-60" style={{ color: theme.textColor }}>Mohon konfirmasi kehadiran Anda</p>
                  <div className="flex gap-3 justify-center flex-wrap">
                    <button
                      onClick={() => { setRsvpStatus('accepted'); setShowRSVP(true); }}
                      className="px-7 sm:px-9 py-3.5 rounded-xl font-semibold text-sm min-h-[44px] transition-all hover:scale-105"
                      style={{
                        background: `linear-gradient(135deg, ${theme.primaryColor}25, ${theme.accentColor}25)`,
                        color: theme.primaryColor,
                        border: `1px solid ${theme.primaryColor}50`
                      }}>
                      ✓ Hadir
                    </button>
                    <button
                      onClick={() => { setRsvpStatus('declined'); setShowRSVP(true); }}
                      className="px-7 sm:px-9 py-3.5 rounded-xl font-semibold text-sm min-h-[44px] transition-all hover:scale-105"
                      style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.35)' }}>
                      ✗ Tidak Hadir
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {rsvpStatus === 'accepted' ? (
                    <>
                      <p className="text-green-500 font-semibold">✓ Terima kasih! Anda akan hadir</p>
                      <select
                        value={rsvpCount}
                        onChange={e => setRsvpCount(Number(e.target.value))}
                        className="mt-2 p-3.5 rounded-xl border w-full text-sm min-h-[44px] bg-transparent focus:outline-none"
                        style={{ borderColor: `${theme.primaryColor}45`, color: theme.textColor }}>
                        {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} orang</option>)}
                      </select>
                    </>
                  ) : (
                    <p className="text-red-400 font-semibold">Sayang sekali Anda tidak bisa hadir.</p>
                  )}
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================= WISHES ================= */}
      <section className="py-20 sm:py-28 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <Reveal>
            <div className="text-center mb-10">
              <div className="flex justify-center mb-4"><Ornament color={theme.accentColor} width={140} /></div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold flex items-center justify-center gap-3"
                style={{ fontFamily: theme.headingFont, color: theme.primaryColor }}>
                <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7" style={{ color: theme.accentColor }} />
                Ucapan & Doa
              </h2>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="glass-card p-5 sm:p-7 rounded-[28px] border mb-6 relative overflow-hidden"
              style={{ background: theme.cardBg, borderColor: `${theme.primaryColor}25`, boxShadow: `0 12px 50px ${theme.primaryColor}12` }}>
              <CornerFlourish color={theme.primaryColor} pos="tl" />
              <CornerFlourish color={theme.primaryColor} pos="br" />
              <div className="space-y-3.5">
                <input
                  type="text" value={wishName} onChange={e => setWishName(e.target.value)}
                  placeholder="Nama Anda"
                  className="w-full p-3.5 rounded-xl border bg-transparent focus:outline-none focus:ring-2 text-sm min-h-[44px] transition-all"
                  style={{ borderColor: `${theme.primaryColor}35`, color: theme.textColor }} />
                <textarea
                  value={wishMessage} onChange={e => setWishMessage(e.target.value)}
                  placeholder="Tulis ucapan & doa..." rows={3}
                  className="w-full p-3.5 rounded-xl border bg-transparent focus:outline-none focus:ring-2 text-sm resize-none transition-all"
                  style={{ borderColor: `${theme.primaryColor}35`, color: theme.textColor }} />
                <button
                  onClick={submitWish}
                  className="w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 min-h-[44px] transition-all hover:scale-[1.02]"
                  style={{
                    background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.accentColor})`,
                    color: '#fff',
                    boxShadow: `0 10px 30px ${theme.primaryColor}35`
                  }}>
                  <Send className="w-4 h-4" /> Kirim Ucapan
                </button>
              </div>
            </div>
          </Reveal>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {wishes.map((wish, i) => (
              <Reveal key={i} delay={Math.min(i, 6) * 0.05}>
                <div className="glass-card p-4 sm:p-5 rounded-2xl border relative overflow-hidden"
                  style={{ background: theme.cardBg, borderColor: `${theme.primaryColor}20`, boxShadow: `0 6px 25px ${theme.primaryColor}10` }}>
                  <div className="absolute inset-y-0 left-0 w-1"
                    style={{ background: `linear-gradient(to bottom, ${theme.primaryColor}, ${theme.accentColor})` }} />
                  <div className="flex items-center justify-between mb-1.5 gap-2 pl-2">
                    <p className="font-semibold text-sm truncate" style={{ color: theme.primaryColor }}>{wish.name}</p>
                    <p className="text-[10px] flex-shrink-0 opacity-40" style={{ color: theme.textColor }}>{wish.time}</p>
                  </div>
                  <p className="text-sm pl-2 opacity-85" style={{ color: theme.textColor }}>{wish.message}</p>
                </div>
              </Reveal>
            ))}
            {wishes.length === 0 && (
              <p className="text-center text-sm py-6 opacity-40" style={{ color: theme.textColor }}>Belum ada ucapan.</p>
            )}
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="py-16 sm:py-20 px-4 sm:px-6 text-center relative"
        style={{ borderTop: `1px solid ${theme.primaryColor}20` }}>
        <Reveal>
          <div className="flex justify-center mb-6"><Ornament color={theme.accentColor} width={160} /></div>
          <p className="text-3xl sm:text-4xl md:text-5xl font-bold break-words px-2 shimmer-text"
            style={{
              fontFamily: theme.scriptFont,
              backgroundImage: `linear-gradient(120deg, ${theme.primaryColor} 20%, ${theme.accentColor} 45%, #ffffff 55%, ${theme.primaryColor} 80%)`,
              filter: `drop-shadow(0 0 25px ${theme.primaryColor}40)`
            }}>
            {weddingData.groomName} & {weddingData.brideName}
          </p>
          <div className="flex items-center justify-center gap-4 mt-8">
            <div className="w-16 h-px" style={{ background: `linear-gradient(to right, transparent, ${theme.primaryColor}60)` }} />
            <Heart className="w-4 h-4" style={{ color: theme.primaryColor, filter: `drop-shadow(0 0 8px ${theme.primaryColor}80)` }} />
            <div className="w-16 h-px" style={{ background: `linear-gradient(to left, transparent, ${theme.primaryColor}60)` }} />
          </div>
          <p className="text-[11px] mt-8 opacity-30 tracking-wider" style={{ color: theme.textColor }}>
            © 2025 Wedding Invitation by {ownerDisplayName}
          </p>
          <a href="#/admin" className="inline-block mt-4 text-[11px] opacity-25 hover:opacity-60 transition tracking-widest uppercase"
            style={{ color: theme.textColor }}>
            Admin Panel
          </a>
        </Reveal>
      </footer>
    </div>
  );
}