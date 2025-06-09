import Notification from "./Notification";
import { AuthContext } from "../context/AuthContext";
import { useState, useEffect, useContext } from "react";
import axios from "axios";
import Greeting from "../utils/Greeting";
import { GreetingInfo } from "../utils/GreetingInfo";

import { FiSun, FiMoon } from "react-icons/fi";

export default function TopBar() {
  const { hour } = GreetingInfo();
  const API_BASE = `http://${
    import.meta.env.VITE_APP_BACKEND_IP
  }:5000/api/overtime`;
  const [notifications, setNotifications] = useState([]);
  const { user } = useContext(AuthContext);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get(API_BASE);
        const entries = res.data;

        const notifs = [];

        entries.forEach((e) => {
          if (e.approval_stage === "pending") {
            notifs.push({
              type: "Pending Approval",
              message: `OT for ${e.employee_no} on ${new Date(
                e.date
              ).toLocaleDateString()} is pending.`,
            });
          }

          if (e.approval_stage === "approved(production)") {
            notifs.push({
              type: "Pending Final Approval",
              message: `Final approval needed for OT of ${
                e.employee_no
              } on ${new Date(e.date).toLocaleDateString()}.`,
            });
          }

          if (e.confirmed_hours === 0) {
            notifs.push({
              type: "Unconfirmed OT",
              message: `OT for ${e.employee_no} on ${new Date(
                e.date
              ).toLocaleDateString()} is unconfirmed.`,
            });
          }
        });

        setNotifications(notifs);
      } catch (err) {
        console.error("Failed to load overtime notifications", err);
      }
    };

    fetchNotifications();
    const intervalId = setInterval(fetchNotifications, 5000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  });

  return (
    <div className="border-b px-4 mb-4 mt-2 pb-4 border-stone-200">
      <div className="flex items-center justify-between p-0.5">
        <div>
          <span className="text-sm font-bold flex items-center gap-2">
            <Greeting name={user?.name} />
            {hour >= 6 && hour < 18 ? (
              <FiSun className="text-yellow-500" />
            ) : (
              <FiMoon className="text-blue-500" />
            )}
          </span>
          <span className="text-xs block text-stone-500">
            {currentTime.toLocaleString("en-US", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </span>
        </div>
        <div>
          <Notification notifications={notifications} />
        </div>
      </div>
    </div>
  );
}
