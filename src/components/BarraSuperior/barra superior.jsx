import { useState, useEffect } from "react";
import "./barra superior.css";

// ============================================================
// ÍCONES SVG inline (sem dependências externas)
// ============================================================
const IconEdit = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);

const IconSend = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="22" y1="2" x2="11" y2="13" />
        <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
);

const IconHeart = ({ filled }) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
);

const IconClose = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
/**
 * TitleBar — barra de título reutilizável
 *
 * Props:
 *  title          {string}   — texto exibido na barra
 *  onTitleChange  {fn}       — chamado com o novo título ao editar
 *  onSend         {fn|null}  — handler do botão enviar (null = desativado)
 *  onFavorite     {fn|null}  — handler do botão coração (null = desativado)
 *  isFavorited    {bool}     — estado preenchido do coração
 *  onClose        {fn|null}  — handler do botão fechar (null = desativado)
 *  editable       {bool}     — permite editar o título inline (padrão: true)
 */
export default function TitleBar({
    title = "Título",
    onTitleChange,
    
    // Funções de clique
    onSend,
    onFavorite,
    onClose,
    isFavorited = false,
    
    // Controle prático de visibilidade (ativa ou desativa o botão)
    showEdit = true,
    showSend = true,
    showFavorite = true,
    showClose = true,
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [localTitle, setLocalTitle] = useState(title);
    const [originalTitle, setOriginalTitle] = useState(title);

    // Mantém o TitleBar sincronizado de forma performática (render phase update)
    const [prevTitle, setPrevTitle] = useState(title);
    if (title !== prevTitle) {
        setPrevTitle(title);
        setLocalTitle(title);
    }

    const handleEditClick = () => {
        if (!showEdit) return;
        setOriginalTitle(title);
        setIsEditing(true);
    };

    const handleBlur = () => {
        setIsEditing(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            setIsEditing(false);
        }
        if (e.key === "Escape") {
            setIsEditing(false);
            setLocalTitle(originalTitle); 
            onTitleChange?.(originalTitle); // reverte
        }
    };

    return (
        <>

            <div className="tb-root">
                {/* Área do título */}
                {isEditing ? (
                    <input
                        className="tb-input"
                        value={localTitle}
                        autoFocus
                        onChange={(e) => {
                            setLocalTitle(e.target.value);
                            onTitleChange?.(e.target.value);
                        }}
                        onBlur={handleBlur}
                        onKeyDown={handleKeyDown}
                    />
                ) : (
                    <span className="tb-title" onDoubleClick={handleEditClick} title={localTitle}>
                        {localTitle}
                    </span>
                )}



                {/* Botão editar lápis */}
                {showEdit && (
                    <button
                        className="tb-btn"
                        title="Editar título"
                        onClick={handleEditClick}
                    >
                        <IconEdit />
                    </button>
                )}

                {/* Botão enviar */}
                {showSend && (
                    <button
                        className="tb-btn"
                        title="Enviar"
                        disabled={onSend == null}
                        onClick={() => onSend?.()}
                    >
                        <IconSend />
                    </button>
                )}

                {/* Botão favorito / coração */}
                {showFavorite && (
                    <button
                        className={`tb-btn tb-btn-fav${isFavorited ? " active" : ""}`}
                        title={isFavorited ? "Remover dos favoritos" : "Favoritar"}
                        disabled={onFavorite == null}
                        onClick={() => onFavorite?.()}
                    >
                        <IconHeart filled={isFavorited} />
                    </button>
                )}

                {/* Botão fechar */}
                {showClose && (
                    <button
                        className="tb-btn tb-btn-close"
                        title="Fechar"
                        disabled={onClose == null}
                        onClick={() => onClose?.()}
                    >
                        <IconClose />
                    </button>
                )}
            </div>
        </>
    );
}

// ============================================================
// DEMO — remova ao integrar no seu projeto
// ============================================================
export function TitleBarDemo() {
    const [title, setTitle] = useState("Título");
    const [fav, setFav] = useState(false);

    return (
        <div style={{ padding: 40, background: "#f5f5f5", minHeight: "100vh" }}>
            <TitleBar
                title={title}
                onTitleChange={setTitle}
                showEdit={true}
                showSend={true}
                showFavorite={true}
                showClose={true}
                onSend={() => {}}
                onFavorite={() => setFav(!fav)}
                isFavorited={fav}
                onClose={() => {}}
            />
        </div>
    );
}