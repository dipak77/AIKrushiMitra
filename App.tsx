import React, { useState, useEffect, useRef } from 'react';
import { ViewState, Language, UserProfile, ChatMessage, MarketItem } from './types';
import { TRANSLATIONS } from './constants';
import { 
  Sprout, 
  CloudSun, 
  ScanLine, 
  Mic, 
  Settings, 
  ChevronRight,
  Droplets,
  TrendingUp,
  ArrowLeft,
  Menu,
  Phone,
  User,
  LogOut,
  Home,
  Store,
  Wind,
  ThermometerSun,
  Camera,
  X,
  Send,
  Loader2,
  Flower,
  Wheat,
  Leaf,
  Sun,
  Cloud,
  CloudRain,
  MapPin,
  Calendar,
  AlertTriangle,
  ArrowUpRight,
  PlayCircle,
  ExternalLink,
  Landmark,
  CalendarClock,
  Newspaper,
  CheckCircle2,
  Clock,
  Radio,
  Lock,
  Edit3
} from 'lucide-react';
import { Button } from './components/Button';
import { analyzeCropDisease, getAIFarmingAdvice, getSoilAdvice } from './services/geminiService';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';

// --- VISUAL UTILS ---
const gradients = {
  primary: "bg-gradient-to-br from-green-600 to-emerald-800",
  card: "bg-white/80 backdrop-blur-xl border border-white/40 shadow-xl shadow-green-900/5",
  glassDark: "bg-black/30 backdrop-blur-md border border-white/10",
  glassLight: "bg-white/10 backdrop-blur-md border border-white/20 shadow-lg",
  accent: "bg-gradient-to-r from-yellow-400 to-orange-500",
  danger: "bg-gradient-to-r from-red-500 to-pink-600"
};

// Crop Image Lookup
const getCropImage = (cropName: string) => {
  const map: Record<string, string> = {
    'Soyabean': 'https://images.unsplash.com/photo-1599583733261-0b5c7f8a9757?auto=format&fit=crop&w=100&q=80',
    'Cotton': 'https://images.unsplash.com/photo-1594235048472-7c8a6797a73a?auto=format&fit=crop&w=100&q=80',
    'Onion': 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=100&q=80',
    'Wheat': 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=100&q=80',
    'Tur': 'https://plus.unsplash.com/premium_photo-1675716443562-b771d72a3da7?auto=format&fit=crop&w=100&q=80',
    'Gram (Chana)': 'https://images.unsplash.com/photo-1515543904379-3d757afe72e3?auto=format&fit=crop&w=100&q=80',
    'Maize': 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=100&q=80',
    'Bajra': 'https://images.unsplash.com/photo-1471193945509-9adadd0974ce?auto=format&fit=crop&w=100&q=80',
    'Rice (Paddy)': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=100&q=80',
    'Groundnut': 'https://images.unsplash.com/photo-1567375698509-4627d38e607f?auto=format&fit=crop&w=100&q=80',
    'Tomato': 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=100&q=80',
    'Potato': 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=100&q=80',
    'Moong': 'https://images.unsplash.com/photo-1621535266226-c5e317c46237?auto=format&fit=crop&w=100&q=80',
    'Turmeric': 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=100&q=80',
  };
  // Fallback for Marathi names or missing crops
  if (cropName.includes('सोयाबीन')) return map['Soyabean'];
  if (cropName.includes('कापूस')) return map['Cotton'];
  if (cropName.includes('कांदा')) return map['Onion'];
  if (cropName.includes('गहू')) return map['Wheat'];
  if (cropName.includes('तूर')) return map['Tur'];
  if (cropName.includes('हरभरा')) return map['Gram (Chana)'];
  if (cropName.includes('मका')) return map['Maize'];
  if (cropName.includes('बाजरी')) return map['Bajra'];
  if (cropName.includes('तांदूळ')) return map['Rice (Paddy)'];
  if (cropName.includes('भुईमूग')) return map['Groundnut'];
  if (cropName.includes('टोमॅटो')) return map['Tomato'];
  if (cropName.includes('बटाटा')) return map['Potato'];
  if (cropName.includes('मूग')) return map['Moong'];
  if (cropName.includes('हळद')) return map['Turmeric'];
  
  return 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=100&q=80';
};

// --- SUB-COMPONENTS ---

// 1. Splash Screen
const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className={`h-screen w-full ${gradients.primary} flex flex-col items-center justify-center text-white relative overflow-hidden`}>
      {/* Decorative Circles */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-400/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

      <div className="bg-white/20 p-8 rounded-full mb-8 animate-bounce backdrop-blur-sm border border-white/30 shadow-2xl">
        <Sprout size={80} className="text-white drop-shadow-lg" />
      </div>
      <h1 className="text-5xl font-extrabold mb-3 text-center drop-shadow-sm tracking-tight">AI कृषी मित्र</h1>
      <p className="text-xl opacity-90 font-medium tracking-wide">स्मार्ट शेती, समृद्ध शेतकरी</p>
    </div>
  );
};

// 2. Language Selection
const LanguageSelection = ({ onSelect }: { onSelect: (lang: Language) => void }) => {
  return (
    <div className="min-h-screen w-full bg-green-50 flex flex-col items-center justify-center p-6 relative">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1625246333195-09d9b630dc20?q=80&w=1000&auto=format&fit=crop')] bg-cover opacity-10"></div>
      
      <div className={`${gradients.card} p-8 rounded-3xl w-full max-w-md z-10`}>
        <div className="flex justify-center mb-6">
          <div className="bg-green-100 p-4 rounded-full shadow-inner">
            <Sprout size={40} className="text-green-700" />
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-8 text-gray-800 text-center">भाषा निवडा / Select Language</h2>
        <div className="space-y-4">
          <button onClick={() => onSelect('mr')} className="w-full p-4 rounded-xl border-2 border-green-600 bg-green-50 text-green-800 font-bold text-lg hover:bg-green-600 hover:text-white transition-all flex items-center justify-center gap-3">
            <span className="text-2xl">🇮🇳</span> मराठी
          </button>
          <button onClick={() => onSelect('hi')} className="w-full p-4 rounded-xl border border-gray-200 bg-white text-gray-700 font-medium text-lg hover:border-green-500 hover:text-green-600 transition-all flex items-center justify-center gap-3">
             <span className="text-2xl">🇮🇳</span> हिंदी
          </button>
          <button onClick={() => onSelect('en')} className="w-full p-4 rounded-xl border border-gray-200 bg-white text-gray-700 font-medium text-lg hover:border-green-500 hover:text-green-600 transition-all flex items-center justify-center gap-3">
             <span className="text-2xl">🇬🇧</span> English
          </button>
        </div>
      </div>
    </div>
  );
};

// 3. Consolidated Auth Modal (Login + OTP + Profile)
const AuthModal = ({ lang, onClose, onComplete }: { lang: Language, onClose: () => void, onComplete: (user: UserProfile) => void }) => {
  const t = TRANSLATIONS[lang];
  const [step, setStep] = useState<'MOBILE' | 'OTP' | 'PROFILE'>('MOBILE');
  const [mobile, setMobile] = useState('');
  const [tempUser, setTempUser] = useState<UserProfile>({
    name: '',
    village: '',
    district: '',
    landSize: '',
    crop: ''
  });

  const handleProfileChange = (f: keyof UserProfile, v: string) => setTempUser(p => ({...p, [f]: v}));

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
       <div className={`${gradients.card} w-full max-w-lg rounded-3xl overflow-hidden relative shadow-2xl flex flex-col`}>
          
          {/* Close Button */}
          <button onClick={onClose} className="absolute top-4 right-4 bg-gray-100 p-2 rounded-full hover:bg-red-500 hover:text-white transition-colors z-20">
            <X size={20} />
          </button>

          {/* Header Graphic */}
          <div className="h-32 bg-green-800 relative overflow-hidden flex items-center justify-center">
             <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1560493676-04071c5f467b?q=80&w=1000')] bg-cover opacity-40"></div>
             <div className="relative z-10 text-center">
               <div className="bg-white/20 p-3 rounded-full inline-block backdrop-blur-md border border-white/30 mb-2">
                 {step === 'PROFILE' ? <User className="text-white" size={32} /> : <Phone className="text-white" size={32} />}
               </div>
               <h3 className="text-white font-bold text-xl drop-shadow-md">
                  {step === 'MOBILE' && t.login}
                  {step === 'OTP' && "Verify Mobile"}
                  {step === 'PROFILE' && t.profile_title}
               </h3>
             </div>
          </div>

          <div className="p-8">
            {step === 'MOBILE' && (
               <div className="space-y-6 animate-slide-up">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 ml-1">{t.enter_mobile}</label>
                    <div className="flex items-center bg-gray-50 border-2 border-gray-200 rounded-2xl px-4 py-3 focus-within:border-green-500 focus-within:ring-4 focus-within:ring-green-500/10 transition-all">
                      <span className="text-gray-400 font-bold mr-2">+91</span>
                      <input 
                        type="tel" 
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        className="w-full bg-transparent outline-none text-lg font-bold text-gray-900 placeholder-gray-300"
                        placeholder="98XXXXXXXX"
                        maxLength={10}
                      />
                    </div>
                  </div>
                  <Button fullWidth onClick={() => setStep('OTP')} disabled={mobile.length < 10} size="lg">
                    {t.get_otp}
                  </Button>
               </div>
            )}

            {step === 'OTP' && (
              <div className="space-y-6 animate-slide-up">
                <div className="text-center mb-4">
                   <p className="text-gray-500 text-sm">OTP sent to <span className="font-bold text-gray-800">+91 {mobile}</span></p>
                </div>
                <div className="flex justify-between gap-2 px-4">
                  {[1,2,3,4].map(i => (
                    <input key={i} type="number" className="w-14 h-14 bg-gray-50 border-2 border-gray-200 rounded-xl text-center text-2xl font-bold outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all" />
                  ))}
                </div>
                <Button fullWidth onClick={() => setStep('PROFILE')} size="lg">
                  {t.submit}
                </Button>
                <button onClick={() => setStep('MOBILE')} className="w-full text-center text-sm text-gray-500 hover:text-green-600 font-medium">
                  Change Number
                </button>
              </div>
            )}

            {step === 'PROFILE' && (
              <div className="space-y-4 animate-slide-up overflow-y-auto max-h-[50vh] pr-2">
                 <div className="space-y-4">
                    <div className="group">
                      <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">{t.name_label}</label>
                      <input 
                        value={tempUser.name}
                        onChange={(e) => handleProfileChange('name', e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-green-500 transition-all"
                        placeholder="Enter full name"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="group">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">{t.village_label}</label>
                        <input 
                          value={tempUser.village}
                          onChange={(e) => handleProfileChange('village', e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-green-500 transition-all"
                        />
                      </div>
                      <div className="group">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">{t.district_label}</label>
                        <input 
                          value={tempUser.district}
                          onChange={(e) => handleProfileChange('district', e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-green-500 transition-all"
                        />
                      </div>
                    </div>
                     <div className="group">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 ml-1 flex items-center gap-2">
                          <Sprout size={12} className="text-green-600" /> {t.crop_label}
                        </label>
                        <select 
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500 transition-all group-hover:bg-white group-hover:shadow-sm appearance-none"
                            value={tempUser.crop}
                            onChange={(e) => handleProfileChange('crop', e.target.value)}
                        >
                          <option value="">Select Crop</option>
                          <option value="Soyabean">Soyabean (सोयाबीन)</option>
                          <option value="Cotton">Cotton (कापूस)</option>
                          <option value="Onion">Onion (कांदा)</option>
                          <option value="Wheat">Wheat (गहू)</option>
                        </select>
                      </div>
                 </div>
                 <div className="pt-4">
                   <Button fullWidth onClick={() => onComplete(tempUser)} size="lg">Save Profile</Button>
                 </div>
              </div>
            )}
          </div>
       </div>
    </div>
  );
}

// 4. Edit Profile Modal (New)
const ProfileModal = ({ lang, user, onSave, onClose }: { lang: Language, user: UserProfile, onSave: (u: UserProfile) => void, onClose: () => void }) => {
  const t = TRANSLATIONS[lang];
  const [tempUser, setTempUser] = useState<UserProfile>(user);

  const handleProfileChange = (f: keyof UserProfile, v: string) => setTempUser(p => ({...p, [f]: v}));

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
       <div className={`${gradients.card} w-full max-w-lg rounded-3xl overflow-hidden relative shadow-2xl flex flex-col`}>
          
          <button onClick={onClose} className="absolute top-4 right-4 bg-gray-100 p-2 rounded-full hover:bg-red-500 hover:text-white transition-colors z-20">
            <X size={20} />
          </button>

          <div className="h-32 bg-green-800 relative overflow-hidden flex items-center justify-center">
             <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1560493676-04071c5f467b?q=80&w=1000')] bg-cover opacity-40"></div>
             <div className="relative z-10 text-center">
               <div className="bg-white/20 p-3 rounded-full inline-block backdrop-blur-md border border-white/30 mb-2">
                 <User className="text-white" size={32} />
               </div>
               <h3 className="text-white font-bold text-xl drop-shadow-md">
                  {t.profile_title}
               </h3>
             </div>
          </div>

          <div className="p-8">
              <div className="space-y-4 animate-slide-up overflow-y-auto max-h-[50vh] pr-2">
                 <div className="space-y-4">
                    <div className="group">
                      <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">{t.name_label}</label>
                      <input 
                        value={tempUser.name}
                        onChange={(e) => handleProfileChange('name', e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-green-500 transition-all"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="group">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">{t.village_label}</label>
                        <input 
                          value={tempUser.village}
                          onChange={(e) => handleProfileChange('village', e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-green-500 transition-all"
                        />
                      </div>
                      <div className="group">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">{t.district_label}</label>
                        <input 
                          value={tempUser.district}
                          onChange={(e) => handleProfileChange('district', e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-green-500 transition-all"
                        />
                      </div>
                    </div>
                     <div className="group">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 ml-1 flex items-center gap-2">
                          <Sprout size={12} className="text-green-600" /> {t.crop_label}
                        </label>
                        <select 
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500 transition-all group-hover:bg-white group-hover:shadow-sm appearance-none"
                            value={tempUser.crop}
                            onChange={(e) => handleProfileChange('crop', e.target.value)}
                        >
                          <option value="">Select Crop</option>
                          <option value="Soyabean">Soyabean (सोयाबीन)</option>
                          <option value="Cotton">Cotton (कापूस)</option>
                          <option value="Onion">Onion (कांदा)</option>
                          <option value="Wheat">Wheat (गहू)</option>
                        </select>
                      </div>
                 </div>
                 <div className="pt-4">
                   <Button fullWidth onClick={() => onSave(tempUser)} size="lg">Save Changes</Button>
                 </div>
              </div>
          </div>
       </div>
    </div>
  );
}


// 5. Market Component (New Feature)
const MarketPrices = ({ lang, onBack }: { lang: Language, onBack: () => void }) => {
  const t = TRANSLATIONS[lang];
  // Mock data
  const data: MarketItem[] = [
    { id: '1', crop: lang === 'mr' ? 'सोयाबीन' : 'Soyabean', price: 4800, change: 2.5, trend: 'up' },
    { id: '2', crop: lang === 'mr' ? 'कापूस' : 'Cotton', price: 7200, change: -1.2, trend: 'down' },
    { id: '3', crop: lang === 'mr' ? 'कांदा' : 'Onion', price: 1800, change: 5.0, trend: 'up' },
    { id: '4', crop: lang === 'mr' ? 'गहू' : 'Wheat', price: 2600, change: 0.0, trend: 'stable' },
    { id: '5', crop: lang === 'mr' ? 'तूर' : 'Tur', price: 9500, change: 1.5, trend: 'up' },
    { id: '6', crop: lang === 'mr' ? 'हरभरा' : 'Gram (Chana)', price: 5400, change: 0.8, trend: 'up' },
    { id: '7', crop: lang === 'mr' ? 'मका' : 'Maize', price: 2100, change: -0.5, trend: 'down' },
    { id: '8', crop: lang === 'mr' ? 'बाजरी' : 'Bajra', price: 2350, change: 1.0, trend: 'up' },
    { id: '9', crop: lang === 'mr' ? 'तांदूळ' : 'Rice (Paddy)', price: 3200, change: 0.0, trend: 'stable' },
    { id: '10', crop: lang === 'mr' ? 'भुईमूग' : 'Groundnut', price: 6800, change: 3.2, trend: 'up' },
    { id: '11', crop: lang === 'mr' ? 'टोमॅटो' : 'Tomato', price: 1200, change: -5.0, trend: 'down' },
    { id: '12', crop: lang === 'mr' ? 'बटाटा' : 'Potato', price: 1500, change: 2.0, trend: 'up' },
    { id: '13', crop: lang === 'mr' ? 'मूग' : 'Moong', price: 8200, change: 1.1, trend: 'up' },
    { id: '14', crop: lang === 'mr' ? 'हळद' : 'Turmeric', price: 14500, change: 4.5, trend: 'up' },
  ];

  return (
    <div className="h-full flex flex-col bg-gray-50 pb-20">
       <div className="bg-white p-4 shadow-sm flex items-center sticky top-0 z-10 lg:hidden">
        <button onClick={onBack}><ArrowLeft className="text-gray-600 mr-4" /></button>
        <h2 className="text-xl font-bold">{t.market}</h2>
      </div>

      <div className="p-4 lg:p-8 overflow-y-auto">
        <div className="bg-gradient-to-r from-orange-400 to-red-500 rounded-3xl p-6 text-white mb-6 shadow-lg shadow-orange-200 flex justify-between items-center relative overflow-hidden">
           <div className="relative z-10">
              <h3 className="font-bold opacity-90 flex items-center gap-2"><TrendingUp className="text-white" /> {t.market_rate}</h3>
              <p className="text-sm opacity-80 mt-1">Live updates from APMC</p>
           </div>
           <div className="bg-white/20 p-3 rounded-full backdrop-blur-md">
              <Store size={32} />
           </div>
           <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((item) => {
             const engName = item.crop.split('(')[0].trim(); // Fallback extraction
             const imgUrl = getCropImage(item.crop) || getCropImage(engName);
             return (
              <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex items-center gap-4 group">
                <div className="w-20 h-20 rounded-xl overflow-hidden shadow-sm flex-shrink-0">
                   <img src={imgUrl} alt={item.crop} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-lg font-bold text-gray-800 leading-tight">{item.crop}</h4>
                    <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${item.trend === 'up' ? 'bg-green-100 text-green-700' : item.trend === 'down' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                        {item.trend === 'up' ? '▲' : item.trend === 'down' ? '▼' : '•'} {Math.abs(item.change)}%
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">₹{item.price}</p>
                  <p className="text-xs text-gray-500">per Quintal</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
};

// 6. Disease Detector (Enhanced)
const DiseaseDetector = ({ lang, onBack }: { lang: Language, onBack: () => void }) => {
  const t = TRANSLATIONS[lang];
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyze = async () => {
    if (!image) return;
    setLoading(true);
    const res = await analyzeCropDisease(image, lang);
    setResult(res);
    setLoading(false);
  };

  return (
    <div className="h-full bg-gray-50 flex flex-col pb-20">
      <div className="bg-white p-4 shadow-sm flex items-center sticky top-0 z-10 lg:hidden">
        <button onClick={onBack}><ArrowLeft className="text-gray-600 mr-4" /></button>
        <h2 className="text-xl font-bold">{t.disease_check}</h2>
      </div>

      <div className="p-4 lg:p-8 flex-1 overflow-y-auto">
        {!image ? (
          <div className="bg-gray-900 rounded-3xl h-[60vh] flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
             <div className="absolute inset-0 bg-black/40 z-0"></div>
             {/* Camera UI Overlays */}
             <div className="absolute top-8 right-8 z-10">
               <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                 <Settings className="text-white" size={20} />
               </div>
             </div>
             <div className="border-2 border-white/50 w-64 h-64 rounded-3xl z-10 flex items-center justify-center relative">
                <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-green-500 -mt-1 -ml-1"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-green-500 -mt-1 -mr-1"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-green-500 -mb-1 -ml-1"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-green-500 -mb-1 -mr-1"></div>
                <ScanLine size={48} className="text-white/80 animate-pulse" />
             </div>
             
             <div className="absolute bottom-10 z-10 w-full flex justify-center">
                <label className="bg-white w-20 h-20 rounded-full flex items-center justify-center cursor-pointer hover:scale-105 transition-transform shadow-lg shadow-white/20 border-4 border-gray-300">
                  <Camera size={32} className="text-gray-800" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
                </label>
             </div>
             <p className="absolute bottom-28 text-white/80 font-medium z-10 bg-black/20 px-4 py-1 rounded-full backdrop-blur-md">Upload Crop Photo</p>
          </div>
        ) : (
          <div className="mb-6 relative group">
             <img src={image} alt="Crop" className="w-full max-h-[500px] object-cover rounded-3xl shadow-lg" />
             <button 
                onClick={() => { setImage(null); setResult(null); }} 
                className="absolute top-4 right-4 bg-black/60 text-white p-2 rounded-full hover:bg-black/80 transition-colors"
             >
               <X size={20} />
             </button>
          </div>
        )}

        {image && !result && (
          <div className="mt-6">
            <Button fullWidth onClick={analyze} disabled={loading} size="lg">
              {loading ? <div className="flex items-center gap-2"><Loader2 className="animate-spin" /> {t.analyzing}</div> : t.submit}
            </Button>
          </div>
        )}

        {result && (
          <div className={`${gradients.card} p-6 rounded-3xl mt-4 animate-slide-up`}>
             <h3 className="font-bold text-xl text-green-800 mb-4 flex items-center border-b pb-2">
               <Sprout className="mr-2" size={24} />
               {t.result}
             </h3>
             <div className="prose prose-lg text-gray-700 whitespace-pre-line leading-relaxed">
               {result}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

// 7. Weather (Enhanced)

// Helper to get day name relative to today
const getDayName = (offset: number, lang: Language) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  if (offset === 0) return lang === 'mr' ? 'आज' : lang === 'hi' ? 'आज' : 'Today';
  return date.toLocaleDateString(lang === 'mr' ? 'mr-IN' : 'en-US', { weekday: 'short' });
};

// Internal Component for Rich Animated Icons
const AnimatedWeatherIcon = ({ condition }: { condition: string }) => {
  const isSunny = condition.includes('Sunny') || condition.includes('Clear');
  const isRainy = condition.includes('Rain') || condition.includes('Drizzle');
  const isCloudy = condition.includes('Cloud') || condition.includes('Overcast');

  if (isSunny) {
    return (
      <div className="relative w-32 h-32 flex items-center justify-center">
        <div className="absolute inset-0 bg-yellow-400 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <Sun size={90} className="text-yellow-400 relative z-10" style={{ animation: 'spin 12s linear infinite' }} />
        {/* Static decorative rays or glare */}
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-tr from-transparent via-white/10 to-transparent rounded-full z-20"></div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (isRainy) {
    return (
      <div className="relative w-32 h-32 flex items-center justify-center">
        <CloudRain size={90} className="text-blue-200 drop-shadow-lg relative z-10" />
        <div className="absolute -top-2 -right-4">
           <Cloud size={50} className="text-gray-400 opacity-60 animate-bounce" style={{ animationDuration: '3s' }} />
        </div>
        {/* Simple CSS Rain drops simulation if feasible, else stick to icon */}
        <div className="absolute bottom-0 w-full flex justify-center gap-2">
           <div className="w-1 h-3 bg-blue-300 rounded-full animate-bounce delay-75"></div>
           <div className="w-1 h-3 bg-blue-300 rounded-full animate-bounce delay-150"></div>
           <div className="w-1 h-3 bg-blue-300 rounded-full animate-bounce delay-300"></div>
        </div>
      </div>
    );
  }

  // Default Cloudy
  return (
    <div className="relative w-32 h-32 flex items-center justify-center">
      <Cloud size={90} className="text-white drop-shadow-xl relative z-10" />
      <div className="absolute -bottom-2 -left-4">
         <Cloud size={50} className="text-white/60 animate-pulse" style={{ animationDuration: '4s' }} />
      </div>
       <div className="absolute -top-4 -right-4">
         <CloudSun size={50} className="text-yellow-200 opacity-80" />
      </div>
    </div>
  );
};


const Weather = ({ lang, onBack }: { lang: Language, onBack: () => void }) => {
  const t = TRANSLATIONS[lang];
  const [currentCondition, setCurrentCondition] = useState('Partly Cloudy');
  
  // Mock data for graph
  const hourlyData = [
    { time: '6AM', temp: 22 }, { time: '9AM', temp: 25 }, { time: '12PM', temp: 29 }, 
    { time: '3PM', temp: 30 }, { time: '6PM', temp: 27 }, { time: '9PM', temp: 24 }
  ];

  // Dynamic Background based on condition
  const getBgClass = () => {
    if (currentCondition.includes('Sunny')) return 'bg-gradient-to-br from-blue-400 to-blue-600';
    if (currentCondition.includes('Rain')) return 'bg-gradient-to-br from-slate-700 to-slate-900';
    return 'bg-gradient-to-br from-indigo-500 to-blue-600'; // Cloudy default
  };

  return (
    <div className="h-full bg-blue-50/50 flex flex-col pb-20">
      <div className="bg-white p-4 shadow-sm flex items-center lg:hidden">
        <button onClick={onBack}><ArrowLeft className="text-gray-600 mr-4" /></button>
        <h2 className="text-xl font-bold">{t.weather}</h2>
      </div>
      <div className="p-4 lg:p-8 space-y-6 overflow-y-auto">
        
        {/* Main Dynamic Card */}
        <div className={`${getBgClass()} text-white rounded-[2.5rem] p-8 shadow-2xl shadow-blue-900/20 relative overflow-hidden transition-colors duration-1000`}>
           {/* Abstract Animated Background Shapes */}
           <div className="absolute -top-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse" style={{animationDuration: '8s'}}></div>
           <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-2xl"></div>

           <div className="relative z-10 flex justify-between items-center">
              <div>
                <p className="text-blue-50 text-lg font-medium tracking-wide flex items-center gap-2">
                   <MapPinIcon size={18} /> Mumbai, MH
                </p>
                <div className="flex items-end gap-4 mt-2">
                   <h1 className="text-8xl font-bold tracking-tighter drop-shadow-sm">28°</h1>
                   <div className="mb-4">
                      <p className="text-3xl font-medium">{t.today}</p>
                      <p className="text-blue-100 opacity-80">{currentCondition}</p>
                   </div>
                </div>
              </div>
              <div className="hidden md:block">
                 <AnimatedWeatherIcon condition={currentCondition} />
              </div>
           </div>
           
           <div className="mt-8 grid grid-cols-3 gap-4">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex flex-col items-center">
                 <Droplets size={24} className="mb-2 text-blue-200" />
                 <p className="text-sm text-blue-100">{t.humidity}</p>
                 <p className="font-bold text-xl">65%</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex flex-col items-center">
                 <Wind size={24} className="mb-2 text-blue-200" />
                 <p className="text-sm text-blue-100">{t.wind}</p>
                 <p className="font-bold text-xl">12km/h</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex flex-col items-center">
                 <ThermometerSun size={24} className="mb-2 text-blue-200" />
                 <p className="text-sm text-blue-100">UV Index</p>
                 <p className="font-bold text-xl">Moderate</p>
              </div>
           </div>
        </div>

        {/* Hourly Graph */}
        <div className="bg-white rounded-3xl shadow-sm p-6 h-72 border border-gray-100">
           <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><TrendingUp size={18} className="text-blue-500"/> Temperature Trend</h3>
           <ResponsiveContainer width="100%" height="85%">
             <AreaChart data={hourlyData}>
               <defs>
                 <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                   <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                   <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                 </linearGradient>
               </defs>
               <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} 
                  labelStyle={{color: '#6b7280'}}
               />
               <Area 
                  type="monotone" 
                  dataKey="temp" 
                  stroke="#3b82f6" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorTemp)" 
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#2563eb' }}
               />
               <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af', dy: 10}} />
             </AreaChart>
           </ResponsiveContainer>
        </div>
        
        {/* Forecast List (Highlighting Today) */}
        <div className="bg-white rounded-3xl shadow-sm p-6 border border-gray-100">
          <h3 className="font-bold mb-6 text-gray-800 text-xl">5-Day Forecast</h3>
          <div className="space-y-4">
          {[0,1,2,3,4].map((i) => {
             const dayName = getDayName(i, lang);
             const isToday = i === 0;
             const tempHigh = 30 + (i % 2 === 0 ? 1 : -1);
             const tempLow = 22 + (i % 2 === 0 ? 0 : -1);
             
             return (
             <div 
               key={i} 
               className={`flex justify-between items-center p-4 rounded-2xl transition-all duration-300 ${
                 isToday 
                 ? 'bg-blue-50 border-2 border-blue-200 shadow-md scale-[1.02]' 
                 : 'hover:bg-gray-50 border border-transparent'
               }`}
             >
                <div className="flex items-center gap-4 w-1/3">
                   <span className={`font-bold text-lg ${isToday ? 'text-blue-700' : 'text-gray-600'}`}>{dayName}</span>
                   {isToday && <span className="text-[10px] font-bold bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full">NOW</span>}
                </div>
                
                <div className="flex items-center gap-4 flex-1 justify-center">
                   {i % 2 === 0 
                     ? <CloudSun size={28} className="text-yellow-500" /> 
                     : <Cloud size={28} className="text-gray-400" />
                   }
                   <span className="text-sm text-gray-400 font-medium hidden sm:block">{i % 2 === 0 ? 'Partly Sunny' : 'Cloudy'}</span>
                </div>
                
                <div className="w-1/3 text-right">
                   <span className="font-bold text-gray-800 text-xl">{tempHigh}°</span> 
                   <span className="text-gray-400 text-sm font-medium ml-2">{tempLow}°</span>
                </div>
             </div>
          )})}
          </div>
        </div>
      </div>
    </div>
  );
};

// 8. Voice Assistant (Enhanced)
const VoiceAssistant = ({ lang, user, onBack }: { lang: Language, user: UserProfile, onBack: () => void }) => {
  const t = TRANSLATIONS[lang];
  const [listening, setListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: lang === 'mr' ? 'नमस्कार! मी तुमचा कृषी मित्र. काय मदत करू?' : 'Hello! I am Krushi Mitra. How can I help?', timestamp: new Date() }
  ]);
  const [inputText, setInputText] = useState('');
  const [processing, setProcessing] = useState(false);
  
  // Ref to scroll to bottom
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Speak function
  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop previous
      const utterance = new SpeechSynthesisUtterance(text);
      // Use Hindi voice for Marathi as fallback if Marathi specific not available, improves accent often
      utterance.lang = lang === 'mr' ? 'hi-IN' : 'en-US'; 
      utterance.rate = 0.9; // Slightly slower for clarity
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  // Initial Greeting on Mount
  useEffect(() => {
    // Small timeout to ensure component is ready and browser allows audio (interaction usually required, but often works on nav)
    const timer = setTimeout(() => {
       const greeting = messages[0].text;
       speak(greeting);
    }, 500);
    return () => {
      clearTimeout(timer);
      window.speechSynthesis.cancel();
    };
  }, []);

  // Mock Speech Recognition
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
       alert("Speech recognition not supported in this browser. Please type.");
       return;
    }
    
    // Stop speaking if user wants to talk
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    setListening(true);
    // Simulate listening delay
    setTimeout(() => {
       setListening(false);
       handleSend(lang === 'mr' ? 'आज पाणी द्यावे का?' : 'Should I irrigate today?');
    }, 2000);
  };

  const handleSend = async (text: string) => {
    if(!text.trim()) return;
    
    // Stop current speech
    window.speechSynthesis.cancel();
    setIsSpeaking(false);

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setProcessing(true);

    const responseText = await getAIFarmingAdvice(text, lang, user.crop);
    
    const aiMsg: ChatMessage = { id: (Date.now()+1).toString(), role: 'model', text: responseText, timestamp: new Date() };
    setMessages(prev => [...prev, aiMsg]);
    setProcessing(false);

    // Speak response
    speak(responseText);
  };

  return (
    <div className="h-full flex flex-col relative overflow-hidden pb-20">
       {/* Background Image */}
       <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1625246333195-09d9b630dc20?q=80&w=1920&auto=format&fit=crop" 
            alt="Lush Farm Background" 
            className="w-full h-full object-cover"
          />
          {/* Gradient Overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/60 backdrop-blur-[2px]"></div>
       </div>

       {/* Header */}
       <div className="bg-white/90 backdrop-blur-md p-4 shadow-sm flex items-center lg:hidden relative z-10 border-b border-white/20">
         <button onClick={() => { window.speechSynthesis.cancel(); onBack(); }}><ArrowLeft className="mr-4 text-gray-800" /></button>
         <h2 className="font-bold text-xl text-gray-900 flex items-center gap-2">
            <Mic size={20} className="text-green-600"/> {t.voice_help}
         </h2>
       </div>

       {/* AI Avatar Display Area */}
       <div className="relative z-10 flex-shrink-0 flex justify-center py-6">
          <div className={`relative w-32 h-32 rounded-full border-4 border-white/50 shadow-2xl transition-all duration-300 ${isSpeaking ? 'scale-110 shadow-green-400/50' : ''}`}>
             <img 
               src="https://cdn-icons-png.flaticon.com/512/4712/4712009.png" 
               alt="AI Farmer" 
               className="w-full h-full rounded-full object-cover bg-green-100 p-1"
             />
             {/* Talking Animation Rings */}
             {isSpeaking && (
               <>
                 <div className="absolute inset-0 rounded-full border-4 border-green-400 opacity-60 animate-ping"></div>
                 <div className="absolute -inset-2 rounded-full border-2 border-green-300 opacity-40 animate-pulse"></div>
               </>
             )}
             {/* Online Indicator */}
             <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-2 border-white rounded-full flex items-center justify-center">
                {isSpeaking ? (
                   <div className="flex gap-0.5 h-3 items-end">
                      <div className="w-1 bg-white animate-[bounce_1s_infinite] h-2"></div>
                      <div className="w-1 bg-white animate-[bounce_1.2s_infinite] h-3"></div>
                      <div className="w-1 bg-white animate-[bounce_0.8s_infinite] h-2"></div>
                   </div>
                ) : <div className="w-2 h-2 bg-white rounded-full"></div>}
             </div>
          </div>
       </div>

       {/* Chat Area */}
       <div className="flex-1 overflow-y-auto p-4 space-y-6 relative z-10 scrollbar-hide mask-image-b">
         {messages.map(m => (
           <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
              <div className={`flex items-end gap-2 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                 
                 {/* Small Avatar for Chat Bubbles */}
                 {m.role === 'model' && (
                   <div className="w-8 h-8 rounded-full overflow-hidden border border-white/50 shadow-sm flex-shrink-0 bg-white/90 backdrop-blur flex items-center justify-center">
                      <img src="https://cdn-icons-png.flaticon.com/512/4712/4712009.png" alt="AI" className="w-full h-full p-1" />
                   </div>
                 )}

                 <div className={`p-4 rounded-2xl shadow-lg backdrop-blur-md text-lg leading-relaxed ${
                   m.role === 'user' 
                   ? 'bg-green-600 text-white rounded-br-none shadow-green-900/30' 
                   : 'bg-white/90 text-gray-900 rounded-bl-none border border-white/40'
                 }`}>
                    {m.text}
                 </div>
              </div>
           </div>
         ))}
         {processing && (
           <div className="flex justify-start">
             <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl rounded-bl-none shadow-sm border border-white/40 flex gap-2 items-center ml-10">
               <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
               <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-75"></div>
               <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-150"></div>
             </div>
           </div>
         )}
         <div ref={messagesEndRef} />
       </div>

       {/* Input Area */}
       <div className="p-4 bg-white/10 backdrop-blur-xl border-t border-white/20 relative z-10">
          {listening && <div className="text-center text-white font-bold animate-pulse mb-2 bg-black/40 py-1 rounded-full backdrop-blur-md inline-block px-4 mx-auto w-full">🎤 {t.listening}</div>}
          <div className="flex gap-3 items-center bg-white/90 p-2 rounded-full border border-white/50 shadow-2xl focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-500/50 transition-all">
            <button 
              onClick={startListening}
              className={`p-4 rounded-full text-white transition-all transform hover:scale-110 active:scale-95 ${listening ? 'bg-red-500 shadow-lg shadow-red-500/40 animate-pulse' : 'bg-green-600 shadow-lg shadow-green-600/40'}`}
            >
              <Mic size={24} />
            </button>
            <input 
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              className="flex-1 bg-transparent px-2 outline-none text-gray-800 placeholder-gray-500 text-lg"
              placeholder={t.ask_question}
              onKeyDown={(e) => e.key === 'Enter' && handleSend(inputText)}
            />
            <button onClick={() => handleSend(inputText)} className="p-3 text-green-700 hover:bg-green-100 rounded-full transition-colors">
              <Send size={24} />
            </button>
          </div>
       </div>
    </div>
  );
};

// 9. Yield & Profit (Chart)
const YieldCalculator = ({ lang, onBack }: { lang: Language, onBack: () => void }) => {
  const t = TRANSLATIONS[lang];
  const data = [
    { name: 'Cost', amount: 15000, color: '#ef4444' },
    { name: 'Income', amount: 60000, color: '#22c55e' },
    { name: 'Profit', amount: 45000, color: '#eab308' },
  ];

  return (
    <div className="h-full bg-gray-50 flex flex-col pb-20">
      <div className="bg-white p-4 shadow-sm flex items-center lg:hidden">
        <button onClick={onBack}><ArrowLeft className="text-gray-600 mr-4" /></button>
        <h2 className="text-xl font-bold">{t.profit}</h2>
      </div>

      <div className="p-4 lg:p-8 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`${gradients.card} p-6 rounded-3xl`}>
             <h3 className="text-gray-500 mb-2 font-medium uppercase tracking-wide text-sm">Estimated Yield</h3>
             <p className="text-4xl font-extrabold text-gray-800">12 Quintal</p>
             <div className="mt-4 flex items-center text-green-600 bg-green-50 w-fit px-3 py-1 rounded-full text-sm font-medium">
                <TrendingUp size={16} className="mr-1" /> +10% vs last year
             </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-100 to-orange-100 p-6 rounded-3xl border border-orange-200">
             <h4 className="font-bold text-orange-800 mb-2 flex items-center"><Store className="mr-2"/> Market Insight</h4>
             <p className="text-orange-900 opacity-80 text-sm leading-relaxed">
               Soybean rates are up by 5% in Pune Mandi today. It is a good time to sell if you have storage.
             </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm h-96 mt-6 border border-gray-100">
          <h3 className="font-bold mb-6 text-gray-700">Financial Overview (₹)</h3>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={data} barSize={60}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 14}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
              <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}} />
              <Bar dataKey="amount" radius={[12, 12, 0, 0]}>
                 {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                 ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// 10. Soil & Irrigation
const SoilIrrigation = ({ lang, onBack, user }: { lang: Language, onBack: () => void, user: UserProfile }) => {
  const t = TRANSLATIONS[lang];
  const [advice, setAdvice] = useState('');

  const getAdvice = async () => {
     setAdvice('Loading...');
     const res = await getSoilAdvice({n: 40, p: 20, k: 30}, user.crop, lang);
     setAdvice(res);
  }

  return (
    <div className="h-full bg-emerald-50/50 flex flex-col pb-20">
       <div className="bg-white p-4 shadow-sm flex items-center lg:hidden">
        <button onClick={onBack}><ArrowLeft className="text-gray-600 mr-4" /></button>
        <h2 className="text-xl font-bold">{t.soil_health}</h2>
      </div>

      <div className="p-4 lg:p-8 space-y-6 overflow-y-auto">
         {/* Main Status */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-emerald-100 flex items-center justify-between">
                <div>
                  <h3 className="text-gray-500 font-medium text-sm uppercase">Soil Moisture</h3>
                  <p className="text-3xl font-bold text-blue-600 mt-1">High (78%)</p>
                  <p className="text-sm text-gray-400 mt-2">Last checked: 2 hrs ago</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-full text-blue-500 shadow-inner">
                  <Droplets size={40} />
                </div>
            </div>
            
             <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 rounded-3xl text-white shadow-lg shadow-green-200">
                <h4 className="font-bold text-lg mb-2 opacity-90">{t.irrigation_advice}</h4>
                <div className="flex items-center gap-3">
                   <div className="bg-white/20 p-2 rounded-full"><TrendingUp size={24} /></div>
                   <p className="text-xl font-bold">{t.irrigation_not_needed}</p>
                </div>
                <p className="mt-3 text-sm text-green-100">Soil moisture is sufficient for next 48 hours.</p>
             </div>
         </div>

         {/* Fertilizer Calculator */}
         <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-6 text-xl">NPK Status & Fertilizer AI</h3>
            <div className="flex justify-between max-w-md mb-8 mx-auto gap-4">
               <div className="text-center relative flex-1">
                  <div className="w-full aspect-square rounded-full border-4 border-blue-500 flex flex-col items-center justify-center text-gray-700 bg-blue-50 shadow-sm">
                     <span className="text-2xl font-bold">40</span>
                     <Leaf size={16} className="text-blue-500 mt-1"/>
                  </div>
                  <span className="mt-2 block font-medium text-gray-500 text-sm">Nitrogen (N)</span>
               </div>
               <div className="text-center relative flex-1">
                  <div className="w-full aspect-square rounded-full border-4 border-purple-500 flex flex-col items-center justify-center text-gray-700 bg-purple-50 shadow-sm">
                     <span className="text-2xl font-bold">20</span>
                     <Flower size={16} className="text-purple-500 mt-1"/>
                  </div>
                  <span className="mt-2 block font-medium text-gray-500 text-sm">Phosphorus (P)</span>
               </div>
               <div className="text-center relative flex-1">
                  <div className="w-full aspect-square rounded-full border-4 border-yellow-500 flex flex-col items-center justify-center text-gray-700 bg-yellow-50 shadow-sm">
                     <span className="text-2xl font-bold">30</span>
                     <Wheat size={16} className="text-yellow-500 mt-1"/>
                  </div>
                  <span className="mt-2 block font-medium text-gray-500 text-sm">Potash (K)</span>
               </div>
            </div>
            
            {!advice ? (
               <div className="max-w-xs mx-auto mt-6">
                 <Button fullWidth onClick={getAdvice} size="lg">Get AI Recommendation</Button>
               </div>
            ) : (
               <div className="bg-yellow-50 p-6 rounded-2xl text-gray-800 border border-yellow-200 mt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Sprout className="text-yellow-600"/>
                    <h4 className="font-bold text-lg">AI Suggestion</h4>
                  </div>
                  <p className="whitespace-pre-line leading-relaxed">{advice}</p>
               </div>
            )}
         </div>
      </div>
    </div>
  );
};

// 12. NEW FEATURE: Government Schemes (Shetkari Yojana)
const GovernmentSchemes = ({ lang, onBack }: { lang: Language, onBack: () => void }) => {
  const t = TRANSLATIONS[lang];
  
  const schemes = [
    {
      id: 1,
      title: lang === 'mr' ? 'PM किसान सन्मान निधी' : 'PM Kisan Samman Nidhi',
      benefit: '₹6000 / year',
      desc: lang === 'mr' ? 'वर्षाला ६००० रुपये थेट बँक खात्यात जमा.' : 'Rs 6000 per year directly to bank account.',
      status: 'Active'
    },
    {
      id: 2,
      title: lang === 'mr' ? 'कुसुम सोलर पंप योजना' : 'Kusum Solar Pump Scheme',
      benefit: '90% Subsidy',
      desc: lang === 'mr' ? 'सौर पंपासाठी ९०% पर्यंत अनुदान.' : 'Up to 90% subsidy for solar water pumps.',
      status: 'Active'
    },
    {
      id: 3,
      title: lang === 'mr' ? 'ट्रॅक्टर अनुदान योजना' : 'Tractor Subsidy Scheme',
      benefit: '50% Subsidy',
      desc: lang === 'mr' ? 'नवीन ट्रॅक्टर खरेदीवर ५०% सवलत.' : '50% subsidy on new tractor purchase.',
      status: 'Open'
    },
    {
      id: 4,
      title: lang === 'mr' ? 'पिक विमा योजना' : 'Crop Insurance Scheme',
      benefit: 'Cover up to ₹50k',
      desc: lang === 'mr' ? 'नैसर्गिक आपत्तीमुळे पिकांचे नुकसान झाल्यास भरपाई.' : 'Compensation for crop loss due to natural calamities.',
      status: 'Active'
    }
  ];

  return (
    <div className="h-full bg-orange-50 flex flex-col pb-20">
      <div className="bg-white p-4 shadow-sm flex items-center sticky top-0 z-10 lg:hidden">
        <button onClick={onBack}><ArrowLeft className="text-gray-600 mr-4" /></button>
        <h2 className="text-xl font-bold">{t.schemes}</h2>
      </div>

      <div className="p-4 lg:p-8 overflow-y-auto">
        <div className="bg-orange-600 text-white rounded-3xl p-6 mb-6 shadow-lg">
          <div className="flex items-center gap-4">
             <div className="bg-white/20 p-3 rounded-full"><Landmark size={32} /></div>
             <div>
                <h3 className="text-2xl font-bold">{t.schemes}</h3>
                <p className="opacity-90">Govt. Support for You</p>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {schemes.map(s => (
            <div key={s.id} className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-orange-500 hover:shadow-md transition-all">
               <div className="flex justify-between items-start mb-2">
                 <h4 className="font-bold text-lg text-gray-800">{s.title}</h4>
                 <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold">{s.status}</span>
               </div>
               <p className="text-gray-600 text-sm mb-4">{s.desc}</p>
               <div className="flex items-center justify-between mt-4 border-t pt-4">
                  <span className="font-bold text-orange-600 text-lg">{s.benefit}</span>
                  <button className="text-sm bg-orange-50 text-orange-700 px-4 py-2 rounded-lg font-bold hover:bg-orange-100">{t.apply}</button>
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 13. NEW FEATURE: Crop Calendar (Pik Niyojan)
const CropCalendar = ({ lang, user, onBack }: { lang: Language, user: UserProfile, onBack: () => void }) => {
  const t = TRANSLATIONS[lang];
  
  // Generic stages for demo. In real app, this changes based on user.crop
  const stages = [
    { day: 1, title: lang === 'mr' ? 'पेरणी' : 'Sowing', desc: lang === 'mr' ? 'बियाणे प्रक्रिया करून पेरणी करा.' : 'Treat seeds and sow.' },
    { day: 15, title: lang === 'mr' ? 'तण नियंत्रण' : 'Weed Control', desc: lang === 'mr' ? 'पहिली कोळपणी करा.' : 'First hoeing for weed control.' },
    { day: 30, title: lang === 'mr' ? 'खत व्यवस्थापन' : 'Fertilizer Dose', desc: lang === 'mr' ? 'युरियाचा पहिला हप्ता द्या.' : 'Apply first dose of Urea.' },
    { day: 45, title: lang === 'mr' ? 'कीड नियंत्रण' : 'Pest Control', desc: lang === 'mr' ? 'अळीचा प्रादुर्भाव तपासा.' : 'Check for pest infestation.' },
    { day: 60, title: lang === 'mr' ? 'फुलरा अवस्था' : 'Flowering Stage', desc: lang === 'mr' ? 'पाण्याचे योग्य नियोजन करा.' : 'Manage irrigation properly.' },
    { day: 90, title: lang === 'mr' ? 'काढणी' : 'Harvesting', desc: lang === 'mr' ? 'पिक पक्व झाल्यावर काढणी करा.' : 'Harvest when crop is mature.' },
  ];

  return (
    <div className="h-full bg-green-50 flex flex-col pb-20">
      <div className="bg-white p-4 shadow-sm flex items-center sticky top-0 z-10 lg:hidden">
        <button onClick={onBack}><ArrowLeft className="text-gray-600 mr-4" /></button>
        <h2 className="text-xl font-bold">{t.calendar}</h2>
      </div>

      <div className="p-4 lg:p-8 overflow-y-auto">
         <div className="flex items-center gap-3 mb-6">
            <h3 className="text-2xl font-bold text-gray-800">{user.crop} - {t.calendar}</h3>
         </div>

         <div className="space-y-6 relative pl-4">
            {/* Timeline Line */}
            <div className="absolute left-8 top-4 bottom-4 w-1 bg-green-200 rounded-full"></div>

            {stages.map((stage, idx) => (
              <div key={idx} className="relative flex items-start gap-6 group">
                 {/* Timeline Dot */}
                 <div className="absolute left-8 -ml-3 w-7 h-7 bg-green-500 rounded-full border-4 border-white shadow-md z-10 flex items-center justify-center text-white text-[10px] font-bold">
                    {idx + 1}
                 </div>

                 <div className="ml-12 bg-white p-5 rounded-2xl shadow-sm border border-green-100 flex-1 hover:shadow-md transition-all">
                    <div className="flex justify-between items-center mb-2">
                       <h4 className="font-bold text-lg text-green-800">{stage.title}</h4>
                       <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-lg flex items-center gap-1">
                          <Clock size={12} /> {t.days}: {stage.day}
                       </span>
                    </div>
                    <p className="text-gray-600 text-sm">{stage.desc}</p>
                 </div>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
};

// 14. NEW FEATURE: Agri News
const AgriNews = ({ lang, onBack }: { lang: Language, onBack: () => void }) => {
  const t = TRANSLATIONS[lang];

  const newsItems = [
    {
       id: 1,
       headline: lang === 'mr' ? 'कापूस निर्यात बंदी उठवली' : 'Cotton Export Ban Lifted',
       date: '2 Oct 2025',
       image: 'https://images.unsplash.com/photo-1594235048472-7c8a6797a73a?w=400&q=80',
       summary: lang === 'mr' ? 'शेतकऱ्यांसाठी आनंदाची बातमी, केंद्र सरकारचा मोठा निर्णय.' : 'Good news for farmers, central govt takes big decision.'
    },
    {
       id: 2,
       headline: lang === 'mr' ? 'राज्यात मान्सून पुन्हा सक्रिय' : 'Monsoon Active Again in State',
       date: '1 Oct 2025',
       image: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=400&q=80',
       summary: lang === 'mr' ? 'येत्या ४ दिवसात मुसळधार पावसाची शक्यता.' : 'Heavy rain expected in next 4 days.'
    },
    {
       id: 3,
       headline: lang === 'mr' ? 'सोयाबीन हमीभावात वाढ' : 'Hike in Soybean MSP',
       date: '28 Sep 2025',
       image: 'https://images.unsplash.com/photo-1599583733261-0b5c7f8a9757?w=400&q=80',
       summary: lang === 'mr' ? 'केंद्र सरकारकडून सोयाबीनच्या हमीभावात २०० रुपयांची वाढ.' : 'Central govt increases soybean MSP by Rs 200.'
    }
  ];

  return (
    <div className="h-full bg-gray-50 flex flex-col pb-20">
      <div className="bg-white p-4 shadow-sm flex items-center sticky top-0 z-10 lg:hidden">
        <button onClick={onBack}><ArrowLeft className="text-gray-600 mr-4" /></button>
        <h2 className="text-xl font-bold">{t.news}</h2>
      </div>

      <div className="p-4 lg:p-8 overflow-y-auto space-y-4">
         {newsItems.map(item => (
            <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-sm flex flex-col md:flex-row cursor-pointer hover:shadow-md transition-all group">
               <div className="md:w-1/3 h-48 md:h-auto overflow-hidden">
                  <img src={item.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="News" />
               </div>
               <div className="p-5 flex-1 flex flex-col justify-center">
                  <div className="text-xs text-gray-400 font-bold mb-2 flex items-center gap-1"><Calendar size={12}/> {item.date}</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2 leading-tight">{item.headline}</h3>
                  <p className="text-gray-600 text-sm line-clamp-2">{item.summary}</p>
                  <span className="text-green-600 text-sm font-bold mt-3 block">{t.read_more} →</span>
               </div>
            </div>
         ))}
      </div>
    </div>
  );
};

// --- MAIN LAYOUT & APP ---

const Sidebar = ({ view, setView, lang, onProfileClick, isLoggedIn, onLoginClick }: { 
  view: ViewState, 
  setView: (v: ViewState) => void, 
  lang: Language, 
  onProfileClick: () => void,
  isLoggedIn: boolean,
  onLoginClick: () => void 
}) => {
  const t = TRANSLATIONS[lang];
  const menuItems = [
    { id: 'DASHBOARD', icon: Home, label: t.dashboard },
    { id: 'PROFILE_POPUP', icon: User, label: isLoggedIn ? t.profile_title : t.login }, 
    { id: 'SCHEMES', icon: Landmark, label: t.schemes }, 
    { id: 'CALENDAR', icon: CalendarClock, label: t.calendar }, 
    { id: 'NEWS', icon: Newspaper, label: t.news }, 
    { id: 'WEATHER', icon: CloudSun, label: t.weather },
    { id: 'DISEASE_DETECTOR', icon: ScanLine, label: t.disease_check },
    { id: 'MARKET', icon: Store, label: t.market },
    { id: 'SOIL', icon: Droplets, label: t.soil_health },
    { id: 'YIELD', icon: TrendingUp, label: t.profit },
    { id: 'VOICE_ASSISTANT', icon: Mic, label: t.voice_help },
  ];

  const handleMenuClick = (id: string) => {
    if (id === 'PROFILE_POPUP') {
      if (isLoggedIn) onProfileClick();
      else onLoginClick();
    } else {
      setView(id as ViewState);
    }
  };

  return (
    <div className="w-64 bg-white border-r border-gray-100 flex flex-col h-full hidden lg:flex">
      <div className="p-6 flex items-center gap-3 border-b border-gray-50">
        <div className="bg-green-600 p-2 rounded-xl text-white">
          <Sprout size={24} />
        </div>
        <h1 className="font-bold text-xl text-gray-800 tracking-tight">AI Krushi</h1>
      </div>
      
      <div className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleMenuClick(item.id)}
            className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-200 font-medium ${
              view === item.id 
              ? 'bg-green-50 text-green-700 shadow-sm' 
              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <item.icon size={20} />
            {item.label}
          </button>
        ))}
      </div>

      <div className="p-4 border-t border-gray-50">
        {isLoggedIn ? (
          <button className="flex items-center gap-3 text-red-500 p-3 w-full hover:bg-red-50 rounded-xl transition-colors font-medium">
            <LogOut size={20} />
            {t.logout}
          </button>
        ) : (
          <button onClick={onLoginClick} className="flex items-center gap-3 text-green-600 p-3 w-full hover:bg-green-50 rounded-xl transition-colors font-medium">
             <Lock size={20} />
             {t.login}
          </button>
        )}
      </div>
    </div>
  );
}

// 11. Footer Ads Component (Fixed)
const FooterAds = () => {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 lg:left-64 right-0 z-40 bg-white/90 backdrop-blur-lg border-t border-green-100 p-2 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] transition-transform duration-500 animate-slide-up">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 overflow-x-auto scrollbar-hide">
         
         {/* Close Button */}
         <button onClick={() => setVisible(false)} className="absolute -top-3 right-4 bg-gray-200 text-gray-600 rounded-full p-1 shadow-sm hover:bg-red-100 hover:text-red-500 z-50">
            <X size={14} />
         </button>

         <div className="flex gap-4 w-full justify-center md:justify-start min-w-max">
            {/* Google Video Ad Mock */}
            <div className="w-64 h-16 bg-black rounded-lg overflow-hidden relative group cursor-pointer flex-shrink-0 border border-gray-200">
               <video 
                 src="https://videos.pexels.com/video-files/4114539/4114539-sd_640_360_25fps.mp4" 
                 autoPlay muted loop playsInline 
                 className="w-full h-full object-cover opacity-80 group-hover:opacity-100"
               />
               <div className="absolute top-1 left-1 bg-yellow-400 text-[8px] font-bold px-1 rounded text-black">Ad</div>
               <div className="absolute bottom-1 left-2 text-white text-xs font-bold drop-shadow-md">Smart Tractors 2025</div>
               <PlayCircle className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white/80 opacity-0 group-hover:opacity-100 transition-opacity" size={24} />
            </div>

            {/* Blogging/Native Ad Mock */}
            <div className="w-72 h-16 bg-white border border-gray-200 rounded-lg p-2 flex gap-3 items-center relative shadow-sm hover:shadow-md transition-shadow cursor-pointer flex-shrink-0">
               <div className="absolute top-1 right-1 text-[8px] text-gray-400 border border-gray-200 px-1 rounded">Ads by Google</div>
               <img src="https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=100&q=80" className="w-12 h-12 rounded-md object-cover" />
               <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-800 truncate">Top 5 Fertilizers for Soybean</p>
                  <p className="text-[10px] text-gray-500 line-clamp-1">Increase your yield by 40% using these organic methods.</p>
                  <div className="flex items-center gap-1 mt-0.5">
                     <p className="text-[9px] text-green-600 font-medium">AgriBlog.com</p>
                     <ExternalLink size={8} className="text-gray-400" />
                  </div>
               </div>
            </div>
             {/* Another Text Ad (Desktop Only) */}
             <div className="hidden md:flex w-64 h-16 bg-blue-50 border border-blue-100 rounded-lg p-3 flex-col justify-center relative cursor-pointer flex-shrink-0">
               <span className="text-[10px] text-blue-800 font-bold bg-blue-100 px-1 rounded w-fit mb-1">Sponsored</span>
               <p className="text-xs font-semibold text-blue-900">Kisan Credit Card Scheme</p>
               <p className="text-[10px] text-blue-700">Apply online today!</p>
            </div>
         </div>
      </div>
    </div>
  )
}

// Reusable Glass Card Component
const GlassCard = ({ 
  title, icon: Icon, color, onClick, delay, image 
}: { 
  title: string, icon: any, color: string, onClick: () => void, delay: string, image: string 
}) => {
  return (
    <div 
      onClick={onClick}
      className={`relative h-48 rounded-3xl overflow-hidden group cursor-pointer border border-white/20 shadow-lg animate-slide-up ${delay}`}
    >
      <img src={image} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1" alt={title} />
      <div className={`absolute inset-0 bg-gradient-to-t from-${color}-900/90 to-transparent mix-blend-multiply transition-opacity duration-300 group-hover:opacity-80`}></div>
      <div className="absolute inset-0 p-6 flex flex-col justify-end">
         <div className="flex items-center justify-between">
           <div>
             <div className={`bg-white/20 backdrop-blur-md w-10 h-10 rounded-full flex items-center justify-center mb-2 border border-white/30 text-white`}>
               <Icon size={20} />
             </div>
             <h3 className="text-xl font-bold text-white tracking-wide drop-shadow-md">{title}</h3>
           </div>
           <div className="bg-white/10 p-2 rounded-full opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 border border-white/30">
              <ArrowUpRight className="text-white" size={20} />
           </div>
         </div>
      </div>
    </div>
  )
}

// Redesigned Modern Hub Component
const Hub = ({ lang, user, onNavigate, onProfileClick, isLoggedIn, onLoginClick }: { 
  lang: Language, 
  user: UserProfile, 
  onNavigate: (v: ViewState) => void, 
  onProfileClick: () => void,
  isLoggedIn: boolean,
  onLoginClick: () => void 
}) => {
  const t = TRANSLATIONS[lang];
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hours = time.getHours();
    if (hours < 12) return lang === 'mr' ? 'शुभ सकाळ' : 'Good Morning';
    if (hours < 18) return lang === 'mr' ? 'शुभ दुपार' : 'Good Afternoon';
    return lang === 'mr' ? 'शुभ संध्याकाळ' : 'Good Evening';
  };

  return (
    <div className="h-full relative bg-gray-900 text-white overflow-y-auto overflow-x-hidden pb-32">
       {/* 1. Cinematic Background Layer */}
       <div className="fixed inset-0 z-0 pointer-events-none">
          <img 
            src="https://images.unsplash.com/photo-1625246333195-09d9b630dc20?q=80&w=1920&auto=format&fit=crop" 
            className="w-full h-full object-cover opacity-60" 
            alt="Farm Landscape"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-black/20"></div>
       </div>

       {/* 2. Content Layer */}
       <div className="relative z-10 px-6 py-8 max-w-7xl mx-auto space-y-8">
          
          {/* Top Header Section */}
          <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white/5 backdrop-blur-xl p-6 rounded-[2rem] border border-white/10 shadow-2xl animate-slide-down">
             <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                   <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                   </span>
                   <span className="text-xs font-bold tracking-widest text-green-300 uppercase">Live Farm Status</span>
                   <span className="text-xs text-gray-400 border-l border-gray-600 pl-2 ml-2">{time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-2">
                   {getGreeting()}, <br/> {user.name.split(' ')[0]}
                </h1>
                
                {isLoggedIn ? (
                  <div 
                    className="flex items-center gap-3 text-sm font-medium text-gray-300 bg-white/5 w-fit px-4 py-2 rounded-full border border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
                    onClick={onProfileClick}
                  >
                     <MapPin size={16} className="text-red-400" /> 
                     {user.village} • {user.crop} Sector
                     <ChevronRight size={14} className="opacity-50"/>
                  </div>
                ) : (
                   <button 
                      onClick={onLoginClick}
                      className="mt-2 bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-full font-bold shadow-lg shadow-green-500/20 flex items-center gap-2 transition-all"
                   >
                     <User size={18} /> {t.login} / Register
                   </button>
                )}
             </div>

             <div className="flex gap-4">
                 <div 
                   onClick={() => onNavigate('WEATHER')}
                   className="cursor-pointer group bg-gradient-to-br from-blue-500/20 to-blue-900/20 p-4 rounded-3xl border border-blue-400/20 backdrop-blur-md hover:border-blue-400/50 transition-all"
                 >
                    <div className="flex items-center justify-between gap-4">
                       <div className="text-right">
                          <div className="text-4xl font-bold text-white group-hover:scale-110 transition-transform origin-right">28°</div>
                          <div className="text-xs text-blue-200">Partly Cloudy</div>
                       </div>
                       <CloudSun size={40} className="text-yellow-400" />
                    </div>
                 </div>
             </div>
          </header>

          {/* Primary Feature Grid (The Core) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             
             {/* Large Card: Disease Scanner */}
             <div 
               onClick={() => onNavigate('DISEASE_DETECTOR')}
               className="md:col-span-2 relative h-80 rounded-[2.5rem] overflow-hidden group cursor-pointer border border-white/10 shadow-2xl transition-transform hover:-translate-y-1"
             >
                <img src="https://images.unsplash.com/photo-1591060932598-a6b0c268a736?q=80&w=1200" className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt="Crop Health" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent"></div>
                
                {/* Scanner Effect */}
                <div className="absolute top-0 left-0 w-full h-1 bg-green-400/50 shadow-[0_0_20px_rgba(74,222,128,0.8)] animate-[scan_3s_ease-in-out_infinite]"></div>

                <div className="absolute bottom-0 left-0 p-8 w-full md:w-2/3">
                   <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/50 text-red-300 text-xs font-bold mb-4 backdrop-blur-md">
                      <ScanLine size={14} className="animate-pulse" /> AI DIAGNOSTICS READY
                   </div>
                   <h2 className="text-4xl font-bold text-white mb-2 leading-tight">{t.disease_check}</h2>
                   <p className="text-gray-300 text-lg line-clamp-2 opacity-80 mb-6">Instantly identify crop diseases using our advanced AI scanner. Get organic remedies in seconds.</p>
                   <button className="bg-white text-black px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-green-400 transition-colors">
                      <Camera size={20} /> Scan Now
                   </button>
                </div>
             </div>

             {/* Vertical Card: Market Pulse */}
             <div 
               onClick={() => onNavigate('MARKET')}
               className="relative h-80 rounded-[2.5rem] overflow-hidden group cursor-pointer border border-white/10 shadow-2xl bg-gray-800"
             >
                <img src="https://images.unsplash.com/photo-1488459716781-31db52582fe9?q=80&w=600" className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay transition-transform duration-1000 group-hover:scale-110" alt="Market" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/80 to-gray-900"></div>
                
                <div className="absolute inset-0 p-6 flex flex-col">
                   <div className="flex justify-between items-center mb-6">
                      <div className="bg-orange-500/20 p-3 rounded-2xl border border-orange-500/30 text-orange-400">
                         <Store size={24} />
                      </div>
                      <span className="text-xs font-bold bg-green-500/20 text-green-400 px-2 py-1 rounded">LIVE</span>
                   </div>
                   
                   <div className="mt-auto space-y-4">
                      <h3 className="text-2xl font-bold text-white">{t.market}</h3>
                      <div className="space-y-3">
                         <div className="flex justify-between items-center text-sm border-b border-white/10 pb-2">
                            <span className="text-gray-300">Soyabean</span>
                            <span className="font-mono font-bold text-green-400">▲ ₹4,800</span>
                         </div>
                         <div className="flex justify-between items-center text-sm border-b border-white/10 pb-2">
                            <span className="text-gray-300">Cotton</span>
                            <span className="font-mono font-bold text-red-400">▼ ₹7,200</span>
                         </div>
                         <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-300">Onion</span>
                            <span className="font-mono font-bold text-green-400">▲ ₹1,800</span>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          {/* Secondary Features Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <GlassCard 
                title={t.calendar} 
                icon={CalendarClock} 
                color="green" 
                delay="delay-75"
                image="https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=600"
                onClick={() => onNavigate('CALENDAR')}
             />
             <GlassCard 
                title={t.schemes} 
                icon={Landmark} 
                color="orange" 
                delay="delay-100"
                image="https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?q=80&w=600"
                onClick={() => onNavigate('SCHEMES')}
             />
             <GlassCard 
                title={t.news} 
                icon={Newspaper} 
                color="gray" 
                delay="delay-150"
                image="https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=600"
                onClick={() => onNavigate('NEWS')}
             />
             <GlassCard 
                title={t.soil_health} 
                icon={Droplets} 
                color="blue" 
                delay="delay-200"
                image="https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=600"
                onClick={() => onNavigate('SOIL')}
             />
          </div>

          {/* TV / Broadcast Widget (Redesigned Modern PiP) */}
          <div className="fixed bottom-24 left-4 md:left-auto md:right-8 z-30 w-48 md:w-64 animate-slide-up group">
             <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 bg-black cursor-pointer transform transition-all hover:scale-105 hover:shadow-green-500/20">
                <video 
                   src="https://videos.pexels.com/video-files/2884338/2884338-sd_640_360_25fps.mp4" 
                   autoPlay muted loop playsInline
                   className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                />
                <div className="absolute top-2 left-2 flex items-center gap-1 bg-red-600 px-2 py-0.5 rounded text-[8px] font-bold tracking-wider text-white shadow-sm">
                   <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div> LIVE TV
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent">
                   <p className="text-[10px] font-bold text-white leading-tight">New Tractor Subsidy Announced 2025</p>
                </div>
             </div>
          </div>

          {/* Floating Voice Button (Keep this as it is essential) */}
          <div className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-30">
            <button 
                onClick={() => onNavigate('VOICE_ASSISTANT')}
                className="relative flex items-center justify-center p-4 bg-green-600 rounded-full shadow-[0_0_30px_rgba(34,197,94,0.4)] hover:scale-110 transition-all duration-300 border-4 border-white/10 group"
             >
                <div className="absolute inset-0 bg-green-400 rounded-full opacity-0 group-hover:animate-ping"></div>
                <Mic size={28} className="text-white relative z-10" />
             </button>
          </div>

       </div>
       
       <style>{`
         @keyframes scan {
           0% { top: 0%; opacity: 0; }
           10% { opacity: 1; }
           90% { opacity: 1; }
           100% { top: 100%; opacity: 0; }
         }
       `}</style>
    </div>
  );
};

// Map Icon component helper
const MapPinIcon = ({size, className}: {size?:number, className?:string}) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);


// Main App Component
export default function App() {
  const [view, setView] = useState<ViewState>('SPLASH');
  const [lang, setLang] = useState<Language>('mr');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfile, setShowProfile] = useState(false); // For editing profile after login
  
  // Default Guest User
  const [user, setUser] = useState<UserProfile>({
    name: lang === 'mr' ? 'शेतकरी दादा' : 'Farmer Guest',
    village: 'India',
    district: '',
    landSize: '',
    crop: 'Soyabean'
  });

  // Auth/Onboarding Modal handling Login -> OTP -> Profile
  const handleAuthComplete = (newUser: UserProfile) => {
    setUser(newUser);
    setIsLoggedIn(true);
    setShowAuthModal(false);
  };

  const isAuthView = view === 'SPLASH' || view === 'LANGUAGE';

  // Router Logic
  const renderContent = () => {
    switch (view) {
      case 'SPLASH': return <SplashScreen onComplete={() => setView('LANGUAGE')} />;
      case 'LANGUAGE': return <LanguageSelection onSelect={(l) => { setLang(l); setView('DASHBOARD'); }} />;
      case 'DASHBOARD': 
        return <Hub 
          lang={lang} 
          user={user} 
          onNavigate={setView} 
          onProfileClick={() => setShowProfile(true)} 
          isLoggedIn={isLoggedIn}
          onLoginClick={() => setShowAuthModal(true)}
        />;
      case 'DISEASE_DETECTOR': return <DiseaseDetector lang={lang} onBack={() => setView('DASHBOARD')} />;
      case 'WEATHER': return <Weather lang={lang} onBack={() => setView('DASHBOARD')} />;
      case 'VOICE_ASSISTANT': return <VoiceAssistant lang={lang} user={user} onBack={() => setView('DASHBOARD')} />;
      case 'YIELD': return <YieldCalculator lang={lang} onBack={() => setView('DASHBOARD')} />;
      case 'SOIL': return <SoilIrrigation lang={lang} user={user} onBack={() => setView('DASHBOARD')} />;
      case 'MARKET': return <MarketPrices lang={lang} onBack={() => setView('DASHBOARD')} />;
      case 'SCHEMES': return <GovernmentSchemes lang={lang} onBack={() => setView('DASHBOARD')} />;
      case 'CALENDAR': return <CropCalendar lang={lang} user={user} onBack={() => setView('DASHBOARD')} />;
      case 'NEWS': return <AgriNews lang={lang} onBack={() => setView('DASHBOARD')} />;
      default: return <Hub lang={lang} user={user} onNavigate={setView} onProfileClick={() => setShowProfile(true)} isLoggedIn={isLoggedIn} onLoginClick={() => setShowAuthModal(true)} />;
    }
  };

  if (isAuthView) {
    return (
      <div className="min-h-screen bg-gray-50 font-sans">
        {renderContent()}
      </div>
    );
  }

  // Dashboard Layout (Responsive)
  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden relative">
      <Sidebar 
        view={view} 
        setView={setView} 
        lang={lang} 
        onProfileClick={() => setShowProfile(true)}
        isLoggedIn={isLoggedIn}
        onLoginClick={() => setShowAuthModal(true)}
      />
      
      <div className="flex-1 relative h-full overflow-hidden">
        {renderContent()}
        {/* Footer Ads Global */}
        <FooterAds />
      </div>
      
      {/* Login / Auth Flow Modal */}
      {showAuthModal && (
        <AuthModal 
          lang={lang} 
          onClose={() => setShowAuthModal(false)}
          onComplete={handleAuthComplete}
        />
      )}

      {/* Edit Profile Modal (Only for logged in users) */}
      {showProfile && isLoggedIn && (
        <ProfileModal 
          lang={lang} 
          user={user} 
          onSave={(u) => { setUser(u); setShowProfile(false); }} 
          onClose={() => setShowProfile(false)} 
        />
      )}
    </div>
  );
}