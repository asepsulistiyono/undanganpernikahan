export interface WeddingData {
  groomName: string;
  brideName: string;
  groomFather: string;
  groomMother: string;
  brideFather: string;
  brideMother: string;
  groomParentsAddress: string;
  brideParentsAddress: string;
  weddingDate: string;
  weddingTime: string;
  weddingVenue: string;
  weddingAddress: string;
  receptionDate: string;
  receptionTime: string;
  receptionVenue: string;
  receptionAddress: string;
  mapLink: string;
  coverImage: string;
  groomPhoto: string;
  bridePhoto: string;
  couplePhoto: string;
  galleryImages: string[];
  story: string;
  quote: string;
  quoteSource: string;
  musicUrl: string;
  bankName: string;
  bankAccount: string;
  bankHolder: string;
  bankName2: string;
  bankAccount2: string;
  bankHolder2: string;
  greeting: string;
  customFont: string;
}

export interface Guest {
  id: string;
  name: string;
  group: string;
  phone: string;
  tableNumber: string;
  status: 'pending' | 'accepted' | 'declined';
  message: string;
  createdAt: string;
}

export interface ThemeConfig {
  id: string;
  name: string;
  preview: string;
  fontFamily: string;
  headingFont: string;
  scriptFont: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  bgGradient: string;
  textColor: string;
  cardBg: string;
  overlayOpacity: number;
}

export interface AdminUser {
  username: string;
  password: string;
  displayName: string;
  role: 'super-admin' | 'user';
  createdAt: string;
  isActive: boolean;
}

export interface UserWeddingData {
  [userId: string]: WeddingData;
}

export interface UserThemeSelection {
  [userId: string]: string;
}
