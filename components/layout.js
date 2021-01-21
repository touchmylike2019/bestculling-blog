import Head from 'next/head'
import styles from './layout.module.css'
import utilStyles from '../styles/utils.module.css'
import Link from 'next/link'

const name = '- Bestculling -'
export const siteTitle = 'Next.js Sample Website'

export default function Layout({ children, home }) {
    return (
        <div className={styles.container}>
            <Head>
                <link rel="icon" href="/favicon.ico" />
                <meta
                    name="description"
                    content="Learn how to build a personal website using Next.js"
                />
                <meta
                    property="og:image"
                    content={`https://og-image.now.sh/${encodeURI(
                        siteTitle
                    )}.png?theme=light&md=0&fontSize=75px&images=https%3A%2F%2Fassets.zeit.co%2Fimage%2Fupload%2Ffront%2Fassets%2Fdesign%2Fnextjs-black-logo.svg`}
                />
                <meta name="og:title" content={siteTitle} />
                <meta name="twitter:card" content="summary_large_image" />
                <link
                    href="//netdna.bootstrapcdn.com/font-awesome/4.0.3/css/font-awesome.min.css"
                    rel="stylesheet">
                </link>
                <link
                    rel="preload"
                    href="https://unpkg.com/prismjs@0.0.1/themes/prism-tomorrow.css"
                    as="script"
                />
                <link
                    rel="preload"
                    href="https://unpkg.com/prismjs@0.0.1/themes/prism-coy.css"
                    as="script"
                />
                <link
                    rel="preload"
                    href="https://unpkg.com/prismjs@0.0.1/themes/prism-okaidia.css"
                    as="script"
                />
                <link
                    rel="preload"
                    href="https://unpkg.com/prismjs@0.0.1/themes/prism-funky.css"
                    as="script"
                />
                <link
                    href={`https://unpkg.com/prismjs@0.0.1/themes/prism-tomorrow.css`}
                    rel="stylesheet"
                />
            </Head>
            <header className={styles.header}>
                {home ? (
                    <>
                        <img
                            src="/images/new_avatar.jpg"
                            className={`${styles.headerHomeImage} ${utilStyles.borderCircle}`}
                            alt={name}
                        />
                        <h1 className={utilStyles.heading2Xl}>{name}</h1>
                        <div className="social">
                            <a href="https://github.com/touchmylike2019" className="link github" target="_parent"><span className="fa fa-github-square"></span></a>
                        </div>
                    </>
                ) : (
                        <>
                            <Link href="/">
                                <a>
                                    <img
                                        src="/images/new_avatar.jpg"
                                        className={`${styles.headerImage} ${utilStyles.borderCircle}`}
                                        alt={name}
                                    />
                                </a>
                            </Link>
                            <h2 className={utilStyles.headingLg}>
                                <Link href="/">
                                    <a className={utilStyles.colorInherit}>{name}</a>
                                </Link>
                            </h2>
                        </>
                    )}
            </header>
            <main>{children}</main>
            {!home && (
                <div className={styles.backToHome}>
                    <Link href="/">
                        <a>← Back to home</a>
                    </Link>
                </div>
            )}
        </div>
    )
}
