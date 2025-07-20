'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Edit, Save, X } from 'lucide-react';

interface Constellation {
  level: number;
  name: string;
  description: string;
}

interface ConstellationManagerProps {
  characterId: string;
  onSave?: () => void;
}

const ConstellationManager: React.FC<ConstellationManagerProps> = ({ characterId, onSave }) => {
  const [constellations, setConstellations] = useState<Constellation[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingConstellation, setEditingConstellation] = useState<Constellation | null>(null);
  const [newConstellation, setNewConstellation] = useState<Partial<Constellation>>({
    level: 1,
    name: '',
    description: ''
  });

  useEffect(() => {
    fetchConstellations();
  }, [characterId]);

  const fetchConstellations = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/characters/${characterId}/constellations`);
      if (response.ok) {
        const data = await response.json();
        // Убеждаемся, что constellations - это массив
        const constellationsArray = Array.isArray(data.constellations) ? data.constellations : [];
        setConstellations(constellationsArray);
      }
    } catch (error) {
      console.error('Error fetching constellations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConstellations = async () => {
    setSaving(true);
    try {
      // Подготавливаем данные для сохранения - массив созвездий
      const constellationsToSave = constellations.map(constellation => ({
        level: constellation.level,
        name: constellation.name,
        description: constellation.description
      }));

      const response = await fetch(`/api/characters/${characterId}/constellations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ constellations: constellationsToSave })
      });
      
      if (response.ok) {
        // Обновляем данные после сохранения
        await fetchConstellations();
        onSave?.();
      } else {
        console.error('Error saving constellations');
      }
    } catch (error) {
      console.error('Error saving constellations:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddConstellation = (e: React.FormEvent) => {
    e.preventDefault(); // Предотвращаем отправку формы
    
    if (!newConstellation.name || !newConstellation.description || !newConstellation.level) return;
    
    const constellation: Constellation = {
      level: newConstellation.level,
      name: newConstellation.name,
      description: newConstellation.description
    };
    
    setConstellations(prev => [...prev, constellation]);
    setNewConstellation({ level: 1, name: '', description: '' });
  };

  const handleEditConstellation = (constellation: Constellation) => {
    setEditingConstellation({ ...constellation });
  };

  const handleSaveEdit = () => {
    if (!editingConstellation) return;
    
    setConstellations(prev => prev.map(constellation => 
      constellation.level === editingConstellation.level ? editingConstellation : constellation
    ));
    setEditingConstellation(null);
  };

  const handleCancelEdit = () => {
    setEditingConstellation(null);
  };

  const handleDeleteConstellation = (level: number) => {
    setConstellations(prev => prev.filter(constellation => constellation.level !== level));
  };

  const getNextLevel = () => {
    const maxLevel = Math.max(...constellations.map(c => c.level), 0);
    return maxLevel + 1;
  };

  if (loading) {
    return <div className="text-center py-4 text-gray-400">Загрузка созвездий...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Созвездия персонажа</h3>
        <Button 
          onClick={handleSaveConstellations} 
          disabled={saving}
          className="bg-green-600 hover:bg-green-700"
        >
          {saving ? 'Сохранение...' : 'Сохранить созвездия'}
        </Button>
      </div>

      {/* Форма добавления нового созвездия */}
      <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4">
        <h4 className="text-md font-semibold text-white mb-3">Добавить новое созвездие</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Уровень</label>
            <Input
              type="number"
              min="1"
              max="6"
              value={newConstellation.level}
              onChange={(e) => setNewConstellation(prev => ({ ...prev, level: parseInt(e.target.value) || 1 }))}
              className="bg-neutral-700 border-neutral-600 text-white"
            />
          </div>
          <Input
            value={newConstellation.name}
            onChange={(e) => setNewConstellation(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Название созвездия"
            className="bg-neutral-700 border-neutral-600 text-white"
          />
          <Button 
            type="button" 
            onClick={handleAddConstellation} 
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Добавить
          </Button>
          <Button 
            onClick={() => setNewConstellation(prev => ({ ...prev, level: getNextLevel() }))}
            variant="outline"
            size="sm"
          >
            Следующий уровень
          </Button>
        </div>
        <textarea
          value={newConstellation.description}
          onChange={(e) => setNewConstellation(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Описание созвездия..."
          className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white min-h-[80px] resize-none"
        />
      </div>

      {/* Список созвездий */}
      {constellations.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <p>Созвездия не найдены</p>
          <p className="text-sm">Добавьте первое созвездие выше</p>
        </div>
      ) : (
        <div className="space-y-3">
          {constellations
            .sort((a, b) => a.level - b.level)
            .map((constellation) => (
            <div key={constellation.level} className="bg-neutral-800 border border-neutral-700 rounded-lg p-4">
              {editingConstellation && editingConstellation.level === constellation.level ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm text-gray-400 mb-1 block">Уровень</label>
                      <Input
                        type="number"
                        min="1"
                        max="6"
                        value={editingConstellation.level}
                        onChange={(e) => setEditingConstellation(prev => prev ? { ...prev, level: parseInt(e.target.value) || 1 } : null)}
                        className="bg-neutral-700 border-neutral-600 text-white"
                      />
                    </div>
                    <Input
                      value={editingConstellation.name}
                      onChange={(e) => setEditingConstellation(prev => prev ? { ...prev, name: e.target.value } : null)}
                      className="bg-neutral-700 border-neutral-600 text-white"
                    />
                  </div>
                  <textarea
                    value={editingConstellation.description}
                    onChange={(e) => setEditingConstellation(prev => prev ? { ...prev, description: e.target.value } : null)}
                    className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white min-h-[80px] resize-none"
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleSaveEdit} size="sm" className="bg-green-600 hover:bg-green-700">
                      <Save className="w-4 h-4 mr-2" />
                      Сохранить
                    </Button>
                    <Button onClick={handleCancelEdit} size="sm" variant="outline">
                      <X className="w-4 h-4 mr-2" />
                      Отмена
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🌟</span>
                      <h5 className="font-semibold text-white">{constellation.name}</h5>
                      <Badge variant="secondary">Уровень {constellation.level}</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleEditConstellation(constellation)}
                        size="sm"
                        variant="outline"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleDeleteConstellation(constellation.level)}
                        size="sm"
                        variant="outline"
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm">{constellation.description}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConstellationManager; 