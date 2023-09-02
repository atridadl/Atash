import { ClerkLoaded, ClerkProvider } from "@clerk/nextjs";
import Footer from "@/app/_components/Footer";
import Header from "@/app/_components/Header";
import "@/styles/globals.css";
import Provider from "./_trpc/Provider";

export const metadata = {
  title: "🔥Atash🔥",
  description: "The 🔥hottest🔥 full-stack Next.js template!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html
        data-theme="synthwave"
        lang="en"
        className="h-[100%] w-[100%] fixed overflow-y-auto"
      >
        <body className="h-[100%] w-[100%] fixed overflow-y-auto">
          <ClerkLoaded>
            <Header title={metadata.title} />
            <div className="flex flex-row items-center justify-center min-h-[calc(100%-114px)]">
              <Provider>{children}</Provider>
            </div>
            <Footer />
          </ClerkLoaded>
        </body>
      </html>
    </ClerkProvider>
  );
}
