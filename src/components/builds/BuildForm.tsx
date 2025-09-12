import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import OptimizedImage from '@/components/ui/optimized-image';
import { Artifact, ArtifactOrCombination, Weapon } from '@/types';
import { WeaponSelectModal } from './WeaponSelectModal';
import { ArtifactSelectModal } from './ArtifactSelectModal';
import TextFormattingToolbar from '@/components/admin/TextFormattingToolbar';
import SuggestionHelper from '@/components/admin/SuggestionHelper';
import ArticleEditor from '@/components/ui/article-editor';
import { getImageWithFallback } from '@/lib/utils/imageUtils';

// Константы для статов и талантов
const STAT_LABELS: Record<string, string> = {
  hp: 'HP',
  hp_percent: 'HP%',
  atk: 'Сила атаки',
  atk_percent: 'Сила атаки%',
  def: 'Защита',
  def_percent: 'Защита%',
  crit_rate: 'Шанс крит. попадания',
  crit_dmg: 'Крит. урон',
  elemental_mastery: 'Мастерство стихий',
  energy_recharge: 'Восстановление энергии',
  elemental_dmg_bonus: 'Бонус стихийного урона',
  physical_dmg_bonus: 'Бонус физ. урона',
  healing_bonus: 'Бонус лечения',
  pyro_dmg_bonus: 'Бонус Пиро урона',
  hydro_dmg_bonus: 'Бонус Гидро урона',
  electro_dmg_bonus: 'Бонус Электро урона',
  cryo_dmg_bonus: 'Бонус Крио урона',
  anemo_dmg_bonus: 'Бонус Анемо урона',
  geo_dmg_bonus: 'Бонус Гео урона',
  dendro_dmg_bonus: 'Бонус Дендро урона',
};

const TALENT_OPTIONS = [
  { value: 'normal', label: 'Обычная атака' },
  { value: 'skill', label: 'Элементальный навык' },
  { value: 'burst', label: 'Взрыв стихии' },
  { value: 'passive', label: 'Пассивный талант' },
];

interface BuildFormProps {
  initial?: {
    title?: string;
    role?: string;
    descriptionHtml?: string;
    weapons?: string[];
    artifacts?: ArtifactOrCombination[];
    mainStats?: string[];
    subStats?: string[];
    talentPriorities?: string[];
    isFeatured?: boolean;
  };
  onCancel: () => void;
  onSave: (build: {
    title: string;
    role: string;
    descriptionHtml: string;
    weapons: string[];
    artifacts: ArtifactOrCombination[];
    mainStats: string[];
    subStats: string[];
    talentPriorities: string[];
    isFeatured: boolean;
  }) => void;
  characterWeaponType?: string;
  characterId?: string;
}

export default function BuildForm({ initial, onCancel, onSave, characterWeaponType, characterId }: BuildFormProps) {
  const [title, setTitle] = useState(initial?.title || "");
  const [role, setRole] = useState(initial?.role || "");
  const [descriptionHtml, setDescriptionHtml] = useState(initial?.descriptionHtml || "");
  const [weapons, setWeapons] = useState<string[]>(initial?.weapons || []);
  const [artifacts, setArtifacts] = useState<ArtifactOrCombination[]>(initial?.artifacts || []);
  const [mainStats, setMainStats] = useState<string[]>(initial?.mainStats || []);
  const [subStats, setSubStats] = useState<string[]>(initial?.subStats || []);
  const [talentPriorities, setTalentPriorities] = useState<string[]>(initial?.talentPriorities || []);
  const [isFeatured, setIsFeatured] = useState(initial?.isFeatured || false);
  const [weaponsList, setWeaponsList] = useState<Weapon[]>([]);
  const [artifactsList, setArtifactsList] = useState<Artifact[]>([]);
  const [showWeaponModal, setShowWeaponModal] = useState(false);
  const [showArtifactModal, setShowArtifactModal] = useState(false);

  // Загружаем список оружия и артефактов
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Загружаем оружие
        const weaponsResponse = await fetch('/api/weapons');
        if (weaponsResponse.ok) {
          const weaponsData = await weaponsResponse.json();
          setWeaponsList(Array.isArray(weaponsData.data) ? weaponsData.data : weaponsData.data?.weapons || weaponsData.weapons || weaponsData || []);
        }

        // Загружаем артефакты
        const artifactsResponse = await fetch('/api/artifacts');
        if (artifactsResponse.ok) {
          const artifactsData = await artifactsResponse.json();
          setArtifactsList(Array.isArray(artifactsData.data) ? artifactsData.data : artifactsData.data?.artifacts || artifactsData.artifacts || artifactsData || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      role,
      descriptionHtml,
      weapons,
      artifacts,
      mainStats,
      subStats,
      talentPriorities,
      isFeatured,
    });
  };

  const handleWeaponSelect = (selectedWeapons: string[]) => {
    setWeapons(selectedWeapons);
  };

  const handleArtifactSelect = (selectedArtifacts: ArtifactOrCombination[]) => {
    setArtifacts(selectedArtifacts);
  };

  const handleStatToggle = (field: 'mainStats' | 'subStats', stat: string) => {
    const currentStats = field === 'mainStats' ? mainStats : subStats;
    const setter = field === 'mainStats' ? setMainStats : setSubStats;
    
    if (currentStats.includes(stat)) {
      setter(currentStats.filter(s => s !== stat));
    } else {
      setter([...currentStats, stat]);
    }
  };

  const handleTalentToggle = (talent: string) => {
    if (talentPriorities.includes(talent)) {
      setTalentPriorities(prev => prev.filter(t => t !== talent));
    } else {
      setTalentPriorities(prev => [...prev, talent]);
    }
  };

  const handleTalentMove = (index: number, direction: 1 | -1) => {
    const newPriorities = [...talentPriorities];
    const newIndex = index + direction;
    
    if (newIndex >= 0 && newIndex < newPriorities.length) {
      [newPriorities[index], newPriorities[newIndex]] = [newPriorities[newIndex], newPriorities[index]];
      setTalentPriorities(newPriorities);
    }
  };

  const handleRemoveTalent = (index: number) => {
    setTalentPriorities(prev => prev.filter((_, i) => i !== index));
  };

  const handleInsertSuggestion = (text: string) => {
    // Вставляем текст в HTML редактор
    setDescriptionHtml(prev => prev + text);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input 
          placeholder="Название билда" 
          value={title} 
          onChange={e => setTitle(e.target.value)} 
          required 
        />
        <Input 
          placeholder="Роль (например, Main DPS)" 
          value={role} 
          onChange={e => setRole(e.target.value)} 
        />
        <div>
          <label className="block text-sm font-medium mb-2 text-white">Описание билда</label>
          <ArticleEditor
            value={descriptionHtml}
            onChange={setDescriptionHtml}
            placeholder="Описание билда..."
            className="min-h-[200px]"
          />
          <TextFormattingToolbar onInsert={handleInsertSuggestion} />
          <SuggestionHelper
            onInsert={handleInsertSuggestion}
            onClose={() => {}}
            characterId={characterId}
          />
          <div className="mt-2 text-xs text-gray-400 bg-neutral-900 rounded p-2">
            <div className="font-semibold mb-1 text-gray-300">Поддерживаемая разметка:</div>
            <ul className="list-disc pl-5 space-y-1">
              <li><b>Жирный:</b> <code>**текст**</code> или <code>__текст__</code></li>
              <li><b>Цвет:</b> <code>[pyro:Пиро]</code>, <code>[hydro:Гидро]</code>, <code>[electro:Электро]</code>, <code>[cryo:Крио]</code>, <code>[anemo:Анемо]</code>, <code>[geo:Гео]</code>, <code>[dendro:Дендро]</code>, <code>[red:Красный]</code>, <code>[blue:Голубой]</code>, <code>[green:Зелёный]</code>, <code>[yellow:Жёлтый]</code>, <code>[orange:Оранжевый]</code>, <code>[purple:Фиолетовый]</code>, <code>[cyan:Голубой]</code>, <code>[pink:Розовый]</code></li>
              <li><b>Ссылка:</b> <code>[текст](https://site.ru)</code></li>
              <li><b>Модалка оружия:</b> <code>[Меч Фавония](weapon:favonius-sword)</code></li>
              <li><b>Комбинированное:</b> <code>[pyro:**Пиро ДПС**]</code></li>
            </ul>
            <div className="mt-1 text-gray-500">Для модалок доступны: <b>weapon:ID</b>, <b>artifact:ID</b>, <b>character:ID</b>, <b>talent:тип</b>, <b>constellation:уровень</b></div>
          </div>
        </div>
        
        {/* Оружие с модальным окном */}
        <div>
          <label className="block text-sm font-medium mb-2 text-white">Оружие</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {weapons.map(weaponId => {
              const weapon = weaponsList.find(w => w.id === weaponId);
              return weapon ? (
                <div key={weaponId} className="flex items-center gap-2 bg-neutral-800 border border-neutral-700 rounded px-3 py-2">
                  <OptimizedImage
                    src={getImageWithFallback(weapon.image, weapon.name, 'weapon')}
                    alt={weapon.name}
                    className="w-8 h-8 rounded"
                    type="weapon"
                  />
                  <span className="text-sm font-medium text-white">{weapon.name}</span>
                  <button
                    type="button"
                    onClick={() => setWeapons(prev => prev.filter(id => id !== weaponId))}
                    className="text-red-400 hover:text-red-300 ml-1"
                  >x</button>
                </div>
              ) : null;
            })}
          </div>
          <Button type="button" variant="outline" onClick={() => setShowWeaponModal(true)}>
            Выбрать оружие
          </Button>
        </div>

        {/* Артефакты с модальным окном */}
        <div>
          <label className="block text-sm font-medium mb-2 text-white">Артефакты</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {artifacts.map((artifact, index) => {
              if ('id' in artifact) {
                // Одиночный артефакт
                const artifactData = artifactsList.find(a => a.id === artifact.id);
                if (!artifactData) return null;
                return (
                  <div key={artifact.id} className="flex items-center gap-2 bg-neutral-800 border border-neutral-700 rounded px-3 py-2">
                    <OptimizedImage
                      src={getImageWithFallback(artifactData.image, artifactData.name, 'artifact')}
                      alt={artifactData.name}
                      className="w-8 h-8 rounded"
                      type="artifact"
                    />
                    <span className="text-sm font-medium text-white">{artifactData.name}</span>
                    <button
                      type="button"
                      onClick={() => setArtifacts(prev => prev.filter((_, i) => i !== index))}
                      className="text-red-400 hover:text-red-300 ml-1"
                    >
                      X
                    </button>
                  </div>
                );
              } else {
                // Комбинация артефактов
                return (
                  <div key={index} className="flex items-center gap-2 bg-neutral-800 border border-neutral-700 rounded px-3 py-2">
                    <span className="text-sm font-medium text-white">{artifact.description}</span>
                    <button
                      type="button"
                      onClick={() => setArtifacts(prev => prev.filter((_, i) => i !== index))}
                      className="text-red-400 hover:text-red-300 ml-1"
                    >
                      X
                    </button>
                  </div>
                );
              }
            })}
          </div>
          <Button type="button" variant="outline" onClick={() => setShowArtifactModal(true)}>
            Выбрать артефакты
          </Button>
        </div>

        {/* Основные статы */}
        <div>
          <label className="block text-sm font-medium mb-2 text-white">Основные статы</label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(STAT_LABELS).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => handleStatToggle('mainStats', key)}
                className={`px-3 py-1 rounded border transition-colors ${
                  mainStats.includes(key)
                    ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                    : 'bg-neutral-700 border-neutral-600 text-white hover:bg-neutral-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {mainStats.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {mainStats.map((stat) => (
                <div key={stat} className="flex items-center gap-1 bg-purple-600/20 border border-purple-500 rounded px-2 py-1">
                  <span className="text-sm text-purple-300">{STAT_LABELS[stat]}</span>
                  <button
                    type="button"
                    onClick={() => handleStatToggle('mainStats', stat)}
                    className="text-red-400 hover:text-red-300 text-xs"
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Субстаты */}
        <div>
          <label className="block text-sm font-medium mb-2 text-white">Субстаты</label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(STAT_LABELS).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => handleStatToggle('subStats', key)}
                className={`px-3 py-1 rounded border transition-colors ${
                  subStats.includes(key)
                    ? 'bg-green-600/20 border-green-500 text-green-300'
                    : 'bg-neutral-700 border-neutral-600 text-white hover:bg-neutral-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {subStats.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {subStats.map((stat) => (
                <div key={stat} className="flex items-center gap-1 bg-green-600/20 border border-green-500 rounded px-2 py-1">
                  <span className="text-sm text-green-300">{STAT_LABELS[stat]}</span>
                  <button
                    type="button"
                    onClick={() => handleStatToggle('subStats', stat)}
                    className="text-red-400 hover:text-red-300 text-xs"
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Приоритеты талантов */}
        <div>
          <label className="block text-sm font-medium mb-2 text-white">Приоритеты талантов</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {TALENT_OPTIONS.map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleTalentToggle(option.value)}
                className={`px-3 py-1 rounded border transition-colors ${
                  talentPriorities.includes(option.value)
                    ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                    : 'bg-neutral-700 border-neutral-600 text-white hover:bg-neutral-600'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          {talentPriorities.length > 0 && (
            <div className="mt-2 space-y-2">
              {talentPriorities.map((talent, index) => {
                const talentOption = TALENT_OPTIONS.find(opt => opt.value === talent);
                return (
                  <div key={talent} className="flex items-center gap-2 bg-blue-600/20 border border-blue-500 rounded px-3 py-2">
                    <span className="text-sm font-medium text-blue-300">{index + 1}.</span>
                    <span className="text-sm text-white flex-1">{talentOption?.label || talent}</span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => handleTalentMove(index, -1)}
                        disabled={index === 0}
                        className="text-blue-400 hover:text-blue-300 disabled:text-gray-500 disabled:cursor-not-allowed text-xs"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTalentMove(index, 1)}
                        disabled={index === talentPriorities.length - 1}
                        className="text-blue-400 hover:text-blue-300 disabled:text-gray-500 disabled:cursor-not-allowed text-xs"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveTalent(index)}
                        className="text-red-400 hover:text-red-300 text-xs"
                      >
                        X
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <label className="flex items-center gap-2">
          <input 
            type="checkbox" 
            checked={isFeatured} 
            onChange={e => setIsFeatured(e.target.checked)} 
          />
          <span className="text-white">Рекомендуемый билд</span>
        </label>
        
        <div className="flex gap-2 justify-end mt-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Отмена
          </Button>
          <Button type="submit" variant="default">
            Сохранить
          </Button>
        </div>
      </form>

      {/* Модальное окно выбора оружия */}
      <WeaponSelectModal
        isOpen={showWeaponModal}
        onClose={() => setShowWeaponModal(false)}
        onSelect={handleWeaponSelect}
        selectedWeapons={weapons}
        weapons={weaponsList}
        weaponType={characterWeaponType}
      />

      {/* Модальное окно выбора артефактов */}
      <ArtifactSelectModal
        isOpen={showArtifactModal}
        onClose={() => setShowArtifactModal(false)}
        onSelect={handleArtifactSelect}
        selectedArtifacts={artifacts}
        artifacts={artifactsList}
      />
    </>
  );
} 