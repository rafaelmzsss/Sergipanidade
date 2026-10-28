import "./BotaoLantejoula.css";
import esquerda from "../../assets/lantejoulas/lantejoula_vermelha_esquerda.png";
import direita from "../../assets/lantejoulas/lantejoula_vermelha_direita.png";
import meio from "../../assets/lantejoulas/lantejoula_vermelha_meio.png";

// Prop 'desativado' com o valor padrão como false
function BotaoLantejoula({ texto, onClick, altura = "80px", largura = "auto", desativado = false }) {
  return (
    <button
      // Se desativado for true, o botão ganha a classe 'esta-desativado'
      className={`botao-lantejoula ${desativado ? "esta-desativado" : ""}`}
      onClick={desativado ? null : onClick}
      disabled={desativado}
      style={{ height: altura, minHeight: altura, width: largura }}
    >
      <img src={esquerda} className="lado esquerdo" alt="" />

      <div 
        className="meio"
        style={{ backgroundImage: `url(${meio})` }}
      >
        {texto}
      </div>

      <img src={direita} className="lado direito" alt="" />
    </button>
  );
}

export default BotaoLantejoula;