import { FC } from "react";
import { MdDashboard, MdLogout } from "react-icons/md";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
}

const NavItem: FC<NavItemProps> = ({ href, icon, label, isActive }) => (
  <Link
    href={href}
    className={`
      flex items-center gap-3 px-4 py-3 rounded-md transition-colors
      hover:bg-secondary/60
      ${
        isActive
          ? "bg-primary/10 text-primary font-medium"
          : "text-muted-foreground"
      }
    `}
  >
    <span className="text-xl">{icon}</span>
    <span>{label}</span>
  </Link>
);

const SideBar: FC = () => {
  const pathname = usePathname();

  const navItems = [
    { href: "/", icon: <MdDashboard />, label: "Arbeitsbereich" },
  ];

  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: "/auth/signin" });
    } catch (error) {
      console.error("Fehler beim Abmelden:", error);
    }
  };

  return (
    <aside className="w-64 h-screen bg-background border-r px-3 py-6 flex flex-col">
      {/* Logo/Brand */}
      <div className="px-4 mb-8">
        <h1 className="text-xl font-bold text-primary">Formilon</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <NavItem
            key={item.href}
            {...item}
            isActive={pathname === item.href}
          />
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="border-t pt-4 mt-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-destructive hover:bg-destructive/10 rounded-md transition-colors"
        >
          <MdLogout className="text-xl" />
          <span>Abmelden</span>
        </button>
      </div>
    </aside>
  );
};

export default SideBar;
