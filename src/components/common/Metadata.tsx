import React from 'react';
import { Helmet } from 'react-helmet-async';

interface MetadataProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
}

export const Metadata: React.FC<MetadataProps> = ({
  title = 'Naija Snacks - Authentic Nigerian Snacks Delivered Fresh',
  description = 'Order authentic Nigerian snacks like Puff-Puff, Chin Chin, Meat Pie, and Suya. Freshly made and delivered warm to your doorstep in 30 mins.',
  keywords = 'Nigerian snacks, Naija snacks, Puff-Puff, Chin Chin, Meat Pie, Suya',
  image = 'https://naijasnacks.ng/og-image.jpg',
  url = 'https://naijasnacks.ng/',
  type = 'website',
  publishedTime,
  modifiedTime,
  author = 'Naija Snacks Team',
}) => {
  const siteName = 'Naija Snacks';
  const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;

  return (
    <Helmet>
      {/* Basic */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Extra */}
      <link rel="canonical" href={url} />
      <meta name="robots" content="index, follow" />
    </Helmet>
  );
};

export default Metadata;