import Head from "next/head";

interface HeadComponentProps {
  title: string;
  description: string;
  imageUrl?: string;
  url: string;
}

const HeadComponent = ({
  title,
  description,
  imageUrl,
  url,
}: HeadComponentProps) => {
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />

      {/* Twitter specific */}
      <meta name="twitter:card" content="summary" />

      {/* Open Graph Protocol */}
      <meta property="og:site_name" content="Peoply" />
      <meta property="og:title" content={title} />
      <meta property="og:type" content="website" />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={imageUrl} />
    </Head>
  );
};

export default HeadComponent;
