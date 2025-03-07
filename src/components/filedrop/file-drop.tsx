import React, { useEffect, useState } from 'react'
import { AiOutlineCloudUpload } from 'react-icons/ai' // AiOutlineCheckCircle, 
import { MdClear } from 'react-icons/md'
import "./file-drop.css"

const FileDrop = ({
    onFilesSelected,
    onFilesClear,
    authensusComplete,
    width,
    height,
}): React.JSX.Element => {
    const [ files, setFiles ] = useState([]);

    const handleDrop = (event) => {
        event.preventDefault();
        const droppedFiles = event.dataTransfer.files;

        if(droppedFiles.length > 0) {
            const newFiles = Array.from(droppedFiles);

            setFiles((prevFiles) => [...prevFiles, ...newFiles])
        }
    }

    const handleRemoveFile = (index) => {
        setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    };

    const handleFileChange = (event) => {
        const selectedFiles = event.target.files;

        if (selectedFiles && selectedFiles.length > 0) {
            const newFiles = Array.from(selectedFiles);

            setFiles((prevFiles) => [...prevFiles, ...newFiles]);
        }
    };

    useEffect(
        () => {
            onFilesSelected(files);
        },
        [files, onFilesSelected]
    );

    useEffect(
        () => {
            handleRemoveFile(0);
            onFilesClear();
        },
        [authensusComplete, onFilesClear]
    );

    return (
        <section className="file-drop" style={{ width: width, height: height}}>
            <div className={`document-uploader ${files.length > 0 ? "upload-box active" : "upload-box"}`} onDrop={handleDrop} onDragOver={(event) => event.preventDefault()}>
                <>
                    <div className="upload-info">
                        <AiOutlineCloudUpload />
                        <div>
                            <p>
                                Drag and Drop your File Here
                            </p>
                            <p>
                                15MB limit per file. Supported formats: .JPG, .JPEG, .PNG, .PDF, .TXT
                            </p>
                        </div>
                    </div>
                    <input
                        type="file"
                        hidden
                        id="browse"
                        onChange={handleFileChange}
                        accept=".jpg,.jpeg,.png,.pdf,.docx,.pptx,.txt,.xlsx"
                        multiple={false}
                    />
                    <label htmlFor="browse" className="browse-btn">
                        Browse Files
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

export default FileDrop;
