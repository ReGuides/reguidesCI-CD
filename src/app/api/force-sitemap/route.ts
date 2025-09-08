import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import SiteSettings from '@/models/SiteSettings'

export async function POST() {
  try {
    await connectDB()
    
    // Устанавливаем флаг принудительного обновления
    await SiteSettings.findOneAndUpdate(
      {},
      { 
        'sitemap.forceUpdate': true,
        'sitemap.lastUpdated': new Date()
      },
      { upsert: true }
    )
    
    return NextResponse.json({
      success: true,
      message: 'Sitemap force update flag set. Check /sitemap.xml in a few seconds.'
    })
  } catch (error) {
    console.error('Error setting force update flag:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}