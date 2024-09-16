import React, { useState } from 'react';

export default function Donate() {
  const [dropdown, setDropdown] = useState(null);
  const handleDropdownToggle = (dropdownName) => {
    setDropdown(dropdown === dropdownName ? null : dropdownName);
  };
  return (
    <>
    <div className='flex'>
    <div className="w-1/5 bg-blue-500 text-white p-4">
      <ul>
        {/* Requests Dropdown */}
        <li>
          <button
            onClick={() => handleDropdownToggle('requests')}
            className="w-full text-left py-2 px-4 hover:bg-gray-700 rounded focus:outline-none"
          >
            Requests
          </button>
          {dropdown === 'requests' && (
            <ul className="bg-blue-600 rounded mt-1">
              <li><a href="#new" className="block py-2 px-4 hover:bg-gray-700 rounded">New</a></li>
              <li><a href="#picked" className="block py-2 px-4 hover:bg-gray-700 rounded">Picked/Completed</a></li>
              <li><a href="#rejected" className="block py-2 px-4 hover:bg-gray-700 rounded">Rejected</a></li>
              <li><a href="#all" className="block py-2 px-4 hover:bg-gray-700 rounded">All</a></li>
            </ul>
          )}
        </li>

        {/* List Your Food Details Dropdown */}
        <li>
          <button
            onClick={() => handleDropdownToggle('foodDetails')}
            className="w-full text-left py-2 px-4 hover:bg-gray-700 rounded focus:outline-none"
          >
            List Your Food Details
          </button>
          {dropdown === 'foodDetails' && (
            <ul className="bg-blue-600 rounded mt-1">
              <li><a href="/addfood" className="block py-2 px-4 hover:bg-gray-700 rounded">Add Food</a></li>
              <li><a href="#manageFood" className="block py-2 px-4 hover:bg-gray-700 rounded">Manage Food</a></li>
            </ul>
          )}
        </li>
      </ul>
    </div>
    <div className='text-6xl ml-4 font-bold text-teal-700'>Donate and make poor lives helpful</div>
    </div>
    </>
  )
}
