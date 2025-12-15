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
  Loader2
} from 'lucide-react';
import { Button } from './components/Button';
import { analyzeCropDisease, getAIFarmingAdvice, getSoilAdvice } from './services/geminiService';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';

// --- VISUAL UTILS ---
const gradients = {
  primary: "bg-gradient-to-br from-green-600 to-emerald-800",
  card: "bg-white/80 backdrop-blur-xl border border-white/40 shadow-xl shadow-green-900/5",
  glassDark: "bg-black/30 backdrop-blur-md border border-white/10",
  accent: "bg-gradient-to-r from-yellow-400 to-orange-500",
  danger: "bg-gradient-to-r from-red-500 to-pink-600"
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

      <div className="bg-white/20 p-8 rounded-full mb-8 animate-bounce backdrop-blur-sm border border-white/30">
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
          <div className="bg-green-100 p-4 rounded-full">
            <Sprout size={40} className="text-green-700" />
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-8 text-gray-800 text-center">भाषा निवडा / Select Language</h2>
        <div className="space-y-4">
          <button onClick={() => onSelect('mr')} className="w-full p-4 rounded-xl border-2 border-green-600 bg-green-50 text-green-800 font-bold text-lg hover:bg-green-600 hover:text-white transition-all">🇮🇳 मराठी</button>
          <button onClick={() => onSelect('hi')} className="w-full p-4 rounded-xl border border-gray-200 bg-white text-gray-700 font-medium text-lg hover:border-green-500 hover:text-green-600 transition-all">हिंदी</button>
          <button onClick={() => onSelect('en')} className="w-full p-4 rounded-xl border border-gray-200 bg-white text-gray-700 font-medium text-lg hover:border-green-500 hover:text-green-600 transition-all">English</button>
        </div>
      </div>
    </div>
  );
};

// 3. Login
const Login = ({ lang, onLogin }: { lang: Language, onLogin: () => void }) => {
  const t = TRANSLATIONS[lang];
  const [step, setStep] = useState(1);
  const [mobile, setMobile] = useState('');

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row">
      {/* Visual Side (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 bg-green-800 items-center justify-center p-12 relative overflow-hidden">
         <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')] bg-cover opacity-40 mix-blend-overlay"></div>
         <div className="relative z-10 text-white max-w-lg">
            <h1 className="text-6xl font-bold mb-6">{t.app_name}</h1>
            <p className="text-2xl opacity-90 leading-relaxed">AI च्या मदतीने शेती करा सोपी आणि फायदेशीर.</p>
         </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex flex-col justify-center p-8 lg:p-24 bg-gray-50">
        <div className="max-w-md mx-auto w-full">
          <div className="mb-12 text-center lg:text-left">
            <div className="inline-block p-3 bg-green-100 rounded-2xl mb-4 lg:hidden">
              <Sprout size={32} className="text-green-700" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{t.login}</h2>
            <p className="text-gray-500">{t.welcome}</p>
          </div>

          {step === 1 ? (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 ml-1">{t.enter_mobile}</label>
                <div className="flex items-center bg-white border-2 border-gray-200 rounded-2xl px-4 py-4 focus-within:border-green-500 focus-within:ring-4 focus-within:ring-green-500/10 transition-all shadow-sm">
                  <Phone size={20} className="text-gray-400 mr-3" />
                  <span className="text-gray-400 font-medium mr-2">+91</span>
                  <input 
                    type="tel" 
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full outline-none text-lg font-medium text-gray-900 placeholder-gray-300"
                    placeholder="98XXXXXXXX"
                    maxLength={10}
                  />
                </div>
              </div>
              <Button fullWidth onClick={() => setStep(2)} disabled={mobile.length < 10} size="lg">
                {t.get_otp}
              </Button>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in">
               <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 ml-1">{t.enter_otp}</label>
                <div className="flex justify-between gap-2">
                  {[1,2,3,4].map(i => (
                    <input key={i} type="number" className="w-full aspect-square bg-white border-2 border-gray-200 rounded-xl text-center text-2xl font-bold outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all" />
                  ))}
                </div>
                <p className="text-xs text-gray-500 text-center mt-4">Demo: Any code works</p>
              </div>
              <Button fullWidth onClick={onLogin} size="lg">
                {t.submit}
              </Button>
              <button onClick={() => setStep(1)} className="w-full text-center text-gray-500 text-sm font-medium hover:text-green-600">
                {t.back}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 4. Profile
const Profile = ({ lang, onSave }: { lang: Language, onSave: (p: UserProfile) => void }) => {
  const t = TRANSLATIONS[lang];
  const [profile, setProfile] = useState<UserProfile>({
    name: '', village: '', district: '', landSize: '', crop: ''
  });

  const handleChange = (f: keyof UserProfile, v: string) => setProfile(p => ({...p, [f]: v}));

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
       <div className={`${gradients.card} max-w-2xl w-full p-8 rounded-3xl`}>
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">{t.profile_title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { k: 'name', l: t.name_label, i: User },
              { k: 'village', l: t.village_label, i: MapPinIcon },
              { k: 'district', l: t.district_label, i: MapPinIcon },
              { k: 'landSize', l: t.land_label, i: MapPinIcon, type: 'number' },
            ].map((field) => (
              <div key={field.k} className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2 ml-1">{field.l}</label>
                <input 
                  type={(field as any).type || 'text'}
                  value={(profile as any)[field.k]}
                  onChange={(e) => handleChange(field.k as keyof UserProfile, e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                />
              </div>
            ))}
            <div className="col-span-1 md:col-span-2">
               <label className="block text-sm font-medium text-gray-700 mb-2 ml-1">{t.crop_label}</label>
               <select 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none"
                  value={profile.crop}
                  onChange={(e) => handleChange('crop', e.target.value)}
               >
                 <option value="">Select Crop</option>
                 <option value="Soyabean">Soyabean (सोयाबीन)</option>
                 <option value="Cotton">Cotton (कापूस)</option>
                 <option value="Onion">Onion (कांदा)</option>
                 <option value="Wheat">Wheat (गहू)</option>
               </select>
            </div>
          </div>
          <div className="mt-8">
            <Button fullWidth onClick={() => onSave(profile)} size="lg">{t.submit}</Button>
          </div>
       </div>
    </div>
  );
};

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
  ];

  return (
    <div className="h-full flex flex-col bg-gray-50">
       <div className="bg-white p-4 shadow-sm flex items-center sticky top-0 z-10 lg:hidden">
        <button onClick={onBack}><ArrowLeft className="text-gray-600 mr-4" /></button>
        <h2 className="text-xl font-bold">{t.market}</h2>
      </div>

      <div className="p-4 lg:p-8 overflow-y-auto">
        <div className="bg-gradient-to-r from-orange-400 to-red-500 rounded-3xl p-6 text-white mb-6 shadow-lg shadow-orange-200">
           <h3 className="font-bold opacity-90">{t.market_rate}</h3>
           <p className="text-sm opacity-80 mt-1">Live updates from nearby APMC Mandis</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((item) => (
            <div key={item.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-2">
                 <h4 className="text-lg font-bold text-gray-800">{item.crop}</h4>
                 <span className={`px-2 py-1 rounded-lg text-xs font-bold ${item.trend === 'up' ? 'bg-green-100 text-green-700' : item.trend === 'down' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                    {item.trend === 'up' ? '▲' : item.trend === 'down' ? '▼' : '•'} {Math.abs(item.change)}%
                 </span>
              </div>
              <p className="text-3xl font-bold text-gray-900">₹{item.price}</p>
              <p className="text-xs text-gray-500 mt-1">per Quintal</p>
            </div>
          ))}
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
    <div className="h-full bg-gray-50 flex flex-col">
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
const Weather = ({ lang, onBack }: { lang: Language, onBack: () => void }) => {
  const t = TRANSLATIONS[lang];
  // Mock data for graph
  const hourlyData = [
    { time: '6AM', temp: 22 }, { time: '9AM', temp: 25 }, { time: '12PM', temp: 29 }, 
    { time: '3PM', temp: 30 }, { time: '6PM', temp: 27 }, { time: '9PM', temp: 24 }
  ];

  return (
    <div className="h-full bg-blue-50/50 flex flex-col">
      <div className="bg-white p-4 shadow-sm flex items-center lg:hidden">
        <button onClick={onBack}><ArrowLeft className="text-gray-600 mr-4" /></button>
        <h2 className="text-xl font-bold">{t.weather}</h2>
      </div>
      <div className="p-4 lg:p-8 space-y-6 overflow-y-auto">
        {/* Main Card */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-3xl p-8 shadow-xl shadow-blue-200 relative overflow-hidden">
           <div className="absolute -top-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
           <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-blue-100 text-lg font-medium tracking-wide">{t.today}, Mumbai</p>
                <h1 className="text-7xl font-bold mt-2 tracking-tighter">28°</h1>
                <p className="mt-2 font-medium text-2xl flex items-center"><CloudSun className="mr-2" /> Cloudy</p>
              </div>
           </div>
           
           <div className="mt-8 grid grid-cols-3 gap-4 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
              <div className="text-center">
                 <p className="text-xs text-blue-100 mb-1 flex justify-center gap-1"><Droplets size={12}/> {t.humidity}</p>
                 <p className="font-bold text-lg">65%</p>
              </div>
              <div className="text-center border-l border-white/20 border-r">
                 <p className="text-xs text-blue-100 mb-1 flex justify-center gap-1"><Wind size={12}/> {t.wind}</p>
                 <p className="font-bold text-lg">12km/h</p>
              </div>
              <div className="text-center">
                 <p className="text-xs text-blue-100 mb-1 flex justify-center gap-1"><ThermometerSun size={12}/> UV</p>
                 <p className="font-bold text-lg">Mod</p>
              </div>
           </div>
        </div>

        {/* Hourly Graph */}
        <div className="bg-white rounded-3xl shadow-sm p-6 h-64">
           <h3 className="font-bold text-gray-700 mb-4">Temperature Trend</h3>
           <ResponsiveContainer width="100%" height="100%">
             <AreaChart data={hourlyData}>
               <defs>
                 <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                   <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                   <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                 </linearGradient>
               </defs>
               <Tooltip contentStyle={{borderRadius: '12px'}} />
               <Area type="monotone" dataKey="temp" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorTemp)" />
               <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
             </AreaChart>
           </ResponsiveContainer>
        </div>
        
        {/* Forecast List */}
        <div className="bg-white rounded-3xl shadow-sm p-6">
          <h3 className="font-bold mb-4 text-gray-700 text-lg">Next 5 Days</h3>
          {[1,2,3,4,5].map((i) => (
             <div key={i} className="flex justify-between items-center py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors px-2 rounded-xl">
                <span className="text-gray-600 font-bold w-16">Day {i}</span>
                <div className="flex items-center gap-4 flex-1 justify-center">
                   <CloudSun size={24} className="text-yellow-500" />
                   <span className="text-sm text-gray-400">Sunny with clouds</span>
                </div>
                <span className="font-bold text-gray-800">2{6+i}° <span className="text-gray-400 text-sm font-normal">/ 20°</span></span>
             </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 8. Voice Assistant (Enhanced)
const VoiceAssistant = ({ lang, user, onBack }: { lang: Language, user: UserProfile, onBack: () => void }) => {
  const t = TRANSLATIONS[lang];
  const [listening, setListening] = useState(false);
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

  // Mock Speech Recognition
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
       alert("Speech recognition not supported in this browser. Please type.");
       return;
    }
    setListening(true);
    setTimeout(() => {
       setListening(false);
       handleSend(lang === 'mr' ? 'आज पाणी द्यावे का?' : 'Should I irrigate today?');
    }, 2000);
  };

  const handleSend = async (text: string) => {
    if(!text.trim()) return;
    
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setProcessing(true);

    const responseText = await getAIFarmingAdvice(text, lang, user.crop);
    
    const aiMsg: ChatMessage = { id: (Date.now()+1).toString(), role: 'model', text: responseText, timestamp: new Date() };
    setMessages(prev => [...prev, aiMsg]);
    setProcessing(false);

    // Simple TTS
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(responseText);
      utterance.lang = lang === 'mr' ? 'hi-IN' : 'en-US'; 
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="h-full flex flex-col relative overflow-hidden">
       {/* Background */}
       <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=2070&auto=format&fit=crop" 
            alt="Farm Background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm"></div>
       </div>

       <div className="bg-white/80 backdrop-blur-md p-4 shadow-sm flex items-center lg:hidden relative z-10 border-b border-white/20">
         <button onClick={onBack}><ArrowLeft className="mr-4 text-gray-800" /></button>
         <h2 className="font-bold text-xl text-gray-900">{t.voice_help}</h2>
       </div>

       <div className="flex-1 overflow-y-auto p-4 space-y-6 relative z-10 scrollbar-hide">
         {messages.map(m => (
           <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
              <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm backdrop-blur-md ${
                m.role === 'user' 
                ? 'bg-green-600/90 text-white rounded-br-sm shadow-green-900/10' 
                : 'bg-white/80 text-gray-800 rounded-bl-sm border border-white/40 shadow-sm'
              }`}>
                 {m.text}
              </div>
           </div>
         ))}
         {processing && (
           <div className="flex justify-start">
             <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl rounded-bl-sm shadow-sm border border-white/40 flex gap-2 items-center">
               <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
               <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-75"></div>
               <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-150"></div>
             </div>
           </div>
         )}
         <div ref={messagesEndRef} />
       </div>

       <div className="p-4 bg-white/80 backdrop-blur-md border-t border-white/20 relative z-10">
          {listening && <div className="text-center text-red-600 font-bold animate-pulse mb-2 bg-white/50 py-1 rounded-lg backdrop-blur-sm">🎤 {t.listening}</div>}
          <div className="flex gap-2 items-center bg-white/60 p-2 rounded-full border border-white/50 shadow-inner focus-within:border-green-500 focus-within:bg-white transition-all backdrop-blur-sm">
            <button 
              onClick={startListening}
              className={`p-3 rounded-full text-white transition-all transform hover:scale-105 ${listening ? 'bg-red-500 shadow-lg shadow-red-200' : 'bg-green-600 shadow-lg shadow-green-200'}`}
            >
              <Mic size={20} />
            </button>
            <input 
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              className="flex-1 bg-transparent px-2 outline-none text-gray-800 placeholder-gray-500"
              placeholder={t.ask_question}
              onKeyDown={(e) => e.key === 'Enter' && handleSend(inputText)}
            />
            <button onClick={() => handleSend(inputText)} className="p-2 text-green-700 hover:bg-green-100 rounded-full transition-colors">
              <Send size={20} />
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
    <div className="h-full bg-gray-50 flex flex-col">
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
    <div className="h-full bg-emerald-50/50 flex flex-col">
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
                <div className="bg-blue-50 p-4 rounded-full text-blue-500">
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
            <div className="flex justify-between max-w-md mb-8 mx-auto">
               <div className="text-center relative">
                  <div className="w-20 h-20 rounded-full border-4 border-blue-500 flex items-center justify-center text-xl font-bold text-gray-700 bg-blue-50">40</div>
                  <span className="mt-2 block font-medium text-gray-500">Nitrogen</span>
               </div>
               <div className="text-center relative">
                  <div className="w-20 h-20 rounded-full border-4 border-purple-500 flex items-center justify-center text-xl font-bold text-gray-700 bg-purple-50">20</div>
                  <span className="mt-2 block font-medium text-gray-500">Phos.</span>
               </div>
               <div className="text-center relative">
                  <div className="w-20 h-20 rounded-full border-4 border-yellow-500 flex items-center justify-center text-xl font-bold text-gray-700 bg-yellow-50">30</div>
                  <span className="mt-2 block font-medium text-gray-500">Potash</span>
               </div>
            </div>
            
            {!advice ? (
               <div className="max-w-xs mx-auto">
                 <Button fullWidth onClick={getAdvice} size="lg">Get AI Recommendation</Button>
               </div>
            ) : (
               <div className="bg-yellow-50 p-6 rounded-2xl text-gray-800 border border-yellow-200">
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

// --- MAIN LAYOUT & APP ---

const Sidebar = ({ view, setView, lang }: { view: ViewState, setView: (v: ViewState) => void, lang: Language }) => {
  const t = TRANSLATIONS[lang];
  const menuItems = [
    { id: 'DASHBOARD', icon: Home, label: t.dashboard },
    { id: 'WEATHER', icon: CloudSun, label: t.weather },
    { id: 'DISEASE_DETECTOR', icon: ScanLine, label: t.disease_check },
    { id: 'MARKET', icon: Store, label: t.market },
    { id: 'SOIL', icon: Droplets, label: t.soil_health },
    { id: 'YIELD', icon: TrendingUp, label: t.profit },
    { id: 'VOICE_ASSISTANT', icon: Mic, label: t.voice_help },
  ];

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
            onClick={() => setView(item.id as ViewState)}
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
        <button className="flex items-center gap-3 text-red-500 p-3 w-full hover:bg-red-50 rounded-xl transition-colors font-medium">
          <LogOut size={20} />
          {t.logout}
        </button>
      </div>
    </div>
  );
}

// Mobile Bottom Nav if needed, or stick to Hub & Spoke.
// We will stick to Hub & Spoke for Mobile as requested in prompt, but adapt Dashboard grid.

// Main Dashboard View (Hub)
const Hub = ({ lang, user, onNavigate }: { lang: Language, user: UserProfile, onNavigate: (v: ViewState) => void }) => {
  const t = TRANSLATIONS[lang];

  const StatCard = ({ icon: Icon, title, value, sub, gradient, onClick, full = false }: any) => (
    <div 
      onClick={onClick} 
      className={`${full ? 'col-span-2 md:col-span-2' : 'col-span-1'} ${gradient} p-5 rounded-3xl shadow-lg relative overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform duration-300 text-white group`}
    >
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
        <Icon size={full ? 80 : 40} />
      </div>
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="bg-white/20 w-fit p-2 rounded-xl backdrop-blur-sm mb-3">
          <Icon size={24} />
        </div>
        <div>
          <h3 className="text-white/80 font-medium text-sm mb-1">{title}</h3>
          <p className={`${full ? 'text-3xl' : 'text-xl'} font-bold`}>{value}</p>
          {sub && <p className="text-xs text-white/70 mt-1">{sub}</p>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full bg-gray-50 overflow-y-auto">
      {/* Mobile Header */}
      <div className="lg:hidden bg-green-600 text-white p-6 rounded-b-3xl shadow-lg mb-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">नमस्कार, {user.name.split(' ')[0]}</h1>
            <p className="text-green-100 text-sm flex items-center gap-1 opacity-90"><MapPinIcon size={14}/> {user.village} • {user.crop}</p>
          </div>
          <div className="bg-white/20 p-2 rounded-full border border-white/20">
            <User size={24} />
          </div>
        </div>
        
        {/* Weather Widget Mobile */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex items-center justify-between border border-white/10">
          <div className="flex items-center gap-4">
            <CloudSun size={36} className="text-yellow-300 drop-shadow-md" />
            <div>
              <p className="text-3xl font-bold">28°C</p>
              <p className="text-xs text-green-100 opacity-90">{t.today}, Clear Sky</p>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Header Content (rendered inside layout main area) */}
      <div className="hidden lg:flex justify-between items-center p-8 pb-0">
         <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500">Welcome back, {user.name}</p>
         </div>
         <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-bold text-gray-900">28°C Cloudy</p>
              <p className="text-xs text-gray-500">{user.village}</p>
            </div>
            <div className="bg-green-100 p-2 rounded-full">
              <User size={24} className="text-green-700"/>
            </div>
         </div>
      </div>

      <div className="p-6 lg:p-8 grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {/* Market Ticker (New) */}
        <div onClick={() => onNavigate('MARKET')} className="col-span-2 lg:col-span-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between cursor-pointer hover:border-green-200 transition-colors">
           <div className="flex items-center gap-3">
             <div className="bg-orange-100 p-2 rounded-full text-orange-600"><TrendingUp size={20}/></div>
             <div>
               <h4 className="font-bold text-gray-800 text-sm">Market Update</h4>
               <p className="text-xs text-gray-500">Soybean ▲ ₹4,800 (+2.5%)</p>
             </div>
           </div>
           <ChevronRight size={20} className="text-gray-400" />
        </div>

        <StatCard 
          icon={ScanLine} 
          title={t.disease_check} 
          value="AI Check" 
          sub="Detect Diseases" 
          gradient="bg-gradient-to-br from-red-500 to-pink-600"
          onClick={() => onNavigate('DISEASE_DETECTOR')}
          full={true}
        />
        <StatCard 
          icon={CloudSun} 
          title={t.weather} 
          value="Forecast" 
          sub="Next 7 Days" 
          gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
          onClick={() => onNavigate('WEATHER')}
        />
        <StatCard 
          icon={Droplets} 
          title={t.irrigation_advice} 
          value="Water" 
          sub="Management" 
          gradient="bg-gradient-to-br from-cyan-500 to-teal-600"
          onClick={() => onNavigate('SOIL')}
        />
        <StatCard 
          icon={TrendingUp} 
          title={t.profit} 
          value="₹ 45k" 
          sub="Yield Est." 
          gradient="bg-gradient-to-br from-yellow-500 to-orange-600"
          onClick={() => onNavigate('YIELD')}
        />
         <StatCard 
          icon={Store} 
          title={t.market} 
          value="Prices" 
          sub="Live Mandi Rates" 
          gradient="bg-gradient-to-br from-emerald-500 to-green-700"
          onClick={() => onNavigate('MARKET')}
        />
      </div>

      {/* Floating Action Button Mobile */}
      <div className="lg:hidden fixed bottom-6 right-6 z-20">
        <button 
          onClick={() => onNavigate('VOICE_ASSISTANT')}
          className="bg-black text-white p-4 rounded-full shadow-2xl shadow-green-900/20 flex items-center justify-center hover:scale-105 transition-transform active:scale-95 border-4 border-white/10"
        >
          <Mic size={28} className="text-green-400" />
        </button>
      </div>
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
  const [user, setUser] = useState<UserProfile>({
    name: 'रामदास पाटील',
    village: 'वाघोली',
    district: 'पुणे',
    landSize: '3',
    crop: 'सोयाबीन'
  });

  const isAuthView = view === 'SPLASH' || view === 'LANGUAGE' || view === 'LOGIN' || view === 'PROFILE';

  // Router Logic
  const renderContent = () => {
    switch (view) {
      case 'SPLASH': return <SplashScreen onComplete={() => setView('LANGUAGE')} />;
      case 'LANGUAGE': return <LanguageSelection onSelect={(l) => { setLang(l); setView('LOGIN'); }} />;
      case 'LOGIN': return <Login lang={lang} onLogin={() => setView('PROFILE')} />;
      case 'PROFILE': return <Profile lang={lang} onSave={(u) => { setUser(u); setView('DASHBOARD'); }} />;
      case 'DASHBOARD': return <Hub lang={lang} user={user} onNavigate={setView} />;
      case 'DISEASE_DETECTOR': return <DiseaseDetector lang={lang} onBack={() => setView('DASHBOARD')} />;
      case 'WEATHER': return <Weather lang={lang} onBack={() => setView('DASHBOARD')} />;
      case 'VOICE_ASSISTANT': return <VoiceAssistant lang={lang} user={user} onBack={() => setView('DASHBOARD')} />;
      case 'YIELD': return <YieldCalculator lang={lang} onBack={() => setView('DASHBOARD')} />;
      case 'SOIL': return <SoilIrrigation lang={lang} user={user} onBack={() => setView('DASHBOARD')} />;
      case 'MARKET': return <MarketPrices lang={lang} onBack={() => setView('DASHBOARD')} />;
      default: return <Hub lang={lang} user={user} onNavigate={setView} />;
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
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      <Sidebar view={view} setView={setView} lang={lang} />
      <div className="flex-1 relative h-full overflow-hidden">
        {renderContent()}
      </div>
    </div>
  );
}