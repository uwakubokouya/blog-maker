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
          <Link href="/" className={styles.navLink}>
            ダッシュボード
          </Link>
          <Link href="/keywords" className={styles.navLink}>
            キーワード管理
          </Link>
          <Link href="/articles" className={styles.navLink}>
            記事一覧
          </Link>
        </div>

        <div className={styles.navSection}>
          <div className={styles.navLabel}>記事作成</div>
          <Link href="/articles/create" className={`${styles.navLink} ${styles.navLinkPrimary}`}>
            + 新規記事を作成
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
