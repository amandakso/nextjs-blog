import Link from "next/link";

export default function Header() {
  return (
    <header>
      <nav>
        <div>
          <Link href="/">Amanda's Blog Site</Link>
        </div>
        <div>
          <Link href="/">Blog</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
        </div>
      </nav>
    </header>
  );
}
