import SideBar from "./SideBar";

export default function Layout({ children }) {
    return (
        <div style={{ display: 'flex' }}>
            <SideBar />
            <main style={{ flex: 1, padding: '1rem' }}>
                {children}
            </main>
        </div>
    );
}