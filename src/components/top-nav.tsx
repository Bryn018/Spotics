import Link from "next/link";

export default function TopNav() {
  const links = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/analytics", label: "Analytics" },
    { href: "/history", label: "History" },
  ];

  return (
    <nav className="mb-8 flex flex-wrap items-center gap-3">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/75 transition hover:bg-white/8"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
