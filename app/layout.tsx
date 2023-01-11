import Footer from "./Footer";
import "./globals.css";
import Header from "./Header";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html className="dark" lang="en">
      {/*
        <head /> will contain the components returned by the nearest parent
        head.tsx. Find out more at https://beta.nextjs.org/docs/api-reference/file-conventions/head
      */}
      <head />
      <body className="dark:bg-slate-900 container p-6 m-auto md:max-w-[90%] 2xl:max-w-[50%]">
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
