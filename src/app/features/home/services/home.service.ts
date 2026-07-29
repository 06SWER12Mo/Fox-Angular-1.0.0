import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { HomePageData } from '../models/home.model';
import { ApiResponse } from '../../../core/models/common.model';

@Injectable({
  providedIn: 'root'
})
export class HomeService {
  private apiUrl = `${environment.apiUrl}/home`;

  constructor(private http: HttpClient) {}

  getHomePageData(): Observable<HomePageData> {
    return this.http.get<ApiResponse<HomePageData>>(this.apiUrl).pipe(
      map(response => response.data)
    );
  }
}
