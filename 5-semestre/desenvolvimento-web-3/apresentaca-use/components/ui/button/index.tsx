'use client';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    colorType?: 'error' | 'success' | string;
}

export function Button({className, colorType = '', ...props }: Props) {
    colorType = colorType === 'error' ? 'bg-red-500 hover:bg-red-600 text-white' : colorType === 'success' ? 'bg-green-500 hover:bg-green-600 text-white' : '';

    return (
        <button
            {...props}
            className={`w-full px-10 py-5 font-bold text-4xl cursor-pointer rounded-lg active:scale-95 transition-all duration-300 ${colorType} ${className??''}`}
        >            {props.children}
        </button>
    )
}