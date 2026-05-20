'use client';

export default function UserList({ users }: { users: User[] }) {
    return (
        <div className="p-4 rounded-lg border-2 border-dashed border-blue-400 bg-blue-50 dark:bg-blue-900/10">
            <h2 className="text-2xl font-bold mb-4 text-blue-600 dark:text-blue-400">User List</h2>
            <div className="space-y-2">
                {users.map((user, index) => (
                    <div key={index} className="p-3 rounded-md bg-white dark:bg-zinc-800 shadow-sm border border-zinc-200 dark:border-zinc-700">
                        <p>{user.id}</p>
                        <p className="text-lg font-medium text-gray-800 dark:text-gray-200">{user.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}