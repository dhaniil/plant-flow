
import { NavLink } from 'react-router-dom';
import 'remixicon/fonts/remixicon.css';
import '../App.css';
import React from 'react';




const BottomNav = () => {
  return (
    <div className="sticky z-10 bottom-0 left-0 right-0 bg-green-400 text-white p-1">
      <div className="flex justify-center lg:gap-12 md:gap-4 sm:justify-around gap-6">
        <NavLink
          to="/"
          className={({ isActive }) =>`p-2 bottom-nav flex flex-col items-center ${isActive ? "bottom-nav-active" : ""}`}
        >
          <i className="text-white ri-home-line text-2xl"></i>
        </NavLink>
        <NavLink
            to="/devices"
            className={({ isActive }) =>`p-2 bottom-nav flex flex-col items-center ${isActive ? "bottom-nav-active" : ""}`}
        >
            <i className="text-white ri-computer-line text-2xl"></i>

        </NavLink>
        <div  className="flex w-14 h-14 items-center justify-center logo rounded-full item bg-white text-green-400 p-2 border-2 absolute border-green-400 -mt-6 mx overflow-hidden ">
          <NavLink
            to="/login"
            className="p-2 bottom-nav flex flex-col items-center">
            <i className="ri-leaf-line text-2xl"></i>
          </NavLink>
        </div>

        <div className="lg:mx-6 mx-4"></div>
        <NavLink
          to="/graphs"
          className={({ isActive }) =>`p-2 bottom-nav flex flex-col items-center ${isActive ? "bottom-nav-active" : ""}`}
          >
          <i className="text-white ri-line-chart-line text-2xl"></i>
        </NavLink>
        <NavLink
          to="/schedule"
          className={({ isActive }) =>`p-2 bottom-nav flex flex-col items-center ${isActive ? "bottom-nav-active" : ""}`}
        >
          <i className="text-white ri-calendar-line text-2xl"></i>
        </NavLink>
      </div>
    </div>
  );
};

export default BottomNav;

