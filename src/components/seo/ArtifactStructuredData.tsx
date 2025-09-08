import { Artifact } from '@/types';

interface ArtifactStructuredDataProps {
  artifact: Artifact;
}

export default function ArtifactStructuredData({ artifact }: ArtifactStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": artifact.name,
    "description": `Подробный гайд по артефакту ${artifact.name} в Genshin Impact. Редкость: ${artifact.rarity && artifact.rarity.length > 0 ? Math.max(...artifact.rarity) : 'Неизвестная'}★, Количество предметов: ${artifact.pieces || 'Неизвестно'}.`,
    "image": artifact.image || '/images/logos/logo.png',
    "brand": {
      "@type": "Brand",
      "name": "Genshin Impact"
    },
    "category": "Игровые артефакты",
    "additionalProperty": [
      {
        "@type": "PropertyValue",
        "name": "Редкость",
        "value": artifact.rarity && artifact.rarity.length > 0 ? Math.max(...artifact.rarity) : 'Неизвестная'
      },
      {
        "@type": "PropertyValue",
        "name": "Количество предметов",
        "value": artifact.pieces || 'Неизвестно'
      },
      {
        "@type": "PropertyValue",
        "name": "Бонус за 2 предмета",
        "value": artifact.bonus2 || 'Не указан'
      },
      {
        "@type": "PropertyValue",
        "name": "Бонус за 4 предмета",
        "value": artifact.bonus4 || 'Не указан'
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
        "ratingValue": artifact.rarity && artifact.rarity.length > 0 ? Math.max(...artifact.rarity) : "5",
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
