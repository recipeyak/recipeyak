import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Recipe Yak",
  description: "A place to save, create, and share recipes.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="print:!bg-white">
      <head>
        <link
          rel="apple-touch-icon"
          href="https://recipeyak.imgix.net/recipeyak-logo-3x-white.png"
        />
        <style>
          {`
.no-script {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 1rem;
    font-family: charter, georgia;
    font-size: 2rem;
}`}
        </style>
      </head>
      <body>
        <noscript className="no-script">
          <section>
            <h1>Recipe Yak</h1>
            <p>You need to enable JavaScript to run this app.</p>
          </section>
        </noscript>
        <div id="root" className="flex h-full flex-col">
          {children}
        </div>
      </body>
    </html>
  )
}
