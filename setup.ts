import Database from 'better-sqlite3';
import { applicants, interviewers, interviews } from './initData';

const db = new Database('./data.db', {
   verbose: console.log,
});

db.exec(`
DROP TABLE IF EXISTS interviews;
DROP TABLE IF EXISTS interviewers;
DROP TABLE IF EXISTS applicants;
CREATE TABLE IF NOT EXISTS interviewers (
  id INTEGER,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS applicants (
  id INTEGER,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS interviews (
  id INTEGER,
  applicantId INTEGER NOT NULL,
  interviewerId INTEGER NOT NULL,
  date TEXT NOT NULL,
  score REAL NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (applicantId) REFERENCES applicants(id),
  FOREIGN KEY (interviewerId) REFERENCES interviewers(id)
);
`);

export const createApplicant = (name: string, email: string) =>
   db
      .prepare(`INSERT INTO applicants (name,email) VALUES (?,?);`)
      .run(name, email);

export const createInterviewer = (name: string, email: string) =>
   db
      .prepare(`INSERT INTO interviewers (name,email) VALUES (?,?);`)
      .run(name, email);

export const createInterview = (
   date: string,
   score: number,
   appId: number,
   intId: number
) =>
   db
      .prepare(
         `INSERT INTO interviews ( applicantId, interviewerId,date, score) VALUES (?,?,?,?);`
      )
      .run(appId, intId, date, score);

for (const { name, email } of applicants) {
   createApplicant(name, email);
}
for (const { name, email } of interviewers) {
   createInterviewer(name, email);
}
for (const { date, score, applicantId, interviewerId } of interviews) {
   createInterview(date, score, applicantId, interviewerId);
}

export const getApplicantById = (id: number) =>
   db.prepare(`SELECT * FROM applicants WHERE id=?`).get(id);

export const getInterviewsForApplicant = (id: number) =>
   db
      .prepare(
         `
SELECT interviewers.name as interviewerName, interviewers.email as interviewerEmail, interviewers.id as interviewerId,  interviews.date, interviews.score FROM interviewers
JOIN interviews ON interviewers.id = interviews.interviewerId
WHERE interviews.applicantId = ?;
`
      )
      .all(id);

export const getInterviewsForInterviewer = (id: number) =>
   db
      .prepare(
         `
SELECT applicants.name as applicantName, applicants.email as applicantEmail, applicants.id as applicantId,  interviews.date, interviews.score FROM applicants
JOIN interviews ON applicants.id = interviews.applicantId
WHERE interviews.interviewerId = ?;
`
      )
      .all(id);

export const getInterviewerById = (id: number) =>
   db.prepare(`SELECT * FROM interviewers WHERE id=?`).get(id);

   export const getInterviewById = (id: number) =>
   db.prepare(`SELECT * FROM interviews WHERE id=?`).get(id);

export const deleteRow=(table:string,id:number)=>db.prepare(`DELETE FROM ${table} WHERE id=?`).run(id)

export const updateRow=(table:string,column:string,value:string|number,id:number)=>db.prepare(`UPDATE ${table} SET ${column}=?
WHERE id=?;`).run(value,id)