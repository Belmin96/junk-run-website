import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return <main className="authPage"><h1>Create your account</h1><p>Authentication is enabled in the deployed environment.</p></main>;
  }
  return <main className="authPage"><SignUp /></main>;
}
