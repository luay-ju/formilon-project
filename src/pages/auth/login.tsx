import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { FaSpinner } from "react-icons/fa6";
import { useForm } from "react-hook-form";

type AuthFormData = {
  name?: string;
  email: string;
  password: string;
};

export default function AuthPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthFormData>({
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
  });

  async function onSubmit(formData: AuthFormData) {
    setIsLoading(true);
    setError("");

    try {
      if (isSignUp) {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || "Registrierung fehlgeschlagen");
        }
      }

      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Ungültige E-Mail oder Passwort");
        return;
      }

      router.push("/");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Ein Fehler ist aufgetreten"
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center bg-background">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {isSignUp ? "Konto erstellen" : "Willkommen zurück"}
          </h1>
          <p className="text-sm text-htw-gray">
            {isSignUp
              ? "Geben Sie Ihre Daten ein, um Ihr Konto zu erstellen"
              : "Geben Sie Ihre E-Mail ein, um sich anzumelden"}
          </p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-2">
            <div className="grid gap-1">
              {isSignUp && (
                <div className="space-y-1">
                  <label htmlFor="name" className="sr-only">
                    Name
                  </label>
                  <input
                    {...register("name", { required: isSignUp })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder="Ihr Name"
                    disabled={isLoading}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">
                      Name wird benötigt
                    </p>
                  )}
                </div>
              )}
              <div className="space-y-1">
                <label htmlFor="email" className="sr-only">
                  E-Mail
                </label>
                <input
                  {...register("email", {
                    required: true,
                    pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  type="email"
                  placeholder="name@beispiel.de"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect="off"
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">
                    Bitte geben Sie eine gültige E-Mail-Adresse ein
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <label htmlFor="password" className="sr-only">
                  Passwort
                </label>
                <input
                  {...register("password", {
                    required: true,
                    minLength: 6,
                  })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  type="password"
                  placeholder="Passwort"
                  autoComplete="current-password"
                  disabled={isLoading}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">
                    Passwort muss mindestens 6 Zeichen lang sein
                  </p>
                )}
              </div>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-md bg-htw-green px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-htw-green/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading && <FaSpinner className="mr-2 h-4 w-4 animate-spin" />}
              {isSignUp ? "Registrieren" : "Anmelden"}
            </button>
          </div>
        </form>
        <div className="text-center text-sm">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-htw-blue hover:text-htw-blue/80 underline"
          >
            {isSignUp
              ? "Bereits ein Konto? Jetzt anmelden"
              : "Noch kein Konto? Jetzt registrieren"}
          </button>
        </div>
      </div>
    </div>
  );
}
