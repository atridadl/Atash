import { SignUp } from "@clerk/remix";

export default function SignUpPage() {
  return (
    <SignUp redirectUrl={process.env.ROOT_URL ? process.env.ROOT_URL : "/"} />
  );
}
