import Link from "next/link";
import styles from "../styles/utils.module.css";
import Image from "next/image";

export default function Header() {
  return (
    <header className={styles.navHeader}>
      <nav className={styles.nav}>
        <div className={styles.navContainer}>
          <div>
            <Link href="/">
              <Image
                src="/images/logo.png"
                alt="Amanda's Blog Logo"
                height={75}
                width={75}
              />
            </Link>
          </div>
          <div className={styles.navLinks}>
            <Link href="/posts" className={styles.navLink}>
              Blog
            </Link>
            <Link href="/about" className={styles.navLink}>
              About
            </Link>
            <Link href="/contact" className={styles.navLink}>
              Contact
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
