import { ReactNode, useContext } from "react";
import { IoMdCloseCircleOutline } from "react-icons/io";
import Button from "./Button";

interface PopupProps {
  title: string;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  children: ReactNode;
}

const Popup = ({ title, isOpen, setIsOpen, children }: PopupProps) => {
  if (!isOpen) return null;

  return <div className="z-50 fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/4 border-2 border-neutral-500 rounded-md">
    <Button
      icon={<IoMdCloseCircleOutline size={24} />}
      className="absolute w-fit right-0 top-0 text-neutral-400"
      onClick={() => setIsOpen(false)}
      color="transparent"
    />
    <div className="bg-neutral-900 flex flex-col justify-center items-stretch gap-4 p-6 shadow-overlay">
      <h3 className="text-xl text-neutral-400 text-center pb-4">
        {title}
      </h3>
      {children}
    </div>
  </div>
};

export default Popup;
