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
    const [allCharacters, activeCharacters, weapons, artifacts, articles] = await Promise.all([
      CharacterModel.find({}).select('id isActive updatedAt'),
      CharacterModel.find({ isActive: true }).select('id updatedAt'),
      WeaponModel.find({}).select('id'),
      ArtifactModel.find({}).select('id'),
      ArticleModel.find({ isActive: true }).select('id updatedAt')
    ])
    
    return NextResponse.json({
      success: true,
      data: {
        allCharacters: allCharacters.length,
        activeCharacters: activeCharacters.length,
        weapons: weapons.length,
        artifacts: artifacts.length,
        articles: articles.length,
        inactiveCharacters: allCharacters.filter(c => !c.isActive).length,
        sample: {
          allCharacters: allCharacters.slice(0, 3),
          activeCharacters: activeCharacters.slice(0, 3),
          weapons: weapons.slice(0, 3),
          artifacts: artifacts.slice(0, 3),
          articles: articles.slice(0, 3)
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
