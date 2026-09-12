import { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { themes } from '../themes/themes';
import { AdminUser } from '../types';
import ImageUpload from '../components/ImageUpload';
import FontSelector from '../components/FontSelector';
import {
  LogOut, Heart, Users, Palette, Settings, Globe, Upload,
  Plus, Trash2, Search, MessageCircle, FileText, Download, Edit3, X, Check, Copy,
  Camera, Type, UserPlus, Shield, ShieldOff, Key, Eye, EyeOff, UserCheck, UserX
} from 'lucide-react';

interface Props {
  onLogout: () => void;
}

type Tab = 'wedding' | 'guests' | 'themes' | 'settings' | 'users';

export default function Dashboard({ onLogout }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('wedding');
  const store = useStore();
  const isSuperAdmin = store.currentUser?.role === 'super-admin';

  // Scoped data for current user
  const weddingData = store.getWeddingData();
  const selectedTheme = store.getSelectedTheme();
  const guests = store.getGuests();
  const isLive = store.isLive();

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddGuest, setShowAddGuest] = useState(false);
  const [showBulkAdd, setShowBulkAdd] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [editingGuest, setEditingGuest] = useState<string | null>(null);
  const [newGuest, setNewGuest] = useState({ name: '', group: 'Umum', phone: '', tableNumber: '' });
  const [copied, setCopied] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const filteredGuests = guests.filter(g =>
    g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.group.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.phone.includes(searchTerm)
  );

  const updateWeddingDataWithSave = (data: Partial<any>) => {
    setSaveStatus('saving');
    store.updateWeddingData(data);
    setTimeout(() => setSaveStatus('saved'), 300);
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const generateWALink = (guest: typeof guests[0]) => {
    const name = encodeURIComponent(guest.name);
    const username = store.currentUser?.username || '';
    const url = window.location.origin + window.location.pathname + '?user=' + username + '&to=' + name;
    return `https://wa.me/${guest.phone}?text=${encodeURIComponent(`Assalamualaikum, kami ingin mengundang Anda ke pernikahan kami. Silakan buka link berikut:\n${url}`)}`;
  };

  const copyWALink = (guest: typeof guests[0]) => {
    const name = encodeURIComponent(guest.name);
    const username = store.currentUser?.username || '';
    const url = window.location.origin + window.location.pathname + '?user=' + username + '&to=' + name;
    navigator.clipboard.writeText(url);
    setCopied(guest.id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleBulkAdd = () => {
    const lines = bulkText.split('\n').filter(l => l.trim());
    const newGuests = lines.map(line => {
      const parts = line.split(/[,;\t]/).map(p => p.trim());
      return { name: parts[0] || 'Tamu', group: parts[1] || 'Umum', phone: parts[2] || '', tableNumber: parts[3] || '', status: 'pending' as const, message: '' };
    });
    store.addGuests(newGuests);
    setBulkText('');
    setShowBulkAdd(false);
  };

  const exportGuests = () => {
    const csv = ['Nama,Grup,Telepon,Meja,Status,Pesan'];
    guests.forEach(g => csv.push(`${g.name},${g.group},${g.phone},${g.tableNumber},${g.status},${g.message}`));
    const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'daftar-tamu.csv'; a.click();
  };

  const sendAllWhatsApp = () => {
    const guestsWithPhone = guests.filter(g => g.phone);
    if (!guestsWithPhone.length) { alert('Tidak ada tamu dengan nomor WhatsApp'); return; }
    if (!confirm(`Akan membuka ${guestsWithPhone.length} tab WhatsApp. Lanjutkan?`)) return;
    guestsWithPhone.forEach((guest, index) => {
      setTimeout(() => window.open(generateWALink(guest), '_blank'), index * 1000);
    });
  };

  const tabs = [
    { id: 'wedding' as Tab, label: 'Data Pernikahan', icon: Heart },
    { id: 'guests' as Tab, label: 'Tamu Undangan', icon: Users },
    { id: 'themes' as Tab, label: 'Tema & Font', icon: Palette },
    ...(isSuperAdmin ? [{ id: 'users' as Tab, label: 'Kelola User', icon: UserCheck }] : []),
    { id: 'settings' as Tab, label: 'Pengaturan', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center">
              {isSuperAdmin ? <Shield className="w-5 h-5 text-white" /> : <Heart className="w-5 h-5 text-white" />}
            </div>
            <div>
              <h1 className="font-bold text-gray-800">
                {isSuperAdmin ? 'Super Admin Panel' : 'Wedding Dashboard'}
              </h1>
              <p className="text-xs text-gray-500">
                {store.currentUser?.displayName} • {isSuperAdmin ? 'Super Admin' : 'User'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${isLive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              <Globe className="w-4 h-4" />
              {isLive ? 'Live' : 'Offline'}
            </div>
            <button onClick={onLogout} className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <p className="text-2xl font-bold text-amber-600">{guests.length}</p>
            <p className="text-xs text-gray-500">Total Tamu</p>
          </div>
          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <p className="text-2xl font-bold text-green-600">{guests.filter(g => g.status === 'accepted').length}</p>
            <p className="text-xs text-gray-500">Konfirmasi Hadir</p>
          </div>
          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <p className="text-2xl font-bold text-blue-600">{guests.filter(g => g.phone).length}</p>
            <p className="text-xs text-gray-500">Ada No. WA</p>
          </div>
          {isSuperAdmin ? (
            <div className="bg-white rounded-xl p-4 border shadow-sm">
              <p className="text-2xl font-bold text-purple-600">{store.users.filter(u => u.role === 'user').length}</p>
              <p className="text-xs text-gray-500">Total User</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl p-4 border shadow-sm">
              <p className="text-2xl font-bold text-purple-600">{themes.length}</p>
              <p className="text-xs text-gray-500">Tema Tersedia</p>
            </div>
          )}
        </div>

        {/* Preview Button */}
        <div className="mb-6">
          <a href={window.location.pathname + '?user=' + store.currentUser?.username + '&preview=true'} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-medium hover:from-amber-600 hover:to-amber-700 transition shadow-lg shadow-amber-500/25">
            <Globe className="w-5 h-5" /> Preview Undangan
          </a>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition ${
                activeTab === tab.id ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/25' : 'bg-white text-gray-600 hover:bg-gray-100 border'
              }`}>
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>

        {/* Wedding Data Tab */}
        {activeTab === 'wedding' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Heart className="w-5 h-5 text-amber-500" /> Data Mempelai & Acara
              </h2>
              <div className="flex items-center gap-3">
                {/* Save Status Indicator */}
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  saveStatus === 'saving' ? 'bg-blue-100 text-blue-700' :
                  saveStatus === 'saved' ? 'bg-green-100 text-green-700' :
                  'bg-gray-100 text-gray-500'
                }`}>
                  {saveStatus === 'saving' && <><div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div> Menyimpan...</>}
                  {saveStatus === 'saved' && <><Check className="w-3 h-3" /> Tersimpan</>}
                  {saveStatus === 'idle' && <><div className="w-2 h-2 bg-gray-400 rounded-full"></div> Auto-save aktif</>}
                </div>
                <a href={window.location.pathname + '?user=' + store.currentUser?.username + '&preview=true'} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 transition text-sm font-medium shadow-md">
                  <Globe className="w-4 h-4" /> Preview
                </a>
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-amber-800">
                <strong>💡 Tips:</strong> Edit semua data pernikahan Anda di bawah ini. Perubahan akan otomatis tersimpan. Klik "Preview" untuk melihat tampilan undangan.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4 p-4 bg-blue-50 rounded-xl">
                <h3 className="font-semibold text-blue-800">🤵 Mempelai Pria</h3>
                <ImageUpload label="Foto Mempelai Pria" value={weddingData.groomPhoto} onChange={v => updateWeddingDataWithSave({ groomPhoto: v })} />
                <InputField label="Nama" value={weddingData.groomName} onChange={v => updateWeddingDataWithSave({ groomName: v })} />
                <InputField label="Nama Ayah" value={weddingData.groomFather} onChange={v => updateWeddingDataWithSave({ groomFather: v })} />
                <InputField label="Nama Ibu" value={weddingData.groomMother} onChange={v => updateWeddingDataWithSave({ groomMother: v })} />
                <InputField label="Alamat Orang Tua" value={weddingData.groomParentsAddress} onChange={v => updateWeddingDataWithSave({ groomParentsAddress: v })} />
              </div>
              <div className="space-y-4 p-4 bg-pink-50 rounded-xl">
                <h3 className="font-semibold text-pink-800">👰 Mempelai Wanita</h3>
                <ImageUpload label="Foto Mempelai Wanita" value={weddingData.bridePhoto} onChange={v => updateWeddingDataWithSave({ bridePhoto: v })} />
                <InputField label="Nama" value={weddingData.brideName} onChange={v => updateWeddingDataWithSave({ brideName: v })} />
                <InputField label="Nama Ayah" value={weddingData.brideFather} onChange={v => updateWeddingDataWithSave({ brideFather: v })} />
                <InputField label="Nama Ibu" value={weddingData.brideMother} onChange={v => updateWeddingDataWithSave({ brideMother: v })} />
                <InputField label="Alamat Orang Tua" value={weddingData.brideParentsAddress} onChange={v => updateWeddingDataWithSave({ brideParentsAddress: v })} />
              </div>
              <div className="space-y-4 p-4 bg-indigo-50 rounded-xl md:col-span-2">
                <h3 className="font-semibold text-indigo-800 flex items-center gap-2"><Camera className="w-5 h-5" /> Foto</h3>
                <ImageUpload label="Foto Cover / Hero" value={weddingData.coverImage} onChange={v => updateWeddingDataWithSave({ coverImage: v })} aspectRatio="16/9" />
                <ImageUpload label="Foto Bersama" value={weddingData.couplePhoto} onChange={v => updateWeddingDataWithSave({ couplePhoto: v })} aspectRatio="4/3" />
              </div>
              <div className="space-y-4 p-4 bg-green-50 rounded-xl md:col-span-2">
                <h3 className="font-semibold text-green-800">💒 Akad Nikah</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField label="Tanggal" type="date" value={weddingData.weddingDate} onChange={v => updateWeddingDataWithSave({ weddingDate: v })} />
                  <InputField label="Waktu" type="time" value={weddingData.weddingTime} onChange={v => updateWeddingDataWithSave({ weddingTime: v })} />
                </div>
                <InputField label="Tempat" value={weddingData.weddingVenue} onChange={v => updateWeddingDataWithSave({ weddingVenue: v })} />
                <InputField label="Alamat" value={weddingData.weddingAddress} onChange={v => updateWeddingDataWithSave({ weddingAddress: v })} />
              </div>
              <div className="space-y-4 p-4 bg-purple-50 rounded-xl md:col-span-2">
                <h3 className="font-semibold text-purple-800">🎉 Resepsi</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField label="Tanggal" type="date" value={weddingData.receptionDate} onChange={v => updateWeddingDataWithSave({ receptionDate: v })} />
                  <InputField label="Waktu" type="time" value={weddingData.receptionTime} onChange={v => updateWeddingDataWithSave({ receptionTime: v })} />
                </div>
                <InputField label="Tempat" value={weddingData.receptionVenue} onChange={v => updateWeddingDataWithSave({ receptionVenue: v })} />
                <InputField label="Alamat" value={weddingData.receptionAddress} onChange={v => updateWeddingDataWithSave({ receptionAddress: v })} />
              </div>
              <div className="space-y-4 p-4 bg-amber-50 rounded-xl md:col-span-2">
                <h3 className="font-semibold text-amber-800">📖 Kutipan & Cerita</h3>
                <InputField label="Kutipan" type="textarea" value={weddingData.quote} onChange={v => updateWeddingDataWithSave({ quote: v })} />
                <InputField label="Sumber" value={weddingData.quoteSource} onChange={v => updateWeddingDataWithSave({ quoteSource: v })} />
                <InputField label="Cerita Cinta" type="textarea" value={weddingData.story} onChange={v => updateWeddingDataWithSave({ story: v })} />
                <InputField label="Kata Sambutan" type="textarea" value={weddingData.greeting} onChange={v => updateWeddingDataWithSave({ greeting: v })} />
              </div>
              <div className="space-y-4 p-4 bg-cyan-50 rounded-xl md:col-span-2">
                <h3 className="font-semibold text-cyan-800">🗺️ Peta & Musik</h3>
                <InputField label="Link Google Maps" value={weddingData.mapLink} onChange={v => updateWeddingDataWithSave({ mapLink: v })} />
                <InputField label="URL Musik (mp3)" value={weddingData.musicUrl} onChange={v => updateWeddingDataWithSave({ musicUrl: v })} />
              </div>
              <div className="space-y-4 p-4 bg-rose-50 rounded-xl md:col-span-2">
                <h3 className="font-semibold text-rose-800">💝 Amplop Digital</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField label="Bank 1 - Nama" value={weddingData.bankName} onChange={v => updateWeddingDataWithSave({ bankName: v })} />
                  <InputField label="Bank 1 - No. Rekening" value={weddingData.bankAccount} onChange={v => updateWeddingDataWithSave({ bankAccount: v })} />
                  <InputField label="Bank 1 - Atas Nama" value={weddingData.bankHolder} onChange={v => updateWeddingDataWithSave({ bankHolder: v })} />
                  <InputField label="Bank 2 - Nama" value={weddingData.bankName2} onChange={v => updateWeddingDataWithSave({ bankName2: v })} />
                  <InputField label="Bank 2 - No. Rekening" value={weddingData.bankAccount2} onChange={v => updateWeddingDataWithSave({ bankAccount2: v })} />
                  <InputField label="Bank 2 - Atas Nama" value={weddingData.bankHolder2} onChange={v => updateWeddingDataWithSave({ bankHolder2: v })} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Guests Tab */}
        {activeTab === 'guests' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-500" /> Daftar Tamu ({guests.length})
              </h2>
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => setShowAddGuest(true)} className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition text-sm">
                  <Plus className="w-4 h-4" /> Tambah
                </button>
                <button onClick={() => setShowBulkAdd(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm">
                  <Upload className="w-4 h-4" /> Import Massal
                </button>
                <button onClick={sendAllWhatsApp} className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm">
                  <MessageCircle className="w-4 h-4" /> Kirim WA
                </button>
                <button onClick={exportGuests} className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition text-sm">
                  <Download className="w-4 h-4" /> Export
                </button>
                <button onClick={() => { if(confirm('Hapus semua tamu?')) store.clearAllGuests(); }} className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm">
                  <Trash2 className="w-4 h-4" /> Hapus Semua
                </button>
              </div>
            </div>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                placeholder="Cari nama, grup, atau nomor telepon..."
                className="w-full pl-11 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500" />
            </div>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {filteredGuests.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Belum ada tamu.</p>
                </div>
              ) : filteredGuests.map(guest => (
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
                    <button onClick={() => copyWALink(guest)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg" title="Copy Link">
                      {copied === guest.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                    {guest.phone && (
                      <a href={generateWALink(guest)} target="_blank" rel="noopener noreferrer" className="p-2 text-green-500 hover:bg-green-50 rounded-lg" title="WhatsApp">
                        <MessageCircle className="w-4 h-4" />
                      </a>
                    )}
                    <button onClick={() => setEditingGuest(guest.id)} className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg"><Edit3 className="w-4 h-4" /></button>
                    <button onClick={() => { if(confirm('Hapus?')) store.deleteGuest(guest.id); }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Themes Tab */}
        {activeTab === 'themes' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Palette className="w-5 h-5 text-amber-500" /> Pilih Tema ({themes.length})
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {themes.map(theme => (
                  <button key={theme.id} onClick={() => store.setSelectedTheme(theme.id)}
                    className={`relative p-4 rounded-xl border-2 transition hover:scale-105 ${
                      selectedTheme === theme.id ? 'border-amber-500 shadow-lg shadow-amber-500/20' : 'border-gray-200 hover:border-gray-300'
                    }`}>
                    {selectedTheme === theme.id && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div className="w-full h-20 rounded-lg mb-3 flex items-center justify-center text-2xl" style={{ background: theme.bgGradient }}>
                      {theme.preview}
                    </div>
                    <p className="text-sm font-medium text-gray-700 text-center">{theme.name}</p>
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Type className="w-5 h-5 text-amber-500" /> Pilih Font
              </h2>
              <FontSelector label="Font Utama" value={weddingData.customFont} onChange={v => updateWeddingDataWithSave({ customFont: v })} />
            </div>
          </div>
        )}

        {/* Users Management Tab (Super Admin Only) */}
        {activeTab === 'users' && isSuperAdmin && <UserManagement />}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Settings className="w-5 h-5 text-amber-500" /> Pengaturan Akun
              </h2>
              <div className="space-y-4 max-w-md">
                <InputField label="Display Name" value={store.currentUser?.displayName || ''}
                  onChange={v => store.updateUser(store.currentUser!.username, { displayName: v })} />
                {store.currentUser?.role !== 'super-admin' && (
                  <>
                    <InputField label="Username" value={store.currentUser?.username || ''} disabled />
                    <InputField label="Password" type="password" value={store.currentUser?.password || ''}
                      onChange={v => store.updateUser(store.currentUser!.username, { password: v })} />
                  </>
                )}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-amber-500" /> Status Website
              </h2>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium text-gray-800">Website {isLive ? 'Aktif (Live)' : 'Tidak Aktif'}</p>
                  <p className="text-sm text-gray-500">{isLive ? 'Undangan dapat diakses' : 'Undangan belum dapat diakses'}</p>
                </div>
                <button onClick={store.toggleLive}
                  className={`px-6 py-2.5 rounded-xl font-medium transition ${isLive ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-green-500 text-white hover:bg-green-600'}`}>
                  {isLive ? 'Matikan' : 'Go Live!'}
                </button>
              </div>
              {isLive && (
                <div className="mt-4 p-4 bg-green-50 rounded-xl">
                  <p className="text-sm text-green-700 font-medium">🎉 Website undangan Anda LIVE!</p>
                  <p className="text-sm text-green-600 mt-1">
                    <span className="font-medium">Link undangan:</span>{' '}
                    <code className="bg-green-100 px-2 py-0.5 rounded break-all">
                      {window.location.origin}{window.location.pathname}?user={store.currentUser?.username}
                    </code>
                  </p>
                  <p className="text-xs text-green-600 mt-2">
                    Atas nama: <span className="font-semibold">{store.currentUser?.displayName}</span>
                  </p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}?user=${store.currentUser?.username}`);
                      alert('Link berhasil disalin!');
                    }}
                    className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition"
                  >
                    📋 Salin Link
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddGuest && (
        <Modal onClose={() => setShowAddGuest(false)} title="Tambah Tamu">
          <div className="space-y-4">
            <InputField label="Nama Tamu" value={newGuest.name} onChange={v => setNewGuest({...newGuest, name: v})} />
            <InputField label="Grup" value={newGuest.group} onChange={v => setNewGuest({...newGuest, group: v})} />
            <InputField label="No. WhatsApp" value={newGuest.phone} onChange={v => setNewGuest({...newGuest, phone: v})} />
            <InputField label="No. Meja" value={newGuest.tableNumber} onChange={v => setNewGuest({...newGuest, tableNumber: v})} />
            <button onClick={() => {
              if (newGuest.name) { store.addGuest({ ...newGuest, status: 'pending', message: '' }); setNewGuest({ name: '', group: 'Umum', phone: '', tableNumber: '' }); setShowAddGuest(false); }
            }} className="w-full py-3 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition">
              Tambah Tamu
            </button>
          </div>
        </Modal>
      )}
      {showBulkAdd && (
        <Modal onClose={() => setShowBulkAdd(false)} title="Import Tamu Massal">
          <div className="space-y-4">
            <p className="text-sm text-gray-500">Format: Nama, Grup, Telepon, Meja (1 baris = 1 tamu)</p>
            <textarea value={bulkText} onChange={e => setBulkText(e.target.value)} rows={10}
              className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-mono"
              placeholder={`Budi, Keluarga, 081234567890, 5\nAni, Teman, 089876543210, 3`} />
            <p className="text-sm text-gray-500">Total: {bulkText.split('\n').filter(l => l.trim()).length} tamu</p>
            <button onClick={handleBulkAdd} className="w-full py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition">
              Import {bulkText.split('\n').filter(l => l.trim()).length} Tamu
            </button>
          </div>
        </Modal>
      )}
      {editingGuest && (
        <EditGuestModal guest={guests.find(g => g.id === editingGuest)!}
          onClose={() => setEditingGuest(null)}
          onSave={(data) => { store.updateGuest(editingGuest, data); setEditingGuest(null); }} />
      )}
    </div>
  );
}

// User Management Component (Super Admin)
function UserManagement() {
  const store = useStore();
  const [showCreate, setShowCreate] = useState(false);
  const [searchUser, setSearchUser] = useState('');
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [resetPasswordUser, setResetPasswordUser] = useState<string | null>(null);
  const [newUser, setNewUser] = useState({ username: '', password: '', displayName: '' });
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  const filteredUsers = store.users.filter(u =>
    u.username.toLowerCase().includes(searchUser.toLowerCase()) ||
    u.displayName.toLowerCase().includes(searchUser.toLowerCase())
  );

  const handleCreate = () => {
    setError('');
    if (!newUser.username || !newUser.password || !newUser.displayName) {
      setError('Semua field harus diisi');
      return;
    }
    if (newUser.username.length < 3) {
      setError('Username minimal 3 karakter');
      return;
    }
    if (newUser.password.length < 4) {
      setError('Password minimal 4 karakter');
      return;
    }
    const success = store.createUser({ ...newUser, role: 'user' });
    if (!success) {
      setError('Username sudah digunakan');
      return;
    }
    setNewUser({ username: '', password: '', displayName: '' });
    setShowCreate(false);
  };

  const handleResetPassword = () => {
    if (!resetPasswordUser || newPassword.length < 4) {
      setError('Password minimal 4 karakter');
      return;
    }
    store.resetUserPassword(resetPasswordUser, newPassword);
    setResetPasswordUser(null);
    setNewPassword('');
    setError('');
  };

  const togglePasswordVisibility = (username: string) => {
    setShowPasswords(prev => ({ ...prev, [username]: !prev[username] }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-amber-500" /> Kelola User
            </h2>
            <p className="text-sm text-gray-500 mt-1">Total: {store.users.length} user ({store.users.filter(u => u.role === 'user').length} user biasa, 1 super admin)</p>
          </div>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition text-sm">
            <UserPlus className="w-4 h-4" /> Tambah User
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="text" value={searchUser} onChange={e => setSearchUser(e.target.value)}
            placeholder="Cari user..."
            className="w-full pl-11 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500" />
        </div>

        {/* User List */}
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {filteredUsers.map(user => (
            <div key={user.username} className={`flex items-center gap-3 p-4 rounded-xl border transition ${user.isActive ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-200 opacity-60'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${user.role === 'super-admin' ? 'bg-gradient-to-br from-purple-500 to-purple-700' : 'bg-gradient-to-br from-amber-400 to-amber-600'}`}>
                {user.role === 'super-admin' ? <Shield className="w-5 h-5 text-white" /> : <span className="text-white font-bold text-sm">{user.displayName.charAt(0).toUpperCase()}</span>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-800">{user.displayName}</p>
                  {user.role === 'super-admin' && (
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">Super Admin</span>
                  )}
                  {!user.isActive && (
                    <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">Nonaktif</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>@{user.username}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    {showPasswords[user.username] ? user.password : '••••••'}
                    {user.role !== 'super-admin' && (
                      <button onClick={() => togglePasswordVisibility(user.username)} className="text-gray-400 hover:text-gray-600">
                        {showPasswords[user.username] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </button>
                    )}
                  </span>
                  <span>•</span>
                  <span>Dibuat: {new Date(user.createdAt).toLocaleDateString('id-ID')}</span>
                </div>
              </div>
              {user.role !== 'super-admin' && (
                <div className="flex items-center gap-1">
                  <button onClick={() => { setEditingUser(user.username); setNewUser({ username: user.username, password: '', displayName: user.displayName }); }}
                    className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg" title="Edit"><Edit3 className="w-4 h-4" /></button>
                  <button onClick={() => { setResetPasswordUser(user.username); setNewPassword(''); setError(''); }}
                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg" title="Reset Password"><Key className="w-4 h-4" /></button>
                  <button onClick={() => store.toggleUserActive(user.username)}
                    className={`p-2 rounded-lg ${user.isActive ? 'text-orange-500 hover:bg-orange-50' : 'text-green-500 hover:bg-green-50'}`}
                    title={user.isActive ? 'Nonaktifkan' : 'Aktifkan'}>
                    {user.isActive ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                  </button>
                  <button onClick={() => { if(confirm(`Hapus user "${user.displayName}"? Semua data undangan akan terhapus.`)) store.deleteUser(user.username); }}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg" title="Hapus"><Trash2 className="w-4 h-4" /></button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Create User Modal */}
      {showCreate && (
        <Modal onClose={() => { setShowCreate(false); setError(''); }} title="Tambah User Baru">
          <div className="space-y-4">
            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}
            <InputField label="Username" value={newUser.username} onChange={v => setNewUser({...newUser, username: v.toLowerCase().replace(/\s/g, '')})} placeholder="contoh: budi_santoso" />
            <InputField label="Display Name" value={newUser.displayName} onChange={v => setNewUser({...newUser, displayName: v})} placeholder="contoh: Budi Santoso" />
            <InputField label="Password" type="password" value={newUser.password} onChange={v => setNewUser({...newUser, password: v})} placeholder="Minimal 4 karakter" />
            <button onClick={handleCreate} className="w-full py-3 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition">
              Buat User
            </button>
          </div>
        </Modal>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <Modal onClose={() => setEditingUser(null)} title="Edit User">
          <div className="space-y-4">
            <InputField label="Username" value={newUser.username} disabled />
            <InputField label="Display Name" value={newUser.displayName} onChange={v => setNewUser({...newUser, displayName: v})} />
            <button onClick={() => { store.updateUser(editingUser, { displayName: newUser.displayName }); setEditingUser(null); }}
              className="w-full py-3 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition">
              Simpan
            </button>
          </div>
        </Modal>
      )}

      {/* Reset Password Modal */}
      {resetPasswordUser && (
        <Modal onClose={() => { setResetPasswordUser(null); setError(''); }} title="Reset Password">
          <div className="space-y-4">
            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}
            <p className="text-sm text-gray-500">Reset password untuk user: <strong>@{resetPasswordUser}</strong></p>
            <InputField label="Password Baru" type="password" value={newPassword} onChange={v => setNewPassword(v)} placeholder="Minimal 4 karakter" />
            <button onClick={handleResetPassword} className="w-full py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition">
              Reset Password
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// Helper Components
function InputField({ label, value, onChange, type = 'text', placeholder, disabled }: { label: string; value: string; onChange?: (v: string) => void; type?: string; placeholder?: string; disabled?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {type === 'textarea' ? (
        <textarea value={value} onChange={e => onChange?.(e.target.value)} rows={3} disabled={disabled}
          className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm disabled:bg-gray-100" />
      ) : (
        <input type={type} value={value} onChange={e => onChange?.(e.target.value)} placeholder={placeholder} disabled={disabled}
          className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm disabled:bg-gray-100" />
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
          <select value={data.status} onChange={e => setData({...data, status: e.target.value})}
            className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm">
            <option value="pending">Pending</option>
            <option value="accepted">Diterima</option>
            <option value="declined">Ditolak</option>
          </select>
        </div>
        <button onClick={() => onSave(data)} className="w-full py-3 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition">
          Simpan
        </button>
      </div>
    </Modal>
  );
}
