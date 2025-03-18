import { LogOut } from "lucide-react";
import { logout } from "../services/auth";

function Logout() {
  return (
    <button
      className="flex items-center justify-center cursor-pointer rounded-full p-2 transition hover:bg-neutral-800 hover:text-white active:bg-neutral-800 active:text-white"
      onClick={logout}
    >
      <LogOut />
    </button>
  );
}

export default Logout;
