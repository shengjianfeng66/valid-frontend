import { ReactNode } from "react";

export default async function DefaultLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <>
      <main className="overflow-x-hidden">{children}</main>
    </>
  );
}
