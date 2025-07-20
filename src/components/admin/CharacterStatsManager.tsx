'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Edit, Save, X } from 'lucide-react';

interface CharacterStat {
  stat: string;
  targetValue?: string;
  unit?: string;
  description?: string;
  artifactType?: 'sands' | 'goblet' | 'circlet' | 'general';
}

interface TalentPriority {
  talentName: string;
  priority: number;
  description?: string;
}

interface CharacterStatsManagerProps {
  characterId: string;
  onSave?: () => void;
}

const STAT_OPTIONS = [
  'Атака',
  'ХП',
  'Защита',
  'Шанс крита',
  'Урон крита',
  'Мастерство стихий',
  'Восстановление энергии',
  'Бонус лечения',
  'Бонус физ. урона',
  'Бонус урона стихий'
];

const TALENT_OPTIONS = [
  'Обычная атака',
  'Элементальный навык',
  'Взрыв стихий',
  'Пассивный навык 1',
  'Пассивный навык 2',
  'Пассивный навык 3',
  'Другое...'
];

const CharacterStatsManager: React.FC<CharacterStatsManagerProps> = ({ characterId, onSave }) => {
  const [mainStats, setMainStats] = useState<CharacterStat[]>([]);
  const [mainStatSands, setMainStatSands] = useState<string[]>([]);
  const [mainStatGoblet, setMainStatGoblet] = useState<string[]>([]);
  const [mainStatCirclet, setMainStatCirclet] = useState<string[]>([]);
  const [subStats, setSubStats] = useState<string[]>([]);
  const [talentPriorities, setTalentPriorities] = useState<TalentPriority[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchStats();
  }, [characterId]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/characters/${characterId}/stats`);
      if (response.ok) {
        const data = await response.json();
        setMainStats(data.mainStats || []);
        setMainStatSands(data.mainStatSands || []);
        setMainStatGoblet(data.mainStatGoblet || []);
        setMainStatCirclet(data.mainStatCirclet || []);
        setSubStats(data.subStats || []);
        setTalentPriorities(data.talentPriorities || []);
        setNotes(data.notes || '');
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveStats = async () => {
    setSaving(true);
    try {
      const statsData = {
        mainStats,
        mainStatSands,
        mainStatGoblet,
        mainStatCirclet,
        subStats,
        talentPriorities,
        notes
      };

      const response = await fetch(`/api/characters/${characterId}/stats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(statsData)
      });
      
      if (response.ok) {
        onSave?.();
      } else {
        console.error('Error saving stats');
      }
    } catch (error) {
      console.error('Error saving stats:', error);
    } finally {
      setSaving(false);
    }
  };

  // Функции для работы с основными статами
  const addMainStat = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setMainStats([...mainStats, { stat: '', targetValue: '', unit: '', description: '', artifactType: 'general' }]);
  };

  const updateMainStat = (index: number, field: keyof CharacterStat, value: any) => {
    const updated = [...mainStats];
    updated[index] = { ...updated[index], [field]: value };
    setMainStats(updated);
  };

  const removeMainStat = (index: number) => {
    setMainStats(mainStats.filter((_, i) => i !== index));
  };

  // Функции для работы с подстатами
  const addSubStat = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setSubStats([...subStats, '']);
  };

  const updateSubStat = (index: number, value: string) => {
    const updated = [...subStats];
    updated[index] = value;
    setSubStats(updated);
  };

  const removeSubStat = (index: number) => {
    setSubStats(subStats.filter((_, i) => i !== index));
  };

  // Функции для работы с приоритетами талантов
  const addTalentPriority = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    const lastPriority = talentPriorities.length > 0
      ? Math.max(...talentPriorities.map(t => t.priority || 1))
      : 0;
    setTalentPriorities([
      ...talentPriorities,
      { talentName: '', priority: lastPriority + 1, description: '' }
    ]);
  };

  const updateTalentPriority = (index: number, field: keyof TalentPriority, value: any) => {
    const updated = [...talentPriorities];
    updated[index] = { ...updated[index], [field]: value };
    setTalentPriorities(updated);
  };

  const removeTalentPriority = (index: number) => {
    setTalentPriorities(talentPriorities.filter((_, i) => i !== index));
  };

  // Функции для работы со статами артефактов
  const handleArtifactStatChange = (type: 'sands' | 'goblet' | 'circlet', index: number, value: string) => {
    let arr: string[];
    let setter: (v: string[]) => void;
    if (type === 'sands') { arr = [...mainStatSands]; setter = setMainStatSands; }
    else if (type === 'goblet') { arr = [...mainStatGoblet]; setter = setMainStatGoblet; }
    else { arr = [...mainStatCirclet]; setter = setMainStatCirclet; }
    arr[index] = value;
    // Удаляем пустые и дубли
    const filtered = arr.filter((v, i, a) => v && a.indexOf(v) === i);
    setter(filtered);
  };

  const addArtifactStat = (type: 'sands' | 'goblet' | 'circlet', e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    let arr: string[];
    let setter: (v: string[]) => void;
    if (type === 'sands') { arr = [...mainStatSands]; setter = setMainStatSands; }
    else if (type === 'goblet') { arr = [...mainStatGoblet]; setter = setMainStatGoblet; }
    else { arr = [...mainStatCirclet]; setter = setMainStatCirclet; }
    setter([...arr, '']);
  };

  const removeArtifactStat = (type: 'sands' | 'goblet' | 'circlet', index: number) => {
    let arr: string[];
    let setter: (v: string[]) => void;
    if (type === 'sands') { arr = [...mainStatSands]; setter = setMainStatSands; }
    else if (type === 'goblet') { arr = [...mainStatGoblet]; setter = setMainStatGoblet; }
    else { arr = [...mainStatCirclet]; setter = setMainStatCirclet; }
    setter(arr.filter((_, i) => i !== index));
  };

  if (loading) {
    return <div className="text-center py-4 text-gray-400">Загрузка статов...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Статы персонажа</h3>
        <Button 
          onClick={handleSaveStats} 
          disabled={saving}
          className="bg-green-600 hover:bg-green-700"
        >
          {saving ? 'Сохранение...' : 'Сохранить статы'}
        </Button>
      </div>

      {/* Основные статы */}
      <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-md font-semibold text-white">Основные статы</h4>
          <Button 
            type="button"
            onClick={addMainStat} 
            size="sm" 
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-1" />
            Добавить
          </Button>
        </div>
        
        {mainStats.length === 0 ? (
          <p className="text-gray-400 text-sm">Нет основных статов</p>
        ) : (
          <div className="space-y-3">
            {mainStats.map((stat, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-2 p-3 bg-neutral-700 rounded">
                <select
                  value={stat.stat}
                  onChange={(e) => updateMainStat(index, 'stat', e.target.value)}
                  className="px-2 py-1 bg-neutral-600 border border-neutral-500 rounded text-white text-sm"
                >
                  <option value="">Выберите стат</option>
                  {STAT_OPTIONS.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                <Input
                  value={stat.targetValue || ''}
                  onChange={(e) => updateMainStat(index, 'targetValue', e.target.value)}
                  placeholder="Целевое значение"
                  className="bg-neutral-600 border-neutral-500 text-white text-sm"
                />
                <Input
                  value={stat.unit || ''}
                  onChange={(e) => updateMainStat(index, 'unit', e.target.value)}
                  placeholder="Единица"
                  className="bg-neutral-600 border-neutral-500 text-white text-sm"
                />
                <Input
                  value={stat.description || ''}
                  onChange={(e) => updateMainStat(index, 'description', e.target.value)}
                  placeholder="Описание"
                  className="bg-neutral-600 border-neutral-500 text-white text-sm"
                />
                <Button
                  type="button"
                  onClick={() => removeMainStat(index)}
                  size="sm"
                  variant="outline"
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Статы артефактов */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(['sands', 'goblet', 'circlet'] as const).map(type => (
          <div key={type} className="bg-neutral-800 border border-neutral-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-md font-semibold text-white capitalize">
                {type === 'sands' ? 'Пески времени' : type === 'goblet' ? 'Кубок' : 'Корона'}
              </h4>
              <Button 
                type="button"
                onClick={(e) => addArtifactStat(type, e)} 
                size="sm" 
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-2">
              {(type === 'sands' ? mainStatSands : type === 'goblet' ? mainStatGoblet : mainStatCirclet).map((stat, index) => (
                <div key={index} className="flex gap-2">
                  <select
                    value={stat}
                    onChange={(e) => handleArtifactStatChange(type, index, e.target.value)}
                    className="flex-1 px-2 py-1 bg-neutral-600 border border-neutral-500 rounded text-white text-sm"
                  >
                    <option value="">Выберите стат</option>
                    {STAT_OPTIONS.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    onClick={() => removeArtifactStat(type, index)}
                    size="sm"
                    variant="outline"
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Подстаты */}
      <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-md font-semibold text-white">Подстаты</h4>
          <Button 
            type="button"
            onClick={addSubStat} 
            size="sm" 
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-1" />
            Добавить
          </Button>
        </div>
        
        {subStats.length === 0 ? (
          <p className="text-gray-400 text-sm">Нет подстатов</p>
        ) : (
          <div className="space-y-2">
            {subStats.map((stat, index) => (
              <div key={index} className="flex gap-2">
                <select
                  value={stat}
                  onChange={(e) => updateSubStat(index, e.target.value)}
                  className="flex-1 px-3 py-2 bg-neutral-600 border border-neutral-500 rounded text-white"
                >
                  <option value="">Выберите подстат</option>
                  {STAT_OPTIONS.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                <Button
                  type="button"
                  onClick={() => removeSubStat(index)}
                  size="sm"
                  variant="outline"
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Приоритеты талантов */}
      <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-md font-semibold text-white">Приоритеты прокачки талантов</h4>
          <Button 
            type="button"
            onClick={addTalentPriority} 
            size="sm" 
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-1" />
            Добавить
          </Button>
        </div>
        
        {talentPriorities.length === 0 ? (
          <p className="text-gray-400 text-sm">Нет приоритетов талантов</p>
        ) : (
          <div className="space-y-3">
            {talentPriorities
              .sort((a, b) => a.priority - b.priority)
              .map((talent, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2 p-3 bg-neutral-700 rounded">
                <Input
                  type="number"
                  value={talent.priority}
                  onChange={(e) => updateTalentPriority(index, 'priority', parseInt(e.target.value) || 1)}
                  placeholder="Приоритет"
                  className="bg-neutral-600 border-neutral-500 text-white text-sm"
                />
                <select
                  value={talent.talentName}
                  onChange={(e) => updateTalentPriority(index, 'talentName', e.target.value)}
                  className="px-2 py-1 bg-neutral-600 border border-neutral-500 rounded text-white text-sm"
                >
                  <option value="">Выберите талант</option>
                  {TALENT_OPTIONS.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                <Input
                  value={talent.description || ''}
                  onChange={(e) => updateTalentPriority(index, 'description', e.target.value)}
                  placeholder="Описание"
                  className="bg-neutral-600 border-neutral-500 text-white text-sm"
                />
                <Button
                  type="button"
                  onClick={() => removeTalentPriority(index)}
                  size="sm"
                  variant="outline"
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Заметки */}
      <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4">
        <h4 className="text-md font-semibold text-white mb-3">Дополнительные заметки</h4>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Введите дополнительные заметки по статам..."
          className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white min-h-[100px] resize-none"
        />
      </div>
    </div>
  );
};

export default CharacterStatsManager; 