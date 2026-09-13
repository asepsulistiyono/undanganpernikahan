import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { themes } from '../themes/themes';
import { availableFonts } from '../themes/fonts';
import { WeddingData } from '../types';
import * as firebaseService from '../services/firebaseService';
import { Heart, MapPin, Calendar, Clock, Gift, Music, ChevronDown, MessageCircle, Send, Sparkles, ArrowRight, XCircle } from 'lucide-react';

export default function Invitation() {
  const store = useStore();

  // Determine which user's invitation to show
  const [ownerUsername, setOwnerUsername] = useState<string>('');
  const [guestName, setGuestName] = useState('');
  const [showContent, setShowContent] = useState(false);
  const [wishes, setWishes] = useState<{name: string; message: string; time: string}[]>([]);
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

  const copyToClipboard = (text: string, accountId: string) => {
    // Try modern clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedAccount(accountId);
        setTimeout(() => setCopiedAccount(null), 2000);
      }).catch(() => {
        // Fallback to old method
        fallbackCopy(text, accountId);
      });
    } else {
      // Fallback for older browsers
      fallbackCopy(text, accountId);
    }
  };

  const fallbackCopy = (text: string, accountId: string) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand('copy');
      setCopiedAccount(accountId);
      setTimeout(() => setCopiedAccount(null), 2000);
    } catch (err) {
      alert('Nomor rekening: ' + text);
    }

    document.body.removeChild(textArea);
  };

  useEffect(() => {
    // Parse URL parameters - compatible with mobile browsers
    const urlParams = new URLSearchParams(window.location.search);
    const to = urlParams.get('to');
    const user = urlParams.get('user');

    console.log('Invitation page loaded:', { to, user, search: window.location.search });

    if (to) {
      try {
        setGuestName(decodeURIComponent(to));
      } catch (e) {
        setGuestName(to);
      }
    }

    // Determine which user's invitation to show
    if (user) {
      // Load data from Firebase
      const loadData = async () => {
        try {
          // Check if user exists and is active
          const users = await firebaseService.getUsers();
          const foundUser = users.find(u => u.username === user);
          console.log('Found user for invitation:', foundUser);

          if (!foundUser) {
            setErrorMessage(`User "${user}" tidak ditemukan`);
          } else if (!foundUser.isActive) {
            setErrorMessage(`User "${user}" tidak aktif`);
          } else {
            setOwnerUsername(user);

            // Load wedding data from Firebase
            const weddingData = await firebaseService.getWeddingData(user);
            console.log('Loaded wedding data from Firebase:', weddingData);
            console.log('Bride photo:', weddingData?.bridePhoto);
            console.log('Groom photo:', weddingData?.groomPhoto);
            console.log('Gallery images:', weddingData?.galleryImages);
            console.log('Gallery images length:', weddingData?.galleryImages?.length);

            if (weddingData) {
              setFirebaseWeddingData(weddingData);
            }

            // Load theme from Firebase
            const theme = await firebaseService.getTheme(user);
            setFirebaseTheme(theme);

            // Load live status from Firebase
            const isLive = await firebaseService.getLiveStatus(user);
            setFirebaseIsLive(isLive);
          }
        } catch (error) {
          console.error('Error loading invitation data:', error);
          setErrorMessage('Gagal memuat data undangan');
        }
      };

      loadData();
    } else {
      // No user parameter - show default template (no user data)
      // Don't set ownerUsername, so it will use defaultTemplateData
    }

    // Load wishes
    const savedWishes = localStorage.getItem('wedding-wishes');
    if (savedWishes) {
      try {
        setWishes(JSON.parse(savedWishes));
      } catch (e) {
        console.error('Error loading wishes:', e);
      }
    }
  }, []);

  // Default template data for URL without user parameter
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

  // Get data for the owner
  const weddingData: WeddingData = ownerUsername
    ? (firebaseWeddingData || defaultTemplateData)
    : defaultTemplateData;

  const selectedTheme = ownerUsername ? firebaseTheme : 'elegant-gold';
  // If no ownerUsername (default URL), always show template as live
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

  // If error message exists
  if (errorMessage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
        <div className="text-center px-6">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
            <XCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: bodyFont.family }}>Error</h1>
          <p className="text-gray-400 mb-4" style={{ fontFamily: bodyFont.family }}>{errorMessage}</p>
          <a href="#/admin" className="inline-block px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition">
            Login Admin
          </a>
        </div>
      </div>
    );
  }

  // If owner exists but not live (and not authenticated)
  if (ownerUsername && !isLive && !store.isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
        <div className="text-center px-6">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center animate-pulse">
            <Heart className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: bodyFont.family }}>Undangan Belum Aktif</h1>
          <p className="text-gray-400 mb-4" style={{ fontFamily: bodyFont.family }}>Undangan ini belum dipublikasikan oleh pemilik.</p>
          <a href="#/admin" className="inline-block px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition">
            Login Admin
          </a>
        </div>
      </div>
    );
  }

  // Cover / Opening
  if (!showContent) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: theme.bgGradient, fontFamily: bodyFont.family }}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 sm:w-96 h-64 sm:h-96 rounded-full animate-pulse" style={{ background: `radial-gradient(circle, ${theme.primaryColor}30, transparent)`, filter: 'blur(60px)', animationDuration: '4s' }} />
          <div className="absolute bottom-1/4 right-1/4 w-56 sm:w-80 h-56 sm:h-80 rounded-full animate-pulse" style={{ background: `radial-gradient(circle, ${theme.accentColor}25, transparent)`, filter: 'blur(80px)', animationDuration: '6s' }} />
        </div>
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(${theme.primaryColor} 1px, transparent 1px), linear-gradient(90deg, ${theme.primaryColor} 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
        <div className="absolute inset-0">
          {[...Array(15)].map((_, i) => (
            <div key={i} className="absolute w-1 h-1 rounded-full animate-float" style={{
              background: theme.primaryColor, opacity: 0.3 + Math.random() * 0.4,
              left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`, animationDuration: `${3 + Math.random() * 4}s`
            }} />
          ))}
        </div>
        <div className="absolute w-64 h-64 rounded-full pointer-events-none transition-all duration-300 ease-out hidden md:block" style={{
          background: `radial-gradient(circle, ${theme.primaryColor}15, transparent 70%)`,
          left: mousePos.x - 128, top: mousePos.y - 128, filter: 'blur(20px)'
        }} />

        <div className="text-center px-4 sm:px-6 relative z-10 w-full max-w-md">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-6 sm:mb-8">
            <div className="w-12 sm:w-20 h-px" style={{ background: `linear-gradient(to right, transparent, ${theme.primaryColor})` }} />
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" style={{ color: theme.primaryColor }} />
            <div className="w-12 sm:w-20 h-px" style={{ background: `linear-gradient(to left, transparent, ${theme.primaryColor})` }} />
          </div>
          <p className="text-xs uppercase tracking-[0.3em] sm:tracking-[0.4em] mb-4 sm:mb-6 opacity-60" style={{ color: theme.textColor }}>✦ The Wedding Of ✦</p>
          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold animate-fade-in-up break-words" style={{
            fontFamily: theme.scriptFont, color: theme.primaryColor,
            textShadow: `0 0 40px ${theme.primaryColor}40, 0 0 80px ${theme.primaryColor}20`
          }}>{weddingData.groomName || 'Mempelai Pria'}</h1>
          <div className="flex items-center justify-center gap-3 sm:gap-4 my-3 sm:my-4">
            <div className="w-10 sm:w-16 h-px" style={{ background: `linear-gradient(to right, transparent, ${theme.accentColor})` }} />
            <span className="text-2xl sm:text-3xl md:text-4xl" style={{ fontFamily: theme.scriptFont, color: theme.accentColor }}>&</span>
            <div className="w-10 sm:w-16 h-px" style={{ background: `linear-gradient(to left, transparent, ${theme.accentColor})` }} />
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold animate-fade-in-up break-words" style={{
            fontFamily: theme.scriptFont, color: theme.primaryColor,
            textShadow: `0 0 40px ${theme.primaryColor}40, 0 0 80px ${theme.primaryColor}20`, animationDelay: '0.2s'
          }}>{weddingData.brideName || 'Mempelai Wanita'}</h1>

          {guestName && (
            <div className="mb-6 sm:mb-8 inline-block w-full">
              <div className="px-4 sm:px-6 py-3 sm:py-4 rounded-2xl backdrop-blur-md border" style={{ background: theme.cardBg, borderColor: `${theme.primaryColor}30` }}>
                <p className="text-xs uppercase tracking-wider opacity-50 mb-1" style={{ color: theme.textColor }}>Kepada Yth.</p>
                <p className="text-lg sm:text-xl font-bold break-words" style={{ color: theme.primaryColor }}>{guestName}</p>
              </div>
            </div>
          )}

          <div className="relative inline-block mt-4 sm:mt-0">
            <button onClick={handleOpen} className="relative px-8 sm:px-10 py-3.5 sm:py-4 rounded-full font-medium text-sm transition-all hover:scale-105 group overflow-hidden min-w-[200px]" style={{
              background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.accentColor})`, color: '#ffffff',
              boxShadow: `0 0 30px ${theme.primaryColor}40, 0 10px 40px ${theme.primaryColor}30`
            }}>
              <span className="relative z-10 flex items-center justify-center gap-2">
                Buka Undangan <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </button>
            <div className="absolute -inset-1 rounded-full animate-pulse opacity-50" style={{ background: `linear-gradient(135deg, ${theme.primaryColor}40, ${theme.accentColor}40)`, filter: 'blur(8px)' }} />
          </div>
          <ChevronDown className="w-5 h-5 mx-auto mt-8 sm:mt-10 animate-bounce opacity-40" style={{ color: theme.textColor }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: theme.bgGradient, minHeight: '100vh', fontFamily: bodyFont.family }} className="relative">
      <button onClick={() => setIsPlaying(!isPlaying)} className="fixed top-4 right-4 z-50 w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center shadow-lg backdrop-blur-md border transition-all hover:scale-110" style={{ background: theme.cardBg, borderColor: `${theme.primaryColor}30`, color: theme.primaryColor }}>
        <Music className={`w-4 h-4 sm:w-5 sm:h-5 ${isPlaying ? 'animate-spin' : ''}`} />
      </button>

      {/* Hero */}
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 sm:px-6">
        <div className="absolute inset-0">
          <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full animate-pulse" style={{ background: `radial-gradient(circle, ${theme.primaryColor}15, transparent)`, filter: 'blur(80px)', animationDuration: '5s' }} />
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full animate-pulse" style={{ background: `radial-gradient(circle, ${theme.accentColor}10, transparent)`, filter: 'blur(60px)', animationDuration: '7s' }} />
        </div>
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `linear-gradient(${theme.primaryColor} 1px, transparent 1px), linear-gradient(90deg, ${theme.primaryColor} 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }} />
        {weddingData.coverImage && (
          <div className="absolute inset-0">
            <img src={weddingData.coverImage} alt="" className="w-full h-full object-cover opacity-20" />
            <div className="absolute inset-0" style={{ background: theme.bgGradient, opacity: 0.85 }} />
          </div>
        )}

        <div className="text-center relative z-10 py-20">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-24 h-px" style={{ background: `linear-gradient(to right, transparent, ${theme.primaryColor}60)` }} />
            <Sparkles className="w-5 h-5" style={{ color: theme.primaryColor }} />
            <div className="w-24 h-px" style={{ background: `linear-gradient(to left, transparent, ${theme.primaryColor}60)` }} />
          </div>
          <p className="text-xs uppercase tracking-[0.4em] mb-8 opacity-60" style={{ color: theme.textColor }}>✦ The Wedding Of ✦</p>

          {/* Photos */}
          <div className="flex items-center justify-center gap-3 sm:gap-6 mb-6 sm:mb-8">
            {weddingData.groomPhoto ? (
              <div className="relative">
                <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-36 md:h-36 rounded-full overflow-hidden border-2 shadow-xl" style={{ borderColor: `${theme.primaryColor}60`, boxShadow: `0 0 30px ${theme.primaryColor}30` }}>
                  <img src={weddingData.groomPhoto} alt="Groom" className="w-full h-full object-cover" />
                </div>
              </div>
            ) : (
              <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-36 md:h-36 rounded-full flex items-center justify-center text-4xl sm:text-5xl border-2" style={{ background: `${theme.primaryColor}10`, borderColor: `${theme.primaryColor}30` }}>🤵</div>
            )}
            <div className="text-2xl sm:text-3xl md:text-4xl" style={{ fontFamily: theme.scriptFont, color: theme.accentColor }}>&</div>
            {weddingData.bridePhoto ? (
              <div className="relative">
                <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-36 md:h-36 rounded-full overflow-hidden border-2 shadow-xl" style={{ borderColor: `${theme.primaryColor}60`, boxShadow: `0 0 30px ${theme.primaryColor}30` }}>
                  <img src={weddingData.bridePhoto} alt="Bride" className="w-full h-full object-cover" />
                </div>
              </div>
            ) : (
              <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-36 md:h-36 rounded-full flex items-center justify-center text-4xl sm:text-5xl border-2" style={{ background: `${theme.primaryColor}10`, borderColor: `${theme.primaryColor}30` }}>👰</div>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold mb-2 break-words" style={{ fontFamily: theme.scriptFont, color: theme.primaryColor, textShadow: `0 0 40px ${theme.primaryColor}30` }}>
            {weddingData.groomName}
          </h1>
          <div className="flex items-center justify-center gap-2 sm:gap-3 my-2">
            <div className="w-8 sm:w-12 h-px" style={{ background: `${theme.primaryColor}60` }} />
            <span className="text-xl sm:text-2xl" style={{ fontFamily: theme.scriptFont, color: theme.accentColor }}>&</span>
            <div className="w-8 sm:w-12 h-px" style={{ background: `${theme.primaryColor}60` }} />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold mb-6 sm:mb-8 break-words" style={{ fontFamily: theme.scriptFont, color: theme.primaryColor, textShadow: `0 0 40px ${theme.primaryColor}30` }}>
            {weddingData.brideName}
          </h1>
          {weddingData.weddingDate && <p className="text-sm opacity-50" style={{ color: theme.textColor }}>{formatDate(weddingData.weddingDate)}</p>}
        </div>
      </section>

      {/* Quote */}
      {weddingData.quote && (
        <section className="py-16 sm:py-20 px-4 sm:px-6 relative">
          <div className="max-w-2xl mx-auto text-center">
            <div className="p-6 sm:p-8 md:p-12 rounded-3xl backdrop-blur-md border relative overflow-hidden" style={{ background: theme.cardBg, borderColor: `${theme.primaryColor}20` }}>
              <p className="text-base sm:text-lg md:text-xl italic leading-relaxed mb-4" style={{ color: theme.textColor }}>"{weddingData.quote}"</p>
              <p className="text-sm font-semibold" style={{ color: theme.primaryColor }}>— {weddingData.quoteSource}</p>
            </div>
          </div>
        </section>
      )}

      {/* Couple */}
      <section className="py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-center text-2xl sm:text-3xl md:text-5xl font-bold mb-4" style={{ fontFamily: theme.headingFont, color: theme.primaryColor }}>Mempelai</h2>
          {weddingData.greeting && <p className="text-center text-sm mb-8 sm:mb-12 opacity-60 px-4" style={{ color: theme.textColor }}>{weddingData.greeting}</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <div className="p-6 sm:p-8 rounded-3xl backdrop-blur-md border text-center relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300" style={{ background: theme.cardBg, borderColor: `${theme.primaryColor}20` }}>
              {weddingData.groomPhoto ? (
                <div className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 mx-auto mb-4 sm:mb-6 rounded-full overflow-hidden border-2 shadow-lg" style={{ borderColor: `${theme.primaryColor}50` }}>
                  <img src={weddingData.groomPhoto} alt="Groom" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 mx-auto mb-4 sm:mb-6 rounded-full flex items-center justify-center text-5xl sm:text-6xl border-2" style={{ background: `${theme.primaryColor}10`, borderColor: `${theme.primaryColor}30` }}>🤵</div>
              )}
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 break-words" style={{ fontFamily: theme.headingFont, color: theme.primaryColor }}>{weddingData.groomName}</h3>
              <p className="text-sm mb-1" style={{ color: theme.textColor, opacity: 0.7 }}>Putra dari</p>
              <p className="font-medium text-sm sm:text-base break-words" style={{ color: theme.textColor }}>{weddingData.groomFather} & {weddingData.groomMother}</p>
              {weddingData.groomParentsAddress && <p className="text-xs opacity-40 mt-2 break-words" style={{ color: theme.textColor }}>{weddingData.groomParentsAddress}</p>}
            </div>
            <div className="p-6 sm:p-8 rounded-3xl backdrop-blur-md border text-center relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300" style={{ background: theme.cardBg, borderColor: `${theme.primaryColor}20` }}>
              {weddingData.bridePhoto ? (
                <div className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 mx-auto mb-4 sm:mb-6 rounded-full overflow-hidden border-2 shadow-lg" style={{ borderColor: `${theme.primaryColor}50` }}>
                  <img src={weddingData.bridePhoto} alt="Bride" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 mx-auto mb-4 sm:mb-6 rounded-full flex items-center justify-center text-5xl sm:text-6xl border-2" style={{ background: `${theme.primaryColor}10`, borderColor: `${theme.primaryColor}30` }}>👰</div>
              )}
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 break-words" style={{ fontFamily: theme.headingFont, color: theme.primaryColor }}>{weddingData.brideName}</h3>
              <p className="text-sm mb-1" style={{ color: theme.textColor, opacity: 0.7 }}>Putri dari</p>
              <p className="font-medium text-sm sm:text-base break-words" style={{ color: theme.textColor }}>{weddingData.brideFather} & {weddingData.brideMother}</p>
              {weddingData.brideParentsAddress && <p className="text-xs opacity-40 mt-2 break-words" style={{ color: theme.textColor }}>{weddingData.brideParentsAddress}</p>}
            </div>
          </div>
          {weddingData.couplePhoto && (
            <div className="mt-8 sm:mt-12 rounded-3xl overflow-hidden border shadow-2xl" style={{ borderColor: `${theme.primaryColor}20` }}>
              <img src={weddingData.couplePhoto} alt="Couple" className="w-full h-auto" />
            </div>
          )}
        </div>
      </section>

      {/* Countdown */}
      {weddingData.weddingDate && (
        <section className="py-16 sm:py-20 px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-8 sm:mb-10" style={{ fontFamily: theme.headingFont, color: theme.primaryColor }}>Menghitung Hari</h2>
            <div className="grid grid-cols-4 gap-2 sm:gap-3 md:gap-5">
              {[{ label: 'Hari', value: countdown.days }, { label: 'Jam', value: countdown.hours }, { label: 'Menit', value: countdown.minutes }, { label: 'Detik', value: countdown.seconds }].map(item => (
                <div key={item.label} className="p-3 sm:p-4 md:p-6 rounded-2xl backdrop-blur-md border" style={{ background: theme.cardBg, borderColor: `${theme.primaryColor}20` }}>
                  <p className="text-2xl sm:text-3xl md:text-5xl font-bold" style={{ color: theme.primaryColor, fontFamily: theme.headingFont, textShadow: `0 0 20px ${theme.primaryColor}30` }}>
                    {String(item.value).padStart(2, '0')}
                  </p>
                  <p className="text-xs mt-2 uppercase tracking-wider" style={{ color: theme.textColor, opacity: 0.5 }}>{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Events */}
      <section className="py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-center text-2xl sm:text-3xl md:text-5xl font-bold mb-8 sm:mb-12" style={{ fontFamily: theme.headingFont, color: theme.primaryColor }}>Acara</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {weddingData.weddingVenue && (
              <div className="p-6 sm:p-8 rounded-3xl backdrop-blur-md border text-center" style={{ background: theme.cardBg, borderColor: `${theme.primaryColor}20` }}>
                <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-5 rounded-2xl flex items-center justify-center" style={{ background: `${theme.primaryColor}15` }}>
                  <Heart className="w-6 h-6 sm:w-7 sm:h-7" style={{ color: theme.primaryColor }} />
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-5" style={{ fontFamily: theme.headingFont, color: theme.primaryColor }}>Akad Nikah</h3>
                <div className="space-y-3" style={{ color: theme.textColor }}>
                  <p className="flex items-center justify-center gap-2 text-sm"><Calendar className="w-4 h-4 flex-shrink-0" style={{ color: theme.accentColor }} /><span className="break-words">{formatDate(weddingData.weddingDate)}</span></p>
                  <p className="flex items-center justify-center gap-2 text-sm"><Clock className="w-4 h-4 flex-shrink-0" style={{ color: theme.accentColor }} />{weddingData.weddingTime} WIB</p>
                  <p className="flex items-center justify-center gap-2 text-sm font-medium"><MapPin className="w-4 h-4 flex-shrink-0" style={{ color: theme.accentColor }} /><span className="break-words">{weddingData.weddingVenue}</span></p>
                </div>
                {weddingData.mapLink && <a href={weddingData.mapLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-full text-sm font-medium" style={{ background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.accentColor})`, color: '#fff' }}><MapPin className="w-4 h-4" />Lihat Peta</a>}
              </div>
            )}
            {weddingData.receptionVenue && (
              <div className="p-6 sm:p-8 rounded-3xl backdrop-blur-md border text-center" style={{ background: theme.cardBg, borderColor: `${theme.primaryColor}20` }}>
                <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-5 rounded-2xl flex items-center justify-center" style={{ background: `${theme.primaryColor}15` }}>
                  <Calendar className="w-6 h-6 sm:w-7 sm:h-7" style={{ color: theme.primaryColor }} />
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-5" style={{ fontFamily: theme.headingFont, color: theme.primaryColor }}>Resepsi</h3>
                <div className="space-y-3" style={{ color: theme.textColor }}>
                  <p className="flex items-center justify-center gap-2 text-sm"><Calendar className="w-4 h-4 flex-shrink-0" style={{ color: theme.accentColor }} /><span className="break-words">{formatDate(weddingData.receptionDate)}</span></p>
                  <p className="flex items-center justify-center gap-2 text-sm"><Clock className="w-4 h-4 flex-shrink-0" style={{ color: theme.accentColor }} />{weddingData.receptionTime} WIB</p>
                  <p className="flex items-center justify-center gap-2 text-sm font-medium"><MapPin className="w-4 h-4 flex-shrink-0" style={{ color: theme.accentColor }} /><span className="break-words">{weddingData.receptionVenue}</span></p>
                </div>
                {weddingData.mapLink && <a href={weddingData.mapLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-full text-sm font-medium" style={{ background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.accentColor})`, color: '#fff' }}><MapPin className="w-4 h-4" />Lihat Peta</a>}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Story */}
      {weddingData.story && (
        <section className="py-16 sm:py-20 px-4 sm:px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8" style={{ fontFamily: theme.headingFont, color: theme.primaryColor }}>Our Story</h2>
            <div className="p-6 sm:p-8 rounded-3xl backdrop-blur-md border" style={{ background: theme.cardBg, borderColor: `${theme.primaryColor}20` }}>
              <p className="leading-relaxed text-sm sm:text-base" style={{ color: theme.textColor }}>{weddingData.story}</p>
            </div>
          </div>
        </section>
      )}

      {/* Gallery */}
      {weddingData.galleryImages && weddingData.galleryImages.length > 0 && (
        <section className="py-16 sm:py-20 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-center text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8" style={{ fontFamily: theme.headingFont, color: theme.primaryColor }}>Galeri Foto</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              {weddingData.galleryImages.map((img, index) => (
                <div key={index} className="rounded-2xl overflow-hidden border shadow-lg aspect-square" style={{ borderColor: `${theme.primaryColor}20` }}>
                  <img src={img} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover hover:scale-110 transition-transform duration-300" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Gift */}
      {(weddingData.bankName || weddingData.bankName2) && (
        <section className="py-16 sm:py-20 px-4 sm:px-6">
          <div className="max-w-2xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-px" style={{ background: `${theme.primaryColor}40` }} />
              <Gift className="w-6 h-6" style={{ color: theme.primaryColor }} />
              <div className="w-12 h-px" style={{ background: `${theme.primaryColor}40` }} />
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: theme.headingFont, color: theme.primaryColor }}>Amplop Digital</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 sm:mt-10">
              {weddingData.bankName && (
                <div className="p-5 sm:p-6 rounded-2xl backdrop-blur-md border" style={{ background: theme.cardBg, borderColor: `${theme.primaryColor}20` }}>
                  <p className="font-bold text-base sm:text-lg mb-2" style={{ color: theme.primaryColor }}>{weddingData.bankName}</p>
                  <p className="text-xl sm:text-2xl font-mono font-bold mb-1 break-all" style={{ color: theme.textColor }}>{weddingData.bankAccount}</p>
                  <p className="text-sm opacity-60" style={{ color: theme.textColor }}>a.n. {weddingData.bankHolder}</p>
                  <button
                    onClick={() => copyToClipboard(weddingData.bankAccount, 'bank1')}
                    className="mt-4 px-5 py-2.5 rounded-full text-sm font-medium min-h-[44px] transition-all"
                    style={{
                      background: copiedAccount === 'bank1' ? '#10b981' : `${theme.primaryColor}15`,
                      color: copiedAccount === 'bank1' ? '#ffffff' : theme.primaryColor,
                      border: `1px solid ${copiedAccount === 'bank1' ? '#10b981' : theme.primaryColor}30`
                    }}
                  >
                    {copiedAccount === 'bank1' ? '✓ Tersalin!' : 'Salin No. Rekening'}
                  </button>
                </div>
              )}
              {weddingData.bankName2 && (
                <div className="p-5 sm:p-6 rounded-2xl backdrop-blur-md border" style={{ background: theme.cardBg, borderColor: `${theme.primaryColor}20` }}>
                  <p className="font-bold text-base sm:text-lg mb-2" style={{ color: theme.primaryColor }}>{weddingData.bankName2}</p>
                  <p className="text-xl sm:text-2xl font-mono font-bold mb-1 break-all" style={{ color: theme.textColor }}>{weddingData.bankAccount2}</p>
                  <p className="text-sm opacity-60" style={{ color: theme.textColor }}>a.n. {weddingData.bankHolder2}</p>
                  <button
                    onClick={() => copyToClipboard(weddingData.bankAccount2, 'bank2')}
                    className="mt-4 px-5 py-2.5 rounded-full text-sm font-medium min-h-[44px] transition-all"
                    style={{
                      background: copiedAccount === 'bank2' ? '#10b981' : `${theme.primaryColor}15`,
                      color: copiedAccount === 'bank2' ? '#ffffff' : theme.primaryColor,
                      border: `1px solid ${copiedAccount === 'bank2' ? '#10b981' : theme.primaryColor}30`
                    }}
                  >
                    {copiedAccount === 'bank2' ? '✓ Tersalin!' : 'Salin No. Rekening'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* RSVP */}
      <section className="py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8" style={{ fontFamily: theme.headingFont, color: theme.primaryColor }}>Konfirmasi Kehadiran</h2>
          <div className="p-6 sm:p-8 rounded-3xl backdrop-blur-md border" style={{ background: theme.cardBg, borderColor: `${theme.primaryColor}20` }}>
            {!showRSVP ? (
              <div className="space-y-5">
                <p className="text-sm opacity-60" style={{ color: theme.textColor }}>Mohon konfirmasi kehadiran Anda</p>
                <div className="flex gap-3 justify-center flex-wrap">
                  <button onClick={() => { setRsvpStatus('accepted'); setShowRSVP(true); }} className="px-6 sm:px-8 py-3 rounded-xl font-medium text-sm min-h-[44px]" style={{ background: `${theme.primaryColor}15`, color: theme.primaryColor, border: `1px solid ${theme.primaryColor}40` }}>✓ Hadir</button>
                  <button onClick={() => { setRsvpStatus('declined'); setShowRSVP(true); }} className="px-6 sm:px-8 py-3 rounded-xl font-medium text-sm min-h-[44px]" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>✗ Tidak Hadir</button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {rsvpStatus === 'accepted' ? (
                  <>
                    <p className="text-green-500 font-medium">✓ Terima kasih! Anda akan hadir</p>
                    <select value={rsvpCount} onChange={e => setRsvpCount(Number(e.target.value))} className="mt-2 p-3 rounded-xl border w-full text-sm min-h-[44px]" style={{ borderColor: `${theme.primaryColor}40`, color: theme.textColor }}>
                      {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} orang</option>)}
                    </select>
                  </>
                ) : (
                  <p className="text-red-400 font-medium">Sayang sekali Anda tidak bisa hadir.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Wishes */}
      <section className="py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-center text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8" style={{ fontFamily: theme.headingFont, color: theme.primaryColor }}>Ucapan & Doa</h2>
          <div className="p-4 sm:p-6 rounded-3xl backdrop-blur-md border mb-6" style={{ background: theme.cardBg, borderColor: `${theme.primaryColor}20` }}>
            <div className="space-y-3">
              <input type="text" value={wishName} onChange={e => setWishName(e.target.value)} placeholder="Nama Anda" className="w-full p-3 rounded-xl border focus:outline-none focus:ring-2 text-sm min-h-[44px]" style={{ borderColor: `${theme.primaryColor}30`, color: theme.textColor }} />
              <textarea value={wishMessage} onChange={e => setWishMessage(e.target.value)} placeholder="Tulis ucapan & doa..." rows={3} className="w-full p-3 rounded-xl border focus:outline-none focus:ring-2 text-sm resize-none" style={{ borderColor: `${theme.primaryColor}30`, color: theme.textColor }} />
              <button onClick={submitWish} className="w-full py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 min-h-[44px]" style={{ background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.accentColor})`, color: '#fff' }}>
                <Send className="w-4 h-4" /> Kirim Ucapan
              </button>
            </div>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {wishes.map((wish, i) => (
              <div key={i} className="p-4 rounded-2xl backdrop-blur-md border" style={{ background: theme.cardBg, borderColor: `${theme.primaryColor}15` }}>
                <div className="flex items-center justify-between mb-1 gap-2">
                  <p className="font-semibold text-sm truncate" style={{ color: theme.primaryColor }}>{wish.name}</p>
                  <p className="text-xs flex-shrink-0" style={{ color: theme.textColor, opacity: 0.4 }}>{wish.time}</p>
                </div>
                <p className="text-sm" style={{ color: theme.textColor, opacity: 0.8 }}>{wish.message}</p>
              </div>
            ))}
            {wishes.length === 0 && <p className="text-center text-sm py-4 opacity-40" style={{ color: theme.textColor }}>Belum ada ucapan.</p>}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 sm:py-16 px-4 sm:px-6 text-center" style={{ borderTop: `1px solid ${theme.primaryColor}15` }}>
        <p className="text-xl sm:text-2xl md:text-3xl font-bold mt-6 break-words" style={{ color: theme.primaryColor, fontFamily: theme.scriptFont, textShadow: `0 0 20px ${theme.primaryColor}20` }}>
          {weddingData.groomName} & {weddingData.brideName}
        </p>
        <div className="flex items-center justify-center gap-3 mt-6">
          <div className="w-12 h-px" style={{ background: `${theme.primaryColor}30` }} />
          <Heart className="w-4 h-4" style={{ color: theme.primaryColor }} />
          <div className="w-12 h-px" style={{ background: `${theme.primaryColor}30` }} />
        </div>
        <p className="text-xs mt-6 opacity-30" style={{ color: theme.textColor }}>© 2025 Wedding Invitation by {ownerDisplayName}</p>
        <a href="#/admin" className="inline-block mt-4 text-xs opacity-20 hover:opacity-50 transition" style={{ color: theme.textColor }}>Admin Panel</a>
      </footer>
    </div>
  );
}

