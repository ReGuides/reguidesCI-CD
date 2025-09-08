import { Character } from '@/types';

interface StructuredDataProps {
  character: Character;
}

export default function StructuredData({ character }: StructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": `${character.name} - Гайд по персонажу`,
    "description": `Подробный гайд по персонажу ${character.name} в Genshin Impact. Рекомендации по оружию, артефактам, талантам и сборкам.`,
    "image": character.image || '/images/logos/logo.png',
    "author": {
      "@type": "Organization",
      "name": "ReGuides",
      "url": "https://reguides.ru"
    },
    "publisher": {
      "@type": "Organization",
      "name": "ReGuides",
      "logo": {
        "@type": "ImageObject",
        "url": "https://reguides.ru/images/logos/logo.png"
      }
    },
    "datePublished": new Date().toISOString(),
    "dateModified": new Date().toISOString(),
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://reguides.ru/characters/${character.id}`
    },
    "about": {
      "@type": "Thing",
      "name": character.name,
      "description": character.description,
      "additionalProperty": [
        {
          "@type": "PropertyValue",
          "name": "Элемент",
          "value": character.element
        },
        {
          "@type": "PropertyValue", 
          "name": "Оружие",
          "value": character.weapon
        },
        {
          "@type": "PropertyValue",
          "name": "Регион", 
          "value": character.region
        },
        {
          "@type": "PropertyValue",
          "name": "Редкость",
          "value": character.rarity
        }
      ]
    },
    "keywords": [
      character.name,
      'genshin impact',
      'гайд',
      'персонаж',
      character.element,
      character.weapon,
      'сборка',
      'рекомендации'
    ].join(', ')
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
