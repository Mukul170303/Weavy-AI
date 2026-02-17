import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Sidebar from "@/components/workflow/Sidebar";
import WorkflowCanvas from "@/components/workflow/WorkflowCanvas";

export default async function WorkflowPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <WorkflowCanvas />
    </div>
  );
}
