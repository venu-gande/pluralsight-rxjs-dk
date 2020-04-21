import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, throwError, combineLatest, BehaviorSubject, Subject, merge } from 'rxjs';
import { catchError, tap, map, scan, shareReplay } from 'rxjs/operators';

import { Product } from './product';
import { Supplier } from '../suppliers/supplier';
import { SupplierService } from '../suppliers/supplier.service';
import { ProductCategoryService } from '../product-categories/product-category.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productsUrl = 'api/products';
  private suppliersUrl = this.supplierService.suppliersUrl;
  private productSelectionSubject = new BehaviorSubject<number>(0);
  productSelectedAction$ = this.productSelectionSubject.asObservable();

  products$: Observable<Product[]> = this.http.get<Product[]>(this.productsUrl).pipe(
    map(products => products.map(product =>
      ({
        ...product,
        price: product.price * 1.5,
        searchKey: [product.productName]
      }) as Product)),
    tap(data => console.log('Products: ', JSON.stringify(data))),
    catchError(this.handleError)
  );

  productsWithCategory$ = combineLatest([this.products$, this.categoryService.productCategories$]).pipe(
    map(([products, categories]) => products.map(product => ({
      ...product,
      category: categories.find(category => product.categoryId === category.id).name
    }) as Product)),
    shareReplay(1)
  );

  // selectedProduct$ = this.productsWithCategory$.pipe(
  //   map(products => products.find(product => product.id === 5))
  // );

  selectedProduct$ = combineLatest([this.productsWithCategory$, this.productSelectedAction$]).pipe(
    map(([products, selectedId]) => products.find(product => product.id === selectedId))
  );

  private productInsertedSubject = new Subject<Product>();
  productInsertedAction$ = this.productInsertedSubject.asObservable();

  productsWithAdd$ = merge(
    this.productsWithCategory$,
    this.productInsertedAction$
  ).pipe(
    tap((result) => console.log('prroduct with add updated', result)),
    scan((acc: Product[], value: Product) => [...acc, value])
  );

  constructor(private http: HttpClient,
    private categoryService: ProductCategoryService,
    private supplierService: SupplierService) { }


  private fakeProduct() {
    return {
      id: 42,
      productName: 'Another One',
      productCode: 'TBX-0042',
      description: 'Our new product',
      price: 8.9,
      categoryId: 3,
      category: 'Toolbox',
      quantityInStock: 30
    };
  }

  private handleError(err: any) {
    // in a real world app, we may send the server to some remote logging infrastructure
    // instead of just logging it to the console
    let errorMessage: string;
    if (err.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      errorMessage = `Backend returned code ${err.status}: ${err.body.error}`;
    }
    console.error(err);
    return throwError(errorMessage);
  }

  selectedProductChanged(productId: number) {
    this.productSelectionSubject.next(productId)
  }

  addProduct(product?: Product) {
    const newProduct = product ? product : this.fakeProduct();
    this.productInsertedSubject.next(newProduct);
  }

}
