export default function SkeletonFees() {
  return (
    <div className='p-6 max-w-4xl mx-auto animate-pulse'>
      <div className='h-10 w-1/3 bg-gray-200 rounded mb-8' />
      <div className='overflow-x-auto bg-white rounded-xl shadow border p-4'>
        <table className='min-w-full border-separate border-spacing-y-2 text-sm'>
          <thead>
            <tr className='bg-purple-50 text-left'>
              <th className='p-2 border-b'>Amount (₹)</th>
              <th className='p-2 border-b'>Due Date</th>
              <th className='p-2 border-b'>Status</th>
              <th className='p-2 border-b'>Paid At</th>
            </tr>
          </thead>
          <tbody>
            {[...Array(4)].map((_, i) => (
              <tr key={i}>
                <td className='p-2'>
                  <div className='h-4 w-16 bg-gray-100 rounded' />
                </td>
                <td className='p-2'>
                  <div className='h-4 w-24 bg-gray-100 rounded' />
                </td>
                <td className='p-2'>
                  <div className='h-4 w-20 bg-gray-200 rounded-full' />
                </td>
                <td className='p-2'>
                  <div className='h-4 w-20 bg-gray-100 rounded' />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
