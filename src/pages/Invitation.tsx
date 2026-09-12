import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { themes } from '../themes/themes';
import { availableFonts } from '../themes/fonts';
import { WeddingData } from '../types';
import { Heart, MapPin, Calendar, Clock, Gift, Music, ChevronDown, MessageCircle, Send, Sparkles, ArrowRight } from 'lucide-react';

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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const to = params.get('to');
    const user = params.get('user');
    if (to) setGuestName(decodeURIComponent(to));

    // Determine which user's invitation to show
    if (user) {
      setOwnerUsername(user);
    } else {
      // Find first live user
      const liveUsers = store.users.filter(u => {
        const isLive = store.liveMap[u.username] || false;
        return isLive && u.isActive;
      });
      if (liveUsers.length > 0) {
        setOwnerUsername(liveUsers[0].username);
      } else if (store.users.length > 0) {
        // Fallback: show first user
        setOwnerUsername(store.users[0].username);
      }
    }

    // Load wishes
    const savedWishes = localStorage.getItem('wedding-wishes');
    if (savedWishes) setWishes(JSON.parse(savedWishes));
  }, []);

  // Get data for the owner
  const weddingData: WeddingData = ownerUsername
    ? (store.weddingDataMap[ownerUsername] || {
        groomName: '', brideName: '', groomFather: '', groomMother: '',
        brideFather: '', brideMother: '', groomParentsAddress: '', brideParentsAddress: '',
        weddingDate: '', weddingTime: '', weddingVenue: '', weddingAddress: '',
        receptionDate: '', receptionTime: '', receptionVenue: '', receptionAddress: '',
        mapLink: '', coverImage: '', groomPhoto: '', bridePhoto: '', couplePhoto: '',
        galleryImages: [], story: '', quote: '', quoteSource: '', musicUrl: '',
        bankName: '', bankAccount: '', bankHolder: '', bankName2: '', bankAccount2: '', bankHolder2: '',
        greeting: '', customFont: 'poppins'
      })
    : { groomName: '', brideName: '', groomFather: '', groomMother: '',
        brideFather: '', brideMother: '', groomParentsAddress: '', brideParentsAddress: '',
        weddingDate: '', weddingTime: '', weddingVenue: '', weddingAddress: '',
        receptionDate: '', receptionTime: '', receptionVenue: '', receptionAddress: '',
        mapLink: '', coverImage: '', groomPhoto: '', bridePhoto: '', couplePhoto: '',
        galleryImages: [], story: '', quote: '', quoteSource: '', musicUrl: '',
        bankName: '', bankAccount: '', bankHolder: '', bankName2: '', bankAccount2: '', bankHolder2: '',
        greeting: '', customFont: 'poppins'
      };

  const selectedTheme = ownerUsername ? (store.themeMap[ownerUsername] || 'elegant-gold') : 'elegant-gold';
  const isLive = ownerUsername ? (store.liveMap[ownerUsername] || false) : false;
  const ownerDisplayName = ownerUsername ? store.getUserDisplayName(ownerUsername) : '';

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

  // If no owner found or not live
  if (!ownerUsername || (!isLive && !store.isAuthenticated)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
        <div className="text-center px-6">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center animate-pulse">
            <Heart className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: bodyFont.family }}>Undangan Belum Aktif</h1>
          <p className="text-gray-400" style={{ fontFamily: bodyFont.family }}>Undangan ini belum dipublikasikan oleh pemilik.</p>
        </div>
      </div>
    );
  }

  // Cover / Opening
  if (!showContent) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: theme.bgGradient, fontFamily: bodyFont.family }}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full animate-pulse" style={{ background: `radial-gradient(circle, ${theme.primaryColor}30, transparent)`, filter: 'blur(60px)', animationDuration: '4s' }} />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full animate-pulse" style={{ background: `radial-gradient(circle, ${theme.accentColor}25, transparent)`, filter: 'blur(80px)', animationDuration: '6s' }} />
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

        <div className="text-center px-6 relative z-10">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-20 h-px" style={{ background: `linear-gradient(to right, transparent, ${theme.primaryColor})` }} />
            <Sparkles className="w-4 h-4" style={{ color: theme.primaryColor }} />
            <div className="w-20 h-px" style={{ background: `linear-gradient(to left, transparent, ${theme.primaryColor})` }} />
          </div>
          <p className="text-xs uppercase tracking-[0.4em] mb-6 opacity-60" style={{ color: theme.textColor }}>✦ The Wedding Of ✦</p>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold animate-fade-in-up" style={{
            fontFamily: theme.scriptFont, color: theme.primaryColor,
            textShadow: `0 0 40px ${theme.primaryColor}40, 0 0 80px ${theme.primaryColor}20`
          }}>{weddingData.groomName || 'Mempelai Pria'}</h1>
          <div className="flex items-center justify-center gap-4 my-4">
            <div className="w-16 h-px" style={{ background: `linear-gradient(to right, transparent, ${theme.accentColor})` }} />
            <span className="text-3xl md:text-4xl" style={{ fontFamily: theme.scriptFont, color: theme.accentColor }}>&</span>
            <div className="w-16 h-px" style={{ background: `linear-gradient(to left, transparent, ${theme.accentColor})` }} />
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold animate-fade-in-up" style={{
            fontFamily: theme.scriptFont, color: theme.primaryColor,
            textShadow: `0 0 40px ${theme.primaryColor}40, 0 0 80px ${theme.primaryColor}20`, animationDelay: '0.2s'
          }}>{weddingData.brideName || 'Mempelai Wanita'}</h1>

          {guestName && (
            <div className="mb-8 inline-block">
              <div className="px-6 py-4 rounded-2xl backdrop-blur-md border" style={{ background: theme.cardBg, borderColor: `${theme.primaryColor}30` }}>
                <p className="text-xs uppercase tracking-wider opacity-50 mb-1" style={{ color: theme.textColor }}>Kepada Yth.</p>
                <p className="text-xl font-bold" style={{ color: theme.primaryColor }}>{guestName}</p>
              </div>
            </div>
          )}

          <div className="relative inline-block">
            <button onClick={handleOpen} className="relative px-10 py-4 rounded-full font-medium text-sm transition-all hover:scale-105 group overflow-hidden" style={{
              background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.accentColor})`, color: '#ffffff',
              boxShadow: `0 0 30px ${theme.primaryColor}40, 0 10px 40px ${theme.primaryColor}30`
            }}>
              <span className="relative z-10 flex items-center gap-2">
                Buka Undangan <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </button>
            <div className="absolute -inset-1 rounded-full animate-pulse opacity-50" style={{ background: `linear-gradient(135deg, ${theme.primaryColor}40, ${theme.accentColor}40)`, filter: 'blur(8px)' }} />
          </div>
          <ChevronDown className="w-5 h-5 mx-auto mt-10 animate-bounce opacity-40" style={{ color: theme.textColor }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: theme.bgGradient, minHeight: '100vh', fontFamily: bodyFont.family }} className="relative">
      <button onClick={() => setIsPlaying(!isPlaying)} className="fixed top-4 right-4 z-50 w-11 h-11 rounded-full flex items-center justify-center shadow-lg backdrop-blur-md border transition-all hover:scale-110" style={{ background: theme.cardBg, borderColor: `${theme.primaryColor}30`, color: theme.primaryColor }}>
        <Music className={`w-5 h-5 ${isPlaying ? 'animate-spin' : ''}`} />
      </button>

      {/* Hero */}
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden px-6">
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
          <div className="flex items-center justify-center gap-6 mb-8">
            {weddingData.groomPhoto ? (
              <div className="relative">
                <div className="w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden border-2 shadow-xl" style={{ borderColor: `${theme.primaryColor}60`, boxShadow: `0 0 30px ${theme.primaryColor}30` }}>
                  <img src={weddingData.groomPhoto} alt="Groom" className="w-full h-full object-cover" />
                </div>
              </div>
            ) : (
              <div className="w-28 h-28 md:w-36 md:h-36 rounded-full flex items-center justify-center text-5xl border-2" style={{ background: `${theme.primaryColor}10`, borderColor: `${theme.primaryColor}30` }}>🤵</div>
            )}
            <div className="text-3xl md:text-4xl" style={{ fontFamily: theme.scriptFont, color: theme.accentColor }}>&</div>
            {weddingData.bridePhoto ? (
              <div className="relative">
                <div className="w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden border-2 shadow-xl" style={{ borderColor: `${theme.primaryColor}60`, boxShadow: `0 0 30px ${theme.primaryColor}30` }}>
                  <img src={weddingData.bridePhoto} alt="Bride" className="w-full h-full object-cover" />
                </div>
              </div>
            ) : (
              <div className="w-28 h-28 md:w-36 md:h-36 rounded-full flex items-center justify-center text-5xl border-2" style={{ background: `${theme.primaryColor}10`, borderColor: `${theme.primaryColor}30` }}>👰</div>
            )}
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-2" style={{ fontFamily: theme.scriptFont, color: theme.primaryColor, textShadow: `0 0 40px ${theme.primaryColor}30` }}>
            {weddingData.groomName}
          </h1>
          <div className="flex items-center justify-center gap-3 my-2">
            <div className="w-12 h-px" style={{ background: `${theme.primaryColor}60` }} />
            <span className="text-2xl" style={{ fontFamily: theme.scriptFont, color: theme.accentColor }}>&</span>
            <div className="w-12 h-px" style={{ background: `${theme.primaryColor}60` }} />
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8" style={{ fontFamily: theme.scriptFont, color: theme.primaryColor, textShadow: `0 0 40px ${theme.primaryColor}30` }}>
            {weddingData.brideName}
          </h1>
          {weddingData.weddingDate && <p className="text-sm opacity-50" style={{ color: theme.textColor }}>{formatDate(weddingData.weddingDate)}</p>}
        </div>
      </section>

      {/* Quote */}
      {weddingData.quote && (
        <section className="py-20 px-6 relative">
          <div className="max-w-2xl mx-auto text-center">
            <div className="p-8 md:p-12 rounded-3xl backdrop-blur-md border relative overflow-hidden" style={{ background: theme.cardBg, borderColor: `${theme.primaryColor}20` }}>
              <p className="text-lg md:text-xl italic leading-relaxed mb-4" style={{ color: theme.textColor }}>"{weddingData.quote}"</p>
              <p className="text-sm font-semibold" style={{ color: theme.primaryColor }}>— {weddingData.quoteSource}</p>
            </div>
          </div>
        </section>
      )}

      {/* Couple */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-center text-3xl md:text-5xl font-bold mb-4" style={{ fontFamily: theme.headingFont, color: theme.primaryColor }}>Mempelai</h2>
          {weddingData.greeting && <p className="text-center text-sm mb-12 opacity-60" style={{ color: theme.textColor }}>{weddingData.greeting}</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 rounded-3xl backdrop-blur-md border text-center relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300" style={{ background: theme.cardBg, borderColor: `${theme.primaryColor}20` }}>
              {weddingData.groomPhoto ? (
                <div className="w-36 h-36 mx-auto mb-6 rounded-full overflow-hidden border-2 shadow-lg" style={{ borderColor: `${theme.primaryColor}50` }}>
                  <img src={weddingData.groomPhoto} alt="Groom" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-36 h-36 mx-auto mb-6 rounded-full flex items-center justify-center text-6xl border-2" style={{ background: `${theme.primaryColor}10`, borderColor: `${theme.primaryColor}30` }}>🤵</div>
              )}
              <h3 className="text-2xl md:text-3xl font-bold mb-3" style={{ fontFamily: theme.headingFont, color: theme.primaryColor }}>{weddingData.groomName}</h3>
              <p className="text-sm mb-1" style={{ color: theme.textColor, opacity: 0.7 }}>Putra dari</p>
              <p className="font-medium" style={{ color: theme.textColor }}>{weddingData.groomFather} & {weddingData.groomMother}</p>
              {weddingData.groomParentsAddress && <p className="text-xs opacity-40 mt-2" style={{ color: theme.textColor }}>{weddingData.groomParentsAddress}</p>}
            </div>
            <div className="p-8 rounded-3xl backdrop-blur-md border text-center relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300" style={{ background: theme.cardBg, borderColor: `${theme.primaryColor}20` }}>
              {weddingData.bridePhoto ? (
                <div className="w-36 h-36 mx-auto mb-6 rounded-full overflow-hidden border-2 shadow-lg" style={{ borderColor: `${theme.primaryColor}50` }}>
                  <img src={weddingData.bridePhoto} alt="Bride" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-36 h-36 mx-auto mb-6 rounded-full flex items-center justify-center text-6xl border-2" style={{ background: `${theme.primaryColor}10`, borderColor: `${theme.primaryColor}30` }}>👰</div>
              )}
              <h3 className="text-2xl md:text-3xl font-bold mb-3" style={{ fontFamily: theme.headingFont, color: theme.primaryColor }}>{weddingData.brideName}</h3>
              <p className="text-sm mb-1" style={{ color: theme.textColor, opacity: 0.7 }}>Putri dari</p>
              <p className="font-medium" style={{ color: theme.textColor }}>{weddingData.brideFather} & {weddingData.brideMother}</p>
              {weddingData.brideParentsAddress && <p className="text-xs opacity-40 mt-2" style={{ color: theme.textColor }}>{weddingData.brideParentsAddress}</p>}
            </div>
          </div>
          {weddingData.couplePhoto && (
            <div className="mt-12 rounded-3xl overflow-hidden border shadow-2xl" style={{ borderColor: `${theme.primaryColor}20` }}>
              <img src={weddingData.couplePhoto} alt="Couple" className="w-full h-auto" />
            </div>
          )}
        </div>
      </section>

      {/* Countdown */}
      {weddingData.weddingDate && (
        <section className="py-20 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-10" style={{ fontFamily: theme.headingFont, color: theme.primaryColor }}>Menghitung Hari</h2>
            <div className="grid grid-cols-4 gap-3 md:gap-5">
              {[{ label: 'Hari', value: countdown.days }, { label: 'Jam', value: countdown.hours }, { label: 'Menit', value: countdown.minutes }, { label: 'Detik', value: countdown.seconds }].map(item => (
                <div key={item.label} className="p-4 md:p-6 rounded-2xl backdrop-blur-md border" style={{ background: theme.cardBg, borderColor: `${theme.primaryColor}20` }}>
                  <p className="text-3xl md:text-5xl font-bold" style={{ color: theme.primaryColor, fontFamily: theme.headingFont, textShadow: `0 0 20px ${theme.primaryColor}30` }}>
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
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-center text-3xl md:text-5xl font-bold mb-12" style={{ fontFamily: theme.headingFont, color: theme.primaryColor }}>Acara</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {weddingData.weddingVenue && (
              <div className="p-8 rounded-3xl backdrop-blur-md border text-center" style={{ background: theme.cardBg, borderColor: `${theme.primaryColor}20` }}>
                <div className="w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center" style={{ background: `${theme.primaryColor}15` }}>
                  <Heart className="w-7 h-7" style={{ color: theme.primaryColor }} />
                </div>
                <h3 className="text-xl font-bold mb-5" style={{ fontFamily: theme.headingFont, color: theme.primaryColor }}>Akad Nikah</h3>
                <div className="space-y-3" style={{ color: theme.textColor }}>
                  <p className="flex items-center justify-center gap-2 text-sm"><Calendar className="w-4 h-4" style={{ color: theme.accentColor }} />{formatDate(weddingData.weddingDate)}</p>
                  <p className="flex items-center justify-center gap-2 text-sm"><Clock className="w-4 h-4" style={{ color: theme.accentColor }} />{weddingData.weddingTime} WIB</p>
                  <p className="flex items-center justify-center gap-2 text-sm font-medium"><MapPin className="w-4 h-4" style={{ color: theme.accentColor }} />{weddingData.weddingVenue}</p>
                </div>
                {weddingData.mapLink && <a href={weddingData.mapLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-full text-sm font-medium" style={{ background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.accentColor})`, color: '#fff' }}><MapPin className="w-4 h-4" />Lihat Peta</a>}
              </div>
            )}
            {weddingData.receptionVenue && (
              <div className="p-8 rounded-3xl backdrop-blur-md border text-center" style={{ background: theme.cardBg, borderColor: `${theme.primaryColor}20` }}>
                <div className="w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center" style={{ background: `${theme.primaryColor}15` }}>
                  <Calendar className="w-7 h-7" style={{ color: theme.primaryColor }} />
                </div>
                <h3 className="text-xl font-bold mb-5" style={{ fontFamily: theme.headingFont, color: theme.primaryColor }}>Resepsi</h3>
                <div className="space-y-3" style={{ color: theme.textColor }}>
                  <p className="flex items-center justify-center gap-2 text-sm"><Calendar className="w-4 h-4" style={{ color: theme.accentColor }} />{formatDate(weddingData.receptionDate)}</p>
                  <p className="flex items-center justify-center gap-2 text-sm"><Clock className="w-4 h-4" style={{ color: theme.accentColor }} />{weddingData.receptionTime} WIB</p>
                  <p className="flex items-center justify-center gap-2 text-sm font-medium"><MapPin className="w-4 h-4" style={{ color: theme.accentColor }} />{weddingData.receptionVenue}</p>
                </div>
                {weddingData.mapLink && <a href={weddingData.mapLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-full text-sm font-medium" style={{ background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.accentColor})`, color: '#fff' }}><MapPin className="w-4 h-4" />Lihat Peta</a>}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Story */}
      {weddingData.story && (
        <section className="py-20 px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-8" style={{ fontFamily: theme.headingFont, color: theme.primaryColor }}>Our Story</h2>
            <div className="p-8 rounded-3xl backdrop-blur-md border" style={{ background: theme.cardBg, borderColor: `${theme.primaryColor}20` }}>
              <p className="leading-relaxed" style={{ color: theme.textColor }}>{weddingData.story}</p>
            </div>
          </div>
        </section>
      )}

      {/* Gift */}
      {(weddingData.bankName || weddingData.bankName2) && (
        <section className="py-20 px-6">
          <div className="max-w-2xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-px" style={{ background: `${theme.primaryColor}40` }} />
              <Gift className="w-6 h-6" style={{ color: theme.primaryColor }} />
              <div className="w-12 h-px" style={{ background: `${theme.primaryColor}40` }} />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: theme.headingFont, color: theme.primaryColor }}>Amplop Digital</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-10">
              {weddingData.bankName && (
                <div className="p-6 rounded-2xl backdrop-blur-md border" style={{ background: theme.cardBg, borderColor: `${theme.primaryColor}20` }}>
                  <p className="font-bold text-lg mb-2" style={{ color: theme.primaryColor }}>{weddingData.bankName}</p>
                  <p className="text-2xl font-mono font-bold mb-1" style={{ color: theme.textColor }}>{weddingData.bankAccount}</p>
                  <p className="text-sm opacity-60" style={{ color: theme.textColor }}>a.n. {weddingData.bankHolder}</p>
                  <button onClick={() => navigator.clipboard.writeText(weddingData.bankAccount)} className="mt-4 px-5 py-2 rounded-full text-sm font-medium" style={{ background: `${theme.primaryColor}15`, color: theme.primaryColor, border: `1px solid ${theme.primaryColor}30` }}>
                    Salin No. Rekening
                  </button>
                </div>
              )}
              {weddingData.bankName2 && (
                <div className="p-6 rounded-2xl backdrop-blur-md border" style={{ background: theme.cardBg, borderColor: `${theme.primaryColor}20` }}>
                  <p className="font-bold text-lg mb-2" style={{ color: theme.primaryColor }}>{weddingData.bankName2}</p>
                  <p className="text-2xl font-mono font-bold mb-1" style={{ color: theme.textColor }}>{weddingData.bankAccount2}</p>
                  <p className="text-sm opacity-60" style={{ color: theme.textColor }}>a.n. {weddingData.bankHolder2}</p>
                  <button onClick={() => navigator.clipboard.writeText(weddingData.bankAccount2)} className="mt-4 px-5 py-2 rounded-full text-sm font-medium" style={{ background: `${theme.primaryColor}15`, color: theme.primaryColor, border: `1px solid ${theme.primaryColor}30` }}>
                    Salin No. Rekening
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* RSVP */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8" style={{ fontFamily: theme.headingFont, color: theme.primaryColor }}>Konfirmasi Kehadiran</h2>
          <div className="p-8 rounded-3xl backdrop-blur-md border" style={{ background: theme.cardBg, borderColor: `${theme.primaryColor}20` }}>
            {!showRSVP ? (
              <div className="space-y-5">
                <p className="text-sm opacity-60" style={{ color: theme.textColor }}>Mohon konfirmasi kehadiran Anda</p>
                <div className="flex gap-3 justify-center flex-wrap">
                  <button onClick={() => { setRsvpStatus('accepted'); setShowRSVP(true); }} className="px-8 py-3 rounded-xl font-medium text-sm" style={{ background: `${theme.primaryColor}15`, color: theme.primaryColor, border: `1px solid ${theme.primaryColor}40` }}>✓ Hadir</button>
                  <button onClick={() => { setRsvpStatus('declined'); setShowRSVP(true); }} className="px-8 py-3 rounded-xl font-medium text-sm" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>✗ Tidak Hadir</button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {rsvpStatus === 'accepted' ? (
                  <>
                    <p className="text-green-500 font-medium">✓ Terima kasih! Anda akan hadir</p>
                    <select value={rsvpCount} onChange={e => setRsvpCount(Number(e.target.value))} className="mt-2 p-3 rounded-xl border w-full text-sm" style={{ borderColor: `${theme.primaryColor}40`, color: theme.textColor }}>
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
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-center text-3xl md:text-4xl font-bold mb-8" style={{ fontFamily: theme.headingFont, color: theme.primaryColor }}>Ucapan & Doa</h2>
          <div className="p-6 rounded-3xl backdrop-blur-md border mb-6" style={{ background: theme.cardBg, borderColor: `${theme.primaryColor}20` }}>
            <div className="space-y-3">
              <input type="text" value={wishName} onChange={e => setWishName(e.target.value)} placeholder="Nama Anda" className="w-full p-3 rounded-xl border focus:outline-none focus:ring-2 text-sm" style={{ borderColor: `${theme.primaryColor}30`, color: theme.textColor }} />
              <textarea value={wishMessage} onChange={e => setWishMessage(e.target.value)} placeholder="Tulis ucapan & doa..." rows={3} className="w-full p-3 rounded-xl border focus:outline-none focus:ring-2 text-sm resize-none" style={{ borderColor: `${theme.primaryColor}30`, color: theme.textColor }} />
              <button onClick={submitWish} className="w-full py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2" style={{ background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.accentColor})`, color: '#fff' }}>
                <Send className="w-4 h-4" /> Kirim Ucapan
              </button>
            </div>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {wishes.map((wish, i) => (
              <div key={i} className="p-4 rounded-2xl backdrop-blur-md border" style={{ background: theme.cardBg, borderColor: `${theme.primaryColor}15` }}>
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-sm" style={{ color: theme.primaryColor }}>{wish.name}</p>
                  <p className="text-xs" style={{ color: theme.textColor, opacity: 0.4 }}>{wish.time}</p>
                </div>
                <p className="text-sm" style={{ color: theme.textColor, opacity: 0.8 }}>{wish.message}</p>
              </div>
            ))}
            {wishes.length === 0 && <p className="text-center text-sm py-4 opacity-40" style={{ color: theme.textColor }}>Belum ada ucapan.</p>}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 text-center" style={{ borderTop: `1px solid ${theme.primaryColor}15` }}>
        <p className="text-2xl md:text-3xl font-bold mt-6" style={{ color: theme.primaryColor, fontFamily: theme.scriptFont, textShadow: `0 0 20px ${theme.primaryColor}20` }}>
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
