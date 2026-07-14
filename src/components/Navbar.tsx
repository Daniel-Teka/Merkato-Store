import React, { useState } from "react";
import { ShoppingCart, Heart, User, Bell, Sun, Moon, Menu, X, LogOut, Settings, Tv, Tag } from "lucide-react";
import { User as UserType, Notification } from "../types";

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, id?: string) => void;
  cartCount: number;
  wishlistCount: number;
  user: UserType | null;
  onLogout: () => void;
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
}

export default function Navbar({
  currentView,
  onNavigate,
  cartCount,
  wishlistCount,
  user,
  onLogout,
  notifications,
  onMarkRead,
  onMarkAllRead,
  theme,
  toggleTheme,
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const unreadNotifs = notifications.filter((n) => !n.read);

  const navItems = [
    { label: "Home", view: "home" },
    { label: "Products", view: "products" },
    { label: "About Us", view: "about" },
    { label: "Contact", view: "contact" },
  ];

  const handleNavClick = (view: string) => {
    onNavigate(view);
    setMobileOpen(false);
  };

  return (
    <header id="merkato-navbar" className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur-md transition-colors dark:border-gray-800 dark:bg-dark-900/95">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* Logo */}
          <button
            onClick={() => handleNavClick("home")}
            className="flex items-center gap-2 font-display text-2xl font-bold tracking-tight text-gray-900 dark:text-white"
          >
            <span className="bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-500 bg-clip-text text-transparent">
              MERKATO
            </span>
            <span className="hidden text-xs font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 sm:inline-block">
              Market
            </span>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <button
                key={item.view}
                onClick={() => handleNavClick(item.view)}
                className={`relative px-1 py-2 text-sm font-medium transition-colors hover:text-amber-500 dark:hover:text-amber-400 ${
                  currentView === item.view
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-gray-600 dark:text-gray-300"
                }`}
              >
                {item.label}
                {currentView === item.view && (
                  <span className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-amber-500 to-yellow-400" />
                )}
              </button>
            ))}
          </nav>

          {/* Action Icons Panel */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-amber-500 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-amber-400"
              title="Toggle Theme"
            >
              {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            {/* Wishlist ❤️ */}
            <button
              onClick={() => handleNavClick("wishlist")}
              className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-red-500 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-red-400"
              title="Wishlist"
            >
              <Heart size={20} className={wishlistCount > 0 ? "fill-red-500 text-red-500" : ""} />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart 🛒 */}
            <button
              onClick={() => handleNavClick("cart")}
              className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-amber-500 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-amber-400"
              title="Shopping Cart"
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Notifications 🔔 */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotifDropdownOpen(!notifDropdownOpen);
                  setProfileDropdownOpen(false);
                }}
                className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-amber-500 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-amber-400"
                title="Notifications"
              >
                <Bell size={20} />
                {unreadNotifs.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-dark-900" />
                )}
              </button>

              {notifDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-xl border border-gray-100 bg-white shadow-xl dark:border-gray-800 dark:bg-dark-800">
                  <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2 dark:border-gray-700">
                    <span className="font-display text-sm font-semibold text-gray-900 dark:text-white">
                      Notifications ({unreadNotifs.length})
                    </span>
                    {unreadNotifs.length > 0 && (
                      <button
                        onClick={onMarkAllRead}
                        className="text-xs font-medium text-amber-600 hover:text-amber-500 dark:text-amber-400"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-6 text-center text-xs text-gray-500">
                        No notifications yet
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => {
                            onMarkRead(notif.id);
                            if (notif.type === "low_stock") {
                              handleNavClick("admin");
                            }
                          }}
                          className={`flex flex-col gap-1 border-b border-gray-50 px-4 py-3 cursor-pointer transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/50 ${
                            !notif.read ? "bg-amber-50/40 dark:bg-amber-950/20" : ""
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className={`text-xs font-semibold ${
                              notif.type === "low_stock" ? "text-red-600 dark:text-red-400" : "text-gray-900 dark:text-white"
                            }`}>
                              {notif.title}
                            </span>
                            {!notif.read && (
                              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500 mt-1" />
                            )}
                          </div>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2">
                            {notif.message}
                          </p>
                          <span className="text-[9px] text-gray-400">
                            {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Dropdown 👤 */}
            <div className="relative">
              <button
                onClick={() => {
                  setProfileDropdownOpen(!profileDropdownOpen);
                  setNotifDropdownOpen(false);
                }}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 p-1.5 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
                title="Profile Menu"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 text-sm font-bold text-white">
                  {user ? user.name.charAt(0) : <User size={16} />}
                </div>
                {user && (
                  <span className="hidden max-w-[80px] truncate text-xs font-medium text-gray-700 dark:text-gray-300 lg:inline-block">
                    {user.name}
                  </span>
                )}
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-gray-100 bg-white py-1 shadow-xl dark:border-gray-800 dark:bg-dark-800">
                  {user ? (
                    <>
                      <div className="border-b border-gray-100 px-4 py-2.5 dark:border-gray-700">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.name}</p>
                        <p className="truncate text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                        {user.role === "admin" && (
                          <span className="mt-1 inline-block rounded bg-red-100 px-1.5 py-0.5 text-[9px] font-bold text-red-800 dark:bg-red-900/30 dark:text-red-400">
                            ADMIN ACCOUNT
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          handleNavClick("dashboard");
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        <User size={16} /> My Dashboard
                      </button>
                      {user.role === "admin" && (
                        <button
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            handleNavClick("admin");
                          }}
                          className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20"
                        >
                          <Settings size={16} /> Admin panel
                        </button>
                      )}
                      <div className="border-t border-gray-100 dark:border-gray-700" />
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          onLogout();
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        <LogOut size={16} /> Log Out
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          handleNavClick("login");
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        <User size={16} /> Log In / Register
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 md:hidden dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileOpen && (
        <div className="border-t border-gray-100 bg-white py-3 md:hidden dark:border-gray-800 dark:bg-dark-900">
          <div className="flex flex-col gap-2 px-4">
            {navItems.map((item) => (
              <button
                key={item.view}
                onClick={() => handleNavClick(item.view)}
                className={`w-full py-2 text-left text-base font-medium ${
                  currentView === item.view
                    ? "text-amber-500"
                    : "text-gray-600 dark:text-gray-300"
                }`}
              >
                {item.label}
              </button>
            ))}
            {user && (
              <>
                <div className="my-2 border-t border-gray-100 dark:border-gray-800" />
                <button
                  onClick={() => handleNavClick("dashboard")}
                  className="w-full py-2 text-left text-base font-medium text-gray-600 dark:text-gray-300"
                >
                  My Dashboard
                </button>
                {user.role === "admin" && (
                  <button
                    onClick={() => handleNavClick("admin")}
                    className="w-full py-2 text-left text-base font-medium text-red-600 dark:text-red-400"
                  >
                    Admin panel
                  </button>
                )}
                <button
                  onClick={() => {
                    onLogout();
                    setMobileOpen(false);
                  }}
                  className="w-full py-2 text-left text-base font-medium text-gray-600 dark:text-gray-300"
                >
                  Log Out
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
