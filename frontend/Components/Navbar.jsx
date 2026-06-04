import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut, Menu, Package, Search, User } from "lucide-react";
import { api } from "../src/environment";
import { useAuth } from "../src/authContext";

export default function Navbar({
    title = "Products",
    showTitle = true,
    showSearch = false,
    searchTerm,
    onSearchChange,
    onMenuClick,
}) {
    const [profileOpen, setProfileOpen] = useState(false);
    const profileRef = useRef(null);
    const { currentUser, setCurrentUser } = useAuth();

    useEffect(() => {
        if (!profileOpen) {
            return undefined;
        }

        const handlePointerDown = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setProfileOpen(false);
            }
        };

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                setProfileOpen(false);
            }
        };

        document.addEventListener("pointerdown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("pointerdown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [profileOpen]);

    const handleLogout = async () => {
        try {
            await api.post("/logout");
        } catch (error) {
            console.error(error);
        } finally {
            localStorage.removeItem("token");
            setCurrentUser(null);
        }
    };

    return (
        <header className="relative z-20 flex h-[54px] items-center justify-between border-b border-[#e3e6ee] bg-[linear-gradient(110deg,#fff5f3_0%,#fbfcf1_55%,#e6ebff_100%)] px-4 lg:px-6">
            <div className="flex min-w-0 items-center gap-3">
                <button
                    type="button"
                    onClick={onMenuClick}
                    className="rounded-md p-1 text-[#11183f] hover:bg-black/5 lg:hidden"
                    aria-label="Open sidebar"
                >
                    <Menu size={18} />
                </button>

                {showTitle && (
                    <div className="flex items-center gap-2 text-[13px] font-medium text-[#11183f]">
                        <Package size={15} strokeWidth={1.8} />
                        <span>{title}</span>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-6">
                {showSearch && (
                    <label className="hidden h-[34px] w-[280px] items-center gap-2 rounded-[3px] bg-[#f3f4f8]/90 px-3 xl:w-[320px] md:flex">
                        <Search size={15} className="text-[#8d97aa]" />
                        <input
                            type="search"
                            value={searchTerm}
                            onChange={(event) => onSearchChange(event.target.value)}
                            placeholder="Search Services, Products"
                            className="h-full min-w-0 flex-1 bg-transparent text-[13px] text-slate-600 outline-none placeholder:text-[#7f899a]"
                        />
                    </label>
                )}

                <div className="relative" ref={profileRef}>
                    <button
                        type="button"
                        onClick={() => setProfileOpen((value) => !value)}
                        className="flex items-center gap-2 rounded-full px-1 py-1 hover:bg-white/60"
                        aria-label="Open profile menu"
                    >
                        <span className="flex h-[22px] w-[22px] items-center justify-center overflow-hidden rounded-full bg-[#b38b98] text-[10px] font-bold text-[#18203d]">
                            {(currentUser?.name || currentUser?.email || "D").charAt(0).toUpperCase()}
                        </span>
                        <ChevronDown size={15} className="text-[#11183f]" />
                    </button>

                    {profileOpen && (
                        <div className="absolute right-0 top-8 w-44 rounded-md border border-slate-200 bg-white py-1 shadow-lg">
                            <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2 text-[11px] text-slate-600">
                                <User size={13} />
                                <span className="truncate">
                                    {currentUser?.email || currentUser?.name || "Productr User"}
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-[11px] text-slate-700 hover:bg-slate-50"
                            >
                                <LogOut size={13} />
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
