import { ButtonHTMLAttributes, DetailedHTMLProps, ReactNode } from "react";
import { ImSpinner9 } from "react-icons/im";

const sizes = {
  lg: "py-5 px-6 text-lg",
  md: "py-3 px-4 text-base",
  sm: "py-2 px-3 text-sm",
};

const iconSized = {
  lg: "p-3",
  md: "p-2",
  sm: "p-1",
};

const colors = {
  blue: "dark:text-neutral-900 bg-blue-400 hover:bg-blue-500",
  neutralDark: "text-neutral-300 bg-neutral-600 hover:bg-neutral-700",
  neutralLight: "bg-neutral-300 text-neutral-900 hover:bg-neutral-400",
  yellow: "dark:text-neutral-900 bg-yellow-300 hover:bg-yellow-400",
  zincDark: "dark:text-zinc-400 bg-zinc-900 hover:text-yellow-400",
  transparent: "bg-transparent",
};

export interface Props
  extends DetailedHTMLProps<
    ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  size?: keyof typeof sizes;
  color?: keyof typeof colors;
  icon?: ReactNode;
  iconAfter?: boolean;
  loading?: boolean;
}

const Button: React.FC<Props> = ({
  children,
  size = "md",
  color = "blue",
  className = "",
  loading = false,
  icon,
  iconAfter,
  disabled,
  ...props
}) => {
  return (
    <button
      aria-label={children as string}
      title={children as string}
      className={`rounded-md font-bold text-base flex items-center justify-center cursor-pointer gap-2 self-center transition-colors w-full
         ${disabled ? "cursor-not-allowed opacity-40" : ""}
         ${children ? sizes[size] : iconSized[size]}
         ${colors[color]}
         ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {loading || icon ? <span className={iconAfter ? "order-2" : ""}>{loading ? <ImSpinner9 className="animate-spin" /> : icon}</span> : null}
      {children}
    </button>
  );
};

export default Button;
