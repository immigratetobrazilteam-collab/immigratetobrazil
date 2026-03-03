type FaqSchemaItem = {
  question: string;
  answer: string;
};

type FaqSchemaProps = {
  items: FaqSchemaItem[];
};

export function FaqSchema({ items }: FaqSchemaProps) {
  if (!items.length) {
    return null;
  }

  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
