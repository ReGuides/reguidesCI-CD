import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { id } = await params;
    const mongoose = await connectDB();
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error("Database connection failed");
    }
    
    const updatedBuild = {
      ...body,
      updatedAt: new Date(),
    };
    
    const result = await db.collection("builds").updateOne(
      { id },
      { $set: updatedBuild }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Build not found" }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating build:", error);
    return NextResponse.json({ error: "Failed to update build" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const mongoose = await connectDB();
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error("Database connection failed");
    }
    
    const result = await db.collection("builds").deleteOne({ id });
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Build not found" }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting build:", error);
    return NextResponse.json({ error: "Failed to delete build" }, { status: 500 });
  }
} 