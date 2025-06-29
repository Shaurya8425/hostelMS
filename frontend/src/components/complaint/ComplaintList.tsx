export default function ComplaintList({ complaints }: { complaints: any[] }) {
  return (
    <div className='space-y-4 mt-6'>
      {complaints.length === 0 && <p>No complaints filed yet.</p>}
      {complaints.map((complaint) => (
        <div key={complaint.id} className='border p-4 rounded shadow'>
          <h2 className='text-lg font-semibold'>{complaint.subject}</h2>
          <p className='text-gray-700'>{complaint.description}</p>
          <p className='text-sm text-gray-500 mt-2'>
            Status: <strong>{complaint.status}</strong>
          </p>
          <p className='text-xs text-gray-400'>
            Filed on: {new Date(complaint.createdAt).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}
