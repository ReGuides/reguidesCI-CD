import { MetadataRoute } from 'next'
import connectDB from '@/lib/mongodb'
import { CharacterModel } from '@/models/Character'
import { WeaponModel } from '@/models/Weapon'
import { ArtifactModel } from '@/models/Artifact'
import { ArticleModel } from '@/models/Article'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://reguides.ru'
  
  try {
    console.log('Connecting to database...')
    await connectDB()
    console.log('Database connected successfully')
    
    // Получаем все данные из базы
    console.log('Fetching data from database...')
    const [characters, weapons, artifacts, articles] = await Promise.all([
      CharacterModel.find({ isActive: true }).select('id updatedAt'),
      WeaponModel.find({}).select('id updatedAt'),
      ArtifactModel.find({}).select('id updatedAt'),
      ArticleModel.find({ isActive: true }).select('id updatedAt')
    ])
    
    console.log('Data fetched:', {
      characters: characters.length,
      weapons: weapons.length,
      artifacts: artifacts.length,
      articles: articles.length
    })
    
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
        changeFrequency: 'daily',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/artifacts`,
        lastModified: new Date(),
        changeFrequency: 'daily',
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
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }))
    
    // Страницы оружия
    const weaponPages: MetadataRoute.Sitemap = weapons.map((weapon) => ({
      url: `${baseUrl}/weapons/${weapon.id}`,
      lastModified: weapon.updatedAt || new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    }))
    
    // Страницы артефактов
    const artifactPages: MetadataRoute.Sitemap = artifacts.map((artifact) => ({
      url: `${baseUrl}/artifacts/${artifact.id}`,
      lastModified: artifact.updatedAt || new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    }))
    
    // Страницы статей
    const articlePages: MetadataRoute.Sitemap = articles.map((article) => ({
      url: `${baseUrl}/articles/${article.id}`,
      lastModified: article.updatedAt || new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.6,
    }))
    
    const allPages = [...staticPages, ...characterPages, ...weaponPages, ...artifactPages, ...articlePages]
    console.log('Total pages in sitemap:', allPages.length)
    return allPages
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
        changeFrequency: 'daily',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/artifacts`,
        lastModified: new Date(),
        changeFrequency: 'daily',
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
