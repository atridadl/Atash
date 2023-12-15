import { rootAuthLoader } from "@clerk/remix/ssr.server";
import { ClerkApp, ClerkErrorBoundary } from "@clerk/remix";
import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import Footer from "./components/Footer";
import Header from "./components/Header";

import "~/tailwind.css";

export const meta: MetaFunction = () => {
  return [
    { title: "🔥Atash🔥" },
    {
      name: "description",
      content: "The 🔥hottest🔥 full-stack Next.js template!",
    },
  ];
};

export const loader: LoaderFunction = (args) => rootAuthLoader(args);

export const ErrorBoundary = ClerkErrorBoundary();

function App() {
  return (
    <html
      data-theme="synthwave"
      lang="en"
      className="h-[100%] w-[100%] fixed overflow-y-auto"
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="h-[100%] w-[100%] fixed overflow-y-auto">
        <Header title={"Atash"} />
        <div className="flex flex-row items-center justify-center min-h-[calc(100%-114px)]">
          <Outlet />
        </div>
        <Footer />

        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export default ClerkApp(App);
