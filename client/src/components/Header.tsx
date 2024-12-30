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
        <header className="flex flex-row bg-green-300 p-1 w-auto h-auto animate-fade-in-fast sticky top-0 z-50 sm:h-16 lg:h-20">
            <div className="container mx-auto py-4 px-4 flex justify-between items-center">
                <h1 className="text-4xl text-white font-extrabold font-Sour sm:text-2xl lg:text-4xl">PlantFlow</h1>

                <div className="flex items-center space-x-4">
                    {isAdmin && (
                        <button className="text-white" onClick={handleLogout}>
                            <LogOut />
                        </button>
                    )}
                </div>

            </div>  
        </header>
    );
};

export default Header;