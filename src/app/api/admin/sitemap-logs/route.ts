import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { CharacterModel } from '@/models/Character'
import { WeaponModel } from '@/models/Weapon'
import { ArtifactModel } from '@/models/Artifact'
import { ArticleModel } from '@/models/Article'
import SiteSettings from '@/models/SiteSettings'

export async function GET() {
  const logs: string[] = []
  
  try {
    logs.push('🔗 Sitemap: Starting generation...')
    
    await connectDB()
    logs.push('✅ Sitemap: Database connected')
    
    // Получаем настройки сайта
    const settings = await SiteSettings.getSettings()
    logs.push(`⚙️ Sitemap: Settings loaded: includeAllCharacters=${settings.sitemap.includeAllCharacters}, forceUpdate=${settings.sitemap.forceUpdate}`)
    
    // Получаем все данные из базы
    logs.push('📊 Sitemap: Fetching data from database...')
    const [characters, weapons, artifacts, articles] = await Promise.all([
      settings.sitemap.includeAllCharacters 
        ? CharacterModel.find({}).select('id updatedAt')
        : CharacterModel.find({ isActive: true }).select('id updatedAt'),
      WeaponModel.find({}).select('id'),
      ArtifactModel.find({}).select('id'),
      ArticleModel.find({ isActive: true }).select('id updatedAt')
    ])
    
    logs.push(`📈 Sitemap: Data fetched: characters=${characters.length}, weapons=${weapons.length}, artifacts=${artifacts.length}, articles=${articles.length}`)
    
    // Генерируем страницы
    const staticPages = 5 // главная, персонажи, оружие, артефакты, новости
    const characterPages = characters.length
    const weaponPages = weapons.length
    const artifactPages = artifacts.length
    const articlePages = articles.length
    const totalPages = staticPages + characterPages + weaponPages + artifactPages + articlePages
    
    logs.push(`🎯 Sitemap: Generated successfully! Total pages: ${totalPages}`)
    logs.push(`   - Static pages: ${staticPages}`)
    logs.push(`   - Character pages: ${characterPages}`)
    logs.push(`   - Weapon pages: ${weaponPages}`)
    logs.push(`   - Artifact pages: ${artifactPages}`)
    logs.push(`   - Article pages: ${articlePages}`)
    
    return NextResponse.json({
      success: true,
      logs: logs,
      data: {
        totalPages,
        staticPages,
        characterPages,
        weaponPages,
        artifactPages,
        articlePages,
        settings: {
          includeAllCharacters: settings.sitemap.includeAllCharacters,
          lastUpdated: settings.sitemap.lastUpdated,
          forceUpdate: settings.sitemap.forceUpdate
        }
      }
    })
  } catch (error) {
    logs.push(`❌ Sitemap: Error generating sitemap: ${error instanceof Error ? error.message : 'Unknown error'}`)
    logs.push('❌ Sitemap: Using fallback - only static pages')
    
    return NextResponse.json({
      success: false,
      logs: logs,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: {
        totalPages: 5,
        staticPages: 5,
        characterPages: 0,
        weaponPages: 0,
        artifactPages: 0,
        articlePages: 0,
        settings: null
      }
    })
  }
}
