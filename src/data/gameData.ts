import type React from 'react';

export type PotatoId = 'common' | 'pink' | 'yellow' | 'sweet' | 'white' | 'blue' | 'giant' | 'copper' | 'silver' | 'gold' | 'emerald' | 'ruby' | 'diamond' | 'radioactive' | 'infinity';

export interface PotatoConfig {
  id: PotatoId;
  name: string;
  buyPrice: number;
  sellPrice: number;
  growTimeSec: number;
  color: string; 
  emoji: string;
  textureStyle: React.CSSProperties;
  tier: number;
}

export const POTATOES: Record<PotatoId, PotatoConfig> = {
  common: { id: 'common', name: 'Обычная картошка', buyPrice: 2, sellPrice: 5, growTimeSec: 3, color: '#d2b48c', emoji: '🥔', textureStyle: { filter: 'sepia(0.3) hue-rotate(-10deg) saturate(1.2)' }, tier: 1 },
  pink: { id: 'pink', name: 'Розовая картошка', buyPrice: 10, sellPrice: 25, growTimeSec: 5, color: '#ffb6c1', emoji: '🥔', textureStyle: { filter: 'sepia(0.8) hue-rotate(290deg) saturate(2) brightness(1.2)' }, tier: 2 },
  yellow: { id: 'yellow', name: 'Желтая картошка', buyPrice: 50, sellPrice: 120, growTimeSec: 10, color: '#ffd700', emoji: '🥔', textureStyle: { filter: 'sepia(1) hue-rotate(15deg) saturate(3) brightness(1.3)' }, tier: 3 },
  sweet: { id: 'sweet', name: 'Сладкая картошка (Батат)', buyPrice: 200, sellPrice: 450, growTimeSec: 15, color: '#ff8c00', emoji: '🍠', textureStyle: { filter: 'sepia(1) hue-rotate(345deg) saturate(3) brightness(0.9)', transform: 'scaleX(1.2)' }, tier: 4 },
  white: { id: 'white', name: 'Белая картошка', buyPrice: 800, sellPrice: 1800, growTimeSec: 20, color: '#ffffff', emoji: '🥔', textureStyle: { filter: 'grayscale(1) brightness(1.6)' }, tier: 5 },
  blue: { id: 'blue', name: 'Синяя картошка', buyPrice: 3000, sellPrice: 6500, growTimeSec: 30, color: '#4169e1', emoji: '🥔', textureStyle: { filter: 'sepia(1) hue-rotate(180deg) saturate(3) brightness(0.9)' }, tier: 6 },
  giant: { id: 'giant', name: 'Гигантская картошка', buyPrice: 10000, sellPrice: 22000, growTimeSec: 45, color: '#8b4513', emoji: '🥔', textureStyle: { filter: 'sepia(0.5) hue-rotate(-20deg) saturate(1.5) brightness(0.8)', transform: 'scale(1.4)' }, tier: 7 },
  copper: { id: 'copper', name: 'Медная картошка', buyPrice: 40000, sellPrice: 85000, growTimeSec: 60, color: '#b87333', emoji: '🥔', textureStyle: { filter: 'sepia(1) hue-rotate(-10deg) saturate(2) brightness(0.9) drop-shadow(0 0 15px rgba(184,115,51,0.8))' }, tier: 8 },
  silver: { id: 'silver', name: 'Серебряная картошка', buyPrice: 150000, sellPrice: 320000, growTimeSec: 90, color: '#c0c0c0', emoji: '🥔', textureStyle: { filter: 'grayscale(1) brightness(1.5) drop-shadow(0 0 20px rgba(192,192,192,0.8))' }, tier: 9 },
  gold: { id: 'gold', name: 'Золотая картошка', buyPrice: 500000, sellPrice: 1100000, growTimeSec: 120, color: '#ffd700', emoji: '🥔', textureStyle: { filter: 'sepia(1) hue-rotate(5deg) saturate(4) brightness(1.3) drop-shadow(0 0 30px rgba(255,215,0,0.9))' }, tier: 10 },
  emerald: { id: 'emerald', name: 'Изумрудная картошка', buyPrice: 2000000, sellPrice: 4500000, growTimeSec: 180, color: '#50c878', emoji: '🥔', textureStyle: { filter: 'sepia(1) hue-rotate(90deg) saturate(3) brightness(1.1) drop-shadow(0 0 25px rgba(80,200,120,0.9))' }, tier: 11 },
  ruby: { id: 'ruby', name: 'Рубиновая картошка', buyPrice: 10000000, sellPrice: 25000000, growTimeSec: 300, color: '#e0115f', emoji: '🥔', textureStyle: { filter: 'sepia(1) hue-rotate(300deg) saturate(4) brightness(1.1) drop-shadow(0 0 30px rgba(224,17,95,0.9))' }, tier: 12 },
  diamond: { id: 'diamond', name: 'Алмазная картошка', buyPrice: 50000000, sellPrice: 120000000, growTimeSec: 600, color: '#b9f2ff', emoji: '💎', textureStyle: { filter: 'grayscale(0.8) brightness(1.6) sepia(0.2) hue-rotate(160deg) saturate(2) drop-shadow(0 0 40px rgba(185,242,255,1))' }, tier: 13 },
  radioactive: { id: 'radioactive', name: 'Радиоактивная картошка', buyPrice: 250000000, sellPrice: 600000000, growTimeSec: 1800, color: '#39ff14', emoji: '☢️', textureStyle: { filter: 'sepia(1) hue-rotate(60deg) saturate(6) brightness(1.5) drop-shadow(0 0 50px rgba(57,255,20,1))' }, tier: 14 },
  infinity: { id: 'infinity', name: 'Картошка Бесконечности', buyPrice: 1000000000, sellPrice: 2500000000, growTimeSec: 3600, color: '#8a2be2', emoji: '🌌', textureStyle: { filter: 'sepia(1) hue-rotate(250deg) saturate(5) brightness(1.3) drop-shadow(0 0 60px rgba(138,43,226,1))' }, tier: 15 },
};

export type SprinklerRarity = 'common' | 'rare' | 'epic' | 'mythic' | 'legendary';

export interface SprinklerConfig {
  id: SprinklerRarity;
  name: string;
  price: number;
  coverage: number;
  color: string;
  iconColor: string;
  textureStyle: React.CSSProperties;
}

export const SPRINKLERS: Record<SprinklerRarity, SprinklerConfig> = {
  common: { id: 'common', name: 'Обычный сплинкер', price: 1000, coverage: 1, color: 'border-white/30 bg-white/5 text-white', iconColor: 'text-white', textureStyle: { filter: 'grayscale(1) brightness(1.2)' } },
  rare: { id: 'rare', name: 'Редкий сплинкер', price: 25000, coverage: 5, color: 'border-green-500/50 bg-green-500/10 text-green-400', iconColor: 'text-green-400', textureStyle: { filter: 'sepia(1) hue-rotate(90deg) saturate(3) brightness(1.1) drop-shadow(0 0 15px rgba(34,197,94,0.6))' } },
  epic: { id: 'epic', name: 'Эпический сплинкер', price: 500000, coverage: 9, color: 'border-blue-500/50 bg-blue-500/10 text-blue-400', iconColor: 'text-blue-400', textureStyle: { filter: 'sepia(1) hue-rotate(180deg) saturate(3) brightness(1.2) drop-shadow(0 0 15px rgba(59,130,246,0.6))' } },
  mythic: { id: 'mythic', name: 'Мифический сплинкер', price: 10000000, coverage: 13, color: 'border-purple-500/50 bg-purple-500/10 text-purple-400', iconColor: 'text-purple-400', textureStyle: { filter: 'sepia(1) hue-rotate(250deg) saturate(4) brightness(1.2) drop-shadow(0 0 20px rgba(168,85,247,0.7))' } },
  legendary: { id: 'legendary', name: 'Легендарный сплинкер', price: 250000000, coverage: 25, color: 'border-yellow-500/50 bg-yellow-500/10 text-yellow-400', iconColor: 'text-yellow-400', textureStyle: { filter: 'sepia(1) hue-rotate(15deg) saturate(5) brightness(1.5) drop-shadow(0 0 30px rgba(234,179,8,0.8))' } },
};
