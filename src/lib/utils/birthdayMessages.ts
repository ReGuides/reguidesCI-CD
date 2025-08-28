// Разнообразные поздравления для дней рождения персонажей

interface BirthdayMessage {
  content: string;
  tags: string[];
}

export const birthdayMessages: BirthdayMessage[] = [
  {
    content: `🎊 <strong>Сегодня особенный день в Тейвате!</strong> 🎊\n\n🎂 <a href="/characters/{{characterId}}" class="text-purple-400 hover:text-purple-300 underline font-medium"><strong>{{characterName}}</strong></a> празднует свой день рождения!\n\n🌟 Поздравляем всех, кто любит этого персонажа! 🎉\n\n🎮 Сегодня идеальный день, чтобы сделать <a href="/characters/{{characterId}}" class="text-purple-400 hover:text-purple-300 underline font-medium"><strong>{{characterName}}</strong></a> ещё сильнее!\n\n✨ Переходи на страницу персонажа, чтобы узнать, как его лучше прокачать и какие артефакты ему подходят! 🚀`,
    tags: ['день рождения', 'праздник', 'прокачка', 'удача', 'артефакты', 'тейват']
  }
];

// Функция для получения поздравления (теперь всегда одно универсальное)
export function getRandomBirthdayMessage(characterName: string, characterId: string): BirthdayMessage {
  const message = birthdayMessages[0]; // Всегда берем первое (и единственное) сообщение
  
  return {
    content: message.content
      .replace(/\{\{characterName\}\}/g, characterName)
      .replace(/\{\{characterId\}\}/g, characterId),
    tags: [...message.tags, characterName.toLowerCase()]
  };
}

// Функция для получения поздравления по индексу (для тестирования)
export function getBirthdayMessageByIndex(index: number, characterName: string, characterId: string): BirthdayMessage {
  if (index >= 0 && index < birthdayMessages.length) {
    const message = birthdayMessages[index];
    return {
      content: message.content
        .replace(/\{\{characterName\}\}/g, characterName)
        .replace(/\{\{characterId\}\}/g, characterId),
      tags: [...message.tags, characterName.toLowerCase()]
    };
  }
  
  // Возвращаем первое сообщение по умолчанию
  return getRandomBirthdayMessage(characterName, characterId);
}
