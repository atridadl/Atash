import { SignIn } from "@clerk/remix";

export default function SignInPage() {
  return (
    <SignIn redirectUrl={process.env.ROOT_URL ? process.env.ROOT_URL : "/"} />
  );
}
