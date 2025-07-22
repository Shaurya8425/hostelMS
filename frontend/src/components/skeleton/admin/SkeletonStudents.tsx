export default function SkeletonStudents() {
  return (
    <div className='p-2 sm:p-4 animate-pulse'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4'>
        <div className='h-8 w-64 bg-gray-200 rounded'></div>
        <div className='h-10 w-32 bg-gray-200 rounded'></div>
      </div>

      {/* Search Bar */}
      <div className='h-10 w-full sm:w-1/2 md:w-1/3 bg-gray-200 rounded mb-6'></div>

      {/* Table Container */}
      <div className='w-full overflow-x-auto bg-white rounded-xl shadow border p-1 sm:p-4'>
        {/* Desktop Table */}
        <div className='hidden md:block'>
          {/* Table Header */}
          <div className='grid grid-cols-8 bg-blue-50 p-2 rounded mb-4 gap-4'>
            {[...Array(8)].map((_, i) => (
              <div key={i} className='h-6 bg-gray-200 rounded'></div>
            ))}
          </div>

          {/* Table Rows */}
          {[...Array(5)].map((_, i) => (
            <div key={i} className='grid grid-cols-8 p-2 border-b gap-4'>
              <div className='h-6 bg-gray-100 rounded'></div>
              <div className='h-6 bg-gray-100 rounded'></div>
              <div className='h-6 bg-gray-100 rounded'></div>
              <div className='h-6 bg-gray-100 rounded'></div>
              <div className='h-6 bg-gray-100 rounded'></div>
              <div className='h-6 bg-gray-100 rounded'></div>
              <div className='h-6 bg-gray-100 rounded'></div>
              <div className='flex gap-2'>
                <div className='h-8 w-16 bg-gray-200 rounded'></div>
                <div className='h-8 w-16 bg-gray-200 rounded'></div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Cards */}
        <div className='md:hidden space-y-4'>
          {[...Array(3)].map((_, i) => (
            <div key={i} className='bg-blue-50 rounded-lg p-4'>
              <div className='flex justify-between mb-4'>
                <div className='h-6 w-32 bg-gray-200 rounded'></div>
                <div className='h-6 w-24 bg-gray-200 rounded'></div>
              </div>
              <div className='space-y-3'>
                {[...Array(6)].map((_, j) => (
                  <div key={j} className='grid grid-cols-2 gap-2'>
                    <div className='h-4 w-20 bg-gray-200 rounded'></div>
                    <div className='h-4 bg-gray-100 rounded'></div>
                  </div>
                ))}
              </div>
              <div className='flex gap-2 mt-4'>
                <div className='h-8 w-20 bg-gray-200 rounded'></div>
                <div className='h-8 w-20 bg-gray-200 rounded'></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      <div className='flex flex-col sm:flex-row justify-between items-center mt-6 gap-4'>
        <div className='h-10 w-28 bg-gray-200 rounded'></div>
        <div className='h-6 w-32 bg-gray-200 rounded'></div>
        <div className='h-10 w-28 bg-gray-200 rounded'></div>
      </div>
    </div>
  );
}
