import { DetailedHTMLProps, InputHTMLAttributes, useId } from "react";

interface PopupInputProps extends DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {
  label: string;
  error?: string;
  value?: string;
}

const PopupInput = ({ label, error, placeholder = "", value = "", ...props }: PopupInputProps) => {
  const id = useId();

  return (
    <div>
      <label className="text-sm font-bold pt-[.15rem]" htmlFor={id}>{label}</label>
      {error && <p className="text-red-400 pl-3 text-sm mt-1">{error}</p>}
      {error ? null : <input
        type="text"
        id={id}
        className="bg-accent dark:bg-secondary rounded-md border-2 border-accent dark:border-tertiary mt-1 py-2 px-4 block w-full leading-normal"
        placeholder={placeholder}
        value={value}
        {...props}
      />}
    </div>
  );
};

export default PopupInput;