export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto h-screen w-full">
      <div className="grid h-screen w-full grid-rows-2">
        <div className="flex flex-col items-center justify-center">
          {children}
        </div>
      </div>
    </div>
  );
}
