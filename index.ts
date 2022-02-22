import Database from 'better-sqlite3';
import express, { application, json } from 'express';
import cors from 'cors';
import {
   createApplicant,
   createInterview,
   createInterviewer,
   deleteRow,
   getApplicantById,
   getInterviewById,
   getInterviewerById,
   getInterviewsForApplicant,
   getInterviewsForInterviewer,
   updateRow,
} from './setup';

const app = express();
app.use(cors());
app.use(express.json());
const PORT = 3009;

app.get('/applicants/:id', (req, res) => {
   const id = +req.params.id;
   const applicant = getApplicantById(id);

   if (!applicant)
      return res
         .status(404)
         .send({ error: `Applicant with Id ${id} not found` });

   applicant.interviews = getInterviewsForApplicant(id);

   res.send(applicant);
});

app.get('/interviewers/:id', (req, res) => {
   const id = +req.params.id;
   const interviewer = getInterviewerById(id);

   if (!interviewer)
      return res
         .status(404)
         .send({ error: `Applicant with Id ${id} not found` });

   interviewer.interviews = getInterviewsForInterviewer(id);

   res.send(interviewer);
});

app.post(`/applicants`, (req, res) => {
   const { name, email } = req.body;
   const errors = [];

   if (typeof name !== 'string')
      errors.push(`Name doesn't exist or isn't a string`);
   if (typeof email !== 'string')
      errors.push(`Email doesn't exist or isn't a string`);
   if (errors.length > 0) return res.status(400).send(errors);

   const newApplicantResult = createApplicant(name, email);
   const applicant = getApplicantById(
      Number(newApplicantResult.lastInsertRowid)
   );
   const applicantInterviews = getInterviewsForApplicant(applicant.id);
   applicant.interviews = applicantInterviews;
   res.send(applicant);
});

app.post(`/interviewers`, (req, res) => {
   const { name, email } = req.body;
   const errors = [];

   if (typeof name !== 'string')
      errors.push(`Name doesn't exist or isn't a string`);
   if (typeof email !== 'string')
      errors.push(`Email doesn't exist or isn't a string`);
   if (errors.length > 0) return res.status(400).send(errors);

   const newInterviewerResult = createInterviewer(name, email);
   const interviewer = getInterviewerById(
      Number(newInterviewerResult.lastInsertRowid)
   );
   const interviewerInterviews = getInterviewsForInterviewer(interviewer.id);
   interviewer.interviews = interviewerInterviews;
   res.send(interviewer);
});

app.post(`/interviews`, (req, res) => {
   const { date, score, applicantId, interviewerId } = req.body;
   const errors = [];

   if (typeof date !== 'string')
      errors.push(`Date doesn't exist or isn't a string`);
   if (typeof score !== 'number')
      errors.push(`Score doesn't exist or isn't a string`);
   if (typeof applicantId !== 'number')
      errors.push(`SpplicantId doesn't exist or isn't a string`);
   if (typeof interviewerId !== 'number')
      errors.push(`InterviewerId doesn't exist or isn't a string`);
   if (errors.length > 0) return res.status(400).send(errors);

   const newInterviewerResult = createInterview(
      date,
      score,
      applicantId,
      interviewerId
   );
   const interview = getInterviewById(
      Number(newInterviewerResult.lastInsertRowid)
   );
   const applicant = getApplicantById(applicantId);
   const interviewer = getInterviewerById(interviewerId);
   interview.applicant = applicant;
   interview.interviewer = interviewer;

   res.send(interview);
});

app.delete('/interviews/:id', (req, res) => {
   if (deleteRow('interviews', +req.params.id).changes === 0)
      return res.status(404).send({
         error: `Couldn't find an interview with id ${req.params.id}.`,
      });

   res.send({
      message: `Successfully deleted interview with id ${req.params.id}`,
   });
});

app.delete('/interviewers/:id', (req, res) => {
   const id = +req.params.id;

   if (!getInterviewerById(id)) {
      return res
         .status(404)
         .send({ error: `Couldn't find an interviewer with id ${id}.` });
   }
   if (getInterviewsForInterviewer(id).length!==0)
      return res.status(403).send({
         message: `Interviewer with id ${id} cannot be deleted before deleting the interviews they have participated in.`,
      });

      deleteRow('interviewers',id)
   res.send({ message: `Successfully deleted interviewer with id ${id}` });
});

app.delete('/applicants/:id', (req, res) => {
   const id = +req.params.id;

   if (!getApplicantById(id)) {
      return res
         .status(404)
         .send({ error: `Couldn't find an applicant with id ${id}.` });
   }
   if (getInterviewsForApplicant(id).length!==0)
      return res.status(403).send({
         message: `Applicant with id ${id} cannot be deleted before deleting the interviews they have participated in.`,
      });
      deleteRow('applicants',id)
   res.send({ message: `Successfully deleted applicant with id ${id}` });
});

app.patch('/interviewers/:id',(req,res)=>{
    const id = +req.params.id
    const {name,email} = req.body
    if(!getInterviewerById(id))return res.status(404).send({error:`Interviewer with id ${id} doesn't exist`})
    

    if(typeof name==='string')updateRow('interviewers','name',name,id)
    if(typeof email === 'string')updateRow('interviewers','email',email,id)
    
    res.send(getInterviewerById(id))
})

app.patch('/applicants/:id',(req,res)=>{
    const id = +req.params.id
    const {name,email} = req.body
    if(!getApplicantById(id))return res.status(404).send({error:`Applicant with id ${id} doesn't exist`})
    

    if(typeof name==='string')updateRow('applicants','name',name,id)
    if(typeof email === 'string')updateRow('applicants','email',email,id)
    
    res.send(getApplicantById(id))
})

app.patch('/interviews/:id',(req,res)=>{
    const id = +req.params.id
    const {date,score} = req.body
    if(!getInterviewById(id))return res.status(404).send({error:`Applicant with id ${id} doesn't exist`})
    

    if(typeof date==='string')updateRow('interviews','date',date,id)
    if(typeof score === 'number')updateRow('interviews','score',score,id)
    
    res.send(getInterviewById(id))
})

app.listen(PORT, () => {
   return console.log('Server in http://localhost:' + PORT);
});
