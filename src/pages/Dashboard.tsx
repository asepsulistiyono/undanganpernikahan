import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { themes } from '../themes/themes';
import ImageUpload from '../components/ImageUpload';
import FontSelector from '../components/FontSelector';
import * as firebaseService from '../services/firebaseService';
import {
  LogOut, Heart, Users, Palette, Settings, Globe, Upload,
  Plus, Trash2, Search, MessageCircle, Download, Edit3, X, Check, Copy,
  Camera, Type, UserPlus, Shield, ShieldOff, Key, Eye, EyeOff, UserCheck
} from 'lucide-react';

interface Props {
  onLogout: () => void;
}

type Tab = 'wedding' | 'guests' | 'themes' | 'settings' | 'users';
type GuestStatus = 'pending' | 'accepted' | 'declined';

interface NewGuest {
  name: string;
  group: string;
  phone: string;
  tableNumber: string;
  status: GuestStatus;
  message: string;
}

export default function Dashboard({ onLogout }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('wedding');
  const store = useStore();
  const isSuperAdmin = store.currentUser?.role === 'super-admin';
  const currentUser = store.currentUser;

  const weddingData = store.getWeddingData();
  const selectedTheme = store.getSelectedTheme();
  const guests = store.getGuests();
  const isLive = store.isLive();

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddGuest, setShowAddGuest] = useState(false);
  const [showBulkAdd, setShowBulkAdd] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [editingGuest, setEditingGuest] = useState<string | null>(null);
  const [newGuest, setNewGuest] = useState<NewGuest>({
    name: '',
    group: 'Umum',
    phone: '',
    tableNumber: '',
    status: 'pending',
    message: '',
  });
  const [copied, setCopied] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const filteredGuests = guests.filter(
    g =>
      g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.group.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.phone.includes(searchTerm)
  );

  const updateWeddingDataWithSave = (data: Partial<any>) => {
    store.updateWeddingData(data);
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 1500);
  };

  const generateWALink = (guest: typeof guests[0]) => {
    const name = encodeURIComponent(guest.name);
    const username = store.currentUser?.username || '';
    const baseUrl = window.location.origin + window.location.pathname;
    const url = `${baseUrl}?user=${username}&to=${name}`;
    return `https://wa.me/${guest.phone}?text=${encodeURIComponent(
      `Assalamualaikum, kami ingin mengundang Anda ke pernikahan kami. Silakan buka link berikut:\n${url}`
    )}`;
  };

  const copyWALink = (guest: typeof guests[0]) => {
    const name = encodeURIComponent(guest.name);
    const username = store.currentUser?.username || '';
    const baseUrl = window.location.origin + window.location.pathname;
    const url = `${baseUrl}?user=${username}&to=${name}`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(url)
        .then(() => {
          setCopied(guest.id);
          setTimeout(() => setCopied(null), 2000);
        })
        .catch(() => {
          const textArea = document.createElement('textarea');
          textArea.value = url;
          textArea.style.position = 'fixed';
          textArea.style.left = '-999999px';
          document.body.appendChild(textArea);
          textArea.select();
          try {
            document.execCommand('copy');
            setCopied(guest.id);
            setTimeout(() => setCopied(null), 2000);
          } catch (err) {
            alert('Link: ' + url);
          }
          document.body.removeChild(textArea);
        });
    } else {
      alert('Link undangan: ' + url);
    }
  };

  const handleBulkAdd = () => {
    const lines = bulkText.split('\n').filter(l => l.trim());
    const newGuests = lines.map(line => {
      const parts = line.split(/[,\t]/).map(p => p.trim());
      return {
        name: parts[0] || 'Tamu',
        group: parts[1] || 'Umum',
        phone: parts[2] || '',
        tableNumber: parts[3] || '',
        status: 'pending' as GuestStatus,
        message: '',
      };
    });
    store.addGuests(newGuests as any);
    setBulkText('');
    setShowBulkAdd(false);
  };

  const exportGuests = () => {
    const csv = ['Nama,Grup,Telepon,Meja,Status,Pesan'];
    guests.forEach(g =>
      csv.push(`${g.name},${g.group},${g.phone},${g.tableNumber},${g.status},${g.message}`)
    );
    const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'daftar-tamu.csv';
    a.click();
  };

  const sendAllWhatsApp = () => {
    const guestsWithPhone = guests.filter(g => g.phone);
    if (!guestsWithPhone.length) {
      alert('Tidak ada tamu dengan nomor WhatsApp');
      return;
    }
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
    <div className="min-h-screen bg-gray-50 font-sans">
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center flex-shrink-0">
              {isSuperAdmin ? (
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              ) : (
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              )}
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-gray-800 text-sm sm:text-base truncate">
                {isSuperAdmin ? 'Super Admin' : 'Dashboard'}
              </h1>
              <p className="text-xs text-gray-500 truncate">
                {store.currentUser?.displayName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <div
              className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium ${
                isLive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
              }`}
            >
              <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">{isLive ? 'Live' : 'Offline'}</span>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-2.5 sm:px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition text-xs sm:text-sm min-h-[36px]"
            >
              <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="bg-white rounded-xl p-3 sm:p-4 border shadow-sm">
            <p className="text-xl sm:text-2xl font-bold text-amber-600">{guests.length}</p>
            <p className="text-xs text-gray-500">Total Tamu</p>
          </div>
          <div className="bg-white rounded-xl p-3 sm:p-4 border shadow-sm">
            <p className="text-xl sm:text-2xl font-bold text-green-600">
              {guests.filter(g => g.status === 'accepted').length}
            </p>
            <p className="text-xs text-gray-500">Konfirmasi Hadir</p>
          </div>
          <div className="bg-white rounded-xl p-3 sm:p-4 border shadow-sm">
            <p className="text-xl sm:text-2xl font-bold text-blue-600">
              {guests.filter(g => g.phone).length}
            </p>
            <p className="text-xs text-gray-500">Ada No. WA</p>
          </div>
          {isSuperAdmin ? (
            <div className="bg-white rounded-xl p-3 sm:p-4 border shadow-sm">
              <p className="text-xl sm:text-2xl font-bold text-purple-600">
                {store.users.filter(u => u.role === 'user').length}
              </p>
              <p className="text-xs text-gray-500">Total User</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl p-3 sm:p-4 border shadow-sm">
              <p className="text-xl sm:text-2xl font-bold text-purple-600">{themes.length}</p>
              <p className="text-xs text-gray-500">Tema Tersedia</p>
            </div>
          )}
        </div>

        <div className="mb-6">
          <a
            href={window.location.pathname + '?user=' + store.currentUser?.username + '&preview=true'}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-amber-500 hover:bg-amber-600 text-black rounded-xl font-semibold shadow-lg min-h-[48px] border-2 border-amber-600"
          >
            <Globe className="w-5 h-5" /> Preview Undangan
          </a>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition min-h-[44px] ${
                activeTab === tab.id
                  ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/25'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        {/* ===== WEDDING TAB ===== */}
        {activeTab === 'wedding' && (
          <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <h2 className="text-lg md:text-xl font-bold text-gray-800 flex items-center gap-2">
                <Heart className="w-5 h-5 text-amber-500" /> Data Mempelai & Acara
              </h2>
              <div
                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-full text-xs font-medium ${
                  saveStatus === 'saved'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {saveStatus === 'saved' ? (
                  <>
                    <Check className="w-3 h-3" /> Tersimpan
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div> Auto-save aktif
                  </>
                )}
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-amber-800">
                <strong>💡 Tips:</strong> Edit semua data pernikahan Anda. Perubahan otomatis tersimpan & sinkron.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4 p-4 bg-blue-50 rounded-xl">
                <h3 className="font-semibold text-blue-800">🤵 Mempelai Pria</h3>
                <ImageUpload
                  label="Foto Mempelai Pria"
                  value={weddingData.groomPhoto}
                  onChange={v => updateWeddingDataWithSave({ groomPhoto: v })}
                />
                <InputField
                  label="Nama"
                  value={weddingData.groomName}
                  onChange={v => updateWeddingDataWithSave({ groomName: v })}
                />
                <InputField
                  label="Nama Ayah"
                  value={weddingData.groomFather}
                  onChange={v => updateWeddingDataWithSave({ groomFather: v })}
                />
                <InputField
                  label="Nama Ibu"
                  value={weddingData.groomMother}
                  onChange={v => updateWeddingDataWithSave({ groomMother: v })}
                />
                <InputField
                  label="Alamat Orang Tua"
                  value={weddingData.groomParentsAddress}
                  onChange={v => updateWeddingDataWithSave({ groomParentsAddress: v })}
                />
              </div>

              <div className="space-y-4 p-4 bg-pink-50 rounded-xl">
                <h3 className="font-semibold text-pink-800">👰 Mempelai Wanita</h3>
                <ImageUpload
                  label="Foto Mempelai Wanita"
                  value={weddingData.bridePhoto}
                  onChange={v => updateWeddingDataWithSave({ bridePhoto: v })}
                />
                <InputField
                  label="Nama"
                  value={weddingData.brideName}
                  onChange={v => updateWeddingDataWithSave({ brideName: v })}
                />
                <InputField
                  label="Nama Ayah"
                  value={weddingData.brideFather}
                  onChange={v => updateWeddingDataWithSave({ brideFather: v })}
                />
                <InputField
                  label="Nama Ibu"
                  value={weddingData.brideMother}
                  onChange={v => updateWeddingDataWithSave({ brideMother: v })}
                />
                <InputField
                  label="Alamat Orang Tua"
                  value={weddingData.brideParentsAddress}
                  onChange={v => updateWeddingDataWithSave({ brideParentsAddress: v })}
                />
              </div>

              <div className="space-y-4 p-4 bg-indigo-50 rounded-xl md:col-span-2">
                <h3 className="font-semibold text-indigo-800 flex items-center gap-2">
                  <Camera className="w-5 h-5" /> Foto
                </h3>
                <ImageUpload
                  label="Foto Cover / Hero"
                  value={weddingData.coverImage}
                  onChange={v => updateWeddingDataWithSave({ coverImage: v })}
                  aspectRatio="16/9"
                />
                <ImageUpload
                  label="Foto Bersama"
                  value={weddingData.couplePhoto}
                  onChange={v => updateWeddingDataWithSave({ couplePhoto: v })}
                  aspectRatio="4/3"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    📸 Galeri Foto (Multiple)
                  </label>
                  <GalleryUpload
                    images={weddingData.galleryImages || []}
                    onChange={(imgs: string[]) =>
                      updateWeddingDataWithSave({ galleryImages: imgs })
                    }
                  />
                </div>
              </div>

              <div className="space-y-4 p-4 bg-green-50 rounded-xl md:col-span-2">
                <h3 className="font-semibold text-green-800">💒 Akad Nikah</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField
                    label="Tanggal"
                    type="date"
                    value={weddingData.weddingDate}
                    onChange={v => updateWeddingDataWithSave({ weddingDate: v })}
                  />
                  <InputField
                    label="Waktu"
                    type="time"
                    value={weddingData.weddingTime}
                    onChange={v => updateWeddingDataWithSave({ weddingTime: v })}
                  />
                </div>
                <InputField
                  label="Tempat / Gedung"
                  value={weddingData.weddingVenue}
                  onChange={v => updateWeddingDataWithSave({ weddingVenue: v })}
                />
                <InputField
                  label="Alamat Lengkap"
                  value={weddingData.weddingAddress}
                  onChange={v => updateWeddingDataWithSave({ weddingAddress: v })}
                />
              </div>

              <div className="space-y-4 p-4 bg-purple-50 rounded-xl md:col-span-2">
                <h3 className="font-semibold text-purple-800">🎉 Resepsi</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField
                    label="Tanggal"
                    type="date"
                    value={weddingData.receptionDate}
                    onChange={v => updateWeddingDataWithSave({ receptionDate: v })}
                  />
                  <InputField
                    label="Waktu"
                    type="time"
                    value={weddingData.receptionTime}
                    onChange={v => updateWeddingDataWithSave({ receptionTime: v })}
                  />
                </div>
                <InputField
                  label="Tempat / Gedung"
                  value={weddingData.receptionVenue}
                  onChange={v => updateWeddingDataWithSave({ receptionVenue: v })}
                />
                <InputField
                  label="Alamat Lengkap"
                  value={weddingData.receptionAddress}
                  onChange={v => updateWeddingDataWithSave({ receptionAddress: v })}
                />
              </div>

              <div className="space-y-4 p-4 bg-orange-50 rounded-xl md:col-span-2">
                <h3 className="font-semibold text-orange-800">📖 Kutipan & Cerita</h3>
                <InputField
                  label="Kutipan"
                  type="textarea"
                  value={weddingData.quote}
                  onChange={v => updateWeddingDataWithSave({ quote: v })}
                />
                <InputField
                  label="Sumber"
                  value={weddingData.quoteSource}
                  onChange={v => updateWeddingDataWithSave({ quoteSource: v })}
                />
                <InputField
                  label="Cerita Cinta"
                  type="textarea"
                  value={weddingData.story}
                  onChange={v => updateWeddingDataWithSave({ story: v })}
                />
                <InputField
                  label="Kata Sambutan"
                  type="textarea"
                  value={weddingData.greeting}
                  onChange={v => updateWeddingDataWithSave({ greeting: v })}
                />
              </div>

              <div className="space-y-4 p-4 bg-cyan-50 rounded-xl md:col-span-2">
                <h3 className="font-semibold text-cyan-800">🗺️ Peta & Musik</h3>
                <InputField
                  label="Link Google Maps"
                  value={weddingData.mapLink}
                  onChange={v => updateWeddingDataWithSave({ mapLink: v })}
                />
                <InputField
                  label="URL Musik (mp3)"
                  value={weddingData.musicUrl}
                  onChange={v => updateWeddingDataWithSave({ musicUrl: v })}
                />
              </div>

              <div className="space-y-4 p-4 bg-rose-50 rounded-xl md:col-span-2">
                <h3 className="font-semibold text-rose-800">💝 Amplop Digital</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField
                    label="Bank 1 - Nama"
                    value={weddingData.bankName}
                    onChange={v => updateWeddingDataWithSave({ bankName: v })}
                  />
                  <InputField
                    label="Bank 1 - No. Rekening"
                    value={weddingData.bankAccount}
                    onChange={v => updateWeddingDataWithSave({ bankAccount: v })}
                  />
                  <InputField
                    label="Bank 1 - Atas Nama"
                    value={weddingData.bankHolder}
                    onChange={v => updateWeddingDataWithSave({ bankHolder: v })}
                  />
                  <InputField
                    label="Bank 2 - Nama"
                    value={weddingData.bankName2}
                    onChange={v => updateWeddingDataWithSave({ bankName2: v })}
                  />
                  <InputField
                    label="Bank 2 - No. Rekening"
                    value={weddingData.bankAccount2}
                    onChange={v => updateWeddingDataWithSave({ bankAccount2: v })}
                  />
                  <InputField
                    label="Bank 2 - Atas Nama"
                    value={weddingData.bankHolder2}
                    onChange={v => updateWeddingDataWithSave({ bankHolder2: v })}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== GUESTS TAB ===== */}
        {activeTab === 'guests' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-500" /> Daftar Tamu ({guests.length})
              </h2>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setShowAddGuest(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition text-sm"
                >
                  <Plus className="w-4 h-4" /> Tambah Tamu
                </button>
                <button
                  onClick={() => setShowBulkAdd(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm"
                >
                  <Upload className="w-4 h-4" /> Import
                </button>
                <button
                  onClick={exportGuests}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm"
                >
                  <Download className="w-4 h-4" /> Export
                </button>
                <button
                  onClick={sendAllWhatsApp}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition text-sm"
                >
                  <MessageCircle className="w-4 h-4" /> Kirim WA
                </button>
              </div>
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Cari tamu..."
                className="w-full pl-11 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredGuests.map(guest => (
                <div
                  key={guest.id}
                  className="flex items-center gap-3 p-4 rounded-xl border hover:bg-gray-50 transition"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold">
                    {guest.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-gray-800">{guest.name}</p>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                        {guest.group}
                      </span>
                      {guest.tableNumber && (
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs">
                          Meja {guest.tableNumber}
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs ${
                          guest.status === 'accepted'
                            ? 'bg-green-100 text-green-700'
                            : guest.status === 'declined'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {guest.status === 'accepted'
                          ? '✓ Hadir'
                          : guest.status === 'declined'
                          ? '✗ Tidak Hadir'
                          : '⏳ Pending'}
                      </span>
                    </div>
                    {guest.phone && <p className="text-sm text-gray-500 mt-1">📱 {guest.phone}</p>}
                    {guest.message && (
                      <p className="text-sm text-gray-600 mt-1 italic">"{guest.message}"</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {guest.phone && (
                      <button
                        onClick={() => copyWALink(guest)}
                        className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg"
                        title="Copy Link WA"
                      >
                        {copied === guest.id ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => setEditingGuest(guest.id)}
                      className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg"
                      title="Edit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Hapus tamu ini?')) store.deleteGuest(guest.id);
                      }}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {filteredGuests.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Belum ada tamu. Klik "Tambah Tamu" untuk memulai.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== THEMES TAB ===== */}
        {activeTab === 'themes' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Palette className="w-5 h-5 text-amber-500" /> Pilih Tema ({themes.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {themes.map(theme => (
                  <button
                    key={theme.id}
                    onClick={() => store.setSelectedTheme(theme.id)}
                    className={`relative rounded-xl overflow-hidden border-2 transition-all ${
                      selectedTheme === theme.id
                        ? 'border-amber-500 ring-2 ring-amber-500 ring-offset-2'
                        : 'border-gray-200 hover:border-amber-300'
                    }`}
                  >
                    <div
                      className="h-32 flex items-center justify-center"
                      style={{ background: theme.bgGradient }}
                    >
                      <span className="text-4xl">{theme.preview}</span>
                    </div>
                    <div className="p-3 bg-white">
                      <p className="font-medium text-gray-800">{theme.name}</p>
                    </div>
                    {selectedTheme === theme.id && (
                      <div className="absolute top-2 right-2 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Type className="w-5 h-5 text-amber-500" /> Pilih Font
              </h2>
              <FontSelector
                label="Font Utama"
                value={weddingData.customFont}
                onChange={v => updateWeddingDataWithSave({ customFont: v })}
              />
            </div>
          </div>
        )}

        {/* ===== SETTINGS TAB ===== */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Settings className="w-5 h-5 text-amber-500" /> Pengaturan Akun
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <input
                    type="text"
                    value={store.currentUser?.username || ''}
                    disabled
                    className="w-full p-3 border rounded-xl bg-gray-100 text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={store.currentUser?.displayName || ''}
                    disabled
                    className="w-full p-3 border rounded-xl bg-gray-100 text-gray-500"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-amber-500" /> Status Website
              </h2>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium text-gray-800">
                    Undangan {isLive ? 'Aktif' : 'Nonaktif'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {isLive
                      ? 'Undangan dapat diakses oleh tamu'
                      : 'Undangan tidak dapat diakses'}
                  </p>
                </div>
                <button
                  onClick={() => store.toggleLive()}
                  className={`relative w-14 h-7 rounded-full transition-colors ${
                    isLive ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                      isLive ? 'translate-x-7' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-sm text-blue-800">
                  <strong>💡 Link Undangan:</strong>
                  <br />
                  <code className="text-xs bg-blue-100 px-2 py-1 rounded mt-1 inline-block break-all">
                    {window.location.origin}
                    {window.location.pathname}?user={store.currentUser?.username}
                  </code>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ===== USERS TAB ===== */}
        {activeTab === 'users' && isSuperAdmin && <UserManagement />}
      </div>

      {/* Modals */}
      {showAddGuest && (
        <Modal onClose={() => setShowAddGuest(false)} title="Tambah Tamu Baru">
          <div className="space-y-4">
            <InputField
              label="Nama"
              value={newGuest.name}
              onChange={v => setNewGuest({ ...newGuest, name: v })}
              placeholder="Nama tamu"
            />
            <InputField
              label="Grup"
              value={newGuest.group}
              onChange={v => setNewGuest({ ...newGuest, group: v })}
              placeholder="contoh: Keluarga, Teman, Kolega"
            />
            <InputField
