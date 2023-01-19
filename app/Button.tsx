import { ButtonHTMLAttributes, DetailedHTMLProps, ReactNode } from "react";
import { ImSpinner9 } from "react-icons/im";

const sizes = {
  lg: "py-5 px-6 text-lg",
  md: "py-3 px-4 text-base",
  sm: "py-2 px-3 text-xs",
};

const iconSized = {
  lg: "p-3",
  md: "p-2",
  sm: "p-1",
};

const colors = {
  blue: {
    solid: "text-primary bg-blue-400 hover:bg-blue-500 border-transparent",
    outline: "text-blue-400 bg-transparent border-current hover:bg-blue-500 hover:text-primary",
    ghost: "text-blue-400 bg-transparent border-transparent hover:border-current",
  },
  neutralDark: {
    solid: "text-neutral-300 bg-neutral-600 hover:bg-tertiary border-transparent",
    outline: "text-neutral-600 bg-transparent  border-current hover:bg-tertiary hover:text-neutral-300",
    ghost: "text-neutral-600 bg-transparent border-transparent hover:border-current",
  },
  zincDark: {
    solid: "text-accent bg-tertiary hover:bg-zinc-600 border-transparent",
    outline: "text-tertiary bg-transparent border-current hover:bg-tertiary hover:text-accent",
    ghost: "text-tertiary bg-transparent border-transparent hover:border-current",
  },
  neutralLight: {
    solid: "text-primary bg-neutral-300 hover:bg-neutral-400 border-transparent",
    outline: "text-neutral-300 bg-transparent border-current hover:bg-neutral-400 hover:text-primary",
    ghost: "text-neutral-300 bg-transparent border-transparent hover:border-current",
  },
  yellow: {
    solid: "text-primary bg-yellow-300 hover:bg-yellow-400 border-transparent",
    outline: "text-yellow-300 bg-transparent border-current hover:bg-yellow-400 hover:text-primary",
    ghost: "text-yellow-300 bg-transparent border-transparent hover:border-current",
  },
  transparent: {
    solid: "bg-transparent border-transparent",
    outline: "bg-transparent border-transparent border-current",
    ghost: "bg-transparent border-transparent",
  }
};

export interface Props
  extends DetailedHTMLProps<
    ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  size?: keyof typeof sizes;
  color?: keyof typeof colors;
  variant?: "solid" | "outline" | "ghost";
  icon?: ReactNode;
  iconAfter?: boolean;
  loading?: boolean;
}

const Button: React.FC<Props> = ({
  children,
  size = "md",
  color = "blue",
  variant = "solid",
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
      className={`rounded-md font-bold text-base flex items-center justify-center cursor-pointer gap-2 self-center transition-colors border border-solid
         ${disabled ? "cursor-not-allowed opacity-40" : ""}
         ${children ? sizes[size] : iconSized[size]}
         ${colors[color][variant]}
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
