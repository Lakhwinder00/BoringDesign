import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  Project,
  ProjectAnalysisScoreModel,
  ProjectScore,
} from '../core/model/project.model';
import { httpOptions } from '../core/constants/httpHeaders';
import { BaseUrl } from '../core/constants/BaseUrl';
import { Observable, catchError, map, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  analysisScore: any = new ProjectAnalysisScoreModel();
  getResult: any = new ProjectAnalysisScoreModel();
  constructor(private http: HttpClient) {}
  public projectAnalysisScore(
    parameters: ProjectAnalysisScoreModel
  ): Observable<any> {
    var requestBody = JSON.stringify(parameters);
    return this.http
      .post(`${BaseUrl.url}api/ProjectAnalysis`, requestBody, httpOptions)
      .pipe(
        map(
          (response: any) => (this.analysisScore = response.score?.split('\n'))
        ),
        catchError((err) => {
          console.log(err);
          return of([err]);
        })
      );
  }
  setProjectScoreModel(model: ProjectAnalysisScoreModel) {
    this.getResult = model;
  }
  getProjectAnalysisScore() {
    return this.getResult;
  }

  // call this api save the project//
  public saveProject(model: Project): Observable<any> {
    var requestBody = JSON.stringify(model);
    return this.http.post(`${BaseUrl.url}api/SaveProject`, requestBody).pipe(
      map((response: any) => response),
      catchError((err) => {
        console.log(err);
        return of([err]);
      })
    );
  }
  // Call this use for update the project
  public updateProject(Project: Project) {
    var requestBody = JSON.stringify(Project);
    return this.http.put(`${BaseUrl.url}api/UpdateProject`, requestBody).pipe(
      map((response: any) => response),
      catchError((err) => {
        console.log(err);
        return of([err]);
      })
    );
  }
  // Call this API delete the project//
  public deleteProjectById(ProjectId: any): Observable<any> {
    return this.http
      .delete(`${BaseUrl.url}api/DeleteProject/${ProjectId}`)
      .pipe(
        map((response: any) => response),
        catchError((err) => {
          console.log(err);
          return of([err]);
        })
      );
  }
  //Call this API check for prjectName is exists in database
  public IsExistsProjectName(projectName: any): Observable<any> {
    var requestBody = JSON.stringify(projectName);
    return this.http.post(`${BaseUrl.url}api/ProjectExists`, requestBody).pipe(
      map((response: any) => response),
      catchError((err) => {
        console.log(err);
        return of([err]);
      })
    );
  }

  // Call this api for get the result of project//
  public getProjectList(UserId: any, Parameters: any): Observable<any> {
    return this.http
      .get(
        `${BaseUrl.url}api/GetProjectList/${UserId}/${Parameters.skip}/${Parameters.take}`
      )
      .pipe(
        map((response: any) => response),
        catchError((err) => {
          console.log(err);
          return of([err]);
        })
      );
  }
  // call this api save the project score//
  public saveProjectScore(model: ProjectScore): Observable<any> {
    var requestBody = JSON.stringify(model);
    return this.http
      .post(`${BaseUrl.url}api/SaveProjectScore`, requestBody)
      .pipe(
        map((response: any) => response),
        catchError((err) => {
          console.log(err);
          return of([err]);
        })
      );
  }
  // Call this use for update the projectScore
  public updateScoreProject(ProjectScore: ProjectScore) {
    var requestBody = JSON.stringify(ProjectScore);
    return this.http.put(`${BaseUrl.url}api/UpdateProjectScore`, requestBody).pipe(
      map((response: any) => response),
      catchError((err) => {
        console.log(err);
        return of([err]);
      })
    );
  }
  // Call this api for get the result of project score//
  public getProjectScoreList(
    ProjectId: number,
    Parameters: any
  ): Observable<any> {
    return this.http
      .get(
        `${BaseUrl.url}api/GetProjectScoreList/${ProjectId}/${Parameters.skip}/${Parameters.take}`
      )
      .pipe(
        map((response: any) => response),
        catchError((err) => {
          console.log(err);
          return of([err]);
        })
      );
  }

  // Call this api for get the result of project score by id//
  public getProjectScoreById(ProjectScoreId: number): Observable<any> {
    return this.http
      .get(`${BaseUrl.url}api/GetProjectScoreById/${ProjectScoreId}`)
      .pipe(
        map((response: any) => response),
        catchError((err) => {
          console.log(err);
          return of([err]);
        })
      );
  }
  // Call this API delete the project score by id//
  public deleteProjectScoreById(ProjectScoreId: any): Observable<any> {
    return this.http
      .delete(`${BaseUrl.url}api/DeleteProjectScore/${ProjectScoreId}`)
      .pipe(
        map((response: any) => response),
        catchError((err) => {
          console.log(err);
          return of([err]);
        })
      );
  }

  //Call this API check for prjectScoreName is exists in database
  public IsExistsProjectScoreName(projectName: any): Observable<any> {
    debugger
    var requestBody = JSON.stringify(projectName);
    return this.http
      .post(`${BaseUrl.url}api/ProjectExistsScore`, requestBody)
      .pipe(
        map((response: any) => response),
        catchError((err) => {
          console.log(err);
          return of([err]);
        })
      );
  }
}
