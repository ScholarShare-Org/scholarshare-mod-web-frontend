import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConfigProvider, App } from "antd";
import StyledComponentsRegistry from "@/lib/antd-registry";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ScholarShare Mod Portal",
  description: "Internal portal for managing student opportunities",
  icons: {
    icon: "/LOGO_ICON-transparent.png",
    apple: "/LOGO_ICON-transparent.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <StyledComponentsRegistry>
          <ConfigProvider
            theme={{
              token: {
                colorPrimary: '#1890ff',
                borderRadius: 6
              }
            }}
          >
            <App>
              {children}
            </App>
          </ConfigProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
