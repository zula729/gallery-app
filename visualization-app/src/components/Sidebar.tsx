import { useNavigate, useLocation } from 'react-router';
import { SidebarData } from './SidebarData';
import { useTheme } from '../hooks/useTheme';
import { Sun, Moon } from 'lucide-react';

function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="sidebar h-screen w-52 pt-4 pr-3 pl-3 shadow-lg dark:bg-dark-surface flex flex-col">
            <p
                className="px-3 text-xl font-semibold uppercase tracking-widest text-gray-800 dark:text-dark-text mb-2 pb-4 cursor-pointer"
                onClick={() => navigate('/')}
            >
                PV251 Projects
            </p>
            <p className="px-3 text-xs font-semibold uppercase tracking-widest text-gray-800 dark:text-dark-text mb-2">
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
                            transition-all duration-150 ease-in-out
                            ${
                                isActive
                                    ? 'bg-[#FFF7D6] dark:bg-amber-800/40 text-amber-700 dark:text-[#FFE082]'
                                    : 'text-gray-500 dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-surface hover:text-gray-900 dark:hover:text-[#EBEBEB]'
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
                className="mt-auto group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer mb-2 transition-all
                text-gray-500 dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-surface hover:text-gray-900 dark:hover:text-dark-text"
            >
                <div className="pr-2">
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </div>
                <div>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</div>
            </button>
        </div>
    );
}

export default Sidebar;
