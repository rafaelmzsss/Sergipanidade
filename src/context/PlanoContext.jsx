import { createContext, useContext, useState } from "react";
import { planoMockParaContexto } from "../mock/planos/planos";

export const PLANO_INICIAL = {
  titulo: "",
  descricao: "",
  criador: "",
  turno: "",
  tamanhoGrupo: "",
  local: "",
  preco: "",
  tags: [],
  fotoCapa: null,
  fotoCapaUrl: "",
  fotoLocal: null,
  fotoLocalUrl: "",
  comentario: "",
  avaliacao: 5,
  publicado: false,
  dataCriacao: null,
};

/**
 * PlanoContext — estado global do plano em construção.
 * Compartilhado entre ModalLinhaDoTempo e PersonalizarPlano.
 */
const PlanoContext = createContext(null);

export function PlanoProvider({ children }) {
  const [atividades, setAtividades] = useState([]);
  const [plano, setPlano] = useState(PLANO_INICIAL);

  const atualizarPlano = (campos) =>
    setPlano((prev) => ({ ...prev, ...campos }));

  const resetPlano = () => {
    setPlano(PLANO_INICIAL);
    setAtividades([]);
  };

  const carregarPlanoMock = (planoId) => {
    const dados = planoMockParaContexto(planoId);
    if (!dados) return false;

    setPlano(dados.plano);
    setAtividades(dados.atividades);
    return true;
  };

  return (
    <PlanoContext.Provider
      value={{
        atividades,
        setAtividades,
        plano,
        atualizarPlano,
        resetPlano,
        carregarPlanoMock,
      }}
    >
      {children}
    </PlanoContext.Provider>
  );
}

export function usePlano() {
  const ctx = useContext(PlanoContext);
  if (!ctx) throw new Error("usePlano deve ser usado dentro de <PlanoProvider>");
  return ctx;
}
