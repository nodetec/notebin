import Footer from "./Footer";
import "./globals.css";
import Providers from "./context/providers.jsx";
import Header from "./Header";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      data-color-mode="dark"
      lang="en"
      className="dark font-sans min-h-screen"
    >
      {/*
        <head /> will contain the components returned by the nearest parent
        head.tsx. Find out more at https://beta.nextjs.org/docs/api-reference/file-conventions/head
      */}
      <head />
      <body className="bg-primary flex flex-col container p-6 m-auto md:max-w-[90%] 2xl:max-w-[80%] min-h-screen">
        <Providers>
          <Header />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
