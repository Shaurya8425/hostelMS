export default function SkeletonDashboard() {
  return (
    <div className='p-6 max-w-6xl mx-auto animate-pulse'>
      {/* Title */}
      <div className='h-10 w-64 bg-gray-200 rounded mb-8'></div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-10'>
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className='bg-gray-100 shadow-xl rounded-2xl p-6 border border-gray-200 flex flex-col items-center min-w-[150px] min-h-[160px] w-full'
          >
            <div className='h-6 w-32 bg-gray-200 rounded mb-2'></div>
            <div className='h-16 w-24 bg-gray-200 rounded'></div>
          </div>
        ))}
      </div>

      {/* Room Assignment Section */}
      <div className='bg-white rounded-2xl shadow-xl p-6 border mb-8'>
        <div className='h-6 w-48 bg-gray-200 rounded mb-4'></div>
        <div className='grid grid-cols-4 gap-4 mb-4'>
          {[...Array(8)].map((_, i) => (
            <div key={i} className='h-32 bg-gray-100 rounded-lg'></div>
          ))}
        </div>
      </div>
    </div>
  );
}
