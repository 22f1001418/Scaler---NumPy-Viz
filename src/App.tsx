import { useStore } from "./store/useStore";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import ElementWise from "./pages/ElementWise";
import MatMul from "./pages/MatMul";
import Reshape from "./pages/Reshape";
import Broadcasting from "./pages/Broadcasting";
import Slicing from "./pages/Slicing";
import Aggregation from "./pages/Aggregation";
import Stacking from "./pages/Stacking";
import Sorting from "./pages/Sorting";
import Cumulative from "./pages/Cumulative";

const PAGE_MAP: Record<string, React.FC> = {
  home: Home, elementwise: ElementWise, matmul: MatMul, reshape: Reshape,
  broadcasting: Broadcasting, slicing: Slicing, aggregation: Aggregation,
  stacking: Stacking, sorting: Sorting, cumulative: Cumulative,
};

export default function App() {
  const { page } = useStore();
  const Page = PAGE_MAP[page] ?? Home;
  return (
    <div className="flex h-full w-full">
      <Sidebar />
      <main className="flex-1 overflow-y-auto mesh-bg relative">
        <Page />
      </main>
    </div>
  );
}
