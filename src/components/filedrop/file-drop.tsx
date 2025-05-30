import React, { useEffect, useState } from 'react'
import { AiOutlineCloudUpload } from 'react-icons/ai' // AiOutlineCheckCircle, 
import { MdClear } from 'react-icons/md'
import "./file-drop.css"
import { EMPTY_RESULT } from '../authensus/authensus-functionality'
import { SubType } from '../search/search-ui'

export const FileDrop = ({
    onFilesSelected,
    onFilesClear,
    onSetResult,
    authensusComplete,
    width,
    height,
}): React.JSX.Element => {
    const [ files, setFiles ] = useState<File[]>([]);

    const handleDrop = (event) => {
        event.preventDefault();
        const droppedFiles = event.dataTransfer.files;

        if(droppedFiles.length > 0 && files.length === 0) {
            const newFiles: File[] = Array.from(droppedFiles);

            setFiles((prevFiles) => [...prevFiles, ...newFiles]);
            onSetResult(EMPTY_RESULT);  // Clean the result cache in the case of a new file drop
        }
    }

    const handleRemoveFile = (index, wipe) => {
        setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
        if(wipe) {onSetResult(EMPTY_RESULT)}
    };

    const handleFileChange = (event) => {
        const selectedFiles = event.target.files;

        if (selectedFiles && selectedFiles.length == 1 && files.length === 0) {
            const newFiles: File[] = Array.from(selectedFiles);

            setFiles((prevFiles) => [...prevFiles, ...newFiles]);
            onSetResult(EMPTY_RESULT);  // Clean the result cache in the case of a new file drop
        }
    };

    useEffect(
        () => {
            onFilesSelected(files);
        },
        [files, onFilesSelected]
    );

    // If the process completes, we want to clear the files but not the result cache
    useEffect(
        () => {
            handleRemoveFile(0, false);
            onFilesClear();
        },
        [authensusComplete, onFilesClear]
    );

    return (
        <section className="file-drop" style={{ width: width, height: height}}>
            <div
                className={`document-uploader ${files.length > 0 ? "upload-box active" : "upload-box"}`}
                onDrop={handleDrop}
                onDragOver={(event) => event.preventDefault()}
                title={"15MB limit per file. Supported formats: .JPG, .JPEG, .PNG, .PDF, .TXT"}
            >
                <>
                    <div className="upload-info">
                        <AiOutlineCloudUpload />
                        <div>
                            <p>
                                Drag and Drop your File Here
                            </p>
                        </div>
                    </div>
                    <input
                        type="file"
                        hidden
                        id="browse"
                        onChange={handleFileChange}
                        accept="image/*,video/*,.pdf,.txt,.xlsx,.docx,.pptx"
                        multiple={false}
                    />
                    <label htmlFor="browse" className="browse-btn">
                        Or Browse Files
                    </label>
                </>
                {files.length > 0 && (
                    <div className="file-list">
                        <div className="file-list__container">
                            {files.map((file, index) => (
                                <div className="file-item" key={index}>
                                    <div className="file-info">
                                        <p>
                                            {file.name}
                                        </p>
                                    </div>
                                    <div className="file-actions">
                                        {/* If the file is manually removed then we also want to clear the cache */}
                                        <MdClear onClick={() => handleRemoveFile(index, true)} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export const FileDropSearch = ({
    onFilesSelected,
    submitFile,
    clearText,
    onFilesClear,
    width,
    height,
}): React.JSX.Element => {
    const [ files, setFiles ] = useState<File[]>([]);

    const handleDrop = (event) => {
        event.preventDefault();
        const droppedFiles = event.dataTransfer.files;

        if(droppedFiles.length > 0 && files.length === 0) {
            const newFiles: File[] = Array.from(droppedFiles);

            setFiles((prevFiles) => [...prevFiles, ...newFiles]);
        }
    }

    const handleRemoveFile = (index) => {
        setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    };

    const handleFileChange = (event) => {
        const selectedFiles = event.target.files;

        if (selectedFiles && selectedFiles.length == 1 && files.length === 0) {
            const newFiles: File[] = Array.from(selectedFiles);

            setFiles((prevFiles) => [...prevFiles, ...newFiles]);
        }
    };

    useEffect(
        () => {
            onFilesSelected(files);
            submitFile(SubType.File);
            clearText("");
        },
        [files, onFilesSelected]
    );

    useEffect(
        () => {
            handleRemoveFile(0);
            onFilesClear();
        },
        [onFilesClear]
    );

    return (
        <section className="file-drop" style={{ width: width, height: height}}>
            <div
                className={`document-uploader ${files.length > 0 ? "upload-box active" : "upload-box"}`}
                onDrop={handleDrop}
                onDragOver={(event) => event.preventDefault()}
                title={"15MB limit per file. Supported formats: .JPG, .JPEG, .PNG, .PDF, .TXT"}
            >
                <>
                    <div className="upload-info">
                        <AiOutlineCloudUpload />
                        <div>
                            <p>
                                Drag and Drop your File Here
                            </p>
                        </div>
                    </div>
                    <input
                        type="file"
                        hidden
                        id="browse"
                        onChange={handleFileChange}
                        accept="image/*,video/*,.pdf,.txt,.xlsx,.docx,.pptx"
                        multiple={false}
                    />
                    <label htmlFor="browse" className="browse-btn">
                        Or Browse Files
                    </label>
                </>
                {files.length > 0 && (
                    <div className="file-list">
                        <div className="file-list__container">
                            {files.map((file, index) => (
                                <div className="file-item" key={index}>
                                    <div className="file-info">
                                        <p>
                                            {file.name}
                                        </p>
                                    </div>
                                    <div className="file-actions">
                                        <MdClear onClick={() => handleRemoveFile(index)} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};
