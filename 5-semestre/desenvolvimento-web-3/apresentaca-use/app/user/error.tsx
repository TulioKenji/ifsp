'use client';

export default function Error() {
    return (
        <div className="flex flex-col items-center gap-10 h-dvh">
            <h1>Custom Error Page</h1>
            <p>Something went wrong while fetching the user data.</p>
        </div>
    );
}