import { Providers } from './providers'
import Footer from "./Footer";
import "./globals.css";
import RelayProvider from "./context/relay-provider.jsx";
import EventProvider from "./context/event-provider.jsx";
import KeysProvider from "./context/keys-provider.jsx";
// import Header from "./Header";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html data-color-mode="dark" lang="en">
      {/*
        <head /> will contain the components returned by the nearest parent
        head.tsx. Find out more at https://beta.nextjs.org/docs/api-reference/file-conventions/head
      */}
      <head />
      <body className="dark:bg-neutral-900 container p-6 m-auto md:max-w-[90%] 2xl:max-w-[70%]">
        <RelayProvider>
          <EventProvider>
            <KeysProvider>
              {/* <Header /> */}
              <Providers>
                {children}
              </Providers>
            </KeysProvider>
          </EventProvider>
        </RelayProvider>
        <Footer />
      </body>
    </html>
  );
}
