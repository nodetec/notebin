import { DetailedHTMLProps, LegacyRef, SelectHTMLAttributes, useId } from "react";
import { IoChevronDown } from "react-icons/io5";

interface SelectProps extends DetailedHTMLProps<SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement> {
  label: string;
  options: string[];
  innerRef?: LegacyRef<HTMLSelectElement>;
}

const Select = ({ label, options, innerRef, ...props }: SelectProps) => {
  const id = useId();

  return (
    <div className={`
                    text-neutral-700
                    dark:text-slate-300
                    relative
                    rounded-md
                    bg-zinc-300
                    dark:bg-neutral-700
                    border-neutral-500
                    border-2
                    border-solid
                    focus-within:border-blue-500
                    flex items-center gap-2
                    pl-2 group
    `}
    >
      <label htmlFor={id} className="text-sm font-bold group-focus-within:text-blue-500 text-inherit">{label}</label>
      <select
        id={id}
        className={`
                bg-transparent 
                focus:ring-0 
                font-medium
                leading-tight
                border-0 
                outline-0 text-sm
                whitespace-nowrap"
                appearance-none
                ${props.className}`}
        ref={innerRef}
        {...props}
      >
        {options.map(option => <option key={option} value={option}>{option}</option>)}
      </select>
      <IoChevronDown className="text-xl text-current absolute top-0 right-2 bottom-0 my-auto pointer-events-none text-neutral-500 group-focus-within:text-blue-500" />
    </div>
  )
}

export default Select;
