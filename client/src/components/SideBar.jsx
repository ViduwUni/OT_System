import { Link, useLocation } from "react-router-dom";
import { useContext, useState, useEffect, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";

// Icons
import { AiFillAppstore } from "react-icons/ai";
import { FaUsers } from "react-icons/fa";
import { PiFingerprintBold } from "react-icons/pi";
import { GrUserWorker } from "react-icons/gr";
import { FaWpforms } from "react-icons/fa";
import { FaClipboardList } from "react-icons/fa";
import { TbReport } from "react-icons/tb";
import { IoLogOut } from "react-icons/io5";

import {
  BsWifi,
  BsWifi2,
  BsWifi1,
  BsWifiOff,
  BsCheckCircleFill,
  BsClockFill,
  BsXCircleFill,
  BsQuestionCircleFill,
} from "react-icons/bs";

export default function SideBar() {
  const { logout } = useContext(AuthContext);
  const location = useLocation();

  const [latency, setLatency] = useState(null);
  const [, setStatus] = useState("Checking...");
  const [dbStatus, setDbStatus] = useState("Checking...");
  const prevStatus = useRef("");
  const prevDbStatus = useRef("");

  const connToastShown = useRef(new Set());
  const dbToastShown = useRef(new Set());

  const BACKEND_URL = `http://${import.meta.env.VITE_APP_BACKEND_IP}:5000`;

  const getSignalIcon = (ms) => {
    if (ms < 100) return <BsWifi className="text-green-600 text-3xl" />;
    if (ms < 250)
      return <BsWifi2 className="text-yellow-500 text-3xl animate-pulse" />;
    if (ms < 500)
      return <BsWifi1 className="text-orange-500 text-3xl animate-pulse" />;
    return <BsWifiOff className="text-red-500 text-3xl animate-pulse" />;
  };

  const pingServer = async () => {
    const start = Date.now();
    try {
      const response = await fetch(`${BACKEND_URL}/api/connection/ping`);
      if (!response.ok) throw new Error("Server Error");

      const end = Date.now();
      const ms = end - start;
      setLatency(ms);

      let newStatus = "";
      if (ms < 100) newStatus = "🟢 Excellent";
      else if (ms < 250) newStatus = "🟡 Good";
      else if (ms < 500) newStatus = "🟠 Weak";
      else newStatus = "🔴 Bad";

      setStatus(newStatus);

      // Toast only if Weak or Bad and toast not shown yet for this status
      if (
        (newStatus.includes("Weak") || newStatus.includes("Bad")) &&
        newStatus !== prevStatus.current &&
        !connToastShown.current.has(newStatus)
      ) {
        toast.warn(`Connection is ${newStatus.replace(/🟠 |🔴 /, "")}`, {
          position: "top-right",
          autoClose: 4000,
        });
        connToastShown.current.add(newStatus);
      }

      // Reset toast tracking if status improved
      if (
        (newStatus === "🟢 Excellent" || newStatus === "🟡 Good") &&
        prevStatus.current !== newStatus
      ) {
        connToastShown.current.clear();
      }

      prevStatus.current = newStatus;
    } catch (err) {
      setLatency(null);
      const newStatus = "🔴 No Connection";
      setStatus(newStatus, err);

      if (!connToastShown.current.has(newStatus)) {
        toast.error("Lost connection to backend 😵", {
          position: "top-right",
          autoClose: 4000,
        });
        connToastShown.current.add(newStatus);
      }

      prevStatus.current = newStatus;
    }
  };

  const checkDbStatus = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/connection/status`);
      if (!response.ok) throw new Error("Failed to fetch DB status");
      const data = await response.json();

      const newDbStatus = data.db;

      if (
        (newDbStatus === "disconnected" || newDbStatus === "disconnecting") &&
        newDbStatus !== prevDbStatus.current &&
        !dbToastShown.current.has(newDbStatus)
      ) {
        toast.error("⚠️ MongoDB is disconnected!", {
          position: "top-right",
          autoClose: 4000,
        });
        dbToastShown.current.add(newDbStatus);
      }

      if (
        newDbStatus === "connected" &&
        prevDbStatus.current !== "connected" &&
        !dbToastShown.current.has("connected")
      ) {
        toast.success("✅ MongoDB reconnected!", {
          position: "top-right",
          autoClose: 3000,
        });
        dbToastShown.current.add("connected");
      }

      // Reset toast tracking if status changes to connecting or unknown
      if (
        (newDbStatus === "connecting" || newDbStatus === "unknown") &&
        prevDbStatus.current !== newDbStatus
      ) {
        dbToastShown.current.clear();
      }

      setDbStatus(newDbStatus);
      prevDbStatus.current = newDbStatus;
    } catch (err) {
      setDbStatus("unknown");
      if (!dbToastShown.current.has("unknown")) {
        toast.error(`Failed to fetch DB status: ${err}`, {
          position: "top-right",
          autoClose: 3000,
        });
        dbToastShown.current.add("unknown");
      }
      prevDbStatus.current = "unknown";
    }
  };

  useEffect(() => {
    pingServer();
    checkDbStatus();
    const interval = setInterval(() => {
      pingServer();
      checkDbStatus();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getDbIcon = (status) => {
    switch (status) {
      case "connected":
        return <BsCheckCircleFill className="text-green-600 inline mr-2" />;
      case "connecting":
      case "disconnecting":
        return (
          <BsClockFill className="text-yellow-500 inline mr-2 animate-pulse" />
        );
      case "disconnected":
        return <BsXCircleFill className="text-red-600 inline mr-2" />;
      default:
        return <BsQuestionCircleFill className="text-gray-400 inline mr-2" />;
    }
  };

  const getDbStatusDisplay = () => {
    switch (dbStatus) {
      case "connected":
        return "Connected";
      case "connecting":
        return "Connecting...";
      case "disconnecting":
        return "Disconnecting...";
      case "disconnected":
        return "Disconnected";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="fixed top-0 left-0 h-screen w-24 border-solid flex flex-col bg-primary text-text shadow-lg z-10">
      {/* Main menu icons */}
      <div className="flex flex-col flex-grow mt-6">
        <SideBarIcon
          icon={<AiFillAppstore size="28" />}
          text="Dashboard"
          to="/dashboard"
          isActive={location.pathname === "/dashboard"}
        />
        <SideBarIcon
          icon={<FaUsers size="28" />}
          text="User Manager"
          to="/userManager"
          isActive={location.pathname === "/userManager"}
        />
        <SideBarIcon
          icon={<GrUserWorker size="28" />}
          text="Employees"
          to="/employeeManagement"
          isActive={location.pathname === "/employeeManagement"}
        />
        <SideBarIcon
          icon={<FaWpforms size="28" />}
          text="Overtime Form"
          to="/overtimeForm"
          isActive={location.pathname === "/overtimeForm"}
        />
        <SideBarIcon
          icon={<FaClipboardList size="28" />}
          text="Overtime List"
          to="/overtimeList"
          isActive={location.pathname === "/overtimeList"}
        />
        <SideBarIcon
          icon={<TbReport size="28" />}
          text="Monthly Report"
          to="/monthlyReport"
          isActive={location.pathname === "/monthlyReport"}
        />
        <SideBarIcon
          icon={<PiFingerprintBold size="28" />}
          text="Scanner Converter"
          to="/scannerConverter"
          isActive={location.pathname === "/scannerConverter"}
        />
      </div>

      {/* Logout icon and status icon */}
      <div className="flex flex-col mb-6">
        <SideBarIcon
          icon={
            latency !== null ? (
              getSignalIcon(latency)
            ) : (
              <BsWifiOff className="text-gray-400 text-3xl" />
            )
          }
          text={
            <div className="flex flex-col items-start whitespace-pre-line">
              <span>
                {latency !== null ? `Ping: ${latency} ms` : `No Connection`}
              </span>
              <span className="flex items-center gap-1">
                {getDbIcon(dbStatus)} {getDbStatusDisplay()}
              </span>
            </div>
          }
        />
        <SideBarIcon
          icon={<IoLogOut size="28" />}
          text="Logout"
          onClick={logout}
        />
      </div>
    </div>
  );
}

const SideBarIcon = ({ icon, text = "tooltip", to, onClick, isActive }) => {
  const baseClasses = "sidebar-icon group";
  const activeClasses = isActive ? " bg-secondary text-white scale-105" : "";

  const content = (
    <div className={`${baseClasses}${activeClasses}`}>
      {icon}
      {!isActive && (
        <span className="sidebar-tooltip group-hover:scale-100">{text}</span>
      )}
    </div>
  );

  if (to) {
    return <Link to={to}>{content}</Link>;
  }

  if (onClick) {
    return (
      <div onClick={onClick} className="cursor-pointer">
        {content}
      </div>
    );
  }

  return content;
};
