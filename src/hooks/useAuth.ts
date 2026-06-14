import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useStore } from '../store/useStore';

export function useAuth() {
  const { setUser, setProfile, setWorkerPermissions, setIsWorker } = useStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        let profileLoaded = false;
        let workerLoaded = false;

        const checkDone = () => {
          if (profileLoaded && workerLoaded) setLoading(false);
        };

        const profileRef = doc(db, 'users', user.uid);
        const unsubscribeProfile = onSnapshot(profileRef, (doc) => {
          if (doc.exists()) {
            setProfile(doc.data());
          } else {
            setProfile(null);
          }
          if (!profileLoaded) {
            profileLoaded = true;
            checkDone();
          }
        }, (error) => {
          console.error("Profile fetch error:", error);
          if (!profileLoaded) {
            profileLoaded = true;
            checkDone();
          }
        });

        const workerRef = doc(db, 'workers', user.uid);
        const unsubscribeWorker = onSnapshot(workerRef, (doc) => {
          if (doc.exists()) {
            setIsWorker(true);
            setWorkerPermissions(doc.data().permissions || []);
          } else {
            setIsWorker(false);
            setWorkerPermissions(null);
          }
          if (!workerLoaded) {
            workerLoaded = true;
            checkDone();
          }
        }, (error) => {
          console.error("Worker fetch error:", error);
          if (!workerLoaded) {
            workerLoaded = true;
            checkDone();
          }
        });

        return () => {
          unsubscribeProfile();
          unsubscribeWorker();
        };
      } else {
        setProfile(null);
        setIsWorker(false);
        setWorkerPermissions(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [setUser, setProfile, setIsWorker, setWorkerPermissions]);

  return { loading };
}
