import { DetailedHTMLProps, InputHTMLAttributes, useId } from "react";
import { IoMdCloseCircleOutline } from "react-icons/io"
import Button from "./Button";

interface TextInputProps extends DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {
  label: string;
  error?: string;
  tagsList?: string[];
  // TODO: Figure out what type this should be
  setTagsList?: any;
  value?: string;
}

const TextInput = ({ label, error, tagsList, setTagsList, placeholder = "", value = "", ...props }: TextInputProps) => {
  const id = useId();

  return (
    <div>
      <div className={`relative
                        group
                        rounded-md
                        border-2
                        bg-zinc-300
                        dark:bg-neutral-700
                        text-neutral-600
                        dark:text-neutral-400
                        border-neutral-500
                        border-solid
                        ${error ?
                        "border-red-400 text-red-400":
                        "focus-within:border-blue-500 focus-within:text-blue-500"
                      }`
      }>
        <label className={`absolute
                            left-3
                            group-focus-within:top-2
                            text-sm
                            font-bold
                            transition-[top]
                            ${value || placeholder ? "top-2" : "top-5"}
                          `}
          htmlFor={id}>{label}</label>
        <div className="mt-6">
          {tagsList && tagsList.length > 0 ? <ul className="flex flex-wrap gap-2 px-3 pt-4">
            {tagsList.map((tag) => (
              <li key={tag} className="text-xs
                                      bg-zinc-200
                                      text-neutral-600
                                      hover:text-neutral-800
                                      dark:bg-neutral-600
                                      dark:text-zinc-300
                                      hover:dark:text-zinc-200
                                      border 
                                      border-neutral-500
                                      hover:border-blue-500
                                      rounded-md px-2 py-1
                                      flex items-center gap-1">
                {tag}
                <Button
                  icon= { <IoMdCloseCircleOutline /> }
                  size="sm"
                  color="transparent"
                  onClick={() => setTagsList(tagsList.filter((tagInList) => tagInList !== tag))}
                />
              </li>
            ))}
          </ul> : null}
          <input
            type="text"
            id={id}
            className="w-full py-2 focus:border-0 bg-transparent border-0 outline-0 focus:ring-0 text-neutral-800 dark:text-zinc-200"
            placeholder={placeholder}
            value={value}
            {...props}
          />
        </div>
      </div>
      {error && <p className="text-red-400 pl-3 text-sm mt-1">{error}</p>}
    </div>
  )
}

export default TextInput;
