export default function SkeletonComplaint() {
  return (
    <div className='max-w-3xl mx-auto p-6 animate-pulse'>
      <div className='h-10 w-1/3 bg-gray-200 rounded mb-8' />
      {/* File a Complaint Skeleton */}
      <section className='mb-10 bg-white rounded-xl shadow p-6 border'>
        <div className='h-6 w-1/4 bg-gray-200 rounded mb-4' />
        <div className='h-10 w-full bg-gray-100 rounded mb-3' />
        <div className='h-24 w-full bg-gray-100 rounded mb-3' />
        <div className='h-10 w-32 bg-gray-200 rounded-full' />
      </section>
      {/* Complaint History Skeleton */}
      <section className='bg-white rounded-xl shadow p-6 border'>
        <div className='h-6 w-1/4 bg-gray-200 rounded mb-4' />
        {[...Array(3)].map((_, i) => (
          <div key={i} className='mb-4'>
            <div className='h-4 w-1/2 bg-gray-200 rounded mb-2' />
            <div className='h-4 w-1/3 bg-gray-100 rounded mb-1' />
            <div className='h-4 w-1/4 bg-gray-100 rounded' />
          </div>
        ))}
      </section>
    </div>
  );
}
