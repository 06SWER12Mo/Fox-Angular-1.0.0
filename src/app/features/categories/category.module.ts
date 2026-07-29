import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { CategoryRoutingModule } from './category-routing.module';
import { SharedModule } from '../../shared/shared.module';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { CategoryNavComponent } from './components/category-nav/category-nav.component';
import { CategoryListComponent } from './components/category-list/category-list.component';

@NgModule({
  declarations: [
    CategoryNavComponent,
    CategoryListComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    CategoryRoutingModule,
    SharedModule,
    MatProgressSpinnerModule
  ],
  exports: [
    CategoryNavComponent
  ]
})
export class CategoryModule { }