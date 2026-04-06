import Link from 'next/link';
import styles from './Sidebar.module.css';

export default function Sidebar() {
  return (
    <div className={styles.sidebar}>
      <div className={styles.logo}>
        <div className={styles.logoIcon}></div>
        <div className={styles.logoText}>店長ブログMaker</div>
      </div>
      
      <nav className={styles.nav}>
        <div className={styles.navSection}>
          <div className={styles.navLabel}>メインメニュー</div>
          <Link href="/keywords" className={styles.navLink}>
            キーワード管理
          </Link>
          <Link href="/articles" className={styles.navLink}>
            記事一覧
          </Link>
        </div>
      </nav>

      <div className={styles.footer}>
        <div className={styles.projectInfo}>
          <div className={styles.projectName}>Sample Store Tokyo</div>
          <div className={styles.projectRole}>店長 / 管理者</div>
        </div>
      </div>
    </div>
  );
}
