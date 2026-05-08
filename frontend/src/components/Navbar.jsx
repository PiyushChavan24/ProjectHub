/** @format */

// /** @format */

// // import { useNavigate, NavLink } from 'react-router-dom';
// // import { useAuth } from '../context/AuthContext';

// // const ROLE_LABELS = { student: 'Student', mentor: 'Mentor', admin: 'Admin' };
// // const ROLE_COLORS = {
// //   student: 'bg-blue-100 text-blue-700',
// //   mentor: 'bg-green-100 text-green-700',
// //   admin: 'bg-purple-100 text-purple-700',
// // };

// // export default function Navbar() {
// //   const { auth, logout } = useAuth();
// //   const navigate = useNavigate();

// //   const handleLogout = () => {
// //     logout();
// //     navigate('/login');
// //   };

// //   if (!auth) return null;

// //   return (
// //     <nav className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-sm">
// //       <div className="flex items-center gap-3">
// //         <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
// //           <span className="text-white font-bold text-sm">R</span>
// //         </div>
// //         <span className="font-semibold text-slate-800 text-lg">RBAC System</span>
// //       </div>

// //       {/* Centre nav links */}
// //       <div className="flex items-center gap-1">
// //         <NavLink
// //           to="/gallery"
// //           className={({ isActive }) =>
// //             `flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg transition-colors ${
// //               isActive
// //                 ? 'bg-indigo-50 text-indigo-600'
// //                 : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
// //             }`
// //           }
// //         >
// //           🖼️ Project Gallery
// //         </NavLink>
// //       </div>

// //       <div className="flex items-center gap-4">
// //         <span className="text-slate-600 text-sm">Hello, <strong>{auth.user.name}</strong></span>
// //         <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${ROLE_COLORS[auth.user.role]}`}>
// //           {ROLE_LABELS[auth.user.role]}
// //         </span>
// //         <button
// //           onClick={handleLogout}
// //           className="text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-1.5 rounded-lg transition-colors"
// //         >
// //           Logout
// //         </button>
// //       </div>
// //     </nav>
// //   );
// // }

// import { useEffect, useState } from "react";
// import { useNavigate, NavLink } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";
// import { Menu, X, Sparkles } from "lucide-react";

// const ROLE_LABELS = { student: "Student", mentor: "Mentor", admin: "Admin" };
// const ROLE_COLORS = {
//  student: "bg-blue-100 text-blue-700",
//  mentor: "bg-green-100 text-green-700",
//  admin: "bg-purple-100 text-purple-700",
// };

// export default function Navbar() {
//  const { auth, logout } = useAuth();
//  const navigate = useNavigate();
//  const [scrolled, setScrolled] = useState(false);
//  const [open, setOpen] = useState(false);

//  useEffect(() => {
//   const onScroll = () => setScrolled(window.scrollY > 12);
//   onScroll();
//   window.addEventListener("scroll", onScroll, { passive: true });
//   return () => window.removeEventListener("scroll", onScroll);
//  }, []);

//  const handleLogout = () => {
//   logout();
//   navigate("/login");
//  };

//  if (!auth) return null;

//  return (
//   <header
//    className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
//     scrolled
//      ? "bg-white/70 backdrop-blur-xl border-b border-slate-200/60 shadow-sm"
//      : "bg-transparent"
//    }`}>
//    <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
//     {/* Logo */}
//     <div className="group flex items-center gap-2 text-lg font-semibold tracking-tight">
//      <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-600 text-white transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110">
//       <Sparkles className="h-4 w-4" />
//      </span>
//      <span className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
//       ProjectHub
//      </span>
//     </div>

//     {/* Desktop Navigation */}
//     <ul className="hidden items-center gap-1 md:flex">
//      <li
//       className="animate-fade-in opacity-0"
//       style={{
//        animationDelay: "0ms",
//        animationFillMode: "forwards",
//       }}>
//       <NavLink
//        to="/gallery"
//        className={({ isActive }) =>
//         `relative rounded-md px-4 py-2 text-sm font-medium transition-colors ${
//          isActive ? "text-indigo-600" : "text-slate-600 hover:text-slate-900"
//         }`
//        }>
//        🖼️ Project Gallery
//       </NavLink>
//      </li>
//     </ul>

//     {/* Desktop User Info & Actions */}
//     <div className="hidden md:flex items-center gap-4">
//      <span className="text-slate-600 text-sm">
//       Hello, <strong>{auth.user.name}</strong>
//      </span>
//      <span
//       className={`text-xs font-medium px-2.5 py-1 rounded-full ${
//        ROLE_COLORS[auth.user.role]
//       }`}>
//       {ROLE_LABELS[auth.user.role]}
//      </span>
//      <button
//       onClick={handleLogout}
//       className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md hover:scale-105">
//       Logout
//      </button>
//     </div>

//     {/* Mobile Menu Button */}
//     <button
//      aria-label="Toggle menu"
//      onClick={() => setOpen((v) => !v)}
//      className="md:hidden rounded-md p-2 text-slate-900 transition-colors hover:bg-slate-100">
//      <div className="relative h-5 w-5">
//       <Menu
//        className={`absolute inset-0 h-5 w-5 transition-all duration-300 ${
//         open ? "rotate-90 opacity-0" : "rotate-0 opacity-100"
//        }`}
//       />
//       <X
//        className={`absolute inset-0 h-5 w-5 transition-all duration-300 ${
//         open ? "rotate-0 opacity-100" : "-rotate-90 opacity-0"
//        }`}
//       />
//      </div>
//     </button>
//    </nav>

//    {/* Mobile Menu */}
//    <div
//     className={`md:hidden overflow-hidden border-t border-slate-200/60 bg-white/90 backdrop-blur-xl transition-[max-height,opacity] duration-500 ease-out ${
//      open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
//     }`}>
//     <ul className="flex flex-col gap-1 px-6 py-4">
//      <li
//       className={`transition-all duration-300 ${
//        open ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"
//       }`}
//       style={{ transitionDelay: open ? "0ms" : "0ms" }}>
//       <NavLink
//        to="/gallery"
//        onClick={() => setOpen(false)}
//        className={({ isActive }) =>
//         `block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
//          isActive
//           ? "bg-indigo-50 text-indigo-600"
//           : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
//         }`
//        }>
//        🖼️ Project Gallery
//       </NavLink>
//      </li>

//      {/* Mobile User Info */}
//      <li className="pt-4 pb-2 px-3 border-t border-slate-200 mt-2">
//       <div className="flex items-center justify-between mb-3">
//        <span className="text-slate-600 text-sm">
//         <strong>{auth.user.name}</strong>
//        </span>
//        <span
//         className={`text-xs font-medium px-2.5 py-1 rounded-full ${
//          ROLE_COLORS[auth.user.role]
//         }`}>
//         {ROLE_LABELS[auth.user.role]}
//        </span>
//       </div>
//       <button
//        onClick={() => {
//         setOpen(false);
//         handleLogout();
//        }}
//        className="w-full rounded-full bg-slate-900 px-5 py-2 text-center text-sm font-medium text-white">
//        Logout
//       </button>
//      </li>
//     </ul>
//    </div>
//   </header>
//  );
// }

/** @format */

import { useEffect, useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Menu, X, Sparkles, Sun, Moon } from "lucide-react";
import { useTheme } from "../hooks/useTheme";

const ROLE_LABELS = { student: "Student", mentor: "Mentor", admin: "Admin" };
const ROLE_COLORS = {
 student: "bg-blue-100 text-blue-700",
 mentor: "bg-green-100 text-green-700",
 admin: "bg-purple-100 text-purple-700",
};

export default function Navbar() {
 const { auth, logout } = useAuth();
 const navigate = useNavigate();
 const { dark, toggle } = useTheme();
 const [scrolled, setScrolled] = useState(false);
 const [open, setOpen] = useState(false);

 useEffect(() => {
  const onScroll = () => setScrolled(window.scrollY > 12);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  return () => window.removeEventListener("scroll", onScroll);
 }, []);

 const handleLogout = () => {
  logout();
  navigate("/login");
 };

 if (!auth) return null;

 return (
  <header
   className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
    scrolled
     ? "bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-700/60 shadow-sm"
     : "bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/40 dark:border-slate-700/40"
   }`}>
   <nav className="w-full flex items-center justify-between px-8 py-5">
    {/* Logo */}
    <NavLink to={`/${auth.user.role}`} className="group flex items-center gap-3 text-xl font-semibold tracking-tight">
     <span className="grid h-10 w-10 place-items-center rounded-lg bg-indigo-600 text-white transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110">
      <Sparkles className="h-5 w-5" />
     </span>
     <span className="bg-linear-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
      ProjectHub
     </span>
    </NavLink>

    {/* Desktop Navigation */}
    <ul className="hidden items-center gap-1 md:flex">
     <li className="animate-fade-in opacity-0" style={{ animationDelay: "0ms", animationFillMode: "forwards" }}>
      <NavLink
       to={`/${auth.user.role}`}
       className={({ isActive }) =>
        `relative rounded-md px-5 py-2.5 text-base font-medium transition-colors ${
         isActive
          ? "text-indigo-600 dark:text-indigo-400"
          : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
        }`
       }>
       My Projects
      </NavLink>
     </li>
     <li className="animate-fade-in opacity-0" style={{ animationDelay: "60ms", animationFillMode: "forwards" }}>
      <NavLink
       to="/gallery"
       className={({ isActive }) =>
        `relative rounded-md px-5 py-2.5 text-base font-medium transition-colors ${
         isActive
          ? "text-indigo-600 dark:text-indigo-400"
          : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
        }`
       }>
       Project Gallery
      </NavLink>
     </li>
     <li className="animate-fade-in opacity-0" style={{ animationDelay: "120ms", animationFillMode: "forwards" }}>
      <NavLink
       to="/saved"
       className={({ isActive }) =>
        `relative rounded-md px-5 py-2.5 text-base font-medium transition-colors ${
         isActive
          ? "text-indigo-600 dark:text-indigo-400"
          : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
        }`
       }>
       Saved
      </NavLink>
     </li>
    </ul>

    {/* Desktop: user info + dark toggle + logout */}
    <div className="hidden md:flex items-center gap-4">
     <span className="text-slate-600 dark:text-slate-300 text-base">
      Hello, <strong>{auth.user.name}</strong>
     </span>
     <span className={`text-sm font-medium px-3 py-1.5 rounded-full ${ROLE_COLORS[auth.user.role]}`}>
      {ROLE_LABELS[auth.user.role]}
     </span>
     <button
      onClick={toggle}
      aria-label="Toggle dark mode"
      className="rounded-full p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
      {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
     </button>
     <button
      onClick={handleLogout}
      className="inline-flex items-center justify-center rounded-full bg-slate-900 dark:bg-white dark:text-slate-900 px-6 py-2.5 text-base font-medium text-white shadow-sm transition-all hover:shadow-md hover:scale-105">
      Logout
     </button>
    </div>

    {/* Mobile: dark toggle + hamburger */}
    <div className="md:hidden flex items-center gap-2">
     <button
      onClick={toggle}
      aria-label="Toggle dark mode"
      className="rounded-md p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
      {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
     </button>
     <button
      aria-label="Toggle menu"
      onClick={() => setOpen((v) => !v)}
      className="rounded-md p-2 text-slate-900 dark:text-white transition-colors hover:bg-slate-100 dark:hover:bg-slate-800">
      <div className="relative h-6 w-6">
       <Menu className={`absolute inset-0 h-6 w-6 transition-all duration-300 ${open ? "rotate-90 opacity-0" : "rotate-0 opacity-100"}`} />
       <X className={`absolute inset-0 h-6 w-6 transition-all duration-300 ${open ? "rotate-0 opacity-100" : "-rotate-90 opacity-0"}`} />
      </div>
     </button>
    </div>
   </nav>

   {/* Mobile Menu */}
   <div
    className={`md:hidden overflow-hidden border-t border-slate-200/60 dark:border-slate-700/60 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl transition-[max-height,opacity] duration-500 ease-out ${
     open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
    }`}>
    <ul className="flex flex-col gap-1 px-8 py-5">
     <li className={`transition-all duration-300 ${open ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"}`}>
      <NavLink
       to={`/${auth.user.role}`}
       onClick={() => setOpen(false)}
       className={({ isActive }) =>
        `block rounded-md px-4 py-3 text-base font-medium transition-colors ${
         isActive
          ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
          : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
        }`
       }>
       My Projects
      </NavLink>
     </li>
     <li className={`transition-all duration-300 ${open ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"}`} style={{ transitionDelay: open ? "40ms" : "0ms" }}>
      <NavLink
       to="/gallery"
       onClick={() => setOpen(false)}
       className={({ isActive }) =>
        `block rounded-md px-4 py-3 text-base font-medium transition-colors ${
         isActive
          ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
          : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
        }`
       }>
       Project Gallery
      </NavLink>
     </li>
     <li className={`transition-all duration-300 ${open ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"}`} style={{ transitionDelay: open ? "80ms" : "0ms" }}>
      <NavLink
       to="/saved"
       onClick={() => setOpen(false)}
       className={({ isActive }) =>
        `block rounded-md px-4 py-3 text-base font-medium transition-colors ${
         isActive
          ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
          : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
        }`
       }>
       Saved
      </NavLink>
     </li>

     {/* Mobile User Info */}
     <li className="pt-5 pb-3 px-4 border-t border-slate-200 dark:border-slate-700 mt-3">
      <div className="flex items-center justify-between mb-4">
       <span className="text-slate-600 dark:text-slate-300 text-base">
        <strong>{auth.user.name}</strong>
       </span>
       <span className={`text-sm font-medium px-3 py-1.5 rounded-full ${ROLE_COLORS[auth.user.role]}`}>
        {ROLE_LABELS[auth.user.role]}
       </span>
      </div>
      <button
       onClick={() => { setOpen(false); handleLogout(); }}
       className="w-full rounded-full bg-slate-900 dark:bg-white dark:text-slate-900 px-6 py-3 text-center text-base font-medium text-white">
       Logout
      </button>
     </li>
    </ul>
   </div>
  </header>
 );
}
