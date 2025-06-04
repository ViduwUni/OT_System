import { AuthContext } from "../context/AuthContext";
import { useState, useEffect, useContext } from "react";
import axios from "axios";
import Greeting from "../utils/Greeting";
import NotificationBell from "./Notification";

export default function FloatingNavbar() {
  const API_BASE = `http://${
    import.meta.env.VITE_APP_BACKEND_IP
  }:5000/api/overtime`;
  const [notifications, setNotifications] = useState([]);
  const { user } = useContext(AuthContext);

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

  return (
    <div className="fixed top-4 left-64 right-40 h-16 bg-white shadow-md z-40 flex items-center justify-between px-4 rounded-md">
      <Greeting name={user?.name} />
      <div className="relative">
        <NotificationBell notifications={notifications} />
      </div>
    </div>
  );
}
