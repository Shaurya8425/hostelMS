import React from "react";

interface TableLoadingProps {
  columns: number;
}

const TableLoading: React.FC<TableLoadingProps> = ({ columns }) => {
  return (
    <div className='animate-pulse'>
      <table className='min-w-[900px] w-full border-separate border-spacing-y-2 text-left text-xs md:text-sm hidden md:table'>
        <thead className='bg-blue-50'>
          <tr>
            {Array(columns)
              .fill(0)
              .map((_, i) => (
                <th key={i} className='p-2 border-b'>
                  <div className='h-4 bg-gray-300 rounded'></div>
                </th>
              ))}
          </tr>
        </thead>
        <tbody>
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <tr key={i}>
                {Array(columns)
                  .fill(0)
                  .map((_, j) => (
                    <td key={j} className='p-2'>
                      <div className='h-4 bg-gray-200 rounded'></div>
                    </td>
                  ))}
              </tr>
            ))}
        </tbody>
      </table>

      {/* Mobile skeleton */}
      <div className='md:hidden flex flex-col gap-4'>
        {Array(5)
          .fill(0)
          .map((_, i) => (
            <div key={i} className='bg-blue-50 rounded-lg shadow p-3'>
              <div className='flex justify-between mb-3'>
                <div className='h-4 w-32 bg-gray-300 rounded'></div>
                <div className='h-4 w-16 bg-gray-300 rounded'></div>
              </div>
              <div className='grid grid-cols-2 gap-x-2 gap-y-2'>
                {Array(6)
                  .fill(0)
                  .map((_, j) => (
                    <React.Fragment key={j}>
                      <div className='h-3 w-16 bg-gray-200 rounded'></div>
                      <div className='h-3 w-24 bg-gray-200 rounded'></div>
                    </React.Fragment>
                  ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default TableLoading;
