export default function SkeletonRoom() {
  return (
    <div className='p-6 max-w-5xl mx-auto animate-pulse'>
      <div className='h-10 w-1/3 bg-gray-200 rounded mb-8' />
      {/* Current Room Skeleton */}
      <div className='bg-gradient-to-r from-blue-100 to-blue-200 p-6 rounded-xl mb-8 shadow border'>
        <div className='h-6 w-1/4 bg-gray-200 rounded mb-3' />
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2'>
          <div className='h-4 w-2/3 bg-gray-200 rounded mb-2' />
          <div className='h-4 w-1/2 bg-gray-200 rounded mb-2' />
          <div className='h-4 w-1/3 bg-gray-200 rounded mb-2' />
        </div>
      </div>
      {/* Available Rooms Skeleton */}
      <div className='h-6 w-1/4 bg-gray-200 rounded mb-4' />
      <div className='grid md:grid-cols-2 gap-6'>
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className='bg-white border p-6 rounded-xl shadow flex justify-between items-center'
          >
            <div className='flex-1'>
              <div className='h-5 w-1/2 bg-gray-200 rounded mb-2' />
              <div className='h-4 w-1/3 bg-gray-200 rounded mb-2' />
              <div className='flex gap-2'>
                <div className='h-4 w-16 bg-gray-200 rounded-full' />
                <div className='h-4 w-16 bg-gray-200 rounded-full' />
              </div>
            </div>
            <div className='h-8 w-20 bg-gray-200 rounded-full ml-4' />
          </div>
        ))}
      </div>
    </div>
  );
}
