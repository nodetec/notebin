import { DetailedHTMLProps, InputHTMLAttributes, useId } from "react";
import { RxEyeClosed, RxEyeOpen } from "react-icons/rx";
import Button from "./Button";
import Truncate from "./Truncate";

interface PopupInputProps
  extends DetailedHTMLProps<
    InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > {
  label: string;
  error?: string;
  value?: string;
  className?: string;
  password?: string;
  isPassword?: boolean;
  toggleIsPassword?: () => void;
}

const PopupInput = ({
  label,
  error,
  placeholder = "",
  value = "",
  className = "",
  password = "",
  isPassword,
  toggleIsPassword,
  ...props
}: PopupInputProps) => {
  const id = useId();

  return (
    <div className="w-full">
      <label className="text-sm font-bold pt-[.15rem]" htmlFor={id}>
        {label}
      </label>
      {error && <p className="text-red-400 pl-3 text-sm mt-1">{error}</p>}
      {error ? null : (
        <div className="relative">
          <input
            type={isPassword ? "password" : "text"}
            id={id}
            className={`bg-secondary rounded-md border-2 border-tertiary mt-1 py-2 block w-full leading-normal ${toggleIsPassword ? "pl-4 pr-20" : "px-4"
              } ${className}`}
            placeholder={placeholder}
            value={value}
            {...props}
          />
          {toggleIsPassword ? (
            <div className="flex items-center gap-1 absolute right-2 top-1/2 transform -translate-y-1/2">
              <Truncate iconOnly color="transparent" content={password} />
              <Button
                color="transparent"
                icon={isPassword ? <RxEyeOpen /> : <RxEyeClosed />}
                onClick={toggleIsPassword}
              />
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default PopupInput;
