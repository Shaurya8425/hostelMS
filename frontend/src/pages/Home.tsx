export default function HomePage() {
  return (
    <main className='min-h-screen bg-white text-gray-800'>
      {/* Hero Section */}
      <section className='bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-24 px-4'>
        <div className='max-w-5xl mx-auto text-center'>
          <h1 className='text-4xl md:text-6xl font-extrabold leading-tight mb-6'>
            Hostel Management System
          </h1>
          <p className='text-lg md:text-xl text-white/90 mb-10'>
            Seamlessly manage rooms, students, leaves, complaints, and more —
            all in one place.
          </p>
          <div className='flex justify-center flex-wrap gap-4'>
            <a
              href='/login'
              className='bg-white text-blue-700 px-6 py-3 rounded-full font-medium hover:bg-gray-100 transition'
            >
              Login
            </a>
            <a
              href='/signup'
              className='border border-white text-white px-6 py-3 rounded-full font-medium hover:bg-white hover:text-blue-700 transition'
            >
              Sign Up
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className='py-20 px-6 bg-gray-50'>
        <div className='max-w-6xl mx-auto text-center'>
          <h2 className='text-3xl md:text-4xl font-bold mb-12'>
            What You Can Do
          </h2>
          <div className='grid md:grid-cols-2 gap-10'>
            <FeatureCard
              title='Student Dashboard'
              description='Students can apply for leave, submit complaints, check room allocation & more.'
            />
            <FeatureCard
              title='Admin Panel'
              description='Admins can manage students, assign rooms, respond to complaints, and monitor hostel.'
            />
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className='py-20 bg-indigo-700 text-white text-center px-4'>
        <h2 className='text-3xl md:text-4xl font-bold mb-4'>
          Start Managing Smartly
        </h2>
        <p className='text-white/90 mb-6'>
          Join the system that simplifies hostel operations.
        </p>
        <a
          href='/signup'
          className='inline-block bg-white text-indigo-700 px-6 py-3 rounded-full font-medium hover:bg-gray-100 transition'
        >
          Create an Account
        </a>
      </section>

      {/* Footer */}
      <footer className='py-6 bg-gray-900 text-gray-400 text-center text-sm'>
        &copy; {new Date().getFullYear()} Hostel Management System. All rights
        reserved.
      </footer>
    </main>
  );
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className='bg-white p-8 rounded-2xl shadow-md hover:shadow-lg transition text-left'>
      <h3 className='text-xl font-semibold mb-3 text-blue-700'>{title}</h3>
      <p className='text-gray-600'>{description}</p>
    </div>
  );
}
