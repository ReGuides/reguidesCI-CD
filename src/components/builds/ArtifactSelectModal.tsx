import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import OptimizedImage from '@/components/ui/optimized-image';
import { Artifact, ArtifactOrCombination } from '@/types';
import { getSafeImageUrl } from '@/lib/utils/imageUtils';

interface ArtifactSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (selected: ArtifactOrCombination[]) => void;
  selectedArtifacts: ArtifactOrCombination[];
  artifacts: Artifact[];
}

interface TwoStatCombination {
  artifact: Artifact;
  stat: string;
}

export const ArtifactSelectModal: React.FC<ArtifactSelectModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  selectedArtifacts,
  artifacts,
}) => {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<ArtifactOrCombination[]>(selectedArtifacts);
  const [mode, setMode] = useState<'single' | 'combination'>('single');
  const [combinationType, setCombinationType] = useState<'2+2' | '2+stat' | 'stat+stat'>('2+2');
  
  // Отдельные состояния для каждого типа комбинации
  const [twoTwoCombinations, setTwoTwoCombinations] = useState<{set1: Artifact, set2: Artifact}[]>([]); // для 2+2
  const [twoStatCombinations, setTwoStatCombinations] = useState<TwoStatCombination[]>([]); // для 2+стат
  const [stat1, setStat1] = useState('');
  const [stat2, setStat2] = useState('');

  useEffect(() => {
    setSelected(selectedArtifacts);
  }, [selectedArtifacts, isOpen]);

  const filteredArtifacts = artifacts.filter(artifact =>
    artifact.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSingleSelect = (artifact: Artifact) => {
    const existingIndex = selected.findIndex(item => 
      'id' in item && item.id === artifact.id
    );
    
    if (existingIndex !== -1) {
      setSelected(prev => prev.filter((_, index) => index !== existingIndex));
    } else {
      setSelected(prev => [...prev, artifact]);
    }
  };

  const handleAddTwoTwoCombination = () => {
    setTwoTwoCombinations(prev => [...prev, { set1: artifacts[0], set2: artifacts[0] }]);
  };

  const handleRemoveTwoTwoCombination = (index: number) => {
    setTwoTwoCombinations(prev => prev.filter((_, i) => i !== index));
  };

  const handleTwoTwoSet1Change = (index: number, artifact: Artifact) => {
    setTwoTwoCombinations(prev => 
      prev.map((combo, i) => i === index ? { ...combo, set1: artifact } : combo)
    );
  };

  const handleTwoTwoSet2Change = (index: number, artifact: Artifact) => {
    setTwoTwoCombinations(prev => 
      prev.map((combo, i) => i === index ? { ...combo, set2: artifact } : combo)
    );
  };

  const handleAddTwoStatCombination = () => {
    setTwoStatCombinations(prev => [...prev, { artifact: artifacts[0], stat: '' }]);
  };

  const handleRemoveTwoStatCombination = (index: number) => {
    setTwoStatCombinations(prev => prev.filter((_, i) => i !== index));
  };

  const handleTwoStatArtifactChange = (index: number, artifact: Artifact) => {
    setTwoStatCombinations(prev => 
      prev.map((combo, i) => i === index ? { ...combo, artifact } : combo)
    );
  };

  const handleTwoStatStatChange = (index: number, stat: string) => {
    setTwoStatCombinations(prev => 
      prev.map((combo, i) => i === index ? { ...combo, stat } : combo)
    );
  };

  const handleApply = () => {
    const result: ArtifactOrCombination[] = [];

    if (mode === 'single') {
      // В режиме одиночных артефактов используем selected
      result.push(...selected);
    } else if (mode === 'combination') {
      // В режиме комбинаций добавляем только новые комбинации
      if (combinationType === '2+2') {
        // 2+2 комбинации
        twoTwoCombinations.forEach(combo => {
          if (combo.set1 && combo.set2) {
            result.push({
              setType: 'combination',
              sets: [combo.set1, combo.set2],
              description: `2+2: ${combo.set1.name} + ${combo.set2.name}`
            } as ArtifactOrCombination);
          }
        });
      } else if (combinationType === '2+stat') {
        // 2+стат комбинации
        twoStatCombinations.forEach(combo => {
          if (combo.artifact && combo.stat.trim()) {
            result.push({
              setType: 'combination',
              sets: [combo.artifact],
              statField: combo.stat.trim(),
              description: `2 ${combo.artifact.name} + ${combo.stat.trim()}`
            } as ArtifactOrCombination);
          }
        });
      } else if (combinationType === 'stat+stat' && stat1.trim() && stat2.trim()) {
        // стат+стат комбинация
        result.push({
          setType: 'combination',
          type: 'stat+stat',
          statFields: [stat1.trim(), stat2.trim()],
          description: `Стат+Стат: ${stat1.trim()} + ${stat2.trim()}`
        } as ArtifactOrCombination);
      }
    }

    onSelect(result);
    onClose();
  };

  const handleReset = () => {
    setSelected([]);
    setTwoTwoCombinations([]);
    setTwoStatCombinations([]);
    setStat1('');
    setStat2('');
  };

  const getArtifactImage = (artifact: Artifact) => getSafeImageUrl(artifact.image, artifact.name, 'artifact');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-neutral-900 rounded-xl p-6 w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Выбрать артефакты</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        {/* Режимы выбора */}
        <div className="flex gap-2 mb-4">
          <Button 
            type="button" 
            variant={mode === 'single' ? 'default' : 'outline'}
            onClick={() => setMode('single')}
          >
            Одиночные сеты
          </Button>
          <Button 
            type="button" 
            variant={mode === 'combination' ? 'default' : 'outline'}
            onClick={() => setMode('combination')}
          >
            Комбинации
          </Button>
        </div>

        {/* Типы комбинаций */}
        {mode === 'combination' && (
          <div className="flex gap-2 mb-4">
            <Button 
              type="button" 
              variant={combinationType === '2+2' ? 'default' : 'outline'}
              onClick={() => setCombinationType('2+2')}
            >
              2+2
            </Button>
            <Button 
              type="button" 
              variant={combinationType === '2+stat' ? 'default' : 'outline'}
              onClick={() => setCombinationType('2+stat')}
            >
              2+Стат
            </Button>
            <Button 
              type="button" 
              variant={combinationType === 'stat+stat' ? 'default' : 'outline'}
              onClick={() => setCombinationType('stat+stat')}
            >
              Стат+Стат
            </Button>
          </div>
        )}

        {/* Поиск */}
        <div className="mb-4">
          <Input
            placeholder="Поиск артефактов..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-neutral-800 border-neutral-700 text-white"
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          {mode === 'single' ? (
            // Одиночные сеты
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {filteredArtifacts.map(artifact => {
                const isSelected = selected.some(item => 
                  'id' in item && item.id === artifact.id
                );
                return (
                  <button
                    key={artifact.id}
                    type="button"
                    onClick={() => handleSingleSelect(artifact)}
                    className={`relative flex flex-col items-center p-3 rounded-lg border transition-all ${
                      isSelected
                        ? 'border-purple-500 bg-purple-500/20'
                        : 'border-neutral-700 hover:border-neutral-600'
                    }`}
                  >
                    <OptimizedImage
                      src={getArtifactImage(artifact)}
                      alt={artifact.name}
                      className="w-12 h-12 rounded mb-2"
                      type="artifact"
                      fallbackSrc="/images/artifacts/default.png"
                    />
                    <span className="text-sm text-center font-medium text-white">
                      {artifact.name}
                    </span>
                    {isSelected && (
                      <span className="absolute top-2 left-2 bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold border-2 border-white shadow">
                        {selected.findIndex(item => 'id' in item && item.id === artifact.id) + 1}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            // Комбинации
            <div className="space-y-4">
              {combinationType === '2+2' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Создайте комбинации 2+2</h3>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleAddTwoTwoCombination}
                      className="text-purple-400 hover:text-purple-300"
                    >
                      + Добавить комбинацию
                    </Button>
                  </div>
                  
                  {twoTwoCombinations.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      Нажмите &quot;Добавить комбинацию&quot; чтобы создать первую комбинацию 2+2
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {twoTwoCombinations.map((combo, index) => (
                        <div key={index} className="bg-neutral-800 border border-purple-600 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-md font-semibold text-purple-300">Комбинация {index + 1}</h4>
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleRemoveTwoTwoCombination(index)}
                              className="text-red-400 hover:text-red-300"
                            >
                              Удалить
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Выбор первого артефакта */}
                            <div>
                              <label className="block text-sm font-medium text-white mb-2">Первый артефакт</label>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                                {filteredArtifacts.map(artifact => {
                                  const isSelected = combo.set1.id === artifact.id;
                                  return (
                                    <button
                                      key={artifact.id}
                                      type="button"
                                      onClick={() => handleTwoTwoSet1Change(index, artifact)}
                                      className={`relative flex flex-col items-center p-2 rounded border transition-all ${
                                        isSelected
                                          ? 'border-purple-500 bg-purple-500/20'
                                          : 'border-neutral-700 hover:border-neutral-600'
                                      }`}
                                    >
                                      <OptimizedImage
                                        src={getArtifactImage(artifact)}
                                        alt={artifact.name}
                                        className="w-8 h-8 rounded mb-1"
                                        type="artifact"
                                        fallbackSrc="/images/artifacts/default.png"
                                      />
                                      <span className="text-xs text-center font-medium text-white truncate w-full">{artifact.name}</span>
                                      {isSelected && (
                                        <span className="absolute top-1 left-1 bg-purple-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold border border-white shadow">
                                          ✓
                                        </span>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                            
                            {/* Выбор второго артефакта */}
                            <div>
                              <label className="block text-sm font-medium text-white mb-2">Второй артефакт</label>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                                {filteredArtifacts.map(artifact => {
                                  const isSelected = combo.set2.id === artifact.id;
                                  return (
                                    <button
                                      key={artifact.id}
                                      type="button"
                                      onClick={() => handleTwoTwoSet2Change(index, artifact)}
                                      className={`relative flex flex-col items-center p-2 rounded border transition-all ${
                                        isSelected
                                          ? 'border-purple-500 bg-purple-500/20'
                                          : 'border-neutral-700 hover:border-neutral-600'
                                      }`}
                                    >
                                      <OptimizedImage
                                        src={getArtifactImage(artifact)}
                                        alt={artifact.name}
                                        className="w-8 h-8 rounded mb-1"
                                        type="artifact"
                                        fallbackSrc="/images/artifacts/default.png"
                                      />
                                      <span className="text-xs text-center font-medium text-white truncate w-full">{artifact.name}</span>
                                      {isSelected && (
                                        <span className="absolute top-1 left-1 bg-purple-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold border border-white shadow">
                                          ✓
                                        </span>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                          
                          {/* Предварительный просмотр комбинации */}
                          {combo.set1 && combo.set2 && (
                            <div className="mt-3 p-2 bg-purple-600/20 border border-purple-500 rounded">
                              <span className="text-sm text-purple-300">
                                2+2: {combo.set1.name} + {combo.set2.name}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {combinationType === '2+stat' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Создайте комбинации 2+стат</h3>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleAddTwoStatCombination}
                      className="text-green-400 hover:text-green-300"
                    >
                      + Добавить комбинацию
                    </Button>
                  </div>
                  
                  {twoStatCombinations.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      Нажмите &quot;Добавить комбинацию&quot; чтобы создать первую комбинацию 2+стат
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {twoStatCombinations.map((combo, index) => (
                        <div key={index} className="bg-neutral-800 border border-green-600 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-md font-semibold text-green-300">Комбинация {index + 1}</h4>
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleRemoveTwoStatCombination(index)}
                              className="text-red-400 hover:text-red-300"
                            >
                              Удалить
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Выбор артефакта */}
                            <div>
                              <label className="block text-sm font-medium text-white mb-2">Выберите артефакт</label>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                                {filteredArtifacts.map(artifact => {
                                  const isSelected = combo.artifact.id === artifact.id;
                                  return (
                                    <button
                                      key={artifact.id}
                                      type="button"
                                      onClick={() => handleTwoStatArtifactChange(index, artifact)}
                                      className={`relative flex flex-col items-center p-2 rounded border transition-all ${
                                        isSelected
                                          ? 'border-green-500 bg-green-500/20'
                                          : 'border-neutral-700 hover:border-neutral-600'
                                      }`}
                                    >
                                      <OptimizedImage
                                        src={getArtifactImage(artifact)}
                                        alt={artifact.name}
                                        className="w-8 h-8 rounded mb-1"
                                        type="artifact"
                                        fallbackSrc="/images/artifacts/default.png"
                                      />
                                      <span className="text-xs text-center font-medium text-white truncate w-full">{artifact.name}</span>
                                      {isSelected && (
                                        <span className="absolute top-1 left-1 bg-green-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold border border-white shadow">
                                          ✓
                                        </span>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                            
                            {/* Ввод стата */}
                            <div>
                              <label className="block text-sm font-medium text-white mb-2">Укажите стат</label>
                              <Input
                                placeholder="Например: HP%, Крит. урон, Атака%"
                                value={combo.stat}
                                onChange={e => handleTwoStatStatChange(index, e.target.value)}
                                className="bg-neutral-700 border-green-600 text-white"
                              />
                            </div>
                          </div>
                          
                          {/* Предварительный просмотр комбинации */}
                          {combo.artifact && combo.stat.trim() && (
                            <div className="mt-3 p-2 bg-green-600/20 border border-green-500 rounded">
                              <span className="text-sm text-green-300">
                                2 {combo.artifact.name} + {combo.stat}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {combinationType === 'stat+stat' && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Укажите две характеристики</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Первая характеристика</label>
                      <Input
                        placeholder="Например: HP%, Атака%, Крит. урон"
                        value={stat1}
                        onChange={e => setStat1(e.target.value)}
                        className="bg-neutral-800 border-blue-600 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Вторая характеристика</label>
                      <Input
                        placeholder="Например: HP%, Атака%, Крит. урон"
                        value={stat2}
                        onChange={e => setStat2(e.target.value)}
                        className="bg-neutral-800 border-blue-600 text-white"
                      />
                    </div>
                    {stat1.trim() && stat2.trim() && (
                      <div className="mt-4">
                        <h4 className="text-md font-semibold text-blue-300 mb-2">Созданная комбинация:</h4>
                        <div className="flex items-center gap-2 bg-neutral-800 border border-blue-600 rounded px-3 py-2">
                          <span className="text-sm text-white">{stat1} + {stat2}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-between mt-6 gap-2">
          <Button type="button" variant="outline" onClick={handleReset}>
            Сбросить
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Закрыть
            </Button>
            <Button
              type="button"
              variant="default"
              onClick={handleApply}
              disabled={
                (mode === 'single' && selected.length === 0) ||
                (mode === 'combination' && combinationType === '2+2' && (twoTwoCombinations.length === 0 || twoTwoCombinations.some(c => !c.set1 || !c.set2))) ||
                (mode === 'combination' && combinationType === '2+stat' && (twoStatCombinations.length === 0 || twoStatCombinations.some(c => !c.artifact || !c.stat.trim()))) ||
                (mode === 'combination' && combinationType === 'stat+stat' && (!stat1.trim() || !stat2.trim()))
              }
            >
              Выбрать
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}; 