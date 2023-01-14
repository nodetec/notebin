import { DetailedHTMLProps, InputHTMLAttributes, useId } from "react";

interface TextInputProps extends DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {
  label: string;
  error?: string;
}

const TextInput = ({ label, error, placeholder = "", value = "", ...props }: TextInputProps) => {
  const id = useId();

  return (
    <div>
      <div className={`relative
                        group
                        rounded-md
                        border-2
                        bg-zinc-300
                        dark:bg-neutral-700
                        text-neutral-600
                        dark:text-neutral-400
                        border-neutral-500
                        border-solid
                        ${error ?
                        "border-red-400 text-red-400":
                        "focus-within:border-blue-500 focus-within:text-blue-500"
                      }`
      }>
        <label className={`absolute
                            left-3
                            group-focus-within:top-2
                            text-sm
                            font-bold
                            transition-[top]
                            ${value || placeholder ? "top-2" : "top-5"}
                          `}
          htmlFor={id}>{label}</label>
        <input
          type="text"
          id={id}
          className="px-3 py-2 w-full focus:border-0 bg-transparent border-0 outline-0 focus:ring-0 mt-5 text-neutral-800 dark:text-zinc-200"
          placeholder={placeholder}
          {...props}
        />
      </div>
      {error && <p className="text-red-400 pl-3 text-sm mt-1">{error}</p>}
    </div>
  )
}

export default TextInput;
