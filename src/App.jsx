import { useState } from "react";
import Navbar from "./components/Header/Navbar";
import CardDestaques from "./components/Cards/CardDestaque/CardDestaques";
import PageExplorar from "./pages/explorar/PageExplorar";
import PagePlanejar from "./pages/planejar/PagePlanejar";
import PageCultura from "./pages/cultura/PageCultura";

const pages = {
  explorar: PageExplorar,
  planejar: PagePlanejar,
  cultura: PageCultura,
};

function App() {
  const [activeTab, setActiveTab] = useState("explorar");
  const [filtrosBusca, setFiltrosBusca] = useState(null);
  const ActivePage = pages[activeTab];

  const handleSearch = (searchData) => {
    const temFiltro =
      searchData.categoria ||
      searchData.palavrasChave?.trim() ||
      searchData.horario?.start ||
      searchData.horario?.end ||
      searchData.horario?.period;

    setFiltrosBusca(temFiltro ? searchData : null);
  };

  return (
    <div>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <CardDestaques onSearch={handleSearch} />
      <main>
        <ActivePage filtrosBusca={filtrosBusca} />
      </main>
    </div>
  );
}

export default App;
