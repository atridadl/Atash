import { SignUp } from "@clerk/nextjs";
import { env } from "env.mjs";

export const runtime = "edge";

const SignUpPage = () => (
  <SignUp
    path="/sign-up"
    routing="path"
    signInUrl="/sign-in"
    redirectUrl={env.ROOT_URL ? env.ROOT_URL : "/"}
  />
);

export default SignUpPage;
