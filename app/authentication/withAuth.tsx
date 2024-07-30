// components/withAuth.tsx

//Higher order component to ensure user sign in
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const withAuth = (WrappedComponent: React.FC) => {
  return (props: any) => {
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);
    const router = useRouter();
    const auth = getAuth();

    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          setAuthenticated(true);
        } else {
          router.push('/signin'); // Redirect to sign-in page if not authenticated
        }
        setLoading(false);
      });
      return () => unsubscribe();
    }, [auth, router]);

    //add animation
    if (loading) {
      return <p>Loading</p>; // Show loading indicator while checking auth status
    }

    if (!authenticated) {
      return null; // Show nothing if not authenticated
    }

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;
