"use client";

import Link from "next/link";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return <section className="card stack"><h1>Chưa thể tải dữ liệu</h1><p className="muted">Hãy kiểm tra cơ sở dữ liệu hoặc thử lại sau.</p><div className="actions"><button className="button primary" onClick={reset}>Thử lại</button><Link className="button secondary" href="/journey">Về hành trình</Link></div></section>;
}
