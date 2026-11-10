"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, BriefcaseBusiness, Compass, Route, UserRound } from "lucide-react";

const links = [
  { href: "/journey", label: "Hành trình", icon: Route },
  { href: "/jobs", label: "Tuyển dụng", icon: BriefcaseBusiness },
  { href: "/profile", label: "Hồ sơ", icon: UserRound },
];
export function Navigation() {
  const path = usePathname();
  return <div className="topbar"><div className="shell topbar-inner">
    <Link className="brand" href="/"><span className="brand-icon"><Compass size={23} /></span><span>Bước Nhỏ<small>HƯỚNG NGHIỆP SINH VIÊN</small></span></Link>
    <nav aria-label="Điều hướng chính">{links.map(({ href, label, icon: Icon }) => {
      const active = path.startsWith(href) || (href === "/journey" && path.startsWith("/milestones"));
      return <Link key={href} href={href} aria-current={active ? "page" : undefined}><Icon size={16} />{label}</Link>;
    })}</nav>
    <span className="demo"><ArrowUpRight size={14} /> Bản demo</span>
  </div></div>;
}
