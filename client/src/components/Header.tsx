import React from 'react';
import { LogOut } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { useNavigate } from 'react-router-dom';


const Header = () => {
    const { isAdmin, logout } = useAdmin();
    const navigate = useNavigate();
    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="flex flex-row bg-green-300 p-1 w-auto h-auto animate-fade-in-fast sticky top-0 z-50 sm:h-10 sm:text-2xl lg:h-16 lg:text-4xl">
            <div className="container mx-auto py-4 px-4 flex justify-between items-center">
                <h1 className="font-extrabold font-Sour">
                <i className="ri-leaf-line ml-2 text-green-700"></i>
                    <span className="text-slate-100">Plant</span>
                    <span className="text-green-700">Flow</span>
                </h1>

                <div className="flex items-center space-x-4">
                    {isAdmin && (
                        <button className="text-green-700 hover:text-green-800 transition-colors" 
                                onClick={handleLogout}>
                            <LogOut />
                        </button>
                    )}
                </div>
            </div>  
        </header>
    );
};

export default Header;