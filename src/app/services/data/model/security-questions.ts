export interface SecurityQuestionsDetails {
  Questions: Questions[];

};

export interface SesurityQuestions {
  QuestionId: string;
  QuestionAnswer: string;
  
};
export interface SecurityAnswersDetails {
  SecurityAnswers: SecurityAnswers[];

};

export interface Questions {
  Question: Question[];
 
}
export interface Question {
 
  QuestionId: string;
  QuestionText: string;
  QuestionAnswer:  string;
}
export interface SecurityAnswers {
  Questions: Questions[];
}