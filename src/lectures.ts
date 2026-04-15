import type { PageId } from "./store/useStore";

export interface LectureConfig {
  slug: string;          // random URL slug
  title: string;         // display title
  subtitle: string;      // short tagline for breadcrumb / header
  topics: PageId[];      // ordered list of visualization topics covered
}

/**
 * Each lecture is served at `/v/<slug>`.
 * Slugs are intentionally opaque (non-guessable) so they can be
 * shared directly with learners without exposing "lecture-1/2/3"
 * style enumeration.
 */
export const LECTURES: LectureConfig[] = [
  {
    slug: "fd-k7q2x9m4",
    title: "Food Delivery EDA — I",
    subtitle: "Arrays, dimensions & slicing",
    topics: ["slicing"],
  },
  {
    slug: "fd-r8w5n3p2",
    title: "Food Delivery EDA — II",
    subtitle: "Shape, stats & sorting",
    topics: ["elementwise", "reshape", "aggregation", "sorting"],
  },
  {
    slug: "fd-z1y6t8h5",
    title: "Food Delivery EDA — III",
    subtitle: "Matrix multiply, broadcasting & splitting",
    topics: ["matmul", "broadcasting", "stacking"],
  },
];

export function findLecture(slug: string | undefined): LectureConfig | undefined {
  return LECTURES.find((l) => l.slug === slug);
}
