import React, { useState} from 'react';
import { HiOutlineMenu, HiOutlineX } from 'react-icons/hi';
import { LuTrendingUpDown } from "react-icons/lu";
import Sidebar from './Sidebar';


const Navbar = ({ activeMenu }) => {
  const [openSideMenu, setOpenSideMenu] = useState(false);

  // Close menu when clicking outside
  // useEffect(() => {
  //   const handleClickOutside = (event) => {
  //     if (openSideMenu && !event.target.closest('.mobile-menu-container')) {
  //       setOpenSideMenu(false);
  //     }
  //   };

  //   if (openSideMenu) {
  //     document.addEventListener('click', handleClickOutside);
  //     // Prevent body scroll when menu is open
  //     document.body.style.overflow = 'hidden';
  //   }

  //   return () => {
  //     document.removeEventListener('click', handleClickOutside);
  //     document.body.style.overflow = 'unset';
  //   };
  // }, [openSideMenu]);

  return (
    <div className="sticky top-0 z-30 bg-white border-b backdrop-blur-[2px] border-gray-200/50">
      <div className="flex items-center gap-5 py-2 px-4 max-w-7xl mx-auto">
        
        <button
          className="block lg:hidden text-black"
          onClick={() => setOpenSideMenu(!openSideMenu)}
        >
          {openSideMenu ? (
            <HiOutlineX className="text-2xl" />
          ) : (
            <HiOutlineMenu className="text-2xl" />
          )}
        </button>

        <div className="w-8 h-8 bg-linear-to-br from-orange-700 to-rose-700 rounded-full flex items-center justify-center text-white">
          <LuTrendingUpDown className="text-xl" />
        </div>

        <div className="leading-tight">
          <div className="text-xl font-bold text-gray-900">Expensa</div>
          <div className="text-xs text-gray-500">Smart Expense Tracker</div>
        </div>

        {/* Push to right */}
        <div className="ml-auto text-sm text-gray-500 hidden sm:block">
          Secure · Fast · Insightful
        </div>
      </div>

      {openSideMenu && (
        <div className="fixed top-16 left-0 bg-white">
          <Sidebar activeMenu={activeMenu} />
        </div>
      )}
    </div>
  );
}

export default Navbar;