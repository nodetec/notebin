import React, { useState, useEffect } from "react";
import Button from "./Button";
import { RiFileUploadFill } from "react-icons/ri";

interface CreatePostButtonProps {
  onFileUpload: Function;
}

// @ts-ignore
const FileUpload = ({ onFileUpload }: CreateFileUploadProps) => {
  const buildFileSelector = () => {
    const fileSelector = document.createElement("input");
    fileSelector.setAttribute("type", "file");
    return fileSelector;
  };

  const [fileSelector, setFileSelector] = useState(buildFileSelector());

  const handleFileSelect = async (e: any) => {
    e.preventDefault();
    fileSelector.click();

    // @ts-ignore
    if (fileSelector.files.length) {
      // @ts-ignore
      let fileContent = await fileSelector.files[0].text();
      onFileUpload(fileContent);
    }
  };

  return (
    <Button
      color="zincDark"
      variant="ghost"
      title="Upload File"
      className="hover:text-primary dark:hover:text-accent"
      onClick={handleFileSelect}
      icon={<RiFileUploadFill />}
    />
  );
};

export default FileUpload;
