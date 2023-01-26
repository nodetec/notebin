"use client";
import { FC } from "react";
import { ImSpinner9 } from "react-icons/im";

interface LoadingProps {
  className?: string;
}

const Loading: FC<LoadingProps> = ({ className = "", ...props }) => (
  <div className="flex items-center justify-center h-full flex-1">
    <ImSpinner9 className={`animate-spin ${className}`} size="24" {...props} />
  </div>
);

export default Loading;
