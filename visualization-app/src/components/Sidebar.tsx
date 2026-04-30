import { useNavigate, useLocation } from 'react-router';
import { SidebarData } from './SidebarData';

function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <div className="sidebar h-screen w-52 pt-4 pr-3 pl-3 shadow-lg">
            <p
                className="px-3 text-xl font-semibold uppercase tracking-widest text-gray-800 mb-2 pb-4 cursor-pointer"
                onClick={() => navigate('/')}
            >
                PV251 Projects
            </p>
            <p className="px-3 text-xs font-semibold uppercase tracking-widest text-gray-800 mb-2">
                Navigation
            </p>
            <hr className="border-gray-300 pb-2" />
            <ul>
                {SidebarData.map((val, key) => {
                    const isActive =
                        val.link === '/'
                            ? location.pathname === '/'
                            : location.pathname.startsWith(val.link);
                    return (
                        <li
                            key={key}
                            className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer mb-2
                            transition-all duration-150 ease-in-out
                            ${
                                isActive
                                    ? 'bg-amber-50 text-amber-700'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                            onClick={() => navigate(val.link)}
                        >
                            <div className="pr-2">{val.icon}</div>
                            <div>{val.title}</div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

export default Sidebar;
