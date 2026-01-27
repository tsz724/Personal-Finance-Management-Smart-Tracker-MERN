import React,{useContext} from 'react'
import { SideMenuData } from '../../utils/data'
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';

const Sidebar = ({ activeMenu, onMenuClick }) => {
  const { user, clearUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleClick = (route) => {
    if (route === "/logout") {
      handleLogout();
      return;
    }
    navigate(route);
    // Close mobile menu if onMenuClick prop is provided
  };

  const handleLogout = () => {
    localStorage.clear();
    clearUser();
    navigate("/login");
  };

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200/50 p-5 sticky top-0 z-20">
      <div className="flex flex-col items-center justify-center mb-8 pt-16">
        <h5 className="text-gray-950 font-medium leading-6 mt-2">
            {user?.name || ""}
        </h5>
      </div>

      <div className="flex flex-col">
        {SideMenuData.map((item, index) => (
          <button
            key={`menu_${index}`}
            className={`w-full flex items-center gap-4 text-[15px] ${
              activeMenu === item.label ? "text-white bg-linear-to-br from-orange-700 to-rose-700" : ""
            } py-3 px-6 rounded-lg mb-3`}
            onClick={() => handleClick(item.path)}
          >
            <item.icon className="text-xl" />
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
