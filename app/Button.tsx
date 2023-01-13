import { ButtonHTMLAttributes, DetailedHTMLProps, ReactNode } from "react";

const sizes = {
  lg: "py-4 px-6 text-lg",
  md: "py-2 px-4 text-base",
  sm: "py-2 px-3 text-xs",
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
  yellow: "dark:text-neutral-900 tex bg-yellow-300 hover:bg-yellow-400",
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
}

const Button: React.FC<Props> = ({
  children,
  size = "md",
  color = "blue",
  className = "",
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
      {icon ? <span className={iconAfter ? "order-2" : ""}>{icon}</span> : null}
      {children}
    </button>
  );
};

export default Button;
