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
                        p-2
                        text-neutral-600
                        dark:text-neutral-400
                        flex items-start gap-4
                        ${error ?
          "border-red-400 text-red-400" :
          "focus-within:border-blue-500 focus-within:text-blue-500"
        }`
      }>
        <label className={`text-sm font-bold`} htmlFor={id}>{label}</label>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex gap-2 flex-1 w-full flex-wrap">
            {tagsList?.map((tag) => (
              <div key={tag} className="text-xs
                                      bg-zinc-200
                                      text-neutral-600
                                      hover:text-neutral-800
                                      dark:bg-neutral-600
                                      dark:text-zinc-300
                                      hover:dark:text-zinc-200
                                      border 
                                      border-neutral-500
                                      hover:border-blue-500
                                      rounded-md p-1 group
                                      flex items-center gap-1">
                {tag}
                <Button
                  icon={<IoMdCloseCircleOutline className="text-sm" />}
                  size="sm"
                  color="transparent"
                  className="hidden group-hover:block p-0"
                  onClick={() => setTagsList(tagsList.filter((tagInList) => tagInList !== tag))}
                />
              </div>
            ))}
            <input
              type="text"
              id={id}
              className="focus:border-0 p-0 bg-transparent border-0 outline-0 focus:ring-0 text-neutral-800 dark:text-zinc-200"
              placeholder={placeholder}
              value={value}
              {...props}
            />
          </div>
        </div>
      </div>
      {error && <p className="text-red-400 pl-3 text-sm mt-1">{error}</p>}
    </div>
  )
}

export default TextInput;
