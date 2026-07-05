import { useNavigate, useLocation } from 'react-router';
import { SidebarData } from './SidebarData';
import { useTheme } from '../hooks/useTheme';
import { Sun, Moon } from 'lucide-react';

function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="sidebar h-screen w-52 pt-4 pr-3 pl-3 shadow-lg dark:bg-gray-800 flex flex-col">
            <p
                className="px-3 text-xl font-semibold uppercase tracking-widest text-gray-800 dark:text-gray-100 mb-2 pb-4 cursor-pointer"
                onClick={() => navigate('/')}
            >
                PV251 Projects
            </p>
            <p className="px-3 text-xs font-semibold uppercase tracking-widest text-gray-800 dark:text-gray-400 mb-2">
                Navigation
            </p>
            <hr className="border-gray-300 dark:border-gray-700 pb-2" />
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
                            transition-all duration-150 ease-in-out border-l-4
                            ${
                                isActive
                                    ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-600 dark:border-amber-500'
                                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 border-transparent'
                            }`}
                            onClick={() => navigate(val.link)}
                        >
                            <div className="pr-2">{val.icon}</div>
                            <div>{val.title}</div>
                        </li>
                    );
                })}
            </ul>
            <button
                onClick={toggleTheme}
                className="mt-auto mb-4 p-2 rounded-lg cursor-pointer text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 self-start"
            >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
        </div>
    );
}

export default Sidebar;
