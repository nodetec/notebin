import React, { useState, useEffect } from "react";
import Button from "./Button";
import { RiFileUploadFill } from "react-icons/ri";
import { FILE_EXTENSIONS } from "./utils/constants";

interface CreatePostButtonProps {
  onFileUpload: Function;
}

// @ts-ignore
const FileUpload = ({ onFileUpload }: CreateFileUploadProps) => {
  const buildFileSelector = () => {
    if (typeof window !== "undefined") {
      const fileSelector = document.createElement("input");
      fileSelector.setAttribute("type", "file");
      fileSelector.setAttribute("accept", `${FILE_EXTENSIONS.toString()}`);
      return fileSelector;
    }

    return null;
  };

  const [fileSelector, setFileSelector] = useState(buildFileSelector());

  const extractFileContent = async (e: any) => {
    // @ts-ignore
    if (fileSelector.files.length) {
      const allowedExtensions = FILE_EXTENSIONS;
      const sizeLimit = 1_048_576;

      // @ts-ignore
      let { name: fileName, size: fileSize } = fileSelector.files[0];

      const fileExtension = `.${fileName.split(".").pop()}`;

      // @ts-ignore
      if (!allowedExtensions.includes(fileExtension)) {
        onFileUpload("", false, true);
      } else if (fileSize > sizeLimit) {
        onFileUpload("", true, false);
      } else {
        // @ts-ignore
        const fileContent = await fileSelector.files[0].text();
        onFileUpload(fileContent, true, true);
      }
    }
  };

  const resetFilePath = (e: any) => {
    e.target.value = "";
  };

  const handleFileSelect = async (e: any) => {
    e.preventDefault();

    if (fileSelector !== null) {
      fileSelector.click();
      fileSelector.addEventListener("change", extractFileContent);
      fileSelector.addEventListener("click", resetFilePath);
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
