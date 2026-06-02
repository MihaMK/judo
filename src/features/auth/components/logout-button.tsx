import { LogOut } from "lucide-react";
import { signOut } from "@/features/auth/server/actions";
import { mk } from "@/shared/i18n/mk";

export function LogoutButton() {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="inline-flex min-h-9 items-center justify-center gap-2 rounded-button border border-current/15 px-3 text-xs font-semibold text-current/75 transition-colors duration-ui hover:bg-current/10 hover:text-current focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
      >
        <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
        {mk.auth.logout}
      </button>
    </form>
  );
}
