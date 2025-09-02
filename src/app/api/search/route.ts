import { NextRequest, NextResponse } from 'next/server';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

interface SearchResult {
  id: string;
  name: string;
  type: 'character' | 'weapon' | 'artifact';
  image?: string;
  rarity?: number;
  element?: string;
  weaponType?: string;
}

interface CharacterData {
  _id?: string;
  id?: string;
  name: string;
  image?: string;
  rarity?: number;
  element?: string;
}

interface WeaponData {
  _id?: string;
  id?: string;
  name: string;
  image?: string;
  rarity?: number;
  type?: string;
}

interface ArtifactData {
  _id?: string;
  id?: string;
  name: string;
  image?: string;
  rarity?: number | number[];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    if (!query || query.trim().length < 2) {
      return NextResponse.json({ results: [] });
    }

    const searchTerm = query.toLowerCase().trim();
    const results: SearchResult[] = [];

    // Поиск по персонажам
    try {
      const charactersResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/characters`);
      if (charactersResponse.ok) {
        const charactersData = await charactersResponse.json();
        const characters = Array.isArray(charactersData) ? charactersData : charactersData.data || [];
        
        console.log('Search API: Found characters:', characters.length);
        console.log('Search API: Characters data structure:', charactersData);
        console.log('Search API: Search term:', searchTerm);
        console.log('Search API: First few characters:', characters.slice(0, 3).map((c: CharacterData) => ({ name: c.name, element: c.element })));

        characters.forEach((char: CharacterData) => {
          if (char.name && char.name.toLowerCase().includes(searchTerm)) {
            results.push({
              id: char.id || char._id || '',
              name: char.name,
              type: 'character',
              image: char.image,
              rarity: char.rarity,
              element: char.element
            });
          }
        });
      }
    } catch (error) {
      console.error('Error searching characters:', error);
    }

    // Поиск по оружию
    try {
      const weaponsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/weapons`);
      if (weaponsResponse.ok) {
        const weaponsData = await weaponsResponse.json();
        const weapons = Array.isArray(weaponsData) ? weaponsData : weaponsData.data || [];
        
        console.log('Search API: Found weapons:', weapons.length);
        console.log('Search API: Weapons data structure:', weaponsData);
        console.log('Search API: First few weapons:', weapons.slice(0, 3).map((w: WeaponData) => ({ name: w.name, type: w.type })));

        weapons.forEach((weapon: WeaponData) => {
          if (weapon.name && weapon.name.toLowerCase().includes(searchTerm)) {
            results.push({
              id: weapon.id || weapon._id || '',
              name: weapon.name,
              type: 'weapon',
              image: weapon.image,
              rarity: weapon.rarity,
              weaponType: weapon.type
            });
          }
        });
      }
    } catch (error) {
      console.error('Error searching weapons:', error);
    }

    // Поиск по артефактам
    try {
      const artifactsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/artifacts`);
      if (artifactsResponse.ok) {
        const artifactsData = await artifactsResponse.json();
        const artifacts = Array.isArray(artifactsData) ? artifactsData : artifactsData.data || [];
        
        console.log('Search API: Found artifacts:', artifacts.length);
        console.log('Search API: Artifacts data structure:', artifactsData);
        console.log('Search API: First few artifacts:', artifacts.slice(0, 3).map((a: ArtifactData) => ({ name: a.name, rarity: a.rarity })));

        artifacts.forEach((artifact: ArtifactData) => {
          if (artifact.name && artifact.name.toLowerCase().includes(searchTerm)) {
            results.push({
              id: artifact.id || artifact._id || '',
              name: artifact.name,
              type: 'artifact',
              image: artifact.image,
              rarity: Array.isArray(artifact.rarity) ? artifact.rarity[0] : artifact.rarity
            });
          }
        });
      }
    } catch (error) {
      console.error('Error searching artifacts:', error);
    }

    // Сортируем результаты: сначала персонажи, потом оружие, потом артефакты
    results.sort((a, b) => {
      const typeOrder = { character: 0, weapon: 1, artifact: 2 };
      return typeOrder[a.type] - typeOrder[b.type];
    });

    // Ограничиваем количество результатов
    const limitedResults = results.slice(0, 20);
    
    console.log('Search API: Final results count:', limitedResults.length);
    console.log('Search API: Results by type:', {
      characters: limitedResults.filter(r => r.type === 'character').length,
      weapons: limitedResults.filter(r => r.type === 'weapon').length,
      artifacts: limitedResults.filter(r => r.type === 'artifact').length
    });

    return NextResponse.json({ results: limitedResults });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
