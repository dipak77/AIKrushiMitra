
import React, { useState, useEffect, useRef } from 'react';
import { ViewState, Language, UserProfile, ChatMessage, BlogPost, BlogSection, FAQ } from './types';
import { TRANSLATIONS } from './constants';
import { 
  Sprout, CloudSun, ScanLine, Mic, Droplets, ArrowLeft, User, Home, Store, 
  Wind, Camera, X, Send, Wheat, Sun, MapPin, Calendar, ArrowUpRight, 
  Landmark, CalendarClock, Newspaper, Radio, BookOpen, Info, Bookmark, 
  Share2, MessageSquare, TrendingUp, AlertTriangle, ChevronRight, 
  CheckCircle2, Activity, Zap, Leaf, Loader2, Gauge, Thermometer, Droplet,
  Volume2, VolumeX, UserCircle, Clock, Facebook, Twitter, MessageCircle,
  Search, Menu, MoreVertical, AudioLines, MicOff, Waves, Download, Play, Pause, Save, History, RefreshCw,
  Settings, HelpCircle, Info as InfoIcon, Timer, Sparkles, Mic2
} from 'lucide-react';
import { Button } from './components/Button';
import { getAIFarmingAdvice, analyzeCropDisease } from './services/geminiService';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';

// --- AUDIO HELPERS ---
// Implement decode method manually as raw PCM streams are not standard files.
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Implement encode method manually as raw PCM streams are not standard files.
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Custom decoding logic for raw PCM data returned by the Live API.
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

// Encodes raw Float32 microphone data into a PCM Int16 blob for the Gemini Live API.
function createPCMChunk(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

const getLangCode = (lang: Language) => {
  switch (lang) {
    case 'mr': return 'mr-IN';
    case 'hi': return 'hi-IN';
    case 'en': return 'en-US';
    default: return 'en-US';
  }
};

const speak = (text: string, lang: Language, onEnd?: () => void) => {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = getLangCode(lang);
  utterance.rate = 0.85;
  utterance.pitch = 1.0; 
  if (onEnd) utterance.onend = onEnd;
  window.speechSynthesis.speak(utterance);
};

// --- MOCK CONTENT ---
const MOCK_BLOGS: BlogPost[] = [
  {
    id: 'smart-farming-2025',
    title: 'Smart Farming Tools 2025: शेतकऱ्यांसाठी नव्या तंत्रज्ञानाचा क्रांतिकारी सुरवात',
    category: 'आधुनिक शेती तंत्रज्ञान',
    date: 'April 27, 2025',
    author: 'AI Krushi Mitra',
    image: 'https://images.unsplash.com/photo-1594398901394-4e34939a4fd0?q=80&w=1200',
    intro: 'प्रस्तावना: Smart Farming Tools 2025: भारतीय शेतीला सुधारण्याच्या आणि शेतकऱ्यांच्या जीवनात बदल घडवण्याच्या दिशेने विविध तंत्रज्ञानांचा वापर होऊ लागला आहे...',
    sections: [
      {
        heading: '1. ड्रोन तंत्रज्ञान: शेतकऱ्यांसाठी फायदेशिर उपाय',
        content: 'ड्रोन तंत्रज्ञानाचा वापर शेतीत वेगाने वाढत आहे. यामुळे फवारणी, पिकांचे निरीक्षण आणि जमिनीची पाहणी करणे सोपे झाले आहे.',
        image: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?q=80&w=1200'
      }
    ],
    conclusion: 'Smart Farming Tools शेतकऱ्यांसाठी 2025 मध्ये एक गेम चेंजर ठरणार आहेत.'
  }
];

// --- AGRI BLOG COMPONENT ---
const AgriBlog = ({ lang, onBack }: { lang: Language, onBack: () => void }) => {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  return (
    <div className="h-full bg-slate-50 overflow-y-auto pb-32">
       <header className="bg-white border-b border-gray-100 px-6 py-6 flex items-center justify-between sticky top-0 z-50">
          <button onClick={selectedPost ? () => setSelectedPost(null) : onBack} className="p-3 bg-gray-100 rounded-full"><ArrowLeft/></button>
          <span className="text-2xl font-black italic"><span className="text-[#3a7c3e]">AI Krushi</span><span className="text-[#8b4513]"> Mitra</span></span>
          <div className="w-10"></div>
       </header>
       {!selectedPost ? (
         <div className="p-8 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {MOCK_BLOGS.map(post => (
             <div key={post.id} onClick={() => setSelectedPost(post)} className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl border border-gray-100 cursor-pointer group hover:-translate-y-2 transition-all duration-300">
                <div className="h-64 overflow-hidden relative"><img src={post.image} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500" alt={post.title} /></div>
                <div className="p-8 space-y-4">
                   <h3 className="text-2xl font-black text-slate-900">{post.title}</h3>
                   <p className="text-gray-500 line-clamp-2">{post.intro}</p>
                </div>
             </div>
           ))}
         </div>
       ) : (
         <div className="max-w-4xl mx-auto bg-white min-h-screen p-12 space-y-8">
            <h1 className="text-4xl font-black">{selectedPost.title}</h1>
            <p className="text-xl leading-relaxed">{selectedPost.intro}</p>
         </div>
       )}
    </div>
  );
};

// --- PRO VOICE ASSISTANT ---
const VoiceAssistant = ({ lang, user, onBack }: { lang: Language, user: UserProfile, onBack: () => void }) => {
  const t = TRANSLATIONS[lang];
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [userTranscription, setUserTranscription] = useState('');
  const [aiTranscription, setAiTranscription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);

  const scrollRef = useRef<HTMLDivElement>(null);
  const sessionRef = useRef<any>(null);
  const shouldBeActiveRef = useRef<boolean>(false);
  const timerRef = useRef<any>(null);
  
  const audioContextInRef = useRef<AudioContext | null>(null);
  const audioContextOutRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingChunksRef = useRef<Blob[]>([]);
  const mixedStreamDestinationRef = useRef<MediaStreamAudioDestinationNode | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, userTranscription, aiTranscription]);

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => setTimer(prev => prev + 1), 1000);
    } else {
      clearInterval(timerRef.current);
      setTimer(0);
    }
    return () => clearInterval(timerRef.current);
  }, [isActive]);

  const cleanupSessionResources = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (audioContextInRef.current) {
        audioContextInRef.current.close();
        audioContextInRef.current = null;
    }
    if (audioContextOutRef.current) {
        audioContextOutRef.current.close();
        audioContextOutRef.current = null;
    }
    sourcesRef.current.forEach(s => s.stop());
    sourcesRef.current.clear();
    setIsActive(false);
    setIsSpeaking(false);
  };

  const stopSession = () => {
    shouldBeActiveRef.current = false;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    cleanupSessionResources();
  };

  const startSession = async (isRetry = false) => {
    if (!isRetry) {
        shouldBeActiveRef.current = true;
        setRecordingUrl(null);
        recordingChunksRef.current = [];
    }
    if (!shouldBeActiveRef.current) return;
    try {
      setError(null);
      setIsConnecting(true);
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      audioContextInRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioContextOutRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      mixedStreamDestinationRef.current = audioContextOutRef.current.createMediaStreamDestination();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const sourceMic = audioContextInRef.current.createMediaStreamSource(stream);
      const micForRecording = audioContextOutRef.current.createMediaStreamSource(stream);
      micForRecording.connect(mixedStreamDestinationRef.current);
      const scriptProcessor = audioContextInRef.current.createScriptProcessor(4096, 1, 1);

      const systemInstruction = lang === 'mr' 
        ? `तू 'AI कृषी मित्र' आहेस. अस्सल ग्रामीण मराठमोळी भाषा (गावठी बाणा) वापर. 
           शेतकऱ्यांशी त्यांच्या बांधावर बसून गप्पा मारतोयस असा फिल दे. 
           'राम राम पाटील!', 'काय म्हणतंय पीक?', 'आरं काळजी नको', 'लय भारी' असे अस्सल गावरान शब्द वापर. 
           शेतकरी ${user.crop} बद्दल विचारू शकतो. 
           उत्तरं खूप मोठी नसावीत, जशी आपण प्रत्यक्ष बोलतो तशी लहान आणि प्रभावी दे. 
           जर काही तांत्रिक अडचण आली, तर 'आरं पाटील, नेटवर्कची कटकट आहे, जरा दमानं घ्या' असं म्हण.`
        : `You are 'AI Krushi Mitra'. Speak like a friendly local agri-expert in a native warm tone. Be brief and highly conversational. Farmer is growing ${user.crop}.`;

      if (!isRetry) {
          mediaRecorderRef.current = new MediaRecorder(mixedStreamDestinationRef.current.stream);
          mediaRecorderRef.current.ondataavailable = (e) => {
            if (e.data.size > 0) recordingChunksRef.current.push(e.data);
          };
          mediaRecorderRef.current.onstop = () => {
            const blob = new window.Blob(recordingChunksRef.current, { type: 'audio/webm' });
            setRecordingUrl(URL.createObjectURL(blob));
          };
          mediaRecorderRef.current.start();
      }

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } },
          systemInstruction,
          outputAudioTranscription: {},
          inputAudioTranscription: {}
        },
        callbacks: {
          onopen: () => {
            setIsActive(true);
            setIsConnecting(false);
            sourceMic.connect(scriptProcessor);
            scriptProcessor.connect(audioContextInRef.current!.destination);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createPCMChunk(inputData);
              // Send audio input only after the session promise resolves to avoid race conditions.
              sessionPromise.then(session => { if (session) session.sendRealtimeInput({ media: pcmBlob }); });
            };
          },
          onmessage: async (msg: LiveServerMessage) => {
            if (msg.serverContent?.outputTranscription) setAiTranscription(prev => prev + msg.serverContent!.outputTranscription!.text);
            if (msg.serverContent?.inputTranscription) setUserTranscription(prev => prev + msg.serverContent!.inputTranscription!.text);
            if (msg.serverContent?.turnComplete) {
              setMessages(prev => [
                ...prev,
                { id: `u-${Date.now()}`, role: 'user', text: userTranscription, timestamp: new Date() },
                { id: `a-${Date.now()}`, role: 'model', text: aiTranscription, timestamp: new Date() }
              ]);
              setUserTranscription('');
              setAiTranscription('');
            }
            const audioBase64 = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioBase64 && audioContextOutRef.current) {
              setIsSpeaking(true);
              const ctx = audioContextOutRef.current;
              // Schedule playback for gapless audio using a running startTime cursor.
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const audioBuffer = await decodeAudioData(decode(audioBase64), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(ctx.destination);
              if (mixedStreamDestinationRef.current) source.connect(mixedStreamDestinationRef.current);
              source.onended = () => {
                sourcesRef.current.delete(source);
                if (sourcesRef.current.size === 0) setIsSpeaking(false);
              };
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }
            if (msg.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
              setIsSpeaking(false);
            }
          },
          onerror: (e) => {
            console.warn("Live Session Dropped:", e);
            if (shouldBeActiveRef.current) { cleanupSessionResources(); setTimeout(() => startSession(true), 1500); }
          },
          onclose: () => { if (shouldBeActiveRef.current) { cleanupSessionResources(); setTimeout(() => startSession(true), 800); } }
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (err) {
      setError("Please check microphone access.");
      setIsConnecting(false);
      setIsActive(false);
    }
  };

  // Fix: Added downloadRecording function to trigger audio download for the recorded session.
  const downloadRecording = () => {
    if (recordingUrl) {
      const link = document.createElement('a');
      link.href = recordingUrl;
      link.download = `krushi-mitra-discussion-${Date.now()}.webm`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const SUGGESTIONS = lang === 'mr' 
    ? ["आज पाऊस पडणार का?", "बाजार भाव काय आहेत?", "सोयाबीनवर फवारणी कोणती करू?", "पीएम किसानचा हप्ता कधी येईल?"]
    : ["Will it rain today?", "Check market prices", "Soybean pest control", "PM Kisan status"];

  return (
    <div className="h-full bg-[#030a03] flex flex-col relative overflow-hidden font-sans">
       {/* High-End Background Effect */}
       <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[120px] transition-all duration-1000 ${isActive ? 'scale-125 opacity-40' : 'scale-75 opacity-0'}`}></div>
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #0f0 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
       </div>

       {/* Pro Header */}
       <div className="relative z-10 p-6 flex justify-between items-center bg-black/40 backdrop-blur-2xl border-b border-white/5">
          <div className="flex items-center gap-4">
             <button onClick={onBack} className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors"><ArrowLeft size={24} className="text-white"/></button>
             <div>
                <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">AI Krushi Mitra <Sparkles size={16} className="text-emerald-400"/></h2>
                <div className="flex items-center gap-2 mt-0.5">
                   <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-red-500 animate-pulse' : 'bg-gray-600'}`}></div>
                   <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">{isActive ? 'Live Discussion' : 'Ready'}</span>
                </div>
             </div>
          </div>
          <div className="flex items-center gap-4">
             {isActive && (
               <div className="px-4 py-2 bg-white/5 rounded-2xl flex items-center gap-3 border border-white/10">
                  <Timer size={16} className="text-emerald-400" />
                  <span className="text-white font-mono font-bold tracking-tighter">{formatTime(timer)}</span>
               </div>
             )}
             <button className="p-3 bg-white/5 rounded-2xl text-white/40 hover:text-white transition-colors"><Settings size={20}/></button>
          </div>
       </div>

       {/* Chat Body */}
       <div className="relative z-10 flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
          {/* Welcome Message in Native Tone */}
          {messages.length === 0 && !userTranscription && !aiTranscription && (
            <div className="max-w-xl mx-auto text-center space-y-6 pt-20 animate-in fade-in zoom-in duration-1000">
               <div className="w-24 h-24 bg-emerald-500/20 rounded-full mx-auto flex items-center justify-center border border-emerald-500/30">
                  <Mic2 size={40} className="text-emerald-400" />
               </div>
               <h3 className="text-3xl font-black text-white tracking-tight">नमस्कार पाटील, बोला की!</h3>
               <p className="text-white/40 font-medium">तुमच्या शेतीबद्दल काहीही विचारा, आपला कृषी मित्र हजर आहे.</p>
               
               <div className="grid grid-cols-1 gap-3 pt-6">
                  {SUGGESTIONS.map((s, i) => (
                    <button key={i} onClick={() => !isActive && startSession()} className="p-4 bg-white/5 border border-white/10 rounded-2xl text-white/60 text-sm font-bold hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all text-left flex items-center justify-between group">
                       {s} <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
               </div>
            </div>
          )}

          {/* Discussion Loops */}
          {messages.map(m => (
            m.text && (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-4`}>
                 <div className={`max-w-[85%] relative group`}>
                    <div className={`p-6 rounded-[2rem] shadow-2xl ${m.role === 'user' ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-[#1a1a1a] text-white rounded-tl-none border border-white/10 shadow-emerald-500/5'}`}>
                       <p className="text-lg font-bold leading-relaxed">{m.text}</p>
                       <div className="flex items-center gap-2 mt-3 opacity-40">
                          <span className="text-[10px] font-black uppercase tracking-widest">{m.role === 'user' ? user.name : 'AI Krushi Mitra'}</span>
                          <span className="text-[10px]">•</span>
                          <span className="text-[10px] font-bold">{m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                       </div>
                    </div>
                 </div>
              </div>
            )
          ))}

          {/* Live Streaming Content */}
          {(userTranscription || aiTranscription) && (
            <div className="space-y-4">
              {userTranscription && (
                <div className="flex justify-end animate-in fade-in slide-in-from-right-4">
                   <div className="max-w-[80%] p-6 rounded-[2rem] bg-emerald-900/40 text-emerald-100 italic rounded-tr-none text-lg font-bold border-r-4 border-emerald-400">
                      {userTranscription}...
                   </div>
                </div>
              )}
              {aiTranscription && (
                <div className="flex justify-start animate-in fade-in slide-in-from-left-4">
                   <div className="max-w-[80%] p-6 rounded-[2rem] bg-white/5 text-white/60 italic rounded-tl-none border-l-4 border-emerald-500 text-lg font-bold flex items-center gap-4">
                      <Loader2 size={18} className="animate-spin text-emerald-500" />
                      {aiTranscription}...
                   </div>
                </div>
              )}
            </div>
          )}

          {/* Post-Session Management */}
          {!isActive && !isConnecting && recordingUrl && (
            <div className="animate-in slide-in-from-top-10 duration-700 bg-emerald-500/5 border border-emerald-500/10 p-10 rounded-[3.5rem] text-center space-y-8 shadow-2xl">
               <div className="w-20 h-20 bg-emerald-500/20 rounded-full mx-auto flex items-center justify-center">
                  <Save className="text-emerald-400" size={32}/>
               </div>
               <div className="space-y-2">
                  <h3 className="text-3xl font-black text-white tracking-tighter">चर्चा सुरक्षित आहे!</h3>
                  <p className="text-white/40 font-bold uppercase tracking-widest text-[10px]">Session Recording Ready</p>
               </div>
               
               <div className="bg-black/60 p-8 rounded-[2.5rem] space-y-6 border border-white/5 shadow-inner">
                  <audio controls src={recordingUrl} className="w-full h-10 filter invert grayscale opacity-80" />
                  <div className="flex flex-wrap gap-4 justify-center">
                     <button onClick={downloadRecording} className="flex-1 min-w-[160px] flex items-center justify-center gap-3 bg-emerald-500 text-black px-8 py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-emerald-500/20">
                        <Download size={18}/> Download Audio
                     </button>
                     <button onClick={() => setRecordingUrl(null)} className="flex-1 min-w-[160px] flex items-center justify-center gap-3 bg-white/5 text-white/40 px-8 py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-red-500/10 hover:text-red-400 transition-all">
                        Delete
                     </button>
                  </div>
               </div>
            </div>
          )}
          <div ref={scrollRef} />
       </div>

       {/* Control Footer */}
       <div className="relative z-10 p-10 bg-gradient-to-t from-black via-black/90 to-transparent border-t border-white/5">
          <div className="max-w-2xl mx-auto flex flex-col items-center gap-10">
             
             {/* Dynamic Waveform Visualizer */}
             {isActive && (
               <div className="flex items-center gap-1.5 h-16 w-full justify-center">
                  {[...Array(24)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`w-1 rounded-full bg-emerald-500/40 transition-all duration-300 ${isSpeaking ? 'animate-pulse bg-emerald-400' : 'animate-bounce'}`} 
                      style={{ 
                        height: isActive ? `${20 + Math.random() * 80}%` : '4px',
                        animationDelay: `${i * 0.05}s`
                      }}
                    ></div>
                  ))}
               </div>
             )}

             <div className="flex items-center gap-12">
                {/* Secondary Actions */}
                <button className="p-5 bg-white/5 rounded-full text-white/40 hover:text-white transition-all"><MessageSquare size={24}/></button>
                
                {/* Main Mic Button */}
                <button 
                  disabled={isConnecting}
                  onClick={isActive ? stopSession : () => startSession()}
                  className={`relative group transition-all transform active:scale-90 ${isActive ? 'scale-110' : ''}`}
                >
                   {isActive && (
                     <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping scale-150"></div>
                   )}
                   <div className={`w-32 h-32 rounded-full shadow-2xl flex items-center justify-center transition-all ${isActive ? 'bg-red-500' : isConnecting ? 'bg-amber-500/20' : 'bg-emerald-500 shadow-emerald-500/20 hover:scale-110'}`}>
                      {isActive ? (
                        <MicOff size={44} className="text-white"/>
                      ) : isConnecting ? (
                        <RefreshCw size={44} className="text-amber-500 animate-spin"/>
                      ) : (
                        <Mic size={44} className="text-black"/>
                      )}
                   </div>
                </button>

                <button className="p-5 bg-white/5 rounded-full text-white/40 hover:text-white transition-all"><HelpCircle size={24}/></button>
             </div>

             <div className="flex gap-4">
                <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-black tracking-widest text-white/20 uppercase flex items-center gap-2">
                   <Activity size={10} /> {isConnecting ? 'Reconnecting...' : isActive ? 'Session Live' : 'Encryption Active'}
                </span>
                <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-black tracking-widest text-white/20 uppercase flex items-center gap-2">
                   <MapPin size={10} /> {user.district}, MH
                </span>
             </div>
          </div>
       </div>
    </div>
  );
};

// --- DISEASE DETECTOR ---
const DiseaseDetector = ({ lang, onBack }: { lang: Language, onBack: () => void }) => {
  const t = TRANSLATIONS[lang];
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setImage(base64);
      setLoading(true);
      const analysis = await analyzeCropDisease(base64, lang);
      setResult(analysis);
      setLoading(false);
      speak(analysis, lang);
    };
    reader.readAsDataURL(file);
  };
  return (
    <div className="h-full bg-slate-50 overflow-y-auto pb-32">
       <header className="bg-white border-b border-gray-100 px-6 py-6 flex items-center justify-between sticky top-0 z-50">
          <button onClick={onBack} className="p-3 bg-gray-100 rounded-full"><ArrowLeft/></button>
          <span className="text-2xl font-black italic"><span className="text-[#3a7c3e]">AI Krushi</span><span className="text-[#8b4513]"> Mitra</span></span>
          <div className="w-10"></div>
       </header>
       <div className="p-8 max-w-4xl mx-auto space-y-8">
          {!image ? (
            <div onClick={() => fileInputRef.current?.click()} className="aspect-video bg-white border-4 border-dashed border-emerald-200 rounded-[3rem] flex flex-col items-center justify-center cursor-pointer hover:bg-emerald-50 group transition-all">
               <Camera size={48} className="text-emerald-600 group-hover:scale-110 transition-transform"/>
               <p className="mt-6 text-xl font-bold text-emerald-800">{t.upload_photo}</p>
               <input type="file" accept="image/*" capture="environment" className="hidden" ref={fileInputRef} onChange={handleCapture} />
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in zoom-in duration-500">
               <div className="relative rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white">
                  <img src={image} className="w-full h-auto" alt="Crop" />
                  <button onClick={() => { setImage(null); setResult(null); window.speechSynthesis.cancel(); }} className="absolute top-6 right-6 p-4 bg-black/50 text-white rounded-full backdrop-blur-md"><X/></button>
               </div>
               {loading ? (
                 <div className="bg-white p-12 rounded-[3rem] shadow-xl flex flex-col items-center gap-6 border border-emerald-100">
                    <Loader2 className="animate-spin text-emerald-600" size={64}/>
                    <p className="text-2xl font-black text-emerald-800 tracking-tighter uppercase">{t.analyzing}</p>
                 </div>
               ) : result && (
                 <div className="bg-white p-10 rounded-[3rem] shadow-xl border-l-[12px] border-emerald-500 space-y-6">
                    <h3 className="text-3xl font-black flex items-center gap-2 text-emerald-600"><CheckCircle2 size={32}/> {t.result}</h3>
                    <div className="text-gray-700 text-xl font-medium leading-relaxed whitespace-pre-wrap">{result}</div>
                 </div>
               )}
            </div>
          )}
       </div>
    </div>
  );
};

// --- HUB ---
const Hub = ({ lang, user, onNavigate }: any) => {
  const t = TRANSLATIONS[lang];
  return (
    <div className="h-full relative bg-[#030a03] text-white overflow-y-auto pb-32 scrollbar-hide">
       <div className="fixed inset-0"><img src="https://images.unsplash.com/photo-1594235048472-7c8a6797a73a?q=80&w=2000" className="w-full h-full object-cover opacity-60 mix-blend-overlay" alt="Field" /></div>
       <div className="relative z-10 px-6 py-10 max-w-7xl mx-auto space-y-12">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
             <div className="flex-1">
                <div className="px-3 py-1 bg-emerald-500 rounded-full text-[10px] font-black tracking-widest uppercase w-fit mb-4 shadow-lg shadow-emerald-500/20">Krushi Mitra Network</div>
                <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-none animate-in slide-in-from-left-10 duration-1000">नमस्कार, <br/><span className="text-emerald-400">{user.name.split(' ')[0]}!</span></h1>
             </div>
             <div onClick={() => onNavigate('WEATHER')} className="cursor-pointer bg-white/5 backdrop-blur-3xl p-6 rounded-[2.5rem] border border-white/10 flex items-center gap-6 shadow-2xl hover:scale-105 transition-transform group">
                <div className="text-right"><div className="text-5xl font-black">28°C</div><div className="text-xs font-bold text-emerald-300 uppercase tracking-widest">Sunny</div></div>
                <div className="p-4 bg-emerald-500/20 rounded-[1.5rem] border border-emerald-500/30 group-hover:bg-emerald-500/40 transition-colors"><CloudSun size={40} className="text-amber-300" /></div>
             </div>
          </header>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
             <div onClick={() => onNavigate('BLOG')} className="md:col-span-8 relative h-[450px] rounded-[3.5rem] overflow-hidden group cursor-pointer border border-white/10 shadow-2xl">
                <img src={MOCK_BLOGS[0].image} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-80" alt="Blog" />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-12 w-full md:w-3/4">
                   <h2 className="text-4xl lg:text-5xl font-black text-white mb-6 tracking-tighter leading-none">{MOCK_BLOGS[0].title}</h2>
                   <button className="bg-white text-black px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center gap-3 active:scale-95 transition-all">लेख वाचा <ArrowUpRight size={20}/></button>
                </div>
             </div>
             <div onClick={() => onNavigate('DISEASE_DETECTOR')} className="md:col-span-4 relative h-[450px] rounded-[3.5rem] overflow-hidden group cursor-pointer border border-white/10 bg-emerald-900/40 backdrop-blur-xl hover:bg-emerald-900/60 transition-all shadow-2xl">
                <div className="absolute inset-0 p-10 flex flex-col justify-end">
                   <div className="p-4 bg-emerald-500/20 rounded-3xl border border-emerald-500/30 text-emerald-400 w-fit mb-6"><ScanLine size={32} /></div>
                   <h3 className="text-4xl font-black leading-none mb-4 tracking-tighter">{t.disease_check}</h3>
                   <p className="text-white/40 font-bold mb-6 text-sm">पिकाचा फोटो काढून AI द्वारे रोगाचे निदान करा.</p>
                </div>
             </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
             <GlassCard title={t.voice_help} icon={Mic} delay="delay-75" image="https://images.unsplash.com/photo-1595152772835-219674b2a8a6?q=80&w=600" onClick={() => onNavigate('VOICE_ASSISTANT')} />
             <GlassCard title={t.market} icon={Store} delay="delay-100" image="https://images.unsplash.com/photo-1488459716781-31db52582fe9?q=80&w=600" onClick={() => onNavigate('MARKET')} />
             <GlassCard title={t.schemes} icon={Landmark} delay="delay-150" image="https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?q=80&w=600" onClick={() => onNavigate('SCHEMES')} />
             <GlassCard title={t.profit} icon={TrendingUp} delay="delay-200" image="https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=600" onClick={() => onNavigate('YIELD')} />
          </div>
       </div>
       <div className="fixed bottom-10 right-10 z-50">
          <button onClick={() => onNavigate('VOICE_ASSISTANT')} className="p-7 bg-emerald-500 rounded-full shadow-2xl border-4 border-white/20 transition-all active:scale-90 hover:scale-110 group relative">
             <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-20"></div>
             <Mic size={36} className="text-black" />
          </button>
       </div>
    </div>
  );
};

const GlassCard = ({ title, icon: Icon, onClick, delay, image }: any) => (
  <div onClick={onClick} className={`relative h-60 rounded-[3rem] overflow-hidden group cursor-pointer border border-white/10 shadow-2xl animate-in slide-in-from-bottom-5 ${delay} hover:-translate-y-2 transition-all`}>
    <img src={image} className="absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-125 opacity-40 group-hover:opacity-60" alt={title} />
    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
    <div className="absolute inset-0 p-8 flex flex-col justify-end">
       <div className="bg-white/20 backdrop-blur-xl w-14 h-14 rounded-[1.5rem] flex items-center justify-center mb-4 border border-white/30 text-white group-hover:bg-emerald-500 group-hover:text-black transition-colors"><Icon size={24} /></div>
       <h3 className="text-2xl font-black text-white tracking-tighter leading-none">{title}</h3>
    </div>
  </div>
);

const Sidebar = ({ view, setView, lang }: any) => {
  const t = TRANSLATIONS[lang];
  const items = [
    { id: 'DASHBOARD', icon: Home, label: t.dashboard },
    { id: 'BLOG', icon: Newspaper, label: t.blog },
    { id: 'DISEASE_DETECTOR', icon: ScanLine, label: t.disease_check },
    { id: 'MARKET', icon: Store, label: t.market },
    { id: 'VOICE_ASSISTANT', icon: Mic, label: t.voice_help },
    { id: 'WEATHER', icon: CloudSun, label: t.weather },
    { id: 'SCHEMES', icon: Landmark, label: t.schemes },
    { id: 'YIELD', icon: TrendingUp, label: t.profit }
  ];
  return (
    <div className="w-80 bg-black/60 backdrop-blur-3xl border-r border-white/5 flex flex-col h-full hidden lg:flex">
      <div className="p-10 flex items-center gap-4 cursor-pointer" onClick={() => setView('DASHBOARD')}>
         <div className="bg-emerald-500 p-3 rounded-2xl text-black shadow-lg shadow-emerald-500/20"><Sprout size={28} /></div>
         <h1 className="font-black text-2xl text-white tracking-tighter uppercase">Krushi Mitra</h1>
      </div>
      <div className="flex-1 p-6 space-y-2 overflow-y-auto scrollbar-hide">
        {items.map((item) => (
          <button key={item.id} onClick={() => setView(item.id)} className={`w-full flex items-center gap-5 p-4 rounded-[1.5rem] transition-all duration-300 font-bold ${view === item.id ? 'bg-emerald-500 text-black shadow-2xl translate-x-2' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>
            <item.icon size={22} /><span className="text-sm tracking-tight">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default function App() {
  const [view, setView] = useState<ViewState>('SPLASH');
  const [lang, setLang] = useState<Language>('mr');
  const [user] = useState<UserProfile>({ name: 'Sanjay Pawar', village: 'Baramati', district: 'Pune', landSize: '5', crop: 'Soyabean' });

  const renderContent = () => {
    switch (view) {
      case 'SPLASH': return <SplashScreen onComplete={() => setView('LANGUAGE')} />;
      case 'LANGUAGE': return <LanguageSelection onSelect={(l) => { setLang(l); setView('DASHBOARD'); }} />;
      case 'DASHBOARD': return <Hub lang={lang} user={user} onNavigate={setView} />;
      case 'BLOG': return <AgriBlog lang={lang} onBack={() => setView('DASHBOARD')} />;
      case 'DISEASE_DETECTOR': return <DiseaseDetector lang={lang} onBack={() => setView('DASHBOARD')} />;
      case 'VOICE_ASSISTANT': return <VoiceAssistant lang={lang} user={user} onBack={() => setView('DASHBOARD')} />;
      default: return <Hub lang={lang} user={user} onNavigate={setView} />;
    }
  };

  if (view === 'SPLASH' || view === 'LANGUAGE') return renderContent();

  return (
    <div className="flex h-screen bg-black font-sans overflow-hidden">
      <Sidebar view={view} setView={setView} lang={lang} />
      <div className="flex-1 relative h-full overflow-hidden">{renderContent()}</div>
    </div>
  );
}

const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  useEffect(() => { const t = setTimeout(onComplete, 3000); return () => clearTimeout(t); }, []);
  return (
    <div className="h-full bg-black flex flex-col items-center justify-center text-white text-center">
      <div className="p-10 bg-emerald-500 rounded-[3rem] animate-bounce shadow-2xl shadow-emerald-500/40"><Sprout size={80} /></div>
      <h1 className="text-6xl font-black mt-10 tracking-tighter">AI कृषी मित्र</h1>
      <p className="mt-4 text-emerald-500 font-bold uppercase tracking-widest text-xs">Smart Farming Ecosystem</p>
    </div>
  );
};

const LanguageSelection = ({ onSelect }: { onSelect: (l: Language) => void }) => (
  <div className="h-full bg-black flex flex-col items-center justify-center p-8 space-y-6">
    <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6"><Radio className="text-emerald-400" size={40}/></div>
    <h2 className="text-4xl font-black text-white mb-10 tracking-tight">निवडा तुमची भाषा</h2>
    {['mr', 'hi', 'en'].map(l => (
      <button key={l} onClick={() => onSelect(l as Language)} className="w-full max-w-md p-8 bg-white/5 border border-white/10 rounded-[2.5rem] text-3xl font-black text-white hover:bg-emerald-500 hover:text-black transition-all transform hover:scale-105 active:scale-95 shadow-xl">
        {l === 'mr' ? 'मराठी' : l === 'hi' ? 'हिन्दी' : 'English'}
      </button>
    ))}
  </div>
);
