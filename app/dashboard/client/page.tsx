
'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function CustomerDashboardPage() {
    const router = useRouter();
    const [isCustomer, setIsCustomer] = useState(false);

    useEffect(() => {
        // This check also runs on the client-side, ensuring sessionStorage is available.
        const verified = sessionStorage.getItem('customerVerified') === 'true';
        if (!verified) {
            router.replace('/login');
        } else {
            setIsCustomer(true);
        }
    }, [router]);

    // Render nothing until the client-side check is complete and verified
    if (!isCustomer) {
        return null;
    }

    return (
        <div className="col-span-full">
            {/* This is now an empty page as requested. */}
        </div>
    );
}
