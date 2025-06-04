import { Link, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from "../context/AuthContext";

// Icons
import { AiFillAppstore } from "react-icons/ai";
import { FaUsers } from "react-icons/fa";
import { PiFingerprintBold } from "react-icons/pi";
import { GrUserWorker } from "react-icons/gr";
import { FaWpforms } from "react-icons/fa";
import { FaClipboardList } from "react-icons/fa";
import { TbReport } from "react-icons/tb";
import { IoLogOut } from "react-icons/io5";

export default function SideBar() {
    const { logout } = useContext(AuthContext);
    const location = useLocation();

    return (
        <div className='fixed top-0 left-0 h-screen w-24 border-solid flex flex-col bg-primary text-text shadow-lg z-10'>

            {/* Main menu icons */}
            <div className="flex flex-col flex-grow">
                <SideBarIcon icon={<AiFillAppstore size='28' />} text="Dashboard" to="/dashboard" isActive={location.pathname === '/dashboard'} />
                <SideBarIcon icon={<FaUsers size='28' />} text="User Manager" to="/userManager" isActive={location.pathname === '/userManager'} />
                <SideBarIcon icon={<GrUserWorker size='28' />} text="Employees" to="/employeeManagement" isActive={location.pathname === '/employeeManagement'} />
                <SideBarIcon icon={<FaWpforms size='28' />} text="Overtime Form" to="/overtimeForm" isActive={location.pathname === '/overtimeForm'} />
                <SideBarIcon icon={<FaClipboardList size='28' />} text="Overtime List" to="/overtimeList" isActive={location.pathname === '/overtimeList'} />
                <SideBarIcon icon={<TbReport size='28' />} text="Monthly Report" to="/monthlyReport" isActive={location.pathname === '/monthlyReport'} />
                <SideBarIcon icon={<PiFingerprintBold size='28' />} text="Scanner Converter" to="/scannerConverter" isActive={location.pathname === '/scannerConverter'} />
            </div>

            {/* Logout icon at the bottom */}
            <SideBarIcon icon={<IoLogOut size='28' />} text="Logout" onClick={logout} />

        </div>
    );
}

const SideBarIcon = ({ icon, text = 'tooltip', to, onClick, isActive }) => {
    const baseClasses = 'sidebar-icon group';
    const activeClasses = isActive ? ' bg-secondary text-white scale-105' : '';

    const content = (
        <div className={`${baseClasses}${activeClasses}`}>
            {icon}
            {!isActive && (
                <span className="sidebar-tooltip group-hover:scale-100">
                    {text}
                </span>
            )}
        </div>
    );

    if (to) {
        return <Link to={to}>{content}</Link>;
    }

    if (onClick) {
        return <div onClick={onClick} className='cursor-pointer'>{content}</div>;
    }

    return content;
};