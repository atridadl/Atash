import { type AppType } from "next/app";
import { ClerkProvider } from "@clerk/nextjs";

import { api } from "~/utils/api";

import Footer from "~/components/Footer";
import Navbar from "~/components/Navbar";
import "~/styles/globals.css";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ClerkProvider {...pageProps}>
      <div className="block h-[100%]">
        <Navbar title="T3 Clerk Drizzle Starter" />
        <div className="flex flex-row items-center justify-center min-h-[calc(100%-114px)]">
          <Component {...pageProps} />
        </div>
        <Footer />
      </div>
    </ClerkProvider>
  );
};

export default api.withTRPC(MyApp);
