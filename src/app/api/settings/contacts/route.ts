import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import SiteSettings from '@/models/SiteSettings';
import { addServerLog } from '@/lib/serverLog';

export async function GET() {
  try {
    await connectToDatabase();
    const settings = await SiteSettings.getSettings();
    
    return NextResponse.json({
      success: true,
      contacts: settings.contacts
    });
  } catch (error) {
    addServerLog('error', 'contacts-api', 'Failed to fetch contacts', { error: error instanceof Error ? error.message : 'Unknown error' });
    
    return NextResponse.json(
      { success: false, error: 'Failed to fetch contacts' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { contacts } = body;
    
    if (!contacts || typeof contacts !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Invalid contacts data' },
        { status: 400 }
      );
    }
    
    // Валидация полей контактов
    const validFields = ['email', 'telegram', 'discord', 'vk', 'website', 'description'];
    const validatedContacts: any = {};
    
    validFields.forEach(field => {
      if (contacts[field] !== undefined) {
        validatedContacts[field] = typeof contacts[field] === 'string' ? contacts[field].trim() : '';
      }
    });
    
    // Обновляем настройки
    const settings = await SiteSettings.getSettings();
    settings.contacts = { ...settings.contacts, ...validatedContacts };
    await settings.save();
    
    addServerLog('info', 'contacts-api', 'Contacts updated successfully', { contacts: validatedContacts });
    
    return NextResponse.json({
      success: true,
      contacts: settings.contacts
    });
  } catch (error) {
    addServerLog('error', 'contacts-api', 'Failed to update contacts', { error: error instanceof Error ? error.message : 'Unknown error' });
    
    return NextResponse.json(
      { success: false, error: 'Failed to update contacts' },
      { status: 500 }
    );
  }
}
