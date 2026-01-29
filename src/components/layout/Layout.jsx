import { useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export function Layout({ children, showHeader = true, showFooter = true }) {
    const mainRef = useRef(null);
    const { pathname } = useLocation();

    // Reset scroll when route changes
    useEffect(() => {
        if (mainRef.current) {
            mainRef.current.scrollTo(0, 0);
        }
    }, [pathname]);

    return (
        <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark text-text-primary font-sans">
            {/* Sidebar - Desktop Only (Hidden on Mobile) */}
            <div className="hidden md:flex">
                <Sidebar />
            </div>

            {/* Main Content Area */}
            <main
                ref={mainRef}
                className="flex-1 h-full overflow-y-auto relative flex flex-col w-full scrollbar-thin scrollbar-thumb-surface-dark/20 hover:scrollbar-thumb-surface-dark/40"
            >

                {showHeader && <Header />}

                {/* Content Wrapper with Mobile Padding for BottomNav */}
                <div className="flex-1 pb-24 md:pb-0">
                    {children}
                </div>

                {showFooter && <Footer />}
            </main>

            {/* Bottom Nav - Mobile Only */}
            <BottomNav />
        </div>
    );
}
