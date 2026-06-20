import './globals.css'
import { Providers } from './providers'

export const metadata = {
  title: 'ScrapValue · Turn Trash Into Value',
  description:
    'AI-powered material recognition that rewards sustainable action. Earth-friendly. Future-ready. ScrapValue transforms waste into opportunity.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#10b981" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          dangerouslySetInnerHTML={{
            __html:
              'window.addEventListener("error",function(e){if(e.error instanceof DOMException&&e.error.name==="DataCloneError"&&e.message&&e.message.includes("PerformanceServerTiming")){e.stopImmediatePropagation();e.preventDefault()}},true);',
          }}
        />
      </head>
      <body className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}