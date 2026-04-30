import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Landing = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col">
      {/* Hero Section */}
      <div className="relative overflow-hidden flex-grow flex items-center bg-background">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[60%] rounded-full bg-grape/20 blur-[100px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[60%] rounded-full bg-pink/20 blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 z-10 w-full">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight text-foreground">
              Elevate Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-grape to-pink">College Fest</span>
            </h1>
            <p className="text-xl md:text-2xl mb-10 text-foreground/70 leading-relaxed font-light">
              Organize, register, and manage college festival events seamlessly. 
              Join teams, compete, and celebrate your achievements in one unified platform.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/events"
                className="px-8 py-4 rounded-full bg-gradient-to-r from-grape to-pink text-white text-lg font-medium shadow-xl shadow-pink/20 hover:shadow-2xl hover:shadow-pink/30 hover:-translate-y-1 transition-all duration-300"
              >
                Explore Events
              </Link>
              {!isAuthenticated && (
                <Link
                  to="/auth"
                  className="px-8 py-4 rounded-full bg-card border border-border text-foreground text-lg font-medium shadow-sm hover:shadow-md hover:border-grape/50 hover:text-grape transition-all duration-300"
                >
                  Get Started for Free
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything you need to succeed
            </h2>
            <p className="text-foreground/60 text-lg">
              Our platform provides all the tools necessary for organizers, judges, and students.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-10">
            {/* Feature 1 */}
            <div className="bg-background rounded-3xl p-8 border border-border shadow-sm hover:shadow-xl hover:border-blue/50 transition-all duration-300 group">
              <div className="w-14 h-14 bg-blue/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue/20 transition-colors">
                <svg className="w-7 h-7 text-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-foreground">Event Management</h3>
              <p className="text-foreground/70 leading-relaxed">
                Create, update, and manage events with a beautiful interface. 
                Track live registrations and capacity instantly.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-background rounded-3xl p-8 border border-border shadow-sm hover:shadow-xl hover:border-grape/50 transition-all duration-300 group">
              <div className="w-14 h-14 bg-grape/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-grape/20 transition-colors">
                <svg className="w-7 h-7 text-grape" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-foreground">Team Collaboration</h3>
              <p className="text-foreground/70 leading-relaxed">
                Form teams with unique join codes. Collaborate with your 
                teammates and compete together seamlessly.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-background rounded-3xl p-8 border border-border shadow-sm hover:shadow-xl hover:border-green/50 transition-all duration-300 group">
              <div className="w-14 h-14 bg-green/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green/20 transition-colors">
                <svg className="w-7 h-7 text-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-foreground">Fair Judging System</h3>
              <p className="text-foreground/70 leading-relaxed">
                Transparent scoring with multiple criteria and weighted averages. 
                View real-time leaderboards.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 relative overflow-hidden bg-background">
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl font-bold mb-6 text-foreground">Ready to jump in?</h2>
          <p className="text-xl text-foreground/70 mb-10">
            Join thousands of students already experiencing the future of college events.
          </p>
          {!isAuthenticated && (
            <Link
              to="/auth"
              className="inline-block bg-grape hover:bg-grape/90 text-white px-10 py-4 rounded-full text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
              Sign Up Today
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Landing;