import { useParams, Navigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import ElementWise from "./ElementWise";
import MatMul from "./MatMul";
import Reshape from "./Reshape";
import Broadcasting from "./Broadcasting";
import Slicing from "./Slicing";
import Aggregation from "./Aggregation";
import Stacking from "./Stacking";
import Sorting from "./Sorting";
import Cumulative from "./Cumulative";
import { findLecture } from "../lectures";
import type { PageId } from "../store/useStore";

const PAGE_MAP: Record<PageId, React.FC> = {
  elementwise: ElementWise,
  matmul: MatMul,
  reshape: Reshape,
  broadcasting: Broadcasting,
  slicing: Slicing,
  aggregation: Aggregation,
  stacking: Stacking,
  sorting: Sorting,
  cumulative: Cumulative,
};

export default function Lecture() {
  const { slug, topic } = useParams<{ slug: string; topic?: string }>();
  const lecture = findLecture(slug);

  if (!lecture) return <Navigate to="/" replace />;

  const activeTopic = (topic && lecture.topics.includes(topic as PageId)
    ? (topic as PageId)
    : lecture.topics[0]);

  // If URL omits a topic, redirect to canonical first-topic URL.
  if (!topic) {
    return <Navigate to={`/v/${lecture.slug}/${activeTopic}`} replace />;
  }

  const Page = PAGE_MAP[activeTopic];

  return (
    <div className="flex h-full w-full">
      <Sidebar lecture={lecture} activeTopic={activeTopic} />
      <main className="flex-1 overflow-y-auto mesh-bg relative">
        <Page />
      </main>
    </div>
  );
}
