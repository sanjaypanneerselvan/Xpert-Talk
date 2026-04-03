export type UserRole = 'CEO' | 'Co-Founder';

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

export type JobStatus = 'Pending' | 'In Progress' | 'Completed';
export type Priority = 'Low' | 'Medium' | 'High';

export interface JobCard {
    id: string;
    title: string;
    description: string;
    assignedTo: string; // User UID
    assignedToName: string;
    deadline: any;
    status: JobStatus;
    priority: Priority;
    proofUrl?: string;
    proofType?: 'image' | 'pdf';
    createdAt: any;
    updatedAt: any;
    completedAt?: any;
    lastUpdateNote?: string;
}

export interface ChatMessage {
    id: string;
    senderId: string;
    senderName: string;
    text: string;
    timestamp: any;
    readBy: string[];
}

export interface Idea {
    id: string;
    title: string;
    content: string;
    authorId: string;
    authorName: string;
    likes: string[]; // List of user UIDs
    comments: Comment[];
    createdAt: any;
}

export interface Comment {
    id: string;
    authorId: string;
    authorName: string;
    text: string;
    createdAt: any;
}

export interface MoM {
    id: string;
    title: string;
    content: string;
    authorId: string;
    authorName: string;
    date: any;
    tags: string[];
    createdAt: any;
}

export interface ActivityLog {
    id: string;
    userId: string;
    userName: string;
    action: string;
    details: string;
    timestamp: any;
}

export interface Notification {
    id: string;
    userId: string;
    title: string;
    message: string;
    link: string;
    read: boolean;
    timestamp: any;
}
export interface Project {
    id: string;
    title: string;
    description: string;
    detailedDescription: string;
    status: 'Ongoing' | 'Completed' | 'On Hold' | 'Archived';
    ownerId: string;
    ownerName: string;
    teamMembers: string[];
    deadline: any;
    createdAt: any;
    updatedAt: any;
}
