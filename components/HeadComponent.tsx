import Head from "next/head";
import { useRouter } from "next/router";

import { BASE_URL } from "../constants/urls";

interface HeadComponentProps {
  title: string;
  description: string;
  imageUrl?: string;
  /**
   * Root-relative path for `og:url`, e.g. `/orgs/sifi`. Joined to BASE_URL
   * here, so no caller builds an absolute URL itself.
   *
   * Omit it to fall back to the current `asPath`. Only do that where the query
   * string belongs in the canonical URL - on a filtered list it does not, or
   * every crawlable permutation of the filters claims to be its own page. Pass
   * the literal path there.
   */
  path?: string;
  noIndex?: boolean;
}

const HeadComponent = ({
  title,
  description,
  imageUrl,
  path,
  noIndex = false,
}: HeadComponentProps) => {
  const router = useRouter();

  /* No origin configured means no og:url, not a relative one. A bare path in
     og:url is worse than an absent og:url, because a crawler resolves it
     against whatever origin it happened to find the page on. */
  const url = BASE_URL ? `${BASE_URL}${path ?? router.asPath}` : undefined;

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />

      {/* Meta tag to disable indexing by Google etc. */}
      {noIndex && <meta name="robots" content="noindex" />}

      {/* Twitter specific */}
      <meta name="twitter:card" content="summary" />

      {/* Open Graph Protocol */}
      <meta property="og:site_name" content="Peoply" />
      <meta property="og:title" content={title} />
      <meta property="og:type" content="website" />
      <meta property="og:description" content={description} />
      {url && <meta property="og:url" content={url} />}
      <meta property="og:image" content={imageUrl} />
    </Head>
  );
};

export default HeadComponent;
