import { DetailedHTMLProps, InputHTMLAttributes, useId } from "react";
import { IoMdCloseCircleOutline } from "react-icons/io";
import Button from "./Button";

interface TextInputProps
  extends DetailedHTMLProps<
    InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > {
  label?: string;
  icon?: JSX.Element;
  error?: string;
  tagsList?: string[];
  // TODO: Figure out what type this should be
  setTagsList?: any;
  value?: string;
}

const TextInput = ({
  label,
  icon,
  error,
  tagsList,
  setTagsList,
  placeholder = "",
  value = "",
  ...props
}: TextInputProps) => {
  const id = useId();

  return (
    <div>
      <div className="relative p-2 text-neutral-600 dark:text-neutral-400 flex items-center gap-4">
        <label
          className="text-sm font-bold flex items-center gap-4"
          htmlFor={id}
        >
          <span>{icon}</span>
          {label}
        </label>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex gap-2 flex-1 w-full flex-wrap">
            {tagsList?.map((tag) => (
              <div
                key={tag}
                className="text-xs
                                      bg-zinc-200
                                      text-secondary
                                      hover:text-secondary
                                      dark:bg-secondary
                                      dark:text-accent
                                      hover:dark:text-zinc-200
                                      border border-transparent
                                      rounded-md p-1 group
                                      flex items-center gap-1"
              >
                {tag}
                <Button
                  icon={<IoMdCloseCircleOutline className="text-sm" />}
                  size="sm"
                  color="transparent"
                  className={`hidden p-0 ${
                    props.disabled ? "" : "group-hover:block"
                  }`}
                  onClick={() =>
                    setTagsList(
                      tagsList.filter((tagInList) => tagInList !== tag)
                    )
                  }
                />
              </div>
            ))}
            {error && <p className="text-red-400 pl-3 text-sm mt-1">{error}</p>}
            {error ? null : (
              <input
                type="text"
                id={id}
                className="focus:border-0 p-0 bg-transparent border-0 outline-0 focus:ring-0 text-secondary dark:text-zinc-200"
                placeholder={placeholder}
                value={value}
                {...props}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextInput;
