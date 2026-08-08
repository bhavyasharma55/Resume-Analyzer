import type { Route } from "./+types/home";
import Navvbar from "~/components/Navvbar";
import { usePuterStore } from '~/lib/puter'
//import { resumes } from "../../constants";
import { Link } from "react-router";
import ResumeCard from "~/components/ResumeCard";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resumeind" },
    { name: "description", content: "Smart feedback fro your dream job" },
  ];
}

export default function Home() {
  const { auth, isLoading,fs,kv } = usePuterStore();
  const navigate = useNavigate();
  const [resume,setResumes] = useState<Resume[]>([])
  const [loadingResumes,setLoadingResumes] = useState(false);

  useEffect(() => {
    const loadResume = async () => {
      setLoadingResumes(true);
      const resumes = (await kv.list('resume;*',true)) as KVItem[];
      const parsedResumes = resumes?.map((resume) => (
        JSON.parse(resume.value) as Resume

      ))
      console.log('parsedResumes',parsedResumes)
      setResumes(parsedResumes || [] );
      setLoadingResumes(false)
    }
    loadResume();
  },[])
  

  useEffect(() => {
    if(!isLoading && !auth.isAuthenticated){
        navigate('/auth?next=/');
    }
  },[auth.isAuthenticated, isLoading, navigate])

  

  return <main className="bg-[url('/images/bg-main.svg')] bg-cover">

    <Navvbar/>
    <section className="main-section">
      <div className="page-heading py-16">
        <h1>Track Your Application & Resume Ratings</h1>
        {!loadingResumes && resume?.length === 0 ? (
          <h2>No resume Found . Upload your first resume to get feedback.</h2>
        ):(
          <h2>Review your submission and check AI-powered feedback.</h2>
        )}
      </div>
      {loadingResumes && (
        <div className="flex flex-col items-center justify-center">
          <img src="/images/resume-scam-2.gif" className="w-[200px]"/>
        </div>
      )

      }
      {!loadingResumes && resume.length > 0 && (
        <div className="resumes-section">
            {resume.map((r) => (
                <ResumeCard key={r.id} resume={r}/>
            ))}
        </div>
      )}
    {!loadingResumes && resume?.length === 0 && (
      <div className="flex flex-col items-center justify-center mt-10 gap-4">
        <Link to="/upload" className='primary-button w-fit text-xl font-semibold'>
          Upload Resume
        </Link>
      </div>
    )}
    </section>
  </main>;
}