import React, { useEffect, useState } from 'react';

const ManageFood = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(null);
  const [currentDonor, setCurrentDonor] = useState({});
  const [locationMethod, setLocationMethod] = useState('manual');
  const [locationStatus, setLocationStatus] = useState('');
  const [dropdown, setDropdown] = useState(null);

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          setError('No token found');
          setLoading(false);
          return;
        }

        // Decode token to get user ID
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = atob(base64);
        const { id: userId } = JSON.parse(jsonPayload);

        // Fetch donations by user ID
        const response = await fetch(`/api/donor/userdonations/${userId}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setDonations(data);
      } catch (error) {
        setError('An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchDonations();
  }, []);

  const handleDropdownToggle = (dropdownName) => {
    setDropdown(dropdown === dropdownName ? null : dropdownName);
  };

  const fetchLocation = async (latitude, longitude) => {
    setLocationStatus('Fetching address...');
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
      const data = await response.json();
      if (data && data.address) {
        const { road, county, state, postcode, country } = data.address;
        setCurrentDonor(prevDonor => ({
          ...prevDonor,
          address: {
            street: road || '',
            city: county || '',
            state: state || '',
            postalCode: postcode || '',
            country: country || '',
          },
        }));
        setLocationStatus('Location fetched successfully!');
      } else {
        setLocationStatus('Failed to retrieve address.');
      }
    } catch (error) {
      console.error('Error fetching address:', error);
      setLocationStatus('Failed to acquire address.');
    }
  };

  const handleEditClick = (donor) => {
    setEditMode(donor._id);
    setCurrentDonor(donor);
    if (donor.latitude && donor.longitude) {
      fetchLocation(donor.latitude, donor.longitude);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/donor/${currentDonor._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(currentDonor),
      });
      if (response.ok) {
        const updatedDonor = await response.json();
        setDonations(donations.map(d => d._id === currentDonor._id ? updatedDonor : d));
        setEditMode(null);
      } else {
        throw new Error('Failed to update donation.');
      }
    } catch (error) {
      setError('Failed to update donation.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentDonor(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleLocationMethodChange = (method) => {
    setLocationMethod(method);
    if (method === 'auto' && navigator.geolocation) {
      setLocationStatus('Acquiring location...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentDonor(prevDonor => ({
            ...prevDonor,
            latitude,
            longitude,
          }));
          fetchLocation(latitude, longitude);
        },
        (error) => {
          console.error('Error obtaining location:', error);
          setLocationStatus('Failed to acquire location.');
        },
        {
          timeout: 10000,
          maximumAge: 0,
        }
      );
    }
  };

  const handleFoodItemChange = (index, e) => {
    const { name, value } = e.target;
    setCurrentDonor(prevDonor => {
      const updatedFoodItems = [...prevDonor.foodItems];
      updatedFoodItems[index] = {
        ...updatedFoodItems[index],
        [name]: value,
      };
      return {
        ...prevDonor,
        foodItems: updatedFoodItems,
      };
    });
  };

  const addFoodItem = () => {
    setCurrentDonor(prevDonor => ({
      ...prevDonor,
      foodItems: [
        ...prevDonor.foodItems,
        {
          type: 'Perishable',
          name: '',
          quantity: '',
          unit: 'kg',
          expiryDate: '',
        },
      ],
    }));
  };

  const removeFoodItem = (index) => {
    setCurrentDonor(prevDonor => {
      const updatedFoodItems = [...prevDonor.foodItems];
      updatedFoodItems.splice(index, 1);
      return {
        ...prevDonor,
        foodItems: updatedFoodItems,
      };
    });
  };

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="flex">
      {/* Sidebar */}
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
                <li><a href="#" className="block py-2 px-4 hover:bg-gray-700 rounded">Add Food</a></li>
                <li><a href="/managefood" className="block py-2 px-4 hover:bg-gray-700 rounded">Manage Food</a></li>
              </ul>
            )}
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Manage Donations</h1>
        {donations.length === 0 ? (
          <p>No donations found.</p>
        ) : (
          <ul>
            {donations.map((donation) => (
              <li key={donation._id} className="border p-4 mb-4 rounded">
                {editMode === donation._id ? (
                  <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                    <input
                      type="text"
                      name="name"
                      placeholder="Name"
                      value={currentDonor.name}
                      onChange={handleChange}
                      className="bg-gray-100 p-2 rounded mb-2 w-full"
                    />
                    <input
                      type="email"
                      name="email"
                      placeholder="Email"
                      value={currentDonor.email}
                      onChange={handleChange}
                      className="bg-gray-100 p-2 rounded mb-2 w-full"
                    />
                    <input
                      type="tel"
                      name="contactNumber"
                      placeholder="Contact Number"
                      value={currentDonor.contactNumber}
                      onChange={handleChange}
                      className="bg-gray-100 p-2 rounded mb-2 w-full"
                    />

                    {/* Location Method Selection */}
                    <div className="flex gap-4 mb-4">
                      <button
                        type="button"
                        onClick={() => handleLocationMethodChange('auto')}
                        className={`p-2 rounded-lg ${locationMethod === 'auto' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                      >
                        Use Current Location
                      </button>
                      <button
                        type="button"
                        onClick={() => handleLocationMethodChange('manual')}
                        className={`p-2 rounded-lg ${locationMethod === 'manual' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                      >
                        Enter Address Manually
                      </button>
                    </div>

                    {/* Address Fields */}
                    {locationMethod === 'manual' && (
                      <>
                        <input
                          type="text"
                          name="street"
                          placeholder="Street"
                          value={currentDonor.address?.street || ''}
                          onChange={handleChange}
                          className="bg-gray-100 p-2 rounded mb-2 w-full"
                        />
                        <input
                          type="text"
                          name="city"
                          placeholder="City"
                          value={currentDonor.address?.city || ''}
                          onChange={handleChange}
                          className="bg-gray-100 p-2 rounded mb-2 w-full"
                        />
                        <input
                          type="text"
                          name="state"
                          placeholder="State"
                          value={currentDonor.address?.state || ''}
                          onChange={handleChange}
                          className="bg-gray-100 p-2 rounded mb-2 w-full"
                        />
                        <input
                          type="text"
                          name="postalCode"
                          placeholder="Postal Code"
                          value={currentDonor.address?.postalCode || ''}
                          onChange={handleChange}
                          className="bg-gray-100 p-2 rounded mb-2 w-full"
                        />
                        <input
                          type="text"
                          name="country"
                          placeholder="Country"
                          value={currentDonor.address?.country || ''}
                          onChange={handleChange}
                          className="bg-gray-100 p-2 rounded mb-2 w-full"
                        />
                      </>
                    )}

                    <div className="text-sm text-gray-600">{locationStatus}</div>

                    {/* Food Items */}
                    {currentDonor.foodItems.map((item, index) => (
                      <div key={index} className="border p-4 rounded mb-4">
                        <input
                          type="text"
                          name="name"
                          placeholder="Food Item Name"
                          value={item.name}
                          onChange={(e) => handleFoodItemChange(index, e)}
                          className="bg-gray-100 p-2 rounded mb-2 w-full"
                        />
                        <input
                          type="number"
                          name="quantity"
                          placeholder="Quantity"
                          value={item.quantity}
                          onChange={(e) => handleFoodItemChange(index, e)}
                          className="bg-gray-100 p-2 rounded mb-2 w-full"
                        />
                        <input
                          type="date"
                          name="expiryDate"
                          placeholder="Expiry Date"
                          value={item.expiryDate}
                          onChange={(e) => handleFoodItemChange(index, e)}
                          className="bg-gray-100 p-2 rounded mb-2 w-full"
                        />
                        <button
                          type="button"
                          onClick={() => removeFoodItem(index)}
                          className="bg-red-500 text-white p-2 rounded mt-2"
                        >
                          Remove Food Item
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addFoodItem}
                      className="bg-green-500 text-white p-2 rounded"
                    >
                      Add Food Item
                    </button>

                    <input
                      type="date"
                      name="availableUntil"
                      placeholder="Available Until"
                      value={currentDonor.availableUntil}
                      onChange={handleChange}
                      className="bg-gray-100 p-2 rounded mt-4 w-full"
                    />

                    <button
                      type="submit"
                      className="bg-blue-500 text-white p-2 rounded mt-4"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditMode(null)}
                      className="bg-gray-500 text-white p-2 rounded ml-2 mt-4"
                    >
                      Cancel
                    </button>
                  </form>
                ) : (
                  <>
                    <p><strong>Name:</strong> {donation.name}</p>
                    <p><strong>Email:</strong> {donation.email}</p>
                    <p><strong>Contact Number:</strong> {donation.contactNumber}</p>
                    <p><strong>Address:</strong> {donation.address?.street}, {donation.address?.city}, {donation.address?.state}, {donation.address?.postalCode}, {donation.address?.country}</p>
                    <p><strong>Available Until:</strong> {donation.availableUntil}</p>
                    {donation.foodItems.map((item, index) => (
                      <div key={index} className="border p-4 mb-2 rounded">
                        <p><strong>Food Item Name:</strong> {item.name}</p>
                        <p><strong>Quantity:</strong> {item.quantity} {item.unit}</p>
                        <p><strong>Expiry Date:</strong> {item.expiryDate}</p>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => handleEditClick(donation)}
                      className="bg-blue-500 text-white p-2 rounded"
                    >
                      Edit
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ManageFood;