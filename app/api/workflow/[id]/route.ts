import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params   // ✅ MUST AWAIT

    if (!id) {
      return NextResponse.json(
        { error: "No ID provided" },
        { status: 400 }
      )
    }

    const workflow = await prisma.workflow.findUnique({
      where: { id },
    })

    if (!workflow) {
      return NextResponse.json(
        { error: "Workflow not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(workflow)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Failed to fetch workflow" },
      { status: 500 }
    )
  }
}
