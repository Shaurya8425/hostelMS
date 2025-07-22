export default function SkeletonLeave() {
  return (
    <div className='p-6 max-w-3xl mx-auto animate-pulse'>
      {/* Title */}
      <div className='flex items-center gap-2 mb-8'>
        <div className='h-8 w-8 bg-gray-200 rounded' />
        <div className='h-8 w-48 bg-gray-200 rounded' />
      </div>

      {/* Leave Form Skeleton */}
      <div className='grid gap-4 bg-white p-6 shadow rounded-xl border mb-8'>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <div className='h-10 w-full bg-gray-100 rounded' />
          <div className='h-10 w-full bg-gray-100 rounded' />
        </div>
        <div className='h-20 w-full bg-gray-100 rounded' />
        <div className='h-10 w-32 bg-gray-200 rounded justify-self-start' />
      </div>

      {/* Leave History Title */}
      <div className='h-6 w-40 bg-gray-200 rounded mb-4' />

      {/* Leave History Table - Desktop */}
      <div className='overflow-auto bg-white rounded-xl shadow border p-4'>
        <div className='hidden sm:block'>
          {/* Header */}
          <div className='grid grid-cols-4 gap-4 bg-blue-50 p-2 rounded mb-4'>
            {[...Array(4)].map((_, i) => (
              <div key={i} className='h-5 bg-gray-200 rounded' />
            ))}
          </div>

          {/* Rows */}
          {[...Array(3)].map((_, i) => (
            <div key={i} className='grid grid-cols-4 gap-4 p-2 border-b'>
              <div className='h-6 w-24 bg-gray-100 rounded' />
              <div className='h-6 w-24 bg-gray-100 rounded' />
              <div className='h-6 w-32 bg-gray-100 rounded' />
              <div className='h-6 w-20 bg-gray-200 rounded-full' />
            </div>
          ))}
        </div>

        {/* Mobile Layout */}
        <div className='sm:hidden flex flex-col gap-4'>
          {[...Array(3)].map((_, i) => (
            <div key={i} className='bg-blue-50 rounded-lg shadow p-3'>
              <div className='flex justify-between mb-1'>
                <div className='h-4 w-24 bg-gray-200 rounded' />
                <div className='h-4 w-16 bg-gray-200 rounded-full' />
              </div>
              <div className='grid grid-cols-2 gap-2'>
                {[...Array(4)].map((_, j) => (
                  <div key={j} className='h-4 bg-gray-100 rounded' />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
