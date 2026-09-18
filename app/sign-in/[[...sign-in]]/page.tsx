import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return <main className="authPage"><h1>Sign in</h1><p>Authentication is enabled in the deployed environment.</p></main>;
  }
  return <main className="authPage"><SignIn /></main>;
}
