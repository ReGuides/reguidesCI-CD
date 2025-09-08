import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { CharacterModel } from '@/models/Character'
import { WeaponModel } from '@/models/Weapon'
import { ArtifactModel } from '@/models/Artifact'
import { ArticleModel } from '@/models/Article'

export async function GET() {
  try {
    await connectDB()
    
    // Получаем все данные из базы
    const [characters, weapons, artifacts, articles] = await Promise.all([
      CharacterModel.find({ isActive: true }).select('id updatedAt').limit(5),
      WeaponModel.find({}).select('id updatedAt').limit(5),
      ArtifactModel.find({}).select('id updatedAt').limit(5),
      ArticleModel.find({ isActive: true }).select('id updatedAt').limit(5)
    ])
    
    return NextResponse.json({
      success: true,
      data: {
        characters: characters.length,
        weapons: weapons.length,
        artifacts: artifacts.length,
        articles: articles.length,
        sample: {
          characters: characters,
          weapons: weapons,
          artifacts: artifacts,
          articles: articles
        }
      }
    })
  } catch (error) {
    console.error('Sitemap debug error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
