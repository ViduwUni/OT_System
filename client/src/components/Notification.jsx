import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { BellIcon } from "@heroicons/react/24/outline";

import { IoEllipsisHorizontalCircle } from "react-icons/io5";
import { GiSandsOfTime } from "react-icons/gi";

export default function Notification({ notifications = [] }) {
  const pendingApprovals = notifications.filter(
    (n) => n.type === "Pending Approval"
  );
  const pendingFinalApprovals = notifications.filter(
    (n) => n.type === "Pending Final Approval"
  );
  const unconfirmedOTs = notifications.filter(
    (n) => n.type === "Unconfirmed OT"
  );

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="relative inline-flex items-center p-2 rounded-full hover:bg-gray-100 transition">
        <BellIcon
          className={`h-6 w-6 text-gray-700 ${
            notifications.length > 0 ? "animate-wiggle" : ""
          }`}
        />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {notifications.length}
          </span>
        )}
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto origin-top-right bg-white divide-y divide-gray-200 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-40">
          <div className="p-4">
            <h3 className="text-lg font-medium text-gray-800">Notifications</h3>
          </div>

          <div className="p-2">
            {notifications.length === 0 && (
              <p className="text-sm text-gray-500 text-center">
                No notifications
              </p>
            )}

            {pendingApprovals.length > 0 && (
              <div className="mb-2">
                <h4 className="flex items-center gap-1 text-sm font-semibold text-blue-600 mb-1">
                  <IoEllipsisHorizontalCircle /> Pending Approvals
                </h4>
                {pendingApprovals.map((n, i) => (
                  <div
                    key={`pa-${i}`}
                    className="text-sm text-gray-700 px-2 py-1 rounded hover:bg-gray-100"
                  >
                    {n.message}
                  </div>
                ))}
              </div>
            )}

            {pendingFinalApprovals.length > 0 && (
              <div className="mb-2">
                <h4 className="flex items-center gap-1 text-sm font-semibold text-orange-600 mb-1">
                  <IoEllipsisHorizontalCircle /> Pending Final Approvals
                </h4>
                {pendingFinalApprovals.map((n, i) => (
                  <div
                    key={`pfa-${i}`}
                    className="text-sm text-gray-700 px-2 py-1 rounded hover:bg-gray-100"
                  >
                    {n.message}
                  </div>
                ))}
              </div>
            )}

            {unconfirmedOTs.length > 0 && (
              <div>
                <h4 className="flex flex-row items-center gap-1 text-sm font-semibold text-purple-600 mb-1">
                  <GiSandsOfTime /> Unconfirmed OTs
                </h4>
                {unconfirmedOTs.map((n, i) => (
                  <div
                    key={`uo-${i}`}
                    className="text-sm text-gray-700 px-2 py-1 rounded hover:bg-gray-100"
                  >
                    {n.message}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
