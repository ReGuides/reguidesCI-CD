import { Artifact } from '@/types';
import { getImageWithFallback } from '@/lib/utils/imageUtils';
import Image from 'next/image';

interface ArtifactCardProps {
  artifact: Artifact;
  onSelect?: () => void;
  isSelected?: boolean;
}

export function ArtifactCard({ artifact, onSelect, isSelected }: ArtifactCardProps) {
  // Функция для определения цветов в зависимости от редкости
  const getRarityColors = (rarity: number) => {
    switch (rarity) {
      case 5:
        return {
          gradient: 'from-yellow-500/80 to-amber-500/80',
          text: 'text-yellow-300',
          shadow: 'drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]'
        };
      case 4:
        return {
          gradient: 'from-purple-500/80 to-pink-500/80',
          text: 'text-purple-300',
          shadow: 'drop-shadow-[0_0_8px_rgba(147,51,234,0.5)]'
        };
      case 3:
        return {
          gradient: 'from-blue-500/80 to-cyan-500/80',
          text: 'text-blue-300',
          shadow: 'drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]'
        };
      case 2:
        return {
          gradient: 'from-green-500/80 to-emerald-500/80',
          text: 'text-green-300',
          shadow: 'drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]'
        };
      default:
        return {
          gradient: 'from-gray-500/80 to-slate-500/80',
          text: 'text-gray-300',
          shadow: 'drop-shadow-[0_0_8px_rgba(107,114,128,0.5)]'
        };
    }
  };

  // Гарантируем, что rarity всегда массив с числами
  const rarityArray = Array.isArray(artifact.rarity) && artifact.rarity.length > 0
    ? artifact.rarity
    : [5];

  // Получаем цвета для минимальной редкости
  const minRarity = rarityArray.length > 0 ? Math.min(...rarityArray) : 1;
  const minColors = getRarityColors(minRarity);

  return (
    <div 
      className={`group relative bg-neutral-900 rounded p-2 w-40 hover:scale-105 transition-all duration-500 ${isSelected ? 'ring-2 ring-accent' : ''} ${onSelect ? 'cursor-pointer' : ''}`}
      onClick={onSelect}
    >
      <div className="absolute inset-0 rounded bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute inset-0 rounded border-t-2 border-purple-500/50 group-hover:border-purple-400/70 transition-colors duration-500" />
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500/0 via-purple-500/50 to-purple-500/0 group-hover:from-purple-400/0 group-hover:via-purple-400/70 group-hover:to-purple-400/0 transition-all duration-500" />
      <div className="relative">
        <div className="relative">
          <Image 
            src={getImageWithFallback(artifact.image, artifact.name, 'artifact')}
            alt={artifact.name} 
            width={160}
            height={128}
            className="w-full h-32 object-contain mb-1.5 filter drop-shadow-[0_0_8px_rgba(147,51,234,0.3)] group-hover:drop-shadow-[0_0_15px_rgba(147,51,234,0.5)] transition-all duration-500"
            onError={(e) => {
              console.error('Image load error:', artifact.image);
              e.currentTarget.src = '/images/artifacts/default.png';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute bottom-2 right-2">
            <div className={`px-2 py-1 rounded bg-gradient-to-r ${minColors.gradient} ${minColors.shadow}`}>
              <div className="flex gap-1">
                {rarityArray.length > 0 ? rarityArray.map((rarity, i) => {
                  const colors = getRarityColors(rarity);
                  return (
                    <span key={i} className={`${colors.text} font-bold text-base`}>
                      {rarity}★
                    </span>
                  );
                }) : (
                  <span className={`${minColors.text} font-bold text-base`}>
                    1★
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="font-semibold text-white text-base mb-1 drop-shadow-[0_0_8px_rgba(147,51,234,0.3)] group-hover:drop-shadow-[0_0_12px_rgba(147,51,234,0.5)] transition-all duration-500">
          {artifact.name}
        </div>
      </div>
    </div>
  );
} 