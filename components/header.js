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
          <Link href="/">About</Link>
          <Link href="/">Contact</Link>
        </div>
      </nav>
    </header>
  );
}
