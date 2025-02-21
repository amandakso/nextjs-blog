import Link from "next/link";
import styles from "../styles/utils.module.css";

export default function Header() {
  return (
    <header className={styles.navHeader}>
      <nav className={styles.nav}>
        <div className={styles.navContainer}>
          <div>
            <Link href="/">Amanda's Blog Site</Link>
          </div>
          <div className={styles.navLinks}>
            <Link href="/" className={styles.navLink}>
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
