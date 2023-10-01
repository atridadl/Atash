import { SignUp } from "@clerk/nextjs";

export const runtime = "edge";

const SignUpPage = () => (
  <SignUp path="/sign-up" routing="path" signInUrl="/sign-in" />
);

export default SignUpPage;
