
import {useDropzone} from 'react-dropzone'
import React,{ useCallback,useState } from 'react'
interface FileUploaderProps{
    onFileSelect?(file: File | null) : void;
}

function FileUploader({onFileSelect}: FileUploaderProps) {
    const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0] || null;
    console.log("FILES:", acceptedFiles);
    setfile(selectedFile);        // ✅ update UI
    onFileSelect?.(selectedFile); // ✅ send to parent
    }, [onFileSelect])

    const formatSize = (size: number) => {
    if (size < 1024) return size + " B";
    if (size < 1024 * 1024) return (size / 1024).toFixed(2) + " KB";
    return (size / (1024 * 1024)).toFixed(2) + " MB";
    };

    const {getRootProps, getInputProps, isDragActive ,acceptedFiles} = useDropzone({
        onDrop,
        multiple:false,
        accept: {'application/pdf':['.pdf']},
        maxSize:20*1024*1024,
    })

    //const file = acceptedFiles[0] || null;

    const [file,setfile] = useState<File | null>(null);
    return (
        <div className='w-full gradient-border'>
            <div {...getRootProps()}>
                <input {...getInputProps()} />
                <div className='space-y-4 cursor-pointer'>
                    {file?(
                        <div className='uploader-selected-file' onClick={(e)=>e.stopPropagation()}>
                            <img src="/images/pdf.png" alt='pdf' className='size-10'/>
                            <div className='flex items-center space-x-3'>
                                <div>
                                    <p className='text-sm text-gray-700 font-medium truncate'>
                                        {file.name}
                                    </p>
                                    <p className='text-sm text-gray-500'>
                                        {formatSize(file.size)}
                                    </p>
                                </div>
                            </div>
                            <button className='p-2 cursor-pointer' onClick={(e) => {
                                onFileSelect?.(null)
                            }}>
                                <img src='/icons/cross.svg' alt='remove' className='w-4 h-4'/>
                            </button>
                        </div>
                    ):(
                        <div>
                            <div className='mx-auto w-16 h-16 flex items-center justify-center mb-2'>
                                <img src="/icons/info.svg" alt="upload" className='size-20'/>
                            </div>
                            <p className='text-lg text-gray-500'>
                                <span className='font-semibold'>
                                    Click to upload
                                </span>     or Drag the file (Max 20 MB )
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default FileUploader
