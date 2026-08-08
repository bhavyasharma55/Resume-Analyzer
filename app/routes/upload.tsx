import Navvbar from '~/components/Navvbar'
import React,{useState} from 'react'
import type {FormEvent} from 'react'
import FileUploader from '~/components/FileUploader';
import { usePuterStore } from '~/lib/puter';
import { generateUUID } from '~/lib/utils';
import { useNavigate } from 'react-router';
import { prepareInstructions, AIResponseFormat } from '../../constants';
import { convertPdfToImage } from '~/lib/pdf2img';

function upload() {
    const {auth,isLoading,fs,ai,kv} = usePuterStore();
    const navigate = useNavigate();
    const [isProcessing,setisProcessing] = useState(false);
    const [statusText,setStatusText] = useState(" ");
    const [file,setfile] = useState <File | null >(null)

    const handleAnalyze = async({companyName,jobTitle,jobDescription,file}:{
        companyName: string,
        jobTitle:string,
        jobDescription:string,
        file:File
    })=>{
        setisProcessing(true);
        setStatusText('Uploading the file...')
        const uploadedFile = await fs.upload([file]);
        if(!uploadedFile) return setStatusText('Error: Failed to upload file');
        setStatusText('converting to image...')
        const imageFile = await convertPdfToImage(file);
        if(!imageFile.file) return setStatusText('Error: failed to convert PDF to Image')
        setStatusText('Uploading Image...')
        const uploadImage = await fs.upload([imageFile.file]);
        if(!uploadImage) return setStatusText ('Error: Failed to upload image');
        setStatusText('Preparing Data...')
        const uuid = generateUUID();
        const data = {
            id: uuid,
            resumepath: uploadedFile.path,
            imagepath:uploadImage.path,
            companyName,jobTitle,jobDescription,
            feedback:'',

        }
        await kv.set(`resume:${uuid}`,JSON.stringify(data))
        setStatusText('Analysing...');
        const feedback = await ai.feedback(
            uploadedFile.path,
            prepareInstructions({jobTitle, jobDescription, AIResponseFormat})
        )
        if(!feedback) return setStatusText('Error: Failed to Analyse Resume');
        
        const feedbackText = typeof feedback.message.content==='string'
            ?feedback.message.content
            :feedback.message.content[0].text;

        //data.feedback = JSON.parse(feedbackText)
        let parsedFeedback;
        try{
            const cleaned = feedbackText
                .replace(/```json/g, "")
                .replace(/```/g, "")
                .trim();

            parsedFeedback = JSON.parse(cleaned);
            data.feedback = parsedFeedback;

        }catch (err) {
            console.error("RAW AI RESPONSE:", feedbackText);

            setStatusText("Error: Invalid AI response ❌");
            setisProcessing(false);
            return;
        }



        await kv.set(`resume:${uuid}`,JSON.stringify(data));
        setStatusText('Analysis complete,Redirecting...')
        console.log(data);
        navigate(`/resume/${uuid}`)
    }



    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log("handle submit start")
        const form = e.currentTarget.closest('form');
        if(!form) return;
        const formData = new FormData(form);

        const companyName = formData.get('company-name') as string;
        const jobTitle = formData.get('job-title') as string;
        const jobDescription = formData.get('job-discription') as string;

        if(!file) return;
        handleAnalyze({companyName,jobTitle,jobDescription,file})

    }

    const handleFileSelect = (file: File | null) => {
    setfile(file);
}

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
        <Navvbar/>
        <section className="main-section">
            <div className='page-heading py-16'>
                <h1>Smart Feedback for your Dream Job</h1>
                {isProcessing ? (
                    <>
                        <h2>{statusText}</h2>           
                        <img src='/images/resume-scan.gif' className='w-full'/>
                    </>
                ):(
                    <h2>Drop your resume for an ATS score and improvement Tips</h2>
                )}
                {!isProcessing && (
                    <form id='upload-form' onSubmit={handleSubmit} className='flex flex-col gap-4 mt-4'>
                        <div className='form-div'>
                            <label htmlFor="company-name">Comapny Name</label>
                            <input type='text' name='company-name' placeholder='Company Name' id='company-name'/>
                        </div>
                        <div className='form-div'>
                            <label htmlFor="job-discription">Job Title</label>
                            <input type='text' name='job-title' placeholder='Job Title' id='job-title'/>
                        </div>
                        <div className='form-div'>
                            <label htmlFor="job-description ">Job Discription</label>
                            <textarea rows={5} name='job-description' placeholder='Job Description' id='job-title'/>
                        </div>
                        <div className='form-div'>
                            <label htmlFor="uploader">Upload Resume</label>
                            <FileUploader onFileSelect={handleFileSelect}/>
                        </div>
                        <button className='primary-button' type='submit'>
                            Analyse Resume
                        </button>
                    </form>

                )}
            </div>
        </section>
    </main>
  )
}
export default upload
