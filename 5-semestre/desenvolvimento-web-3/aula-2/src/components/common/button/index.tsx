interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
}

export function Button({ children, className, ...props }: ButtonProps) {
    return (
        <button 
        {...props}
        className={"p-2 rounded-lg active:ring-1 active:scale-95 transition-all duration-500 cursor-pointer" + " " + className}
        >
            {children}
        </button>
    );
}