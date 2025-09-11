import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { verifyRequestAuth } from '@/lib/utils/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const characterId = searchParams.get('characterId');
    
    const mongoose = await connectDB();
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error("Database connection failed");
    }
    
    // Если передан characterId, фильтруем по нему
    const filter = characterId ? { characterId } : {};
    const builds = await db.collection("builds").find(filter).toArray();
    
    // Очищаем данные от служебных полей MongoDB и добавляем id
    const cleanBuilds = builds.map(build => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _id, __v, ...cleanBuild } = build;
      // Убеждаемся, что все поля являются примитивами
      return {
        ...cleanBuild,
                 id: typeof build.id === 'object' ? build.id?.toString() || '' : ((build.id || _id?.toString()) || ''),
        title: cleanBuild.title?.toString() || '',
        characterId: cleanBuild.characterId?.toString() || '',
        description: cleanBuild.description?.toString() || '',
        descriptionHtml: cleanBuild.descriptionHtml?.toString() || '',
        artifacts: Array.isArray(cleanBuild.artifacts) ? cleanBuild.artifacts.map(artifact => ({
          ...artifact,
          id: artifact.id?.toString() || '',
          name: artifact.name?.toString() || '',
          type: artifact.type?.toString() || '',
          rarity: Number(artifact.rarity) || 1,
          description: artifact.description?.toString() || '',
          image: artifact.image?.toString() || ''
        })) : [],
        weapons: Array.isArray(cleanBuild.weapons) ? cleanBuild.weapons.map(weapon => ({
          ...weapon,
          id: weapon.id?.toString() || '',
          name: weapon.name?.toString() || '',
          type: weapon.type?.toString() || '',
          rarity: Number(weapon.rarity) || 1,
          baseAttack: weapon.baseAttack?.toString() || '',
          subStatName: weapon.subStatName?.toString() || '',
          subStatValue: weapon.subStatValue?.toString() || '',
          passiveName: weapon.passiveName?.toString() || '',
          passiveEffect: weapon.passiveEffect?.toString() || '',
          image: weapon.image?.toString() || ''
        })) : [],
        createdAt: cleanBuild.createdAt?.toString() || '',
        updatedAt: cleanBuild.updatedAt?.toString() || ''
      };
    });
    
    return NextResponse.json(cleanBuilds);
  } catch (error) {
    console.error("Error fetching builds:", error);
    return NextResponse.json({ error: "Failed to fetch builds" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  verifyRequestAuth(request, ['admin']);
  try {
    const body = await request.json();
    const mongoose = await connectDB();
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error("Database connection failed");
    }
    
    const newBuild = {
      ...body,
      id: body.title?.toLowerCase().replace(/\s+/g, "_") || `build_${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const result = await db.collection("builds").insertOne(newBuild);
    return NextResponse.json({ 
      ...newBuild, 
      id: newBuild.id || result.insertedId.toString(),
      _id: result.insertedId 
    });
  } catch (error) {
    console.error("Error creating build:", error);
    return NextResponse.json({ error: "Failed to create build" }, { status: 500 });
  }
} 