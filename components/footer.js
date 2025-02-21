import styles from "../styles/utils.module.css";
export default function Footer() {
  return (
    <footer>
      <div className={styles.footerContainer}>
        <div className={styles.footerText}>
          <p>© {new Date().getFullYear()}</p>
        </div>
      </div>
    </footer>
  );
}
