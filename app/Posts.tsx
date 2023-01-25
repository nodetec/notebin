import { HTMLAttributes, ReactNode, useContext } from "react";

interface PostsProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  title: string;
}

const Posts = ({ title, children, className, ...props }: PostsProps) => {
  return (
    <div
      className={`flex flex-col justify-center gap-3 px-2 w-full max-w-[50rem] mx-auto ${className}`}
      {...props}
    >
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl">{title}</h1>
      </div>
      {children}
    </div>
  );
};

export default Posts;
