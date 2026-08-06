import "./globals.css";
import { Analytics } from "@vercel/analytics/react";

export const metadata = {
  title: "Steve Wong | Software Engineer & AI Researcher",
  description: "Portfolio of Steve Wong, incoming UIUC Computer Engineering student specializing in full-stack development, computer vision, and data science.",
  openGraph: {
    type: "website",
    images: ["/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600&family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
