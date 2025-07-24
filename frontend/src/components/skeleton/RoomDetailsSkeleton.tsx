export default function RoomDetailsSkeleton() {
  return (
    <div className='p-4 max-w-2xl mx-auto animate-pulse'>
      <div className='flex justify-between items-center mb-6'>
        <div className='h-8 w-48 bg-gray-200 rounded'></div>
        <div className='h-8 w-20 bg-gray-200 rounded'></div>
      </div>

      <div className='bg-white shadow rounded-lg p-6'>
        <div className='space-y-4'>
          <div className='grid grid-cols-2 gap-4'>
            {[...Array(6)].map((_, index) => (
              <div key={index} className='space-y-2'>
                <div className='h-4 w-24 bg-gray-200 rounded'></div>
                <div className='h-6 w-32 bg-gray-200 rounded'></div>
              </div>
            ))}
          </div>

          <div className='mt-8'>
            <div className='h-6 w-40 bg-gray-200 rounded mb-4'></div>
            <div className='space-y-3'>
              {[...Array(3)].map((_, index) => (
                <div key={index} className='border border-gray-100 p-3 rounded'>
                  <div className='h-4 w-36 bg-gray-200 rounded mb-2'></div>
                  <div className='h-4 w-48 bg-gray-200 rounded'></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
