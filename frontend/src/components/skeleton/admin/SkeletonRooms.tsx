export default function SkeletonRooms() {
  return (
    <div className='p-2 sm:p-6 animate-pulse'>
      {/* Title */}
      <div className='h-8 w-64 bg-gray-200 rounded mb-6'></div>

      {/* Forms Section */}
      <div className='flex flex-col lg:flex-row gap-4 justify-center items-stretch mb-4'>
        {/* Create Room Form */}
        <div className='bg-white p-4 sm:p-6 rounded-xl border shadow max-w-md w-full'>
          <div className='h-6 w-32 bg-gray-200 rounded mb-4'></div>
          {[...Array(7)].map((_, i) => (
            <div key={i} className='h-10 bg-gray-100 rounded mb-2'></div>
          ))}
        </div>

        {/* Assign Student Form */}
        <div className='bg-white p-4 sm:p-6 rounded-xl border shadow max-w-md w-full'>
          <div className='h-6 w-40 bg-gray-200 rounded mb-4'></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className='h-10 bg-gray-100 rounded mb-2'></div>
          ))}
        </div>
      </div>

      {/* Room List */}
      <div className='overflow-x-auto bg-white rounded-xl shadow border p-2 sm:p-4'>
        {/* Desktop Table */}
        <div className='hidden sm:block'>
          {/* Header */}
          <div className='bg-blue-50 grid grid-cols-8 gap-2 p-2 rounded mb-4'>
            {[...Array(8)].map((_, i) => (
              <div key={i} className='h-5 bg-gray-200 rounded'></div>
            ))}
          </div>

          {/* Table Rows */}
          {[...Array(5)].map((_, rowIndex) => (
            <div key={rowIndex} className='grid grid-cols-8 gap-2 p-2 border-b'>
              {[...Array(8)].map((_, colIndex) => (
                <div key={colIndex} className='h-8 bg-gray-100 rounded'></div>
              ))}
            </div>
          ))}
        </div>

        {/* Mobile Cards */}
        <div className='sm:hidden flex flex-col gap-4'>
          {[...Array(3)].map((_, i) => (
            <div key={i} className='bg-blue-50 rounded-lg shadow p-3'>
              <div className='flex justify-between mb-2'>
                <div className='h-5 w-24 bg-gray-200 rounded'></div>
                <div className='h-5 w-20 bg-gray-200 rounded'></div>
              </div>
              <div className='grid grid-cols-2 gap-2'>
                {[...Array(12)].map((_, j) => (
                  <div key={j} className='h-4 bg-gray-100 rounded'></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
