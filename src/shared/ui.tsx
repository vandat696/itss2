import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

export function Back({ href = "/journey", children = "Về hành trình" }: { href?: string; children?: ReactNode }) {
  return <Link className="back" href={href}><ArrowLeft size={15} />{children}</Link>;
}
export function Heading({ japanese, title, children, action }: { japanese: string; title: string; children: ReactNode; action?: ReactNode }) {
  return <header className="page-heading">
    <div><p className="eyebrow" lang="ja">{japanese}</p><h1>{title}</h1><p className="intro">{children}</p></div>
    {action}
  </header>;
}
export function SectionTitle({ children, detail }: { children: ReactNode; detail?: string }) {
  return <div className="section-title"><h2>{children}</h2>{detail && <p>{detail}</p>}</div>;
}
export function Field({ label, children, help }: { label: string; children: ReactNode; help?: string }) {
  return <label className="field"><span>{label}</span>{children}{help && <small>{help}</small>}</label>;
}
export function Empty({ title, children }: { title: string; children: ReactNode }) {
  return <div className="empty"><strong>{title}</strong><div>{children}</div></div>;
}
export function RowLink({ href, title, detail, badge }: { href: string; title: string; detail: string; badge?: ReactNode }) {
  return <Link className="row-link" href={href}><div><strong>{title}</strong><small>{detail}</small></div>{badge}<ChevronRight size={17} /></Link>;
}
export const dateLabel = (date: Date) => new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeZone: "Asia/Bangkok" }).format(date);
