export const metadata = {
  title: "ProAir Tools",
  description: "ProAir room sizing calculator",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
