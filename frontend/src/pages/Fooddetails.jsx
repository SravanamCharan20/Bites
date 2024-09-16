import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const FoodDetails = () => {
  const { id } = useParams(); // Get the item ID from URL
  const [foodDetails, setFoodDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState(''); // Define this state
  const [successMessage, setSuccessMessage] = useState(''); // Define this state
  const [formData, setFormData] = useState({
    name: '',
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
    description: '',
  });
  const [locationMethod, setLocationMethod] = useState('manual'); // 'manual' or 'auto'
  const [locationStatus, setLocationStatus] = useState('');

  useEffect(() => {
    const fetchFoodDetails = async () => {
      try {
        const response = await fetch(`/api/donor/${id}`); // Adjust API endpoint to match your route
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setFoodDetails(data);
      } catch (error) {
        setError('Failed to load food details.');
      } finally {
        setLoading(false);
      }
    };

    fetchFoodDetails();
  }, [id]);

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

  const handleLocationMethodChange = (method) => {
    setLocationMethod(method);
    if (method === 'auto') {
      handleUseLocation();
    }
  };

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

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/donor/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          donorId: foodDetails._id,
          name: formData.name,
          contactNumber: formData.contactNumber,
          address: {
            street: formData.address.street,
            city: formData.address.city,
            state: formData.address.state,
            postalCode: formData.address.postalCode,
            country: formData.address.country,
          },
          latitude: formData.latitude || null, 
          longitude: formData.longitude || null, 
          description: formData.description,
        }),
      });
  
      const result = await response.json();
      if (response.ok) {
        setSuccessMessage(result.message);
        setFormData({
          name: '',
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
          description: '',
        });
      } else {
        setErrorMessage(result.message || 'Failed to submit request.');
      }
    } catch (error) {
      setErrorMessage('An error occurred while submitting the request.');
    }
  };


  if (loading) return <p className="text-center text-gray-500">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  if (!foodDetails) return <p className="text-center text-gray-500">No details available for this item.</p>;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return isNaN(date) ? 'Invalid Date' : date.toLocaleDateString();
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">Food Details</h2>
      <div className="bg-white shadow-md rounded px-8 py-6">
        <strong>Food Item Name:</strong> {foodDetails.foodItems?.map(item => (
          <div key={item._id} className="mb-4">
            <p><strong>Name:</strong> {item.name}</p>
            <p><strong>Quantity:</strong> {item.quantity}</p>
            <p><strong>Unit:</strong> {item.unit}</p>
            <p><strong>Expiry Date:</strong> {formatDate(item.expiryDate)}</p>
          </div>
        )) || 'N/A'}
        <p><strong>Available Until:</strong> {formatDate(foodDetails.availableUntil)}</p>
        <p><strong>Donor Name:</strong> {foodDetails.name || 'N/A'}</p>
        <p><strong>Contact Number:</strong> {foodDetails.contactNumber || 'N/A'}</p>
        <p><strong>Address:</strong> {foodDetails.address?.street || 'N/A'}, {foodDetails.address?.city || 'N/A'}, {foodDetails.address?.state || 'N/A'}, {foodDetails.address?.postalCode || 'N/A'}, {foodDetails.address?.country || 'N/A'}</p>
        <button
          onClick={() => setShowRequestForm((prev) => !prev)}
          className="bg-blue-500 text-white p-2 rounded mt-4"
        >
          {showRequestForm ? 'Cancel Request' : 'Request This Food'}
        </button>

        {showRequestForm && (
          <form onSubmit={handleRequestSubmit} className="mt-4 p-4 border border-gray-200 rounded">
            <h3 className="text-lg font-semibold mb-2">Request Form</h3>
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleInputChange}
              className="bg-gray-100 p-2 rounded mb-2 w-full"
              required
            />
            <input
              type="tel"
              name="contactNumber"
              placeholder="Contact Number"
              value={formData.contactNumber}
              onChange={handleInputChange}
              className="bg-gray-100 p-2 rounded mb-2 w-full"
              required
            />
            
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

            {locationMethod === 'manual' && (
              <>
                <input
                  type="text"
                  name="street"
                  placeholder="Street"
                  value={formData.address.street}
                  onChange={handleInputChange}
                  className="bg-gray-100 p-2 rounded mb-2 w-full"
                />
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  value={formData.address.city}
                  onChange={handleInputChange}
                  className="bg-gray-100 p-2 rounded mb-2 w-full"
                />
                <input
                  type="text"
                  name="state"
                  placeholder="State"
                  value={formData.address.state}
                  onChange={handleInputChange}
                  className="bg-gray-100 p-2 rounded mb-2 w-full"
                />
                <input
                  type="text"
                  name="postalCode"
                  placeholder="Postal Code"
                  value={formData.address.postalCode}
                  onChange={handleInputChange}
                  className="bg-gray-100 p-2 rounded mb-2 w-full"
                />
                <input
                  type="text"
                  name="country"
                  placeholder="Country"
                  value={formData.address.country}
                  onChange={handleInputChange}
                  className="bg-gray-100 p-2 rounded mb-2 w-full"
                />
              </>
            )}

            <div className="text-sm text-gray-600 mb-2">{locationStatus}</div>

            <textarea
              name="description"
              placeholder="Description"
              value={formData.description}
              onChange={handleInputChange}
              className="bg-gray-100 p-2 rounded mb-2 w-full"
            />
            <button
              type="submit"
              className="bg-blue-500 text-white p-2 rounded"
            >
              Submit Request
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default FoodDetails;