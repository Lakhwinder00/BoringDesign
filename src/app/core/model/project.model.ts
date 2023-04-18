export class ProjectAnalysisScoreModel {
  data: any;
}

export class Project{
  id:string;
  userId:string
  projectName:string;
  constructor(id:string,userId:string,projectName:string){
    this.id=id;
    this.userId=userId;
    this.projectName=projectName;
  }
  
}
export class ProjectScore{
  id:string;
  projectId:string;
  projectScoreName:string;
  detail:number;
  volume:number;
  massing:number;
  totalScore:number;
  constructor(id:string,projectId:string,projectScoreName:string, detail:number, volume:number,massing:number,totalScore:number)
  {
    this.id=id;
    this.projectId=projectId;
    this.projectScoreName=projectScoreName;
    this.detail=detail;
    this.volume=volume;
    this.massing=massing;
    this.totalScore=totalScore;
  }
}