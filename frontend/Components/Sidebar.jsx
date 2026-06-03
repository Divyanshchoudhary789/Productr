import { Handbag, Home, Search, X } from "lucide-react";

export default function Sidebar({
    activePage,
    searchTerm,
    onSearchChange,
    onPageChange,
    isOpen,
    onClose,
}) {
    const navItems = [
        { id: "home", label: "Home", icon: Home },
        { id: "products", label: "Products", icon: Handbag },
    ];

    const handlePageChange = (page) => {
        onPageChange(page);
        onClose();
    };

    return (
        <>
            <div
                className={`fixed inset-0 z-30 bg-black/40 transition-opacity lg:hidden ${isOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
                onClick={onClose}
            />

            <aside
                className={`fixed left-0 top-0 z-40 flex h-screen w-[220px] flex-col bg-[#1d222b] text-white transition-transform duration-300 xl:w-[240px] lg:static lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
            >
                <div className="flex h-[58px] items-center justify-between px-[14px]">
                    <img
                        src="/sidebar-logo.png"
                        alt="Productr"
                        className="h-[34px] w-[122px] object-contain object-left"
                    />
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded p-1 text-slate-400 hover:bg-white/10 lg:hidden"
                        aria-label="Close sidebar"
                    >
                        <X size={16} />
                    </button>
                </div>

                <div className="px-[10px] pb-[30px]">
                    <div className="flex h-[34px] items-center gap-2 rounded-[3px] bg-[#303743] px-3">
                        <Search size={15} className="shrink-0 text-[#7e8798]" />
                        <input
                            type="search"
                            value={searchTerm}
                            onChange={(event) => onSearchChange(event.target.value)}
                            placeholder="Search"
                            className="h-full min-w-0 flex-1 bg-transparent text-[13px] text-slate-200 outline-none placeholder:text-[#8f98a8]"
                        />
                    </div>
                </div>

                <nav className="flex flex-col gap-[20px] px-[18px] pt-[5px]">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const active = activePage === item.id;

                        return (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => handlePageChange(item.id)}
                                className={`flex items-center gap-3 text-left text-[13px] font-medium ${active ? "text-white" : "text-[#687080]"}`}
                            >
                                <Icon size={15} strokeWidth={1.8} />
                                <span>{item.label}</span>
                            </button>
                        );
                    })}
                </nav>
            </aside>
        </>
    );
}
