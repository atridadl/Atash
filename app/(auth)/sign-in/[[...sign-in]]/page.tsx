import { SignIn } from "@clerk/nextjs";

export const runtime = "edge";

const SignInPage = () => (
  <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" />
);

export default SignInPage;
