import FloatingNavbar from "./FloatingNavBar";
import SideBar from "./SideBar";

export default function Layout({ children }) {
    return (
        <div>
            <main className='m-40 mt-28 flex-1 bg-green-300'>
                <FloatingNavbar />
                {children}
            </main>
            <SideBar />
        </div>
    );
}