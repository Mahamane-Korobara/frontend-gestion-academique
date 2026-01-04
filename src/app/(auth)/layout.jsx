// Ce layout sert de "tunnel" : il laisse passer la page de login 
// sans lui ajouter de Sidebar ou d'éléments perturbateurs.

export default function AuthLayout({ children }) {
  return (
    <>
      {children} 
    </>
  );
}