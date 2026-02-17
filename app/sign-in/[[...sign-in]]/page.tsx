import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <SignIn 
        appearance={{
          elements: {
            card: "bg-zinc-900 shadow-xl",
          },
        }}
        afterSignInUrl="/workflow"
        afterSignUpUrl="/workflow"
      />
    </div>
  );
}
