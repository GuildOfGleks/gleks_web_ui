import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  computed,
  inject,
  signal,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import {
  AccordionComponent,
  ButtonComponent,
  CheckboxComponent,
  DialogComponent,
  DialogService,
  GogAccordionContentDirective,
  GogAccordionItem,
  GogTagVariant,
  SliderComponent,
  SpinnerOverlayComponent,
  TagComponent,
  ToastContainerComponent,
  ToastService,
} from '@guildofgleks/ui';
import { ProductQuickviewDialogComponent } from './product-quickview-dialog.component';

type StockLevel = 'in-stock' | 'low-stock' | 'out-of-stock';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: StockLevel;
  description: string;
}

interface FilterSection extends GogAccordionItem {
  title: string;
}

const STOCK_LABELS: Record<StockLevel, string> = {
  'in-stock': 'In stock',
  'low-stock': 'Low stock',
  'out-of-stock': 'Out of stock',
};

const STOCK_VARIANTS: Record<StockLevel, GogTagVariant> = {
  'in-stock': 'success',
  'low-stock': 'warning',
  'out-of-stock': 'danger',
};

const PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Aurora Desk Lamp',
    category: 'home',
    price: 42,
    stock: 'in-stock',
    description: 'Warm-dimmable lamp with a walnut base.',
  },
  {
    id: 2,
    name: 'Trailblazer Jacket',
    category: 'apparel',
    price: 128,
    stock: 'low-stock',
    description: 'Weatherproof shell for three-season hikes.',
  },
  {
    id: 3,
    name: 'Nimbus Wireless Buds',
    category: 'electronics',
    price: 89,
    stock: 'in-stock',
    description: 'Active noise cancelling, 30h battery.',
  },
  {
    id: 4,
    name: 'Fieldnotes Journal',
    category: 'books',
    price: 18,
    stock: 'in-stock',
    description: 'Dot-grid pages, lays flat, pocket-sized.',
  },
  {
    id: 5,
    name: 'Summit Trekking Poles',
    category: 'apparel',
    price: 64,
    stock: 'out-of-stock',
    description: 'Carbon-fiber, collapsible to 15in.',
  },
  {
    id: 6,
    name: 'Orbit Smart Plug',
    category: 'electronics',
    price: 24,
    stock: 'in-stock',
    description: 'Schedule and monitor any outlet remotely.',
  },
  {
    id: 7,
    name: 'Terra Ceramic Mug',
    category: 'home',
    price: 16,
    stock: 'low-stock',
    description: 'Hand-thrown stoneware, holds heat well.',
  },
  {
    id: 8,
    name: 'Deep Work Field Guide',
    category: 'books',
    price: 22,
    stock: 'in-stock',
    description: 'A short book on protecting focus.',
  },
];

@Component({
  selector: 'app-catalog-page',
  imports: [
    AccordionComponent,
    ButtonComponent,
    CheckboxComponent,
    DecimalPipe,
    DialogComponent,
    GogAccordionContentDirective,
    SliderComponent,
    SpinnerOverlayComponent,
    TagComponent,
    ToastContainerComponent,
  ],
  templateUrl: './catalog-page.html',
  styleUrl: './catalog-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogPage implements OnDestroy {
  private readonly dialogService = inject(DialogService);
  private readonly toastService = inject(ToastService);

  protected readonly filterSections: FilterSection[] = [
    { id: 'category', title: 'Category' },
    { id: 'price', title: 'Max price' },
  ];

  protected readonly categories = ['apparel', 'electronics', 'home', 'books'];

  protected readonly pendingCategories = signal(new Set(this.categories));
  protected readonly pendingMaxPrice = signal(150);

  protected readonly appliedCategories = signal(new Set(this.categories));
  protected readonly appliedMaxPrice = signal(150);

  protected readonly loading = signal(false);
  private applyTimer: ReturnType<typeof setTimeout> | null = null;

  protected readonly filteredProducts = computed(() => {
    const categories = this.appliedCategories();
    const maxPrice = this.appliedMaxPrice();
    return PRODUCTS.filter(
      (product) => categories.has(product.category) && product.price <= maxPrice,
    );
  });

  protected stockLabel(stock: StockLevel): string {
    return STOCK_LABELS[stock];
  }

  protected stockVariant(stock: StockLevel): GogTagVariant {
    return STOCK_VARIANTS[stock];
  }

  protected isCategoryChecked(category: string): boolean {
    return this.pendingCategories().has(category);
  }

  protected toggleCategory(category: string): void {
    const next = new Set(this.pendingCategories());
    if (next.has(category)) {
      next.delete(category);
    } else {
      next.add(category);
    }
    this.pendingCategories.set(next);
  }

  protected applyFilters(): void {
    if (this.applyTimer) clearTimeout(this.applyTimer);

    this.loading.set(true);
    this.applyTimer = setTimeout(() => {
      this.appliedCategories.set(new Set(this.pendingCategories()));
      this.appliedMaxPrice.set(this.pendingMaxPrice());
      this.loading.set(false);
      this.applyTimer = null;
    }, 500);
  }

  protected quickView(product: Product): void {
    const ref = this.dialogService.open<'add-to-cart'>({
      title: product.name,
      component: ProductQuickviewDialogComponent,
      width: 'min(100%, 28rem)',
      data: {
        name: product.name,
        category: product.category,
        price: product.price,
        description: product.description,
        stock: product.stock,
        stockLabel: this.stockLabel(product.stock),
        stockVariant: this.stockVariant(product.stock),
      },
    });

    ref.afterClosed.then((result) => {
      if (result === 'add-to-cart') {
        this.toastService.success(`${product.name} added to cart`);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.applyTimer) {
      clearTimeout(this.applyTimer);
    }
  }
}
