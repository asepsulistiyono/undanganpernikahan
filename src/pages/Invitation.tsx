import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { themes } from '../themes/themes';
import { Heart, MapPin, Calendar, Clock, Gift, Music, ChevronDown, MessageCircle, Send } from 'lucide-react';

export default function Invitation() {
  const store = useStore();
  const theme = themes.find(t => t.id === store.selectedTheme) || themes[0];
  const [guestName, setGuestName] = useState('');
  const [showContent, setShowContent] = useState(false);
  const [showWish, setShowWish] = useState(false);
  const [wishes, setWishes] = useState<{name: string; message: string; time: string}[]>([]);
  const [wishName, setWishName] = useState('');
  const [wishMessage, setWishMessage] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [rsvpStatus, setRsvpStatus] = useState<'pending' | 'accepted' | 'declined'>('pending');
  const [rsvpCount, setRsvpCount] = useState(1);
  const [showRSVP, setShowRSVP] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const to = params.get('to');
    if (to) setGuestName(decodeURIComponent(to));

    const savedWishes = localStorage.getItem('wedding-wishes');
    if (savedWishes) setWishes(JSON.parse(savedWishes));
  }, []);

  useEffect(() => {
    const targetDate = new Date(`${store.weddingData.weddingDate}T${store.weddingData.weddingTime}:00`).getTime();
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
  }, [store.weddingData.weddingDate, store.weddingData.weddingTime]);

  const handleOpen = () => {
    setShowContent(true);
  };

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
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (!store.isLive && !store.isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <Heart className="w-16 h-16 mx-auto mb-4 text-amber-500" />
          <h1 className="text-2xl font-bold mb-2">Undangan Belum Aktif</h1>
          <p className="text-gray-400">Undangan ini belum dipublikasikan oleh pemilik.</p>
        </div>
      </div>
    );
  }

  // Cover / Opening
  if (!showContent) {
    return (
      <div
        className="min-h-screen flex items-center justify-center relative overflow-hidden"
        style={{ background: theme.bgGradient }}
      >
        {/* Decorative Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-40 h-40 rounded-full" style={{ background: theme.accentColor, filter: 'blur(80px)' }} />
          <div className="absolute bottom-20 right-10 w-60 h-60 rounded-full" style={{ background: theme.primaryColor, filter: 'blur(100px)' }} />
          <div className="absolute top-1/2 left-1/2 w-32 h-32 rounded-full" style={{ background: theme.secondaryColor, filter: 'blur(60px)' }} />
        </div>

        {/* Decorative SVG patterns */}
        <svg className="absolute top-0 left-0 w-full h-full opacity-10" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="coverPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="1" fill={theme.primaryColor} />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#coverPattern)" />
        </svg>

        {/* Corner decorations */}
        <div className="absolute top-0 left-0 w-32 h-32 opacity-30">
          <svg viewBox="0 0 100 100" fill="none">
            <path d="M0 0 Q50 0 50 50 Q50 0 100 0" stroke={theme.primaryColor} strokeWidth="0.5" fill="none"/>
            <path d="M0 0 Q0 50 50 50 Q0 50 0 100" stroke={theme.primaryColor} strokeWidth="0.5" fill="none"/>
            <circle cx="25" cy="25" r="3" fill={theme.accentColor} opacity="0.5"/>
            <circle cx="15" cy="40" r="2" fill={theme.primaryColor} opacity="0.3"/>
          </svg>
        </div>
        <div className="absolute bottom-0 right-0 w-32 h-32 opacity-30 rotate-180">
          <svg viewBox="0 0 100 100" fill="none">
            <path d="M0 0 Q50 0 50 50 Q50 0 100 0" stroke={theme.primaryColor} strokeWidth="0.5" fill="none"/>
            <path d="M0 0 Q0 50 50 50 Q0 50 0 100" stroke={theme.primaryColor} strokeWidth="0.5" fill="none"/>
            <circle cx="25" cy="25" r="3" fill={theme.accentColor} opacity="0.5"/>
            <circle cx="15" cy="40" r="2" fill={theme.primaryColor} opacity="0.3"/>
          </svg>
        </div>

        <div className="text-center px-6 relative z-10">
          {/* Decorative line */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-16 h-px" style={{ background: `linear-gradient(to right, transparent, ${theme.primaryColor})` }} />
            <Heart className="w-4 h-4" style={{ color: theme.primaryColor }} />
            <div className="w-16 h-px" style={{ background: `linear-gradient(to left, transparent, ${theme.primaryColor})` }} />
          </div>

          <p className="text-sm uppercase tracking-[0.3em] mb-4 opacity-70" style={{ color: theme.textColor, fontFamily: theme.fontFamily }}>
            The Wedding Of
          </p>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 animate-fade-in-up" style={{ fontFamily: theme.scriptFont, color: theme.primaryColor }}>
            {store.weddingData.groomName}
          </h1>
          <div className="flex items-center justify-center gap-4 my-2">
            <div className="w-12 h-px" style={{ background: theme.primaryColor, opacity: 0.5 }} />
            <p className="text-2xl md:text-3xl" style={{ fontFamily: theme.scriptFont, color: theme.textColor }}>&</p>
            <div className="w-12 h-px" style={{ background: theme.primaryColor, opacity: 0.5 }} />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-8 animate-fade-in-up" style={{ fontFamily: theme.scriptFont, color: theme.primaryColor, animationDelay: '0.2s' }}>
            {store.weddingData.brideName}
          </h1>

          {guestName && (
            <div className="mb-8 p-4 rounded-xl" style={{ background: `${theme.cardBg}` }}>
              <p className="text-xs uppercase tracking-wider opacity-60 mb-1" style={{ color: theme.textColor, fontFamily: theme.fontFamily }}>Kepada Yth.</p>
              <p className="text-lg font-semibold" style={{ color: theme.primaryColor, fontFamily: theme.headingFont }}>{guestName}</p>
            </div>
          )}

          <button
            onClick={handleOpen}
            className="px-8 py-3.5 rounded-full font-medium text-sm transition hover:scale-105 shadow-lg animate-pulse-glow"
            style={{
              background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.accentColor})`,
              color: '#ffffff',
              fontFamily: theme.fontFamily
            }}
          >
            ✉ Buka Undangan
          </button>
          <ChevronDown className="w-6 h-6 mx-auto mt-8 animate-bounce opacity-50" style={{ color: theme.textColor }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: theme.bgGradient, minHeight: '100vh' }} className="relative">
      {/* Music Toggle */}
      <button
        onClick={() => setIsPlaying(!isPlaying)}
        className="fixed top-4 right-4 z-50 w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
        style={{ background: theme.cardBg, color: theme.primaryColor }}
      >
        <Music className={`w-5 h-5 ${isPlaying ? 'animate-spin' : ''}`} />
      </button>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden px-6">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-48 h-48 rounded-full" style={{ background: theme.accentColor, filter: 'blur(100px)' }} />
          <div className="absolute bottom-20 right-10 w-64 h-64 rounded-full" style={{ background: theme.primaryColor, filter: 'blur(120px)' }} />
        </div>
        <div className="text-center relative z-10 py-20">
          <p className="text-sm uppercase tracking-[0.3em] mb-6 opacity-70" style={{ color: theme.textColor, fontFamily: theme.fontFamily }}>
            The Wedding Of
          </p>
          <h1 className="text-5xl md:text-7xl font-bold mb-2" style={{ fontFamily: theme.scriptFont, color: theme.primaryColor }}>
            {store.weddingData.groomName}
          </h1>
          <p className="text-3xl mb-2" style={{ fontFamily: theme.scriptFont, color: theme.textColor }}>&</p>
          <h1 className="text-5xl md:text-7xl font-bold mb-8" style={{ fontFamily: theme.scriptFont, color: theme.primaryColor }}>
            {store.weddingData.brideName}
          </h1>
          <p className="text-sm opacity-60" style={{ color: theme.textColor, fontFamily: theme.fontFamily }}>
            {formatDate(store.weddingData.weddingDate)}
          </p>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-16 px-6">
        <div className="max-w-2xl mx-auto text-center" style={{ fontFamily: theme.fontFamily }}>
          <p className="text-lg md:text-xl italic leading-relaxed mb-4" style={{ color: theme.textColor }}>
            {store.weddingData.quote}
          </p>
          <p className="text-sm font-semibold" style={{ color: theme.primaryColor }}>
            — {store.weddingData.quoteSource}
          </p>
        </div>
      </section>

      {/* Couple Section */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-center text-3xl md:text-4xl font-bold mb-12" style={{ fontFamily: theme.headingFont, color: theme.primaryColor }}>
            Mempelai
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Groom */}
            <div className="text-center p-8 rounded-2xl" style={{ background: theme.cardBg, backdropFilter: 'blur(10px)' }}>
              <div className="w-32 h-32 mx-auto mb-4 rounded-full flex items-center justify-center text-5xl" style={{ background: `linear-gradient(135deg, ${theme.primaryColor}20, ${theme.accentColor}20)`, border: `2px solid ${theme.primaryColor}40` }}>
                🤵
              </div>
              <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: theme.headingFont, color: theme.primaryColor }}>
                {store.weddingData.groomName}
              </h3>
              <p className="text-sm mb-4" style={{ color: theme.textColor, opacity: 0.7 }}>
                Putra dari<br/>
                <span className="font-medium">{store.weddingData.groomFather}</span> & <span className="font-medium">{store.weddingData.groomMother}</span>
              </p>
              <p className="text-xs" style={{ color: theme.textColor, opacity: 0.5 }}>
                {store.weddingData.groomParentsAddress}
              </p>
            </div>

            {/* Bride */}
            <div className="text-center p-8 rounded-2xl" style={{ background: theme.cardBg, backdropFilter: 'blur(10px)' }}>
              <div className="w-32 h-32 mx-auto mb-4 rounded-full flex items-center justify-center text-5xl" style={{ background: `linear-gradient(135deg, ${theme.primaryColor}20, ${theme.accentColor}20)`, border: `2px solid ${theme.primaryColor}40` }}>
                👰
              </div>
              <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: theme.headingFont, color: theme.primaryColor }}>
                {store.weddingData.brideName}
              </h3>
              <p className="text-sm mb-4" style={{ color: theme.textColor, opacity: 0.7 }}>
                Putri dari<br/>
                <span className="font-medium">{store.weddingData.brideFather}</span> & <span className="font-medium">{store.weddingData.brideMother}</span>
              </p>
              <p className="text-xs" style={{ color: theme.textColor, opacity: 0.5 }}>
                {store.weddingData.brideParentsAddress}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Countdown */}
      <section className="py-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8" style={{ fontFamily: theme.headingFont, color: theme.primaryColor }}>
            Menghitung Hari
          </h2>
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Hari', value: countdown.days },
              { label: 'Jam', value: countdown.hours },
              { label: 'Menit', value: countdown.minutes },
              { label: 'Detik', value: countdown.seconds },
            ].map(item => (
              <div key={item.label} className="p-4 rounded-xl" style={{ background: theme.cardBg, backdropFilter: 'blur(10px)' }}>
                <p className="text-2xl md:text-4xl font-bold" style={{ color: theme.primaryColor, fontFamily: theme.headingFont }}>
                  {item.value}
                </p>
                <p className="text-xs mt-1" style={{ color: theme.textColor, opacity: 0.6, fontFamily: theme.fontFamily }}>
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Event Details */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-center text-3xl md:text-4xl font-bold mb-12" style={{ fontFamily: theme.headingFont, color: theme.primaryColor }}>
            Acara
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Akad */}
            <div className="p-8 rounded-2xl text-center" style={{ background: theme.cardBg, backdropFilter: 'blur(10px)' }}>
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: `${theme.primaryColor}20` }}>
                <Heart className="w-8 h-8" style={{ color: theme.primaryColor }} />
              </div>
              <h3 className="text-xl font-bold mb-4" style={{ fontFamily: theme.headingFont, color: theme.primaryColor }}>Akad Nikah</h3>
              <div className="space-y-2" style={{ color: theme.textColor }}>
                <p className="flex items-center justify-center gap-2 text-sm">
                  <Calendar className="w-4 h-4" style={{ color: theme.accentColor }} />
                  {formatDate(store.weddingData.weddingDate)}
                </p>
                <p className="flex items-center justify-center gap-2 text-sm">
                  <Clock className="w-4 h-4" style={{ color: theme.accentColor }} />
                  {store.weddingData.weddingTime} WIB
                </p>
                <p className="flex items-center justify-center gap-2 text-sm">
                  <MapPin className="w-4 h-4" style={{ color: theme.accentColor }} />
                  {store.weddingData.weddingVenue}
                </p>
                <p className="text-xs opacity-60">{store.weddingData.weddingAddress}</p>
              </div>
              {store.weddingData.mapLink && (
                <a href={store.weddingData.mapLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full text-sm font-medium" style={{ background: theme.primaryColor, color: '#fff' }}>
                  <MapPin className="w-4 h-4" /> Lihat Peta
                </a>
              )}
            </div>

            {/* Resepsi */}
            <div className="p-8 rounded-2xl text-center" style={{ background: theme.cardBg, backdropFilter: 'blur(10px)' }}>
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: `${theme.primaryColor}20` }}>
                <Calendar className="w-8 h-8" style={{ color: theme.primaryColor }} />
              </div>
              <h3 className="text-xl font-bold mb-4" style={{ fontFamily: theme.headingFont, color: theme.primaryColor }}>Resepsi</h3>
              <div className="space-y-2" style={{ color: theme.textColor }}>
                <p className="flex items-center justify-center gap-2 text-sm">
                  <Calendar className="w-4 h-4" style={{ color: theme.accentColor }} />
                  {formatDate(store.weddingData.receptionDate)}
                </p>
                <p className="flex items-center justify-center gap-2 text-sm">
                  <Clock className="w-4 h-4" style={{ color: theme.accentColor }} />
                  {store.weddingData.receptionTime} WIB
                </p>
                <p className="flex items-center justify-center gap-2 text-sm">
                  <MapPin className="w-4 h-4" style={{ color: theme.accentColor }} />
                  {store.weddingData.receptionVenue}
                </p>
                <p className="text-xs opacity-60">{store.weddingData.receptionAddress}</p>
              </div>
              {store.weddingData.mapLink && (
                <a href={store.weddingData.mapLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full text-sm font-medium" style={{ background: theme.primaryColor, color: '#fff' }}>
                  <MapPin className="w-4 h-4" /> Lihat Peta
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Love Story */}
      <section className="py-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8" style={{ fontFamily: theme.headingFont, color: theme.primaryColor }}>
            Our Story
          </h2>
          <div className="p-8 rounded-2xl" style={{ background: theme.cardBg, backdropFilter: 'blur(10px)' }}>
            <p className="leading-relaxed" style={{ color: theme.textColor, fontFamily: theme.fontFamily }}>
              {store.weddingData.story}
            </p>
          </div>
        </div>
      </section>

      {/* Gift / Amplop Digital */}
      <section className="py-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8" style={{ fontFamily: theme.headingFont, color: theme.primaryColor }}>
            <Gift className="w-8 h-8 mx-auto mb-3 inline-block" style={{ color: theme.primaryColor }} />
            <br/>Amplop Digital
          </h2>
          <p className="mb-8 text-sm" style={{ color: theme.textColor, opacity: 0.7, fontFamily: theme.fontFamily }}>
            Doa restu Anda merupakan karunia yang sangat berarti bagi kami. Namun jika Anda ingin memberikan tanda kasih, kami menyediakan amplop digital.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {store.weddingData.bankName && (
              <div className="p-6 rounded-2xl" style={{ background: theme.cardBg, backdropFilter: 'blur(10px)' }}>
                <p className="font-bold text-lg mb-2" style={{ color: theme.primaryColor, fontFamily: theme.headingFont }}>{store.weddingData.bankName}</p>
                <p className="text-2xl font-mono font-bold mb-1" style={{ color: theme.textColor }}>{store.weddingData.bankAccount}</p>
                <p className="text-sm" style={{ color: theme.textColor, opacity: 0.7 }}>a.n. {store.weddingData.bankHolder}</p>
                <button
                  onClick={() => navigator.clipboard.writeText(store.weddingData.bankAccount)}
                  className="mt-3 px-4 py-2 rounded-full text-sm font-medium"
                  style={{ background: `${theme.primaryColor}20`, color: theme.primaryColor }}
                >
                  Salin No. Rekening
                </button>
              </div>
            )}
            {store.weddingData.bankName2 && (
              <div className="p-6 rounded-2xl" style={{ background: theme.cardBg, backdropFilter: 'blur(10px)' }}>
                <p className="font-bold text-lg mb-2" style={{ color: theme.primaryColor, fontFamily: theme.headingFont }}>{store.weddingData.bankName2}</p>
                <p className="text-2xl font-mono font-bold mb-1" style={{ color: theme.textColor }}>{store.weddingData.bankAccount2}</p>
                <p className="text-sm" style={{ color: theme.textColor, opacity: 0.7 }}>a.n. {store.weddingData.bankHolder2}</p>
                <button
                  onClick={() => navigator.clipboard.writeText(store.weddingData.bankAccount2)}
                  className="mt-3 px-4 py-2 rounded-full text-sm font-medium"
                  style={{ background: `${theme.primaryColor}20`, color: theme.primaryColor }}
                >
                  Salin No. Rekening
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* RSVP Section */}
      <section className="py-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8" style={{ fontFamily: theme.headingFont, color: theme.primaryColor }}>
            Konfirmasi Kehadiran
          </h2>
          <div className="p-6 rounded-2xl" style={{ background: theme.cardBg, backdropFilter: 'blur(10px)' }}>
            {!showRSVP ? (
              <div className="space-y-4">
                <p className="text-sm" style={{ color: theme.textColor, opacity: 0.7, fontFamily: theme.fontFamily }}>
                  Mohon konfirmasi kehadiran Anda
                </p>
                <div className="flex gap-3 justify-center flex-wrap">
                  <button
                    onClick={() => { setRsvpStatus('accepted'); setShowRSVP(true); }}
                    className="px-6 py-3 rounded-xl font-medium text-sm"
                    style={{ background: `${theme.primaryColor}20`, color: theme.primaryColor, border: `1px solid ${theme.primaryColor}40` }}
                  >
                    ✓ Hadir
                  </button>
                  <button
                    onClick={() => { setRsvpStatus('declined'); setShowRSVP(true); }}
                    className="px-6 py-3 rounded-xl font-medium text-sm"
                    style={{ background: `rgba(239,68,68,0.1)`, color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}
                  >
                    ✗ Tidak Hadir
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {rsvpStatus === 'accepted' ? (
                  <>
                    <p className="text-green-600 font-medium">✓ Terima kasih! Anda akan hadir</p>
                    <div>
                      <label className="text-sm" style={{ color: theme.textColor }}>Jumlah yang hadir:</label>
                      <select
                        value={rsvpCount}
                        onChange={e => setRsvpCount(Number(e.target.value))}
                        className="mt-2 p-3 rounded-xl border w-full text-sm"
                        style={{ borderColor: `${theme.primaryColor}40` }}
                      >
                        {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} orang</option>)}
                      </select>
                    </div>
                  </>
                ) : (
                  <p className="text-red-500 font-medium">Sayang sekali Anda tidak bisa hadir. Terima kasih atas doanya.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Wishes / RSVP */}
      <section className="py-16 px-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-center text-3xl md:text-4xl font-bold mb-8" style={{ fontFamily: theme.headingFont, color: theme.primaryColor }}>
            <MessageCircle className="w-8 h-8 mx-auto mb-3 inline-block" style={{ color: theme.primaryColor }} />
            <br/>Ucapan & Doa
          </h2>
          <div className="p-6 rounded-2xl mb-6" style={{ background: theme.cardBg, backdropFilter: 'blur(10px)' }}>
            <div className="space-y-3">
              <input
                type="text"
                value={wishName}
                onChange={e => setWishName(e.target.value)}
                placeholder="Nama Anda"
                className="w-full p-3 rounded-xl border focus:outline-none focus:ring-2 text-sm"
                style={{ borderColor: `${theme.primaryColor}40`, background: 'transparent', color: theme.textColor }}
              />
              <textarea
                value={wishMessage}
                onChange={e => setWishMessage(e.target.value)}
                placeholder="Tulis ucapan & doa untuk kedua mempelai..."
                rows={3}
                className="w-full p-3 rounded-xl border focus:outline-none focus:ring-2 text-sm resize-none"
                style={{ borderColor: `${theme.primaryColor}40`, background: 'transparent', color: theme.textColor }}
              />
              <button
                onClick={submitWish}
                className="w-full py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2"
                style={{ background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.accentColor})`, color: '#fff' }}
              >
                <Send className="w-4 h-4" /> Kirim Ucapan
              </button>
            </div>
          </div>

          {/* Wish List */}
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {wishes.map((wish, i) => (
              <div key={i} className="p-4 rounded-xl" style={{ background: theme.cardBg, backdropFilter: 'blur(10px)' }}>
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-sm" style={{ color: theme.primaryColor }}>{wish.name}</p>
                  <p className="text-xs" style={{ color: theme.textColor, opacity: 0.5 }}>{wish.time}</p>
                </div>
                <p className="text-sm" style={{ color: theme.textColor, opacity: 0.8 }}>{wish.message}</p>
              </div>
            ))}
            {wishes.length === 0 && (
              <p className="text-center text-sm py-4" style={{ color: theme.textColor, opacity: 0.5 }}>
                Belum ada ucapan. Jadilah yang pertama!
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 text-center" style={{ borderTop: `1px solid ${theme.primaryColor}20` }}>
        <p className="text-sm mb-2" style={{ color: theme.textColor, opacity: 0.6, fontFamily: theme.fontFamily }}>
          Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu.
        </p>
        <p className="text-lg font-semibold mt-4" style={{ color: theme.primaryColor, fontFamily: theme.scriptFont }}>
          {store.weddingData.groomName} & {store.weddingData.brideName}
        </p>
        <p className="text-xs mt-4" style={{ color: theme.textColor, opacity: 0.4 }}>
          © 2025 Wedding Invitation by {store.adminUser.displayName}
        </p>
        <a href="#/admin" className="inline-block mt-4 text-xs opacity-30 hover:opacity-60 transition" style={{ color: theme.textColor }}>
          Admin Panel
        </a>
      </footer>
    </div>
  );
}
