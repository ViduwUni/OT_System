import { Link, useLocation } from "react-router-dom";
import { useContext, useState, useEffect, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import AccountInfo from "./AccountInfo";
import { Tooltip } from "antd";

// Icons
import { AiFillAppstore } from "react-icons/ai";
import { FaUsers } from "react-icons/fa";
import { PiFingerprintBold } from "react-icons/pi";
import { GrUserWorker } from "react-icons/gr";
import { FaWpforms } from "react-icons/fa";
import { FaClipboardList } from "react-icons/fa";
import { TbReport } from "react-icons/tb";
import { MdDateRange } from "react-icons/md";
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
  const { logout, user } = useContext(AuthContext);
  const location = useLocation();

  const [latency, setLatency] = useState(null);
  const [, setStatus] = useState("Checking...");
  const [dbStatus, setDbStatus] = useState("Checking...");
  const prevStatus = useRef("");
  const prevDbStatus = useRef("");

  const connToastShown = useRef(new Set());
  const dbToastShown = useRef(new Set());

  const BACKEND_URL = `http://${import.meta.env.VITE_APP_BACKEND_IP}:5000`;

  const signalIconSize = "text-2xl";

  const routes = [
    {
      to: "/dashboard",
      title: "Dashboard",
      icon: <AiFillAppstore className="text-violet-500" />,
      roles: ['administrator', 'manager(hr)', 'supervisor(hr)', 'supervisor(production)', 'manager(production)'],
    },
    {
      to: "/userManager",
      title: "User Manager",
      icon: <FaUsers />,
      roles: ['administrator', 'manager(hr)'],
    },
    {
      to: "/employeeManagement",
      title: "Employees",
      icon: <GrUserWorker />,
      roles: ['administrator', 'manager(hr)', 'supervisor(hr)'],
    },
    {
      to: "/overtimeForm",
      title: "Overtime Form",
      icon: <FaWpforms />,
      roles: ['administrator', 'manager(hr)', 'supervisor(hr)'],
    },
    {
      to: "/overtimeList",
      title: "Overtime List",
      icon: <FaClipboardList />,
      roles: ['administrator', 'manager(hr)', 'supervisor(hr)', 'supervisor(production)', 'manager(production)'],
    },
    {
      to: "/monthlyReport",
      title: "Monthly Report",
      icon: <TbReport />,
      roles: ['administrator', 'manager(hr)', 'supervisor(hr)'],
    },
    {
      to: "/scannerConverter",
      title: "Scanner Converter",
      icon: <PiFingerprintBold />,
      roles: ['administrator', 'manager(hr)', 'supervisor(hr)'],
    },
    {
      to: "/tripleOTDates",
      title: "Triple OT Dates",
      icon: <MdDateRange />,
      roles: ['administrator', 'manager(hr)', 'supervisor(hr)'],
    },
  ];

  const getSignalIcon = (ms) => {
    if (ms < 100)
      return <BsWifi className={`text-green-600 ${signalIconSize}`} />;
    if (ms < 250)
      return (
        <BsWifi2
          className={`text-yellow-500 ${signalIconSize} animate-pulse`}
        />
      );
    if (ms < 500)
      return (
        <BsWifi1
          className={`text-orange-500 ${signalIconSize} animate-pulse`}
        />
      );
    return (
      <BsWifiOff className={`text-red-500 ${signalIconSize} animate-pulse`} />
    );
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
      if (ms < 100) newStatus = "Excellent";
      else if (ms < 250) newStatus = "Good";
      else if (ms < 500) newStatus = "Weak";
      else newStatus = "Bad";

      setStatus(newStatus);

      if (
        (newStatus.includes("Weak") || newStatus.includes("Bad")) &&
        newStatus !== prevStatus.current &&
        !connToastShown.current.has(newStatus)
      ) {
        toast.warn(`Connection is ${newStatus.replace(/ | /, "")}`, {
          position: "top-right",
          autoClose: 4000,
        });
        connToastShown.current.add(newStatus);
      }

      if (
        (newStatus === "Excellent" || newStatus === "Good") &&
        prevStatus.current !== newStatus
      ) {
        connToastShown.current.clear();
      }

      prevStatus.current = newStatus;
    } catch (err) {
      setLatency(null);
      const newStatus = "No Connection";
      setStatus(newStatus, err);

      if (!connToastShown.current.has(newStatus)) {
        toast.error("Lost connection to backend", {
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
        toast.error("MongoDB is disconnected!", {
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
        toast.success("MongoDB reconnected!", {
          position: "top-right",
          autoClose: 3000,
        });
        dbToastShown.current.add("connected");
      }

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
    <div>
      <div className="overflow-y-scroll sticky top-4 h-[calc(100vh-32px-48px)]">
        <AccountInfo />
        <div className="space-y-1">
          {routes
            .filter((route) => route.roles.includes(user?.role))
            .map((route) => (
              <Route
                key={route.to}
                to={route.to}
                title={route.title}
                icon={route.icon}
                selected={location.pathname === route.to}
              />
            ))}
        </div>
      </div>
      <div className="flex sticky top-[calc(100vh_-_48px_-_16px)] flex-col h-12 border-t px-2 border-stone-300 justify-end text-xs">
        <div className="flex items-center justify-between">
          <div>
            <Tooltip
              title={
                <div>
                  <span>
                    {latency !== null ? `Ping: ${latency} ms` : `No Connection`}
                  </span>
                  <br />
                  <span>
                    {getDbIcon(dbStatus)} {getDbStatusDisplay()}
                  </span>
                </div>
              }
            >
              <p className="font-bold">
                {latency !== null ? (
                  getSignalIcon(latency)
                ) : (
                  <BsWifiOff className={`text-gray-400 ${signalIconSize}`} />
                )}
              </p>
            </Tooltip>
          </div>

          <button
            className="flex items-center gap-2 px-2 py-1.5 font-medium bg-stone-200 hover:bg-stone-300 transition-colors rounded"
            onClick={logout}
          >
            Logout <IoLogOut size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

const Route = ({ to, icon, title, selected }) => {
  return (
    <Link
      to={to}
      className={`flex items-center justify-start gap-2 w-full rounded px-2 py-1.5 text-sm transition-[box-shadow,_background-color,_color] ${selected
        ? "bg-white text-stone-950 shadow"
        : "hover:bg-stone-200 bg-transparent text-stone-500 shadow-none"
        }`}
    >
      {icon && <span>{icon}</span>}
      <span>{title}</span>
    </Link>
  );
};