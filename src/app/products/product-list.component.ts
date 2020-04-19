import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

import { Observable, EMPTY, Subject, combineLatest } from 'rxjs';

import { Product } from './product';
import { ProductService } from './product.service';
import { catchError, filter, map, tap, startWith } from 'rxjs/operators';
import { ProductCategoryService } from '../product-categories/product-category.service';

@Component({
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
  //changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListComponent {
  pageTitle = 'Product List';
  errorMessage = '';

  private categorySubject = new Subject<number>();
  private categorySelectedAction$ = this.categorySubject.asObservable();

  products$ = combineLatest([this.productService.productsWithCategory$, this.categorySelectedAction$.pipe(startWith(0))]).pipe(
    tap((result) => console.log('combine streams result:', result)),
    map(([products, selectedCategoryId]) =>
      products.filter(product => selectedCategoryId ? product.categoryId === selectedCategoryId : true)),
    catchError(err => {
      this.errorMessage = err;
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
    // this.categorySelectedAction$.pipe(startWith(0), tap(value => console.log('initial value:' + value))); didn't work why ?
  }

  onAdd(): void {
    console.log('Not yet implemented');
  }

  onSelected(categoryId: string): void {
    console.log('selectedCategory Id:' + categoryId);
    this.categorySubject.next(+categoryId);
  }
}
