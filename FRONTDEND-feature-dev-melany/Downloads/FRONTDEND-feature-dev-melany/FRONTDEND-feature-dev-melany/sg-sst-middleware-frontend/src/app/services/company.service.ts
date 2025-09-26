import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private apiUrl = 'http://localhost:3000'; 

  constructor(private http: HttpClient) {}

  registerCompany(companyData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/companies/create`, companyData);
  }
}
