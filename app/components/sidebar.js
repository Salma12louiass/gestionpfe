// MON-PROJET/app/components/sidebar.js
"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  FaBars, FaTachometerAlt, FaClipboardList, FaChartLine,
  FaGraduationCap, FaSignOutAlt, FaChevronDown, FaChevronRight,
  FaFileAlt, FaCalendarAlt, FaUsers, FaComments
} from "react-icons/fa";
import Link from "next/link";
import logo from './logoEST.jpg';
const Sidebar = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [openSubmenus, setOpenSubmenus] = useState({});
  const pathname = usePathname();

  // Responsive behavior - collapse sidebar on mobile by default
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    
    handleResize(); // Set initial state
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-expand relevant submenu based on current route
  useEffect(() => {
    const submenuStates = {};
    
    if (["/livrables", "/reunions", "/supervision", "/discussions"].some(path => pathname.startsWith(path))) {
      submenuStates.suivi = true;
    }
    
    setOpenSubmenus(submenuStates);
  }, [pathname]);

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);
  
  const toggleSubmenu = (menuName) => {
    setOpenSubmenus(prev => ({
      ...prev,
      [menuName]: !prev[menuName]
    }));
  };

  // Sidebar items configuration for better maintainability
  const menuItems = [
    {
      name: "Dashboard",
      path: "/",
      icon: <FaTachometerAlt size={20} />,
      exact: true
    },
    {
      name: "Affectation",
      path: "/affectation",
      icon: <FaClipboardList size={20} />
    },
    {
      name: "Suivi",
      icon: <FaChartLine size={20} />,
      submenu: [
        {
          name: "Livrables",
          path: "/livrables",
          icon: <FaFileAlt size={16} />
        },
        {
          name: "Réunions",
          path: "/reunions",
          icon: <FaCalendarAlt size={16} />
        },
        {
          name: "Supervision",
          path: "/supervision",
          icon: <FaUsers size={16} />
        },
        {
          name: "Discussions",
          path: "/discussions",
          icon: <FaComments size={16} />
        }
      ]
    },
    {
      name: "Soutenance",
      path: "/soutenance",
      icon: <FaGraduationCap size={20} />
    },
    {
      name: "Déconnexion",
      path: "/logout",
      icon: <FaSignOutAlt size={20} />,
      className: "hover:bg-red-500/10 text-red-500"
    }
  ];

  const isActive = (itemPath, exact = false) => {
    if (exact) return pathname === itemPath;
    return pathname.startsWith(itemPath);
  };

  return (
    <div className="flex h-full min-h-screen">
      {/* Sidebar */}
      <div className={`
        bg-gray-800 text-white sticky top-0 h-[100vh] overflow-y-auto transition-all duration-300
        ${isSidebarOpen ? "w-64" : "w-20"} shadow-lg z-20
      `}>
        <div className="p-5 flex items-center justify-between sticky top-0 bg-gray-800 z-10">
          {isSidebarOpen && (
            <h1 className="text-lg font-bold flex items-center gap-2">
<img src={logo.src} alt="Logo EST" className="w-8 h-8" />
<span>EST Safi</span>
            </h1>
          )}
          <button 
            onClick={toggleSidebar} 
            className="text-white focus:outline-none hover:bg-gray-700 p-2 rounded-lg"
            aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            <FaBars size={20} />
          </button>
        </div>

        {/* Menu Items */}
        <ul className="mt-5 space-y-1 pb-5">
          {menuItems.map((item) => (
            <li key={item.name}>
              {item.submenu ? (
                <>
                  <div 
                    onClick={() => toggleSubmenu(item.name.toLowerCase())}
                    className={`
                      flex items-center justify-between p-3 rounded-lg transition-colors duration-200 cursor-pointer
                      ${openSubmenus[item.name.toLowerCase()] ? "bg-[#b17a56] text-white hover:bg-[#a06d4b]" : "hover:bg-gray-700"}
                      mx-2
                    `}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span className={`${!isSidebarOpen && "hidden"}`}>{item.name}</span>
                    </div>
                    {isSidebarOpen && (
                      <span>
                        {openSubmenus[item.name.toLowerCase()] ? <FaChevronDown size={14} /> : <FaChevronRight size={14} />}
                      </span>
                    )}
                  </div>

                  {/* Submenu */}
                  {openSubmenus[item.name.toLowerCase()] && isSidebarOpen && (
                    <ul className="ml-8 mt-1 space-y-1">
                      {item.submenu.map((subItem) => (
                        <li key={subItem.name}>
                          <Link 
                            href={subItem.path}
                            className={`
                              flex items-center gap-3 p-3 rounded-lg transition-colors duration-200
                              ${isActive(subItem.path) ? "bg-[#1a4edbb2] text-white hover:bg-[#1a4dd6]" : "hover:bg-gray-700"}
                              mx-2
                            `}
                          >
                            {subItem.icon}
                            <span>{subItem.name}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <Link
                  href={item.path}
                  className={`
                    flex items-center gap-3 p-3 rounded-lg transition-colors duration-200 mx-2
                    ${isActive(item.path, item.exact) ? "bg-[#b17a56] text-white hover:bg-[#a06d4b]" : item.className || "hover:bg-gray-700"}
                  `}
                >
                  {item.icon}
                  <span className={`${!isSidebarOpen && "hidden"}`}>{item.name}</span>
                </Link>
              )}
            </li>
          ))}
        </ul>

        {/* Collapsed view indicators */}
        {!isSidebarOpen && (
          <div className="absolute top-0 left-full ml-2 bg-gray-800 rounded-r-lg shadow-lg p-2 hidden md:block">
            {menuItems.map(item => (
              <div key={item.name} className="p-2 group relative">
                <div className="text-white">
                  {item.icon}
                </div>
                <div className="absolute left-full top-0 ml-2 bg-gray-800 text-white text-sm rounded px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                  {item.name}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className={`flex-1 overflow-auto h-[100vh] transition-all duration-300 ${isSidebarOpen ? "" : ""}`}>
        <div className="p-4 md:p-6">
          {/* Mobile header */}
          <div className="md:hidden flex items-center justify-between mb-4 p-2 bg-white shadow-sm rounded-lg">
            <button 
              onClick={toggleSidebar}
              className="text-gray-700 p-2 rounded-lg hover:bg-gray-100"
            >
              <FaBars size={20} />
            </button>
            <h1 className="text-lg font-bold text-gray-800">
              {menuItems.find(item => isActive(item.path, item.exact))?.name || "Dashboard"}
            </h1>
            <div className="w-10"></div> {/* Spacer for alignment */}
          </div>
          
          {children}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;