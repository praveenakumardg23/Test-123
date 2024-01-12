import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { AppConfiguration } from './../../app-configuration';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  baseUrl: string;
  mmobaseUrl: string;
  private postalcode_token: string;
  private postalcode_endpoint: string;
  constructor(
    private httpClient: HttpClient,
    private appConfiguration: AppConfiguration) {
    this.baseUrl = this.appConfiguration.apiBaseUrl;
    this.mmobaseUrl = this.appConfiguration.mmoApiBaseUrl;
    this.postalcode_token = this.appConfiguration.postalcode_token;
    this.postalcode_endpoint = this.appConfiguration.postalcode_endpoint;
  }

  /****** API POST METHOD *****/
  post(url: string, payload: {}) {
    let baseUrl;
    if (url == 'api/PSC/ValidateUser') {
      baseUrl = this.mmobaseUrl;
    } else {
      baseUrl = this.baseUrl;
    }
    return this.httpClient.post(baseUrl + url, payload, {
      observe: 'response'
    })
      .pipe(
        map(
          (response) => {
            return response;
          },
          (error) => {
            return error;
          }
        )
      );
  }

  /****** API POST METHOD *****/
  getPostalCodeDetails(payload) {
    return this.httpClient.get(this.postalcode_endpoint + payload, {
      observe: 'response'
    })
      .pipe(
        map(
          (response) => {
            return response;
          },
          (error) => {
            return error;
          }
        )
      );
  }
}
