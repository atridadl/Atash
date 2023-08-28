"use client";

import { SignUp } from "@clerk/nextjs";

export const dynamic = "force-static";

const SignUpPage = () => (
  <div style={styles}>
    <SignUp path="/sign-up" routing="path" signInUrl="/sign-in" />
  </div>
);

export default SignUpPage;

const styles = {
  width: "100vw",
  height: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};
