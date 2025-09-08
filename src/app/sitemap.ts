import { MetadataRoute } from 'next'
import connectDB from '@/lib/mongodb'
import { CharacterModel } from '@/models/Character'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://reguides.ru'
  
  try {
    await connectDB()
    
    // Получаем всех персонажей
    const characters = await CharacterModel.find({ isActive: true }).select('id updatedAt')
    
    // Статические страницы
    const staticPages: MetadataRoute.Sitemap = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
      {
        url: `${baseUrl}/characters`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/weapons`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/artifacts`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/news`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.7,
      },
    ]
    
    // Страницы персонажей
    const characterPages: MetadataRoute.Sitemap = characters.map((character) => ({
      url: `${baseUrl}/characters/${character.id}`,
      lastModified: character.updatedAt || new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))
    
    return [...staticPages, ...characterPages]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    
    // Fallback - только статические страницы
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
      {
        url: `${baseUrl}/characters`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/weapons`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/artifacts`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/news`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.7,
      },
    ]
  }
}
