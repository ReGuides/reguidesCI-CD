'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Edit, Save, X } from 'lucide-react';

interface Talent {
  _id?: string;
  name: string;
  type: string;
  description: string;
  scaling?: {
    [key: string]: {
      [level: string]: string;
    };
  };
}

interface TalentManagerProps {
  characterId: string;
  onSave?: () => void;
}

const TalentManager: React.FC<TalentManagerProps> = ({ characterId, onSave }) => {
  const [talents, setTalents] = useState<Talent[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingTalent, setEditingTalent] = useState<Talent | null>(null);
  const [newTalent, setNewTalent] = useState<Partial<Talent>>({
    name: '',
    type: 'normal',
    description: '',
    scaling: {}
  });
  const [newScalingParam, setNewScalingParam] = useState('');
  const [showScalingForm, setShowScalingForm] = useState(false);

  const talentTypes = [
    { value: 'normal', label: 'Обычная атака', icon: '⚔️' },
    { value: 'skill', label: 'Элементальный навык', icon: '🔥' },
    { value: 'burst', label: 'Взрыв стихии', icon: '💥' },
    { value: 'passive', label: 'Пассивный талант', icon: '⭐' }
  ];

  const fetchTalents = useCallback(async () => {
    setLoading(true);
    try {
      console.log('TalentManager: Fetching talents for characterId:', characterId);
      const response = await fetch(`/api/characters/${characterId}/talents`);
      console.log('TalentManager: Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('TalentManager: Received data:', data);
        // Убеждаемся, что talents - это массив
        const talentsArray = Array.isArray(data.talents) ? data.talents : [];
        console.log('TalentManager: Processed talents array:', talentsArray);
        setTalents(talentsArray);
      } else {
        console.error('TalentManager: Response not ok:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('TalentManager: Error fetching talents:', error);
    } finally {
      setLoading(false);
    }
  }, [characterId]);

  useEffect(() => {
    fetchTalents();
  }, [fetchTalents]);

  const handleSaveTalents = async () => {
    setSaving(true);
    try {
      // Подготавливаем данные для сохранения - массив талантов
      const talentsToSave = talents.map(talent => ({
        name: talent.name,
        type: talent.type,
        description: talent.description,
        scaling: talent.scaling || {}
      }));

      const response = await fetch(`/api/characters/${characterId}/talents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ talents: talentsToSave })
      });
      
      if (response.ok) {
        // Обновляем данные после сохранения
        await fetchTalents();
        onSave?.();
      } else {
        console.error('Error saving talents');
      }
    } catch (error) {
      console.error('Error saving talents:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddTalent = (e: React.FormEvent) => {
    e.preventDefault(); // Предотвращаем отправку формы
    
    if (!newTalent.name || !newTalent.type || !newTalent.description) return;
    
    const talent: Talent = {
      name: newTalent.name,
      type: newTalent.type,
      description: newTalent.description,
      scaling: newTalent.scaling || {}
    };
    
    setTalents(prev => [...prev, talent]);
    setNewTalent({ name: '', type: 'normal', description: '', scaling: {} });
  };

  const handleAddScalingParam = () => {
    if (newScalingParam.trim()) {
      setNewTalent(prev => ({
        ...prev,
        scaling: {
          ...prev.scaling,
          [newScalingParam.trim()]: {
            '1': '',
            '10': '',
            '13': ''
          }
        }
      }));
      setNewScalingParam('');
      setShowScalingForm(false);
    }
  };

  const handleRemoveScalingParam = (param: string) => {
    setNewTalent(prev => {
      const newScaling = { ...prev.scaling };
      delete newScaling[param];
      return {
        ...prev,
        scaling: newScaling
      };
    });
  };

  const handleScalingChange = (param: string, level: string, value: string) => {
    setNewTalent(prev => ({
      ...prev,
      scaling: {
        ...prev.scaling,
        [param]: {
          ...prev.scaling?.[param],
          [level]: value
        }
      }
    }));
  };

  const handleEditTalent = (talent: Talent, index: number) => {
    setEditingTalent({ ...talent, _id: index.toString() });
  };

  const handleSaveEdit = () => {
    if (!editingTalent) return;
    
    const index = parseInt(editingTalent._id || '0');
    setTalents(prev => prev.map((talent, i) => 
      i === index ? { ...editingTalent, _id: undefined } : talent
    ));
    setEditingTalent(null);
  };

  const handleEditScalingChange = (param: string, level: string, value: string) => {
    if (!editingTalent) return;
    
    setEditingTalent(prev => prev ? {
      ...prev,
      scaling: {
        ...prev.scaling,
        [param]: {
          ...prev.scaling?.[param],
          [level]: value
        }
      }
    } : null);
  };

  const handleAddEditScalingParam = () => {
    if (!editingTalent || !newScalingParam.trim()) return;
    
    setEditingTalent(prev => prev ? {
      ...prev,
      scaling: {
        ...prev.scaling,
        [newScalingParam.trim()]: {
          '1': '',
          '10': '',
          '13': ''
        }
      }
    } : null);
    setNewScalingParam('');
    setShowScalingForm(false);
  };

  const handleRemoveEditScalingParam = (param: string) => {
    if (!editingTalent) return;
    
    setEditingTalent(prev => {
      if (!prev) return null;
      const newScaling = { ...prev.scaling };
      delete newScaling[param];
      return {
        ...prev,
        scaling: newScaling
      };
    });
  };

  const handleCancelEdit = () => {
    setEditingTalent(null);
  };

  const handleDeleteTalent = (index: number) => {
    setTalents(prev => prev.filter((_, i) => i !== index));
  };

  const getTalentTypeLabel = (type: string) => {
    const talentType = talentTypes.find(t => t.value === type);
    return talentType ? talentType.label : type;
  };

  const getTalentTypeIcon = (type: string) => {
    const talentType = talentTypes.find(t => t.value === type);
    return talentType ? talentType.icon : '❓';
  };

  if (loading) {
    return <div className="text-center py-4 text-gray-400">Загрузка талантов...</div>;
  }

  console.log('TalentManager: Rendering with talents:', talents);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Таланты персонажа</h3>
        <Button 
          onClick={handleSaveTalents} 
          disabled={saving}
          className="bg-green-600 hover:bg-green-700"
        >
          {saving ? 'Сохранение...' : 'Сохранить таланты'}
        </Button>
      </div>

      {/* Форма добавления нового таланта */}
      <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4">
        <h4 className="text-md font-semibold text-white mb-3">Добавить новый талант</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <Input
            value={newTalent.name}
            onChange={(e) => setNewTalent(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Название таланта"
            className="bg-neutral-700 border-neutral-600 text-white"
          />
          <select
            value={newTalent.type}
            onChange={(e) => setNewTalent(prev => ({ ...prev, type: e.target.value }))}
            className="px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white"
          >
            {talentTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.icon} {type.label}
              </option>
            ))}
          </select>
          <Button 
            type="button" 
            onClick={handleAddTalent} 
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Добавить
          </Button>
        </div>
        <textarea
          value={newTalent.description}
          onChange={(e) => setNewTalent(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Описание таланта..."
          className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white min-h-[80px] resize-none"
        />

        {/* Масштабирование */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h5 className="text-sm font-medium text-gray-300">Масштабирование</h5>
            <Button
              type="button"
              onClick={() => setShowScalingForm(true)}
              size="sm"
              className="bg-green-600 hover:bg-green-700"
            >
              Добавить параметр
            </Button>
          </div>

          {showScalingForm && (
            <div className="p-3 bg-neutral-800 rounded-lg border border-neutral-700">
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={newScalingParam}
                  onChange={(e) => setNewScalingParam(e.target.value)}
                  placeholder="Название параметра"
                  className="bg-neutral-700 border-neutral-600 text-white"
                />
                <Button
                  type="button"
                  onClick={handleAddScalingParam}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Добавить
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setShowScalingForm(false);
                    setNewScalingParam('');
                  }}
                  size="sm"
                  variant="outline"
                >
                  Отмена
                </Button>
              </div>
            </div>
          )}

          {Object.entries(newTalent.scaling || {}).map(([param, levels]) => (
            <div key={param} className="p-3 bg-neutral-800 rounded-lg border border-neutral-700">
              <div className="flex justify-between items-center mb-2">
                <h6 className="font-medium text-white">{param}</h6>
                <Button
                  type="button"
                  onClick={() => handleRemoveScalingParam(param)}
                  size="sm"
                  variant="outline"
                  className="text-red-400 hover:text-red-300"
                >
                  Удалить
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {['1', '10', '13'].map((level) => (
                  <div key={level}>
                    <label className="block text-xs text-gray-400 mb-1">
                      Уровень {level}
                    </label>
                    <Input
                      type="text"
                      value={levels[level] || ''}
                      onChange={(e) => handleScalingChange(param, level, e.target.value)}
                      className="bg-neutral-700 border-neutral-600 text-white text-sm"
                      placeholder={`Значение для ${level}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Список талантов */}
      {talents.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <p>Таланты не найдены</p>
          <p className="text-sm">Добавьте первый талант выше</p>
        </div>
      ) : (
        <div className="space-y-3">
          {talents.map((talent, index) => (
            <div key={index} className="bg-neutral-800 border border-neutral-700 rounded-lg p-4">
              {editingTalent && editingTalent._id === index.toString() ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input
                      value={editingTalent.name}
                      onChange={(e) => setEditingTalent(prev => prev ? { ...prev, name: e.target.value } : null)}
                      className="bg-neutral-700 border-neutral-600 text-white"
                    />
                    <select
                      value={editingTalent.type}
                      onChange={(e) => setEditingTalent(prev => prev ? { ...prev, type: e.target.value } : null)}
                      className="px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white"
                    >
                      {talentTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.icon} {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <textarea
                    value={editingTalent.description}
                    onChange={(e) => setEditingTalent(prev => prev ? { ...prev, description: e.target.value } : null)}
                    className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white min-h-[80px] resize-none"
                  />
                  
                  {/* Масштабирование в редактировании */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h5 className="text-sm font-medium text-gray-300">Масштабирование</h5>
                      <Button
                        type="button"
                        onClick={() => setShowScalingForm(true)}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Добавить параметр
                      </Button>
                    </div>

                    {showScalingForm && (
                      <div className="p-3 bg-neutral-800 rounded-lg border border-neutral-700">
                        <div className="flex gap-2">
                          <Input
                            type="text"
                            value={newScalingParam}
                            onChange={(e) => setNewScalingParam(e.target.value)}
                            placeholder="Название параметра"
                            className="bg-neutral-700 border-neutral-600 text-white"
                          />
                          <Button
                            type="button"
                            onClick={handleAddEditScalingParam}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Добавить
                          </Button>
                          <Button
                            type="button"
                            onClick={() => {
                              setShowScalingForm(false);
                              setNewScalingParam('');
                            }}
                            size="sm"
                            variant="outline"
                          >
                            Отмена
                          </Button>
                        </div>
                      </div>
                    )}

                    {Object.entries(editingTalent.scaling || {}).map(([param, levels]) => (
                      <div key={param} className="p-3 bg-neutral-800 rounded-lg border border-neutral-700">
                        <div className="flex justify-between items-center mb-2">
                          <h6 className="font-medium text-white">{param}</h6>
                          <Button
                            type="button"
                            onClick={() => handleRemoveEditScalingParam(param)}
                            size="sm"
                            variant="outline"
                            className="text-red-400 hover:text-red-300"
                          >
                            Удалить
                          </Button>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {['1', '10', '13'].map((level) => (
                            <div key={level}>
                              <label className="block text-xs text-gray-400 mb-1">
                                Уровень {level}
                              </label>
                              <Input
                                type="text"
                                value={levels[level] || ''}
                                onChange={(e) => handleEditScalingChange(param, level, e.target.value)}
                                className="bg-neutral-700 border-neutral-600 text-white text-sm"
                                placeholder={`Значение для ${level}`}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  
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
                      <span className="text-lg">{getTalentTypeIcon(talent.type)}</span>
                      <h5 className="font-semibold text-white">{talent.name}</h5>
                      <Badge variant="secondary">{getTalentTypeLabel(talent.type)}</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleEditTalent(talent, index)}
                        size="sm"
                        variant="outline"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleDeleteTalent(index)}
                        size="sm"
                        variant="outline"
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm mb-2">{talent.description}</p>
                  
                  {/* Отображение масштабирования */}
                  {talent.scaling && Object.entries(talent.scaling).length > 0 && (
                    <div className="mt-3">
                      <h6 className="text-sm font-medium text-gray-300 mb-2">Масштабирование:</h6>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm rounded-lg overflow-hidden">
                          <thead>
                            <tr className="text-left border-b border-gray-700 bg-neutral-800">
                              <th className="pb-2 pr-4">Параметр</th>
                              {Object.values(talent.scaling)[0] &&
                                Object.keys(Object.values(talent.scaling)[0]).map(level => (
                                  <th key={level} className="pb-2 px-2 text-center">{level}</th>
                                ))
                              }
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(talent.scaling).map(([param, values]) => (
                              <tr key={param} className="border-b border-gray-700">
                                <td className="py-2 pr-4 text-gray-400">{param}</td>
                                {Object.entries(values).map(([level, value]) => (
                                  <td key={level} className="py-2 px-2 text-center">{value}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TalentManager; 