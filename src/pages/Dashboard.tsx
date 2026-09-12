import { useState } from 'react';
import { useStore } from '../store/useStore';
import { themes } from '../themes/themes';
import ImageUpload from '../components/ImageUpload';
import FontSelector from '../components/FontSelector';
import {
  LogOut, Heart, Users, Palette, Settings, Globe, Upload,
  Plus, Trash2, Search, MessageCircle, FileText, Download, Edit3, X, Check, Copy, Camera, Type
} from 'lucide-react';

interface Props {
  onLogout: () => void;
}

type Tab = 'wedding' | 'guests' | 'themes' | 'settings';

export default function Dashboard({ onLogout }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('wedding');
  const store = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddGuest, setShowAddGuest] = useState(false);
  const [showBulkAdd, setShowBulkAdd] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [editingGuest, setEditingGuest] = useState<string | null>(null);
  const [newGuest, setNewGuest] = useState({ name: '', group: 'Umum', phone: '', tableNumber: '' });
  const [copied, setCopied] = useState<string | null>(null);

  const filteredGuests = store.guests.filter(g =>
    g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.group.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.phone.includes(searchTerm)
  );

  const generateWALink = (guest: typeof store.guests[0]) => {
    const name = encodeURIComponent(guest.name);
    const url = window.location.origin + window.location.pathname + '?to=' + name;
    const waLink = `https://wa.me/${guest.phone}?text=${encodeURIComponent(`Assalamualaikum, kami ingin mengundang Anda ke pernikahan kami. Silakan buka link berikut:\n${url}`)}`;
    return waLink;
  };

  const copyWALink = (guest: typeof store.guests[0]) => {
    const name = encodeURIComponent(guest.name);
    const url = window.location.origin + window.location.pathname + '?to=' + name;
    navigator.clipboard.writeText(url);
    setCopied(guest.id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleBulkAdd = () => {
    const lines = bulkText.split('\n').filter(l => l.trim());
    const guests = lines.map(line => {
      const parts = line.split(/[,;\t]/).map(p => p.trim());
      return {
        name: parts[0] || 'Tamu',
        group: parts[1] || 'Umum',
        phone: parts[2] || '',
        tableNumber: parts[3] || '',
        status: 'pending' as const,
        message: ''
      };
    });
    store.addGuests(guests);
    setBulkText('');
    setShowBulkAdd(false);
  };

  const exportGuests = () => {
    const csv = ['Nama,Grup,Telepon,Meja,Status,Pesan'];
    store.guests.forEach(g => {
      csv.push(`${g.name},${g.group},${g.phone},${g.tableNumber},${g.status},${g.message}`);
    });
    const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'daftar-tamu.csv';
    a.click();
  };

  const sendAllWhatsApp = () => {
    const guestsWithPhone = store.guests.filter(g => g.phone);
    if (guestsWithPhone.length === 0) {
      alert('Tidak ada tamu dengan nomor WhatsApp');
      return;
    }
    if (!confirm(`Akan membuka ${guestsWithPhone.length} tab WhatsApp. Lanjutkan?`)) return;
    
    guestsWithPhone.forEach((guest, index) => {
      setTimeout(() => {
        const link = generateWALink(guest);
        window.open(link, '_blank');
      }, index * 1000); // Open 1 per second to avoid browser blocking
    });
  };

  const generateAllLinks = () => {
    const links = store.guests.map(g => {
      const name = encodeURIComponent(g.name);
      const url = window.location.origin + window.location.pathname + '?to=' + name;
      return `${g.name}\t${g.phone}\t${url}`;
    });
    const text = 'Nama\tTelepon\tLink\n' + links.join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'link-undangan.txt';
    a.click();
  };

  const tabs = [
    { id: 'wedding' as Tab, label: 'Data Pernikahan', icon: Heart },
    { id: 'guests' as Tab, label: 'Tamu Undangan', icon: Users },
    { id: 'themes' as Tab, label: 'Tema', icon: Palette },
    { id: 'settings' as Tab, label: 'Pengaturan', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-800">Wedding Admin</h1>
              <p className="text-xs text-gray-500">Halo, {store.adminUser.displayName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${store.isLive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              <Globe className="w-4 h-4" />
              {store.isLive ? 'Live' : 'Offline'}
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <p className="text-2xl font-bold text-amber-600">{store.guests.length}</p>
            <p className="text-xs text-gray-500">Total Tamu</p>
          </div>
          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <p className="text-2xl font-bold text-green-600">{store.guests.filter(g => g.status === 'accepted').length}</p>
            <p className="text-xs text-gray-500">Konfirmasi Hadir</p>
          </div>
          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <p className="text-2xl font-bold text-blue-600">{store.guests.filter(g => g.phone).length}</p>
            <p className="text-xs text-gray-500">Ada No. WA</p>
          </div>
          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <p className="text-2xl font-bold text-purple-600">{themes.length}</p>
            <p className="text-xs text-gray-500">Tema Tersedia</p>
          </div>
        </div>

        {/* Preview Button */}
        <div className="mb-6">
          <a
            href={window.location.pathname}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-medium hover:from-amber-600 hover:to-amber-700 transition shadow-lg shadow-amber-500/25"
          >
            <Globe className="w-5 h-5" />
            Preview Undangan
          </a>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition ${
                activeTab === tab.id
                  ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/25'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Wedding Data Tab */}
        {activeTab === 'wedding' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Heart className="w-5 h-5 text-amber-500" />
                Data Mempelai & Acara
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Groom Section */}
                <div className="space-y-4 p-4 bg-blue-50 rounded-xl">
                  <h3 className="font-semibold text-blue-800">🤵 Mempelai Pria</h3>
                  <ImageUpload
                    label="Foto Mempelai Pria"
                    value={store.weddingData.groomPhoto}
                    onChange={v => store.updateWeddingData({ groomPhoto: v })}
                    aspectRatio="1/1"
                  />
                  <InputField label="Nama" value={store.weddingData.groomName} onChange={v => store.updateWeddingData({ groomName: v })} />
                  <InputField label="Nama Ayah" value={store.weddingData.groomFather} onChange={v => store.updateWeddingData({ groomFather: v })} />
                  <InputField label="Nama Ibu" value={store.weddingData.groomMother} onChange={v => store.updateWeddingData({ groomMother: v })} />
                  <InputField label="Alamat Orang Tua" value={store.weddingData.groomParentsAddress} onChange={v => store.updateWeddingData({ groomParentsAddress: v })} />
                </div>

                {/* Bride Section */}
                <div className="space-y-4 p-4 bg-pink-50 rounded-xl">
                  <h3 className="font-semibold text-pink-800">👰 Mempelai Wanita</h3>
                  <ImageUpload
                    label="Foto Mempelai Wanita"
                    value={store.weddingData.bridePhoto}
                    onChange={v => store.updateWeddingData({ bridePhoto: v })}
                    aspectRatio="1/1"
                  />
                  <InputField label="Nama" value={store.weddingData.brideName} onChange={v => store.updateWeddingData({ brideName: v })} />
                  <InputField label="Nama Ayah" value={store.weddingData.brideFather} onChange={v => store.updateWeddingData({ brideFather: v })} />
                  <InputField label="Nama Ibu" value={store.weddingData.brideMother} onChange={v => store.updateWeddingData({ brideMother: v })} />
                  <InputField label="Alamat Orang Tua" value={store.weddingData.brideParentsAddress} onChange={v => store.updateWeddingData({ brideParentsAddress: v })} />
                </div>

                {/* Photo Gallery */}
                <div className="space-y-4 p-4 bg-indigo-50 rounded-xl md:col-span-2">
                  <h3 className="font-semibold text-indigo-800 flex items-center gap-2">
                    <Camera className="w-5 h-5" />
                    Foto Bersama & Gallery
                  </h3>
                  <ImageUpload
                    label="Foto Cover / Hero"
                    value={store.weddingData.coverImage}
                    onChange={v => store.updateWeddingData({ coverImage: v })}
                    aspectRatio="16/9"
                    maxSizeMB={0.8}
                  />
                  <ImageUpload
                    label="Foto Bersama Mempelai"
                    value={store.weddingData.couplePhoto}
                    onChange={v => store.updateWeddingData({ couplePhoto: v })}
                    aspectRatio="4/3"
                  />
                </div>

                {/* Font Settings */}
                <div className="space-y-4 p-4 bg-violet-50 rounded-xl md:col-span-2">
                  <h3 className="font-semibold text-violet-800 flex items-center gap-2">
                    <Type className="w-5 h-5" />
                    Pengaturan Font
                  </h3>
                  <FontSelector
                    label="Font Utama (Body Text)"
                    value={store.weddingData.customFont}
                    onChange={v => store.updateWeddingData({ customFont: v })}
                    type="body"
                  />
                  <p className="text-xs text-gray-500">Font ini akan digunakan untuk seluruh teks undangan. Pilih font yang sesuai dengan tema.</p>
                </div>

                {/* Wedding Event */}
                <div className="space-y-4 p-4 bg-green-50 rounded-xl md:col-span-2">
                  <h3 className="font-semibold text-green-800">💒 Akad Nikah</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField label="Tanggal" type="date" value={store.weddingData.weddingDate} onChange={v => store.updateWeddingData({ weddingDate: v })} />
                    <InputField label="Waktu" type="time" value={store.weddingData.weddingTime} onChange={v => store.updateWeddingData({ weddingTime: v })} />
                  </div>
                  <InputField label="Tempat" value={store.weddingData.weddingVenue} onChange={v => store.updateWeddingData({ weddingVenue: v })} />
                  <InputField label="Alamat" value={store.weddingData.weddingAddress} onChange={v => store.updateWeddingData({ weddingAddress: v })} />
                </div>

                {/* Reception */}
                <div className="space-y-4 p-4 bg-purple-50 rounded-xl md:col-span-2">
                  <h3 className="font-semibold text-purple-800">🎉 Resepsi</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField label="Tanggal" type="date" value={store.weddingData.receptionDate} onChange={v => store.updateWeddingData({ receptionDate: v })} />
                    <InputField label="Waktu" type="time" value={store.weddingData.receptionTime} onChange={v => store.updateWeddingData({ receptionTime: v })} />
                  </div>
                  <InputField label="Tempat" value={store.weddingData.receptionVenue} onChange={v => store.updateWeddingData({ receptionVenue: v })} />
                  <InputField label="Alamat" value={store.weddingData.receptionAddress} onChange={v => store.updateWeddingData({ receptionAddress: v })} />
                </div>

                {/* Quote & Story */}
                <div className="space-y-4 p-4 bg-amber-50 rounded-xl md:col-span-2">
                  <h3 className="font-semibold text-amber-800">📖 Kutipan & Cerita</h3>
                  <InputField label="Kutipan" type="textarea" value={store.weddingData.quote} onChange={v => store.updateWeddingData({ quote: v })} />
                  <InputField label="Sumber Kutipan" value={store.weddingData.quoteSource} onChange={v => store.updateWeddingData({ quoteSource: v })} />
                  <InputField label="Cerita Cinta" type="textarea" value={store.weddingData.story} onChange={v => store.updateWeddingData({ story: v })} />
                  <InputField label="Kata Sambutan" type="textarea" value={store.weddingData.greeting} onChange={v => store.updateWeddingData({ greeting: v })} />
                </div>

                {/* Map & Music */}
                <div className="space-y-4 p-4 bg-cyan-50 rounded-xl md:col-span-2">
                  <h3 className="font-semibold text-cyan-800">🗺️ Peta & Musik</h3>
                  <InputField label="Link Google Maps" value={store.weddingData.mapLink} onChange={v => store.updateWeddingData({ mapLink: v })} />
                  <InputField label="URL Musik (mp3)" value={store.weddingData.musicUrl} onChange={v => store.updateWeddingData({ musicUrl: v })} />
                </div>

                {/* Gift/Amplop Digital */}
                <div className="space-y-4 p-4 bg-rose-50 rounded-xl md:col-span-2">
                  <h3 className="font-semibold text-rose-800">💝 Amplop Digital</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField label="Bank 1 - Nama" value={store.weddingData.bankName} onChange={v => store.updateWeddingData({ bankName: v })} />
                    <InputField label="Bank 1 - No. Rekening" value={store.weddingData.bankAccount} onChange={v => store.updateWeddingData({ bankAccount: v })} />
                    <InputField label="Bank 1 - Atas Nama" value={store.weddingData.bankHolder} onChange={v => store.updateWeddingData({ bankHolder: v })} />
                    <InputField label="Bank 2 - Nama" value={store.weddingData.bankName2} onChange={v => store.updateWeddingData({ bankName2: v })} />
                    <InputField label="Bank 2 - No. Rekening" value={store.weddingData.bankAccount2} onChange={v => store.updateWeddingData({ bankAccount2: v })} />
                    <InputField label="Bank 2 - Atas Nama" value={store.weddingData.bankHolder2} onChange={v => store.updateWeddingData({ bankHolder2: v })} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Guests Tab */}
        {activeTab === 'guests' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Users className="w-5 h-5 text-amber-500" />
                  Daftar Tamu ({store.guests.length})
                </h2>
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => setShowAddGuest(true)} className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition text-sm">
                    <Plus className="w-4 h-4" /> Tambah
                  </button>
                  <button onClick={() => setShowBulkAdd(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm">
                    <Upload className="w-4 h-4" /> Import Massal
                  </button>
                  <button onClick={sendAllWhatsApp} className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm">
                    <MessageCircle className="w-4 h-4" /> Kirim Semua WA
                  </button>
                  <button onClick={generateAllLinks} className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition text-sm">
                    <FileText className="w-4 h-4" /> Generate Links
                  </button>
                  <button onClick={exportGuests} className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition text-sm">
                    <Download className="w-4 h-4" /> Export CSV
                  </button>
                  <button onClick={() => { if(confirm('Hapus semua tamu?')) store.clearAllGuests(); }} className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm">
                    <Trash2 className="w-4 h-4" /> Hapus Semua
                  </button>
                </div>
              </div>

              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Cari nama, grup, atau nomor telepon..."
                  className="w-full pl-11 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Guest List */}
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {filteredGuests.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Belum ada tamu. Tambahkan tamu undangan.</p>
                  </div>
                ) : (
                  filteredGuests.map(guest => (
                    <div key={guest.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate">{guest.name}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-xs">{guest.group}</span>
                          {guest.tableNumber && <span>Meja: {guest.tableNumber}</span>}
                          {guest.phone && <span>• {guest.phone}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => copyWALink(guest)}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                          title="Copy Link"
                        >
                          {copied === guest.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                        {guest.phone && (
                          <a
                            href={generateWALink(guest)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition"
                            title="Kirim via WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>
                        )}
                        <button
                          onClick={() => setEditingGuest(guest.id)}
                          className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => { if(confirm('Hapus tamu ini?')) store.deleteGuest(guest.id); }}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Themes Tab */}
        {activeTab === 'themes' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Palette className="w-5 h-5 text-amber-500" />
              Pilih Tema ({themes.length} Tema)
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {themes.map(theme => (
                <button
                  key={theme.id}
                  onClick={() => store.setSelectedTheme(theme.id)}
                  className={`relative p-4 rounded-xl border-2 transition hover:scale-105 ${
                    store.selectedTheme === theme.id
                      ? 'border-amber-500 shadow-lg shadow-amber-500/20'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {store.selectedTheme === theme.id && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div
                    className="w-full h-20 rounded-lg mb-3 flex items-center justify-center text-2xl"
                    style={{ background: theme.bgGradient }}
                  >
                    {theme.preview}
                  </div>
                  <p className="text-sm font-medium text-gray-700 text-center">{theme.name}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Settings className="w-5 h-5 text-amber-500" />
                Pengaturan Akun
              </h2>
              <div className="space-y-4 max-w-md">
                <InputField label="Display Name" value={store.adminUser.displayName} onChange={v => store.updateAdminUser({ displayName: v })} />
                <InputField label="Username" value={store.adminUser.username} onChange={v => store.updateAdminUser({ username: v })} />
                <InputField label="Password" type="password" value={store.adminUser.password} onChange={v => store.updateAdminUser({ password: v })} />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-amber-500" />
                Status Website
              </h2>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium text-gray-800">
                    Website {store.isLive ? 'Aktif (Live)' : 'Tidak Aktif'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {store.isLive ? 'Undangan dapat diakses oleh tamu' : 'Undangan belum dapat diakses'}
                  </p>
                </div>
                <button
                  onClick={store.toggleLive}
                  className={`px-6 py-2.5 rounded-xl font-medium transition ${
                    store.isLive
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
                >
                  {store.isLive ? 'Matikan' : 'Go Live!'}
                </button>
              </div>
              {store.isLive && (
                <div className="mt-4 p-4 bg-green-50 rounded-xl">
                  <p className="text-sm text-green-700 font-medium">🎉 Website undangan Anda sudah LIVE!</p>
                  <p className="text-sm text-green-600 mt-1">Link undangan: <code className="bg-green-100 px-2 py-0.5 rounded">{window.location.origin}{window.location.pathname}</code></p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-500" />
                Panduan Import Tamu
              </h2>
              <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 space-y-2">
                <p className="font-medium text-gray-800">Format Import Massal (1 baris = 1 tamu):</p>
                <code className="block bg-gray-100 p-3 rounded-lg text-xs">
                  Nama Tamu, Grup, No. WhatsApp, No. Meja<br/>
                  Contoh:<br/>
                  Budi Santoso, Keluarga, 081234567890, 5<br/>
                  Ani Wijaya, Teman SMA, 089876543210, 3<br/>
                  Rekan Kerja, Kantor, 08111222333, 1
                </code>
                <p className="text-gray-500 mt-2">Pemisah bisa menggunakan koma (,), titik koma (;), atau tab.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Guest Modal */}
      {showAddGuest && (
        <Modal onClose={() => setShowAddGuest(false)} title="Tambah Tamu">
          <div className="space-y-4">
            <InputField label="Nama Tamu" value={newGuest.name} onChange={v => setNewGuest({...newGuest, name: v})} />
            <InputField label="Grup (Keluarga/Teman/Kantor)" value={newGuest.group} onChange={v => setNewGuest({...newGuest, group: v})} />
            <InputField label="No. WhatsApp" value={newGuest.phone} onChange={v => setNewGuest({...newGuest, phone: v})} />
            <InputField label="No. Meja" value={newGuest.tableNumber} onChange={v => setNewGuest({...newGuest, tableNumber: v})} />
            <button
              onClick={() => {
                if (newGuest.name) {
                  store.addGuest({ ...newGuest, status: 'pending', message: '' });
                  setNewGuest({ name: '', group: 'Umum', phone: '', tableNumber: '' });
                  setShowAddGuest(false);
                }
              }}
              className="w-full py-3 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition"
            >
              Tambah Tamu
            </button>
          </div>
        </Modal>
      )}

      {/* Bulk Add Modal */}
      {showBulkAdd && (
        <Modal onClose={() => setShowBulkAdd(false)} title="Import Tamu Massal">
          <div className="space-y-4">
            <p className="text-sm text-gray-500">Masukkan data tamu (1 baris = 1 tamu). Format: Nama, Grup, Telepon, Meja</p>
            <textarea
              value={bulkText}
              onChange={e => setBulkText(e.target.value)}
              rows={10}
              className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-mono"
              placeholder={`Budi Santoso, Keluarga, 081234567890, 5\nAni Wijaya, Teman, 089876543210, 3\nRekan Kantor, Kantor, 08111222333, 1`}
            />
            <p className="text-sm text-gray-500">Total: {bulkText.split('\n').filter(l => l.trim()).length} tamu</p>
            <button
              onClick={handleBulkAdd}
              className="w-full py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition"
            >
              Import {bulkText.split('\n').filter(l => l.trim()).length} Tamu
            </button>
          </div>
        </Modal>
      )}

      {/* Edit Guest Modal */}
      {editingGuest && (
        <EditGuestModal
          guest={store.guests.find(g => g.id === editingGuest)!}
          onClose={() => setEditingGuest(null)}
          onSave={(data) => { store.updateGuest(editingGuest, data); setEditingGuest(null); }}
        />
      )}
    </div>
  );
}

// Helper Components
function InputField({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {type === 'textarea' ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          rows={3}
          className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
        />
      )}
    </div>
  );
}

function Modal({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function EditGuestModal({ guest, onClose, onSave }: { guest: any; onClose: () => void; onSave: (data: any) => void }) {
  const [data, setData] = useState({ ...guest });
  return (
    <Modal onClose={onClose} title="Edit Tamu">
      <div className="space-y-4">
        <InputField label="Nama" value={data.name} onChange={v => setData({...data, name: v})} />
        <InputField label="Grup" value={data.group} onChange={v => setData({...data, group: v})} />
        <InputField label="No. WhatsApp" value={data.phone} onChange={v => setData({...data, phone: v})} />
        <InputField label="No. Meja" value={data.tableNumber} onChange={v => setData({...data, tableNumber: v})} />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={data.status}
            onChange={e => setData({...data, status: e.target.value})}
            className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
          >
            <option value="pending">Pending</option>
            <option value="accepted">Diterima</option>
            <option value="declined">Ditolak</option>
          </select>
        </div>
        <InputField label="Pesan/UCAPAN" value={data.message} onChange={v => setData({...data, message: v})} />
        <button
          onClick={() => onSave(data)}
          className="w-full py-3 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition"
        >
          Simpan
        </button>
      </div>
    </Modal>
  );
}
