import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { FiChevronDown, FiChevronUp } from 'react-icons/fi'

export default function AccountInfo() {
  const { user } = useContext(AuthContext);
  const seeds = ['Liam', 'Jade', 'Adrian', 'Sarah', 'Aidan'];
  const [seed, setSeed] = useState('');

  useEffect(() => {
    const randomSeed = seeds[Math.floor(Math.random() * seeds.length)];
    setSeed(randomSeed);
  }, []);
  const src = `https://api.dicebear.com/9.x/open-peeps/svg?seed=${seed}`;

  return (
    <div className="border-b mb-4 mt-2 pb-4 border-stone-300">
      <button
        disabled
        className="flex p-0.5 hover:bg-stone-200 rounded transition-colors relative gap-2 w-full items-center"
      >
        <img
          src={src}
          alt="avatar"
          className="size-8 rounded shrink-0 bg-violet-500 shadow"
        />
        <div className="text-start">
          <span className="text-sm font-semibold block">
            {user?.name}
          </span>
          <span className="text-xs block text-stone-500">
            {user?.role}
          </span>
        </div>

        <FiChevronDown className="absolute right-2 top-1/2 translate-y-[calc(-50%+4px)] text-xs" />
        <FiChevronUp className="absolute right-2 top-1/2 translate-y-[calc(-50%-4px)] text-xs" />
      </button>
    </div>
  );
}
