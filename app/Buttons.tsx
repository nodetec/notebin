import { ReactNode } from "react";

interface ButtonsProps {
  children: ReactNode;
}

const Buttons = ({children, ...props}: ButtonsProps) => (
  <div className="flex flex-row gap-4 w-full" {...props}>
    {children}
  </div>
)

export default Buttons;
