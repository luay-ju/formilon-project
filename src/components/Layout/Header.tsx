import { FC } from "react";
import { LuCirclePlus } from "react-icons/lu";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

const Header: FC = () => {
  const router = useRouter();
  const { data: session } = useSession();

  const handleCreateForm = async () => {
    try {
      if (!session) {
        router.push("/auth/signin");
        return;
      }

      const response = await fetch("/api/forms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Formular konnte nicht erstellt werden");
      }

      const form = await response.json();
      router.push(`/f/${form.id}`);
    } catch (error) {
      console.error("Fehler beim Erstellen des Formulars:", error);
      // You might want to show a toast notification here
    }
  };

  return (
    <header className="border-b border-border bg-background">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Actions */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleCreateForm}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            <LuCirclePlus size={18} />
            Neues Formular
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
