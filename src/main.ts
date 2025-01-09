import { enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { FormsModule } from '@angular/forms';
//import { AppComponent } from './app/app.component';
//import { Routes } from '@angular/router';
import { provideRouter, Routes } from '@angular/router';
//import { AdminDashboardComponent } from './app/pages/admin-dashboard/admin-dashboard.component';
import { HttpClientModule, provideHttpClient, withFetch } from '@angular/common/http'; // Ajout de l'importation
import { importProvidersFrom } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommonModule } from '@angular/common';
import { routes } from './app/app.routes';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
//import { EmployeeCrudComponent } from './app/pages/employee-crud/employee-crud.component';


if (location.hostname !== 'localhost') {
  enableProdMode();
}


bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(withFetch()), // Ajout de withFetch() à provideHttpClient
    importProvidersFrom(FontAwesomeModule, FormsModule, CommonModule, HttpClientModule, BrowserModule, NgModule, NgForm, ReactiveFormsModule, // Ajoutez ReactiveFormsModule ici

    ) // Ajoutez ce module

  ],
}).catch(err => console.error(err));
