import {
  serializeJsonLd,
  type JsonLdObject,
} from "@/lib/seo/jsonLd";

type StructuredDataProps = {
  data: JsonLdObject | JsonLdObject[];
  id?: string;
};

/**
 * Renders JSON-LD for search engines. Safe for Server Components.
 */
export default function StructuredData({
  data,
  id,
}: StructuredDataProps) {
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: serializeJsonLd(data),
      }}
    />
  );
}
