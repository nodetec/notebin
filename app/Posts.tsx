import { HTMLAttributes, ReactNode, useContext } from "react";
import Button from "./Button";
import { PostDirContext } from "./context/post-dir-provider";
import { CardCol, CardRow } from "./icons";

interface PostsProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  title: string;
  noPosts?: boolean;
}

const Posts = ({
  title,
  noPosts,
  children,
  className,
  ...props
}: PostsProps) => {
  const { isCol, togglePostDir } = useContext(PostDirContext);
  return (
    <div
      className={`flex flex-col justify-center gap-3 px-2 w-full max-w-[50rem] mx-auto ${className}`}
      {...props}
    >
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl">{title}</h1>
        {noPosts ? null : (
          <Button
            className="hidden md:block"
            color="neutralLight"
            variant="ghost"
            size="sm"
            icon={isCol ? <CardCol /> : <CardRow />}
            onClick={() => togglePostDir()}
          />
        )}
      </div>
      {children}
    </div>
  );
};

export default Posts;
