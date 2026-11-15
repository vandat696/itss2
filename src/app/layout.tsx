import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Compass } from "lucide-react";
import { Navigation } from "./navigation";
import "./styles.css";

export const metadata: Metadata = { title: "Michii · Hành trình nghề nghiệp", description: "Hiểu yêu cầu tuyển dụng và nhìn thấy tiến bộ của bạn." };
export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="vi"><body>
    <a className="skip-link" href="#main-content">Đến nội dung chính</a>
    <Navigation />
    <main className="shell" id="main-content">{children}</main>
    <footer><div className="shell footer-inner"><span><Compass size={16} /> Michii</span><span>Không gian nghề nghiệp dành cho sinh viên · Demo cá nhân</span></div></footer>
  </body></html>;
}
