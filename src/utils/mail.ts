import emailjs from '@emailjs/browser';

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

interface EmailParams {
    to_name: string;
    to_email: string;
    from_name: string;
    message: string;
    subject: string;
    link: string;
    type: 'Task' | 'Project' | 'Idea' | 'Update' | 'Reminder';
}

export const sendEmailNotification = async (params: EmailParams) => {
    if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
        console.warn('EmailJS credentials missing. Skipping email notification.');
        return;
    }

    try {
        console.log(`[EmailJS] Sending to associated ID: ${params.to_email} (${params.to_name})`);
        const response = await emailjs.send(
            SERVICE_ID,
            TEMPLATE_ID,
            {
                ...params,
                to_email: params.to_email, // Explicitly ensuring this is passed
                // Ensure link is absolute or properly formatted if needed
                link: params.link.startsWith('http') ? params.link : `${window.location.origin}${params.link}`
            },
            PUBLIC_KEY
        );
        console.log('Email sent successfully:', response.status, response.text);
        return response;
    } catch (error) {
        console.error('Failed to send email:', error);
        throw error;
    }
};
