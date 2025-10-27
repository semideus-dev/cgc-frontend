import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user, canvas, analysisJobs } from "@/lib/db/schema";
import { eq, count } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    // Get the current session
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch user data from database
    const userData = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1);

    if (!userData.length) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const currentUser = userData[0];

    // Fetch user statistics
    const [canvasCount, analysisCount] = await Promise.all([
      // Count total canvases
      db
        .select({ count: count() })
        .from(canvas)
        .where(eq(canvas.userId, session.user.id)),
      
      // Count total analysis jobs (projects)
      db
        .select({ count: count() })
        .from(analysisJobs)
        .where(eq(analysisJobs.userId, session.user.id)),
    ]);

    const totalCanvases = canvasCount[0]?.count || 0;
    const totalProjects = analysisCount[0]?.count || 0;

    // Format the response
    const response = {
      id: currentUser.id,
      name: currentUser.name,
      email: currentUser.email,
      createdAt: currentUser.createdAt.toISOString(),
      stats: {
        totalCanvases,
        totalProjects,
        memberSince: currentUser.createdAt.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
        }),
        lastLogin: "Today", // You can implement proper last login tracking
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}