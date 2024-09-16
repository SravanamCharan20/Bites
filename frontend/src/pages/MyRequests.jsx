import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const MyRequests = () => {
  const { userId } = useParams();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [loadingRequestId, setLoadingRequestId] = useState(null); 
  const [loadingAction, setLoadingAction] = useState(''); 

  useEffect(() => {
    if (!userId) {
      setError('User ID is missing.');
      setLoading(false);
      return;
    }

    const fetchRequests = async () => {
      try {
        const response = await fetch(`/api/donor/requests/${userId}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setRequests(data);
      } catch (error) {
        setError('Failed to load requests.');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [userId]);

  const handleStatusChange = async (requestId, status) => {
    setLoadingRequestId(requestId); // Set loading for this request
    setLoadingAction(status); // Set loading action (Accept/Reject)
    try {
      const response = await fetch(`/api/donor/requests/${requestId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      setRequests(prevRequests =>
        prevRequests.map(request =>
          request._id === requestId ? { ...request, status } : request
        )
      );
    } catch (error) {
      console.error('Error updating status:', error);
      setError('Failed to update request status.');
    } finally {
      setLoadingRequestId(null); // Reset loading for this request
      setLoadingAction(''); // Reset loading action
    }
  };

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">My Requests</h2>
      <div className="bg-white shadow-md rounded px-8 py-6">
        {requests.length > 0 ? (
          requests.map(request => (
            <div key={request._id} className="mb-4">
              <p><strong>Requester Name:</strong> {request.requesterName}</p>
              <p><strong>Contact Number:</strong> {request.contactNumber}</p>
              <p><strong>Address:</strong> {`${request.address?.street || 'N/A'}, ${request.address?.city || 'N/A'}, ${request.address?.state || 'N/A'}, ${request.address?.postalCode || 'N/A'}, ${request.address?.country || 'N/A'}`}</p>
              <p><strong>Description:</strong> {request.description}</p>
              <p><strong>Latitude:</strong> {request.latitude || 'N/A'}</p>
              <p><strong>Longitude:</strong> {request.longitude || 'N/A'}</p>
              <p><strong>Status:</strong> {request.status || 'Pending'}</p>
              <div className="flex gap-2 mt-2">
                {request.status === 'Pending' && (
                  <>
                    <button
                      className="bg-green-500 text-white px-4 py-2 rounded"
                      onClick={() => handleStatusChange(request._id, 'Accepted')}
                      disabled={loadingRequestId === request._id && loadingAction !== 'Accepted'}
                    >
                      {loadingRequestId === request._id && loadingAction === 'Accepted' ? 'Accepting...' : 'Accept'}
                    </button>
                    <button
                      className="bg-red-500 text-white px-4 py-2 rounded"
                      onClick={() => handleStatusChange(request._id, 'Rejected')}
                      disabled={loadingRequestId === request._id && loadingAction !== 'Rejected'}
                    >
                      {loadingRequestId === request._id && loadingAction === 'Rejected' ? 'Rejecting...' : 'Reject'}
                    </button>
                  </>
                )}
                {request.status === 'Accepted' && (
                  <button
                    className="bg-green-500 text-white px-4 py-2 rounded"
                    disabled
                  >
                    Accepted
                  </button>
                )}
                {request.status === 'Rejected' && (
                  <button
                    className="bg-red-500 text-white px-4 py-2 rounded"
                    disabled
                  >
                    Rejected
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center">No requests found.</p>
        )}
      </div>
    </div>
  );
};

export default MyRequests;