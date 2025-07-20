// Глобальные стили для выделения выбранных элементов
export const selectedItemStyles = {
  container: 'bg-purple-700/40 border-purple-500 text-white shadow-lg',
  unselected: 'bg-neutral-800 border-neutral-700 text-white hover:bg-neutral-700'
};

// Стили для кнопок режимов
export const modeButtonStyles = {
  active: 'bg-purple-600 hover:bg-purple-700 text-white',
  inactive: 'bg-neutral-700 text-gray-300 hover:bg-neutral-600'
};

// Стили для кнопок комбинаций
export const combinationButtonStyles = {
  '2+2': 'bg-blue-600 hover:bg-blue-700 border-blue-600 text-white',
  '2+stat': 'bg-green-600 hover:bg-green-700 border-green-600 text-white',
  'stat+stat': 'bg-purple-600 hover:bg-purple-700 border-purple-600 text-white'
};

// Стили для select элементов
export const selectStyles = {
  default: 'w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all',
  selected: 'w-full px-3 py-2 bg-purple-700/20 border border-purple-500 rounded text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all'
}; 