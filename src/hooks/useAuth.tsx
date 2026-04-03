import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    onAuthStateChanged,
    type User,
    signOut as firebaseSignOut
} from 'firebase/auth';
import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    serverTimestamp
} from 'firebase/firestore';
import { auth, db } from '../firebase/config';

export type UserRole = 'CEO' | 'Co-Founder' | 'Executive';

export interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    role: UserRole;
    photoURL?: string;
    productivityScore: number;
    lastLogin: any;
    online: boolean;
}

interface AuthContextType {
    user: User | null;
    profile: UserProfile | null;
    loading: boolean;
    signOut: () => Promise<void>;
    isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Any authenticated Firebase user is allowed during this phase
export const SYSTEM_USERS: Record<string, { role: UserRole; name: string; photo: string }> = {
    'sanjaypanneerselvan@gmail.com': {
        role: 'CEO',
        name: 'Sanjay Panneerselvan',
        photo: '/profiles/82279aa.jpeg'
    },
    'rswetha2807@gmail.com': {
        role: 'Co-Founder',
        name: 'Swetha Ramamoorthi',
        photo: '/profiles/swetha_new.jpg'
    },
    'akshayamanian07@gmail.com': {
        role: 'Co-Founder',
        name: 'Akshaya Manian',
        photo: '/profiles/IMG_9452.JPG'
    },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                setUser(firebaseUser);

                // CRITICAL: Set loading false IMMEDIATELY after getting the user
                // The profile will load in the background (streaming)
                setLoading(false);

                // Start profile sync (non-blocking)
                syncProfile(firebaseUser);
            } else {
                setUser(null);
                setProfile(null);
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const syncProfile = async (firebaseUser: User) => {
        try {
            const profileRef = doc(db, 'users', firebaseUser.uid);
            const profileSnap = await getDoc(profileRef);

            if (profileSnap.exists()) {
                const profileData = profileSnap.data() as UserProfile;
                const config = SYSTEM_USERS[firebaseUser.email!];

                // If this is a system user, ensure their details are always in sync
                if (config) {
                    const updates: any = {
                        lastLogin: serverTimestamp(),
                        online: true,
                        displayName: config.name,
                        role: config.role,
                        photoURL: config.photo
                    };

                    updateDoc(profileRef, updates).catch(e => console.warn("Failed to sync profile:", e));
                    setProfile({ ...profileData, ...updates });
                } else {
                    setProfile(profileData);
                    updateDoc(profileRef, {
                        lastLogin: serverTimestamp(),
                        online: true
                    }).catch(e => console.warn("Failed to update status:", e));
                }
            } else {
                const config = SYSTEM_USERS[firebaseUser.email!] || { role: 'Executive', name: firebaseUser.email!.split('@')[0], photo: '' };
                const newProfile: UserProfile = {
                    uid: firebaseUser.uid,
                    email: firebaseUser.email!,
                    displayName: config.name,
                    role: config.role as UserRole,
                    photoURL: config.photo,
                    productivityScore: 0,
                    lastLogin: serverTimestamp(),
                    online: true,
                };
                await setDoc(profileRef, newProfile);
                setProfile(newProfile);
            }
        } catch (error) {
            console.error("Profile sync error:", error);
        }
    };

    const signOut = async () => {
        if (user) {
            const profileRef = doc(db, 'users', user.uid);
            updateDoc(profileRef, { online: false }).catch(() => { });
        }

        try {
            await firebaseSignOut(auth);
            setUser(null);
            setProfile(null);
        } catch (error) {
            console.error("Sign out error:", error);
        }
    };

    const isAdmin = !!profile?.role;

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
                <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-slate-900"></div>
                </div>
                <div className="mt-8 text-center animate-pulse">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">System Initializing</p>
                    <p className="text-xs font-bold text-slate-600 mt-2 tracking-tight">Syncing Command Center Data...</p>
                </div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ user, profile, loading, signOut, isAdmin }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
