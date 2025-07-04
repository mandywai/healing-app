'use client'

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { useEffect, useState } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [updateAvailable, setUpdateAvailable] = useState(false)

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(reg => {
        if (!reg) return

        reg.onupdatefound = () => {
          const newWorker = reg.installing
          if (newWorker) {
            newWorker.onstatechange = () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // 有新版本
                setUpdateAvailable(true)
              }
            }
          }
        }
      })
    }
  }, [])

  const reloadPage = () => {
    window.location.reload()
  }

  return (
    <html lang="zh-Hant">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icon-192x192.png" />
        <meta name="theme-color" content="#94d3ac" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Healing Reflection</title>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {updateAvailable && (
          <div
            className="bg-yellow-100 text-yellow-800 text-sm p-3 text-center cursor-pointer"
            onClick={reloadPage}
          >
            🔄 發現新版本，點我更新
          </div>
        )}
        {children}
      </body>
    </html>
  );
}

