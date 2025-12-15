export type Language = 'mr' | 'hi' | 'en';

export type ViewState = 
  | 'SPLASH' 
  | 'LANGUAGE' 
  | 'LOGIN' 
  | 'PROFILE' 
  | 'DASHBOARD' 
  | 'DISEASE_DETECTOR' 
  | 'WEATHER' 
  | 'SOIL' 
  | 'YIELD' 
  | 'VOICE_ASSISTANT'
  | 'MARKET'
  | 'SCHEMES'
  | 'CALENDAR'
  | 'NEWS';

export interface UserProfile {
  name: string;
  village: string;
  district: string;
  landSize: string;
  crop: string;
}

export interface WeatherData {
  temp: number;
  condition: string;
  humidity: number;
  forecast: Array<{day: string, temp: number, icon: string}>;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface MarketItem {
  id: string;
  crop: string;
  price: number;
  change: number; // percentage
  trend: 'up' | 'down' | 'stable';
}