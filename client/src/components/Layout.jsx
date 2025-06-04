import FloatingNavbar from "./FloatingNavBar";
import SideBar from "./SideBar";

export default function Layout({ children }) {
    return (
        <div>
            <main className='m-40 ml-64 mt-28 flex-1 bg-green-300 shadow-md z-40 flex items-center justify-between px-4 rounded-md'>
                <FloatingNavbar />
                {children}
            </main>
            <SideBar />
        </div>
    );
}