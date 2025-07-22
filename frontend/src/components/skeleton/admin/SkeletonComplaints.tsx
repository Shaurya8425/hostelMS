export default function SkeletonComplaints() {
  return (
    <div className='p-2 sm:p-6 animate-pulse'>
      {/* Title */}
      <div className='h-8 w-64 bg-gray-200 rounded mb-6'></div>

      {/* Table Skeleton */}
      <div className='overflow-x-auto bg-white rounded-xl shadow border p-2 sm:p-4'>
        <div className='hidden sm:block'>
          {/* Header */}
          <div className='grid grid-cols-5 gap-4 bg-gray-50 p-2 rounded mb-4'>
            {[...Array(5)].map((_, i) => (
              <div key={i} className='h-6 bg-gray-200 rounded'></div>
            ))}
          </div>

          {/* Rows */}
          {[...Array(5)].map((_, i) => (
            <div key={i} className='grid grid-cols-5 gap-4 p-2 border-b'>
              <div className='h-6 bg-gray-100 rounded'></div>
              <div className='h-6 bg-gray-100 rounded'></div>
              <div className='h-6 w-32 bg-gray-100 rounded'></div>
              <div className='h-6 w-24 bg-gray-100 rounded'></div>
              <div className='h-6 w-32 bg-gray-100 rounded'></div>
            </div>
          ))}
        </div>

        {/* Mobile Cards */}
        <div className='sm:hidden space-y-4'>
          {[...Array(3)].map((_, i) => (
            <div key={i} className='bg-gray-50 p-4 rounded-lg'>
              <div className='flex justify-between mb-2'>
                <div className='h-5 w-32 bg-gray-200 rounded'></div>
                <div className='h-5 w-24 bg-gray-200 rounded'></div>
              </div>
              <div className='space-y-2'>
                <div className='h-4 bg-gray-200 rounded'></div>
                <div className='h-4 w-3/4 bg-gray-200 rounded'></div>
                <div className='h-6 w-24 bg-gray-200 rounded'></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
