import { SignIn } from "@clerk/nextjs";
import { env } from "env.mjs";

const SignInPage = () => (
  <SignIn
    path="/sign-in"
    routing="path"
    signUpUrl="/sign-up"
    redirectUrl={env.ROOT_URL ? env.ROOT_URL : "/"}
  />
);

export default SignInPage;
