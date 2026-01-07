import React from 'react';

interface Device {
  id: string;
  name: string;
  createdAt: string;
  lastUsedAt: string | null;
}

interface DeviceListProps {
  devices: Device[];
  onRemove: (id: string) => void;
}

const DeviceList: React.FC<DeviceListProps> = ({ devices, onRemove }) => {
  if (devices.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No devices</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by adding your first authenticator device.
        </p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {devices.map((device) => (
          <li key={device.id}>
            <div className="px-4 py-4 flex items-center justify-between sm:px-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 mr-4">
                  <svg
                    className="h-8 w-8 text-indigo-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-indigo-600">{device.name}</p>
                  <p className="mt-1 flex items-center text-xs text-gray-500">
                    <span>Added: {formatDate(device.createdAt)}</span>
                    {device.lastUsedAt && (
                      <>
                        <span className="mx-2">•</span>
                        <span>Last used: {formatDate(device.lastUsedAt)}</span>
                      </>
                    )}
                  </p>
                </div>
              </div>
              <div>
                <button
                  onClick={() => onRemove(device.id)}
                  className="text-red-600 hover:text-red-900 text-sm font-medium"
                >
                  Remove
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DeviceList;
