import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

import { Observable, EMPTY, Subject, combineLatest, BehaviorSubject } from 'rxjs';

import { Product } from './product';
import { ProductService } from './product.service';
import { catchError, filter, map, tap, startWith } from 'rxjs/operators';
import { ProductCategoryService } from '../product-categories/product-category.service';

@Component({
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent {
  pageTitle = 'Product List';
  errorMessage = '';

  private categorySubject = new Subject<number>();
  private categorySelectedAction$ = this.categorySubject.asObservable();


  // ******As demonstrated in the course this works fine****
  /* products$ = combineLatest([this.productService.productsWithAdd$, this.categorySelectedAction$.pipe(startWith(0))]).pipe(
     tap((result) => console.log('combine streams resulted products:', result)),
     map(([products, selectedCategoryId]) =>
       products.filter(product => selectedCategoryId ? product.categoryId === selectedCategoryId : true)),
     catchError(err => {
       this.errorMessage = err;
       console.log('errormessage:' + err);
       return EMPTY;
     })
   );*/


  // But If I move the initialization from combineLatest to constructor it doesn't work. I dont see any products in the list
  products$ = combineLatest([this.productService.productsWithAdd$, this.categorySelectedAction$]).pipe(
    tap((result) => console.log('combine streams resulted products:', result)),
    map(([products, selectedCategoryId]) =>
      products.filter(product => selectedCategoryId ? product.categoryId === selectedCategoryId : true)),
    catchError(err => {
      this.errorMessage = err;
      console.log('errormessage:' + err);
      return EMPTY;
    })
  );

  categories$ = this.categoryService.productCategories$.pipe(
    catchError(err => {
      this.errorMessage = err;
      return EMPTY;
    })
  );

  constructor(private productService: ProductService, private categoryService: ProductCategoryService) {
    this.categorySelectedAction$.pipe(startWith(0), tap(value => console.log('initial value:' + value))); // didn't work why ?

    // this.categorySubject.next(1); // also didn't work
  }

  onAdd(): void {
    this.productService.addProduct();
  }

  onSelected(categoryId: string): void {
    console.log('selectedCategory Id:' + categoryId);
    this.categorySubject.next(+categoryId);
  }
}
