import Navbar from "./components/navbar";
import Sidebar from "./components/sidebar";


export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen bg-[#F8FAFC]">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <Navbar />
                <main className="p-10">{children}</main>
            </div>
        </div>
    );
}
