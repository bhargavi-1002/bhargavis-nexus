import React, { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';

interface Friend {
  _id: string;
  username: string;
  rating: number;
  online?: boolean;
}

interface FriendRequest {
  _id: string;
  from: string;
  username: string;
  status: 'pending' | 'accepted';
}

const FriendsList: React.FC = () => {
  const { isLoading, error, get, post } = useApi();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Friend[]>([]);
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'search'>('friends');

  useEffect(() => {
    const fetchData = async () => {
      const friendResult = await get('/api/users/friends/list');
      if (friendResult.success) setFriends(friendResult.data);

      const requestResult = await get('/api/users/friend-requests/pending');
      if (requestResult.success) setRequests(requestResult.data);
    };

    fetchData();
  }, [get]);

  const handleSearch = async (query: string) => {
    if (!query) {
      setSearchResults([]);
      return;
    }

    const result = await get(`/api/users/search/${query}`);
    if (result.success) setSearchResults(result.data);
  };

  const handleAddFriend = async (userId: string) => {
    const result = await post(`/api/users/friend-request/send`, { recipientId: userId });
    if (result.success) {
      alert('Friend request sent!');
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    const result = await post(`/api/users/friend-request/accept`, { requestId });
    if (result.success) {
      setRequests(requests.filter((r) => r._id !== requestId));
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 text-white">
      <h2 className="text-2xl font-bold mb-6">Friends</h2>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-600">
        <button
          onClick={() => setActiveTab('friends')}
          className={`px-4 py-2 ${activeTab === 'friends' ? 'border-b-2 border-yellow-500' : 'text-gray-400'}`}
        >
          Friends ({friends.length})
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 ${activeTab === 'requests' ? 'border-b-2 border-yellow-500' : 'text-gray-400'}`}
        >
          Requests ({requests.length})
        </button>
        <button
          onClick={() => setActiveTab('search')}
          className={`px-4 py-2 ${activeTab === 'search' ? 'border-b-2 border-yellow-500' : 'text-gray-400'}`}
        >
          Search
        </button>
      </div>

      {/* Content */}
      {activeTab === 'friends' && (
        <div className="space-y-2">
          {friends.length === 0 ? (
            <p className="text-gray-400">No friends yet. Search for players to add!</p>
          ) : (
            friends.map((friend) => (
              <div key={friend._id} className="bg-gray-700 p-3 rounded-lg flex justify-between items-center">
                <div>
                  <p className="font-bold">{friend.username}</p>
                  <p className="text-sm text-gray-400">Rating: {friend.rating}</p>
                </div>
                <div className={`w-3 h-3 rounded-full ${friend.online ? 'bg-green-500' : 'bg-gray-500'}`} />
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="space-y-2">
          {requests.length === 0 ? (
            <p className="text-gray-400">No pending requests</p>
          ) : (
            requests.map((request) => (
              <div key={request._id} className="bg-gray-700 p-3 rounded-lg flex justify-between items-center">
                <div>
                  <p className="font-bold">{request.username}</p>
                  <p className="text-sm text-gray-400">Sent you a friend request</p>
                </div>
                <button
                  onClick={() => handleAcceptRequest(request._id)}
                  className="bg-green-600 hover:bg-green-700 px-4 py-1 rounded-lg text-sm"
                >
                  Accept
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'search' && (
        <div>
          <input
            type="text"
            placeholder="Search players..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              handleSearch(e.target.value);
            }}
            className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg mb-4"
          />

          <div className="space-y-2">
            {searchResults.length === 0 && searchQuery && <p className="text-gray-400">No results found</p>}
            {searchResults.map((user) => (
              <div key={user._id} className="bg-gray-700 p-3 rounded-lg flex justify-between items-center">
                <div>
                  <p className="font-bold">{user.username}</p>
                  <p className="text-sm text-gray-400">Rating: {user.rating}</p>
                </div>
                <button
                  onClick={() => handleAddFriend(user._id)}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-1 rounded-lg text-sm"
                >
                  Add
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && <div className="text-red-500 mt-4">Error: {error}</div>}
    </div>
  );
};

export default FriendsList;
