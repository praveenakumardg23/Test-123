import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})


// Testing environment - Rashmika
export class AppConfiguration {
    public environment = import.meta.env.NG_APP_BUILD_ENV || 'Dev';  // Local , Dev , Beta1, Beta2 , Demo , Alpha3 , alpha5, Prod, Build_ENVIRONMENT_VALUE
    apiBaseUrl: string;
    defaultTokenValue: string;
    tokenValue: string;
    recoverPasswordConfirmationUrl: string;
    quikappsBaseUrl: string;
    activateAccountUrl: string;
    confirmation_url: string;
    postalcode_endpoint: string;
    postalcode_token: string;
    event_url: string;
    app_version: string;
    mmoUrl: string;
    mmoApiBaseUrl: string;
    constructor() {
        if (this.environment == 'Local') {

        }

        else if (this.environment == 'Dev') {
            this.apiBaseUrl = 'https://alpha4-api.payschools.com/';
            this.defaultTokenValue = 'IaMaSuperKey1!';
            this.tokenValue = 'IaMaSuperKey1!';
            this.recoverPasswordConfirmationUrl = 'https://dev.payschoolscentral.com/#/signup/activateaccount';
            this.quikappsBaseUrl = 'https://dev.payschoolscentral.com';
            this.confirmation_url = "https://dev.payschoolscentral.com/#/signup/activateaccount";
            this.postalcode_endpoint = "https://dev-velocity.i3verticals.com/v2/Public/postalcodes/";
            this.postalcode_token = "5d483d55b4f3fd432c55676eekVIhetQ0buAlqtccq59p";
            this.event_url = "https://www.payschoolsevents.com/events/home";
            this.app_version = "2024.01.04.PSCM2";
            this.mmoUrl = 'https://dev.mymealorder.com/login.aspx';
            this.mmoApiBaseUrl ='https://dev.mymealorder.com/';
        }

        else if (this.environment == 'Beta1') {
            this.apiBaseUrl = 'https://beta1-api.payschools.com/';
            this.defaultTokenValue = 'u6EbbC7YH8yWzWY7Xaf8defn';
            this.tokenValue = 'u6EbbC7YH8yWzWY7Xaf8defn';
            this.recoverPasswordConfirmationUrl = 'https://beta1-psc.payschools.com/#/signup/activateaccount';
            this.quikappsBaseUrl = 'https://beta1-psc.payschools.com';
            this.confirmation_url = "https://beta1-psc.payschools.com/#/signup/activateaccount";
            this.postalcode_endpoint = "https://dev-velocity.i3verticals.com/v2/Public/postalcodes/";
            this.postalcode_token = "5d483d55b4f3fd432c55676eekVIhetQ0buAlqtccq59p";
            this.event_url = "https://www.payschoolsevents.com/events/home";
            this.app_version = "2023.09.07.PSCM8";
            this.mmoUrl = 'https://dev.mymealorder.com/login.aspx';
            this.mmoApiBaseUrl ='https://dev.mymealorder.com/';
        }

        else if (this.environment == 'Beta2') {
            this.apiBaseUrl = 'https://beta2-api.payschools.com/';
            this.defaultTokenValue = 'u6EbbC7YH8yWzWY7Xaf8defn';
            this.tokenValue = 'u6EbbC7YH8yWzWY7Xaf8defn';
            this.recoverPasswordConfirmationUrl = 'https://beta2-psc.payschools.com/#/signup/activateaccount';
            this.quikappsBaseUrl = 'https://beta2-psc.payschools.com';
            this.confirmation_url = "https://beta2-psc.payschools.com/#/signup/activateaccount";
            this.postalcode_endpoint = "https://dev-velocity.i3verticals.com/v2/Public/postalcodes/";
            this.postalcode_token = "5d483d55b4f3fd432c55676eekVIhetQ0buAlqtccq59p";
            this.event_url = "https://www.payschoolsevents.com/events/home";
            this.app_version = "2020.06.12.B7";
            this.mmoUrl = 'https://dev.mymealorder.com/login.aspx';
            this.mmoApiBaseUrl ='https://dev.mymealorder.com/';
        }

        else if (this.environment == 'Demo') {
            this.apiBaseUrl = 'https://api-demo.payschoolscentral.com/';
            this.defaultTokenValue = 'Demo-Jjb1819VGKAjBj3';
            this.tokenValue = 'Demo-Jjb1819VGKAjBj3';
            this.recoverPasswordConfirmationUrl = 'https://demo.payschoolscentral.com/#/signup/activateaccount';
            this.quikappsBaseUrl = 'https://demo.payschoolscentral.com';
            this.confirmation_url = "https://demo.payschoolscentral.com/#/signup/activateaccount";
            this.postalcode_endpoint = "https://dev-velocity.i3verticals.com/v2/Public/postalcodes/";
            this.postalcode_token = "5d483d55b4f3fd432c55676eekVIhetQ0buAlqtccq59p";
            this.event_url = "https://www.payschoolsevents.com/events/home";
            this.app_version = "2024.02.02.PSCM14";
            this.mmoUrl = 'https://mymealorder.com/login.aspx';
            this.mmoApiBaseUrl = 'https://mymealorder.com/';
        }

        else if (this.environment == 'Alpha3') {
            this.apiBaseUrl = 'https://alpha3-api.payschools.com/';
            this.defaultTokenValue = 'NewCentralKey1';
            this.tokenValue = 'NewCentralKey1';
            // this.recoverPasswordConfirmationUrl = 'https://alpha3.payschoolscentral.com:1447/#/signup/activateaccount';
            this.confirmation_url = "https://alpha3.payschoolscentral.com/#/signup/activateaccount";
            this.recoverPasswordConfirmationUrl = 'https://alpha3.payschoolscentral.com/#/signup/activateaccount';
            this.quikappsBaseUrl = 'https://alpha3.payschoolscentral.com';
            this.event_url = "https://www.payschoolsevents.com/events/home";
            this.app_version = "2024.01.29.PS14";
            this.mmoUrl = 'https://dev.mymealorder.com/login.aspx';
            this.mmoApiBaseUrl ='https://dev.mymealorder.com/';
        }

        else if (this.environment == 'alpha5') {
            this.apiBaseUrl = 'https://alpha5-api.sdms2.com/';
            this.defaultTokenValue = 'NewCentralKey1';
            this.tokenValue = 'NewCentralKey1';
            this.recoverPasswordConfirmationUrl = 'https://alpha5.payschoolscentral.com:1447/#/signup/activateaccount';
            this.quikappsBaseUrl = 'https://alpha5.payschoolscentral.com:1447';
            this.app_version = "2020.08.06.B7";
            this.mmoUrl = 'https://dev.mymealorder.com/login.aspx';
            this.mmoApiBaseUrl ='https://dev.mymealorder.com/';
        }

        else if (this.environment == 'Prod') {
            this.apiBaseUrl = 'https://api.payschoolscentral.com/';
            this.defaultTokenValue = 'gRTpp5mvDLCazhw3RPuwATGj';
            this.tokenValue = 'gRTpp5mvDLCazhw3RPuwATGj';
            this.recoverPasswordConfirmationUrl = 'https://payschoolscentral.com/#/signup/activateaccount';
            this.quikappsBaseUrl = 'https://payschoolscentral.com';
            this.confirmation_url = "https://payschoolscentral.com/#/signup/activateaccount";
            this.postalcode_endpoint = "https://dev-velocity.i3verticals.com/v2/Public/postalcodes/";
            this.postalcode_token = "5d483d55b4f3fd432c55676eekVIhetQ0buAlqtccq59p";
            this.event_url = "https://www.payschoolsevents.com/events/home";
            this.app_version = "2024.01.16.PSCM14";
            this.mmoUrl = 'https://mymealorder.com/login.aspx';
            this.mmoApiBaseUrl = 'https://mymealorder.com/';
        }
    }
}