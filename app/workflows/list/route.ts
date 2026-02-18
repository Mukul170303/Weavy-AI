// import { NextResponse } from "next/server";
// import { currentUser } from "@clerk/nextjs/server";
// import prisma from "@/lib/prisma";

// export async function GET() {
//   try {
//     // 1️⃣ Check Clerk auth
//     const user = await currentUser();

//     if (!user) {
//       return NextResponse.json(
//         { error: "Unauthorized" },
//         { status: 401 }
//       );
//     }

//     // 2️⃣ Find user in DB
//     let dbUser = await prisma.user.findUnique({
//       where: { clerkId: user.id },
//     });

//     // 3️⃣ Create user if not exists
//     if (!dbUser) {
//       dbUser = await prisma.user.create({
//         data: {
//           clerkId: user.id,
//           email: user.emailAddresses[0]?.emailAddress || "",
//           name: user.firstName || "",
//           imageUrl: user.imageUrl || "",
//         },
//       });
//     }

//     // 4️⃣ Fetch workflows for that user
//     const workflows = await prisma.workflow.findMany({
//       where: {
//         userId: dbUser.id,
//       },
//       orderBy: {
//         createdAt: "desc",
//       },
//     });

//     return NextResponse.json(workflows);

//   } catch (error) {
//     console.error("LIST ERROR:", error);
//     return NextResponse.json(
//       { error: "Something went wrong" },
//       { status: 500 }
//     );
//   }
// }
