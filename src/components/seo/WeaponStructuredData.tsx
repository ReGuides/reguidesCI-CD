import { Weapon } from '@/types';

interface WeaponStructuredDataProps {
  weapon: Weapon;
}

export default function WeaponStructuredData({ weapon }: WeaponStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": weapon.name,
    "description": `Подробный гайд по оружию ${weapon.name} в Genshin Impact. Тип: ${weapon.type}, Редкость: ${weapon.rarity}★.`,
    "image": weapon.image || '/images/logos/logo.png',
    "brand": {
      "@type": "Brand",
      "name": "Genshin Impact"
    },
    "category": "Игровое оружие",
    "additionalProperty": [
      {
        "@type": "PropertyValue",
        "name": "Тип оружия",
        "value": weapon.type
      },
      {
        "@type": "PropertyValue",
        "name": "Редкость",
        "value": weapon.rarity
      },
      {
        "@type": "PropertyValue",
        "name": "Базовая атака",
        "value": weapon.baseAttack
      },
      {
        "@type": "PropertyValue",
        "name": "Дополнительная характеристика",
        "value": `${weapon.subStatName} ${weapon.subStatValue}`
      }
    ],
    "offers": {
      "@type": "Offer",
      "availability": "https://schema.org/InStock",
      "price": "0",
      "priceCurrency": "USD",
      "description": "Бесплатная игра"
    },
    "review": {
      "@type": "Review",
      "author": {
        "@type": "Organization",
        "name": "ReGuides"
      },
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": weapon.rarity || "5",
        "bestRating": "5"
      }
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
