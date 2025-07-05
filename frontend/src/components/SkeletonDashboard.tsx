export default function SkeletonDashboard() {
  return (
    <div className='flex flex-col max-w-3xl mx-auto p-6 gap-6 animate-pulse'>
      <div className='h-10 w-1/3 bg-gray-200 rounded mb-4' />
      {[...Array(4)].map((_, i) => (
        <div key={i} className='bg-gray-100 rounded-xl shadow p-6 mb-4 border'>
          <div className='h-6 w-1/4 bg-gray-200 rounded mb-3' />
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2'>
            <div className='h-4 w-2/3 bg-gray-200 rounded mb-2' />
            <div className='h-4 w-1/2 bg-gray-200 rounded mb-2' />
            <div className='h-4 w-1/3 bg-gray-200 rounded mb-2' />
            <div className='h-4 w-1/4 bg-gray-200 rounded mb-2' />
          </div>
        </div>
      ))}
    </div>
  );
}
