import React from "react";
import { useStore } from "../store/useStore";

function AuthButton() {
  const { user, logout } = useStore();

  const handleLogin = () => {
    window.location.href = "http://localhost:3000/auth/github";
  };

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <img src={user.avatar_url} alt={user.login} className="w-8 h-8 rounded-full border" />
        <span className="text-sm font-semibold hidden sm:block">{user.login}</span>
        <button onClick={logout} className="text-xs text-red-600 hover:underline">
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleLogin}
      className="bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800 transition text-sm flex items-center gap-2"
    >
      <span>GitHub Login</span>
    </button>
  );
}

export default AuthButton;