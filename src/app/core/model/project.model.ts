export class ProjectAnalysisScoreModel {
  data: any;
  imageData: any;
}
export class ProjectImageAnalysisModel {
  constructor(data: string, imageExtension: string) {
    this.data = data;
    this.imageExtension = imageExtension;
  }
  data: string;
  imageExtension: string;
}
export class Project {
  id: string;
  userId: string;
  projectName: string;
  constructor(id: string, userId: string, projectName: string) {
    this.id = id;
    this.userId = userId;
    this.projectName = projectName;
  }
}
export class ProjectScore {
  id: string;
  projectId: string;
  projectScoreName: string;
  detail: number;
  volume: number;
  massing: number;
  totalScore: number;
  taxture: boolean | null;
  colour: boolean | null;
  image: string;
  analysisImage:string;
  constructor(
    id: string,
    projectId: string,
    projectScoreName: string,
    detail: number,
    volume: number,
    massing: number,
    totalScore: number,
    taxture: boolean,
    colour: boolean,
    image: string,
    analysisImage:string
  ) {
    this.id = id;
    this.projectId = projectId;
    this.projectScoreName = projectScoreName;
    this.detail = detail;
    this.volume = volume;
    this.massing = massing;
    this.totalScore = totalScore;
    this.taxture = taxture;
    this.colour = colour;
    this.image = image;
    this.analysisImage=analysisImage;
  }
}
