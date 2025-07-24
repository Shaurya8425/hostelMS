import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "../../api/apiBase";

interface LinenStats {
  inventory: {
    bedsheet: number;
    bedsheetActive: number;
    bedsheetInHand: number;
    pillowCover: number;
    pillowActive: number;
    pillowInHand: number;
    blanket: number;
    blanketActive: number;
    blanketInHand: number;
  };
  issuedStats: {
    _count: {
      _all: number;
    };
  };
  recentIssues: Array<{
    id: number;
    name: string;
    email: string;
    bedsheetIssued: boolean;
    pillowIssued: boolean;
    blanketIssued: boolean;
    linenIssuedDate: string;
  }>;
}

export default function LinenDetails() {
  const [stats, setStats] = useState<LinenStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${API_BASE}/linen/stats`);
        setStats(response.data);
      } catch (err) {
        setError("Failed to fetch linen statistics");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading)
    return (
      <div className='p-8'>
        <div className='animate-pulse'>
          <div className='h-10 bg-gray-200 rounded w-1/3 mb-8'></div>

          {/* Cards Skeleton */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
            {[...Array(3)].map((_, i) => (
              <div key={i} className='bg-white rounded-lg shadow p-6'>
                <div className='h-6 bg-gray-200 rounded w-1/3 mb-4'></div>
                <div className='space-y-4'>
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className='flex justify-between items-center'>
                      <div className='h-4 bg-gray-200 rounded w-1/3'></div>
                      <div className='h-4 bg-gray-200 rounded w-16'></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Table Skeleton */}
          <div className='bg-white rounded-lg shadow'>
            <div className='px-6 py-4 border-b border-gray-200'>
              <div className='h-6 bg-gray-200 rounded w-1/4'></div>
            </div>
            <div className='p-6'>
              <div className='space-y-4'>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className='flex justify-between items-center'>
                    <div className='space-y-2'>
                      <div className='h-4 bg-gray-200 rounded w-32'></div>
                      <div className='h-3 bg-gray-200 rounded w-48'></div>
                    </div>
                    <div className='flex gap-2'>
                      {[...Array(3)].map((_, j) => (
                        <div
                          key={j}
                          className='h-6 bg-gray-200 rounded w-16'
                        ></div>
                      ))}
                    </div>
                    <div className='h-4 bg-gray-200 rounded w-24'></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className='p-8'>
        <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
          <p className='text-red-800'>{error}</p>
        </div>
      </div>
    );

  if (!stats) return null;

  return (
    <div className='p-8 max-w-7xl mx-auto'>
      <h1 className='text-3xl font-bold mb-8 text-blue-900'>
        Linen Inventory Management
      </h1>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
        {/* Bedsheets Stats */}
        <div className='bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-100'>
          <div className='flex items-center mb-4'>
            <svg
              className='w-6 h-6 text-blue-600 mr-2'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M20 12H4M20 12L16 8M20 12L16 16'
              />
            </svg>
            <h2 className='text-lg font-semibold text-blue-900'>Bedsheets</h2>
          </div>
          <div className='space-y-3'>
            <div className='flex justify-between items-center bg-gray-50 p-2 rounded'>
              <span className='text-gray-600'>Total Inventory:</span>
              <span className='font-medium text-blue-700'>
                {stats.inventory.bedsheet}
              </span>
            </div>
            <div className='flex justify-between items-center bg-gray-50 p-2 rounded'>
              <span className='text-gray-600'>In Use:</span>
              <span className='font-medium text-orange-600'>
                {stats.inventory.bedsheetActive}
              </span>
            </div>
            <div className='flex justify-between items-center bg-gray-50 p-2 rounded'>
              <span className='text-gray-600'>Available:</span>
              <span className='font-medium text-green-600'>
                {stats.inventory.bedsheetInHand}
              </span>
            </div>
          </div>
        </div>

        {/* Pillow Covers Stats */}
        <div className='bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-100'>
          <div className='flex items-center mb-4'>
            <svg
              className='w-6 h-6 text-green-600 mr-2'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M5 13l4 4L19 7'
              />
            </svg>
            <h2 className='text-lg font-semibold text-blue-900'>
              Pillow Covers
            </h2>
          </div>
          <div className='space-y-3'>
            <div className='flex justify-between items-center bg-gray-50 p-2 rounded'>
              <span className='text-gray-600'>Total Inventory:</span>
              <span className='font-medium text-blue-700'>
                {stats.inventory.pillowCover}
              </span>
            </div>
            <div className='flex justify-between items-center bg-gray-50 p-2 rounded'>
              <span className='text-gray-600'>In Use:</span>
              <span className='font-medium text-orange-600'>
                {stats.inventory.pillowActive}
              </span>
            </div>
            <div className='flex justify-between items-center bg-gray-50 p-2 rounded'>
              <span className='text-gray-600'>Available:</span>
              <span className='font-medium text-green-600'>
                {stats.inventory.pillowInHand}
              </span>
            </div>
          </div>
        </div>

        {/* Blankets Stats */}
        <div className='bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-100'>
          <div className='flex items-center mb-4'>
            <svg
              className='w-6 h-6 text-purple-600 mr-2'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M9 12l2 2 4-4'
              />
            </svg>
            <h2 className='text-lg font-semibold text-blue-900'>Blankets</h2>
          </div>
          <div className='space-y-3'>
            <div className='flex justify-between items-center bg-gray-50 p-2 rounded'>
              <span className='text-gray-600'>Total Inventory:</span>
              <span className='font-medium text-blue-700'>
                {stats.inventory.blanket}
              </span>
            </div>
            <div className='flex justify-between items-center bg-gray-50 p-2 rounded'>
              <span className='text-gray-600'>In Use:</span>
              <span className='font-medium text-orange-600'>
                {stats.inventory.blanketActive}
              </span>
            </div>
            <div className='flex justify-between items-center bg-gray-50 p-2 rounded'>
              <span className='text-gray-600'>Available:</span>
              <span className='font-medium text-green-600'>
                {stats.inventory.blanketInHand}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Issues */}
      <div className='bg-white rounded-xl shadow-md border border-gray-100'>
        <div className='px-6 py-4 border-b border-gray-200 flex items-center'>
          <svg
            className='w-5 h-5 text-blue-600 mr-2'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
            />
          </svg>
          <h2 className='text-lg font-semibold text-blue-900'>
            Recent Linen Issues
          </h2>
        </div>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                  Student
                </th>
                <th className='px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                  Items Issued
                </th>
                <th className='px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                  Date
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {stats.recentIssues.map((issue) => (
                <tr
                  key={issue.id}
                  className='hover:bg-gray-50 transition-colors'
                >
                  <td className='px-6 py-4'>
                    <div className='text-sm font-medium text-gray-900'>
                      {issue.name}
                    </div>
                    <div className='text-sm text-gray-500'>{issue.email}</div>
                  </td>
                  <td className='px-6 py-4'>
                    <div className='flex gap-2'>
                      {issue.bedsheetIssued && (
                        <span className='px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-800 font-medium border border-blue-200'>
                          Bedsheet
                        </span>
                      )}
                      {issue.pillowIssued && (
                        <span className='px-3 py-1 text-xs rounded-full bg-green-100 text-green-800 font-medium border border-green-200'>
                          Pillow Cover
                        </span>
                      )}
                      {issue.blanketIssued && (
                        <span className='px-3 py-1 text-xs rounded-full bg-purple-100 text-purple-800 font-medium border border-purple-200'>
                          Blanket
                        </span>
                      )}
                    </div>
                  </td>
                  <td className='px-6 py-4 text-sm text-gray-500'>
                    {new Date(issue.linenIssuedDate).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
