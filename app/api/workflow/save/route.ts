import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, nodes, edges } = body;

    // 🔥 FIND OR CREATE USER
    let dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          clerkId: user.id,
          email: user.emailAddresses[0]?.emailAddress || "",
          name: user.firstName || "",
          imageUrl: user.imageUrl || "",
        },
      });
    }

    const workflow = await prisma.workflow.create({
      data: {
        name,
        nodes,
        edges,
        userId: dbUser.id,
      },
    });

    return NextResponse.json(workflow);
  } catch (error) {
    console.error("SAVE ERROR:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
