import { DetailedHTMLProps, SelectHTMLAttributes, useId } from "react";
import { IoChevronDown } from "react-icons/io5";

interface SelectProps extends DetailedHTMLProps<SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement> {
  label: string;
  options: string[];
}

const Select = ({ label, options, ...props }: SelectProps) => {
  const id = useId();

  return (
    <div className={`dark:text-slate-300
                    relative
                    w-full
                    rounded-md
                    bg-neutral-700
                    border-neutral-500
                    border-2
                    border-solid
                    focus-within:border-blue-500
                    group
    `}
    >
      <label htmlFor={id} className="absolute text-sm font-bold top-2 left-2 group-focus-within:text-blue-500">{label}</label>
      <IoChevronDown className="text-2xl text-current absolute top-0 right-2 bottom-0 my-auto pointer-events-none text-neutral-500 group-focus-within:text-blue-500" />
      <select
        id={id}
        className={`
                pt-8 pr-12 pb-2 pl-2
                bg-transparent 
                focus:ring-0 
                font-medium
                w-full
                leading-tight
                border-0 
                outline-0 
                whitespace-nowrap"
                appearance-none
                ${props.className}`}
        {...props}
      >
        {options.map(option => <option key={option} value={option}>{option}</option>)}
      </select>
    </div>
  )
}

export default Select;
