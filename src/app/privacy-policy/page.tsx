import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Политика конфиденциальности - ReGuides',
  description: 'Политика конфиденциальности и обработки персональных данных сайта ReGuides',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Политика конфиденциальности
          </h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Дата вступления в силу:</strong> {new Date().toLocaleDateString('ru-RU')}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                1. Общие положения
              </h2>
              <p className="text-gray-700 mb-4">
                Настоящая Политика конфиденциальности (далее — «Политика») определяет порядок обработки 
                персональных данных пользователей сайта ReGuides (далее — «Сайт», «мы», «нас»), 
                расположенного по адресу reguides.ru.
              </p>
              <p className="text-gray-700 mb-4">
                Политика разработана в соответствии с требованиями Федерального закона от 27.07.2006 № 152-ФЗ 
                «О персональных данных» (далее — «Закон о персональных данных») и другими нормативными актами, 
                регулирующими вопросы обработки персональных данных.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                2. Основные понятия
              </h2>
              <div className="space-y-3">
                <p className="text-gray-700">
                  <strong>Персональные данные</strong> — любая информация, относящаяся к прямо или косвенно 
                  определенному или определяемому физическому лицу (субъекту персональных данных).
                </p>
                <p className="text-gray-700">
                  <strong>Обработка персональных данных</strong> — любое действие (операция) или совокупность 
                  действий (операций), совершаемых с использованием средств автоматизации или без использования 
                  таких средств с персональными данными.
                </p>
                <p className="text-gray-700">
                  <strong>Автоматизированная обработка персональных данных</strong> — обработка персональных 
                  данных с помощью средств вычислительной техники.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                3. Категории обрабатываемых персональных данных
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">3.1. Данные, предоставляемые пользователем:</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                    <li>Имя пользователя (при регистрации)</li>
                    <li>Адрес электронной почты (при регистрации)</li>
                    <li>Пароль (при регистрации)</li>
                    <li>Аватар пользователя (при загрузке)</li>
                    <li>Комментарии и отзывы (при публикации)</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">3.2. Данные, собираемые автоматически:</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                    <li>IP-адрес (в обезличенном виде)</li>
                    <li>Информация о браузере и операционной системе</li>
                    <li>Тип устройства (компьютер, планшет, мобильный)</li>
                    <li>Разрешение экрана</li>
                    <li>Время посещения страниц</li>
                    <li>Страница входа и выхода</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                4. Цели обработки персональных данных
              </h2>
              <div className="space-y-3">
                <p className="text-gray-700">
                  Мы обрабатываем персональные данные в следующих целях:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Предоставление доступа к сервисам и функциям Сайта</li>
                  <li>Регистрация и авторизация пользователей</li>
                  <li>Персонализация контента и рекомендаций</li>
                  <li>Аналитика использования Сайта для улучшения сервиса</li>
                  <li>Обеспечение безопасности и предотвращение мошенничества</li>
                  <li>Соблюдение требований законодательства</li>
                  <li>Отправка уведомлений и технических сообщений</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                5. Правовые основания обработки персональных данных
              </h2>
              <div className="space-y-3">
                <p className="text-gray-700">
                  Обработка персональных данных осуществляется на следующих правовых основаниях:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Согласие субъекта персональных данных на обработку</li>
                  <li>Необходимость обработки для исполнения договора</li>
                  <li>Необходимость обработки для соблюдения юридических обязательств</li>
                  <li>Необходимость обработки для защиты жизненно важных интересов</li>
                  <li>Необходимость обработки для выполнения задачи, осуществляемой в общественных интересах</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                6. Способы обработки персональных данных
              </h2>
              <div className="space-y-3">
                <p className="text-gray-700">
                  Обработка персональных данных осуществляется следующими способами:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Автоматизированная обработка с использованием средств вычислительной техники</li>
                  <li>Неавтоматизированная обработка персональных данных</li>
                  <li>Смешанная обработка персональных данных</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                7. Сроки обработки персональных данных
              </h2>
              <div className="space-y-3">
                <p className="text-gray-700">
                  Сроки обработки персональных данных определяются следующими критериями:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Данные пользователей хранятся в течение срока действия учетной записи</li>
                  <li>После удаления учетной записи данные удаляются в течение 30 дней</li>
                  <li>Аналитические данные хранятся в обезличенном виде в течение 2 лет</li>
                  <li>Логи безопасности хранятся в течение 6 месяцев</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                8. Безопасность персональных данных
              </h2>
              <div className="space-y-3">
                <p className="text-gray-700">
                  Для защиты персональных данных мы принимаем следующие меры:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Шифрование данных при передаче (HTTPS)</li>
                  <li>Хеширование паролей с использованием современных алгоритмов</li>
                  <li>Ограничение доступа к персональным данным</li>
                  <li>Регулярное обновление систем безопасности</li>
                  <li>Мониторинг и логирование доступа к данным</li>
                  <li>Регулярные проверки безопасности</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                9. Передача персональных данных третьим лицам
              </h2>
              <div className="space-y-3">
                <p className="text-gray-700">
                  Мы не передаем персональные данные третьим лицам, за исключением следующих случаев:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>С явного согласия пользователя</li>
                  <li>В случаях, предусмотренных законодательством</li>
                  <li>Для выполнения договорных обязательств</li>
                  <li>В обезличенном виде для аналитических целей</li>
                </ul>
                <p className="text-gray-700">
                  При передаче данных третьим лицам мы заключаем соглашения о защите персональных данных.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                10. Аналитика и отслеживание
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">10.1. Внутренняя аналитика:</h3>
                  <p className="text-gray-700 mb-2">
                    Мы используем внутреннюю систему аналитики для улучшения работы Сайта. 
                    Собираемые данные полностью обезличены и не содержат персональной информации:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                    <li>Агрегированная статистика посещений</li>
                    <li>Популярность контента и разделов</li>
                    <li>Технические характеристики устройств (без идентификации)</li>
                    <li>Географическое распределение (уровень континента)</li>
                    <li>Время, проведенное на страницах</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">10.2. Рекламная аналитика:</h3>
                  <p className="text-gray-700 mb-2">
                    Для отслеживания эффективности рекламных кампаний мы собираем:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                    <li>UTM-параметры (источник, кампания, медиум)</li>
                    <li>Статистику показов и кликов по рекламе</li>
                    <li>Конверсии и достижение целей</li>
                    <li>Эффективность внутренних рекламных блоков</li>
                  </ul>
                  <p className="text-gray-700 mt-2">
                    Все данные обезличены и не позволяют идентифицировать конкретного пользователя.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                11. Cookies и локальное хранилище
              </h2>
              <div className="space-y-3">
                <p className="text-gray-700">
                  Мы используем cookies и локальное хранилище для следующих целей:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Аутентификация и сессии пользователей</li>
                  <li>Запоминание предпочтений и настроек</li>
                  <li>Аналитика использования Сайта</li>
                  <li>Улучшение производительности и функциональности</li>
                </ul>
                <p className="text-gray-700">
                  Пользователь может отключить cookies в настройках браузера, 
                  однако это может повлиять на функциональность Сайта.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                12. Права субъектов персональных данных
              </h2>
              <div className="space-y-3">
                <p className="text-gray-700">
                  В соответствии с Законом о персональных данных, пользователи имеют право:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Получать информацию об обработке персональных данных</li>
                  <li>Требовать уточнения, блокирования или уничтожения данных</li>
                  <li>Отзывать согласие на обработку данных</li>
                  <li>Обжаловать действия или бездействие при обработке данных</li>
                  <li>Получать информацию о передаче данных третьим лицам</li>
                  <li>Требовать прекращения обработки данных</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                13. Обработка персональных данных несовершеннолетних
              </h2>
              <div className="space-y-3">
                <p className="text-gray-700">
                  Мы не собираем и не обрабатываем персональные данные несовершеннолетних 
                  без согласия их законных представителей.
                </p>
                <p className="text-gray-700">
                  Если мы узнаем, что собрали персональные данные несовершеннолетнего 
                  без соответствующего согласия, мы немедленно удалим эти данные.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                14. Международная передача данных
              </h2>
              <div className="space-y-3">
                <p className="text-gray-700">
                  Мы не передаем персональные данные за пределы Российской Федерации, 
                  за исключением случаев, предусмотренных законодательством.
                </p>
                <p className="text-gray-700">
                  При необходимости международной передачи данных мы обеспечиваем 
                  соответствующий уровень защиты в соответствии с требованиями закона.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                15. Изменения в Политике конфиденциальности
              </h2>
              <div className="space-y-3">
                <p className="text-gray-700">
                  Мы оставляем за собой право вносить изменения в настоящую Политику. 
                  При внесении существенных изменений мы уведомим пользователей:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Через уведомления на Сайте</li>
                  <li>По электронной почте (если указана)</li>
                  <li>Через push-уведомления (если разрешены)</li>
                </ul>
                <p className="text-gray-700">
                  Продолжение использования Сайта после внесения изменений означает 
                  согласие с новой версией Политики.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                16. Контактная информация
              </h2>
              <div className="space-y-3">
                <p className="text-gray-700">
                  По всем вопросам, связанным с обработкой персональных данных, 
                  вы можете обратиться к нам:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Электронная почта: privacy@reguides.ru</li>
                  <li>Через форму обратной связи на Сайте</li>
                  <li>По адресу, указанному в разделе &quot;О проекте&quot;</li>
                </ul>
                <p className="text-gray-700">
                  Мы обязуемся ответить на ваши обращения в течение 30 дней.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                17. Заключительные положения
              </h2>
              <div className="space-y-3">
                <p className="text-gray-700">
                  Настоящая Политика вступает в силу с момента ее опубликования на Сайте 
                  и действует бессрочно до замены новой Политикой.
                </p>
                <p className="text-gray-700">
                  Если какое-либо положение Политики будет признано недействительным, 
                  остальные положения сохраняют свою силу.
                </p>
                <p className="text-gray-700">
                  Политика доступна на русском языке и может быть переведена на другие языки 
                  для удобства пользователей.
                </p>
              </div>
            </section>

            <div className="mt-12 p-6 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">
                Важная информация о соответствии 152-ФЗ
              </h3>
              <p className="text-blue-700 text-sm">
                Наша система аналитики полностью соответствует требованиям Федерального закона 
                от 27.07.2006 № 152-ФЗ «О персональных данных». Мы не собираем и не храним 
                персональные данные, которые могут привести к идентификации конкретного лица. 
                Все аналитические данные обезличены и агрегированы, что исключает необходимость 
                уведомления Роскомнадзора о начале обработки персональных данных.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
