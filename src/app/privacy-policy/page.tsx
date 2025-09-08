import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Политика конфиденциальности - ReGuides',
  description: 'Политика конфиденциальности и обработки данных сайта ReGuides',
  alternates: {
    canonical: '/privacy-policy',
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-neutral-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-neutral-800 rounded-lg shadow-xl border border-neutral-700 p-8">
          <h1 className="text-3xl font-bold text-white mb-8 text-center">
            Политика конфиденциальности
          </h1>
          
          <div className="prose prose-lg max-w-none prose-invert">
            <p className="text-neutral-300 mb-6">
              <strong>Дата вступления в силу:</strong> {new Date().toLocaleDateString('ru-RU')}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">
                1. Общие положения
              </h2>
              <p className="text-neutral-300 mb-4">
                Настоящая Политика конфиденциальности (далее — «Политика») определяет порядок обработки 
                данных пользователей сайта ReGuides (далее — «Сайт», «мы», «нас»), 
                расположенного по адресу reguides.ru.
              </p>
              <p className="text-neutral-300 mb-4">
                Политика разработана в соответствии с требованиями Федерального закона от 27.07.2006 № 152-ФЗ 
                «О персональных данных» и другими нормативными актами, 
                регулирующими вопросы обработки персональных данных.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">
                2. Важная информация
              </h2>
              <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-700/30 mb-4">
                <p className="text-blue-300 text-sm">
                  <strong>Важно:</strong> Наш сайт не собирает персональные данные пользователей. 
                  Мы используем только анонимную аналитику для улучшения работы сайта. 
                  Все собираемые данные полностью обезличены и не позволяют идентифицировать конкретного человека.
                </p>
              </div>
              <p className="text-neutral-300 mb-4">
                Сайт ReGuides является информационным ресурсом с гайдами по игре Genshin Impact. 
                Мы не требуем регистрации от обычных пользователей и не собираем их персональную информацию.
              </p>
              <p className="text-neutral-300 mb-4">
                Административные аккаунты используются только для управления контентом сайта 
                и не содержат персональных данных пользователей.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">
                3. Какие данные мы НЕ собираем
              </h2>
              <div className="space-y-3">
                <p className="text-neutral-300">
                  Мы <strong>НЕ собираем</strong> следующие данные:
                </p>
                <ul className="list-disc list-inside text-neutral-300 space-y-1 ml-4">
                  <li>IP-адреса пользователей</li>
                  <li>Имена, фамилии, адреса электронной почты</li>
                  <li>Номера телефонов или другие контактные данные</li>
                  <li>Точное местоположение пользователей</li>
                  <li>Данные для регистрации аккаунтов (кроме административных)</li>
                  <li>Пароли или данные авторизации</li>
                  <li>Персональные файлы или документы</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">
                4. Анонимная аналитика
              </h2>
              <div className="space-y-4">
                <p className="text-neutral-300 mb-2">
                  Для улучшения работы сайта мы собираем только анонимную статистику:
                </p>
                
                <div>
                  <h3 className="text-xl font-medium text-white mb-2">4.1. Техническая информация:</h3>
                  <ul className="list-disc list-inside text-neutral-300 space-y-1 ml-4">
                    <li>Категория устройства (компьютер, планшет, мобильный)</li>
                    <li>Размер экрана (малый, средний, большой) — для корректного отображения</li>
                    <li>Тип страницы (персонаж, оружие, артефакт, новости)</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-medium text-white mb-2">4.2. Географическая информация:</h3>
                  <ul className="list-disc list-inside text-neutral-300 space-y-1 ml-4">
                    <li>Только континент (Европа, Азия, Америка, Африка, Океания)</li>
                    <li>Без указания страны, города или точного местоположения</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-medium text-white mb-2">4.3. Поведенческие метрики:</h3>
                  <ul className="list-disc list-inside text-neutral-300 space-y-1 ml-4">
                    <li>Время, проведенное на страницах</li>
                    <li>Популярность контента и разделов</li>
                    <li>Время загрузки страниц (для оптимизации)</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-green-900/20 rounded-lg border border-green-700/30">
                  <p className="text-green-300 text-sm">
                    <strong>Гарантия анонимности:</strong> Все данные собираются в обезличенном виде. 
                    Мы не можем и не пытаемся идентифицировать конкретных пользователей.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">
                5. Рекламная аналитика
              </h2>
              <div className="space-y-4">
                <p className="text-neutral-300 mb-2">
                  Для отслеживания эффективности рекламных кампаний мы собираем:
                </p>
                <ul className="list-disc list-inside text-neutral-300 space-y-1 ml-4">
                  <li>UTM-параметры (источник, кампания, медиум)</li>
                  <li>Статистику показов и кликов по рекламе</li>
                  <li>Конверсии и достижение целей</li>
                  <li>Эффективность внутренних рекламных блоков</li>
                </ul>
                <p className="text-neutral-300 mt-2">
                  Все данные обезличены и не позволяют идентифицировать конкретного пользователя.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">
                6. Cookies и локальное хранилище
              </h2>
              <div className="space-y-3">
                <p className="text-neutral-300">
                  Мы используем минимальное количество cookies только для:
                </p>
                <ul className="list-disc list-inside text-neutral-300 space-y-1 ml-4">
                  <li>Запоминания предпочтений отображения</li>
                  <li>Анонимной аналитики</li>
                  <li>Улучшения производительности сайта</li>
                </ul>
                <p className="text-neutral-300">
                  Пользователь может отключить cookies в настройках браузера, 
                  однако это может повлиять на функциональность Сайта.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">
                7. Сроки хранения данных
              </h2>
              <div className="space-y-3">
                <p className="text-neutral-300">
                  Анонимные аналитические данные хранятся в течение 2 лет, 
                  после чего автоматически удаляются.
                </p>
                <p className="text-neutral-300">
                  Данные административных аккаунтов хранятся только в течение срока их действия.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">
                8. Безопасность данных
              </h2>
              <div className="space-y-3">
                <p className="text-neutral-300">
                  Для защиты данных мы принимаем следующие меры:
                </p>
                <ul className="list-disc list-inside text-neutral-300 space-y-1 ml-4">
                  <li>Шифрование данных при передаче (HTTPS)</li>
                  <li>Ограничение доступа к административным функциям</li>
                  <li>Регулярное обновление систем безопасности</li>
                  <li>Мониторинг подозрительной активности</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">
                9. Передача данных третьим лицам
              </h2>
              <div className="space-y-3">
                <p className="text-neutral-300">
                  Мы не передаем никакие данные третьим лицам, за исключением:
                </p>
                <ul className="list-disc list-inside text-neutral-300 space-y-1 ml-4">
                  <li>Анонимной статистики в обезличенном виде</li>
                  <li>Случаев, предусмотренных законодательством</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">
                10. Контактная информация
              </h2>
              <div className="space-y-3">
                <p className="text-neutral-300">
                  По всем вопросам, связанным с обработкой данных, 
                  вы можете обратиться к нам:
                </p>
                <ul className="list-disc list-inside text-neutral-300 space-y-1 ml-4">
                  <li>Через кнопку &quot;Контакты&quot; в подвале сайта</li>
                  <li>На странице &quot;О проекте&quot;</li>
                </ul>
                <p className="text-neutral-300">
                  Мы обязуемся ответить на ваши обращения в течение 30 дней.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">
                11. Изменения в Политике
              </h2>
              <div className="space-y-3">
                <p className="text-neutral-300">
                  Мы оставляем за собой право вносить изменения в настоящую Политику. 
                  При внесении существенных изменений мы уведомим пользователей 
                  через уведомления на Сайте.
                </p>
                <p className="text-neutral-300">
                  Продолжение использования Сайта после внесения изменений означает 
                  согласие с новой версией Политики.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">
                12. Заключительные положения
              </h2>
              <div className="space-y-3">
                <p className="text-neutral-300">
                  Настоящая Политика вступает в силу с момента ее опубликования на Сайте 
                  и действует бессрочно до замены новой Политикой.
                </p>
                <p className="text-neutral-300">
                  Если какое-либо положение Политики будет признано недействительным, 
                  остальные положения сохраняют свою силу.
                </p>
              </div>
            </section>

            <div className="mt-12 p-6 bg-blue-900/20 rounded-lg border border-blue-700/30">
              <h3 className="text-lg font-semibold text-blue-300 mb-3">
                Соответствие 152-ФЗ
              </h3>
              <p className="text-blue-300 text-sm">
                Наша система аналитики полностью соответствует требованиям Федерального закона 
                от 27.07.2006 № 152-ФЗ «О персональных данных». Мы не собираем и не храним 
                персональные данные, которые могут привести к идентификации конкретного лица. 
                Все аналитические данные обезличены и агрегированы, что соответствует 
                требованиям законодательства о защите персональных данных.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
