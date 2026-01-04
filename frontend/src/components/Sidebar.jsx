<div className="w-64 bg-blue-900 text-white flex flex-col">
        <div className="p-6 text-2xl font-bold border-b border-blue-800">
          ADMIN PANEL
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/admin/dashboard" className="flex items-center px-4 py-3 bg-blue-800 rounded-lg transition">
            <FaChartLine className="mr-3" /> Tổng quan
          </Link>
          
          <Link to="/admin/quotes" className="flex items-center px-4 py-3 hover:bg-blue-800 rounded-lg transition text-gray-300 hover:text-white">
            <FaClipboardList className="mr-3" /> Quản lý Báo giá
          </Link>

          <Link to="/admin/productlist" className="flex items-center px-4 py-3 hover:bg-blue-800 rounded-lg transition text-gray-300 hover:text-white">
            <FaBoxOpen className="mr-3" /> Quản lý Sản phẩm
          </Link>

          <Link to="/admin/users" className="flex items-center px-4 py-3 hover:bg-blue-800 rounded-lg transition text-gray-300 hover:text-white">
            <FaUsers className="mr-3" /> Quản lý User
          </Link>
        </nav>

        <div className="p-4 border-t border-blue-800">
          <button onClick={logoutHandler} className="flex items-center text-red-300 hover:text-white transition w-full">
            <FaSignOutAlt className="mr-3" /> Đăng xuất
          </button>
        </div>
      </div>