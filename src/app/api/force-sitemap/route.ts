import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function GET() {
  try {
    // Принудительно обновляем sitemap
    revalidatePath('/sitemap.xml')
    
    return NextResponse.json({
      success: true,
      message: 'Sitemap cache cleared and regenerated'
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
