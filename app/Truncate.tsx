"use client";
import useCopy from "./hooks/useCopy";
import {
  HiOutlineClipboardCheck,
  HiOutlineClipboardCopy,
} from "react-icons/hi";
import { TbClipboardX } from "react-icons/tb";
import { Props as IButtonProps } from "./Button";
import Button from "./Button";
import { Fragment } from "react";

interface ITruncateProps extends IButtonProps {
  content: string;
  length?: number;
  iconOnly?: boolean;
}

const Truncate = ({
  content,
  length = 4,
  iconOnly = false,
  ...props
}: ITruncateProps) => {
  const { isCopied, isError, copyToClipboard } = useCopy();

  const shorten = (content: string) => {
    if (content) {
      return (
        content.substring(0, length) +
        "..." +
        content.substring(content.length - length)
      );
    }
  };

  const color = isCopied
    ? "text-green-600 dark:text-green-400"
    : isError
      ? "text-red-600 dark:text-red-400"
      : "";

  return (
    <Fragment>
      <span className={color}>
        {iconOnly
          ? null
          : isCopied
            ? "Copied!"
            : isError
              ? "Error"
              : shorten(content)}
      </span>
      <Button
        className={color}
        icon={
          isCopied ? (
            <HiOutlineClipboardCheck />
          ) : isError ? (
            <TbClipboardX />
          ) : (
            <HiOutlineClipboardCopy />
          )
        }
        {...props}
        onClick={() => copyToClipboard(content)}
      />
    </Fragment>
  );
};

export default Truncate;
