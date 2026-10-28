import { motion, LayoutGroup } from "framer-motion";
import styles from "./Navbar.module.css";
import logoImage from "../../assets/logos/Logo_vertical.png";

import lantVermelha from "../../assets/lantejoulas/latenjoula_vermelha.png";
import lantVerde from "../../assets/lantejoulas/lantejoula_verde.png";
import lantAzul from "../../assets/lantejoulas/lantejoula_azul.png";

const tabs = [
  { id: "explorar", label: "Explorar", icon: lantVermelha },
  { id: "planejar", label: "Planejar", icon: lantVerde },
  { id: "cultura",  label: "Cultura",  icon: lantAzul  },
];

export default function Navbar({ activeTab, setActiveTab }) {
  return (
    <>
      <nav className={styles.navbar}>

        {/* Logo */}
        <div className={styles.logo} onClick={() => { window.scrollTo(0, 0); setActiveTab("explorar"); }}>
          <img src={logoImage} alt="Sergipanidade" style={{ height: '40px', width: 'auto' }} />
        </div>

        {/* Abas */}
        <LayoutGroup>
        <div className={styles.tabs}>
          {tabs.map((tab) => (
            <motion.button
              layout
              key={tab.id}
              className={`${styles.tabBtn} ${activeTab === tab.id ? styles.active : ""}`}
              onClick={() => {
                window.scrollTo(0, 0);
                setActiveTab(tab.id);
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Ícone (Lantejoula) */}
              {activeTab === tab.id && (
                <motion.img 
                  layoutId="lantejoulaIcon"
                  src={tab.icon} 
                  alt="ícone" 
                  className={styles.lantejoula} 
                  initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                />
              )}
              <motion.span 
                layout
                animate={{ scale: activeTab === tab.id ? 1.05 : 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                {tab.label}
              </motion.span>
            </motion.button>
          ))}
        </div>
        </LayoutGroup>

        {/* Direita */}
        <div className={styles.right}>
          <button className={styles.cadastre}>Cadastre seu estabelecimento</button>
          <button className={styles.userBtn} title="Minha conta" aria-label="Minha conta">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                 stroke="#555" strokeWidth="1.8"
                 strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="4"/>
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
            </svg>
          </button>
        </div>

      </nav>
    </>
  );
}
