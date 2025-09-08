import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import SiteSettings from '@/models/SiteSettings'

export async function GET() {
  try {
    await connectDB()
    const settings = await SiteSettings.getSettings()
    
    return NextResponse.json({
      success: true,
      data: {
        includeAllCharacters: settings.sitemap.includeAllCharacters,
        lastUpdated: settings.sitemap.lastUpdated,
        forceUpdate: settings.sitemap.forceUpdate
      }
    })
  } catch (error) {
    console.error('Error fetching sitemap settings:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()
    
    const updateData: Record<string, unknown> = {}
    
    if (body.includeAllCharacters !== undefined) {
      updateData['sitemap.includeAllCharacters'] = body.includeAllCharacters
    }
    
    if (body.forceUpdate === true) {
      updateData['sitemap.forceUpdate'] = true
      updateData['sitemap.lastUpdated'] = new Date()
    }
    
    const settings = await SiteSettings.findOneAndUpdate(
      {},
      updateData,
      { new: true, upsert: true }
    )
    
    return NextResponse.json({
      success: true,
      data: {
        includeAllCharacters: settings.sitemap.includeAllCharacters,
        lastUpdated: settings.sitemap.lastUpdated,
        forceUpdate: settings.sitemap.forceUpdate
      }
    })
  } catch (error) {
    console.error('Error updating sitemap settings:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
