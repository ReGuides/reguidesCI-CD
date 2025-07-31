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
      return {
        ...cleanBuild,
        id: build.id || _id?.toString()
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