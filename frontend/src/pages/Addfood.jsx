import React, { useState } from 'react';

const Addfood = () => {
  const initialFormData = {
    name: '',
    email: '',
    contactNumber: '',
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
    },
    latitude: '',
    longitude: '',
    foodItems: [
      {
        type: 'Perishable',
        name: '',
        quantity: '',
        unit: 'kg',
        expiryDate: '',
      },
    ],
    availableUntil: '',
  };

  const [formData, setFormData] = useState(initialFormData);
  const [locationMethod, setLocationMethod] = useState('manual'); // 'manual' or 'auto'
  const [locationStatus, setLocationStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [dropdown, setDropdown] = useState(null);


  const handleDropdownToggle = (dropdownName) => {
    setDropdown(dropdown === dropdownName ? null : dropdownName);
  };
  
  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (['street', 'city', 'state', 'postalCode', 'country'].includes(name)) {
      setFormData((prevData) => ({
        ...prevData,
        address: {
          ...prevData.address,
          [name]: value,
        },
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  // Handle location method selection
  const handleLocationMethodChange = (method) => {
    setLocationMethod(method);
    if (method === 'auto') {
      handleUseLocation();
    }
  };

  // Use the browser's geolocation API
  const handleUseLocation = () => {
    if (navigator.geolocation) {
      setLocationStatus('Acquiring location...');
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setFormData((prevData) => ({
            ...prevData,
            latitude,
            longitude,
          }));

          // Fetch address from Nominatim API
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            if (data && data.address) {
              const { road, county, state, postcode, country } = data.address;
              setFormData((prevData) => ({
                ...prevData,
                address: {
                  street: road || '',
                  city: county || '',
                  state: state || '',
                  postalCode: postcode || '',
                  country: country || '',
                },
              }));
              setLocationStatus('Location acquired successfully!');
            } else {
              setLocationStatus('Failed to retrieve address.');
            }
          } catch (error) {
            console.error('Error fetching address:', error);
            setLocationStatus('Failed to acquire address.');
          }
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
    } else {
      setLocationStatus('Geolocation is not supported by this browser.');
    }
  };

  // Add a new food item
  const addFoodItem = () => {
    setFormData((prevData) => ({
      ...prevData,
      foodItems: [
        ...prevData.foodItems,
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

  // Handle removing a food item
  const removeFoodItem = (index) => {
    setFormData((prevData) => {
      const updatedFoodItems = [...prevData.foodItems];
      updatedFoodItems.splice(index, 1); // Remove the item at the given index
      return {
        ...prevData,
        foodItems: updatedFoodItems,
      };
    });
  };

  // Handle food item changes
  const handleFoodItemChange = (index, e) => {
    const { name, value } = e.target;
    setFormData((prevData) => {
      const updatedFoodItems = [...prevData.foodItems];
      updatedFoodItems[index] = {
        ...updatedFoodItems[index],
        [name]: value,
      };
      return {
        ...prevData,
        foodItems: updatedFoodItems,
      };
    });
  };

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.contactNumber || !formData.availableUntil) {
      return 'Please fill out all required fields.';
    }
    for (const item of formData.foodItems) {
      if (!item.name || !item.quantity || !item.expiryDate) {
        return 'Please fill out all food item fields.';
      }
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }
    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');
    try {
      const res = await fetch('/api/donor/donorform', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMessage('Form submitted successfully!');
        setFormData(initialFormData);
      } else {
        setErrorMessage(data.message || 'Form submission failed. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrorMessage('An error occurred while submitting the form. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
        <h1 className="text-2xl font-semibold mb-4">Donor Form</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Personal Information */}
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleInputChange}
            className="bg-gray-100 p-2 rounded"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange}
            className="bg-gray-100 p-2 rounded"
          />
          <input
            type="tel"
            name="contactNumber"
            placeholder="Contact Number"
            value={formData.contactNumber}
            onChange={handleInputChange}
            className="bg-gray-100 p-2 rounded"
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
                value={formData.address.street}
                onChange={handleInputChange}
                className="bg-gray-100 p-2 rounded"
              />
              <input
                type="text"
                name="city"
                placeholder="City"
                value={formData.address.city}
                onChange={handleInputChange}
                className="bg-gray-100 p-2 rounded"
              />
              <input
                type="text"
                name="state"
                placeholder="State"
                value={formData.address.state}
                onChange={handleInputChange}
                className="bg-gray-100 p-2 rounded"
              />
              <input
                type="text"
                name="postalCode"
                placeholder="Postal Code"
                value={formData.address.postalCode}
                onChange={handleInputChange}
                className="bg-gray-100 p-2 rounded"
              />
              <input
                type="text"
                name="country"
                placeholder="Country"
                value={formData.address.country}
                onChange={handleInputChange}
                className="bg-gray-100 p-2 rounded"
              />
            </>
          )}

          <div className="text-sm text-gray-600">{locationStatus}</div>

          {/* Food Items */}
          {formData.foodItems.map((item, index) => (
            <div key={index} className="border p-4 rounded">
              <input
                type="text"
                name="name"
                placeholder="Food Item Name"
                value={item.name}
                onChange={(e) => handleFoodItemChange(index, e)}
                className="bg-gray-100 p-2 rounded mb-2"
              />
              <input
                type="number"
                name="quantity"
                placeholder="Quantity"
                value={item.quantity}
                onChange={(e) => handleFoodItemChange(index, e)}
                className="bg-gray-100 p-2 rounded mb-2"
              />
              <input
                type="date"
                name="expiryDate"
                placeholder="Expiry Date"
                value={item.expiryDate}
                onChange={(e) => handleFoodItemChange(index, e)}
                className="bg-gray-100 p-2 rounded mb-2"
              />
              <button
                type="button"
                onClick={() => removeFoodItem(index)}
                className="bg-red-500 text-white p-2 rounded"
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
            value={formData.availableUntil}
            onChange={handleInputChange}
            className="bg-gray-100 p-2 rounded"
          />

          {loading && <div>Loading...</div>}
          {successMessage && <div className="text-green-500">{successMessage}</div>}
          {errorMessage && <div className="text-red-500">{errorMessage}</div>}

          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default Addfood;