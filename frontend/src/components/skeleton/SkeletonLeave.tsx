export default function SkeletonLeave() {
  return (
    <div className='p-6 max-w-3xl mx-auto animate-pulse'>
      <div className='h-10 w-1/3 bg-gray-200 rounded mb-8' />
      {/* Leave Form Skeleton */}
      <form className='grid gap-4 bg-white p-6 shadow rounded-xl border mb-8'>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <div className='flex flex-col gap-2'>
            <div className='h-4 w-20 bg-gray-200 rounded' />
            <div className='h-10 w-full bg-gray-100 rounded' />
          </div>
          <div className='flex flex-col gap-2'>
            <div className='h-4 w-20 bg-gray-200 rounded' />
            <div className='h-10 w-full bg-gray-100 rounded' />
          </div>
        </div>
        <div className='flex flex-col gap-2'>
          <div className='h-4 w-32 bg-gray-200 rounded' />
          <div className='h-20 w-full bg-gray-100 rounded' />
        </div>
        <div className='h-10 w-32 bg-gray-300 rounded-full self-end' />
      </form>
      <div className='h-6 w-1/4 bg-gray-200 rounded mb-4' />
      <div className='overflow-auto bg-white rounded-xl shadow border p-4'>
        <table className='min-w-full border-separate border-spacing-y-2 text-sm'>
          <thead>
            <tr className='bg-blue-50'>
              <th className='border-b px-4 py-2'>From</th>
              <th className='border-b px-4 py-2'>To</th>
              <th className='border-b px-4 py-2'>Reason</th>
              <th className='border-b px-4 py-2'>Status</th>
            </tr>
          </thead>
          <tbody>
            {[...Array(3)].map((_, i) => (
              <tr key={i}>
                <td className='px-4 py-2'>
                  <div className='h-4 w-16 bg-gray-100 rounded' />
                </td>
                <td className='px-4 py-2'>
                  <div className='h-4 w-16 bg-gray-100 rounded' />
                </td>
                <td className='px-4 py-2'>
                  <div className='h-4 w-32 bg-gray-100 rounded' />
                </td>
                <td className='px-4 py-2'>
                  <div className='h-4 w-20 bg-gray-200 rounded-full' />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
