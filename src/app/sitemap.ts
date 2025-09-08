import { MetadataRoute } from 'next'
import connectDB from '@/lib/mongodb'
import { CharacterModel } from '@/models/Character'
import { WeaponModel } from '@/models/Weapon'
import { ArtifactModel } from '@/models/Artifact'
import { ArticleModel } from '@/models/Article'
import SiteSettings from '@/models/SiteSettings'

// Отключаем кеширование sitemap
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://reguides.ru'
  
  try {
    console.log('🔗 Sitemap: Starting generation...')
    await connectDB()
    console.log('✅ Sitemap: Database connected')
    
    // Получаем настройки сайта
    const settings = await SiteSettings.getSettings()
    console.log('⚙️ Sitemap: Settings loaded:', {
      includeAllCharacters: settings.sitemap.includeAllCharacters,
      forceUpdate: settings.sitemap.forceUpdate
    })
    
    // Получаем все данные из базы
    console.log('📊 Sitemap: Fetching data from database...')
    const [characters, weapons, artifacts, articles] = await Promise.all([
      settings.sitemap.includeAllCharacters 
        ? CharacterModel.find({}).select('id updatedAt') // Все персонажи
        : CharacterModel.find({ isActive: true }).select('id updatedAt'), // Только активные
      WeaponModel.find({}).select('id'),
      ArtifactModel.find({}).select('id'),
      ArticleModel.find({ isActive: true }).select('id updatedAt')
    ])
    
    console.log('📈 Sitemap: Data fetched:', {
      characters: characters.length,
      weapons: weapons.length,
      artifacts: artifacts.length,
      articles: articles.length
    })
    
    // Обновляем время последнего обновления sitemap
    if (settings.sitemap.forceUpdate) {
      console.log('🔄 Sitemap: Force update requested, updating timestamp...')
      await SiteSettings.findOneAndUpdate(
        {},
        { 
          'sitemap.lastUpdated': new Date(),
          'sitemap.forceUpdate': false 
        }
      )
    }
    
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
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    }))
    
    // Страницы артефактов
    const artifactPages: MetadataRoute.Sitemap = artifacts.map((artifact) => ({
      url: `${baseUrl}/artifacts/${artifact.id}`,
      lastModified: new Date(),
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
    console.log('🎯 Sitemap: Generated successfully!', {
      totalPages: allPages.length,
      static: staticPages.length,
      characters: characterPages.length,
      weapons: weaponPages.length,
      artifacts: artifactPages.length,
      articles: articlePages.length
    })
    return allPages
  } catch (error) {
    console.error('❌ Sitemap: Error generating sitemap:', error)
    console.error('❌ Sitemap: Using fallback - only static pages')
    
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
