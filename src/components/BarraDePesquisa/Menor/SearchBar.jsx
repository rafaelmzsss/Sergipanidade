import { useState, useRef, useEffect } from "react";
import "./SearchBar.css";
import lantejoulaImg from "./assets/lantejoula_vermelha.png";
import { Utensils, Wine, Coffee, Palmtree, Landmark, TreePine, MapPin, ChefHat, Soup, Pizza, Flame, Fish, UtensilsCrossed, Leaf, Camera, Ticket, BedDouble } from "lucide-react";

const CATEGORIAS = [
  {
    items: [
      { id: "alimentacao", label: "Alimentação", icon: <Utensils size={14} /> },
      { id: "turismo", label: "Turismo", icon: <Camera size={14} /> },
      { id: "natureza", label: "Natureza", icon: <TreePine size={14} /> },
      { id: "cultura", label: "Cultura", icon: <Landmark size={14} /> },
      { id: "lazer", label: "Lazer", icon: <Ticket size={14} /> },
      { id: "hospedagem", label: "Hospedagem", icon: <BedDouble size={14} /> },
    ]
  }
];

const SearchIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#ffffff"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%) rotate(90deg)",
      filter: "drop-shadow(-1px 2px 2px rgba(0,0,0,0.4))",
      pointerEvents: "none"
    }}
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const SearchButton = ({ onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: "50px",
        height: "50px",
        background: "transparent",
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 0,
        position: "relative",
        transition: "transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
        transform: isHovered ? "scale(1.1)" : "scale(1)",
        flexShrink: 0,
      }}
      aria-label="Buscar"
    >
      <img 
        src={lantejoulaImg} 
        alt="Fundo botão" 
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          transition: "filter 0.2s ease",
          filter: isHovered ? "drop-shadow(0px 6px 12px rgba(180,25,25,0.5))" : "none"
        }}
      />
      <SearchIcon />
    </button>
  );
};

// =============================================
// Dropdown Field (Categoria & Horário)
// =============================================
const DropdownField = ({ label, value, onChange, options, placeholder, variant = "list", dropdownWidth = "360px", flex = 1 }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Encontra o item selecionado para exibir no input
  let selectedItem = null;
  for (const group of options) {
    const found = group.items.find(item => item.id === value);
    if (found) {
      selectedItem = found;
      break;
    }
  }

  return (
    <div
      ref={dropdownRef}
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: "4px",
        flex: flex,
        height: "70px",
        minWidth: 0,
        cursor: "pointer",
        paddingLeft: "41px",
        paddingRight: "16px",
        position: "relative",
      }}
      onClick={() => setIsOpen(!isOpen)}
    >
      <span
        style={{
          fontSize: "14px",
          fontWeight: "700",
          color: "#1a1a1a",
          fontFamily: "'Inter', sans-serif",
          userSelect: "none",
        }}
      >
        {label}
      </span>
      
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span
          style={{
            fontSize: "14px",
            color: "#565656",
            fontFamily: "'Inter', sans-serif",
            fontWeight: "700",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis"
          }}
        >
          {selectedItem ? selectedItem.label : placeholder}
        </span>
      </div>

      {/* Menu Dropdown - Glassmorphism Tropical */}
      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()} // Evita fechar ao clicar dentro do menu
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: "41px", // Alinhado perfeitamente com o texto
            width: dropdownWidth,
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            borderRadius: "24px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04)",
            padding: "24px",
            zIndex: 100,
            maxHeight: "450px",
            overflowY: "auto",
            overflowX: "hidden",
            border: "1px solid #e8e8e8",
            animation: "dropdown 0.18s ease forwards",
            cursor: "default"
          }}
        >
          {options.map((group, gIndex) => (
            <div key={gIndex} style={{ marginBottom: gIndex === options.length - 1 ? 0 : "32px" }}>
              {group.group && (
                <div style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#1a1a1a", // Destaque escuro neutro
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  padding: "0 4px",
                  marginBottom: "12px",
                  fontFamily: "'Inter', sans-serif",
                  display: "flex",
                  alignItems: "center"
                }}>
                  {group.groupIcon}
                  {group.group}
                </div>
              )}
              <div style={{ 
                display: variant === "pills" ? "grid" : "flex", 
                flexDirection: variant === "pills" ? undefined : "column", 
                gridTemplateColumns: variant === "pills" ? "1fr 1fr" : undefined,
                gap: variant === "pills" ? "8px" : "2px",
                padding: "0" 
              }}>
                {group.items.map(item => {
                  const isSelected = value === item.id;

                  if (variant === "pills") {
                    return (
                      <div
                        key={item.id}
                        className={`dropdown-item-pill ${isSelected ? 'selected' : ''}`}
                        onClick={() => {
                          onChange(item.id);
                          setIsOpen(false);
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "8px",
                          height: "40px",
                          padding: "0 16px",
                          width: "100%",
                          boxSizing: "border-box",
                          cursor: "pointer",
                          background: isSelected ? "#E4E4E7" : "#F4F4F5",
                          border: isSelected ? "1px solid #71717A" : "1px solid #E4E4E7",
                          borderRadius: "999px",
                          transition: "all 0.15s ease",
                          color: isSelected ? "#18181B" : "#4B5563",
                          fontSize: "12px",
                          fontWeight: isSelected ? "600" : "500",
                          fontFamily: "'Inter', sans-serif",
                          boxShadow: isSelected ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
                          textAlign: "center"
                        }}
                      >
                        {item.icon && <span style={{ display: "flex", alignItems: "center" }}>{item.icon}</span>}
                        {item.label}
                      </div>
                    );
                  }

                  return (
                    <div
                      key={item.id}
                      className={`dropdown-item ${isSelected ? 'selected' : ''}`}
                      onClick={() => {
                        onChange(item.id);
                        setIsOpen(false);
                      }}
                    >
                      <span className="dropdown-item-icon">
                        {item.icon}
                      </span>
                      <span className="dropdown-item-text">
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Botão de Limpar */}
          {value && (
            <>
              <div style={{ height: "1px", background: "rgba(233,223,200,0.5)", margin: "24px 0 16px 0" }} />
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <div
                  className="dropdown-item-clear"
                  onClick={() => {
                    onChange("");
                    setIsOpen(false);
                  }}
                  style={{
                    padding: "4px 8px",
                    cursor: "pointer",
                    display: "inline-block",
                    color: "#888888",
                    fontSize: "12px",
                    fontWeight: "500",
                    fontFamily: "'Inter', sans-serif",
                    textDecoration: "none",
                    transition: "all 0.2s ease",
                  }}
                >
                  Limpar filtros
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

// =============================================
// Campo de filtro de texto livre (Palavras-chave)
// =============================================
const TextField = ({ label, value, onChange, placeholder = "Pesquise", flex = 1 }) => {
  const inputRef = useRef(null);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: "4px",
        flex: flex,
        height: "70px",
        minWidth: 0,
        cursor: "text",
        paddingLeft: "41px",
        paddingRight: "16px",
      }}
      onClick={() => inputRef.current?.focus()}
    >
      <span
        style={{
          fontSize: "14px",
          fontWeight: "700",
          color: "#1a1a1a",
          fontFamily: "'Inter', sans-serif",
          userSelect: "none",
        }}
      >
        {label}
      </span>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="search-input"
        style={{
          border: "none",
          outline: "none",
          background: "transparent",
          fontSize: "14px",
          color: "#565656",
          fontFamily: "'Inter', sans-serif",
          fontWeight: "700",
          padding: 0,
          margin: 0,
          width: "100%",
        }}
      />
    </div>
  );
};

const Divider = () => (
  <div
    style={{
      width: "1px",
      height: "32px",
      background: "#e0e0e0",
      flexShrink: 0,
      alignSelf: "center",
    }}
  />
);

// =============================================
// COMPONENTE PRINCIPAL — SearchBar
// =============================================
export default function SearchBar({ 
  // Funções (props) que serão passadas pelo componente pai (ex: a página principal)
  // para receber os dados da busca e conectar com o banco de dados ou backend.
  onSearch, 
  onCategoryChange, 
  onKeywordChange 
}) {
  // =============================================
  // VARIÁVEIS DE ESTADO (ARMAZENAMENTO DE DADOS)
  // =============================================
  // Estas variáveis guardam as informações de cada parte da barra de pesquisa.
  // Quando o usuário interage, os dados ficam salvos aqui para uso posterior.
  const [categoria, setCategoria] = useState("");
  const [palavrasChave, setPalavrasChave] = useState("");
  
  // Variável reservada para guardar outra informação futura (para continuidade do código)
  const [informacaoExtra, setInformacaoExtra] = useState("");

  // Função chamada ao clicar na Lupa de pesquisa
  const handleSearch = () => {
    // Objeto contendo todos os dados prontos para enviar para o backend
    const searchData = { 
      categoria, 
      palavrasChave,
      informacaoExtra // Enviando a informação extra junto na busca
    };
    console.log("Busca disparada com:", searchData);
    
    // Se o desenvolvedor conectou a função onSearch, envia os dados para ela
    if (onSearch) {
      onSearch(searchData);
    }
  };

  const handleCategoriaChange = (val) => {
    setCategoria(val);
    if (onCategoryChange) onCategoryChange(val); // Dispara evento ao mudar a categoria
  };

  const handlePalavrasChaveChange = (val) => {
    setPalavrasChave(val);
    if (onKeywordChange) onKeywordChange(val); // Dispara evento ao digitar
  };

  return (
    <>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 10px 0 0",
          background: "#ffffff",
          borderRadius: "35px",
          border: "0.5px solid black",
          boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
          width: "754px",
          height: "70px",
          boxSizing: "border-box",
          fontFamily: "'Inter', sans-serif",
          position: "relative"
        }}
      >
        <DropdownField 
          label="Categoria" 
          value={categoria} 
          onChange={handleCategoriaChange} 
          options={CATEGORIAS}
          placeholder="Pesquise"
          variant="list"
          dropdownWidth="260px"
          flex={0.8}
        />
        <Divider />
        <TextField 
          label="Palavras-chave" 
          value={palavrasChave} 
          onChange={handlePalavrasChaveChange}
          placeholder="Pesquise" 
          flex={2.2}
        />

        <SearchButton onClick={handleSearch} />
      </div>
    </>
  );
}
