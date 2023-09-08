import { ClerkLoaded, ClerkProvider } from "@clerk/nextjs";
import Footer from "@/app/_components/Footer";
import Header from "@/app/_components/Header";
import "@/styles/globals.css";
import { dark } from "@clerk/themes";

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
    <ClerkProvider
      appearance={{
        baseTheme: dark,
      }}
    >
      <html
        data-theme="synthwave"
        lang="en"
        className="h-[100%] w-[100%] fixed overflow-y-auto"
      >
        <body className="h-[100%] w-[100%] fixed overflow-y-auto">
          <ClerkLoaded>
            <Header title={metadata.title} />
            <div className="flex flex-row items-center justify-center min-h-[calc(100%-114px)]">
              {children}
            </div>
            <Footer />
          </ClerkLoaded>
        </body>
      </html>
    </ClerkProvider>
  );
}
